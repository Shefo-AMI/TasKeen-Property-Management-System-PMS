import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { ScrollArea } from './ui/scroll-area'
import { Progress } from './ui/progress'
import { Calendar } from './ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { 
  Home, 
  Building2, 
  Users, 
  Wrench, 
  FileText, 
  DollarSign, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Camera, 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  Filter,
  MapPin,
  Key,
  CreditCard,
  Receipt,
  Truck,
  Shield,
  UserCheck,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Star,
  Map,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  FileImage,
  Video,
  Image,
  LogOut,
  Menu,
  Sparkles,
  Database
} from 'lucide-react'
import { AccountingSystem } from './accounting-system'
import { EnhancedMaintenanceSystem } from './enhanced-maintenance-system'
import { AIAssistant } from './ai-assistant'
import { UnitsTenantsSystem } from './units-tenants-system'
import { BuildingsUnitsManagement } from './buildings-units-management'
import { LeasesContractsSystem } from './leases-contracts-system'
import { RoleBasedAccess } from './role-based-access'
import { canAccessSection, ALZAHI_COMPANY } from '../utils/alzahi-company-setup'
import { AdvancedDashboardCharts } from './advanced-dashboard-charts'
import { PaymentsSystem } from './payments-system'
import { ReportsAnalytics } from './reports-analytics'
import { CalendarSystem } from './calendar-system'
import { CommunicationsSystem } from './communications-system'
import { InspectionsSystem } from './inspections-system'
import { VendorManagement } from './vendor-management'
import { MarketingListings } from './marketing-listings'
import { DocumentsSystem } from './documents-system'
import { BuilderEditorManager } from './builder-io-editor'
import { CRUDManagementPage } from './crud-management-page'
import { CRUDManagementPageSupabase } from './crud-management-page-supabase'
import { toast } from 'sonner'
import { projectId } from '../utils/supabase/info'
import { 
  demoProperties, 
  demoUnits,
  demoMaintenanceRequests,
  calculateDashboardStats,
  Property as DemoProperty,
  Unit as DemoUnit,
  MaintenanceRequest as DemoMaintenance
} from '../utils/demo-data'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: 'platform_admin' | 'company_admin' | 'employee'
  employeeCount?: number
  status: string
}

interface MainDashboardProps {
  user: User
  accessToken: string | null
  onLogout: () => void
}

interface DashboardStats {
  totalProperties: number
  totalUnits: number
  totalTenants: number
  occupancyRate: number
  monthlyRevenue: number
  maintenanceRequests: number
  overduePayments: number
  viewings: number
}

// Using demo data types
type Property = DemoProperty
type Unit = DemoUnit
type MaintenanceRequest = DemoMaintenance

