-- Advanced Lease Management System
-- E-signature integration, automated renewals, and compliance tracking

-- Lease Templates
CREATE TABLE IF NOT EXISTS lease_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('residential', 'commercial', 'short_term', 'custom')),
    description TEXT,
    state_jurisdiction TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    template_content TEXT NOT NULL,
    clauses JSONB DEFAULT '[]'::jsonb,
    required_fields JSONB DEFAULT '[]'::jsonb,
    optional_fields JSONB DEFAULT '[]'::jsonb,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    last_modified_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lease Clause Library
CREATE TABLE IF NOT EXISTS lease_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    clause_name TEXT NOT NULL,
    clause_category TEXT NOT NULL CHECK (clause_category IN (
        'rent_payment', 'security_deposit', 'maintenance', 'utilities', 
        'pets', 'smoking', 'subletting', 'termination', 'renewal', 
        'insurance', 'parking', 'noise', 'alterations', 'other'
    )),
    clause_text TEXT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    is_negotiable BOOLEAN DEFAULT TRUE,
    state_specific TEXT,
    compliance_notes TEXT,
    tags TEXT[],
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Leases (extends existing leases table)
CREATE TABLE IF NOT EXISTS lease_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    lease_number TEXT NOT NULL UNIQUE,
    template_id UUID REFERENCES lease_templates(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    co_tenants JSONB DEFAULT '[]'::jsonb,
    guarantors JSONB DEFAULT '[]'::jsonb,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    lease_term_months INTEGER NOT NULL,
    monthly_rent NUMERIC NOT NULL,
    security_deposit NUMERIC NOT NULL DEFAULT 0,
    first_month_rent NUMERIC,
    last_month_rent NUMERIC,
    pet_deposit NUMERIC DEFAULT 0,
    other_deposits JSONB DEFAULT '[]'::jsonb,
    payment_due_day INTEGER NOT NULL DEFAULT 1 CHECK (payment_due_day >= 1 AND payment_due_day <= 31),
    late_fee_amount NUMERIC DEFAULT 0,
    late_fee_grace_period INTEGER DEFAULT 0,
    late_fee_type TEXT CHECK (late_fee_type IN ('flat', 'percentage', 'daily')),
    lease_type TEXT NOT NULL CHECK (lease_type IN ('fixed', 'month_to_month', 'yearly')),
    renewal_option TEXT NOT NULL CHECK (renewal_option IN ('auto_renew', 'manual', 'no_renewal')),
    renewal_notice_days INTEGER DEFAULT 60,
    rent_escalation_percentage NUMERIC DEFAULT 0,
    rent_escalation_frequency TEXT CHECK (rent_escalation_frequency IN ('annual', 'biannual', 'at_renewal')),
    pet_allowed BOOLEAN DEFAULT FALSE,
    pet_details JSONB DEFAULT '[]'::jsonb,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    subletting_allowed BOOLEAN DEFAULT FALSE,
    utilities_included TEXT[],
    parking_spaces INTEGER DEFAULT 0,
    parking_details TEXT,
    storage_units INTEGER DEFAULT 0,
    amenities_included TEXT[],
    special_terms TEXT,
    custom_clauses JSONB DEFAULT '[]'::jsonb,
    move_in_checklist JSONB DEFAULT '[]'::jsonb,
    move_out_checklist JSONB DEFAULT '[]'::jsonb,
    move_in_inspection_date DATE,
    move_in_inspection_notes TEXT,
    move_in_photos TEXT[],
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_signature', 'active', 'expiring_soon', 
        'expired', 'terminated', 'renewed', 'cancelled'
    )),
    signature_status TEXT NOT NULL DEFAULT 'unsigned' CHECK (signature_status IN (
        'unsigned', 'partially_signed', 'fully_signed', 'declined'
    )),
    landlord_signed BOOLEAN DEFAULT FALSE,
    landlord_signed_date TIMESTAMPTZ,
    landlord_signature_id TEXT,
    tenant_signed BOOLEAN DEFAULT FALSE,
    tenant_signed_date TIMESTAMPTZ,
    tenant_signature_id TEXT,
    esignature_provider TEXT CHECK (esignature_provider IN ('docusign', 'hellosign', 'adobe_sign', 'internal')),
    esignature_envelope_id TEXT,
    document_url TEXT,
    signed_document_url TEXT,
    renewal_reminder_sent BOOLEAN DEFAULT FALSE,
    renewal_reminder_date DATE,
    expiration_notice_sent BOOLEAN DEFAULT FALSE,
    expiration_notice_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    termination_notice_date DATE,
    early_termination_fee NUMERIC,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lease Amendments
