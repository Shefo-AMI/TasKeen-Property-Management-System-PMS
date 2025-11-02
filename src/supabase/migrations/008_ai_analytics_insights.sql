-- AI-Powered Analytics & Insights System
-- Predictive analytics, market data integration, and intelligent insights

-- Market Data Integration (Property Finder & Bayut.com)
CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source TEXT NOT NULL CHECK (data_source IN ('property_finder', 'bayut', 'dubizzle', 'manual')),
    property_type TEXT NOT NULL,
    location TEXT NOT NULL,
    area TEXT NOT NULL,
    bedrooms NUMERIC,
    bathrooms NUMERIC,
    square_feet NUMERIC,
    average_rent NUMERIC NOT NULL,
    min_rent NUMERIC,
    max_rent NUMERIC,
    sample_size INTEGER,
    data_date DATE NOT NULL,
    currency TEXT DEFAULT 'AED',
    market_trend TEXT CHECK (market_trend IN ('rising', 'stable', 'declining')),
    trend_percentage NUMERIC,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rent Price Optimization
CREATE TABLE IF NOT EXISTS rent_optimization_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    current_rent NUMERIC NOT NULL,
    recommended_rent NUMERIC NOT NULL,
    market_average_rent NUMERIC NOT NULL,
    variance_percentage NUMERIC NOT NULL,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    market_data_sources TEXT[],
    comparable_properties JSONB,
    factors_considered JSONB,
    recommendation_reason TEXT,
    potential_revenue_impact NUMERIC,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented')),
    implemented_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictive Maintenance Alerts
CREATE TABLE IF NOT EXISTS predictive_maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'failure_prediction', 'maintenance_due', 'performance_degradation',
        'cost_anomaly', 'pattern_detected', 'urgent_attention'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    predicted_failure_date DATE,
    confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 100),
    description TEXT NOT NULL,
    ai_analysis JSONB,
    historical_patterns JSONB,
    recommended_action TEXT,
    estimated_cost NUMERIC,
    cost_if_ignored NUMERIC,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'scheduled', 'resolved', 'false_positive')),
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Churn Prediction
CREATE TABLE IF NOT EXISTS tenant_churn_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
    churn_probability NUMERIC NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    factors JSONB NOT NULL,
    key_indicators TEXT[],
    recommended_actions TEXT[],
    estimated_impact NUMERIC,
    retention_strategies JSONB,
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'action_taken', 'churned', 'retained')),
    actual_outcome TEXT,
    outcome_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Occupancy Forecasting
