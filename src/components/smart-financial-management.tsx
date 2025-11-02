import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, FileText, 
  CreditCard, Wallet, PieChart, BarChart3, Download, Plus,
  Receipt, Building, Users, AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { supabase } from "../utils/supabase";

interface FinancialAccount {
  id: string;
  account_name: string;
  account_type: string;
  currency: string;
  current_balance: number;
  status: string;
}

interface RentCollection {
  id: string;
  tenant_id: string;
  property_id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  payment_date?: string;
  late_fee: number;
  status: string;
}

interface Expense {
  id: string;
  category: string;
  vendor_name: string;
  description: string;
  amount: number;
  expense_date: string;
  status: string;
}

interface TaxReport {
  id: string;
  report_type: string;
  tax_period_start: string;
  tax_period_end: string;
  total_income: number;
  total_expenses: number;
  vat_collected: number;
  vat_paid: number;
  net_vat: number;
  status: string;
}

export function SmartFinancialManagement({ companyId }: { companyId: string }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [rentCollections, setRentCollections] = useState<RentCollection[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Financial Summary Stats
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    pendingRent: 0,
    overdueRent: 0,
    vatCollected: 0,
    vatPaid: 0,
  });

  useEffect(() => {
    loadFinancialData();
  }, [companyId]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Set company context
      await supabase.rpc('set_config', {
        setting: 'app.current_company_id',
        value: companyId
      });

      // Load accounts
      const { data: accountsData } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      // Load rent collections
      const { data: rentData } = await supabase
        .from('rent_collections')
        .select('*')
        .eq('company_id', companyId)
        .order('due_date', { ascending: false })
        .limit(50);

      // Load expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('company_id', companyId)
        .order('expense_date', { ascending: false })
        .limit(50);

      // Load tax reports
      const { data: taxData } = await supabase
        .from('tax_reports')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      setAccounts(accountsData || []);
      setRentCollections(rentData || []);
      setExpenses(expensesData || []);
      setTaxReports(taxData || []);

      // Calculate summary
      calculateFinancialSummary(rentData || [], expensesData || [], taxData || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialSummary = (
    rents: RentCollection[], 
    expensesList: Expense[], 
    taxes: TaxReport[]
  ) => {
    const totalIncome = rents
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.amount_paid, 0);

    const totalExpenses = expensesList
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingRent = rents
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount_due, 0);

    const overdueRent = rents
      .filter(r => r.status === 'overdue' || r.status === 'late')
      .reduce((sum, r) => sum + (r.amount_due - r.amount_paid), 0);

    const latestTax = taxes[0];
    const vatCollected = latestTax?.vat_collected || 0;
    const vatPaid = latestTax?.vat_paid || 0;

    setFinancialSummary({
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      pendingRent,
      overdueRent,
      vatCollected,
      vatPaid,
    });
  };

  const formatCurrency = (amount: number, currency: string = 'AED') => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const generateVATReport = async () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const { data, error } = await supabase
        .from('tax_reports')
        .insert({
          company_id: companyId,
          report_type: 'vat_return',
          tax_period_start: startDate.toISOString().split('T')[0],
          tax_period_end: endDate.toISOString().split('T')[0],
          total_income: financialSummary.totalIncome,
          total_expenses: financialSummary.totalExpenses,
          vat_collected: financialSummary.totalIncome * 0.05,
          vat_paid: financialSummary.totalExpenses * 0.05,
          net_vat: (financialSummary.totalIncome - financialSummary.totalExpenses) * 0.05,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('VAT report generated successfully');
      loadFinancialData();
    } catch (error) {
      console.error('Error generating VAT report:', error);
      toast.error('Failed to generate VAT report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Smart Financial Management 💰</h1>
          <p className="text-muted-foreground">
            Comprehensive financial tracking with UAE VAT compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateVATReport()}>
            <FileText className="mr-2 h-4 w-4" />
            Generate VAT Report
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialSummary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialSummary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(financialSummary.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((financialSummary.netIncome / financialSummary.totalIncome) * 100).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Rent</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(financialSummary.overdueRent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending: {formatCurrency(financialSummary.pendingRent)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="rent">Rent Collection</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="tax">Tax Reports</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Rent Collections</CardTitle>
                <CardDescription>Latest rent payments received</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {rentCollections.slice(0, 10).map((rent) => (
                      <div key={rent.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            rent.status === 'paid' ? 'bg-green-100' :
                            rent.status === 'overdue' ? 'bg-red-100' : 'bg-yellow-100'
                          }`}>
                            <Receipt className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Tenant {rent.tenant_id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(rent.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(rent.amount_due)}</p>
                          <Badge variant={
                            rent.status === 'paid' ? 'default' :
                            rent.status === 'overdue' ? 'destructive' : 'secondary'
                          }>
                            {rent.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Latest property expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {expenses.slice(0, 10).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{expense.vendor_name}</p>
                            <p className="text-sm text-muted-foreground">{expense.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(expense.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* UAE VAT Summary */}
          <Card>
            <CardHeader>
              <CardTitle>UAE VAT Summary (5%)</CardTitle>
              <CardDescription>Current period VAT calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">VAT Collected (Output)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialSummary.vatCollected)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">VAT Paid (Input)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(financialSummary.vatPaid)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Net VAT Payable</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(financialSummary.vatCollected - financialSummary.vatPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Financial Accounts</CardTitle>
                  <CardDescription>Manage your bank and cash accounts</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{account.account_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{account.account_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(account.current_balance, account.currency)}
                      </p>
                      <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                        {account.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="rent">
          <Card>
            <CardHeader>
              <CardTitle>Rent Collection Management</CardTitle>
              <CardDescription>Track and manage rent payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Rent collection interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Tracking</CardTitle>
              <CardDescription>Monitor property expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Expense tracking interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>UAE Tax Reports</CardTitle>
              <CardDescription>VAT returns and tax compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxReports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold capitalize">{report.report_type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.tax_period_start).toLocaleDateString()} - {new Date(report.tax_period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{report.status}</Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Income</p>
                        <p className="font-semibold">{formatCurrency(report.total_income)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">VAT Collected</p>
                        <p className="font-semibold">{formatCurrency(report.vat_collected)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net VAT</p>
                        <p className="font-semibold">{formatCurrency(report.net_vat)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate comprehensive financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Profit & Loss Statement</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <PieChart className="h-6 w-6" />
                  <span>Cash Flow Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Budget vs Actual</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Owner Distribution Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
