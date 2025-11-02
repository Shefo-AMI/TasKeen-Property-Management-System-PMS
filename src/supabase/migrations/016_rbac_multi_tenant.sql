-- Role-Based Access Control (RBAC) & Multi-Tenant Architecture
-- Granular permissions, custom roles, white-label support

-- Companies (Multi-Tenant)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    legal_name TEXT,
    company_type TEXT CHECK (company_type IN ('agency', 'landlord', 'franchise', 'reseller')),
    tax_id TEXT,
    registration_number TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'UAE',
    timezone TEXT DEFAULT 'Asia/Dubai',
    currency TEXT DEFAULT 'AED',
    subscription_plan TEXT CHECK (subscription_plan IN ('free', 'basic', 'professional', 'enterprise', 'custom')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial')),
    trial_ends_at DATE,
    subscription_started_at DATE,
    max_properties INTEGER,
    max_users INTEGER,
    features_enabled JSONB DEFAULT '{}'::jsonb,
    custom_domain TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#8B5CF6',
    secondary_color TEXT DEFAULT '#10B981',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    role_name TEXT NOT NULL,
    role_code TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, role_code)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    department TEXT,
    job_title TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    password_changed_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_code TEXT NOT NULL UNIQUE,
    permission_name TEXT NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('view', 'create', 'edit', 'delete', 'approve', 'export')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by TEXT,
    UNIQUE(role_id, permission_id)
);

-- User Activity Logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    module TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IP Whitelist
CREATE TABLE IF NOT EXISTS ip_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    ip_address INET NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password Policies
CREATE TABLE IF NOT EXISTS password_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL UNIQUE,
    min_length INTEGER DEFAULT 8,
    require_uppercase BOOLEAN DEFAULT TRUE,
    require_lowercase BOOLEAN DEFAULT TRUE,
    require_numbers BOOLEAN DEFAULT TRUE,
    require_special_chars BOOLEAN DEFAULT TRUE,
    expiry_days INTEGER DEFAULT 90,
    prevent_reuse_count INTEGER DEFAULT 5,
    max_failed_attempts INTEGER DEFAULT 5,
    lockout_duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    key_name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    api_secret_hash TEXT NOT NULL,
    permissions TEXT[],
    rate_limit_per_hour INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    webhook_name TEXT NOT NULL,
    endpoint_url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    retry_count INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    last_triggered_at TIMESTAMPTZ,
    total_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Logs
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_companies_code ON companies(company_code);
CREATE INDEX idx_roles_company ON roles(company_id);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created ON user_activity_logs(created_at);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_api_keys_company ON api_keys(company_id);
CREATE INDEX idx_webhooks_company ON webhooks(company_id);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON roles FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON users FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Public access" ON permissions FOR SELECT USING (true);
CREATE POLICY "Company access" ON user_activity_logs FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON ip_whitelist FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON password_policies FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON api_keys FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON webhooks FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to check permission
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_permission_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM users u
        JOIN role_permissions rp ON rp.role_id = u.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = p_user_id
        AND p.permission_code = p_permission_code
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_activity_logs (
        company_id, user_id, action_type, module, resource_type, resource_id, description
    ) VALUES (
        NEW.company_id,
        current_setting('app.current_user_id', true)::UUID,
        TG_OP,
        TG_TABLE_NAME,
        TG_TABLE_NAME,
        NEW.id,
        format('%s %s', TG_OP, TG_TABLE_NAME)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert default permissions
INSERT INTO permissions (permission_code, permission_name, module, action) VALUES
('properties.view', 'View Properties', 'properties', 'view'),
('properties.create', 'Create Properties', 'properties', 'create'),
('properties.edit', 'Edit Properties', 'properties', 'edit'),
('properties.delete', 'Delete Properties', 'properties', 'delete'),
('tenants.view', 'View Tenants', 'tenants', 'view'),
('tenants.create', 'Create Tenants', 'tenants', 'create'),
('tenants.edit', 'Edit Tenants', 'tenants', 'edit'),
('leases.view', 'View Leases', 'leases', 'view'),
('leases.create', 'Create Leases', 'leases', 'create'),
('leases.approve', 'Approve Leases', 'leases', 'approve'),
('financial.view', 'View Financial Data', 'financial', 'view'),
('financial.edit', 'Edit Financial Data', 'financial', 'edit'),
('financial.export', 'Export Financial Data', 'financial', 'export'),
('reports.view', 'View Reports', 'reports', 'view'),
('reports.export', 'Export Reports', 'reports', 'export'),
('settings.view', 'View Settings', 'settings', 'view'),
('settings.edit', 'Edit Settings', 'settings', 'edit'),
('users.view', 'View Users', 'users', 'view'),
('users.create', 'Create Users', 'users', 'create'),
('users.edit', 'Edit Users', 'users', 'edit'),
('users.delete', 'Delete Users', 'users', 'delete');
