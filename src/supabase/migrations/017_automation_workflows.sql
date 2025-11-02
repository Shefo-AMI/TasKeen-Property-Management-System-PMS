-- Advanced Automation & Workflows System
-- Visual workflow builder, trigger-based automation, conditional logic

-- Workflow Templates
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT,
    template_name TEXT NOT NULL,
    template_category TEXT CHECK (template_category IN (
        'lease_management', 'payment_processing', 'maintenance', 
        'tenant_onboarding', 'compliance', 'communication', 'custom'
    )),
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        'manual', 'scheduled', 'event_based', 'condition_based'
    )),
    trigger_config JSONB NOT NULL,
    workflow_steps JSONB NOT NULL,
    is_system_template BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Workflows
CREATE TABLE IF NOT EXISTS active_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    template_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL,
    workflow_name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_config JSONB NOT NULL,
    workflow_definition JSONB NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed', 'cancelled')),
    last_executed_at TIMESTAMPTZ,
    next_execution_at TIMESTAMPTZ,
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Executions
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES active_workflows(id) ON DELETE CASCADE,
    execution_number INTEGER NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    trigger_data JSONB,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    steps_completed INTEGER DEFAULT 0,
    steps_failed INTEGER DEFAULT 0,
    execution_log JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Steps
CREATE TABLE IF NOT EXISTS workflow_step_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN (
        'action', 'condition', 'delay', 'approval', 'notification', 'api_call', 'custom'
    )),
    step_config JSONB NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    duration_seconds INTEGER
);

-- Automation Rules
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN (
        'lease_expiry', 'late_payment', 'maintenance_request',
        'move_out', 'document_expiry', 'inspection_due', 'custom'
    )),
    trigger_condition JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Tasks
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    task_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'recurring')),
    cron_expression TEXT,
    scheduled_time TIMESTAMPTZ,
    recurrence_pattern TEXT,
    task_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    total_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    approval_type TEXT NOT NULL CHECK (approval_type IN (
        'expense', 'lease', 'vendor_payment', 'maintenance', 'document', 'custom'
    )),
    approvers JSONB NOT NULL,
    approval_sequence TEXT CHECK (approval_sequence IN ('sequential', 'parallel', 'any')),
    escalation_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Requests
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    request_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    requested_by TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    current_approver TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approval_history JSONB DEFAULT '[]'::jsonb,
    comments TEXT,
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    rejected_at TIMESTAMPTZ,
    rejected_by TEXT,
    rejection_reason TEXT
);

-- Conditional Logic Rules
CREATE TABLE IF NOT EXISTS conditional_logic_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    condition_type TEXT CHECK (condition_type IN ('if', 'if_else', 'switch', 'loop')),
    conditions JSONB NOT NULL,
    true_actions JSONB NOT NULL,
    false_actions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Performance Metrics
CREATE TABLE IF NOT EXISTS workflow_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    workflow_id UUID REFERENCES active_workflows(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    average_duration_seconds NUMERIC,
    min_duration_seconds INTEGER,
    max_duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workflow_id, metric_date)
);

-- Create indexes
CREATE INDEX idx_workflow_templates_company ON workflow_templates(company_id);
CREATE INDEX idx_active_workflows_company ON active_workflows(company_id);
CREATE INDEX idx_active_workflows_next_execution ON active_workflows(next_execution_at) WHERE status = 'active';
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_automation_rules_company ON automation_rules(company_id);
CREATE INDEX idx_scheduled_tasks_company ON scheduled_tasks(company_id);
CREATE INDEX idx_scheduled_tasks_next_run ON scheduled_tasks(next_run_at) WHERE is_active = TRUE;
CREATE INDEX idx_approval_workflows_company ON approval_workflows(company_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);

-- Enable RLS
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditional_logic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON workflow_templates FOR ALL USING (company_id = current_setting('app.current_company_id', true) OR company_id IS NULL);
CREATE POLICY "Company access" ON active_workflows FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON automation_rules FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON scheduled_tasks FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON approval_workflows FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON approval_requests FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON conditional_logic_rules FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON workflow_performance_metrics FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to execute workflow
CREATE OR REPLACE FUNCTION execute_workflow(p_workflow_id UUID, p_trigger_data JSONB)
RETURNS UUID AS $$
DECLARE
    execution_id UUID;
    workflow_record RECORD;
BEGIN
    SELECT * INTO workflow_record FROM active_workflows WHERE id = p_workflow_id;
    
    IF NOT FOUND OR workflow_record.status != 'active' THEN
        RETURN NULL;
    END IF;
    
    INSERT INTO workflow_executions (
        workflow_id, execution_number, trigger_data,
        total_steps, status
    ) VALUES (
        p_workflow_id,
        workflow_record.total_executions + 1,
        p_trigger_data,
        jsonb_array_length(workflow_record.workflow_definition->'steps'),
        'running'
    ) RETURNING id INTO execution_id;
    
    UPDATE active_workflows
    SET 
        last_executed_at = NOW(),
        total_executions = total_executions + 1
    WHERE id = p_workflow_id;
    
    RETURN execution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process scheduled tasks
CREATE OR REPLACE FUNCTION process_scheduled_tasks()
RETURNS void AS $$
DECLARE
    task_record RECORD;
BEGIN
    FOR task_record IN 
        SELECT * FROM scheduled_tasks
        WHERE is_active = TRUE AND next_run_at <= NOW()
    LOOP
        UPDATE scheduled_tasks
        SET 
            last_run_at = NOW(),
            next_run_at = CASE 
                WHEN schedule_type = 'recurring' THEN NOW() + INTERVAL '1 day'
                ELSE NULL
            END,
            total_runs = total_runs + 1
        WHERE id = task_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert default workflow templates
INSERT INTO workflow_templates (template_name, template_category, trigger_type, trigger_config, workflow_steps, is_system_template) VALUES
('Lease Expiry Notification', 'lease_management', 'scheduled', '{"days_before": 30}'::jsonb, '{"steps": [{"type": "notification", "action": "send_email"}]}'::jsonb, TRUE),
('Late Payment Reminder', 'payment_processing', 'event_based', '{"event": "payment_overdue"}'::jsonb, '{"steps": [{"type": "notification", "action": "send_sms"}, {"type": "action", "action": "add_late_fee"}]}'::jsonb, TRUE),
('Maintenance Auto-Assign', 'maintenance', 'event_based', '{"event": "maintenance_request_created"}'::jsonb, '{"steps": [{"type": "action", "action": "assign_vendor"}]}'::jsonb, TRUE);
