-- Advanced Search & Filters System
-- Fuzzy search, advanced filters, saved searches

-- Search Configuration
CREATE TABLE IF NOT EXISTS search_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    search_name TEXT NOT NULL,
    search_type TEXT NOT NULL CHECK (search_type IN (
        'properties', 'tenants', 'leases', 'maintenance', 'financial',
        'documents', 'vendors', 'reports', 'global'
    )),
    filters JSONB NOT NULL,
    sort_by TEXT,
    sort_order TEXT CHECK (sort_order IN ('asc', 'desc')),
    columns_visible TEXT[],
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Searches
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    user_id UUID,
    search_name TEXT NOT NULL,
    search_type TEXT NOT NULL,
    search_query TEXT,
    filters JSONB,
    result_count INTEGER,
    is_favorite BOOLEAN DEFAULT FALSE,
    last_executed_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    user_id UUID,
    search_type TEXT NOT NULL,
    search_query TEXT NOT NULL,
    filters_applied JSONB,
    result_count INTEGER,
    execution_time_ms INTEGER,
    searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick Filters
CREATE TABLE IF NOT EXISTS quick_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    filter_name TEXT NOT NULL,
    filter_type TEXT NOT NULL,
    filter_criteria JSONB NOT NULL,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Suggestions
CREATE TABLE IF NOT EXISTS search_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_text TEXT NOT NULL UNIQUE,
    suggestion_type TEXT,
    search_count INTEGER DEFAULT 0,
    last_searched_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Search Index (for full-text search)
CREATE TABLE IF NOT EXISTS global_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    searchable_content TEXT NOT NULL,
    metadata JSONB,
    search_vector tsvector,
    last_indexed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, entity_type, entity_id)
);

-- Create full-text search index
CREATE INDEX idx_global_search_vector ON global_search_index USING gin(search_vector);
CREATE INDEX idx_global_search_entity ON global_search_index(company_id, entity_type);
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_search_history_user ON search_history(user_id, searched_at);

-- Enable RLS
ALTER TABLE search_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_search_index ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON search_configurations FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON saved_searches FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON search_history FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON quick_filters FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Public access" ON search_suggestions FOR SELECT USING (true);
CREATE POLICY "Company access" ON global_search_index FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.searchable_content, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_vector
    BEFORE INSERT OR UPDATE ON global_search_index
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector();

-- Function for fuzzy search
CREATE OR REPLACE FUNCTION fuzzy_search(
    p_company_id TEXT,
    p_search_query TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    entity_type TEXT,
    entity_id UUID,
    title TEXT,
    description TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gsi.entity_type,
        gsi.entity_id,
        gsi.title,
        gsi.description,
        ts_rank(gsi.search_vector, plainto_tsquery('english', p_search_query)) AS relevance
    FROM global_search_index gsi
    WHERE gsi.company_id = p_company_id
    AND (p_entity_type IS NULL OR gsi.entity_type = p_entity_type)
    AND gsi.search_vector @@ plainto_tsquery('english', p_search_query)
    ORDER BY relevance DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
