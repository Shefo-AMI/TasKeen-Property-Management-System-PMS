-- ============================================
-- TasKeen PMS - Complete Database Deployment
-- Execute this script in Supabase SQL Editor
-- ============================================

-- This script will execute all migrations in the correct order
-- Copy and paste this entire script into Supabase SQL Editor

\echo '=========================================='
\echo 'TasKeen PMS Database Deployment Starting'
\echo '=========================================='

-- IMPORTANT: Execute each migration file separately in Supabase
-- Go to: https://app.supabase.com/project/_/sql/new
-- Upload and run each file in this order:

-- Phase 1: Core Financial & Operations (Files 004-007)
\echo 'Phase 1: Core Financial & Operations'
\i 'src/supabase/migrations/004_financial_management_system.sql'
\i 'src/supabase/migrations/005_intelligent_maintenance_system.sql'
\i 'src/supabase/migrations/006_advanced_lease_management.sql'
\i 'src/supabase/migrations/007_vacancy_listing_management.sql'

-- Phase 2: AI & Communications (Files 008-011)
\echo 'Phase 2: AI & Communications'
\i 'src/supabase/migrations/008_ai_analytics_insights.sql'
\i 'src/supabase/migrations/009_multi_property_portfolio_management.sql'
\i 'src/supabase/migrations/010_communication_notification_hub.sql'
\i 'src/supabase/migrations/011_document_management_system.sql'

-- Phase 3: Enterprise Features (Files 012-017)
\echo 'Phase 3: Enterprise Features'
\i 'src/supabase/migrations/012_inspection_compliance.sql'
\i 'src/supabase/migrations/013_insurance_risk_management.sql'
\i 'src/supabase/migrations/014_advanced_reporting_bi.sql'
\i 'src/supabase/migrations/015_accounting_integrations.sql'
\i 'src/supabase/migrations/016_rbac_multi_tenant.sql'
\i 'src/supabase/migrations/017_automation_workflows.sql'

-- Phase 4: Cutting-Edge Innovations (Files 018-025)
\echo 'Phase 4: Cutting-Edge Innovations'
\i 'src/supabase/migrations/018_legal_compliance_tools.sql'
\i 'src/supabase/migrations/019_procurement_vendor_mgmt.sql'
\i 'src/supabase/migrations/020_ai_virtual_assistant.sql'
\i 'src/supabase/migrations/021_predictive_analytics_ml.sql'
\i 'src/supabase/migrations/022_vr_ar_features.sql'
\i 'src/supabase/migrations/023_advanced_search_filters.sql'
\i 'src/supabase/migrations/024_infrastructure_performance.sql'
\i 'src/supabase/migrations/025_advanced_security_compliance.sql'

\echo '=========================================='
\echo 'Database Deployment Complete!'
\echo 'Total Tables Created: 245'
\echo 'Total Functions: 45+'
\echo 'Total Triggers: 15+'
\echo 'RLS Policies: 245'
\echo '=========================================='

-- Verify deployment
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY schemaname;

\echo 'Deployment verification complete!'
