-- Smart Financial Management System
-- Comprehensive financial tracking with UAE tax compliance

-- Financial Accounts (Bank accounts, cash accounts, etc.)
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('bank', 'cash', 'credit_card', 'investment', 'other')),
    account_number TEXT,
    bank_name TEXT,
    currency TEXT NOT NULL DEFAULT 'AED',
    current_balance NUMERIC NOT NULL DEFAULT 0,
    opening_balance NUMERIC NOT NULL DEFAULT 0,
    opening_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rent Collections
CREATE TABLE IF NOT EXISTS rent_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    amount_due NUMERIC NOT NULL,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    payment_date DATE,
    due_date DATE NOT NULL,
    late_fee NUMERIC DEFAULT 0,
    late_fee_applied_date DATE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'credit_card', 'online', 'other')),
    transaction_reference TEXT,
    account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'late', 'overdue')),
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    unit_number TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'maintenance', 'repairs', 'utilities', 'insurance', 'property_tax', 
        'management_fee', 'marketing', 'legal', 'accounting', 'supplies', 
        'landscaping', 'cleaning', 'security', 'other'
    )),
    subcategory TEXT,
    vendor_name TEXT NOT NULL,
    vendor_id UUID,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'AED',
    expense_date DATE NOT NULL,
    payment_date DATE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'credit_card', 'online', 'other')),
    account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    invoice_number TEXT,
    invoice_url TEXT,
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    tax_deductible BOOLEAN DEFAULT TRUE,
    vat_amount NUMERIC DEFAULT 0,
    vat_rate NUMERIC DEFAULT 5.0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('rent', 'late_fee', 'utility', 'service', 'other')),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    amount_paid NUMERIC DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'AED',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled')),
    payment_terms TEXT,
    notes TEXT,
    terms_conditions TEXT,
    invoice_url TEXT,
    sent_date DATE,
    paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    tax_rate NUMERIC DEFAULT 5.0,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Deposits
CREATE TABLE IF NOT EXISTS security_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
    deposit_amount NUMERIC NOT NULL,
    deposit_date DATE NOT NULL,
    interest_rate NUMERIC DEFAULT 0,
    interest_earned NUMERIC DEFAULT 0,
    deductions JSONB DEFAULT '[]'::jsonb,
    total_deductions NUMERIC DEFAULT 0,
    refund_amount NUMERIC DEFAULT 0,
    refund_date DATE,
    refund_method TEXT,
    status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'partial_refund', 'refunded', 'forfeited')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owner Distributions
CREATE TABLE IF NOT EXISTS owner_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    owner_email TEXT,
    distribution_period_start DATE NOT NULL,
    distribution_period_end DATE NOT NULL,
    total_income NUMERIC NOT NULL DEFAULT 0,
    total_expenses NUMERIC NOT NULL DEFAULT 0,
    net_income NUMERIC NOT NULL DEFAULT 0,
    management_fee NUMERIC DEFAULT 0,
    management_fee_percentage NUMERIC DEFAULT 0,
    distribution_amount NUMERIC NOT NULL,
    distribution_date DATE,
    payment_method TEXT,
    transaction_reference TEXT,
    account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
    statement_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    budget_name TEXT NOT NULL,
    budget_year INTEGER NOT NULL,
    budget_period TEXT NOT NULL CHECK (budget_period IN ('monthly', 'quarterly', 'yearly')),
    category TEXT NOT NULL,
    budgeted_amount NUMERIC NOT NULL,
    actual_amount NUMERIC DEFAULT 0,
    variance NUMERIC DEFAULT 0,
    variance_percentage NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax Reports (UAE VAT Compliance)
CREATE TABLE IF NOT EXISTS tax_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('vat_return', 'income_tax', 'property_tax', 'annual_summary')),
    tax_period_start DATE NOT NULL,
    tax_period_end DATE NOT NULL,
    total_income NUMERIC NOT NULL DEFAULT 0,
    taxable_income NUMERIC NOT NULL DEFAULT 0,
    total_expenses NUMERIC NOT NULL DEFAULT 0,
    deductible_expenses NUMERIC NOT NULL DEFAULT 0,
    vat_collected NUMERIC DEFAULT 0,
    vat_paid NUMERIC DEFAULT 0,
    net_vat NUMERIC DEFAULT 0,
    tax_liability NUMERIC DEFAULT 0,
    report_data JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    submitted_date DATE,
    approved_date DATE,
    report_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash Flow Projections
