-- Document Management System
-- Centralized storage with OCR, version control, and cloud backup (S3, Dropbox, Google Drive)

-- Document Categories
CREATE TABLE IF NOT EXISTS document_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    parent_category_id UUID REFERENCES document_categories(id) ON DELETE CASCADE,
    description TEXT,
    icon TEXT,
    color_code TEXT,
    is_system_category BOOLEAN DEFAULT FALSE,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    document_name TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
    storage_provider TEXT NOT NULL CHECK (storage_provider IN ('supabase', 's3', 'dropbox', 'google_drive', 'azure')),
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    related_to_type TEXT CHECK (related_to_type IN (
        'property', 'tenant', 'lease', 'maintenance', 'vendor', 
        'owner', 'employee', 'invoice', 'expense', 'general'
    )),
    related_to_id UUID,
    related_to_name TEXT,
    tags TEXT[],
    description TEXT,
    version_number INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents_storage(id) ON DELETE SET NULL,
    is_latest_version BOOLEAN DEFAULT TRUE,
    expiry_date DATE,
    expiry_reminder_sent BOOLEAN DEFAULT FALSE,
    requires_signature BOOLEAN DEFAULT FALSE,
    signature_status TEXT CHECK (signature_status IN ('unsigned', 'partially_signed', 'fully_signed')),
    signatures JSONB DEFAULT '[]'::jsonb,
    ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed', 'not_applicable')),
    ocr_text TEXT,
    ocr_data JSONB,
    search_vector tsvector,
    access_level TEXT DEFAULT 'private' CHECK (access_level IN ('private', 'company', 'shared', 'public')),
    shared_with UUID[],
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Version History
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents_storage(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    changes_description TEXT,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Access Log (Audit Trail)
CREATE TABLE IF NOT EXISTS document_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents_storage(id) ON DELETE CASCADE,
    user_id UUID,
    user_name TEXT NOT NULL,
    user_type TEXT CHECK (user_type IN ('employee', 'tenant', 'owner', 'vendor', 'guest')),
    access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'edit', 'delete', 'share')),
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    location TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Sharing Links
CREATE TABLE IF NOT EXISTS document_sharing_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents_storage(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE,
    share_url TEXT NOT NULL,
    created_by TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    max_downloads INTEGER,
    download_count INTEGER DEFAULT 0,
    requires_password BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    allowed_emails TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Templates Library
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN (
        'lease_agreement', 'rental_application', 'move_in_checklist',
        'move_out_checklist', 'maintenance_request', 'notice_to_vacate',
        'rent_receipt', 'invoice', 'letter', 'form', 'custom'
    )),
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Document Checklists
CREATE TABLE IF NOT EXISTS compliance_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    checklist_name TEXT NOT NULL,
    checklist_type TEXT NOT NULL CHECK (checklist_type IN (
        'property_acquisition', 'tenant_onboarding', 'lease_signing',
        'annual_compliance', 'property_sale', 'custom'
    )),
    description TEXT,
    required_documents JSONB NOT NULL,
    optional_documents JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Checklist Progress
CREATE TABLE IF NOT EXISTS compliance_checklist_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    checklist_id UUID REFERENCES compliance_checklists(id) ON DELETE CASCADE,
    related_to_type TEXT NOT NULL CHECK (related_to_type IN ('property', 'tenant', 'lease', 'owner')),
    related_to_id UUID NOT NULL,
    total_items INTEGER NOT NULL,
    completed_items INTEGER DEFAULT 0,
    completion_percentage NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'overdue')),
    due_date DATE,
    completed_date DATE,
    items_status JSONB NOT NULL,
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cloud Backup Configuration
CREATE TABLE IF NOT EXISTS cloud_backup_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('s3', 'dropbox', 'google_drive', 'azure', 'onedrive')),
    provider_name TEXT NOT NULL,
    api_credentials_encrypted TEXT NOT NULL,
    bucket_name TEXT,
    folder_path TEXT,
    backup_frequency TEXT NOT NULL CHECK (backup_frequency IN ('real_time', 'hourly', 'daily', 'weekly')),
    backup_retention_days INTEGER DEFAULT 90,
    auto_backup_enabled BOOLEAN DEFAULT TRUE,
    backup_file_types TEXT[],
    exclude_categories UUID[],
    last_backup_at TIMESTAMPTZ,
    last_backup_status TEXT CHECK (last_backup_status IN ('success', 'failed', 'in_progress')),
    total_files_backed_up INTEGER DEFAULT 0,
    total_size_backed_up BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup History
