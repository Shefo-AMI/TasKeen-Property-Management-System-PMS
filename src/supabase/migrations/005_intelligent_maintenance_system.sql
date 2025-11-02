-- Intelligent Maintenance System
-- Advanced maintenance management with vendor tracking and automation

-- Vendors/Contractors Database
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    specialties TEXT[] NOT NULL,
    license_number TEXT,
    license_expiry DATE,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    insurance_expiry DATE,
    tax_id TEXT,
    payment_terms TEXT,
    hourly_rate NUMERIC,
    service_areas TEXT[],
    rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_jobs INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    average_response_time INTEGER,
    average_completion_time INTEGER,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'blacklisted')),
    notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Reviews/Ratings
CREATE TABLE IF NOT EXISTS vendor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    work_order_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    review_text TEXT,
    would_recommend BOOLEAN DEFAULT TRUE,
    reviewed_by TEXT NOT NULL,
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Work Orders (extends maintenance_tickets)
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    work_order_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'emergency')),
    category TEXT NOT NULL CHECK (category IN (
        'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 
        'pest_control', 'landscaping', 'cleaning', 'painting', 
        'roofing', 'flooring', 'security', 'other'
    )),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    assigned_to TEXT,
    estimated_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC,
    estimated_hours NUMERIC,
    actual_hours NUMERIC,
    scheduled_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'assigned', 'scheduled', 'in_progress', 
        'on_hold', 'completed', 'cancelled', 'requires_approval'
    )),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    next_occurrence_date DATE,
    parent_work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    requires_tenant_access BOOLEAN DEFAULT FALSE,
    tenant_access_granted BOOLEAN DEFAULT FALSE,
    access_instructions TEXT,
    safety_concerns TEXT,
    before_photos TEXT[],
    after_photos TEXT[],
    documents TEXT[],
    created_by TEXT NOT NULL,
    notes TEXT,
    internal_notes TEXT,
    completion_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Order Status History
CREATE TABLE IF NOT EXISTS work_order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment/Appliance Tracking
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    equipment_type TEXT NOT NULL CHECK (equipment_type IN (
        'hvac', 'water_heater', 'refrigerator', 'stove', 'dishwasher', 
        'washer', 'dryer', 'furnace', 'ac_unit', 'boiler', 
        'elevator', 'generator', 'pool_equipment', 'security_system', 'other'
    )),
    brand TEXT NOT NULL,
    model_number TEXT NOT NULL,
    serial_number TEXT,
    purchase_date DATE,
    installation_date DATE,
    purchase_price NUMERIC,
    warranty_expiry DATE,
    warranty_provider TEXT,
    warranty_details TEXT,
    expected_lifespan_years INTEGER,
    last_service_date DATE,
    next_service_date DATE,
    service_frequency_months INTEGER,
    location_details TEXT,
    status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN (
        'operational', 'needs_service', 'under_repair', 'replaced', 'disposed'
    )),
    notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment Service History
CREATE TABLE IF NOT EXISTS equipment_service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('preventive', 'repair', 'replacement', 'inspection')),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    cost NUMERIC NOT NULL DEFAULT 0,
    parts_replaced TEXT[],
    next_service_date DATE,
    performed_by TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preventive Maintenance Schedule
CREATE TABLE IF NOT EXISTS preventive_maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    schedule_name TEXT NOT NULL,
    description TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'bi_weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')),
    frequency_days INTEGER NOT NULL,
    last_completed_date DATE,
    next_due_date DATE NOT NULL,
    estimated_duration_hours NUMERIC,
    estimated_cost NUMERIC,
    preferred_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    assigned_to TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_active BOOLEAN DEFAULT TRUE,
    auto_create_work_order BOOLEAN DEFAULT TRUE,
    advance_notice_days INTEGER DEFAULT 7,
    checklist JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Invoices
CREATE TABLE IF NOT EXISTS vendor_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    amount_paid NUMERIC DEFAULT 0,
    payment_date DATE,
    payment_method TEXT,
    payment_reference TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed', 'cancelled')),
    approved_by TEXT,
    approved_date DATE,
    invoice_url TEXT,
    line_items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Cost Estimates
