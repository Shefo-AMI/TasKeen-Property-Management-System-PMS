-- ALZAHI PROPERTY MANAGEMENT & GENERAL MAINTENANCE
-- User Accounts Setup
-- Run this AFTER users are created via Supabase Auth

-- This migration assumes users have been created via Supabase Auth signUp
-- You'll need to run the signUp for each user first, then update their metadata

-- Example commands to run in Supabase SQL Editor AFTER creating users via auth:

-- Update user metadata for Nour (Manager/Admin)
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_build_object(
--   'full_name', 'Nour Al-Zahi',
--   'company_id', 'alzahi-property-management',
--   'company_name', 'ALZAHI PROPERTY MANAGEMENT & GENERAL MAINTENANCE',
--   'role', 'company_admin',
--   'department', 'Management',
--   'status', 'active'
-- )
-- WHERE email = 'nour@al-zahi.ae';

-- Update user metadata for Mawia (Manager/Admin)
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_build_object(
--   'full_name', 'Mawia Al-Zahi',
--   'company_id', 'alzahi-property-management',
--   'company_name', 'ALZAHI PROPERTY MANAGEMENT & GENERAL MAINTENANCE',
--   'role', 'company_admin',
--   'department', 'Management',
--   'status', 'active'
-- )
-- WHERE email = 'mawia@al-zahi.ae';

-- Update user metadata for Tareq (Maintenance Staff)
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_build_object(
--   'full_name', 'Tareq Al-Zahi',
--   'company_id', 'alzahi-property-management',
--   'company_name', 'ALZAHI PROPERTY MANAGEMENT & GENERAL MAINTENANCE',
--   'role', 'maintenance_staff',
--   'department', 'Maintenance',
--   'status', 'active'
-- )
-- WHERE email = 'tareq@al-zahi.ae';

-- Update user metadata for Ayham (Maintenance Staff)
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_build_object(
--   'full_name', 'Ayham Al-Zahi',
--   'company_id', 'alzahi-property-management',
--   'company_name', 'ALZAHI PROPERTY MANAGEMENT & GENERAL MAINTENANCE',
--   'role', 'maintenance_staff',
--   'department', 'Maintenance',
--   'status', 'active'
-- )
-- WHERE email = 'ayham@al-zahi.ae';

-- Create properties table if not exists
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address_street TEXT,
  address_building TEXT,
  address_area TEXT,
  address_city TEXT,
  address_country TEXT,
  owner_name TEXT,
  owner_contact TEXT,
  total_units INTEGER DEFAULT 0,
  apartments_count INTEGER DEFAULT 0,
  shops_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  year_built INTEGER,
  floors INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert ALZAHI properties
INSERT INTO properties (
  id,
  company_id,
  name,
  type,
  address_street,
  address_building,
  address_area,
  address_city,
  address_country,
  owner_name,
  total_units,
  apartments_count,
  shops_count,
  status
) VALUES
(
  'almeknas-146',
  'alzahi-property-management',
  'ALMEKNAS BUILDING 146',
  'mixed',
  'ALMEKNAS',
  '146',
  'ALZAHIYAH',
  'ABU DHABI',
  'UAE',
  '(TO BE UPDATED)',
  105,
  97,
  8,
  'active'
),
(
  'al-sharjah-346',
  'alzahi-property-management',
  'AL SHARJAH 346',
  'mixed',
  'AL SHARJAH',
  '346',
  'ALZAHIYAH',
  'ABU DHABI',
  'UAE',
  'MR. SAIF RASHED AL NUIMI',
  51,
  48,
  3,
  'active'
),
(
  'al-bahiyah',
  'alzahi-property-management',
  'AL BAHIYAH BUILDING',
  'residential',
  'AL BAHIYAH',
  '',
  'ALZAHIYAH',
  'ABU DHABI',
  'UAE',
  'MR. SAIF RASHED AL NUIMI',
  5,
  5,
  0,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  owner_name = EXCLUDED.owner_name,
  total_units = EXCLUDED.total_units,
  apartments_count = EXCLUDED.apartments_count,
  shops_count = EXCLUDED.shops_count,
  updated_at = NOW();

-- Enable RLS on properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policy for properties
CREATE POLICY "Users can view own company properties" ON properties
  FOR SELECT USING (
    company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')
  );

CREATE POLICY "Admins can manage properties" ON properties
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('company_admin', 'platform_admin')
  );

-- Create buildings table if not exists (for the Buildings & Units system)
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  total_units INTEGER DEFAULT 0,
  occupied_units INTEGER DEFAULT 0,
  vacant_units INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert ALZAHI buildings
INSERT INTO buildings (
  company_id,
  name,
  address,
  city,
  total_units,
  vacant_units
) VALUES
(
  'alzahi-property-management',
  'ALMEKNAS BUILDING 146',
  'ALMEKNAS STREET, ALZAHIYAH',
  'ABU DHABI',
  105,
  105
),
(
  'alzahi-property-management',
  'AL SHARJAH 346',
  'AL SHARJAH STREET, ALZAHIYAH',
  'ABU DHABI',
  51,
  51
),
(
  'alzahi-property-management',
  'AL BAHIYAH BUILDING',
  'AL BAHIYAH STREET, ALZAHIYAH',
  'ABU DHABI',
  5,
  5
)
ON CONFLICT DO NOTHING;

-- Enable RLS on buildings
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Create policies for buildings
CREATE POLICY "Users can view own company buildings" ON buildings
  FOR SELECT USING (
    company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')
  );

CREATE POLICY "Admins can manage buildings" ON buildings
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('company_admin', 'platform_admin')
  );

COMMENT ON TABLE properties IS 'ALZAHI Property Management - Properties Data';
COMMENT ON TABLE buildings IS 'ALZAHI Property Management - Buildings Data';
