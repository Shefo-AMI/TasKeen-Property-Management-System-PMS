-- Virtual/Augmented Reality Features
-- 360° tours, AR furniture placement, virtual staging

-- Virtual Tours
CREATE TABLE IF NOT EXISTS virtual_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    tour_name TEXT NOT NULL,
    tour_type TEXT CHECK (tour_type IN ('360_photo', '360_video', '3d_model', 'video_walkthrough')),
    tour_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    hotspots JSONB DEFAULT '[]'::jsonb,
    floor_plan_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    average_view_duration_seconds INTEGER,
    conversion_rate NUMERIC,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AR Furniture Placements
CREATE TABLE IF NOT EXISTS ar_furniture_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    model_url TEXT NOT NULL,
    thumbnail_url TEXT,
    dimensions JSONB NOT NULL,
    style TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ar_staging_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    virtual_tour_id UUID REFERENCES virtual_tours(id) ON DELETE SET NULL,
    session_data JSONB NOT NULL,
    furniture_items JSONB NOT NULL,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3D Floor Plans
CREATE TABLE IF NOT EXISTS floor_plans_3d (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    floor_plan_url TEXT NOT NULL,
    model_3d_url TEXT,
    square_footage NUMERIC,
    room_count INTEGER,
    room_details JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Virtual Showing Sessions
CREATE TABLE IF NOT EXISTS virtual_showing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    virtual_tour_id UUID REFERENCES virtual_tours(id) ON DELETE SET NULL,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT,
    attendee_phone TEXT,
    scheduled_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    agent_name TEXT,
    session_recording_url TEXT,
    notes TEXT,
    interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')),
    follow_up_required BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tour Analytics
CREATE TABLE IF NOT EXISTS virtual_tour_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    virtual_tour_id UUID REFERENCES virtual_tours(id) ON DELETE CASCADE,
    viewer_id TEXT,
    view_date TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER,
    device_type TEXT,
    browser TEXT,
    location TEXT,
    hotspots_clicked JSONB,
    completed_tour BOOLEAN DEFAULT FALSE,
    lead_generated BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_virtual_tours_property ON virtual_tours(property_id);
CREATE INDEX idx_ar_staging_property ON ar_staging_sessions(property_id);
CREATE INDEX idx_floor_plans_3d_property ON floor_plans_3d(property_id);
CREATE INDEX idx_virtual_showings_property ON virtual_showing_sessions(property_id);
CREATE INDEX idx_tour_analytics_tour ON virtual_tour_analytics(virtual_tour_id);

-- Enable RLS
ALTER TABLE virtual_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_furniture_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_staging_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_showing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_tour_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON virtual_tours FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Public access" ON ar_furniture_catalog FOR SELECT USING (true);
CREATE POLICY "Company access" ON virtual_showing_sessions FOR ALL USING (company_id = current_setting('app.current_company_id', true));
