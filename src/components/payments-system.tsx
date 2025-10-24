import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Calendar } from './ui/calendar'
import { 
  CreditCard, 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Download, 
  Upload, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Receipt,
  Calendar as CalendarIcon,
  Users,
  Home,
  Mail,
  Phone,
  Send,
  Bell,
  TrendingUp,
  TrendingDown,
  Banknote,
  Wallet,
  Building2,
  FileText,
  Repeat,
  Archive,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: string
  status: string
}

interface PaymentsSystemProps {
  user: User
  accessToken: string | null
}

interface Payment {
  id: string
  tenantId: string
  tenantName: string
  propertyId: string
  propertyName: string
  unitId: string
  unitNumber: string
  amount: number
  type: 'rent' | 'deposit' | 'utility' | 'fee' | 'maintenance' | 'penalty'
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed'
  dueDate: string
  paidDate?: string
  method?: 'bank_transfer' | 'credit_card' | 'cash' | 'cheque' | 'online'
  reference?: string
  notes?: string
  invoiceId?: string
  recurringPayment: boolean
  frequency?: 'monthly' | 'quarterly' | 'annually'
  nextDueDate?: string
  createdAt: string
  lateFee?: number
  discountApplied?: number
}

interface PaymentMethod {
  id: string
  tenantId: string
  type: 'bank_account' | 'credit_card'
  isDefault: boolean
  details: {
    last4?: string
    bankName?: string
    accountType?: string
    expiryDate?: string
  }
  isActive: boolean
}

interface PaymentReminder {
  id: string
  paymentId: string
  type: 'email' | 'sms' | 'notification'
  status: 'scheduled' | 'sent' | 'failed'
  scheduledDate: string
  sentDate?: string
  template: string
}