CREATE TABLE IF NOT EXISTS occupancy_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    forecast_period TEXT NOT NULL CHECK (forecast_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    predicted_occupancy_rate NUMERIC NOT NULL CHECK (predicted_occupancy_rate >= 0 AND predicted_occupancy_rate <= 100),
    confidence_interval_low NUMERIC,
    confidence_interval_high NUMERIC,
    seasonal_factors JSONB,
    market_factors JSONB,
    historical_trends JSONB,
    external_factors TEXT[],
    predicted_revenue NUMERIC,
    predicted_vacancy_days INTEGER,
    model_accuracy NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Anomaly Detection
CREATE TABLE IF NOT EXISTS expense_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    anomaly_type TEXT NOT NULL CHECK (anomaly_type IN (
        'unusually_high', 'unusually_low', 'frequency_anomaly',
        'category_mismatch', 'duplicate_suspected', 'fraud_risk'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    expected_amount NUMERIC,
    actual_amount NUMERIC NOT NULL,
    variance_percentage NUMERIC,
    detection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ai_explanation TEXT,
    historical_comparison JSONB,
    similar_expenses JSONB,
    recommended_action TEXT,
    requires_review BOOLEAN DEFAULT TRUE,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_outcome TEXT CHECK (review_outcome IN ('legitimate', 'error', 'fraud', 'needs_investigation')),
    resolution_notes TEXT,
    status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'under_review', 'resolved', 'false_positive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment Performance Scoring
CREATE TABLE IF NOT EXISTS investment_performance_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,
    overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    roi_score NUMERIC CHECK (roi_score >= 0 AND roi_score <= 100),
    cash_flow_score NUMERIC CHECK (cash_flow_score >= 0 AND cash_flow_score <= 100),
    occupancy_score NUMERIC CHECK (occupancy_score >= 0 AND occupancy_score <= 100),
    appreciation_score NUMERIC CHECK (appreciation_score >= 0 AND appreciation_score <= 100),
    maintenance_efficiency_score NUMERIC CHECK (maintenance_efficiency_score >= 0 AND maintenance_efficiency_score <= 100),
    tenant_quality_score NUMERIC CHECK (tenant_quality_score >= 0 AND tenant_quality_score <= 100),
    market_position_score NUMERIC CHECK (market_position_score >= 0 AND market_position_score <= 100),
    financial_metrics JSONB NOT NULL,
    performance_trends JSONB,
    strengths TEXT[],
    weaknesses TEXT[],
    opportunities TEXT[],
    threats TEXT[],
    recommendations TEXT[],
    benchmark_comparison JSONB,
    grade TEXT CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Trend Analysis
CREATE TABLE IF NOT EXISTS market_trend_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    property_type TEXT NOT NULL,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    trend_direction TEXT NOT NULL CHECK (trend_direction IN ('strong_growth', 'growth', 'stable', 'decline', 'strong_decline')),
    price_trend_percentage NUMERIC,
    demand_level TEXT CHECK (demand_level IN ('very_high', 'high', 'moderate', 'low', 'very_low')),
    supply_level TEXT CHECK (supply_level IN ('very_high', 'high', 'moderate', 'low', 'very_low')),
    average_days_to_lease INTEGER,
    vacancy_rate NUMERIC,
    rent_growth_yoy NUMERIC,
    market_indicators JSONB,
    economic_factors JSONB,
    seasonal_patterns JSONB,
    predictions JSONB,
    investment_outlook TEXT,
    key_insights TEXT[],
    data_sources TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Risk Assessment
CREATE TABLE IF NOT EXISTS portfolio_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    overall_risk_score NUMERIC NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
    market_risk_score NUMERIC,
    financial_risk_score NUMERIC,
    operational_risk_score NUMERIC,
    tenant_risk_score NUMERIC,
    maintenance_risk_score NUMERIC,
    regulatory_risk_score NUMERIC,
    risk_factors JSONB NOT NULL,
    concentration_risks JSONB,
    mitigation_strategies JSONB,
    stress_test_results JSONB,
    recommendations TEXT[],
    action_items JSONB,
    next_review_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-Generated Financial Insights
CREATE TABLE IF NOT EXISTS ai_financial_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN (
        'cost_saving', 'revenue_opportunity', 'risk_alert',
        'efficiency_improvement', 'market_opportunity', 'trend_alert'
    )),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    ai_analysis JSONB,
    supporting_data JSONB,
    potential_impact NUMERIC,
    confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 100),
    recommended_actions TEXT[],
    estimated_effort TEXT CHECK (estimated_effort IN ('low', 'medium', 'high')),
    estimated_timeline TEXT,
    category TEXT,
    related_properties UUID[],
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'implemented', 'dismissed')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    implementation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom KPI Dashboard Configuration
CREATE TABLE IF NOT EXISTS custom_kpi_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    dashboard_name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    layout JSONB NOT NULL,
    kpi_widgets JSONB NOT NULL,
    filters JSONB,
    refresh_frequency TEXT CHECK (refresh_frequency IN ('real_time', 'hourly', 'daily', 'weekly')),
    shared_with TEXT[],
    created_by TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Benchmarks
CREATE TABLE IF NOT EXISTS market_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    property_type TEXT NOT NULL,
    benchmark_date DATE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    percentile_25 NUMERIC,
    percentile_50 NUMERIC,
    percentile_75 NUMERIC,
    percentile_90 NUMERIC,
    industry_average NUMERIC,
    top_performer_value NUMERIC,
    data_source TEXT,
    sample_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chatbot Conversations
