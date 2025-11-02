-- Legal & Compliance Tools System
-- Eviction management, legal documents, UAE/international compliance

-- Legal Cases
CREATE TABLE IF NOT EXISTS legal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    case_number TEXT NOT NULL UNIQUE,
    case_type TEXT NOT NULL CHECK (case_type IN (
        'eviction', 'lease_dispute', 'property_damage', 'non_payment',
        'contract_breach', 'fair_housing', 'personal_injury', 'other'
    )),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    case_status TEXT DEFAULT 'open' CHECK (case_status IN (
        'open', 'in_progress', 'court_pending', 'settled', 'won', 'lost', 'dismissed'
    )),
    filing_date DATE NOT NULL,
    court_name TEXT,
    court_location TEXT,
    judge_name TEXT,
    case_description TEXT NOT NULL,
    claim_amount NUMERIC,
    settlement_amount NUMERIC,
    attorney_id UUID,
    attorney_name TEXT,
    attorney_firm TEXT,
    attorney_contact TEXT,
    opposing_party TEXT,
    opposing_attorney TEXT,
    next_court_date DATE,
    court_dates JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    outcome TEXT,
    closed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eviction Workflows
CREATE TABLE IF NOT EXISTS eviction_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    legal_case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    eviction_reason TEXT NOT NULL CHECK (eviction_reason IN (
        'non_payment', 'lease_violation', 'property_damage', 
        'illegal_activity', 'lease_expiry', 'owner_occupancy', 'other'
    )),
    current_stage TEXT NOT NULL CHECK (current_stage IN (
        'notice_to_cure', 'notice_to_quit', 'court_filing', 
        'court_hearing', 'judgment', 'writ_of_possession', 'completed'
    )),
    notice_date DATE,
    cure_period_days INTEGER,
    cure_deadline DATE,
    court_filing_date DATE,
    hearing_date DATE,
    judgment_date DATE,
    possession_date DATE,
    amount_owed NUMERIC,
    legal_fees NUMERIC,
    total_judgment NUMERIC,
    status TEXT DEFAULT 'in_progress' CHECK (status IN (
        'in_progress', 'tenant_cured', 'completed', 'dismissed', 'settled'
    )),
    workflow_steps JSONB NOT NULL,
    documents_generated JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Document Templates
CREATE TABLE IF NOT EXISTS legal_document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT,
    template_name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'eviction_notice', 'lease_agreement', 'lease_amendment', 
        'notice_to_cure', 'notice_to_quit', 'demand_letter',
        'settlement_agreement', 'court_filing', 'affidavit', 'other'
    )),
    jurisdiction TEXT NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_system_template BOOLEAN DEFAULT FALSE,
    requires_attorney_review BOOLEAN DEFAULT FALSE,
    compliance_notes TEXT,
    last_reviewed_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Legal Documents
CREATE TABLE IF NOT EXISTS generated_legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    template_id UUID REFERENCES legal_document_templates(id) ON DELETE SET NULL,
    legal_case_id UUID REFERENCES legal_cases(id) ON DELETE SET NULL,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    document_content TEXT NOT NULL,
    document_url TEXT,
    generated_date DATE DEFAULT CURRENT_DATE,
    served_date DATE,
    service_method TEXT CHECK (service_method IN ('hand_delivery', 'certified_mail', 'email', 'posting', 'sheriff')),
    recipient_name TEXT,
    recipient_signature TEXT,
    witness_signature TEXT,
    notarized BOOLEAN DEFAULT FALSE,
    notary_name TEXT,
    notary_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'served', 'filed', 'executed')),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Court Date Tracking
CREATE TABLE IF NOT EXISTS court_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    legal_case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
    hearing_type TEXT NOT NULL CHECK (hearing_type IN (
        'initial_hearing', 'pre_trial', 'trial', 'motion_hearing', 
        'settlement_conference', 'status_conference', 'other'
    )),
    court_date TIMESTAMPTZ NOT NULL,
    court_name TEXT NOT NULL,
    court_address TEXT,
    courtroom TEXT,
    judge_name TEXT,
    attorney_attending TEXT,
    client_required BOOLEAN DEFAULT FALSE,
    preparation_notes TEXT,
    outcome TEXT,
    next_steps TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'postponed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attorney Communication Portal
CREATE TABLE IF NOT EXISTS attorney_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    legal_case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
    attorney_id UUID,
    communication_type TEXT CHECK (communication_type IN ('email', 'phone', 'meeting', 'document', 'note')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    attachments JSONB DEFAULT '[]'::jsonb,
    billable_hours NUMERIC,
    hourly_rate NUMERIC,
    total_cost NUMERIC,
    is_privileged BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UAE/International Compliance Checklists
CREATE TABLE IF NOT EXISTS compliance_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    checklist_name TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    compliance_area TEXT NOT NULL CHECK (compliance_area IN (
        'fair_housing', 'tenant_rights', 'eviction_laws', 'safety_codes',
        'accessibility', 'data_privacy', 'financial_reporting', 'labor_laws', 'other'
    )),
    checklist_items JSONB NOT NULL,
    applicable_property_types TEXT[],
    review_frequency TEXT CHECK (review_frequency IN ('monthly', 'quarterly', 'annual', 'as_needed')),
    last_review_date DATE,
    next_review_date DATE,
    responsible_party TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Audits
CREATE TABLE IF NOT EXISTS compliance_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES compliance_checklists(id) ON DELETE SET NULL,
    audit_date DATE NOT NULL,
    auditor_name TEXT NOT NULL,
    audit_type TEXT CHECK (audit_type IN ('internal', 'external', 'regulatory')),
    compliance_score NUMERIC CHECK (compliance_score >= 0 AND compliance_score <= 100),
    findings JSONB NOT NULL,
    violations_found INTEGER DEFAULT 0,
    corrective_actions JSONB,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'follow_up_pending')),
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fair Housing Compliance
CREATE TABLE IF NOT EXISTS fair_housing_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    compliance_area TEXT NOT NULL CHECK (compliance_area IN (
        'advertising', 'application_screening', 'lease_terms', 
        'reasonable_accommodation', 'accessibility', 'harassment_prevention'
    )),
    policy_document_url TEXT,
    training_completed BOOLEAN DEFAULT FALSE,
    last_training_date DATE,
    next_training_date DATE,
    complaints_filed INTEGER DEFAULT 0,
    violations_found INTEGER DEFAULT 0,
    corrective_actions TEXT,
    status TEXT DEFAULT 'compliant' CHECK (status IN ('compliant', 'needs_review', 'non_compliant')),
    last_reviewed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Hold Management
