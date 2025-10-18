import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { 
  Building2, 
  Users, 
  Wrench, 
  CreditCard, 
  DollarSign, 
  Plus, 
  Search,
  Filter,
  BarChart3,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Home,
  UserPlus,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calculator
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner@2.0.3'
import { projectId } from '../utils/supabase/info'
import { AccountingSystem } from './accounting-system'
import { EnhancedMaintenanceSystem } from './enhanced-maintenance-system'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: string
  employeeCount?: number
  status: string
}

interface Property {
  id: string
  name: string
  address: string
  type: string
  units: number
  rent: number
  status: string
}

interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  propertyId: string
  unit: string
  rentAmount: number
  leaseStart: string
  leaseEnd: string
  status: string
}

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  propertyId: string
  tenantId: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'completed'
  createdAt: string
}

interface Payment {
  id: string
  tenantId: string
  propertyId: string
  amount: number
  type: 'rent' | 'deposit' | 'fee'
  status: 'pending' | 'completed' | 'overdue'
  dueDate: string
  paidDate?: string
}

interface DashboardStats {
  totalProperties: number
  totalTenants: number
  openMaintenanceRequests: number
  totalPayments: number
  monthlyRevenue: number
}

interface CompanyDashboardProps {
  user: User
  accessToken: string | null
  onLogout: () => void
}

