-- Multi-Property Portfolio Management System
-- Unlimited properties, grouping, cross-property reporting, and white-label support

-- Property Groups/Portfolios
CREATE TABLE IF NOT EXISTS property_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    group_name TEXT NOT NULL,
    description TEXT,
    group_type TEXT CHECK (group_type IN ('region', 'property_type', 'owner', 'custom')),
    region TEXT,
    owner_id UUID,
    owner_name TEXT,
    color_code TEXT,
    icon TEXT,
    property_count INTEGER DEFAULT 0,
    total_units INTEGER DEFAULT 0,
    total_value NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Group Memberships
CREATE TABLE IF NOT EXISTS property_group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES property_groups(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    added_date DATE DEFAULT CURRENT_DATE,
    added_by TEXT,
    UNIQUE(group_id, property_id)
);

-- Portfolio Owners
CREATE TABLE IF NOT EXISTS portfolio_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_type TEXT CHECK (owner_type IN ('individual', 'company', 'trust', 'partnership')),
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'UAE',
    tax_id TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    iban TEXT,
    swift_code TEXT,
    payment_terms TEXT,
    distribution_frequency TEXT CHECK (distribution_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
    ownership_percentage NUMERIC DEFAULT 100,
    properties_owned INTEGER DEFAULT 0,
    total_investment NUMERIC DEFAULT 0,
    total_equity NUMERIC DEFAULT 0,
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'whatsapp')),
    documents JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Ownership Structure
CREATE TABLE IF NOT EXISTS property_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES portfolio_owners(id) ON DELETE CASCADE,
    ownership_percentage NUMERIC NOT NULL CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
    acquisition_date DATE NOT NULL,
    acquisition_price NUMERIC,
    current_value NUMERIC,
    equity_amount NUMERIC,
    loan_amount NUMERIC,
    ownership_type TEXT CHECK (ownership_type IN ('full', 'partial', 'joint', 'trust')),
    documents JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    UNIQUE(property_id, owner_id)
);

-- Asset Value Tracking
CREATE TABLE IF NOT EXISTS asset_value_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    valuation_date DATE NOT NULL,
    valuation_method TEXT CHECK (valuation_method IN ('market_comparison', 'income_approach', 'cost_approach', 'professional_appraisal', 'automated')),
    estimated_value NUMERIC NOT NULL,
    land_value NUMERIC,
    building_value NUMERIC,
    appreciation_rate NUMERIC,
    market_conditions TEXT,
    comparable_properties JSONB,
    valuation_source TEXT,
    appraiser_name TEXT,
    confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 100),
    notes TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROI Calculator Results
CREATE TABLE IF NOT EXISTS roi_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calculation_period TEXT NOT NULL CHECK (calculation_period IN ('monthly', 'quarterly', 'yearly', 'lifetime')),
    total_investment NUMERIC NOT NULL,
    total_income NUMERIC NOT NULL,
    total_expenses NUMERIC NOT NULL,
    net_income NUMERIC NOT NULL,
    roi_percentage NUMERIC NOT NULL,
    cash_on_cash_return NUMERIC,
    cap_rate NUMERIC,
    gross_yield NUMERIC,
    net_yield NUMERIC,
    appreciation_gain NUMERIC,
    total_return NUMERIC,
    annualized_return NUMERIC,
    break_even_date DATE,
    payback_period_months INTEGER,
    detailed_breakdown JSONB,
    assumptions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acquisition Pipeline
CREATE TABLE IF NOT EXISTS acquisition_pipeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_name TEXT NOT NULL,
    property_address TEXT NOT NULL,
    property_type TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN (
        'lead', 'initial_review', 'site_visit', 'due_diligence',
        'offer_made', 'negotiation', 'under_contract', 'closing', 
        'completed', 'lost'
    )),
    asking_price NUMERIC,
    offered_price NUMERIC,
    estimated_value NUMERIC,
    expected_roi NUMERIC,
    financing_type TEXT CHECK (financing_type IN ('cash', 'mortgage', 'mixed', 'partnership')),
    down_payment NUMERIC,
    loan_amount NUMERIC,
    interest_rate NUMERIC,
    seller_name TEXT,
    seller_contact TEXT,
    listing_agent TEXT,
    agent_contact TEXT,
    expected_closing_date DATE,
    probability_percentage NUMERIC CHECK (probability_percentage >= 0 AND probability_percentage <= 100),
    key_features TEXT[],
    risks TEXT[],
    opportunities TEXT[],
    due_diligence_items JSONB,
    documents JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    assigned_to TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Performance Scorecards
