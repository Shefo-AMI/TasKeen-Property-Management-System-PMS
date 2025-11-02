-- Communication & Notification Hub
-- Multi-channel notifications with Twilio, SendGrid, WhatsApp integration

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN (
        'rent_reminder', 'lease_expiry', 'maintenance_update', 
        'payment_confirmation', 'violation_notice', 'general_announcement',
        'inspection_reminder', 'document_request', 'welcome_message', 'custom'
    )),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'whatsapp', 'in_app')),
    subject TEXT,
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    language TEXT DEFAULT 'en',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Queue
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('tenant', 'owner', 'employee', 'vendor', 'custom')),
    recipient_id UUID,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    recipient_phone TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'whatsapp', 'in_app')),
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    subject TEXT,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'scheduled', 'sending', 'sent', 'delivered', 
        'read', 'failed', 'cancelled'
    )),
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    metadata JSONB DEFAULT '{}'::jsonb,
    external_message_id TEXT,
    cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication History
CREATE TABLE IF NOT EXISTS communication_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    communication_type TEXT NOT NULL CHECK (communication_type IN (
        'notification', 'message', 'email', 'sms', 'call', 'meeting', 'note'
    )),
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    from_type TEXT CHECK (from_type IN ('system', 'employee', 'tenant', 'owner', 'vendor')),
    from_id UUID,
    from_name TEXT,
    to_type TEXT CHECK (to_type IN ('tenant', 'owner', 'employee', 'vendor', 'group')),
    to_id UUID,
    to_name TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    channel TEXT CHECK (channel IN ('email', 'sms', 'push', 'whatsapp', 'phone', 'in_person', 'in_app')),
    related_to_type TEXT CHECK (related_to_type IN ('property', 'lease', 'maintenance', 'payment', 'general')),
    related_to_id UUID,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_important BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automated Reminders Configuration
CREATE TABLE IF NOT EXISTS automated_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    reminder_name TEXT NOT NULL,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN (
        'rent_due', 'lease_expiry', 'inspection_due', 'maintenance_scheduled',
        'document_expiry', 'payment_overdue', 'lease_renewal', 'custom'
    )),
    trigger_condition TEXT NOT NULL,
    trigger_days_before INTEGER,
    trigger_days_after INTEGER,
    recurrence TEXT CHECK (recurrence IN ('once', 'daily', 'weekly', 'monthly')),
    channels TEXT[] NOT NULL,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    target_audience TEXT NOT NULL CHECK (target_audience IN ('tenants', 'owners', 'employees', 'vendors', 'custom')),
    filter_criteria JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    next_trigger_at TIMESTAMPTZ,
    total_sent INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bulk Messaging Campaigns
CREATE TABLE IF NOT EXISTS bulk_messaging_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT CHECK (campaign_type IN ('announcement', 'marketing', 'emergency', 'survey', 'reminder')),
    channels TEXT[] NOT NULL,
    target_audience TEXT NOT NULL CHECK (target_audience IN ('all_tenants', 'all_owners', 'specific_properties', 'specific_group', 'custom')),
    target_properties UUID[],
    target_recipients UUID[],
    recipient_count INTEGER,
    subject TEXT,
    message TEXT NOT NULL,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    delivery_rate NUMERIC,
    read_rate NUMERIC,
    response_rate NUMERIC,
    total_cost NUMERIC DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Broadcast System
CREATE TABLE IF NOT EXISTS emergency_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    emergency_type TEXT NOT NULL CHECK (emergency_type IN (
        'fire', 'flood', 'gas_leak', 'power_outage', 'security_threat',
        'natural_disaster', 'building_evacuation', 'other'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    affected_properties UUID[] NOT NULL,
    affected_units TEXT[],
    channels_used TEXT[] NOT NULL,
    broadcast_at TIMESTAMPTZ DEFAULT NOW(),
    recipients_count INTEGER,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    acknowledged_count INTEGER DEFAULT 0,
    acknowledgment_required BOOLEAN DEFAULT FALSE,
    instructions TEXT,
    contact_info TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipient Preferences
CREATE TABLE IF NOT EXISTS recipient_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('tenant', 'owner', 'employee')),
    recipient_id UUID NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    preferred_channel TEXT CHECK (preferred_channel IN ('email', 'sms', 'push', 'whatsapp')),
    preferred_language TEXT DEFAULT 'en',
    notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily_digest', 'weekly_digest')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    notification_types JSONB DEFAULT '{}'::jsonb,
    opted_out_types TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recipient_type, recipient_id)
);