export function CompanyDashboard({ user, accessToken, onLogout }: CompanyDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalTenants: 0,
    openMaintenanceRequests: 0,
    totalPayments: 0,
    monthlyRevenue: 0
  })
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Form states
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    type: '',
    units: 1,
    rent: 0
  })
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unit: '',
    rentAmount: 0,
    leaseStart: '',
    leaseEnd: ''
  })
  const [newMaintenanceRequest, setNewMaintenanceRequest] = useState({
    title: '',
    description: '',
    propertyId: '',
    tenantId: '',
    priority: 'medium'
  })

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [statsData, propertiesData, tenantsData, maintenanceData, paymentsData] = await Promise.all([
        apiCall('/dashboard-stats'),
        apiCall('/properties'),
        apiCall('/tenants'),
        apiCall('/maintenance-requests'),
        apiCall('/payments')
      ])

      setStats(statsData.stats || {})
      setProperties(propertiesData.properties || [])
      setTenants(tenantsData.tenants || [])
      setMaintenanceRequests(maintenanceData.requests || [])
      setPayments(paymentsData.payments || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error(`Failed to load dashboard data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const addProperty = async () => {
    try {
      await apiCall('/properties', {
        method: 'POST',
        body: JSON.stringify(newProperty)
      })

      toast.success('Property added successfully')
      setNewProperty({ name: '', address: '', type: '', units: 1, rent: 0 })
      fetchData()
    } catch (error: any) {
      console.error('Error adding property:', error)
      toast.error(`Failed to add property: ${error.message}`)
    }
  }

  const addTenant = async () => {
    try {
      await apiCall('/tenants', {
        method: 'POST',
        body: JSON.stringify(newTenant)
      })

      toast.success('Tenant added successfully')
      setNewTenant({
        name: '',
        email: '',
        phone: '',
        propertyId: '',
        unit: '',
        rentAmount: 0,
        leaseStart: '',
        leaseEnd: ''
      })
      fetchData()
    } catch (error: any) {
      console.error('Error adding tenant:', error)
      toast.error(`Failed to add tenant: ${error.message}`)
    }
  }

  const addMaintenanceRequest = async () => {
    try {
      await apiCall('/maintenance-requests', {
        method: 'POST',
        body: JSON.stringify(newMaintenanceRequest)
      })

      toast.success('Maintenance request created successfully')
      setNewMaintenanceRequest({
        title: '',
        description: '',
        propertyId: '',
        tenantId: '',
        priority: 'medium'
      })
      fetchData()
    } catch (error: any) {
      console.error('Error creating maintenance request:', error)
      toast.error(`Failed to create maintenance request: ${error.message}`)
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchData()
    }
  }, [accessToken])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount)
  }

  const getStatusBadge = (status: string, type: 'property' | 'tenant' | 'maintenance' | 'payment') => {
    const statusConfig = {
      property: {
        available: { variant: 'secondary' as const, label: 'Available' },
        occupied: { variant: 'default' as const, label: 'Occupied' },
        maintenance: { variant: 'destructive' as const, label: 'Maintenance' },
      },
      tenant: {
        active: { variant: 'default' as const, label: 'Active' },
        inactive: { variant: 'secondary' as const, label: 'Inactive' },
        pending: { variant: 'outline' as const, label: 'Pending' },
      },
      maintenance: {
        open: { variant: 'destructive' as const, label: 'Open' },
        in_progress: { variant: 'outline' as const, label: 'In Progress' },
        completed: { variant: 'default' as const, label: 'Completed' },
      },
      payment: {
        pending: { variant: 'outline' as const, label: 'Pending' },
        completed: { variant: 'default' as const, label: 'Completed' },
        overdue: { variant: 'destructive' as const, label: 'Overdue' },
      }
    }

    const config = statusConfig[type]?.[status as keyof typeof statusConfig[typeof type]]
    return config ? (
      <Badge variant={config.variant}>{config.label}</Badge>
    ) : (
      <Badge variant="secondary">{status}</Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-center">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white/95 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.fullName}</p>
              <p className="text-sm text-gray-500">{user.companyName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="destructive" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">Total properties</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">Active tenants</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openMaintenanceRequests}</div>
              <p className="text-xs text-muted-foreground">Open requests</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">Monthly revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          request.priority === 'high' ? 'bg-red-500' :
                          request.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {request.description}
                          </p>
                        </div>
                        {getStatusBadge(request.status, 'maintenance')}
                      </div>
                    ))}
                    {maintenanceRequests.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No recent maintenance requests
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <Home className="h-6 w-6 mb-2" />
                          Add Property
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Property</DialogTitle>
                          <DialogDescription>
                            Create a new property in your portfolio
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="property-name">Property Name</Label>
                            <Input
                              id="property-name"
                              value={newProperty.name}
                              onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                              placeholder="Enter property name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="property-address">Address</Label>
                            <Input
                              id="property-address"
                              value={newProperty.address}
                              onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                              placeholder="Enter property address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="property-type">Type</Label>
                            <Select onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="apartment">Apartment</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                                <SelectItem value="townhouse">Townhouse</SelectItem>
                                <SelectItem value="penthouse">Penthouse</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="property-units">Units</Label>
                              <Input
                                id="property-units"
                                type="number"
                                value={newProperty.units}
                                onChange={(e) => setNewProperty({ ...newProperty, units: parseInt(e.target.value) || 1 })}
                                min="1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="property-rent">Monthly Rent (AED)</Label>
                              <Input
                                id="property-rent"
                                type="number"
                                value={newProperty.rent}
                                onChange={(e) => setNewProperty({ ...newProperty, rent: parseInt(e.target.value) || 0 })}
                                min="0"
                              />
                            </div>
                          </div>
                          <Button onClick={addProperty} className="w-full">
                            Add Property
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <UserPlus className="h-6 w-6 mb-2" />
                          Add Tenant
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Tenant</DialogTitle>
                          <DialogDescription>
                            Register a new tenant for your properties
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="tenant-name">Full Name</Label>
                            <Input
                              id="tenant-name"
                              value={newTenant.name}
                              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                              placeholder="Enter tenant name"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="tenant-email">Email</Label>
                              <Input
                                id="tenant-email"
                                type="email"
                                value={newTenant.email}
                                onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                                placeholder="Enter email"
                              />
                            </div>
                            <div>
                              <Label htmlFor="tenant-phone">Phone</Label>
                              <Input
                                id="tenant-phone"
                                value={newTenant.phone}
                                onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                                placeholder="Enter phone number"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="tenant-property">Property</Label>
                            <Select onValueChange={(value) => setNewTenant({ ...newTenant, propertyId: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                              <SelectContent>
                                {properties.map((property) => (
                                  <SelectItem key={property.id} value={property.id}>
                                    {property.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="tenant-unit">Unit</Label>
                              <Input
                                id="tenant-unit"
                                value={newTenant.unit}
                                onChange={(e) => setNewTenant({ ...newTenant, unit: e.target.value })}
                                placeholder="Enter unit number"
                              />
                            </div>
                            <div>
                              <Label htmlFor="tenant-rent">Monthly Rent (AED)</Label>
                              <Input
                                id="tenant-rent"
                                type="number"
                                value={newTenant.rentAmount}
                                onChange={(e) => setNewTenant({ ...newTenant, rentAmount: parseInt(e.target.value) || 0 })}
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="lease-start">Lease Start</Label>
                              <Input
                                id="lease-start"
                                type="date"
                                value={newTenant.leaseStart}
                                onChange={(e) => setNewTenant({ ...newTenant, leaseStart: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lease-end">Lease End</Label>
                              <Input
                                id="lease-end"
                                type="date"
                                value={newTenant.leaseEnd}
                                onChange={(e) => setNewTenant({ ...newTenant, leaseEnd: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button onClick={addTenant} className="w-full">
                            Add Tenant
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-20 flex flex-col">
                          <Wrench className="h-6 w-6 mb-2" />
                          Maintenance
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Maintenance Request</DialogTitle>
                          <DialogDescription>
                            Report a maintenance issue for a property
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="maintenance-title">Title</Label>
                            <Input
                              id="maintenance-title"
                              value={newMaintenanceRequest.title}
                              onChange={(e) => setNewMaintenanceRequest({ ...newMaintenanceRequest, title: e.target.value })}
                              placeholder="Brief description of the issue"
                            />
                          </div>
                          <div>
                            <Label htmlFor="maintenance-description">Description</Label>
                            <Textarea
                              id="maintenance-description"
                              value={newMaintenanceRequest.description}
                              onChange={(e) => setNewMaintenanceRequest({ ...newMaintenanceRequest, description: e.target.value })}
                              placeholder="Detailed description of the maintenance issue"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="maintenance-property">Property</Label>
                            <Select onValueChange={(value) => setNewMaintenanceRequest({ ...newMaintenanceRequest, propertyId: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                              <SelectContent>
                                {properties.map((property) => (
                                  <SelectItem key={property.id} value={property.id}>
                                    {property.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="maintenance-tenant">Tenant (Optional)</Label>
                            <Select onValueChange={(value) => setNewMaintenanceRequest({ ...newMaintenanceRequest, tenantId: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tenant" />
                              </SelectTrigger>
                              <SelectContent>
                                {tenants.map((tenant) => (
                                  <SelectItem key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="maintenance-priority">Priority</Label>
                            <Select onValueChange={(value) => setNewMaintenanceRequest({ ...newMaintenanceRequest, priority: value as 'low' | 'medium' | 'high' })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={addMaintenanceRequest} className="w-full">
                            Create Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="h-20 flex flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Properties Management</CardTitle>
                    <CardDescription>Manage your property portfolio</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Property
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Property</DialogTitle>
                        </DialogHeader>
                        {/* Add Property Form - same as above */}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.name}</TableCell>
                        <TableCell>{property.address}</TableCell>
                        <TableCell>{property.type}</TableCell>
                        <TableCell>{property.units}</TableCell>
                        <TableCell>{formatCurrency(property.rent)}</TableCell>
                        <TableCell>{getStatusBadge(property.status, 'property')}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {properties.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No properties found</p>
                    <p className="text-sm text-gray-400">Add your first property to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tenant Management</CardTitle>
                    <CardDescription>Manage your tenants and lease agreements</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Tenant
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Tenant</DialogTitle>
                        </DialogHeader>
                        {/* Add Tenant Form - same as above */}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Lease End</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => {
                      const property = properties.find(p => p.id === tenant.propertyId)
                      return (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">{tenant.name}</TableCell>
                          <TableCell>{tenant.email}</TableCell>
                          <TableCell>{tenant.phone}</TableCell>
                          <TableCell>{property?.name || 'N/A'}</TableCell>
                          <TableCell>{tenant.unit}</TableCell>
                          <TableCell>{formatCurrency(tenant.rentAmount)}</TableCell>
                          <TableCell>{new Date(tenant.leaseEnd).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(tenant.status, 'tenant')}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {tenants.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tenants found</p>
                    <p className="text-sm text-gray-400">Add your first tenant to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <EnhancedMaintenanceSystem user={user} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment Management</CardTitle>
                    <CardDescription>Track rent payments and invoices</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const tenant = tenants.find(t => t.id === payment.tenantId)
                      const property = properties.find(p => p.id === payment.propertyId)
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{tenant?.name || 'N/A'}</TableCell>
                          <TableCell>{property?.name || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell className="capitalize">{payment.type}</TableCell>
                          <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(payment.status, 'payment')}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {payments.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payment records found</p>
                    <p className="text-sm text-gray-400">Payment history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounting" className="space-y-4">
            <AccountingSystem user={user} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Reminders & Notifications</CardTitle>
                <CardDescription>Stay on top of important tasks and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active reminders</p>
                  <p className="text-sm text-gray-400">Set up reminders for rent collection and maintenance</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Insights and performance metrics for your properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Revenue Trends</h3>
                    <p className="text-sm text-gray-500">Monthly income analysis</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Occupancy Rate</h3>
                    <p className="text-sm text-gray-500">Property utilization</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Maintenance Costs</h3>
                    <p className="text-sm text-gray-500">Expense tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}