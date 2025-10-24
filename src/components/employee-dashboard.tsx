import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { 
  Building2, Users, Wrench, DollarSign, Calendar, Bell, 
  LogOut, Home, ClipboardList, Receipt, AlertCircle,
  CheckCircle, Clock, MessageSquare, Bot
} from 'lucide-react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'
import { AIAssistant } from './ai-assistant'

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

interface DashboardStats {
  totalProperties: number
  totalTenants: number
  openMaintenanceRequests: number
  totalPayments: number
  monthlyRevenue: number
}

interface Property {
  id: string
  name: string
  address: string
  type: string
  units: number
  rentAmount?: number
  status: string
  createdAt: string
}

interface Tenant {
  id: string
  fullName: string
  email: string
  phone: string
  propertyId: string
  unitNumber: string
  leaseStart: string
  leaseEnd: string
  rentAmount: number
  status: string
  createdAt: string
}

interface MaintenanceRequest {
  id: string
  tenantId: string
  propertyId: string
  title: string
  description: string
  priority: string
  status: string
  createdAt: string
}

interface Payment {
  id: string
  tenantId: string
  amount: number
  type: string
  status: string
  dueDate: string
  paidDate?: string
  createdAt: string
}

interface EmployeeDashboardProps {
  user: User
  accessToken: string | null
  onLogout: () => void
}

export function EmployeeDashboard({ user, accessToken, onLogout }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        throw new Error('Failed to fetch dashboard stats')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/properties`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties)
      } else {
        throw new Error('Failed to fetch properties')
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties')
    }
  }

  const fetchTenants = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/tenants`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTenants(data.tenants)
      } else {
        throw new Error('Failed to fetch tenants')
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
      toast.error('Failed to load tenants')
    }
  }

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/maintenance-requests`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMaintenanceRequests(data.requests)
      } else {
        throw new Error('Failed to fetch maintenance requests')
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      toast.error('Failed to load maintenance requests')
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/payments`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      } else {
        throw new Error('Failed to fetch payments')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payments')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchDashboardStats(),
        fetchProperties(),
        fetchTenants(),
        fetchMaintenanceRequests(),
        fetchPayments()
      ])
      setIsLoading(false)
    }

    if (accessToken) {
      loadData()
    }
  }, [accessToken])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.companyName}</h1>
                <p className="text-sm text-gray-600">Employee Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAIAssistant(true)}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-600">Employee</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground">Total properties</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTenants || 0}</div>
              <p className="text-xs text-muted-foreground">Active tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openMaintenanceRequests || 0}</div>
              <p className="text-xs text-muted-foreground">Maintenance requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.monthlyRevenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Revenue collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates across properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tenants.slice(0, 3).map((tenant) => (
                      <div key={tenant.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New tenant: {tenant.fullName}</p>
                          <p className="text-xs text-gray-600">Unit {tenant.unitNumber}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(tenant.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {maintenanceRequests.slice(0, 2).map((request) => (
                      <div key={request.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Maintenance: {request.title}</p>
                          <p className="text-xs text-gray-600">Priority: {request.priority}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Tasks</CardTitle>
                  <CardDescription>Assigned responsibilities and deadlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">Property Inspection</p>
                          <p className="text-xs text-gray-600">Maple Street Apartments</p>
                        </div>
                      </div>
                      <Badge variant="outline">Due Tomorrow</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ClipboardList className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Tenant Screening</p>
                          <p className="text-xs text-gray-600">Unit 204 Application</p>
                        </div>
                      </div>
                      <Badge variant="outline">In Progress</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Lease Renewal</p>
                          <p className="text-xs text-gray-600">John Smith - Unit 101</p>
                        </div>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>View property information and details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.name}</TableCell>
                        <TableCell>{property.address}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{property.type}</Badge>
                        </TableCell>
                        <TableCell>{property.units}</TableCell>
                        <TableCell>
                          <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tenants</CardTitle>
                <CardDescription>View tenant information and lease details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Lease Period</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tenant.fullName}</p>
                            <p className="text-sm text-gray-600">{tenant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{tenant.unitNumber}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(tenant.leaseStart).toLocaleDateString()}</p>
                            <p className="text-gray-600">to {new Date(tenant.leaseEnd).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell>${tenant.rentAmount}</TableCell>
                        <TableCell>
                          <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>View and track maintenance issues</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                        <TableCell>
                          <Badge variant={
                            request.priority === 'high' ? 'destructive' : 
                            request.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.status === 'open' ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payments & Invoices</CardTitle>
                <CardDescription>View payment records and financial data</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">${payment.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.type}</Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            payment.status === 'paid' ? 'default' : 
                            payment.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          user={user}
          onClose={() => setShowAIAssistant(false)}
          onScheduleTask={(task) => {
            toast.success(`Task scheduled: ${task}`)
          }}
        />
      )}
    </div>
  )
}
