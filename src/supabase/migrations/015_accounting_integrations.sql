-- Accounting Integrations System
-- QuickBooks-like features, UAE tax compliance, multi-entity accounting

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN (
        'asset', 'liability', 'equity', 'revenue', 'expense', 'cost_of_goods_sold'
    )),
    account_subtype TEXT,
    parent_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    description TEXT,
    currency TEXT DEFAULT 'AED',
    is_active BOOLEAN DEFAULT TRUE,
    is_system_account BOOLEAN DEFAULT FALSE,
    tax_applicable BOOLEAN DEFAULT FALSE,
    default_tax_rate NUMERIC DEFAULT 5.0,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, account_code)
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    entry_number TEXT NOT NULL,
    entry_date DATE NOT NULL,
    entry_type TEXT CHECK (entry_type IN ('standard', 'adjusting', 'closing', 'reversing')),
    reference_type TEXT CHECK (reference_type IN ('invoice', 'payment', 'expense', 'rent', 'deposit', 'manual')),
    reference_id UUID,
    description TEXT NOT NULL,
    total_debit NUMERIC NOT NULL DEFAULT 0,
    total_credit NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
    posted_by TEXT,
    posted_at TIMESTAMPTZ,
    void_reason TEXT,
    voided_by TEXT,
    voided_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, entry_number)
);

-- Journal Entry Lines
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    debit_amount NUMERIC DEFAULT 0,
    credit_amount NUMERIC DEFAULT 0,
    description TEXT,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    cost_center TEXT,
    tax_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    iban TEXT,
    swift_code TEXT,
    currency TEXT DEFAULT 'AED',
    account_type TEXT CHECK (account_type IN ('checking', 'savings', 'credit_card')),
    current_balance NUMERIC DEFAULT 0,
    available_balance NUMERIC DEFAULT 0,
    last_reconciled_date DATE,
    last_reconciled_balance NUMERIC,
    chart_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Transactions
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('debit', 'credit', 'fee', 'interest')),
    amount NUMERIC NOT NULL,
    description TEXT NOT NULL,
    reference_number TEXT,
    payee_payer TEXT,
    category TEXT,
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciled_date DATE,
    matched_journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    imported_from TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Reconciliation
CREATE TABLE IF NOT EXISTS bank_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
    reconciliation_date DATE NOT NULL,
    statement_date DATE NOT NULL,
    opening_balance NUMERIC NOT NULL,
    closing_balance NUMERIC NOT NULL,
    statement_balance NUMERIC NOT NULL,
    difference NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'approved')),
    reconciled_transactions UUID[],
    unreconciled_transactions UUID[],
    adjustments JSONB,
    notes TEXT,
    reconciled_by TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    category_code TEXT,
    parent_category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    chart_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    is_tax_deductible BOOLEAN DEFAULT TRUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, category_name)
);

-- UAE Tax Reports
CREATE TABLE IF NOT EXISTS uae_tax_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('vat_return', 'corporate_tax', 'annual_summary')),
    tax_period_start DATE NOT NULL,
    tax_period_end DATE NOT NULL,
    filing_deadline DATE,
    total_revenue NUMERIC NOT NULL DEFAULT 0,
    taxable_revenue NUMERIC NOT NULL DEFAULT 0,
    exempt_revenue NUMERIC DEFAULT 0,
    output_vat NUMERIC NOT NULL DEFAULT 0,
    input_vat NUMERIC NOT NULL DEFAULT 0,
    net_vat_payable NUMERIC NOT NULL DEFAULT 0,
    adjustments NUMERIC DEFAULT 0,
    penalties NUMERIC DEFAULT 0,
    total_amount_due NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'paid')),
    submission_date DATE,
    payment_date DATE,
    trn_number TEXT,
    report_data JSONB,
    report_file_url TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Centers
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    cost_center_code TEXT NOT NULL,
    cost_center_name TEXT NOT NULL,
    description TEXT,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    manager_name TEXT,
    budget_amount NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, cost_center_code)
);

-- Budget Allocations
CREATE TABLE IF NOT EXISTS budget_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    cost_center_id UUID REFERENCES cost_centers(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    period_type TEXT CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
    period_number INTEGER,
    budgeted_amount NUMERIC NOT NULL,
    actual_amount NUMERIC DEFAULT 0,
    variance NUMERIC DEFAULT 0,
    variance_percentage NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-Entity Configuration
CREATE TABLE IF NOT EXISTS accounting_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_type TEXT CHECK (entity_type IN ('company', 'division', 'property', 'portfolio')),
    legal_name TEXT,
    tax_id TEXT,
    registration_number TEXT,
    currency TEXT DEFAULT 'AED',
    fiscal_year_end TEXT,
    parent_entity_id UUID REFERENCES accounting_entities(id) ON DELETE SET NULL,
    consolidate_financials BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automated Journal Entry Rules
CREATE TABLE IF NOT EXISTS auto_journal_entry_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    trigger_event TEXT NOT NULL CHECK (trigger_event IN (
        'rent_payment', 'expense_recorded', 'invoice_created', 
        'deposit_received', 'refund_issued', 'fee_charged'
    )),
    conditions JSONB,
    debit_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    credit_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    description_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Period Locks
CREATE TABLE IF NOT EXISTS financial_period_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    lock_type TEXT CHECK (lock_type IN ('soft', 'hard')),
    locked_by TEXT NOT NULL,
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    unlock_reason TEXT,
    unlocked_by TEXT,
    unlocked_at TIMESTAMPTZ,
    is_locked BOOLEAN DEFAULT TRUE,
    UNIQUE(company_id, period_start, period_end)
);