CREATE TABLE IF NOT EXISTS maintenance_cost_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    estimate_number TEXT NOT NULL,
    estimate_date DATE NOT NULL,
    valid_until DATE,
    labor_cost NUMERIC NOT NULL DEFAULT 0,
    materials_cost NUMERIC NOT NULL DEFAULT 0,
    equipment_cost NUMERIC DEFAULT 0,
    other_costs NUMERIC DEFAULT 0,
    subtotal NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    estimated_duration_hours NUMERIC,
    line_items JSONB DEFAULT '[]'::jsonb,
    terms_conditions TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    approved_by TEXT,
    approved_date DATE,
    rejection_reason TEXT,
    estimate_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Code System for Issue Reporting
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    qr_code_id TEXT NOT NULL UNIQUE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    location_description TEXT NOT NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    qr_code_url TEXT NOT NULL,
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mobile App Activity Log
CREATE TABLE IF NOT EXISTS maintenance_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'created', 'assigned', 'status_changed', 'note_added', 
        'photo_uploaded', 'started', 'paused', 'completed', 'cancelled'
    )),
    performed_by TEXT NOT NULL,
    description TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    location_lat NUMERIC,
    location_lng NUMERIC,
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendors_company ON vendors(company_id);
CREATE INDEX IF NOT EXISTS idx_vendors_specialties ON vendors USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_company ON work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_property ON work_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_vendor ON work_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority ON work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled ON work_orders(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_equipment_company ON equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_property ON equipment(property_id);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_next_service ON equipment(next_service_date);
CREATE INDEX IF NOT EXISTS idx_preventive_schedules_company ON preventive_maintenance_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_preventive_schedules_next_due ON preventive_maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_vendor ON vendor_invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_work_order ON vendor_invoices(work_order_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_property ON qr_codes(property_id);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE preventive_maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_cost_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access to vendors" ON vendors
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to vendor reviews" ON vendor_reviews
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to work orders" ON work_orders
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to work order history" ON work_order_status_history
    FOR ALL USING (EXISTS (
        SELECT 1 FROM work_orders WHERE work_orders.id = work_order_status_history.work_order_id 
        AND work_orders.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to equipment" ON equipment
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to equipment service history" ON equipment_service_history
    FOR ALL USING (EXISTS (
        SELECT 1 FROM equipment WHERE equipment.id = equipment_service_history.equipment_id 
        AND equipment.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to preventive schedules" ON preventive_maintenance_schedules
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to vendor invoices" ON vendor_invoices
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to cost estimates" ON maintenance_cost_estimates
    FOR ALL USING (EXISTS (
        SELECT 1 FROM work_orders WHERE work_orders.id = maintenance_cost_estimates.work_order_id 
        AND work_orders.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to qr codes" ON qr_codes
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to activity log" ON maintenance_activity_log
    FOR ALL USING (EXISTS (
        SELECT 1 FROM work_orders WHERE work_orders.id = maintenance_activity_log.work_order_id 
        AND work_orders.company_id = current_setting('app.current_company_id', true)
    ));

-- Function to auto-assign vendor based on specialty
CREATE OR REPLACE FUNCTION auto_assign_vendor()
RETURNS TRIGGER AS $$
DECLARE
    best_vendor_id UUID;
BEGIN
    IF NEW.vendor_id IS NULL AND NEW.category IS NOT NULL THEN
        SELECT id INTO best_vendor_id
        FROM vendors
        WHERE company_id = NEW.company_id
        AND status = 'active'
        AND NEW.category = ANY(specialties)
        ORDER BY rating DESC, completed_jobs DESC
        LIMIT 1;
        
        IF best_vendor_id IS NOT NULL THEN
            NEW.vendor_id = best_vendor_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_assign_vendor
    BEFORE INSERT ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_vendor();

-- Function to update vendor rating
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendors
    SET rating = (
        SELECT AVG(rating)::NUMERIC(3,2)
        FROM vendor_reviews
        WHERE vendor_id = NEW.vendor_id
    ),
    updated_at = NOW()
    WHERE id = NEW.vendor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vendor_rating
    AFTER INSERT OR UPDATE ON vendor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_rating();

-- Function to create recurring work orders
CREATE OR REPLACE FUNCTION create_recurring_work_orders()
RETURNS void AS $$
DECLARE
    schedule_record RECORD;
    new_work_order_id UUID;
BEGIN
    FOR schedule_record IN 
        SELECT * FROM preventive_maintenance_schedules
        WHERE is_active = TRUE
        AND auto_create_work_order = TRUE
        AND next_due_date <= CURRENT_DATE + INTERVAL '1 day' * advance_notice_days
        AND NOT EXISTS (
            SELECT 1 FROM work_orders 
            WHERE parent_work_order_id = schedule_record.id 
            AND scheduled_date >= schedule_record.next_due_date
        )
    LOOP
        INSERT INTO work_orders (
            company_id, work_order_number, title, description, priority, category,
            property_id, unit_number, vendor_id, estimated_cost, scheduled_date,
            status, is_recurring, parent_work_order_id
        ) VALUES (
            schedule_record.company_id,
            'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
            schedule_record.schedule_name,
            schedule_record.description,
            schedule_record.priority,
            schedule_record.category,
            schedule_record.property_id,
            schedule_record.unit_number,
            schedule_record.preferred_vendor_id,
            schedule_record.estimated_cost,
            schedule_record.next_due_date,
            'scheduled',
            TRUE,
            schedule_record.id
        ) RETURNING id INTO new_work_order_id;
        
        -- Update next due date
        UPDATE preventive_maintenance_schedules
        SET next_due_date = next_due_date + INTERVAL '1 day' * frequency_days,
            last_completed_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = schedule_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