-- Scheduled Announcements
CREATE TABLE IF NOT EXISTS scheduled_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    announcement_title TEXT NOT NULL,
    announcement_body TEXT NOT NULL,
    announcement_type TEXT CHECK (announcement_type IN (
        'maintenance', 'event', 'policy_change', 'amenity_update', 'general'
    )),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'tenants', 'owners', 'specific_properties')),
    target_properties UUID[],
    channels TEXT[] NOT NULL,
    publish_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'published', 'expired', 'cancelled')),
    views_count INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-Language Support
CREATE TABLE IF NOT EXISTS translation_strings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    string_key TEXT NOT NULL,
    language TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(string_key, language)
);

-- Delivery Tracking & Analytics
CREATE TABLE IF NOT EXISTS notification_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    channel TEXT NOT NULL,
    template_type TEXT,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_read INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    delivery_rate NUMERIC,
    read_rate NUMERIC,
    average_delivery_time_seconds INTEGER,
    total_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, date, channel, template_type)
);

-- Integration Configuration
CREATE TABLE IF NOT EXISTS communication_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    integration_type TEXT NOT NULL CHECK (integration_type IN (
        'twilio', 'sendgrid', 'mailgun', 'aws_ses', 'whatsapp_business', 'firebase_fcm'
    )),
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    sender_id TEXT,
    sender_email TEXT,
    sender_phone TEXT,
    webhook_url TEXT,
    configuration JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    daily_limit INTEGER,
    monthly_limit INTEGER,
    current_daily_usage INTEGER DEFAULT 0,
    current_monthly_usage INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Read Receipts