CREATE TABLE IF NOT EXISTS lease_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID REFERENCES lease_agreements(id) ON DELETE CASCADE,
    amendment_number INTEGER NOT NULL,
    amendment_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    amendment_type TEXT NOT NULL CHECK (amendment_type IN (
        'rent_change', 'term_extension', 'tenant_change', 
        'clause_modification', 'addendum', 'other'
    )),
    description TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    changes JSONB NOT NULL,
    requires_signature BOOLEAN DEFAULT TRUE,
    landlord_signed BOOLEAN DEFAULT FALSE,
    tenant_signed BOOLEAN DEFAULT FALSE,
    landlord_signed_date DATE,
    tenant_signed_date DATE,
    document_url TEXT,
    signed_document_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'rejected')),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lease Violations
CREATE TABLE IF NOT EXISTS lease_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    lease_id UUID REFERENCES lease_agreements(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL CHECK (violation_type IN (
        'late_payment', 'noise_complaint', 'unauthorized_occupant', 
        'unauthorized_pet', 'property_damage', 'lease_breach', 
        'illegal_activity', 'other'
    )),
    violation_date DATE NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
    notice_sent BOOLEAN DEFAULT FALSE,
    notice_sent_date DATE,
    notice_type TEXT CHECK (notice_type IN ('verbal_warning', 'written_warning', 'cure_or_quit', 'eviction')),
    cure_deadline DATE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_date DATE,
    resolution_notes TEXT,
    fine_amount NUMERIC DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    photos TEXT[],
    documents TEXT[],
    reported_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lease Renewal Tracking
CREATE TABLE IF NOT EXISTS lease_renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_lease_id UUID REFERENCES lease_agreements(id) ON DELETE CASCADE,
    new_lease_id UUID REFERENCES lease_agreements(id) ON DELETE SET NULL,
    renewal_status TEXT NOT NULL DEFAULT 'pending' CHECK (renewal_status IN (
        'pending', 'offered', 'negotiating', 'accepted', 
        'declined', 'completed', 'cancelled'
    )),
    renewal_offer_date DATE NOT NULL,
    renewal_offer_expiry DATE NOT NULL,
    proposed_start_date DATE NOT NULL,
    proposed_end_date DATE NOT NULL,
    proposed_rent NUMERIC NOT NULL,
    rent_increase_amount NUMERIC DEFAULT 0,
    rent_increase_percentage NUMERIC DEFAULT 0,
    proposed_terms JSONB DEFAULT '{}'::jsonb,
    tenant_response TEXT,
    tenant_response_date DATE,
    counter_offer_rent NUMERIC,
    counter_offer_terms JSONB,
    negotiation_notes TEXT,
    final_terms JSONB,
    decision_date DATE,
    decision_reason TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Move-In/Move-Out Inspections
CREATE TABLE IF NOT EXISTS lease_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    lease_id UUID REFERENCES lease_agreements(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('move_in', 'move_out', 'periodic', 'emergency')),
    inspection_date DATE NOT NULL,
    inspector_name TEXT NOT NULL,
    tenant_present BOOLEAN DEFAULT FALSE,
    overall_condition TEXT NOT NULL CHECK (overall_condition IN ('excellent', 'good', 'fair', 'poor')),
    room_inspections JSONB NOT NULL DEFAULT '[]'::jsonb,
    damages_found JSONB DEFAULT '[]'::jsonb,
    total_damage_cost NUMERIC DEFAULT 0,
    cleaning_required BOOLEAN DEFAULT FALSE,
    cleaning_cost NUMERIC DEFAULT 0,
    repairs_required BOOLEAN DEFAULT FALSE,
    repairs_cost NUMERIC DEFAULT 0,
    security_deposit_deductions JSONB DEFAULT '[]'::jsonb,
    total_deductions NUMERIC DEFAULT 0,
    photos TEXT[],
    videos TEXT[],
    tenant_signature TEXT,
    inspector_signature TEXT,
    tenant_comments TEXT,
    inspector_notes TEXT,
    report_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'disputed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Deposit Itemization
CREATE TABLE IF NOT EXISTS security_deposit_itemizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID REFERENCES lease_agreements(id) ON DELETE CASCADE,
    security_deposit_id UUID REFERENCES security_deposits(id) ON DELETE CASCADE,
    inspection_id UUID REFERENCES lease_inspections(id) ON DELETE SET NULL,
    itemization_date DATE NOT NULL,
    original_deposit_amount NUMERIC NOT NULL,
    interest_earned NUMERIC DEFAULT 0,
    deduction_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_deductions NUMERIC NOT NULL DEFAULT 0,
    refund_amount NUMERIC NOT NULL,
    refund_date DATE,
    refund_method TEXT,
    refund_check_number TEXT,
    tenant_notified BOOLEAN DEFAULT FALSE,
    notification_date DATE,
    tenant_disputed BOOLEAN DEFAULT FALSE,
    dispute_details TEXT,
    dispute_resolution TEXT,
    document_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'disputed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lease Document Versions
CREATE TABLE IF NOT EXISTS lease_document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID REFERENCES lease_agreements(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('original', 'amendment', 'renewal', 'addendum')),
    document_url TEXT NOT NULL,
    changes_summary TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- State-Specific Compliance Requirements
CREATE TABLE IF NOT EXISTS lease_compliance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code TEXT NOT NULL,
    requirement_type TEXT NOT NULL CHECK (requirement_type IN (
        'disclosure', 'clause', 'notice_period', 'security_deposit_limit', 
        'late_fee_limit', 'other'
    )),
    requirement_name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    penalty_for_noncompliance TEXT,
    reference_statute TEXT,
    effective_date DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lease_templates_company ON lease_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_lease_clauses_company ON lease_clauses(company_id);
CREATE INDEX IF NOT EXISTS idx_lease_clauses_category ON lease_clauses(clause_category);
CREATE INDEX IF NOT EXISTS idx_lease_agreements_company ON lease_agreements(company_id);
CREATE INDEX IF NOT EXISTS idx_lease_agreements_property ON lease_agreements(property_id);
CREATE INDEX IF NOT EXISTS idx_lease_agreements_tenant ON lease_agreements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lease_agreements_status ON lease_agreements(status);
CREATE INDEX IF NOT EXISTS idx_lease_agreements_end_date ON lease_agreements(end_date);
CREATE INDEX IF NOT EXISTS idx_lease_amendments_lease ON lease_amendments(lease_id);
CREATE INDEX IF NOT EXISTS idx_lease_violations_lease ON lease_violations(lease_id);
CREATE INDEX IF NOT EXISTS idx_lease_violations_tenant ON lease_violations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lease_renewals_original ON lease_renewals(original_lease_id);
CREATE INDEX IF NOT EXISTS idx_lease_inspections_lease ON lease_inspections(lease_id);
CREATE INDEX IF NOT EXISTS idx_security_itemizations_lease ON security_deposit_itemizations(lease_id);

-- Enable RLS
ALTER TABLE lease_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_itemizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_compliance_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access to lease templates" ON lease_templates
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to lease clauses" ON lease_clauses
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to lease agreements" ON lease_agreements
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to lease amendments" ON lease_amendments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM lease_agreements WHERE lease_agreements.id = lease_amendments.lease_id 
        AND lease_agreements.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to lease violations" ON lease_violations
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to lease renewals" ON lease_renewals
    FOR ALL USING (EXISTS (
        SELECT 1 FROM lease_agreements WHERE lease_agreements.id = lease_renewals.original_lease_id 
        AND lease_agreements.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to lease inspections" ON lease_inspections
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to security deposit itemizations" ON security_deposit_itemizations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM lease_agreements WHERE lease_agreements.id = security_deposit_itemizations.lease_id 
        AND lease_agreements.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to lease document versions" ON lease_document_versions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM lease_agreements WHERE lease_agreements.id = lease_document_versions.lease_id 
        AND lease_agreements.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Public access to compliance requirements" ON lease_compliance_requirements
    FOR SELECT USING (true);

-- Function to check expiring leases and send reminders
CREATE OR REPLACE FUNCTION check_expiring_leases()
RETURNS void AS $$
DECLARE
    lease_record RECORD;
BEGIN
    FOR lease_record IN 
        SELECT * FROM lease_agreements
        WHERE status = 'active'
        AND end_date <= CURRENT_DATE + INTERVAL '1 day' * renewal_notice_days
        AND renewal_reminder_sent = FALSE
    LOOP
        -- Update reminder status
        UPDATE lease_agreements
        SET renewal_reminder_sent = TRUE,
            renewal_reminder_date = CURRENT_DATE,
            status = CASE 
                WHEN end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
                ELSE status
            END
        WHERE id = lease_record.id;
        
        -- Create renewal record if auto-renew
        IF lease_record.renewal_option = 'auto_renew' THEN
            INSERT INTO lease_renewals (
                original_lease_id, renewal_status, renewal_offer_date,
                renewal_offer_expiry, proposed_start_date, proposed_end_date,
                proposed_rent, rent_increase_percentage, created_by
            ) VALUES (
                lease_record.id, 'offered', CURRENT_DATE,
                CURRENT_DATE + INTERVAL '30 days', lease_record.end_date + INTERVAL '1 day',
                lease_record.end_date + INTERVAL '1 year',
                lease_record.monthly_rent * (1 + lease_record.rent_escalation_percentage / 100),
                lease_record.rent_escalation_percentage, 'system'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update lease status
CREATE OR REPLACE FUNCTION update_lease_status()
RETURNS void AS $$
BEGIN
    -- Mark leases as expired
    UPDATE lease_agreements
    SET status = 'expired',
        expiration_notice_sent = TRUE,
        expiration_notice_date = CURRENT_DATE
    WHERE status IN ('active', 'expiring_soon')
    AND end_date < CURRENT_DATE;
    
    -- Mark leases as expiring soon
    UPDATE lease_agreements
    SET status = 'expiring_soon'
    WHERE status = 'active'
    AND end_date <= CURRENT_DATE + INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;
