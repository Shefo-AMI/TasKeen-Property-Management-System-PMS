-- Insurance & Risk Management System
-- Policy tracking, claims management, risk assessment

-- Insurance Policies
CREATE TABLE IF NOT EXISTS insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    policy_type TEXT NOT NULL CHECK (policy_type IN (
        'property_insurance', 'liability_insurance', 'landlord_insurance',
        'flood_insurance', 'earthquake_insurance', 'business_interruption',
        'workers_compensation', 'umbrella_policy', 'other'
    )),
    policy_number TEXT NOT NULL UNIQUE,
    provider_name TEXT NOT NULL,
    provider_contact TEXT,
    provider_email TEXT,
    provider_phone TEXT,
    insured_properties UUID[],
    coverage_amount NUMERIC NOT NULL,
    deductible_amount NUMERIC,
    premium_amount NUMERIC NOT NULL,
    premium_frequency TEXT CHECK (premium_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
    effective_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    auto_renewal BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending_renewal')),
    coverage_details JSONB,
    exclusions TEXT[],
    policy_document_url TEXT,
    reminder_days_before INTEGER[] DEFAULT ARRAY[90, 60, 30, 14],
    reminders_sent JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Claims
CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL,
    claim_number TEXT NOT NULL UNIQUE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    incident_date DATE NOT NULL,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    claim_type TEXT NOT NULL CHECK (claim_type IN (
        'property_damage', 'liability', 'theft', 'fire', 'water_damage',
        'natural_disaster', 'vandalism', 'tenant_injury', 'other'
    )),
    claim_amount NUMERIC NOT NULL,
    approved_amount NUMERIC,
    deductible_paid NUMERIC,
    net_payout NUMERIC,
    status TEXT DEFAULT 'submitted' CHECK (status IN (
        'draft', 'submitted', 'under_review', 'approved', 
        'partially_approved', 'denied', 'paid', 'closed'
    )),
    incident_description TEXT NOT NULL,
    affected_areas TEXT[],
    witnesses JSONB,
    police_report_filed BOOLEAN DEFAULT FALSE,
    police_report_number TEXT,
    adjuster_name TEXT,
    adjuster_contact TEXT,
    adjuster_visit_date DATE,
    documentation JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    denial_reason TEXT,
    settlement_date DATE,
    lessons_learned TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assessor_name TEXT NOT NULL,
    overall_risk_score NUMERIC NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
    fire_risk_score NUMERIC,
    flood_risk_score NUMERIC,
    earthquake_risk_score NUMERIC,
    theft_risk_score NUMERIC,
    liability_risk_score NUMERIC,
    environmental_risk_score NUMERIC,
    identified_risks JSONB NOT NULL,
    mitigation_measures JSONB,
    recommendations TEXT[],
    estimated_annual_loss NUMERIC,
    priority_actions JSONB,
    next_assessment_due DATE,
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Reports
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    incident_type TEXT NOT NULL CHECK (incident_type IN (
        'accident', 'injury', 'property_damage', 'theft', 'vandalism',
        'fire', 'flood', 'gas_leak', 'elevator_malfunction', 'slip_fall',
        'security_breach', 'noise_complaint', 'other'
    )),
    incident_date TIMESTAMPTZ NOT NULL,
    reported_date TIMESTAMPTZ DEFAULT NOW(),
    reported_by TEXT NOT NULL,
    reporter_type TEXT CHECK (reporter_type IN ('tenant', 'employee', 'vendor', 'visitor', 'security')),
    severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    people_involved JSONB,
    injuries_reported BOOLEAN DEFAULT FALSE,
    injury_details TEXT,
    medical_attention_required BOOLEAN DEFAULT FALSE,
    emergency_services_called BOOLEAN DEFAULT FALSE,
    emergency_services_details TEXT,
    witnesses JSONB,
    immediate_actions_taken TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    police_notified BOOLEAN DEFAULT FALSE,
    police_report_number TEXT,
    insurance_claim_filed BOOLEAN DEFAULT FALSE,
    insurance_claim_id UUID REFERENCES insurance_claims(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution_notes TEXT,
    preventive_measures TEXT,
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liability Tracking
CREATE TABLE IF NOT EXISTS liability_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    liability_type TEXT NOT NULL CHECK (liability_type IN (
        'tenant_injury', 'visitor_injury', 'property_damage', 'legal_claim',
        'contract_dispute', 'environmental', 'employment', 'other'
    )),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incident_reports(id) ON DELETE SET NULL,
    claim_id UUID REFERENCES insurance_claims(id) ON DELETE SET NULL,
    incident_date DATE NOT NULL,
    reported_date DATE DEFAULT CURRENT_DATE,
    claimant_name TEXT NOT NULL,
    claimant_contact TEXT,
    claimant_type TEXT CHECK (claimant_type IN ('tenant', 'visitor', 'vendor', 'neighbor', 'employee', 'other')),
    claim_amount NUMERIC,
    description TEXT NOT NULL,
    legal_representation_required BOOLEAN DEFAULT FALSE,
    attorney_name TEXT,
    attorney_contact TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN (
        'open', 'investigating', 'negotiating', 'settled', 'litigation', 'closed'
    )),
    settlement_amount NUMERIC,
    settlement_date DATE,
    insurance_covered BOOLEAN DEFAULT FALSE,
    out_of_pocket_cost NUMERIC,
    documentation JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Insurance Verification
CREATE TABLE IF NOT EXISTS tenant_insurance_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    lease_id UUID,
    insurance_required BOOLEAN DEFAULT TRUE,
    has_insurance BOOLEAN DEFAULT FALSE,
    provider_name TEXT,
    policy_number TEXT,
    coverage_amount NUMERIC,
    effective_date DATE,
    expiry_date DATE,
    proof_document_url TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'expired', 'insufficient_coverage', 'not_provided'
    )),
    verified_by TEXT,
    verified_date DATE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    last_reminder_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loss Prevention Recommendations