CREATE TABLE IF NOT EXISTS ai_chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    user_id UUID,
    user_type TEXT CHECK (user_type IN ('tenant', 'owner', 'employee', 'guest')),
    session_id TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('user', 'bot')),
    message_text TEXT NOT NULL,
    intent TEXT,
    entities JSONB,
    confidence_score NUMERIC,
    response_time_ms INTEGER,
    was_helpful BOOLEAN,
    escalated_to_human BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Model Performance Tracking
CREATE TABLE IF NOT EXISTS ai_model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    dataset_size INTEGER,
    accuracy NUMERIC,
    precision_score NUMERIC,
    recall_score NUMERIC,
    f1_score NUMERIC,
    training_data_period DATERANGE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_data_location ON market_data(location, area, property_type);
CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(data_date);
CREATE INDEX IF NOT EXISTS idx_rent_optimization_property ON rent_optimization_analysis(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_optimization_status ON rent_optimization_analysis(status);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_property ON predictive_maintenance_alerts(property_id);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_severity ON predictive_maintenance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_tenant ON tenant_churn_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_risk ON tenant_churn_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_occupancy_forecasts_property ON occupancy_forecasts(property_id);
CREATE INDEX IF NOT EXISTS idx_occupancy_forecasts_date ON occupancy_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_expense_anomalies_expense ON expense_anomalies(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_anomalies_status ON expense_anomalies(status);
CREATE INDEX IF NOT EXISTS idx_investment_scores_property ON investment_performance_scores(property_id);
CREATE INDEX IF NOT EXISTS idx_investment_scores_date ON investment_performance_scores(score_date);
CREATE INDEX IF NOT EXISTS idx_market_trends_region ON market_trend_analysis(region, property_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_risk_company ON portfolio_risk_assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_company ON ai_financial_insights(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON ai_financial_insights(status);
CREATE INDEX IF NOT EXISTS idx_kpi_dashboards_company ON custom_kpi_dashboards(company_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_session ON ai_chatbot_conversations(session_id);

-- Enable RLS
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_optimization_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupancy_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_performance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trend_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_kpi_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public access to market data" ON market_data FOR SELECT USING (true);

CREATE POLICY "Company access to rent optimization" ON rent_optimization_analysis
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to predictive alerts" ON predictive_maintenance_alerts
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to churn predictions" ON tenant_churn_predictions
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to occupancy forecasts" ON occupancy_forecasts
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to expense anomalies" ON expense_anomalies
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to investment scores" ON investment_performance_scores
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Public access to market trends" ON market_trend_analysis FOR SELECT USING (true);

CREATE POLICY "Company access to portfolio risk" ON portfolio_risk_assessments
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to AI insights" ON ai_financial_insights
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to KPI dashboards" ON custom_kpi_dashboards
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Public access to market benchmarks" ON market_benchmarks FOR SELECT USING (true);

CREATE POLICY "Company access to chatbot conversations" ON ai_chatbot_conversations
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Public access to AI model performance" ON ai_model_performance FOR SELECT USING (true);

-- Function to fetch and update market data from Property Finder & Bayut
CREATE OR REPLACE FUNCTION update_market_data_for_property(
    p_property_id UUID,
    p_company_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    property_record RECORD;
    market_avg NUMERIC;
    result JSONB;
BEGIN
    -- Get property details
    SELECT * INTO property_record
    FROM properties
    WHERE id = p_property_id AND company_id = p_company_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Property not found');
    END IF;
    
    -- Get market average (simulated - would integrate with actual APIs)
    SELECT AVG(average_rent) INTO market_avg
    FROM market_data
    WHERE location = property_record.city
    AND property_type = property_record.property_type
    AND data_date >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Create optimization analysis
    INSERT INTO rent_optimization_analysis (
        company_id,
        property_id,
        unit_number,
        current_rent,
        recommended_rent,
        market_average_rent,
        variance_percentage,
        confidence_score,
        recommendation_reason
    ) VALUES (
        p_company_id,
        p_property_id,
        'N/A',
        property_record.monthly_rent,
        COALESCE(market_avg, property_record.monthly_rent),
        COALESCE(market_avg, property_record.monthly_rent),
        CASE 
            WHEN market_avg IS NOT NULL THEN 
                ((market_avg - property_record.monthly_rent) / property_record.monthly_rent * 100)
            ELSE 0
        END,
        85.0,
        'Based on recent market data from Property Finder and Bayut'
    );
    
    result := jsonb_build_object(
        'property_id', p_property_id,
        'current_rent', property_record.monthly_rent,
        'market_average', COALESCE(market_avg, property_record.monthly_rent),
        'updated', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to detect expense anomalies
CREATE OR REPLACE FUNCTION detect_expense_anomalies()
RETURNS void AS $$
DECLARE
    expense_record RECORD;
    avg_amount NUMERIC;
    std_dev NUMERIC;
    threshold NUMERIC;
BEGIN
    FOR expense_record IN 
        SELECT * FROM expenses 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND NOT EXISTS (
            SELECT 1 FROM expense_anomalies 
            WHERE expense_id = expenses.id
        )
    LOOP
        -- Calculate average and standard deviation for similar expenses
        SELECT 
            AVG(amount),
            STDDEV(amount)
        INTO avg_amount, std_dev
        FROM expenses
        WHERE category = expense_record.category
        AND company_id = expense_record.company_id
        AND created_at >= CURRENT_DATE - INTERVAL '90 days'
        AND id != expense_record.id;
        
        IF avg_amount IS NOT NULL AND std_dev IS NOT NULL THEN
            threshold := avg_amount + (2 * std_dev);
            
            -- Detect anomaly if expense is significantly higher
            IF expense_record.amount > threshold THEN
                INSERT INTO expense_anomalies (
                    company_id,
                    expense_id,
                    property_id,
                    anomaly_type,
                    severity,
                    expected_amount,
                    actual_amount,
                    variance_percentage,
                    ai_explanation
                ) VALUES (
                    expense_record.company_id,
                    expense_record.id,
                    expense_record.property_id,
                    'unusually_high',
                    CASE 
                        WHEN expense_record.amount > (avg_amount + 3 * std_dev) THEN 'critical'
                        WHEN expense_record.amount > threshold THEN 'high'
                        ELSE 'medium'
                    END,
                    avg_amount,
                    expense_record.amount,
                    ((expense_record.amount - avg_amount) / avg_amount * 100),
                    'This expense is significantly higher than historical averages for this category'
                );
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate tenant churn probability
CREATE OR REPLACE FUNCTION calculate_churn_probability(p_tenant_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    churn_score NUMERIC := 0;
    payment_history RECORD;
    lease_info RECORD;
    violation_count INTEGER;
BEGIN
    -- Get payment history
    SELECT 
        COUNT(*) FILTER (WHERE status = 'late' OR status = 'overdue') as late_payments,
        COUNT(*) as total_payments
    INTO payment_history
    FROM rent_collections
    WHERE tenant_id = p_tenant_id;
    
    -- Get lease info
    SELECT * INTO lease_info
    FROM leases
    WHERE tenant_id = p_tenant_id
    AND status = 'active'
    LIMIT 1;
    
    -- Get violation count
    SELECT COUNT(*) INTO violation_count
    FROM lease_violations
    WHERE tenant_id = p_tenant_id
    AND is_resolved = FALSE;
    
    -- Calculate churn score (0-100)
    IF payment_history.total_payments > 0 THEN
        churn_score := churn_score + (payment_history.late_payments::NUMERIC / payment_history.total_payments * 40);
    END IF;
    
    churn_score := churn_score + (violation_count * 15);
    
    -- Lease ending soon
    IF lease_info.end_date IS NOT NULL AND lease_info.end_date <= CURRENT_DATE + INTERVAL '90 days' THEN
        churn_score := churn_score + 20;
    END IF;
    
    RETURN LEAST(churn_score, 100);
END;
$$ LANGUAGE plpgsql;