CREATE TABLE IF NOT EXISTS legal_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    legal_case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
    hold_name TEXT NOT NULL,
    hold_reason TEXT NOT NULL,
    hold_scope TEXT NOT NULL,
    data_types TEXT[] NOT NULL,
    custodians TEXT[] NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released', 'expired')),
    preservation_instructions TEXT,
    compliance_notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispute Resolution Tracking
CREATE TABLE IF NOT EXISTS dispute_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    dispute_type TEXT NOT NULL CHECK (dispute_type IN (
        'tenant_landlord', 'vendor', 'neighbor', 'hoa', 'contractor', 'other'
    )),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    parties_involved JSONB NOT NULL,
    dispute_description TEXT NOT NULL,
    resolution_method TEXT CHECK (resolution_method IN (
        'negotiation', 'mediation', 'arbitration', 'litigation', 'settlement'
    )),
    mediator_name TEXT,
    resolution_date DATE,
    outcome TEXT,
    settlement_terms TEXT,
    financial_impact NUMERIC,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_mediation', 'resolved', 'escalated')),
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regulatory Change Alerts
CREATE TABLE IF NOT EXISTS regulatory_change_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jurisdiction TEXT NOT NULL,
    regulation_type TEXT NOT NULL,
    regulation_name TEXT NOT NULL,
    change_description TEXT NOT NULL,
    effective_date DATE NOT NULL,
    impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
    affected_areas TEXT[],
    action_required TEXT,
    deadline DATE,
    source_url TEXT,
    acknowledged_by TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Service Integrations
CREATE TABLE IF NOT EXISTS legal_service_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    service_provider TEXT CHECK (service_provider IN ('legalzoom', 'rocket_lawyer', 'clio', 'mycase', 'custom')),
    api_key_encrypted TEXT,
    integration_type TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_legal_cases_company ON legal_cases(company_id);
CREATE INDEX idx_legal_cases_status ON legal_cases(case_status);
CREATE INDEX idx_eviction_workflows_company ON eviction_workflows(company_id);
CREATE INDEX idx_eviction_workflows_stage ON eviction_workflows(current_stage);
CREATE INDEX idx_legal_document_templates_type ON legal_document_templates(document_type);
CREATE INDEX idx_generated_legal_documents_case ON generated_legal_documents(legal_case_id);
CREATE INDEX idx_court_dates_company ON court_dates(company_id);
CREATE INDEX idx_court_dates_date ON court_dates(court_date);
CREATE INDEX idx_attorney_communications_case ON attorney_communications(legal_case_id);
CREATE INDEX idx_compliance_checklists_company ON compliance_checklists(company_id);
CREATE INDEX idx_compliance_audits_property ON compliance_audits(property_id);
CREATE INDEX idx_legal_holds_company ON legal_holds(company_id);
CREATE INDEX idx_dispute_resolutions_company ON dispute_resolutions(company_id);

-- Enable RLS
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE eviction_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorney_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fair_housing_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_change_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_service_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON legal_cases FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON eviction_workflows FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON legal_document_templates FOR ALL USING (company_id = current_setting('app.current_company_id', true) OR company_id IS NULL);
CREATE POLICY "Company access" ON generated_legal_documents FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON court_dates FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON attorney_communications FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON compliance_checklists FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON compliance_audits FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON fair_housing_compliance FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON legal_holds FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON dispute_resolutions FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Public access" ON regulatory_change_alerts FOR SELECT USING (true);
CREATE POLICY "Company access" ON legal_service_integrations FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to generate eviction notice
CREATE OR REPLACE FUNCTION generate_eviction_notice(
    p_eviction_id UUID,
    p_template_id UUID
)
RETURNS UUID AS $$
DECLARE
    doc_id UUID;
    eviction_record RECORD;
BEGIN
    SELECT * INTO eviction_record FROM eviction_workflows WHERE id = p_eviction_id;
    
    INSERT INTO generated_legal_documents (
        company_id, template_id, document_type, document_name,
        document_content, status, created_by
    ) VALUES (
        eviction_record.company_id, p_template_id, 'eviction_notice',
        format('Eviction Notice - %s', eviction_record.tenant_id),
        'Generated eviction notice content', 'generated', 'system'
    ) RETURNING id INTO doc_id;
    
    RETURN doc_id;
END;
$$ LANGUAGE plpgsql;

-- Insert UAE compliance templates
INSERT INTO legal_document_templates (template_name, document_type, jurisdiction, template_content, is_system_template) VALUES
('UAE Eviction Notice', 'eviction_notice', 'UAE', 'Standard UAE eviction notice template', TRUE),
('UAE Lease Agreement', 'lease_agreement', 'UAE', 'Standard UAE lease agreement template', TRUE),
('UAE Notice to Cure', 'notice_to_cure', 'UAE', 'Standard UAE notice to cure template', TRUE);