-- Accounting Integration Mappings
CREATE TABLE IF NOT EXISTS accounting_integration_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    integration_type TEXT CHECK (integration_type IN ('quickbooks', 'xero', 'sage', 'custom')),
    local_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    external_account_id TEXT NOT NULL,
    external_account_name TEXT,
    sync_direction TEXT CHECK (sync_direction IN ('import', 'export', 'bidirectional')),
    last_synced_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_chart_accounts_company ON chart_of_accounts(company_id);
CREATE INDEX idx_chart_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX idx_journal_entries_company ON journal_entries(company_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_bank_accounts_company ON bank_accounts(company_id);
CREATE INDEX idx_bank_transactions_account ON bank_transactions(bank_account_id);
CREATE INDEX idx_bank_reconciliations_account ON bank_reconciliations(bank_account_id);
CREATE INDEX idx_expense_categories_company ON expense_categories(company_id);
CREATE INDEX idx_uae_tax_reports_company ON uae_tax_reports(company_id);
CREATE INDEX idx_uae_tax_reports_property ON uae_tax_reports(property_id);
CREATE INDEX idx_cost_centers_company ON cost_centers(company_id);
CREATE INDEX idx_budget_allocations_company ON budget_allocations(company_id);

-- Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE uae_tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_journal_entry_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_period_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_integration_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access" ON chart_of_accounts FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON journal_entries FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON bank_accounts FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON bank_reconciliations FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON expense_categories FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON uae_tax_reports FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON cost_centers FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON budget_allocations FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON accounting_entities FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON auto_journal_entry_rules FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON financial_period_locks FOR ALL USING (company_id = current_setting('app.current_company_id', true));
CREATE POLICY "Company access" ON accounting_integration_mappings FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Function to create automated journal entry
CREATE OR REPLACE FUNCTION create_auto_journal_entry(
    p_company_id TEXT,
    p_trigger_event TEXT,
    p_reference_id UUID,
    p_amount NUMERIC,
    p_description TEXT
)
RETURNS UUID AS $$
DECLARE
    rule_record RECORD;
    entry_id UUID;
BEGIN
    SELECT * INTO rule_record
    FROM auto_journal_entry_rules
    WHERE company_id = p_company_id
    AND trigger_event = p_trigger_event
    AND is_active = TRUE
    LIMIT 1;
    
    IF FOUND THEN
        INSERT INTO journal_entries (
            company_id, entry_number, entry_date, entry_type,
            reference_type, reference_id, description,
            total_debit, total_credit, status, created_by
        ) VALUES (
            p_company_id,
            'JE-' || to_char(NOW(), 'YYYYMMDD') || '-' || gen_random_uuid()::text,
            CURRENT_DATE, 'standard', p_trigger_event, p_reference_id,
            p_description, p_amount, p_amount, 'posted', 'system'
        ) RETURNING id INTO entry_id;
        
        INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, debit_amount, description)
        VALUES (entry_id, 1, rule_record.debit_account_id, p_amount, p_description);
        
        INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, credit_amount, description)
        VALUES (entry_id, 2, rule_record.credit_account_id, p_amount, p_description);
        
        UPDATE auto_journal_entry_rules
        SET execution_count = execution_count + 1, last_executed_at = NOW()
        WHERE id = rule_record.id;
        
        RETURN entry_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate UAE VAT
CREATE OR REPLACE FUNCTION calculate_uae_vat(
    p_company_id TEXT,
    p_property_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSONB AS $$
DECLARE
    output_vat NUMERIC := 0;
    input_vat NUMERIC := 0;
    result JSONB;
BEGIN
    SELECT COALESCE(SUM(amount * 0.05), 0) INTO output_vat
    FROM rent_collections
    WHERE company_id = p_company_id
    AND (p_property_id IS NULL OR property_id = p_property_id)
    AND payment_date BETWEEN p_start_date AND p_end_date
    AND status = 'paid';
    
    SELECT COALESCE(SUM(amount * 0.05), 0) INTO input_vat
    FROM expenses
    WHERE company_id = p_company_id
    AND (p_property_id IS NULL OR property_id = p_property_id)
    AND expense_date BETWEEN p_start_date AND p_end_date
    AND status = 'paid';
    
    result := jsonb_build_object(
        'output_vat', output_vat,
        'input_vat', input_vat,
        'net_vat_payable', output_vat - input_vat,
        'period_start', p_start_date,
        'period_end', p_end_date
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