CREATE TABLE IF NOT EXISTS cash_flow_projections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    projection_date DATE NOT NULL,
    projected_income NUMERIC NOT NULL DEFAULT 0,
    projected_expenses NUMERIC NOT NULL DEFAULT 0,
    projected_net_cash_flow NUMERIC NOT NULL DEFAULT 0,
    actual_income NUMERIC DEFAULT 0,
    actual_expenses NUMERIC DEFAULT 0,
    actual_net_cash_flow NUMERIC DEFAULT 0,
    variance NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Reconciliations
CREATE TABLE IF NOT EXISTS bank_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
    reconciliation_date DATE NOT NULL,
    statement_balance NUMERIC NOT NULL,
    book_balance NUMERIC NOT NULL,
    outstanding_deposits NUMERIC DEFAULT 0,
    outstanding_checks NUMERIC DEFAULT 0,
    reconciled_balance NUMERIC NOT NULL,
    difference NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'discrepancy')),
    reconciled_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Transactions (General Ledger)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer', 'adjustment')),
    category TEXT NOT NULL,
    account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'AED',
    description TEXT NOT NULL,
    reference_type TEXT CHECK (reference_type IN ('rent', 'expense', 'invoice', 'deposit', 'distribution', 'other')),
    reference_id UUID,
    payment_method TEXT,
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciliation_id UUID REFERENCES bank_reconciliations(id) ON DELETE SET NULL,
    created_by TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_accounts_company ON financial_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_rent_collections_company ON rent_collections(company_id);
CREATE INDEX IF NOT EXISTS idx_rent_collections_tenant ON rent_collections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_collections_property ON rent_collections(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_collections_status ON rent_collections(status);
CREATE INDEX IF NOT EXISTS idx_rent_collections_due_date ON rent_collections(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_company ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_property ON expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_security_deposits_company ON security_deposits(company_id);
CREATE INDEX IF NOT EXISTS idx_security_deposits_tenant ON security_deposits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_owner_distributions_company ON owner_distributions(company_id);
CREATE INDEX IF NOT EXISTS idx_owner_distributions_property ON owner_distributions(property_id);
CREATE INDEX IF NOT EXISTS idx_budgets_company ON budgets(company_id);
CREATE INDEX IF NOT EXISTS idx_budgets_property ON budgets(property_id);
CREATE INDEX IF NOT EXISTS idx_tax_reports_company ON tax_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_company ON cash_flow_projections(company_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_property ON cash_flow_projections(property_id);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliations_account ON bank_reconciliations(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company ON financial_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);

-- Enable RLS
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (company-based access)
CREATE POLICY "Company access to financial accounts" ON financial_accounts
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to rent collections" ON rent_collections
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to expenses" ON expenses
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to invoices" ON invoices
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to invoice line items" ON invoice_line_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id 
        AND invoices.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to security deposits" ON security_deposits
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to owner distributions" ON owner_distributions
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to budgets" ON budgets
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to tax reports" ON tax_reports
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to cash flow projections" ON cash_flow_projections
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to bank reconciliations" ON bank_reconciliations
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to financial transactions" ON financial_transactions
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

-- Trigger for automatic late fee calculation
CREATE OR REPLACE FUNCTION calculate_late_fees()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'late' OR NEW.status = 'overdue' THEN
        IF NEW.late_fee = 0 THEN
            -- Get late fee from lease
            SELECT 
                CASE 
                    WHEN CURRENT_DATE > (NEW.due_date + INTERVAL '1 day' * COALESCE(l.late_fee_grace_period, 0))
                    THEN l.late_fee_amount
                    ELSE 0
                END INTO NEW.late_fee
            FROM leases l
            WHERE l.id = NEW.lease_id;
            
            NEW.late_fee_applied_date = CURRENT_DATE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_late_fees
    BEFORE UPDATE ON rent_collections
    FOR EACH ROW
    EXECUTE FUNCTION calculate_late_fees();

-- Function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE financial_accounts
        SET current_balance = current_balance + 
            CASE 
                WHEN NEW.transaction_type = 'income' THEN NEW.amount
                WHEN NEW.transaction_type = 'expense' THEN -NEW.amount
                ELSE 0
            END
        WHERE id = NEW.account_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE financial_accounts
        SET current_balance = current_balance - 
            CASE 
                WHEN OLD.transaction_type = 'income' THEN OLD.amount
                WHEN OLD.transaction_type = 'expense' THEN -OLD.amount
                ELSE 0
            END
        WHERE id = OLD.account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT OR DELETE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_account_balance();