CREATE TABLE IF NOT EXISTS notification_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notification_queue(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    device_type TEXT,
    ip_address INET,
    user_agent TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_company ON notification_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_notification_queue_company ON notification_queue(company_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_communication_history_company ON communication_history(company_id);
CREATE INDEX IF NOT EXISTS idx_communication_history_to ON communication_history(to_type, to_id);
CREATE INDEX IF NOT EXISTS idx_communication_history_from ON communication_history(from_type, from_id);
CREATE INDEX IF NOT EXISTS idx_automated_reminders_company ON automated_reminders(company_id);
CREATE INDEX IF NOT EXISTS idx_automated_reminders_active ON automated_reminders(is_active, next_trigger_at);
CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_company ON bulk_messaging_campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_emergency_broadcasts_company ON emergency_broadcasts(company_id);
CREATE INDEX IF NOT EXISTS idx_recipient_preferences_recipient ON recipient_notification_preferences(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_announcements_company ON scheduled_announcements(company_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_announcements_publish ON scheduled_announcements(publish_date, status);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_company ON notification_analytics(company_id, date);

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_messaging_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipient_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_strings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access to notification templates" ON notification_templates
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to notification queue" ON notification_queue
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to communication history" ON communication_history
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to automated reminders" ON automated_reminders
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to bulk campaigns" ON bulk_messaging_campaigns
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to emergency broadcasts" ON emergency_broadcasts
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to recipient preferences" ON recipient_notification_preferences
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to scheduled announcements" ON scheduled_announcements
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Public access to translations" ON translation_strings FOR SELECT USING (true);

CREATE POLICY "Company access to notification analytics" ON notification_analytics
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to communication integrations" ON communication_integrations
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Access to own read receipts" ON notification_read_receipts
    FOR ALL USING (EXISTS (
        SELECT 1 FROM notification_queue WHERE notification_queue.id = notification_read_receipts.notification_id 
        AND notification_queue.company_id = current_setting('app.current_company_id', true)
    ));

-- Function to process notification queue
CREATE OR REPLACE FUNCTION process_notification_queue()
RETURNS void AS $$
DECLARE
    notification_record RECORD;
BEGIN
    FOR notification_record IN 
        SELECT * FROM notification_queue
        WHERE status = 'pending'
        AND (scheduled_for IS NULL OR scheduled_for <= NOW())
        AND retry_count < max_retries
        ORDER BY priority DESC, created_at ASC
        LIMIT 100
    LOOP
        -- Update status to sending
        UPDATE notification_queue
        SET status = 'sending', updated_at = NOW()
        WHERE id = notification_record.id;
        
        -- Here would integrate with actual sending services (Twilio, SendGrid, etc.)
        -- For now, just mark as sent
        UPDATE notification_queue
        SET 
            status = 'sent',
            sent_at = NOW(),
            updated_at = NOW()
        WHERE id = notification_record.id;
        
        -- Log to communication history
        INSERT INTO communication_history (
            company_id,
            communication_type,
            direction,
            from_type,
            from_name,
            to_type,
            to_name,
            subject,
            message,
            channel
        ) VALUES (
            notification_record.company_id,
            'notification',
            'outbound',
            'system',
            'TasKeen PMS',
            notification_record.recipient_type,
            notification_record.recipient_name,
            notification_record.subject,
            notification_record.message,
            notification_record.channel
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger automated reminders
CREATE OR REPLACE FUNCTION trigger_automated_reminders()
RETURNS void AS $$
DECLARE
    reminder_record RECORD;
    target_count INTEGER;
BEGIN
    FOR reminder_record IN 
        SELECT * FROM automated_reminders
        WHERE is_active = TRUE
        AND (next_trigger_at IS NULL OR next_trigger_at <= NOW())
    LOOP
        -- Process based on reminder type
        IF reminder_record.reminder_type = 'rent_due' THEN
            -- Find tenants with rent due
            INSERT INTO notification_queue (
                company_id,
                recipient_type,
                recipient_id,
                recipient_name,
                recipient_email,
                channel,
                template_id,
                subject,
                message,
                priority
            )
            SELECT 
                reminder_record.company_id,
                'tenant',
                t.id,
                t.first_name || ' ' || t.last_name,
                t.email,
                unnest(reminder_record.channels),
                reminder_record.template_id,
                'Rent Payment Reminder',
                'Your rent payment is due soon. Please ensure timely payment.',
                'high'
            FROM tenants t
            JOIN rent_collections rc ON rc.tenant_id = t.id
            WHERE t.company_id = reminder_record.company_id
            AND rc.due_date = CURRENT_DATE + reminder_record.trigger_days_before
            AND rc.status = 'pending';
            
            GET DIAGNOSTICS target_count = ROW_COUNT;
        END IF;
        
        -- Update reminder stats
        UPDATE automated_reminders
        SET 
            last_triggered_at = NOW(),
            next_trigger_at = CASE 
                WHEN recurrence = 'daily' THEN NOW() + INTERVAL '1 day'
                WHEN recurrence = 'weekly' THEN NOW() + INTERVAL '7 days'
                WHEN recurrence = 'monthly' THEN NOW() + INTERVAL '1 month'
                ELSE NULL
            END,
            total_sent = total_sent + COALESCE(target_count, 0),
            updated_at = NOW()
        WHERE id = reminder_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update notification analytics
CREATE OR REPLACE FUNCTION update_notification_analytics()
RETURNS void AS $$
BEGIN
    INSERT INTO notification_analytics (
        company_id,
        date,
        channel,
        template_type,
        total_sent,
        total_delivered,
        total_read,
        total_failed,
        delivery_rate,
        read_rate
    )
    SELECT 
        company_id,
        CURRENT_DATE,
        channel,
        'general',
        COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'read')),
        COUNT(*) FILTER (WHERE status IN ('delivered', 'read')),
        COUNT(*) FILTER (WHERE status = 'read'),
        COUNT(*) FILTER (WHERE status = 'failed'),
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status IN ('delivered', 'read'))::NUMERIC / COUNT(*) * 100)
            ELSE 0
        END,
        CASE 
            WHEN COUNT(*) FILTER (WHERE status IN ('delivered', 'read')) > 0 THEN 
                (COUNT(*) FILTER (WHERE status = 'read')::NUMERIC / COUNT(*) FILTER (WHERE status IN ('delivered', 'read')) * 100)
            ELSE 0
        END
    FROM notification_queue
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY company_id, channel
    ON CONFLICT (company_id, date, channel, template_type) 
    DO UPDATE SET
        total_sent = EXCLUDED.total_sent,
        total_delivered = EXCLUDED.total_delivered,
        total_read = EXCLUDED.total_read,
        total_failed = EXCLUDED.total_failed,
        delivery_rate = EXCLUDED.delivery_rate,
        read_rate = EXCLUDED.read_rate;
END;
$$ LANGUAGE plpgsql;
