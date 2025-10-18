-- Taskeen P.M.S. Database Schema
-- Complete database structure for Project Management System

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS task_time_entries CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS customer_profiles CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS taskeen_pms_messages CASCADE;

-- Customer Profiles (extends auth.users)
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    company_name TEXT,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
    subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    subscription_id TEXT,
    stripe_customer_id TEXT,
    paypal_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
    payment_provider TEXT CHECK (payment_provider IN ('stripe', 'paypal')),
    external_subscription_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    color TEXT DEFAULT '#8B5CF6',
    start_date DATE,
    end_date DATE,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Members (Team Management)
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    assigned_to_name TEXT,
    due_date DATE,
    position INTEGER DEFAULT 0,
    labels TEXT[],
    created_by UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Tracking (Pro Feature)
CREATE TABLE task_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Roles
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Contact Form Messages
CREATE TABLE taskeen_pms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON task_time_entries(user_id);

-- Enable Row Level Security
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE taskeen_pms_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_profiles
CREATE POLICY "Users can view own profile" ON customer_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON customer_profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for project_members
CREATE POLICY "Users can view members of their projects" ON project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_members.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add members to their projects" ON project_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove members from their projects" ON project_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks of their projects" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in their projects" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks in their projects" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks in their projects" ON tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- RLS Policies for time entries
CREATE POLICY "Users can view time entries for their projects" ON task_time_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks 
            JOIN projects ON projects.id = tasks.project_id
            WHERE tasks.id = task_time_entries.task_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create time entries" ON task_time_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time entries" ON task_time_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time entries" ON task_time_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policies (only admins can access)
CREATE POLICY "Only admins can view admin roles" ON admin_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles 
            WHERE admin_roles.user_id = auth.uid() 
            AND admin_roles.is_super_admin = true
        )
    );

CREATE POLICY "Only admins can view messages" ON taskeen_pms_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles 
            WHERE admin_roles.user_id = auth.uid() 
            AND admin_roles.is_super_admin = true
        )
    );

CREATE POLICY "Anyone can insert messages" ON taskeen_pms_messages
    FOR INSERT WITH CHECK (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON task_time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create customer profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customer_profiles (id, email, full_name, plan_type, subscription_status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'free',
        'inactive'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to check project limits for free users
CREATE OR REPLACE FUNCTION check_project_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_plan TEXT;
    project_count INTEGER;
BEGIN
    -- Get user's plan
    SELECT plan_type INTO user_plan
    FROM customer_profiles
    WHERE id = NEW.user_id;

    -- If free plan, check project count
    IF user_plan = 'free' THEN
        SELECT COUNT(*) INTO project_count
        FROM projects
        WHERE user_id = NEW.user_id AND is_archived = false;

        IF project_count >= 3 THEN
            RAISE EXCEPTION 'Free plan limited to 3 active projects. Upgrade to Pro for unlimited projects.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce project limits
CREATE TRIGGER enforce_project_limit
    BEFORE INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION check_project_limit();

-- Function to check team member limits for free users
CREATE OR REPLACE FUNCTION check_team_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_plan TEXT;
    member_count INTEGER;
BEGIN
    -- Get project owner's plan
    SELECT cp.plan_type INTO user_plan
    FROM customer_profiles cp
    JOIN projects p ON p.user_id = cp.id
    WHERE p.id = NEW.project_id;

    -- If free plan, check member count
    IF user_plan = 'free' THEN
        SELECT COUNT(*) INTO member_count
        FROM project_members
        WHERE project_id = NEW.project_id;

        IF member_count >= 5 THEN
            RAISE EXCEPTION 'Free plan limited to 5 team members per project. Upgrade to Pro for unlimited members.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce team limits
CREATE TRIGGER enforce_team_limit
    BEFORE INSERT ON project_members
    FOR EACH ROW EXECUTE FUNCTION check_team_limit();
