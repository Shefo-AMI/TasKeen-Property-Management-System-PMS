-- Procurement & Vendor Management System
-- RFP/RFQ, purchase orders, vendor performance, spend analytics

-- Enhanced Vendor Database (extends existing vendors table)
CREATE TABLE IF NOT EXISTS vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES vendor_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    certification_type TEXT NOT NULL,
    certification_number TEXT,
    issuing_authority TEXT,
    issue_date DATE,
    expiry_date DATE,
    document_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    verified_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_insurance_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    insurance_type TEXT NOT NULL CHECK (insurance_type IN (
        'general_liability', 'workers_compensation', 'professional_liability',
        'commercial_auto', 'umbrella', 'bonding'
    )),
    policy_number TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    coverage_amount NUMERIC NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    certificate_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    verified_date DATE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending_renewal')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_w9_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    tax_id TEXT NOT NULL,
    tax_classification TEXT,
    document_url TEXT NOT NULL,
    submission_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    verified_date DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFP/RFQ Management
CREATE TABLE IF NOT EXISTS rfp_rfq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    request_number TEXT NOT NULL UNIQUE,
    request_type TEXT NOT NULL CHECK (request_type IN ('rfp', 'rfq', 'rfi')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    budget_range_min NUMERIC,
    budget_range_max NUMERIC,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    submission_deadline TIMESTAMPTZ NOT NULL,
    evaluation_criteria JSONB NOT NULL,
    requirements JSONB NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    invited_vendors UUID[],
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'published', 'submissions_open', 'under_review', 
        'awarded', 'cancelled'
    )),
    awarded_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    awarded_amount NUMERIC,
    award_date DATE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFP/RFQ Responses
CREATE TABLE IF NOT EXISTS rfp_rfq_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_rfq_id UUID REFERENCES rfp_rfq(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    proposed_amount NUMERIC NOT NULL,
    proposed_timeline TEXT,
    response_document_url TEXT,
    technical_proposal JSONB,
    financial_proposal JSONB,
    evaluation_score NUMERIC,
    evaluator_notes TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'shortlisted', 'rejected', 'awarded'
    )),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    po_number TEXT NOT NULL UNIQUE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE RESTRICT,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    rfp_rfq_id UUID REFERENCES rfp_rfq(id) ON DELETE SET NULL,
    po_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    payment_terms TEXT,
    shipping_address TEXT,
    billing_address TEXT,
    subtotal NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    shipping_cost NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'AED',
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_approval', 'approved', 'sent_to_vendor',
        'acknowledged', 'partially_received', 'received', 'cancelled'
    )),
    approved_by TEXT,
    approved_date DATE,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Order Line Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_description TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_of_measure TEXT,
    unit_price NUMERIC NOT NULL,
    line_total NUMERIC NOT NULL,
    tax_rate NUMERIC DEFAULT 5.0,
    delivery_date DATE,
    quantity_received NUMERIC DEFAULT 0,
    quantity_pending NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Contracts
CREATE TABLE IF NOT EXISTS vendor_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    contract_number TEXT NOT NULL UNIQUE,
    contract_type TEXT CHECK (contract_type IN (
        'master_service', 'project_based', 'retainer', 'volume_discount', 'other'
    )),
    contract_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_notice_days INTEGER DEFAULT 60,
    contract_value NUMERIC,
    payment_terms TEXT,
    service_level_agreement JSONB,
    terms_and_conditions TEXT,
    contract_document_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN (
        'draft', 'pending_approval', 'active', 'expired', 'terminated', 'renewed'
    )),
    approved_by TEXT,
    approved_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Performance Scorecards
CREATE TABLE IF NOT EXISTS vendor_performance_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    overall_score NUMERIC CHECK (overall_score >= 0 AND overall_score <= 100),
    quality_score NUMERIC,
    timeliness_score NUMERIC,
    communication_score NUMERIC,
    pricing_score NUMERIC,
    compliance_score NUMERIC,
    total_jobs_completed INTEGER DEFAULT 0,
    on_time_completion_rate NUMERIC,
    average_response_time_hours NUMERIC,
    customer_satisfaction_rating NUMERIC,
    issues_reported INTEGER DEFAULT 0,
    performance_notes TEXT,
    recommendations TEXT,
    evaluator_name TEXT,
    evaluation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preferred Vendor Lists
CREATE TABLE IF NOT EXISTS preferred_vendor_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    list_name TEXT NOT NULL,
    category TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    tier TEXT CHECK (tier IN ('platinum', 'gold', 'silver', 'standard')),
    discount_percentage NUMERIC,
    priority_level INTEGER,
    special_terms TEXT,
    added_date DATE DEFAULT CURRENT_DATE,
    added_by TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Portal Access