CREATE TABLE IF NOT EXISTS loss_prevention_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    recommendation_type TEXT CHECK (recommendation_type IN (
        'security', 'fire_safety', 'maintenance', 'tenant_screening',
        'insurance', 'legal', 'environmental', 'general'
    )),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_cost NUMERIC,
    potential_savings NUMERIC,
    implementation_timeline TEXT,
    status TEXT DEFAULT 'proposed' CHECK (status IN (
        'proposed', 'approved', 'in_progress', 'completed', 'rejected', 'deferred'
    )),
    assigned_to TEXT,
    due_date DATE,
    completed_date DATE,
    effectiveness_rating NUMERIC CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    contact_type TEXT NOT NULL CHECK (contact_type IN (
        'police', 'fire_department', 'ambulance', 'hospital', 'poison_control',
        'gas_company', 'electric_company', 'water_company', 'security',
        'property_manager', 'maintenance', 'insurance', 'legal', 'other'
    )),
    contact_name TEXT NOT NULL,
    organization TEXT,
    phone_primary TEXT NOT NULL,
    phone_secondary TEXT,
    email TEXT,
    address TEXT,
    available_24_7 BOOLEAN DEFAULT FALSE,
    response_time TEXT,
    service_area TEXT,
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Provider Integrations
CREATE TABLE IF NOT EXISTS insurance_provider_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    integration_type TEXT CHECK (integration_type IN ('policy_sync', 'claim_submission', 'quote_request', 'full')),
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    sync_frequency TEXT CHECK (sync_frequency IN ('real_time', 'hourly', 'daily', 'weekly')),
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_insurance_policies_company ON insurance_policies(company_id);
CREATE INDEX idx_insurance_policies_expiry ON insurance_policies(expiry_date);
CREATE INDEX idx_insurance_claims_company ON insurance_claims(company_id);
CREATE INDEX idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX idx_risk_assessments_property ON risk_assessments(property_id);
CREATE INDEX idx_incident_reports_company ON incident_reports(company_id);
CREATE INDEX idx_incident_reports_property ON incident_reports(property_id);
CREATE INDEX idx_incident_reports_date ON incident_reports(incident_date);
CREATE INDEX idx_liability_tracking_company ON liability_tracking(company_id);
CREATE INDEX idx_tenant_insurance_tenant ON tenant_insurance_verification(tenant_id);
CREATE INDEX idx_loss_prevention_property ON loss_prevention_recommendations(property_id);
CREATE INDEX idx_emergency_contacts_property ON emergency_contacts(property_id);

-- Enable RLS
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE liability_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_insurance_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_prevention_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_provider_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON insurance_policies FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON insurance_claims FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON risk_assessments FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON incident_reports FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON liability_tracking FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON tenant_insurance_verification FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON loss_prevention_recommendations FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON emergency_contacts FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON insurance_provider_integrations FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to check policy expiration
CREATE OR REPLACE FUNCTION check_insurance_policy_expiration()
RETURNS void AS $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT * FROM insurance_policies
        WHERE status = 'active' AND expiry_date >= CURRENT_DATE
    LOOP
        IF policy_record.expiry_date <= CURRENT_DATE + 90 THEN
            INSERT INTO notification_queue (
                company_id, recipient_type, recipient_name, channel,
                subject, message, priority
            ) VALUES (
                policy_record.company_id, 'employee', 'Admin',
                'email', 'Insurance Policy Expiring',
                format('Policy %s expires on %s', policy_record.policy_number, policy_record.expiry_date),
                'high'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_property_risk_score(p_property_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    risk_score NUMERIC := 0;
    incident_count INTEGER;
    claim_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO incident_count
    FROM incident_reports
    WHERE property_id = p_property_id
    AND incident_date >= CURRENT_DATE - INTERVAL '1 year';
    
    SELECT COUNT(*) INTO claim_count
    FROM insurance_claims
    WHERE property_id = p_property_id
    AND claim_date >= CURRENT_DATE - INTERVAL '1 year';
    
    risk_score := (incident_count * 5) + (claim_count * 10);
    
    RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql;
