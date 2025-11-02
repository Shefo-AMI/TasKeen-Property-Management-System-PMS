-- AI Virtual Assistant System
-- 24/7 chatbot, NLP, multi-language, voice integration

-- AI Chatbot Conversations
CREATE TABLE IF NOT EXISTS ai_chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    user_type TEXT CHECK (user_type IN ('tenant', 'owner', 'employee', 'visitor', 'guest')),
    user_id UUID,
    user_name TEXT,
    channel TEXT CHECK (channel IN ('web', 'mobile', 'sms', 'whatsapp', 'voice', 'alexa', 'google_assistant')),
    language TEXT DEFAULT 'en',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    total_messages INTEGER DEFAULT 0,
    sentiment_score NUMERIC,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    escalated_to_human BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_time_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_chatbot_conversations(id) ON DELETE CASCADE,
    message_number INTEGER NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'bot', 'agent')),
    message_text TEXT NOT NULL,
    message_intent TEXT,
    entities_detected JSONB,
    confidence_score NUMERIC,
    language TEXT DEFAULT 'en',
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score NUMERIC,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Intents & Training Data
CREATE TABLE IF NOT EXISTS ai_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent_name TEXT NOT NULL UNIQUE,
    intent_category TEXT CHECK (intent_category IN (
        'payment', 'maintenance', 'lease', 'general_inquiry', 
        'complaint', 'amenity', 'emergency', 'other'
    )),
    description TEXT,
    training_phrases TEXT[] NOT NULL,
    response_templates TEXT[] NOT NULL,
    requires_authentication BOOLEAN DEFAULT FALSE,
    can_auto_resolve BOOLEAN DEFAULT TRUE,
    escalation_threshold NUMERIC DEFAULT 0.5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Entities
CREATE TABLE IF NOT EXISTS ai_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name TEXT NOT NULL UNIQUE,
    entity_type TEXT CHECK (entity_type IN ('property', 'unit', 'date', 'amount', 'person', 'custom')),
    synonyms TEXT[],
    patterns JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automated Actions from Chat
CREATE TABLE IF NOT EXISTS ai_automated_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_chatbot_conversations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'create_ticket', 'send_payment_reminder', 'schedule_showing',
        'create_maintenance_request', 'update_profile', 'send_document', 'other'
    )),
    action_data JSONB NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_resource_id UUID,
    created_resource_type TEXT
);

-- Multi-Language Support
CREATE TABLE IF NOT EXISTS ai_language_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_language TEXT NOT NULL DEFAULT 'en',
    target_language TEXT NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    context TEXT,
    translation_quality NUMERIC,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_language, target_language, source_text)
);

-- Voice Assistant Integration
CREATE TABLE IF NOT EXISTS voice_assistant_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('alexa', 'google_assistant', 'siri', 'custom')),
    user_id UUID,
    device_id TEXT,
    session_id TEXT NOT NULL,
    conversation_id UUID REFERENCES ai_chatbot_conversations(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    total_interactions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sentiment Analysis Results
CREATE TABLE IF NOT EXISTS sentiment_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_chatbot_conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
    overall_sentiment TEXT CHECK (overall_sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
    sentiment_score NUMERIC NOT NULL,
    emotions_detected JSONB,
    keywords JSONB,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    requires_escalation BOOLEAN DEFAULT FALSE,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Learning & Feedback
CREATE TABLE IF NOT EXISTS ai_learning_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_chatbot_conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
    feedback_type TEXT CHECK (feedback_type IN ('helpful', 'not_helpful', 'incorrect', 'offensive')),
    user_comment TEXT,
    intent_was_correct BOOLEAN,
    suggested_intent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Human Agent Escalations
CREATE TABLE IF NOT EXISTS agent_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_chatbot_conversations(id) ON DELETE CASCADE,
    escalation_reason TEXT NOT NULL,
    escalated_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_agent_id UUID,
    assigned_agent_name TEXT,
    agent_joined_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5)
);

