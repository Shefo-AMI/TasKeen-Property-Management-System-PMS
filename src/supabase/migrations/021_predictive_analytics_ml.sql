-- Predictive Analytics & Machine Learning System
-- Advanced AI models for optimization and forecasting

-- ML Model Registry
CREATE TABLE IF NOT EXISTS ml_model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL UNIQUE,
    model_type TEXT NOT NULL CHECK (model_type IN (
        'regression', 'classification', 'clustering', 'time_series',
        'recommendation', 'anomaly_detection', 'nlp'
    )),
    model_purpose TEXT NOT NULL CHECK (model_purpose IN (
        'rent_optimization', 'tenant_lifetime_value', 'maintenance_forecasting',
        'renovation_roi', 'vacancy_prediction', 'market_trend', 'churn_prediction',
        'demand_forecasting', 'investment_scoring', 'competitor_analysis'
    )),
    algorithm TEXT NOT NULL,
    version TEXT NOT NULL,
    accuracy_score NUMERIC,
    precision_score NUMERIC,
    recall_score NUMERIC,
    f1_score NUMERIC,
    training_date TIMESTAMPTZ,
    last_retrained_at TIMESTAMPTZ,
    training_data_size INTEGER,
    feature_importance JSONB,
    hyperparameters JSONB,
    model_artifact_url TEXT,
    is_production BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic Rent Pricing
CREATE TABLE IF NOT EXISTS dynamic_rent_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    current_rent NUMERIC NOT NULL,
    recommended_rent NUMERIC NOT NULL,
    confidence_score NUMERIC NOT NULL,
    adjustment_percentage NUMERIC,
    market_factors JSONB NOT NULL,
    competitor_prices JSONB,
    demand_score NUMERIC,
    seasonality_factor NUMERIC,
    occupancy_impact NUMERIC,
    effective_date DATE,
    expires_at DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'applied', 'rejected')),
    approved_by TEXT,
    approved_date DATE,
    actual_rent_achieved NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Lifetime Value Predictions
CREATE TABLE IF NOT EXISTS tenant_lifetime_value_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    predicted_ltv NUMERIC NOT NULL,
    confidence_score NUMERIC NOT NULL,
    predicted_tenure_months INTEGER,
    predicted_total_revenue NUMERIC,
    churn_probability NUMERIC,
    payment_reliability_score NUMERIC,
    maintenance_cost_prediction NUMERIC,
    renewal_probability NUMERIC,
    factors JSONB NOT NULL,
    prediction_date DATE DEFAULT CURRENT_DATE,
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Cost Forecasting
CREATE TABLE IF NOT EXISTS maintenance_cost_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    forecast_period TEXT CHECK (forecast_period IN ('monthly', 'quarterly', 'annual')),
    forecast_start_date DATE NOT NULL,
    forecast_end_date DATE NOT NULL,
    predicted_total_cost NUMERIC NOT NULL,
    confidence_interval_lower NUMERIC,
    confidence_interval_upper NUMERIC,
    breakdown_by_category JSONB NOT NULL,
    seasonal_factors JSONB,
    historical_trend JSONB,
    risk_factors JSONB,
    actual_cost NUMERIC,
    variance NUMERIC,
    variance_percentage NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Renovation ROI Calculator
CREATE TABLE IF NOT EXISTS renovation_roi_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    renovation_type TEXT NOT NULL,
    estimated_cost NUMERIC NOT NULL,
    predicted_rent_increase NUMERIC NOT NULL,
    predicted_occupancy_improvement NUMERIC,
    predicted_roi_percentage NUMERIC NOT NULL,
    payback_period_months INTEGER,
    net_present_value NUMERIC,
    internal_rate_of_return NUMERIC,
    market_comparison JSONB,
    risk_assessment TEXT CHECK (risk_assessment IN ('low', 'medium', 'high')),
    recommendation TEXT,
    confidence_score NUMERIC,
    factors_considered JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vacancy Duration Predictions
CREATE TABLE IF NOT EXISTS vacancy_duration_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    predicted_days_vacant INTEGER NOT NULL,
    confidence_score NUMERIC NOT NULL,
    market_demand_score NUMERIC,
    pricing_competitiveness NUMERIC,
    property_condition_score NUMERIC,
    location_desirability NUMERIC,
    seasonal_factor NUMERIC,
    marketing_effectiveness NUMERIC,
    predicted_vacancy_cost NUMERIC,
    recommended_actions JSONB,
    actual_days_vacant INTEGER,
    prediction_accuracy NUMERIC,
    prediction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Trend Analysis
CREATE TABLE IF NOT EXISTS market_trend_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_area TEXT NOT NULL,
    property_type TEXT NOT NULL,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    trend_direction TEXT CHECK (trend_direction IN ('strong_growth', 'growth', 'stable', 'decline', 'strong_decline')),
    rent_trend_percentage NUMERIC,
    occupancy_trend_percentage NUMERIC,
    demand_index NUMERIC,
    supply_index NUMERIC,
    price_per_sqft_trend NUMERIC,
    days_on_market_trend NUMERIC,
    competitor_count INTEGER,
    new_construction_units INTEGER,
    economic_indicators JSONB,
    demographic_trends JSONB,
    forecast_next_quarter JSONB,
    forecast_next_year JSONB,
    confidence_score NUMERIC,
    data_sources JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitor Pricing Monitoring