CREATE TABLE IF NOT EXISTS backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID REFERENCES cloud_backup_configurations(id) ON DELETE CASCADE,
    backup_date TIMESTAMPTZ DEFAULT NOW(),
    backup_type TEXT CHECK (backup_type IN ('full', 'incremental', 'manual')),
    files_count INTEGER NOT NULL,
    total_size BIGINT NOT NULL,
    duration_seconds INTEGER,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    error_message TEXT,
    backup_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Expiry Tracking
CREATE TABLE IF NOT EXISTS document_expiry_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    document_id UUID REFERENCES documents_storage(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    reminder_days_before INTEGER[] DEFAULT ARRAY[30, 14, 7, 1],
    reminders_sent JSONB DEFAULT '[]'::jsonb,
    renewal_required BOOLEAN DEFAULT TRUE,
    renewal_status TEXT CHECK (renewal_status IN ('not_started', 'in_progress', 'completed', 'expired')),
    responsible_person TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OCR Processing Queue
CREATE TABLE IF NOT EXISTS ocr_processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents_storage(id) ON DELETE CASCADE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    ocr_provider TEXT CHECK (ocr_provider IN ('tesseract', 'google_vision', 'aws_textract', 'azure_ocr')),
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_duration_seconds INTEGER,
    extracted_text TEXT,
    confidence_score NUMERIC,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Indexing for Search
CREATE TABLE IF NOT EXISTS document_search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents_storage(id) ON DELETE CASCADE,
    indexed_content TEXT NOT NULL,
    metadata JSONB,
    last_indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital Signature Workflow
CREATE TABLE IF NOT EXISTS signature_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    document_id UUID REFERENCES documents_storage(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    signers JSONB NOT NULL,
    signing_order TEXT CHECK (signing_order IN ('sequential', 'parallel')),
    current_signer_index INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined', 'expired')),
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    signature_provider TEXT CHECK (signature_provider IN ('docusign', 'hellosign', 'adobe_sign', 'internal')),
    external_workflow_id TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Annotations
CREATE TABLE IF NOT EXISTS document_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents_storage(id) ON DELETE CASCADE,
    annotation_type TEXT CHECK (annotation_type IN ('comment', 'highlight', 'note', 'stamp')),
    page_number INTEGER,
    position JSONB,
    content TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_categories_company ON document_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents_storage(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents_storage(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_related ON documents_storage(related_to_type, related_to_id);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents_storage(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents_storage USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents_storage USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_document ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_user ON document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sharing_links_token ON document_sharing_links(share_token);
CREATE INDEX IF NOT EXISTS idx_document_templates_company ON document_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checklists_company ON compliance_checklists(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_progress_checklist ON compliance_checklist_progress(checklist_id);
CREATE INDEX IF NOT EXISTS idx_cloud_backup_company ON cloud_backup_configurations(company_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_config ON backup_history(configuration_id);
CREATE INDEX IF NOT EXISTS idx_document_expiry_company ON document_expiry_tracking(company_id);
CREATE INDEX IF NOT EXISTS idx_document_expiry_date ON document_expiry_tracking(expiry_date);
CREATE INDEX IF NOT EXISTS idx_ocr_queue_status ON ocr_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_signature_workflows_document ON signature_workflows(document_id);

-- Enable RLS
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sharing_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_backup_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_expiry_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_annotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access to document categories" ON document_categories
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to documents" ON documents_storage
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to document versions" ON document_versions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM documents_storage WHERE documents_storage.id = document_versions.document_id 
        AND documents_storage.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to access log" ON document_access_log
    FOR ALL USING (EXISTS (
        SELECT 1 FROM documents_storage WHERE documents_storage.id = document_access_log.document_id 
        AND documents_storage.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Public access to sharing links" ON document_sharing_links
    FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Company access to document templates" ON document_templates
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to compliance checklists" ON compliance_checklists
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to checklist progress" ON compliance_checklist_progress
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to cloud backup config" ON cloud_backup_configurations
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to backup history" ON backup_history
    FOR ALL USING (EXISTS (
        SELECT 1 FROM cloud_backup_configurations WHERE cloud_backup_configurations.id = backup_history.configuration_id 
        AND cloud_backup_configurations.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to document expiry" ON document_expiry_tracking
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to OCR queue" ON ocr_processing_queue
    FOR ALL USING (EXISTS (
        SELECT 1 FROM documents_storage WHERE documents_storage.id = ocr_processing_queue.document_id 
        AND documents_storage.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to search index" ON document_search_index
    FOR ALL USING (EXISTS (
        SELECT 1 FROM documents_storage WHERE documents_storage.id = document_search_index.document_id 
        AND documents_storage.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to signature workflows" ON signature_workflows
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to annotations" ON document_annotations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM documents_storage WHERE documents_storage.id = document_annotations.document_id 
        AND documents_storage.company_id = current_setting('app.current_company_id', true)
    ));

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.document_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.ocr_text, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_vector
    BEFORE INSERT OR UPDATE ON documents_storage
    FOR EACH ROW
    EXECUTE FUNCTION update_document_search_vector();

-- Function to create document version
CREATE OR REPLACE FUNCTION create_document_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (OLD.storage_path != NEW.storage_path OR OLD.file_size != NEW.file_size) THEN
        -- Mark old version as not latest
        UPDATE documents_storage
        SET is_latest_version = FALSE
        WHERE parent_document_id = NEW.id OR id = NEW.id;
        
        -- Create version record
        INSERT INTO document_versions (
            document_id,
            version_number,
            file_size,
            storage_path,
            storage_url,
            uploaded_by
        ) VALUES (
            NEW.id,
            NEW.version_number,
            NEW.file_size,
            NEW.storage_path,
            NEW.storage_url,
            NEW.uploaded_by
        );
        
        -- Increment version number
        NEW.version_number := NEW.version_number + 1;
        NEW.is_latest_version := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_document_version
    BEFORE UPDATE ON documents_storage
    FOR EACH ROW
    EXECUTE FUNCTION create_document_version();

-- Function to log document access
CREATE OR REPLACE FUNCTION log_document_access(
    p_document_id UUID,
    p_user_id UUID,
    p_user_name TEXT,
    p_user_type TEXT,
    p_access_type TEXT
)
RETURNS void AS $$
BEGIN
    INSERT INTO document_access_log (
        document_id,
        user_id,
        user_name,
        user_type,
        access_type
    ) VALUES (
        p_document_id,
        p_user_id,
        p_user_name,
        p_user_type,
        p_access_type
    );
    
    -- Update document stats
    IF p_access_type = 'view' THEN
        UPDATE documents_storage
        SET view_count = view_count + 1, last_accessed_at = NOW()
        WHERE id = p_document_id;
    ELSIF p_access_type = 'download' THEN
        UPDATE documents_storage
        SET download_count = download_count + 1, last_accessed_at = NOW()
        WHERE id = p_document_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check expiring documents
CREATE OR REPLACE FUNCTION check_expiring_documents()
RETURNS void AS $$
DECLARE
    doc_record RECORD;
    reminder_day INTEGER;
BEGIN
    FOR doc_record IN 
        SELECT * FROM document_expiry_tracking
        WHERE expiry_date IS NOT NULL
        AND renewal_status != 'completed'
    LOOP
        FOREACH reminder_day IN ARRAY doc_record.reminder_days_before
        LOOP
            IF doc_record.expiry_date = CURRENT_DATE + reminder_day THEN
                -- Send reminder notification
                INSERT INTO notification_queue (
                    company_id,
                    recipient_type,
                    recipient_name,
                    channel,
                    subject,
                    message,
                    priority
                ) VALUES (
                    doc_record.company_id,
                    'employee',
                    doc_record.responsible_person,
                    'email',
                    'Document Expiry Reminder',
                    format('Document expires in %s days. Please renew.', reminder_day),
                    'high'
                );
                
                -- Update reminders sent
                UPDATE document_expiry_tracking
                SET reminders_sent = reminders_sent || jsonb_build_object(
                    'date', CURRENT_DATE,
                    'days_before', reminder_day
                )
                WHERE id = doc_record.id;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to process OCR queue
CREATE OR REPLACE FUNCTION process_ocr_queue()
RETURNS void AS $$
DECLARE
    ocr_record RECORD;
BEGIN
    FOR ocr_record IN 
        SELECT * FROM ocr_processing_queue
        WHERE status = 'pending'
        ORDER BY priority DESC, created_at ASC
        LIMIT 10
    LOOP
        UPDATE ocr_processing_queue
        SET status = 'processing', processing_started_at = NOW()
        WHERE id = ocr_record.id;
        
        -- Here would integrate with actual OCR service
        -- For now, just mark as completed
        UPDATE ocr_processing_queue
        SET 
            status = 'completed',
            processing_completed_at = NOW(),
            processing_duration_seconds = EXTRACT(EPOCH FROM (NOW() - processing_started_at))::INTEGER
        WHERE id = ocr_record.id;
        
        -- Update document OCR status
        UPDATE documents_storage
        SET ocr_status = 'completed'
        WHERE id = ocr_record.document_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
