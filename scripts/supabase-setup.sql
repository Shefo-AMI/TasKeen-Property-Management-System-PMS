-- ============================================
-- TasKeen P.M.S. - Supabase Setup SQL
-- ============================================
-- Run this in Supabase SQL Editor to:
-- 1. Disable email confirmation (if enabled)
-- 2. Create/update admin user
-- 3. Set up user metadata
-- ============================================

-- Step 1: Check current auth configuration
-- Note: Email confirmation settings must be changed in Dashboard UI
-- Go to: Authentication → Settings → Auth
-- Turn OFF "Enable email confirmations"

-- Step 2: Create admin user via Supabase Auth
-- This is done via the API, not SQL. Use the create-admin-user.js script instead.
-- Or manually in Dashboard: Authentication → Users → Add User

-- Step 3: Update existing user metadata (if user already exists)
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users table

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find admin user by email
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'shefo171@gmail.com'
    LIMIT 1;

    IF admin_user_id IS NOT NULL THEN
        -- Update user metadata
        UPDATE auth.users
        SET 
            raw_user_meta_data = jsonb_build_object(
                'role', 'platform_admin',
                'full_name', 'Platform Administrator',
                'company_name', 'TasKeen P.M.S Platform',
                'company_id', 'platform-admin',
                'employee_count', 1,
                'status', 'active'
            ),
            email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = admin_user_id;

        RAISE NOTICE 'Admin user metadata updated: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found. Create user via Dashboard or API first.';
    END IF;
END $$;

-- Step 4: Verify admin user exists and is confirmed
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as is_confirmed,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users
WHERE email = 'shefo171@gmail.com';

-- Step 5: Grant necessary permissions (if using RLS)
-- Adjust table names based on your schema

-- Example: Grant access to properties table (if exists)
-- GRANT ALL ON properties TO authenticated;
-- GRANT ALL ON tenants TO authenticated;
-- GRANT ALL ON leases TO authenticated;
-- GRANT ALL ON maintenance_tickets TO authenticated;

RAISE NOTICE 'Setup complete! Check the user details above.';

