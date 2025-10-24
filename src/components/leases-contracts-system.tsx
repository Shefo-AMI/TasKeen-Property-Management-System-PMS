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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Calendar } from './ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Checkbox } from './ui/checkbox'
import { 
  FileText, 
  Calendar as CalendarIcon, 
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
  DollarSign,
  Users,
  Home,
  Key,
  Mail,
  Phone,
  Printer,
  Share,
  Copy,
  Signature,
  Shield,
  Building2,
  MapPin,
  Star,
  Zap
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

interface LeasesContractsSystemProps {
  user: User
  accessToken: string | null
}

interface Lease {
  id: string
  propertyId: string
  propertyName: string
  unitId: string
  unitNumber: string
  tenantId: string
  tenantName: string
  tenantEmail: string
  tenantPhone: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  status: 'active' | 'expiring_soon' | 'expired' | 'terminated' | 'pending'
  leaseType: 'residential' | 'commercial' | 'short_term'
  renewalOption: boolean
  autoRenewal: boolean
  escalationClause: boolean
  escalationRate?: number
  paymentTerms: string
  documents: Document[]
  addendums: Addendum[]
  maintenanceResponsibility: 'landlord' | 'tenant' | 'shared'
  petPolicy: 'allowed' | 'not_allowed' | 'with_approval'
  smokingPolicy: 'allowed' | 'not_allowed'
  sublettingAllowed: boolean
  createdAt: string
  lastModified: string
  signedDate?: string
  digitalSignature: boolean
  notes: string
}

interface Document {
  id: string
  name: string
  type: 'lease_agreement' | 'addendum' | 'insurance' | 'id_copy' | 'income_proof' | 'other'
  url: string
  uploadDate: string
  size: number
  signatureRequired: boolean
  signed: boolean
}

interface Addendum {
  id: string
  title: string
  description: string
  effectiveDate: string
  signed: boolean
  signedDate?: string
}

interface Contract {
  id: string
  contractType: 'vendor' | 'maintenance' | 'insurance' | 'management' | 'other'
  title: string
  vendor: string
  description: string
  startDate: string
  endDate: string
  value: number
  status: 'active' | 'pending' | 'expired' | 'terminated'
  autoRenewal: boolean
  paymentSchedule: 'monthly' | 'quarterly' | 'annually' | 'one_time'
  documents: Document[]
  properties: string[]
  contactPerson: {
    name: string
    email: string
    phone: string
  }
  terms: string
  createdAt: string
}

export function LeasesContractsSystem({ user, accessToken }: LeasesContractsSystemProps) {
  const [activeTab, setActiveTab] = useState('leases')
  const [leases, setLeases] = useState<Lease[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddLease, setShowAddLease] = useState(false)
  const [showAddContract, setShowAddContract] = useState(false)

  useEffect(() => {
    loadLeasesAndContracts()
  }, [])

  const loadLeasesAndContracts = async () => {
    try {
      setIsLoading(true)
      
      // Mock data - replace with actual API calls
      const mockLeases: Lease[] = [
        {
          id: '1',
          propertyId: 'prop1',
          propertyName: 'Dubai Marina Towers',
          unitId: 'unit1',
          unitNumber: '1205',
          tenantId: 'tenant1',
          tenantName: 'Ahmed Al-Mansouri',
          tenantEmail: 'ahmed.mansouri@email.com',
          tenantPhone: '+971 50 123 4567',
          startDate: '2023-12-01',
          endDate: '2024-11-30',
          monthlyRent: 8500,
          securityDeposit: 17000,
          status: 'active',
          leaseType: 'residential',
          renewalOption: true,
          autoRenewal: false,
          escalationClause: true,
          escalationRate: 5,
          paymentTerms: 'Monthly in advance by 1st of each month',
          documents: [],
          addendums: [],
          maintenanceResponsibility: 'shared',
          petPolicy: 'with_approval',
          smokingPolicy: 'not_allowed',
          sublettingAllowed: false,
          createdAt: '2023-11-15',
          lastModified: '2023-12-01',
          signedDate: '2023-11-25',
          digitalSignature: true,
          notes: 'Standard residential lease with escalation clause'
        },
        {
          id: '2',
          propertyId: 'prop2',
          propertyName: 'Business Bay Complex',
          unitId: 'unit2',
          unitNumber: '1501',
          tenantId: 'tenant2',
          tenantName: 'Emirates Trading LLC',
          tenantEmail: 'info@emiratestrading.com',
          tenantPhone: '+971 4 567 8900',
          startDate: '2024-01-01',
          endDate: '2026-12-31',
          monthlyRent: 12000,
          securityDeposit: 36000,
          status: 'active',
          leaseType: 'commercial',
          renewalOption: true,
          autoRenewal: true,
          escalationClause: true,
          escalationRate: 3,
          paymentTerms: 'Quarterly in advance',
          documents: [],
          addendums: [],
          maintenanceResponsibility: 'tenant',
          petPolicy: 'not_allowed',
          smokingPolicy: 'allowed',
          sublettingAllowed: true,
          createdAt: '2023-12-15',
          lastModified: '2024-01-01',
          signedDate: '2023-12-28',
          digitalSignature: true,
          notes: 'Commercial lease with auto-renewal clause'
        },
        {
          id: '3',
          propertyId: 'prop1',
          propertyName: 'Dubai Marina Towers',
          unitId: 'unit3',
          unitNumber: '806',
          tenantId: 'tenant3',
          tenantName: 'Sarah Johnson',
          tenantEmail: 'sarah.johnson@email.com',
          tenantPhone: '+971 50 987 6543',
          startDate: '2024-03-01',
          endDate: '2024-08-31',
          monthlyRent: 6500,
          securityDeposit: 13000,
          status: 'expiring_soon',
          leaseType: 'short_term',
          renewalOption: false,
          autoRenewal: false,
          escalationClause: false,
          paymentTerms: 'Monthly in advance',
          documents: [],
          addendums: [],
          maintenanceResponsibility: 'landlord',
          petPolicy: 'not_allowed',
          smokingPolicy: 'not_allowed',
          sublettingAllowed: false,
          createdAt: '2024-02-15',
          lastModified: '2024-03-01',
          signedDate: '2024-02-28',
          digitalSignature: true,
          notes: 'Short-term lease for expat assignment'
        }
      ]

      const mockContracts: Contract[] = [
        {
          id: '1',
          contractType: 'maintenance',
          title: 'Annual Maintenance Contract - HVAC Systems',
          vendor: 'Dubai Cooling Services LLC',
          description: 'Comprehensive maintenance of all HVAC systems across properties',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          value: 150000,
          status: 'active',
          autoRenewal: true,
          paymentSchedule: 'quarterly',
          documents: [],
          properties: ['prop1', 'prop2'],
          contactPerson: {
            name: 'Mohammed Hassan',
            email: 'mohammed@dubaicoling.com',
            phone: '+971 4 123 4567'
          },
          terms: 'Quarterly maintenance visits, emergency repairs included',
          createdAt: '2023-12-01'
        },
        {
          id: '2',
          contractType: 'insurance',
          title: 'Property Insurance Policy',
          vendor: 'Emirates Insurance Company',
          description: 'Comprehensive property insurance coverage',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          value: 75000,
          status: 'active',
          autoRenewal: true,
          paymentSchedule: 'annually',
          documents: [],
          properties: ['prop1', 'prop2', 'prop3'],
          contactPerson: {
            name: 'Aisha Al-Zahra',
            email: 'aisha@emiratesinsurance.ae',
            phone: '+971 2 987 6543'
          },
          terms: 'Full replacement value coverage with natural disaster protection',
          createdAt: '2023-11-15'
        }
      ]

      setLeases(mockLeases)
      setContracts(mockContracts)
      
    } catch (error) {
      console.error('Error loading leases and contracts:', error)
      toast.error('Failed to load leases and contracts')
    } finally {
      setIsLoading(false)
    }
  }

  const getLeaseStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'expiring_soon': return 'destructive'
      case 'expired': return 'secondary'
      case 'terminated': return 'outline'
      case 'pending': return 'secondary'
      default: return 'secondary'
    }
  }

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      case 'expired': return 'destructive'
      case 'terminated': return 'outline'
      default: return 'secondary'
    }
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date()
    const expiry = new Date(endDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredLeases = leases.filter(lease => {
    const matchesSearch = lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lease.status === statusFilter
    const matchesType = typeFilter === 'all' || lease.leaseType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    const matchesType = typeFilter === 'all' || contract.contractType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const renderLeaseDetails = () => (
    <Sheet open={!!selectedLease} onOpenChange={() => setSelectedLease(null)}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Lease Agreement - Unit {selectedLease?.unitNumber}</SheetTitle>
          <SheetDescription>{selectedLease?.propertyName}</SheetDescription>
        </SheetHeader>
        
        {selectedLease && (
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            <div className="space-y-6">
              {/* Lease Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Lease Overview
                    <Badge variant={getLeaseStatusColor(selectedLease.status)}>
                      {selectedLease.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Lease Type</Label>
                      <p className="text-sm font-medium capitalize">{selectedLease.leaseType}</p>
                    </div>
                    <div>
                      <Label>Monthly Rent</Label>
                      <p className="text-sm font-medium">AED {selectedLease.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Security Deposit</Label>
                      <p className="text-sm font-medium">AED {selectedLease.securityDeposit.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Days Until Expiry</Label>
                      <p className="text-sm font-medium">
                        {getDaysUntilExpiry(selectedLease.endDate)} days
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <p className="text-sm font-medium">
                        {new Date(selectedLease.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <p className="text-sm font-medium">
                        {new Date(selectedLease.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Payment Terms</Label>
                    <p className="text-sm">{selectedLease.paymentTerms}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tenant Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tenant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedLease.tenantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedLease.tenantName}</p>
                      <p className="text-sm text-muted-foreground">{selectedLease.tenantEmail}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{selectedLease.tenantPhone}</p>
                    </div>
                    <div>
                      <Label>Move-in Date</Label>
                      <p className="font-medium">
                        {new Date(selectedLease.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lease Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lease Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={selectedLease.renewalOption} disabled />
                      <Label>Renewal Option</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={selectedLease.autoRenewal} disabled />
                      <Label>Auto Renewal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={selectedLease.escalationClause} disabled />
                      <Label>Escalation Clause</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={selectedLease.sublettingAllowed} disabled />
                      <Label>Subletting Allowed</Label>
                    </div>
                  </div>

                  {selectedLease.escalationClause && selectedLease.escalationRate && (
                    <div>
                      <Label>Escalation Rate</Label>
                      <p className="text-sm font-medium">{selectedLease.escalationRate}% annually</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Maintenance Responsibility</Label>
                      <p className="text-sm font-medium capitalize">{selectedLease.maintenanceResponsibility}</p>
                    </div>
                    <div>
                      <Label>Pet Policy</Label>
                      <p className="text-sm font-medium">{selectedLease.petPolicy.replace('_', ' ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Lease Agreement</p>
                          <p className="text-xs text-muted-foreground">Signed on {selectedLease.signedDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Lease
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Signature className="h-4 w-4 mr-1" />
                      Request Signature
                    </Button>
                    <Button size="sm" variant="outline">
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
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
          <h2 className="text-2xl font-bold">Leases & Contracts</h2>
          <p className="text-muted-foreground">Manage lease agreements and service contracts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddContract(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contract
          </Button>
          <Button onClick={() => setShowAddLease(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lease
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leases, contracts..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {activeTab === 'leases' ? (
                    <>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="short_term">Short Term</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="leases" className="space-y-6">
          {/* Leases Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Leases</p>
                    <p className="text-2xl font-bold">
                      {leases.filter(l => l.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {leases.filter(l => l.status === 'expiring_soon').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">
                      AED {leases.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthlyRent, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Renewals</p>
                    <p className="text-2xl font-bold">
                      {leases.filter(l => l.renewalOption && getDaysUntilExpiry(l.endDate) <= 90).length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leases Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property/Unit</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeases.map((lease) => (
                  <TableRow key={lease.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lease.propertyName}</p>
                        <p className="text-sm text-muted-foreground">Unit {lease.unitNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {lease.tenantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{lease.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{lease.tenantEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {lease.leaseType}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(lease.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(lease.endDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDaysUntilExpiry(lease.endDate)} days left
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>AED {lease.monthlyRent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getLeaseStatusColor(lease.status)}>
                        {lease.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedLease(lease)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          {/* Contracts Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Contracts</p>
                    <p className="text-2xl font-bold">
                      {contracts.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">
                      AED {contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {contracts.filter(c => getDaysUntilExpiry(c.endDate) <= 90).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Auto Renewals</p>
                    <p className="text-2xl font-bold">
                      {contracts.filter(c => c.autoRenewal).length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contracts Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contract.title}</p>
                        <p className="text-sm text-muted-foreground">{contract.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{contract.vendor}</p>
                        <p className="text-xs text-muted-foreground">{contract.contactPerson.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {contract.contractType}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(contract.endDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDaysUntilExpiry(contract.endDate)} days left
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>AED {contract.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getContractStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedContract(contract)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lease & Contract Templates</h3>
            <p className="text-muted-foreground mb-4">Create and manage templates for quick document generation</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expiring in Next 90 Days</CardTitle>
              <CardDescription>Leases and contracts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leases.filter(l => getDaysUntilExpiry(l.endDate) <= 90).map((lease) => (
                  <div key={lease.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Unit {lease.unitNumber} - {lease.tenantName}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires in {getDaysUntilExpiry(lease.endDate)} days
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Renew</Button>
                      <Button size="sm" variant="outline">Contact</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderLeaseDetails()}
    </div>
  )
}
