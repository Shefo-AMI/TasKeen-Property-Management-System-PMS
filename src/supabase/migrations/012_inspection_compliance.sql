-- Inspection & Compliance Management System
-- Digital checklists, compliance tracking, UAE regulations

-- Inspection Templates
CREATE TABLE IF NOT EXISTS inspection_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    inspection_type TEXT NOT NULL CHECK (inspection_type IN (
        'move_in', 'move_out', 'periodic', 'safety', 'maintenance',
        'annual', 'pre_lease', 'emergency', 'custom'
    )),
    description TEXT,
    checklist_items JSONB NOT NULL,
    requires_photos BOOLEAN DEFAULT TRUE,
    requires_signature BOOLEAN DEFAULT TRUE,
    estimated_duration_minutes INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    template_id UUID REFERENCES inspection_templates(id) ON DELETE SET NULL,
    inspection_type TEXT NOT NULL,
    inspection_date DATE NOT NULL,
    scheduled_time TIME,
    inspector_id UUID,
    inspector_name TEXT NOT NULL,
    tenant_id UUID,
    tenant_name TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'
    )),
    overall_condition TEXT CHECK (overall_condition IN ('excellent', 'good', 'fair', 'poor')),
    overall_score NUMERIC CHECK (overall_score >= 0 AND overall_score <= 100),
    checklist_responses JSONB NOT NULL DEFAULT '[]'::jsonb,
    deficiencies_found INTEGER DEFAULT 0,
    photos JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    inspector_signature TEXT,
    tenant_signature TEXT,
    completed_at TIMESTAMPTZ,
    report_generated BOOLEAN DEFAULT FALSE,
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection Photos with Annotations
CREATE TABLE IF NOT EXISTS inspection_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    photo_type TEXT CHECK (photo_type IN ('overview', 'deficiency', 'before', 'after', 'documentation')),
    room_area TEXT,
    caption TEXT,
    annotations JSONB DEFAULT '[]'::jsonb,
    gps_latitude NUMERIC,
    gps_longitude NUMERIC,
    taken_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deficiency Tracking
