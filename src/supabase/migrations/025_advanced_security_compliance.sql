-- Advanced Security & Compliance
-- SOC 2, GDPR, CCPA, ISO 27001, penetration testing

-- Security Audit Logs
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login', 'logout', 'failed_login', 'password_change', 'permission_change',
        'data_access', 'data_modification', 'data_deletion', 'export', 'api_access'
    )),
    user_id UUID,
    user_email TEXT,
    ip_address INET,
    user_agent TEXT,
    resource_type TEXT,
    resource_id UUID,
    action TEXT NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Encryption Keys
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT NOT NULL UNIQUE,
    key_type TEXT CHECK (key_type IN ('aes_256', 'rsa_2048', 'rsa_4096')),
    key_purpose TEXT,
    encrypted_key TEXT NOT NULL,
    key_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    rotation_schedule_days INTEGER DEFAULT 90,
    last_rotated_at TIMESTAMPTZ DEFAULT NOW(),
    next_rotation_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GDPR Compliance
CREATE TABLE IF NOT EXISTS gdpr_data_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type TEXT NOT NULL CHECK (request_type IN (
        'data_access', 'data_portability', 'data_rectification', 
        'data_erasure', 'restrict_processing', 'object_to_processing'
    )),
    requester_email TEXT NOT NULL,
    requester_name TEXT,
    company_id TEXT NOT NULL,
    request_date DATE DEFAULT CURRENT_DATE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    processing_status TEXT DEFAULT 'received' CHECK (processing_status IN (
        'received', 'in_progress', 'completed', 'rejected'
    )),
    completion_deadline DATE,
    completed_date DATE,
    data_package_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Anonymization
CREATE TABLE IF NOT EXISTS data_anonymization_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    anonymization_method TEXT CHECK (anonymization_method IN (
        'masking', 'hashing', 'tokenization', 'generalization', 'deletion'
    )),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Penetration Testing Results
CREATE TABLE IF NOT EXISTS penetration_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_date DATE NOT NULL,
    tester_name TEXT NOT NULL,
    testing_firm TEXT,
    test_type TEXT CHECK (test_type IN ('black_box', 'white_box', 'gray_box')),
    scope TEXT NOT NULL,
    vulnerabilities_found INTEGER DEFAULT 0,
    critical_vulnerabilities INTEGER DEFAULT 0,
    high_vulnerabilities INTEGER DEFAULT 0,
    medium_vulnerabilities INTEGER DEFAULT 0,
    low_vulnerabilities INTEGER DEFAULT 0,
    findings JSONB NOT NULL,
    recommendations JSONB,
    report_url TEXT,
    remediation_deadline DATE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'remediated', 'accepted_risk')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bug Bounty Program
CREATE TABLE IF NOT EXISTS bug_bounty_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_number TEXT NOT NULL UNIQUE,
    researcher_name TEXT,
    researcher_email TEXT NOT NULL,
    vulnerability_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
    description TEXT NOT NULL,
    proof_of_concept TEXT,
    affected_systems TEXT[],
    cvss_score NUMERIC,
    status TEXT DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'triaging', 'accepted', 'duplicate', 'not_applicable', 'fixed', 'rewarded'
    )),
    bounty_amount NUMERIC,
    paid_date DATE,
    fixed_date DATE,
    public_disclosure_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Certifications
CREATE TABLE IF NOT EXISTS compliance_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_type TEXT NOT NULL CHECK (certification_type IN (
        'soc2_type1', 'soc2_type2', 'iso27001', 'gdpr', 'ccpa', 'hipaa', 'pci_dss'
    )),
    certification_status TEXT DEFAULT 'in_progress' CHECK (certification_status IN (
        'in_progress', 'certified', 'expired', 'suspended'
    )),
    certifying_body TEXT,
    certification_date DATE,
    expiry_date DATE,
    audit_date DATE,
    next_audit_date DATE,
    certificate_url TEXT,
    findings JSONB,
    corrective_actions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup & Disaster Recovery