CREATE TABLE IF NOT EXISTS competitor_pricing_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    competitor_address TEXT,
    competitor_property_type TEXT,
    distance_km NUMERIC,
    unit_type TEXT,
    competitor_rent NUMERIC NOT NULL,
    amenities JSONB,
    occupancy_rate NUMERIC,
    price_per_sqft NUMERIC,
    special_offers TEXT,
    data_source TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    price_change_from_last_week NUMERIC,
    price_competitiveness TEXT CHECK (price_competitiveness IN ('much_lower', 'lower', 'competitive', 'higher', 'much_higher')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demand Forecasting
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    market_area TEXT NOT NULL,
    property_type TEXT NOT NULL,
    forecast_period TEXT CHECK (forecast_period IN ('weekly', 'monthly', 'quarterly')),
    forecast_date DATE NOT NULL,
    predicted_demand_index NUMERIC NOT NULL,
    confidence_interval_lower NUMERIC,
    confidence_interval_upper NUMERIC,
    seasonal_component NUMERIC,
    trend_component NUMERIC,
    external_factors JSONB,
    events_impact JSONB,
    actual_demand_index NUMERIC,
    forecast_accuracy NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment Opportunity Scoring
CREATE TABLE IF NOT EXISTS investment_opportunity_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    opportunity_type TEXT CHECK (opportunity_type IN ('acquisition', 'renovation', 'expansion', 'portfolio_optimization')),
    overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    financial_score NUMERIC,
    market_score NUMERIC,
    location_score NUMERIC,
    risk_score NUMERIC,
    growth_potential_score NUMERIC,
    predicted_roi NUMERIC,
    predicted_cap_rate NUMERIC,
    predicted_cash_flow NUMERIC,
    risk_factors JSONB,
    opportunity_factors JSONB,
    recommendation TEXT CHECK (recommendation IN ('strong_buy', 'buy', 'hold', 'sell', 'strong_sell')),
    confidence_score NUMERIC,
    analysis_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML Model Performance Tracking
CREATE TABLE IF NOT EXISTS ml_model_performance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_model_registry(id) ON DELETE CASCADE,
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    predictions_made INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    accuracy NUMERIC,
    precision NUMERIC,
    recall NUMERIC,
    f1_score NUMERIC,
    mean_absolute_error NUMERIC,
    root_mean_squared_error NUMERIC,
    r_squared NUMERIC,
    drift_detected BOOLEAN DEFAULT FALSE,
    drift_score NUMERIC,
    requires_retraining BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Engineering Store
CREATE TABLE IF NOT EXISTS ml_feature_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    feature_name TEXT NOT NULL,
    feature_value NUMERIC,
    feature_value_text TEXT,
    feature_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, feature_name, feature_timestamp)
);

-- Create indexes
CREATE INDEX idx_dynamic_rent_pricing_property ON dynamic_rent_pricing(property_id);
CREATE INDEX idx_tenant_ltv_tenant ON tenant_lifetime_value_predictions(tenant_id);
CREATE INDEX idx_maintenance_forecasts_property ON maintenance_cost_forecasts(property_id);
CREATE INDEX idx_renovation_roi_property ON renovation_roi_predictions(property_id);
CREATE INDEX idx_vacancy_predictions_property ON vacancy_duration_predictions(property_id);
CREATE INDEX idx_market_trend_area ON market_trend_analysis(market_area, analysis_date);
CREATE INDEX idx_competitor_pricing_property ON competitor_pricing_monitoring(property_id);
CREATE INDEX idx_demand_forecasts_area ON demand_forecasts(market_area, forecast_date);
CREATE INDEX idx_investment_scores_property ON investment_opportunity_scores(property_id);
CREATE INDEX idx_ml_performance_model ON ml_model_performance_tracking(model_id);
CREATE INDEX idx_feature_store_entity ON ml_feature_store(entity_type, entity_id);

-- Enable RLS
ALTER TABLE ml_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_rent_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_lifetime_value_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_cost_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE renovation_roi_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancy_duration_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trend_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_pricing_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_opportunity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_performance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_feature_store ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public access" ON ml_model_registry FOR SELECT USING (true);
CREATE POLICY "Company access" ON dynamic_rent_pricing FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON tenant_lifetime_value_predictions FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON maintenance_cost_forecasts FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON renovation_roi_predictions FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON vacancy_duration_predictions FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Public access" ON market_trend_analysis FOR SELECT USING (true);
CREATE POLICY "Company access" ON competitor_pricing_monitoring FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON demand_forecasts FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON investment_opportunity_scores FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to calculate optimal rent price
CREATE OR REPLACE FUNCTION calculate_optimal_rent(
    p_property_id UUID,
    p_current_rent NUMERIC
)
RETURNS JSONB AS $$
DECLARE
    market_avg NUMERIC;
    occupancy_rate NUMERIC;
    optimal_rent NUMERIC;
    result JSONB;
BEGIN
    -- Simplified calculation (in production, use ML model)
    SELECT AVG(rent_amount) INTO market_avg
    FROM rent_collections
    WHERE property_id = p_property_id;
    
    SELECT (COUNT(*) FILTER (WHERE status = 'occupied')::NUMERIC / COUNT(*)) * 100
    INTO occupancy_rate
    FROM properties WHERE id = p_property_id;
    
    optimal_rent := CASE 
        WHEN occupancy_rate > 95 THEN p_current_rent * 1.05
        WHEN occupancy_rate < 80 THEN p_current_rent * 0.95
        ELSE p_current_rent
    END;
    
    result := jsonb_build_object(
        'current_rent', p_current_rent,
        'recommended_rent', optimal_rent,
        'market_average', market_avg,
        'occupancy_rate', occupancy_rate,
        'confidence_score', 0.85
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