-- AI Performance Metrics
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_conversations INTEGER DEFAULT 0,
    auto_resolved_conversations INTEGER DEFAULT 0,
    escalated_conversations INTEGER DEFAULT 0,
    average_resolution_time_seconds INTEGER,
    average_confidence_score NUMERIC,
    average_sentiment_score NUMERIC,
    average_satisfaction_rating NUMERIC,
    total_messages INTEGER DEFAULT 0,
    languages_used JSONB,
    top_intents JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, metric_date)
);

-- Chatbot Configuration
CREATE TABLE IF NOT EXISTS chatbot_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL UNIQUE,
    bot_name TEXT DEFAULT 'TasKeen Assistant',
    bot_avatar_url TEXT,
    welcome_message TEXT,
    fallback_message TEXT,
    escalation_message TEXT,
    supported_languages TEXT[] DEFAULT ARRAY['en', 'ar'],
    default_language TEXT DEFAULT 'en',
    confidence_threshold NUMERIC DEFAULT 0.7,
    auto_escalation_enabled BOOLEAN DEFAULT TRUE,
    business_hours JSONB,
    after_hours_message TEXT,
    max_conversation_duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_chatbot_conversations_company ON ai_chatbot_conversations(company_id);
CREATE INDEX idx_chatbot_conversations_session ON ai_chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_conversations_user ON ai_chatbot_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation ON ai_chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON ai_chat_messages(created_at);
CREATE INDEX idx_ai_intents_category ON ai_intents(intent_category);
CREATE INDEX idx_automated_actions_conversation ON ai_automated_actions(conversation_id);
CREATE INDEX idx_sentiment_analysis_conversation ON sentiment_analysis_results(conversation_id);
CREATE INDEX idx_ai_performance_company ON ai_performance_metrics(company_id, metric_date);

-- Enable RLS
ALTER TABLE ai_chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_automated_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_language_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_configuration ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON ai_chatbot_conversations FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Public access" ON ai_intents FOR SELECT USING (true);
CREATE POLICY "Public access" ON ai_entities FOR SELECT USING (true);
CREATE POLICY "Public access" ON ai_language_translations FOR SELECT USING (true);
CREATE POLICY "Company access" ON voice_assistant_sessions FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON ai_performance_metrics FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON chatbot_configuration FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to analyze sentiment
CREATE OR REPLACE FUNCTION analyze_message_sentiment(p_message_text TEXT)
RETURNS JSONB AS $$
DECLARE
    sentiment_result JSONB;
    positive_keywords TEXT[] := ARRAY['great', 'excellent', 'thank', 'perfect', 'love', 'happy'];
    negative_keywords TEXT[] := ARRAY['bad', 'terrible', 'hate', 'angry', 'disappointed', 'worst'];
    score NUMERIC := 0;
BEGIN
    -- Simple keyword-based sentiment (in production, use ML service)
    IF p_message_text ~* ANY(positive_keywords) THEN
        score := 0.8;
    ELSIF p_message_text ~* ANY(negative_keywords) THEN
        score := -0.8;
    ELSE
        score := 0;
    END IF;
    
    sentiment_result := jsonb_build_object(
        'score', score,
        'sentiment', CASE 
            WHEN score > 0.5 THEN 'positive'
            WHEN score < -0.5 THEN 'negative'
            ELSE 'neutral'
        END
    );
    
    RETURN sentiment_result;
END;
$$ LANGUAGE plpgsql;

-- Insert default intents
INSERT INTO ai_intents (intent_name, intent_category, training_phrases, response_templates, can_auto_resolve) VALUES
('payment_inquiry', 'payment', 
 ARRAY['when is rent due', 'how much do I owe', 'payment status', 'check my balance'],
 ARRAY['Your rent is due on {due_date}. Current balance: {amount}'],
 TRUE),
('maintenance_request', 'maintenance',
 ARRAY['something is broken', 'need repair', 'maintenance issue', 'fix my'],
 ARRAY['I can help you create a maintenance request. What needs to be fixed?'],
 TRUE),
('lease_question', 'lease',
 ARRAY['lease terms', 'when does lease end', 'renewal', 'lease agreement'],
 ARRAY['Your lease ends on {lease_end_date}. Would you like to discuss renewal?'],
 TRUE);
