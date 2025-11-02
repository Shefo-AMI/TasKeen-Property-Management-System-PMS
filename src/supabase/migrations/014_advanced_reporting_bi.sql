-- Advanced Reporting & Business Intelligence System
-- 50+ pre-built reports, custom report builder, data visualization

-- Report Templates
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT,
    template_name TEXT NOT NULL,
    template_category TEXT NOT NULL CHECK (template_category IN (
        'financial', 'occupancy', 'maintenance', 'leasing', 'tenant',
        'owner', 'compliance', 'marketing', 'operations', 'custom'
    )),
    description TEXT,
    report_type TEXT CHECK (report_type IN ('summary', 'detailed', 'analytical', 'comparative', 'trend')),
    data_sources TEXT[] NOT NULL,
    sql_query TEXT,
    filters JSONB DEFAULT '[]'::jsonb,
    columns JSONB NOT NULL,
    grouping JSONB,
    sorting JSONB,
    calculations JSONB,
    chart_config JSONB,
    is_system_template BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Reports
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
    report_name TEXT NOT NULL,
    report_category TEXT NOT NULL,
    generated_date TIMESTAMPTZ DEFAULT NOW(),
    date_range_start DATE,
    date_range_end DATE,
    filters_applied JSONB,
    report_format TEXT CHECK (report_format IN ('pdf', 'excel', 'csv', 'html', 'json')),
    file_url TEXT,
    file_size BIGINT,
    row_count INTEGER,
    generated_by TEXT NOT NULL,
    generation_time_seconds NUMERIC,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_id UUID,
    recipients TEXT[],
    sent_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
    schedule_name TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
    time_of_day TIME DEFAULT '09:00:00',
    timezone TEXT DEFAULT 'Asia/Dubai',
    report_format TEXT[] DEFAULT ARRAY['pdf'],
    recipients TEXT[] NOT NULL,
    filters JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    total_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Dashboards
CREATE TABLE IF NOT EXISTS custom_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    dashboard_name TEXT NOT NULL,
    description TEXT,
    layout JSONB NOT NULL,
    widgets JSONB NOT NULL,
    filters JSONB,
    refresh_interval INTEGER DEFAULT 300,
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    shared_with TEXT[],
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    widget_name TEXT NOT NULL,
    widget_type TEXT NOT NULL CHECK (widget_type IN (
        'kpi_card', 'line_chart', 'bar_chart', 'pie_chart', 'donut_chart',
        'area_chart', 'scatter_chart', 'heatmap', 'table', 'gauge',
        'progress_bar', 'timeline', 'map', 'funnel', 'custom'
    )),
    data_source TEXT NOT NULL,
    query TEXT,
    configuration JSONB NOT NULL,
    refresh_interval INTEGER DEFAULT 300,
    cache_enabled BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Data Cache
CREATE TABLE IF NOT EXISTS report_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    company_id TEXT NOT NULL,
    data_type TEXT NOT NULL,
    cached_data JSONB NOT NULL,
    filters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ
);

-- Data Visualization Configs
CREATE TABLE IF NOT EXISTS data_visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    visualization_name TEXT NOT NULL,
    visualization_type TEXT NOT NULL,
    data_query TEXT NOT NULL,
    chart_config JSONB NOT NULL,
    filters JSONB,
    drill_down_config JSONB,
    is_interactive BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical Trend Analysis
CREATE TABLE IF NOT EXISTS historical_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_category TEXT NOT NULL,
    time_period TEXT NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    period_date DATE NOT NULL,
    metric_value NUMERIC NOT NULL,
    previous_period_value NUMERIC,
    change_amount NUMERIC,
    change_percentage NUMERIC,
    trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, metric_name, time_period, period_date)
);

-- Comparative Reports Config
CREATE TABLE IF NOT EXISTS comparative_report_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    config_name TEXT NOT NULL,
    comparison_type TEXT NOT NULL CHECK (comparison_type IN (
        'year_over_year', 'month_over_month', 'quarter_over_quarter',
        'property_comparison', 'portfolio_comparison', 'budget_vs_actual'
    )),
    base_period_start DATE NOT NULL,
    base_period_end DATE NOT NULL,
    comparison_period_start DATE NOT NULL,
    comparison_period_end DATE NOT NULL,
    metrics TEXT[] NOT NULL,
    properties UUID[],
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Export History
CREATE TABLE IF NOT EXISTS report_export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    report_id UUID REFERENCES generated_reports(id) ON DELETE CASCADE,
    export_format TEXT NOT NULL,
    exported_by TEXT NOT NULL,
    exported_at TIMESTAMPTZ DEFAULT NOW(),
    file_size BIGINT,
    download_url TEXT,
    ip_address INET
);

-- Mobile Report Access Log
CREATE TABLE IF NOT EXISTS mobile_report_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    report_id UUID REFERENCES generated_reports(id) ON DELETE CASCADE,
    user_id UUID,
    device_type TEXT,
    device_os TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER
);

-- API Integration Logs
CREATE TABLE IF NOT EXISTS api_integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    integration_type TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_report_templates_company ON report_templates(company_id);
CREATE INDEX idx_report_templates_category ON report_templates(template_category);
CREATE INDEX idx_generated_reports_company ON generated_reports(company_id);
CREATE INDEX idx_generated_reports_date ON generated_reports(generated_date);
CREATE INDEX idx_scheduled_reports_company ON scheduled_reports(company_id);
CREATE INDEX idx_scheduled_reports_next_run ON scheduled_reports(next_run_at) WHERE is_active = TRUE;
CREATE INDEX idx_custom_dashboards_company ON custom_dashboards(company_id);
CREATE INDEX idx_dashboard_widgets_company ON dashboard_widgets(company_id);
CREATE INDEX idx_report_cache_key ON report_data_cache(cache_key);
CREATE INDEX idx_report_cache_expires ON report_data_cache(expires_at);
CREATE INDEX idx_historical_trends_company ON historical_trends(company_id, metric_name, period_date);
CREATE INDEX idx_api_logs_company ON api_integration_logs(company_id, created_at);

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparative_report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_report_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_integration_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON report_templates FOR ALL USING (company_id = current_setting('app.current_company_id', true) OR company_id IS NULL);
CREATE POLICY "Company access" ON generated_reports FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON scheduled_reports FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON custom_dashboards FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON dashboard_widgets FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON report_data_cache FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON data_visualizations FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON historical_trends FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON comparative_report_configs FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON report_export_history FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON mobile_report_access_log FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON api_integration_logs FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM report_data_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to process scheduled reports
CREATE OR REPLACE FUNCTION process_scheduled_reports()
RETURNS void AS $$
DECLARE
    schedule_record RECORD;
BEGIN
    FOR schedule_record IN 
        SELECT * FROM scheduled_reports
        WHERE is_active = TRUE AND next_run_at <= NOW()
    LOOP
        -- Generate report (simplified)
        UPDATE scheduled_reports
        SET 
            last_run_at = NOW(),
            next_run_at = CASE frequency
                WHEN 'daily' THEN NOW() + INTERVAL '1 day'
                WHEN 'weekly' THEN NOW() + INTERVAL '7 days'
                WHEN 'monthly' THEN NOW() + INTERVAL '1 month'
                WHEN 'quarterly' THEN NOW() + INTERVAL '3 months'
                WHEN 'annual' THEN NOW() + INTERVAL '1 year'
            END,
            total_runs = total_runs + 1
        WHERE id = schedule_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
