-- Create tables for PropertyFlow CRUD system

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial', 'mixed', 'industrial')),
    units INTEGER NOT NULL DEFAULT 1,
    year_built INTEGER NOT NULL,
    total_area NUMERIC NOT NULL,
    monthly_rent NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    occupancy_rate NUMERIC DEFAULT 0,
    description TEXT,
    amenities TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    date_of_birth DATE NOT NULL,
    national_id TEXT NOT NULL,
    occupation TEXT NOT NULL,
    employer_name TEXT,
    emergency_contact TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    move_in_date DATE NOT NULL,
    lease_end_date DATE,
    monthly_rent NUMERIC NOT NULL,
    security_deposit NUMERIC NOT NULL DEFAULT 0,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive', 'evicted')),
    payment_status TEXT NOT NULL DEFAULT 'current' CHECK (payment_status IN ('current', 'late', 'delinquent')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leases table
CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC NOT NULL,
    security_deposit NUMERIC NOT NULL DEFAULT 0,
    payment_due_day INTEGER NOT NULL DEFAULT 1 CHECK (payment_due_day >= 1 AND payment_due_day <= 31),
    late_fee_amount NUMERIC DEFAULT 0,
    late_fee_grace_period INTEGER DEFAULT 0,
    lease_type TEXT NOT NULL CHECK (lease_type IN ('fixed', 'month_to_month', 'yearly')),
    renewal_option TEXT NOT NULL CHECK (renewal_option IN ('auto_renew', 'manual', 'no_renewal')),
    pet_allowed BOOLEAN DEFAULT FALSE,
    pet_deposit NUMERIC DEFAULT 0,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    utilities_included TEXT,
    parking_spaces INTEGER DEFAULT 0,
    special_terms TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expiring_soon', 'expired', 'terminated')),
    signed_date DATE,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance tickets table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other')),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    assigned_to TEXT,
    estimated_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC,
    scheduled_date DATE,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    created_by TEXT NOT NULL,
    notes TEXT,
    before_photos TEXT[],
    after_photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('lease', 'inspection', 'maintenance', 'invoice', 'photo', 'other')),
    linked_to TEXT NOT NULL CHECK (linked_to IN ('property', 'tenant', 'lease', 'maintenance')),
    linked_id UUID NOT NULL,
    linked_name TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_company_id ON properties(company_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_tenants_company_id ON tenants(company_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_leases_company_id ON leases(company_id);
CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_company_id ON maintenance_tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON maintenance_tickets(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_tickets(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_linked ON documents(linked_to, linked_id);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Properties policies
CREATE POLICY "Users can view properties in their company"
    ON properties FOR SELECT
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can insert properties in their company"
    ON properties FOR INSERT
    WITH CHECK (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can update properties in their company"
    ON properties FOR UPDATE
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can delete properties in their company"
    ON properties FOR DELETE
    USING (company_id = current_setting('app.current_company_id', true));

-- Tenants policies
CREATE POLICY "Users can view tenants in their company"
    ON tenants FOR SELECT
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can insert tenants in their company"
    ON tenants FOR INSERT
    WITH CHECK (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can update tenants in their company"
    ON tenants FOR UPDATE
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can delete tenants in their company"
    ON tenants FOR DELETE
    USING (company_id = current_setting('app.current_company_id', true));

-- Leases policies
CREATE POLICY "Users can view leases in their company"
    ON leases FOR SELECT
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can insert leases in their company"
    ON leases FOR INSERT
    WITH CHECK (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can update leases in their company"
    ON leases FOR UPDATE
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can delete leases in their company"
    ON leases FOR DELETE
    USING (company_id = current_setting('app.current_company_id', true));

-- Maintenance tickets policies
CREATE POLICY "Users can view maintenance tickets in their company"
    ON maintenance_tickets FOR SELECT
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can insert maintenance tickets in their company"
    ON maintenance_tickets FOR INSERT
    WITH CHECK (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can update maintenance tickets in their company"
    ON maintenance_tickets FOR UPDATE
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can delete maintenance tickets in their company"
    ON maintenance_tickets FOR DELETE
    USING (company_id = current_setting('app.current_company_id', true));

-- Documents policies
CREATE POLICY "Users can view documents in their company"
    ON documents FOR SELECT
    USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can insert documents in their company"
    ON documents FOR INSERT
    WITH CHECK (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Users can delete documents in their company"
    ON documents FOR DELETE
    USING (company_id = current_setting('app.current_company_id', true));

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Users can view documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