export function PaymentsSystem({ user, accessToken }: PaymentsSystemProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setIsLoading(true)
      
      // Mock data - replace with actual API calls
      const mockPayments: Payment[] = [
        {
          id: '1',
          tenantId: 'tenant1',
          tenantName: 'Ahmed Al-Mansouri',
          propertyId: 'prop1',
          propertyName: 'Dubai Marina Towers',
          unitId: 'unit1',
          unitNumber: '1205',
          amount: 8500,
          type: 'rent',
          status: 'paid',
          dueDate: '2024-01-01',
          paidDate: '2023-12-28',
          method: 'bank_transfer',
          reference: 'TXN-2024-001',
          recurringPayment: true,
          frequency: 'monthly',
          nextDueDate: '2024-02-01',
          createdAt: '2023-12-01'
        },
        {
          id: '2',
          tenantId: 'tenant2',
          tenantName: 'Emirates Trading LLC',
          propertyId: 'prop2',
          propertyName: 'Business Bay Complex',
          unitId: 'unit2',
          unitNumber: '1501',
          amount: 12000,
          type: 'rent',
          status: 'pending',
          dueDate: '2024-01-01',
          recurringPayment: true,
          frequency: 'monthly',
          nextDueDate: '2024-02-01',
          createdAt: '2023-12-01'
        },
        {
          id: '3',
          tenantId: 'tenant3',
          tenantName: 'Sarah Johnson',
          propertyId: 'prop1',
          propertyName: 'Dubai Marina Towers',
          unitId: 'unit3',
          unitNumber: '806',
          amount: 6500,
          type: 'rent',
          status: 'overdue',
          dueDate: '2023-12-01',
          recurringPayment: true,
          frequency: 'monthly',
          createdAt: '2023-11-01',
          lateFee: 325
        },
        {
          id: '4',
          tenantId: 'tenant1',
          tenantName: 'Ahmed Al-Mansouri',
          propertyId: 'prop1',
          propertyName: 'Dubai Marina Towers',
          unitId: 'unit1',
          unitNumber: '1205',
          amount: 17000,
          type: 'deposit',
          status: 'paid',
          dueDate: '2023-12-01',
          paidDate: '2023-11-25',
          method: 'bank_transfer',
          reference: 'DEP-2023-001',
          recurringPayment: false,
          createdAt: '2023-11-15'
        },
        {
          id: '5',
          tenantId: 'tenant4',
          tenantName: 'Mohammed Hassan',
          propertyId: 'prop3',
          propertyName: 'Al Ain Heritage Village',
          unitId: 'unit4',
          unitNumber: '102',
          amount: 450,
          type: 'utility',
          status: 'partial',
          dueDate: '2024-01-15',
          paidDate: '2024-01-10',
          method: 'credit_card',
          reference: 'UTIL-2024-001',
          recurringPayment: true,
          frequency: 'monthly',
          nextDueDate: '2024-02-15',
          createdAt: '2024-01-01',
          notes: 'Partial payment received, balance pending'
        }
      ]

      setPayments(mockPayments)
      
    } catch (error) {
      console.error('Error loading payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default'
      case 'pending': return 'secondary'
      case 'overdue': return 'destructive'
      case 'partial': return 'outline'
      case 'failed': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'overdue': return <AlertTriangle className="h-4 w-4" />
      case 'partial': return <RefreshCw className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rent': return 'default'
      case 'deposit': return 'secondary'
      case 'utility': return 'outline'
      case 'fee': return 'destructive'
      case 'maintenance': return 'secondary'
      case 'penalty': return 'destructive'
      default: return 'secondary'
    }
  }

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesType = typeFilter === 'all' || payment.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const paymentStats = {
    totalCollected: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    totalOverdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
    collectionRate: payments.length > 0 ? (payments.filter(p => p.status === 'paid').length / payments.length) * 100 : 0,
    overdueCount: payments.filter(p => p.status === 'overdue').length,
    pendingCount: payments.filter(p => p.status === 'pending').length
  }

  const renderPaymentOverview = () => (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              AED {paymentStats.totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              AED {paymentStats.totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{paymentStats.pendingCount} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              AED {paymentStats.totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{paymentStats.overdueCount} overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.collectionRate.toFixed(1)}%</div>
            <Progress value={paymentStats.collectionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {payment.tenantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{payment.tenantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.propertyName} - Unit {payment.unitNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">AED {payment.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(payment.status)} className="text-xs">
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{payment.status}</span>
                    </Badge>
                    <Badge variant={getTypeColor(payment.type)} className="text-xs">
                      {payment.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overdue Payments Alert */}
      {paymentStats.overdueCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue Payments Require Attention
            </CardTitle>
            <CardDescription className="text-red-600">
              {paymentStats.overdueCount} payments are overdue totaling AED {paymentStats.totalOverdue.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive">
                <Mail className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View All Overdue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderPaymentDetails = () => (
    <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Payment #{selectedPayment?.id} - {selectedPayment?.tenantName}
          </DialogDescription>
        </DialogHeader>
        
        {selectedPayment && (
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-6">
              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Payment Information
                    <Badge variant={getStatusColor(selectedPayment.status)}>
                      {getStatusIcon(selectedPayment.status)}
                      <span className="ml-1">{selectedPayment.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Amount</Label>
                      <p className="text-lg font-bold">AED {selectedPayment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Badge variant={getTypeColor(selectedPayment.type)} className="mt-1">
                        {selectedPayment.type}
                      </Badge>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <p className="text-sm font-medium">
                        {new Date(selectedPayment.dueDate).toLocaleDateString()}
                        {selectedPayment.status === 'overdue' && (
                          <span className="text-red-600 ml-2">
                            ({getDaysOverdue(selectedPayment.dueDate)} days overdue)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label>Paid Date</Label>
                      <p className="text-sm font-medium">
                        {selectedPayment.paidDate 
                          ? new Date(selectedPayment.paidDate).toLocaleDateString()
                          : 'Not paid yet'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {selectedPayment.method && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Payment Method</Label>
                        <p className="text-sm font-medium capitalize">
                          {selectedPayment.method.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <Label>Reference</Label>
                        <p className="text-sm font-medium">{selectedPayment.reference || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {selectedPayment.lateFee && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-700">
                          Late Fee Applied: AED {selectedPayment.lateFee}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property & Tenant Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property & Tenant Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Property</Label>
                      <p className="text-sm font-medium">{selectedPayment.propertyName}</p>
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <p className="text-sm font-medium">Unit {selectedPayment.unitNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedPayment.tenantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedPayment.tenantName}</p>
                      <p className="text-sm text-muted-foreground">Tenant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Payment Info */}
              {selectedPayment.recurringPayment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Repeat className="h-5 w-5" />
                      Recurring Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Frequency</Label>
                        <p className="text-sm font-medium capitalize">{selectedPayment.frequency}</p>
                      </div>
                      <div>
                        <Label>Next Due Date</Label>
                        <p className="text-sm font-medium">
                          {selectedPayment.nextDueDate 
                            ? new Date(selectedPayment.nextDueDate).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedPayment.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedPayment.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Payment
                    </Button>
                    <Button size="sm" variant="outline">
                      <Receipt className="h-4 w-4 mr-2" />
                      Generate Receipt
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-muted-foreground">Track and manage all payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowAddPayment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderPaymentOverview()}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="penalty">Penalty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property/Unit</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {payment.tenantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{payment.tenantName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{payment.propertyName}</p>
                        <p className="text-xs text-muted-foreground">Unit {payment.unitNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">AED {payment.amount.toLocaleString()}</span>
                      {payment.lateFee && (
                        <p className="text-xs text-red-600">+AED {payment.lateFee} late fee</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(payment.type)} className="capitalize">
                        {payment.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(payment.dueDate).toLocaleDateString()}</p>
                        {payment.status === 'overdue' && (
                          <p className="text-xs text-red-600">
                            {getDaysOverdue(payment.dueDate)} days overdue
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">
                        {payment.method?.replace('_', ' ') || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Payments awaiting collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.filter(p => p.status === 'pending').map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {payment.tenantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.propertyName} - Unit {payment.unitNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">AED {payment.amount.toLocaleString()}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" />
                          Remind
                        </Button>
                        <Button size="sm">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Record Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Overdue Payments</CardTitle>
              <CardDescription>Payments that require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.filter(p => p.status === 'overdue').map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border-red-200 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {payment.tenantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.propertyName} - Unit {payment.unitNumber}
                        </p>
                        <p className="text-xs text-red-600 font-medium">
                          {getDaysOverdue(payment.dueDate)} days overdue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-700">
                        AED {(payment.amount + (payment.lateFee || 0)).toLocaleString()}
                      </p>
                      {payment.lateFee && (
                        <p className="text-xs text-red-600">
                          Includes AED {payment.lateFee} late fee
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="destructive">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" />
                          Notice
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Payments</CardTitle>
              <CardDescription>Automated payment schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.filter(p => p.recurringPayment).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Repeat className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.propertyName} - Unit {payment.unitNumber}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {payment.frequency} - AED {payment.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Next: {payment.nextDueDate ? new Date(payment.nextDueDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        <Edit className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderPaymentDetails()}
    </div>
  )
}