CREATE TABLE IF NOT EXISTS property_performance_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    scorecard_date DATE NOT NULL DEFAULT CURRENT_DATE,
    overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    financial_performance_score NUMERIC,
    operational_efficiency_score NUMERIC,
    tenant_satisfaction_score NUMERIC,
    maintenance_quality_score NUMERIC,
    market_competitiveness_score NUMERIC,
    occupancy_rate NUMERIC,
    average_lease_duration_months NUMERIC,
    tenant_turnover_rate NUMERIC,
    maintenance_cost_per_unit NUMERIC,
    revenue_per_unit NUMERIC,
    noi_margin NUMERIC,
    key_metrics JSONB NOT NULL,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    action_items JSONB,
    comparison_to_portfolio JSONB,
    comparison_to_market JSONB,
    grade TEXT CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regional Market Analysis
CREATE TABLE IF NOT EXISTS regional_market_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    property_count INTEGER,
    total_units INTEGER,
    average_occupancy_rate NUMERIC,
    average_rent_per_sqft NUMERIC,
    vacancy_rate NUMERIC,
    absorption_rate NUMERIC,
    new_construction_units INTEGER,
    population_growth_rate NUMERIC,
    employment_rate NUMERIC,
    median_income NUMERIC,
    crime_rate NUMERIC,
    school_rating NUMERIC,
    transportation_score NUMERIC,
    amenities_score NUMERIC,
    market_health_score NUMERIC CHECK (market_health_score >= 0 AND market_health_score <= 100),
    investment_attractiveness TEXT CHECK (investment_attractiveness IN ('very_high', 'high', 'moderate', 'low', 'very_low')),
    growth_potential TEXT CHECK (growth_potential IN ('very_high', 'high', 'moderate', 'low', 'very_low')),
    key_insights TEXT[],
    opportunities TEXT[],
    challenges TEXT[],
    data_sources TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capital Improvements Tracking
CREATE TABLE IF NOT EXISTS capital_improvements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    improvement_type TEXT NOT NULL CHECK (improvement_type IN (
        'renovation', 'addition', 'system_upgrade', 'landscaping',
        'structural', 'energy_efficiency', 'amenity_addition', 'other'
    )),
    project_name TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date DATE,
    completion_date DATE,
    estimated_cost NUMERIC NOT NULL,
    actual_cost NUMERIC,
    budget_variance NUMERIC,
    financing_method TEXT CHECK (financing_method IN ('cash', 'loan', 'owner_equity', 'mixed')),
    expected_value_increase NUMERIC,
    expected_roi NUMERIC,
    actual_value_increase NUMERIC,
    actual_roi NUMERIC,
    contractor_name TEXT,
    contractor_contact TEXT,
    permits_required BOOLEAN DEFAULT FALSE,
    permits_obtained BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN (
        'planned', 'approved', 'in_progress', 'completed', 'on_hold', 'cancelled'
    )),
    progress_percentage NUMERIC DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    milestones JSONB,
    documents JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- White-Label Configuration
CREATE TABLE IF NOT EXISTS white_label_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    primary_color TEXT DEFAULT '#8B5CF6',
    secondary_color TEXT DEFAULT '#10B981',
    accent_color TEXT DEFAULT '#F59E0B',
    custom_domain TEXT,
    email_from_name TEXT,
    email_from_address TEXT,
    support_email TEXT,
    support_phone TEXT,
    website_url TEXT,
    terms_url TEXT,
    privacy_url TEXT,
    custom_css TEXT,
    custom_header_html TEXT,
    custom_footer_html TEXT,
    features_enabled JSONB DEFAULT '{}'::jsonb,
    branding_settings JSONB DEFAULT '{}'::jsonb,
    email_templates JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio-Level Financial Dashboard Data