CREATE TABLE IF NOT EXISTS inspection_deficiencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    deficiency_type TEXT NOT NULL CHECK (deficiency_type IN (
        'damage', 'cleanliness', 'safety_hazard', 'code_violation',
        'maintenance_needed', 'missing_item', 'other'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_cost NUMERIC,
    responsible_party TEXT CHECK (responsible_party IN ('tenant', 'landlord', 'vendor', 'tbd')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'disputed')),
    resolution_notes TEXT,
    resolved_date DATE,
    resolved_by TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    work_order_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UAE Compliance Requirements
CREATE TABLE IF NOT EXISTS uae_compliance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_type TEXT NOT NULL CHECK (requirement_type IN (
        'fire_safety', 'building_code', 'health_safety', 'environmental',
        'accessibility', 'electrical', 'plumbing', 'structural', 'general'
    )),
    requirement_code TEXT NOT NULL UNIQUE,
    requirement_name TEXT NOT NULL,
    description TEXT NOT NULL,
    authority TEXT NOT NULL,
    applicable_property_types TEXT[],
    inspection_frequency TEXT CHECK (inspection_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual', 'biennial')),
    is_mandatory BOOLEAN DEFAULT TRUE,
    penalties_for_non_compliance TEXT,
    reference_documents JSONB,
    effective_date DATE,
    last_updated DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Compliance Tracking
CREATE TABLE IF NOT EXISTS compliance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES uae_compliance_requirements(id) ON DELETE CASCADE,
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN (
        'compliant', 'non_compliant', 'pending', 'in_progress', 'expired'
    )),
    last_inspection_date DATE,
    next_inspection_due DATE NOT NULL,
    inspector_name TEXT,
    inspection_report_url TEXT,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates & Permits
CREATE TABLE IF NOT EXISTS certificates_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL CHECK (certificate_type IN (
        'fire_safety', 'civil_defence', 'elevator', 'swimming_pool',
        'occupancy', 'building_permit', 'trade_license', 'ejari',
        'dewa', 'chiller', 'ac_maintenance', 'other'
    )),
    certificate_number TEXT NOT NULL,
    issuing_authority TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    renewal_required BOOLEAN DEFAULT TRUE,
    renewal_period_days INTEGER DEFAULT 90,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending_renewal', 'cancelled')),
    document_url TEXT,
    cost NUMERIC,
    reminder_days_before INTEGER[] DEFAULT ARRAY[90, 60, 30, 14, 7],
    reminders_sent JSONB DEFAULT '[]'::jsonb,
    auto_renewal_enabled BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection Scheduling
CREATE TABLE IF NOT EXISTS inspection_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    schedule_name TEXT NOT NULL,
    inspection_type TEXT NOT NULL,
    recurrence TEXT NOT NULL CHECK (recurrence IN ('one_time', 'weekly', 'monthly', 'quarterly', 'annual')),
    properties UUID[] NOT NULL,
    inspector_id UUID,
    inspector_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    preferred_time_slot TEXT,
    route_optimization BOOLEAN DEFAULT TRUE,
    route_sequence JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    last_executed DATE,
    next_execution DATE,
    total_inspections_created INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspector Routes
CREATE TABLE IF NOT EXISTS inspector_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    route_date DATE NOT NULL,
    inspector_id UUID NOT NULL,
    inspector_name TEXT NOT NULL,
    inspections UUID[] NOT NULL,
    route_sequence JSONB NOT NULL,
    total_distance_km NUMERIC,
    estimated_duration_minutes INTEGER,
    start_latitude NUMERIC,
    start_longitude NUMERIC,
    end_latitude NUMERIC,
    end_longitude NUMERIC,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Alerts
CREATE TABLE IF NOT EXISTS compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'certificate_expiring', 'inspection_overdue', 'non_compliance',
        'deficiency_unresolved', 'permit_required'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    related_to_id UUID,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_inspection_templates_company ON inspection_templates(company_id);
CREATE INDEX idx_inspections_company ON inspections(company_id);
CREATE INDEX idx_inspections_property ON inspections(property_id);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);
CREATE INDEX idx_inspection_photos_inspection ON inspection_photos(inspection_id);
CREATE INDEX idx_deficiencies_inspection ON inspection_deficiencies(inspection_id);
CREATE INDEX idx_compliance_tracking_property ON compliance_tracking(property_id);
CREATE INDEX idx_certificates_property ON certificates_permits(property_id);
CREATE INDEX idx_certificates_expiry ON certificates_permits(expiry_date);

-- Enable RLS
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE uae_compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspector_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON inspection_templates FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON inspections FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON inspection_deficiencies FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Public access" ON uae_compliance_requirements FOR SELECT USING (true);
CREATE POLICY "Company access" ON compliance_tracking FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON certificates_permits FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON inspection_schedules FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON inspector_routes FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON compliance_alerts FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to check certificate expiration
CREATE OR REPLACE FUNCTION check_certificate_expiration()
RETURNS void AS $$
DECLARE
    cert_record RECORD;
BEGIN
    FOR cert_record IN 
        SELECT * FROM certificates_permits
        WHERE status = 'active' AND expiry_date >= CURRENT_DATE
    LOOP
        IF cert_record.expiry_date <= CURRENT_DATE + 90 THEN
            INSERT INTO compliance_alerts (
                company_id, alert_type, severity, property_id, related_to_id,
                title, description, due_date
            ) VALUES (
                cert_record.company_id, 'certificate_expiring',
                CASE WHEN cert_record.expiry_date <= CURRENT_DATE + 7 THEN 'critical' ELSE 'high' END,
                cert_record.property_id, cert_record.id,
                'Certificate Expiring', 'Certificate expires soon', cert_record.expiry_date
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