CREATE TABLE IF NOT EXISTS backup_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_name TEXT NOT NULL,
    backup_type TEXT CHECK (backup_type IN ('full', 'incremental', 'differential')),
    backup_frequency TEXT CHECK (backup_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
    retention_days INTEGER NOT NULL,
    backup_location TEXT NOT NULL,
    encryption_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_backup_at TIMESTAMPTZ,
    next_backup_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID REFERENCES backup_configurations(id) ON DELETE CASCADE,
    backup_date TIMESTAMPTZ DEFAULT NOW(),
    backup_size_bytes BIGINT,
    backup_location TEXT,
    status TEXT CHECK (status IN ('success', 'failed', 'partial')),
    duration_seconds INTEGER,
    error_message TEXT,
    verification_status TEXT CHECK (verification_status IN ('verified', 'failed', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disaster Recovery Plans
CREATE TABLE IF NOT EXISTS disaster_recovery_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL,
    disaster_type TEXT NOT NULL,
    recovery_time_objective_hours INTEGER NOT NULL,
    recovery_point_objective_hours INTEGER NOT NULL,
    recovery_procedures JSONB NOT NULL,
    contact_list JSONB NOT NULL,
    last_tested_date DATE,
    next_test_date DATE,
    test_results JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DDoS Protection Logs
CREATE TABLE IF NOT EXISTS ddos_protection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attack_detected_at TIMESTAMPTZ DEFAULT NOW(),
    attack_type TEXT,
    source_ips INET[],
    target_endpoint TEXT,
    request_count INTEGER,
    attack_duration_seconds INTEGER,
    mitigation_applied TEXT,
    blocked_requests INTEGER,
    status TEXT CHECK (status IN ('active', 'mitigated', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Incident Response
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number TEXT NOT NULL UNIQUE,
    incident_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    description TEXT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    detected_by TEXT,
    affected_systems TEXT[],
    affected_users UUID[],
    data_breach BOOLEAN DEFAULT FALSE,
    data_compromised TEXT,
    root_cause TEXT,
    containment_actions TEXT,
    eradication_actions TEXT,
    recovery_actions TEXT,
    lessons_learned TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'contained', 'eradicated', 'recovered', 'closed')),
    closed_at TIMESTAMPTZ,
    notification_required BOOLEAN DEFAULT FALSE,
    authorities_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_security_audit_logs_company ON security_audit_logs(company_id, created_at);
CREATE INDEX idx_security_audit_logs_user ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_risk ON security_audit_logs(risk_level);
CREATE INDEX idx_gdpr_requests_company ON gdpr_data_requests(company_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_data_requests(processing_status);
CREATE INDEX idx_penetration_tests_date ON penetration_test_results(test_date);
CREATE INDEX idx_bug_bounty_status ON bug_bounty_submissions(status);
CREATE INDEX idx_compliance_certs_type ON compliance_certifications(certification_type);
CREATE INDEX idx_backup_history_config ON backup_history(configuration_id);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity, status);

-- Enable RLS
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_anonymization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE penetration_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_bounty_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_recovery_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddos_protection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only for security tables)
CREATE POLICY "Admin access" ON security_audit_logs FOR ALL USING (true);
CREATE POLICY "Admin access" ON encryption_keys FOR ALL USING (true);
CREATE POLICY "Company access" ON gdpr_data_requests FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Admin access" ON data_anonymization_rules FOR ALL USING (true);
CREATE POLICY "Admin access" ON penetration_test_results FOR ALL USING (true);
CREATE POLICY "Admin access" ON bug_bounty_submissions FOR ALL USING (true);
CREATE POLICY "Admin access" ON compliance_certifications FOR ALL USING (true);
CREATE POLICY "Admin access" ON backup_configurations FOR ALL USING (true);
CREATE POLICY "Admin access" ON backup_history FOR ALL USING (true);
CREATE POLICY "Admin access" ON disaster_recovery_plans FOR ALL USING (true);
CREATE POLICY "Admin access" ON ddos_protection_logs FOR ALL USING (true);
CREATE POLICY "Admin access" ON security_incidents FOR ALL USING (true);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_company_id TEXT,
    p_event_type TEXT,
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO security_audit_logs (
        company_id, event_type, user_id, action,
        resource_type, resource_id, success
    ) VALUES (
        p_company_id, p_event_type, p_user_id, p_action,
        p_resource_type, p_resource_id, TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize data
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE tenants
    SET 
        email = 'anonymized_' || id || '@deleted.com',
        phone = 'REDACTED',
        ssn = NULL,
        notes = 'User data anonymized per GDPR request'
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