CREATE TABLE IF NOT EXISTS vendor_portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL UNIQUE,
    user_name TEXT NOT NULL,
    user_role TEXT CHECK (user_role IN ('admin', 'billing', 'operations', 'viewer')),
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spend Analytics
CREATE TABLE IF NOT EXISTS spend_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    period_date DATE NOT NULL,
    category TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    total_spend NUMERIC NOT NULL DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    average_transaction_value NUMERIC,
    budget_allocated NUMERIC,
    budget_variance NUMERIC,
    year_over_year_change NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, period_type, period_date, category, vendor_id)
);

-- Volume Discount Tracking
CREATE TABLE IF NOT EXISTS volume_discount_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES vendor_contracts(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    minimum_volume NUMERIC NOT NULL,
    maximum_volume NUMERIC,
    discount_percentage NUMERIC NOT NULL,
    discount_amount NUMERIC,
    tier_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volume_discount_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    current_volume NUMERIC DEFAULT 0,
    current_tier_id UUID REFERENCES volume_discount_tiers(id) ON DELETE SET NULL,
    current_discount_rate NUMERIC,
    next_tier_id UUID REFERENCES volume_discount_tiers(id) ON DELETE SET NULL,
    volume_to_next_tier NUMERIC,
    total_savings NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_vendor_categories_company ON vendor_categories(company_id);
CREATE INDEX idx_vendor_certifications_vendor ON vendor_certifications(vendor_id);
CREATE INDEX idx_vendor_insurance_vendor ON vendor_insurance_verification(vendor_id);
CREATE INDEX idx_vendor_insurance_expiry ON vendor_insurance_verification(expiry_date);
CREATE INDEX idx_rfp_rfq_company ON rfp_rfq(company_id);
CREATE INDEX idx_rfp_rfq_status ON rfp_rfq(status);
CREATE INDEX idx_rfp_responses_rfp ON rfp_rfq_responses(rfp_rfq_id);
CREATE INDEX idx_purchase_orders_company ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);
CREATE INDEX idx_vendor_contracts_company ON vendor_contracts(company_id);
CREATE INDEX idx_vendor_contracts_vendor ON vendor_contracts(vendor_id);
CREATE INDEX idx_vendor_scorecards_vendor ON vendor_performance_scorecards(vendor_id);
CREATE INDEX idx_preferred_vendors_company ON preferred_vendor_lists(company_id);
CREATE INDEX idx_spend_analytics_company ON spend_analytics(company_id, period_date);

-- Enable RLS
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_insurance_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_w9_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_rfq ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_rfq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferred_vendor_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spend_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_discount_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_discount_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON vendor_categories FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON rfp_rfq FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON purchase_orders FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON vendor_contracts FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON vendor_performance_scorecards FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON preferred_vendor_lists FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON spend_analytics FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON volume_discount_tracking FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to calculate vendor performance score
CREATE OR REPLACE FUNCTION calculate_vendor_performance_score(p_vendor_id UUID, p_period_start DATE, p_period_end DATE)
RETURNS NUMERIC AS $$
DECLARE
    quality_score NUMERIC := 0;
    timeliness_score NUMERIC := 0;
    overall_score NUMERIC := 0;
BEGIN
    SELECT 
        AVG(CASE WHEN status = 'completed' THEN 100 ELSE 50 END),
        AVG(CASE WHEN completed_date <= due_date THEN 100 ELSE 70 END)
    INTO quality_score, timeliness_score
    FROM work_orders
    WHERE vendor_id = p_vendor_id
    AND created_at BETWEEN p_period_start AND p_period_end;
    
    overall_score := (COALESCE(quality_score, 80) + COALESCE(timeliness_score, 80)) / 2;
    
    RETURN overall_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update spend analytics
CREATE OR REPLACE FUNCTION update_spend_analytics()
RETURNS void AS $$
BEGIN
    INSERT INTO spend_analytics (
        company_id, period_type, period_date, category, vendor_id,
        total_spend, transaction_count, average_transaction_value
    )
    SELECT 
        company_id, 'monthly', DATE_TRUNC('month', CURRENT_DATE)::DATE,
        category, vendor_id,
        SUM(amount), COUNT(*), AVG(amount)
    FROM expenses
    WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY company_id, category, vendor_id
    ON CONFLICT (company_id, period_type, period_date, category, vendor_id)
    DO UPDATE SET
        total_spend = EXCLUDED.total_spend,
        transaction_count = EXCLUDED.transaction_count,
        average_transaction_value = EXCLUDED.average_transaction_value;
END;
$$ LANGUAGE plpgsql;
