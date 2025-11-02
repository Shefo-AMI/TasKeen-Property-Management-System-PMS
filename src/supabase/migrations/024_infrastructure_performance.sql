-- Infrastructure & Performance Optimizations
-- Caching, monitoring, performance tracking

-- Redis Cache Configuration
CREATE TABLE IF NOT EXISTS cache_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key_pattern TEXT NOT NULL UNIQUE,
    ttl_seconds INTEGER NOT NULL DEFAULT 300,
    cache_strategy TEXT CHECK (cache_strategy IN ('write_through', 'write_back', 'cache_aside')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'api_response_time', 'database_query_time', 'page_load_time',
        'cache_hit_rate', 'error_rate', 'throughput'
    )),
    endpoint TEXT,
    response_time_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID,
    metadata JSONB
);

-- System Health Monitoring
CREATE TABLE IF NOT EXISTS system_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_type TEXT NOT NULL,
    status TEXT CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query Performance Log
CREATE TABLE IF NOT EXISTS query_performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL,
    query_text TEXT,
    execution_time_ms INTEGER NOT NULL,
    rows_returned INTEGER,
    execution_plan JSONB,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- CDN Configuration
CREATE TABLE IF NOT EXISTS cdn_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    cdn_provider TEXT CHECK (cdn_provider IN ('cloudflare', 'aws_cloudfront', 'azure_cdn', 'custom')),
    domain TEXT NOT NULL,
    api_key_encrypted TEXT,
    cache_rules JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Queue Jobs
CREATE TABLE IF NOT EXISTS message_queue_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_for TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type, timestamp);
CREATE INDEX idx_system_health_checks_type ON system_health_checks(check_type, checked_at);
CREATE INDEX idx_query_performance_hash ON query_performance_log(query_hash);
CREATE INDEX idx_message_queue_status ON message_queue_jobs(status, scheduled_for);

-- Enable RLS
ALTER TABLE cache_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_performance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cdn_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only)
CREATE POLICY "Admin access" ON cache_configurations FOR ALL USING (true);
CREATE POLICY "Admin access" ON performance_metrics FOR ALL USING (true);
CREATE POLICY "Admin access" ON system_health_checks FOR ALL USING (true);
CREATE POLICY "Admin access" ON query_performance_log FOR ALL USING (true);
CREATE POLICY "Company access" ON cdn_configurations FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Admin access" ON message_queue_jobs FOR ALL USING (true);

-- Function to log slow queries
CREATE OR REPLACE FUNCTION log_slow_query()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.execution_time_ms > 1000 THEN
        INSERT INTO query_performance_log (query_hash, query_text, execution_time_ms, rows_returned)
        VALUES (md5(NEW.query_text), NEW.query_text, NEW.execution_time_ms, NEW.rows_returned);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