CREATE TABLE IF NOT EXISTS portfolio_financial_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_properties INTEGER NOT NULL,
    total_units INTEGER NOT NULL,
    occupied_units INTEGER NOT NULL,
    vacant_units INTEGER NOT NULL,
    overall_occupancy_rate NUMERIC,
    total_monthly_rent NUMERIC NOT NULL,
    total_annual_income NUMERIC NOT NULL,
    total_annual_expenses NUMERIC NOT NULL,
    net_operating_income NUMERIC NOT NULL,
    total_portfolio_value NUMERIC NOT NULL,
    total_equity NUMERIC NOT NULL,
    total_debt NUMERIC NOT NULL,
    average_roi NUMERIC,
    average_cap_rate NUMERIC,
    cash_flow NUMERIC,
    properties_by_type JSONB,
    properties_by_region JSONB,
    top_performing_properties JSONB,
    underperforming_properties JSONB,
    key_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bulk Operations Log
CREATE TABLE IF NOT EXISTS bulk_operations_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    operation_type TEXT NOT NULL CHECK (operation_type IN (
        'rent_increase', 'announcement', 'lease_renewal', 
        'document_send', 'payment_reminder', 'status_update', 'other'
    )),
    target_type TEXT NOT NULL CHECK (target_type IN ('properties', 'tenants', 'leases', 'units')),
    target_count INTEGER NOT NULL,
    target_ids UUID[],
    operation_details JSONB NOT NULL,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    results JSONB,
    executed_by TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'partial'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_groups_company ON property_groups(company_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON property_group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_property ON property_group_memberships(property_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_owners_company ON portfolio_owners(company_id);
CREATE INDEX IF NOT EXISTS idx_property_ownership_property ON property_ownership(property_id);
CREATE INDEX IF NOT EXISTS idx_property_ownership_owner ON property_ownership(owner_id);
CREATE INDEX IF NOT EXISTS idx_asset_value_property ON asset_value_history(property_id);
CREATE INDEX IF NOT EXISTS idx_asset_value_date ON asset_value_history(valuation_date);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_property ON roi_calculations(property_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_pipeline_company ON acquisition_pipeline(company_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_pipeline_stage ON acquisition_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_performance_scorecards_property ON property_performance_scorecards(property_id);
CREATE INDEX IF NOT EXISTS idx_regional_analysis_region ON regional_market_analysis(region);
CREATE INDEX IF NOT EXISTS idx_capital_improvements_property ON capital_improvements(property_id);
CREATE INDEX IF NOT EXISTS idx_capital_improvements_status ON capital_improvements(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_company ON portfolio_financial_snapshots(company_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_financial_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_company ON bulk_operations_log(company_id);

-- Enable RLS
ALTER TABLE property_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_value_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_performance_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access to property groups" ON property_groups
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to group memberships" ON property_group_memberships
    FOR ALL USING (EXISTS (
        SELECT 1 FROM property_groups WHERE property_groups.id = property_group_memberships.group_id 
        AND property_groups.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to portfolio owners" ON portfolio_owners
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to property ownership" ON property_ownership
    FOR ALL USING (EXISTS (
        SELECT 1 FROM properties WHERE properties.id = property_ownership.property_id 
        AND properties.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to asset value history" ON asset_value_history
    FOR ALL USING (EXISTS (
        SELECT 1 FROM properties WHERE properties.id = asset_value_history.property_id 
        AND properties.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to ROI calculations" ON roi_calculations
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to acquisition pipeline" ON acquisition_pipeline
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to performance scorecards" ON property_performance_scorecards
    FOR ALL USING (EXISTS (
        SELECT 1 FROM properties WHERE properties.id = property_performance_scorecards.property_id 
        AND properties.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Public access to regional analysis" ON regional_market_analysis FOR SELECT USING (true);

CREATE POLICY "Company access to capital improvements" ON capital_improvements
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to white label config" ON white_label_configurations
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to portfolio snapshots" ON portfolio_financial_snapshots
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to bulk operations" ON bulk_operations_log
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to update property group statistics
CREATE OR REPLACE FUNCTION update_property_group_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE property_groups
    SET 
        property_count = (
            SELECT COUNT(*) 
            FROM property_group_memberships 
            WHERE group_id = NEW.group_id
        ),
        total_units = (
            SELECT COALESCE(SUM(p.units), 0)
            FROM property_group_memberships pgm
            JOIN properties p ON p.id = pgm.property_id
            WHERE pgm.group_id = NEW.group_id
        ),
        updated_at = NOW()
    WHERE id = NEW.group_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_stats
    AFTER INSERT OR DELETE ON property_group_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_property_group_stats();

-- Function to calculate portfolio-level ROI
CREATE OR REPLACE FUNCTION calculate_portfolio_roi(p_company_id TEXT, p_period TEXT)
RETURNS JSONB AS $$
DECLARE
    total_investment NUMERIC;
    total_income NUMERIC;
    total_expenses NUMERIC;
    net_income NUMERIC;
    roi_percentage NUMERIC;
    result JSONB;
BEGIN
    -- Calculate totals
    SELECT 
        COALESCE(SUM(acquisition_price), 0),
        COALESCE(SUM(current_value), 0)
    INTO total_investment, total_income
    FROM property_ownership po
    JOIN properties p ON p.id = po.property_id
    WHERE p.company_id = p_company_id;
    
    -- Get income and expenses
    SELECT 
        COALESCE(SUM(amount_paid), 0)
    INTO total_income
    FROM rent_collections
    WHERE company_id = p_company_id
    AND status = 'paid';
    
    SELECT 
        COALESCE(SUM(amount), 0)
    INTO total_expenses
    FROM expenses
    WHERE company_id = p_company_id
    AND status = 'paid';
    
    net_income := total_income - total_expenses;
    
    IF total_investment > 0 THEN
        roi_percentage := (net_income / total_investment) * 100;
    ELSE
        roi_percentage := 0;
    END IF;
    
    result := jsonb_build_object(
        'total_investment', total_investment,
        'total_income', total_income,
        'total_expenses', total_expenses,
        'net_income', net_income,
        'roi_percentage', roi_percentage,
        'calculation_date', CURRENT_DATE
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate portfolio snapshot
CREATE OR REPLACE FUNCTION generate_portfolio_snapshot(p_company_id TEXT)
RETURNS UUID AS $$
DECLARE
    snapshot_id UUID;
    property_count INTEGER;
    total_units INTEGER;
    occupied_units INTEGER;
BEGIN
    -- Get property statistics
    SELECT COUNT(*), COALESCE(SUM(units), 0)
    INTO property_count, total_units
    FROM properties
    WHERE company_id = p_company_id
    AND status = 'active';
    
    -- Calculate occupied units (simplified)
    SELECT COUNT(DISTINCT property_id)
    INTO occupied_units
    FROM tenants
    WHERE company_id = p_company_id
    AND status = 'active';
    
    -- Insert snapshot
    INSERT INTO portfolio_financial_snapshots (
        company_id,
        total_properties,
        total_units,
        occupied_units,
        vacant_units,
        overall_occupancy_rate,
        total_monthly_rent,
        total_annual_income,
        total_annual_expenses,
        net_operating_income,
        total_portfolio_value
    )
    SELECT 
        p_company_id,
        property_count,
        total_units,
        occupied_units,
        total_units - occupied_units,
        CASE WHEN total_units > 0 THEN (occupied_units::NUMERIC / total_units * 100) ELSE 0 END,
        COALESCE(SUM(p.monthly_rent), 0),
        COALESCE(SUM(p.monthly_rent * 12), 0),
        0, -- Would calculate from expenses
        COALESCE(SUM(p.monthly_rent * 12), 0),
        COALESCE(SUM(p.monthly_rent * 12 * 15), 0) -- Rough estimate
    FROM properties p
    WHERE p.company_id = p_company_id
    AND p.status = 'active'
    RETURNING id INTO snapshot_id;
    
    RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;