export function MainDashboard({ user, accessToken, onLogout }: MainDashboardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get current route from URL
  const getCurrentRoute = () => {
    const path = location.pathname.replace('/dashboard/', '') || 'overview'
    return path === 'dashboard' ? 'overview' : path
  }
  
  const [activeTab, setActiveTab] = useState(getCurrentRoute())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalUnits: 0,
    totalTenants: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    maintenanceRequests: 0,
    overduePayments: 0,
    viewings: 0
  })
  const [dashboardProperties, setDashboardProperties] = useState<Property[]>([])
  const [dashboardUnits, setDashboardUnits] = useState<Unit[]>([])
  const [dashboardMaintenanceRequests, setDashboardMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  // Update activeTab when route changes
  useEffect(() => {
    const currentRoute = getCurrentRoute()
    if (currentRoute !== activeTab) {
      setActiveTab(currentRoute)
    }
  }, [location.pathname])
  
  // Handle navigation
  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId)
    navigate(`/dashboard/${tabId === 'overview' ? '' : tabId}`)
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Use imported demo data
      const calculatedStats = calculateDashboardStats()
      
      setStats(calculatedStats)
      setDashboardProperties(demoProperties)
      setDashboardUnits(demoUnits)
      setDashboardMaintenanceRequests(demoMaintenanceRequests)

      toast.success('Dashboard data loaded successfully')
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter sidebar items based on user role
  const allSidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, roles: ['all'] },
    { id: 'buildings', label: 'Buildings', icon: Building2, roles: ['company_admin', 'platform_admin'] },
    { id: 'properties', label: 'Properties', icon: Building2, roles: ['company_admin', 'platform_admin'] },
    { id: 'units', label: 'Units & Tenants', icon: Key, roles: ['company_admin', 'platform_admin'] },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['all'] }, // All roles can access
    { id: 'accounting', label: 'Accounting', icon: DollarSign, roles: ['company_admin', 'platform_admin'] },
    { id: 'leases', label: 'Leases', icon: FileText, roles: ['company_admin', 'platform_admin'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['company_admin', 'platform_admin'] },
    { id: 'crud-management', label: 'Data Mgmt', icon: Database, roles: ['company_admin', 'platform_admin'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['company_admin', 'platform_admin'] },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, roles: ['company_admin', 'platform_admin'] },
    { id: 'communications', label: 'Comms', icon: MessageSquare, roles: ['company_admin', 'platform_admin'] },
    { id: 'inspections', label: 'Inspections', icon: Eye, roles: ['company_admin', 'platform_admin'] },
    { id: 'vendors', label: 'Vendors', icon: Truck, roles: ['company_admin', 'platform_admin'] },
    { id: 'marketing', label: 'Marketing', icon: Star, roles: ['company_admin', 'platform_admin'] },
    { id: 'documents', label: 'Documents', icon: FileImage, roles: ['company_admin', 'platform_admin'] },
    { id: 'builder', label: 'Builder.io', icon: Sparkles, roles: ['platform_admin'] },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Zap, roles: ['all'] }
  ];

  // Filter items based on user role
  const sidebarItems = allSidebarItems.filter(item => {
    if (item.roles.includes('all')) return true;
    return item.roles.includes(user.role);
  });

  // Special dashboard for maintenance staff
  const renderMaintenanceOnlyDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-heading="true">Maintenance Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your assigned maintenance tasks</p>
        </div>
      </div>

      {/* Quick Stats for Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Open Tickets</CardTitle>
            <Wrench className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">12</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
          </CardContent>
        </Card>

        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">5</div>
            <p className="text-xs text-muted-foreground mt-1">Currently working</p>
          </CardContent>
        </Card>

        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Completed Today</CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Urgent Tickets
          </CardTitle>
          <CardDescription>High priority maintenance requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 1, property: 'ALMEKNAS 146', unit: '203', issue: 'Water leak in bathroom', priority: 'urgent' },
              { id: 2, property: 'AL SHARJAH 346', unit: '105', issue: 'AC not working', priority: 'urgent' },
            ].map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition">
                <div>
                  <p className="font-semibold">{ticket.property} - Unit {ticket.unit}</p>
                  <p className="text-sm text-muted-foreground">{ticket.issue}</p>
                </div>
                <Badge variant="destructive">URGENT</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button className="h-auto flex-col py-4" variant="outline" onClick={() => handleNavigate('maintenance')}>
              <Wrench className="h-6 w-6 mb-2" />
              View All Tickets
            </Button>
            <Button className="h-auto flex-col py-4" variant="outline" onClick={() => handleNavigate('maintenance')}>
              <Camera className="h-6 w-6 mb-2" />
              Upload Photos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Total Properties</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 from last month</p>
          </CardContent>
        </Card>

        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Total Units</CardTitle>
            <Key className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all properties</p>
          </CardContent>
        </Card>

        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Occupancy Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.occupancyRate}%</div>
            <Progress value={stats.occupancyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Monthly Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">AED {stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-auto flex-col py-4" variant="outline">
              <Plus className="h-6 w-6 mb-2" />
              Add Property
            </Button>
            <Button className="h-auto flex-col py-4" variant="outline">
              <Users className="h-6 w-6 mb-2" />
              Add Tenant
            </Button>
            <Button className="h-auto flex-col py-4" variant="outline">
              <Wrench className="h-6 w-6 mb-2" />
              Create Maintenance
            </Button>
            <Button className="h-auto flex-col py-4" variant="outline">
              <Receipt className="h-6 w-6 mb-2" />
              Generate Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics Charts */}
      <AdvancedDashboardCharts companyId={user.companyId} />

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm">Maintenance request completed</p>
                  <p className="text-xs text-muted-foreground">Unit 205 - Plumbing repair</p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">New tenant application</p>
                  <p className="text-xs text-muted-foreground">Dubai Marina Towers - Unit 1205</p>
                </div>
                <span className="text-xs text-muted-foreground">4h ago</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm">Payment received</p>
                  <p className="text-xs text-muted-foreground">AED 8,500 - Unit 301</p>
                </div>
                <span className="text-xs text-muted-foreground">6h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Urgent Maintenance</p>
                  <p className="text-xs text-muted-foreground">AC repair needed - Unit 101</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Lease Expiring Soon</p>
                  <p className="text-xs text-muted-foreground">8 leases expire within 30 days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <CreditCard className="h-4 w-4 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Overdue Payments</p>
                  <p className="text-xs text-muted-foreground">{stats.overduePayments} payments overdue</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Properties Overview</CardTitle>
            <CardDescription>Your property portfolio</CardDescription>
          </div>
          <Button onClick={() => setActiveTab('properties')}>View All</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardProperties.slice(0, 3).map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                  {property.walkthrough3D && (
                    <Badge className="absolute top-2 right-2 bg-white/20 text-white">
                      <Video className="h-3 w-3 mr-1" />
                      3D Tour
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{property.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{property.address}</p>
                  <div className="flex justify-between text-sm">
                    <span>{property.units} units</span>
                    <span className="text-green-600">{property.occupancyRate}% occupied</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderProperties = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Properties</h2>
          <p className="text-muted-foreground">Manage your property portfolio</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative">
              {property.walkthrough3D && (
                <Button 
                  size="sm" 
                  className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  <Video className="h-4 w-4 mr-1" />
                  3D Tour
                </Button>
              )}
              <Badge className="absolute bottom-3 left-3 bg-white/90 text-gray-800">
                {property.type}
              </Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{property.name}</h3>
                <Badge variant={property.status === 'Active' ? 'default' : 'secondary'}>
                  {property.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {property.address}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Units</span>
                  <span className="font-medium">{property.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Occupancy</span>
                  <span className="font-medium text-green-600">{property.occupancyRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Revenue</span>
                  <span className="font-medium">AED {property.monthlyRent.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        // Show maintenance-only dashboard for maintenance staff
        return user.role === 'maintenance_staff' ? renderMaintenanceOnlyDashboard() : renderOverview()
      case 'buildings':
        return <BuildingsUnitsManagement user={user} accessToken={accessToken} />
      case 'properties':
        return renderProperties()
      case 'units':
        return <UnitsTenantsSystem user={user} accessToken={accessToken} />
      case 'maintenance':
        return <EnhancedMaintenanceSystem user={user} accessToken={accessToken} />
      case 'accounting':
        return <AccountingSystem user={user} accessToken={accessToken} />
      case 'leases':
        return <LeasesContractsSystem user={user} accessToken={accessToken} />
      case 'payments':
        return <PaymentsSystem user={user} accessToken={accessToken} />
      case 'reports':
        return <ReportsAnalytics user={user} accessToken={accessToken} />
      case 'calendar':
        return <CalendarSystem user={user} accessToken={accessToken} />
      case 'communications':
        return <CommunicationsSystem user={user} accessToken={accessToken} />
      case 'inspections':
        return <InspectionsSystem user={user} accessToken={accessToken} />
      case 'vendors':
        return <VendorManagement user={user} accessToken={accessToken} />
      case 'marketing':
        return <MarketingListings user={user} accessToken={accessToken} />
      case 'documents':
        return <DocumentsSystem user={user} accessToken={accessToken} />
      case 'crud-management':
        return <CRUDManagementPageSupabase user={user} />
      case 'builder':
        return <BuilderEditorManager user={user} />
      case 'ai-assistant':
        return <AIAssistant user={user} accessToken={accessToken} />
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">This feature is under development</p>
            </div>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r" data-sidebar="main">
          <SidebarHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              {/* Company Logo or Default Icon */}
              {user.companyId === ALZAHI_COMPANY.id ? (
                <img 
                  src={ALZAHI_COMPANY.logo} 
                  alt={ALZAHI_COMPANY.name}
                  className="w-10 h-10 rounded-lg object-cover shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              )}
              <div>
                <h2 className="font-bold text-lg tracking-wide" data-heading="true">
                  TasKeen P.M.S
                </h2>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]" title={user.companyName}>
                  {user.companyId === ALZAHI_COMPANY.id ? ALZAHI_COMPANY.shortName : user.companyName}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <ScrollArea className="flex-1">
              <SidebarMenu className="p-2">
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleNavigate(item.id)}
                      isActive={activeTab === item.id}
                      data-active={activeTab === item.id}
                      className="w-full justify-start group transition-all duration-300 hover:bg-accent/50"
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold tracking-wide uppercase text-xs">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
            
            <div className="p-4 border-t mt-auto">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{user.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              
              <div className="flex-1 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties, tenants, or maintenance..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
