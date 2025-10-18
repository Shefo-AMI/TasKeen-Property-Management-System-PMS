import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Calendar } from './ui/calendar'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  DollarSign,
  Home,
  Users,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle,
  PieChart,
  LineChart,
  Activity,
  Target,
  Percent,
  Building2,
  FileText,
  Mail,
  Share,
  Settings,
  Eye
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area } from 'recharts'
import { toast } from 'sonner@2.0.3'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: string
  status: string
}

interface ReportsAnalyticsProps {
  user: User
  accessToken: string | null
}

interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  occupancyRate: number
  averageRent: number
  collectionRate: number
  monthlyGrowth: number
  yearOverYearGrowth: number
}

interface PropertyMetrics {
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  maintenanceUnits: number
  averageDaysVacant: number
  turnoverRate: number
}

interface TenantMetrics {
  totalTenants: number
  newTenants: number
  renewals: number
  moveOuts: number
  retentionRate: number
  averageTenureMonths: number
  satisfactionScore: number
}

interface MaintenanceMetrics {
  totalRequests: number
  completedRequests: number
  pendingRequests: number
  averageResolutionDays: number
  maintenanceCosts: number
  emergencyRequests: number
  preventiveMaintenanceRate: number
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']

export function ReportsAnalytics({ user, accessToken }: ReportsAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDateRange, setSelectedDateRange] = useState('last_12_months')
  const [selectedProperty, setSelectedProperty] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  
  // Metrics state
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null)
  const [propertyMetrics, setPropertyMetrics] = useState<PropertyMetrics | null>(null)
  const [tenantMetrics, setTenantMetrics] = useState<TenantMetrics | null>(null)
  const [maintenanceMetrics, setMaintenanceMetrics] = useState<MaintenanceMetrics | null>(null)

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 245000, expenses: 180000, netIncome: 65000 },
    { month: 'Feb', revenue: 255000, expenses: 175000, netIncome: 80000 },
    { month: 'Mar', revenue: 268000, expenses: 182000, netIncome: 86000 },
    { month: 'Apr', revenue: 272000, expenses: 178000, netIncome: 94000 },
    { month: 'May', revenue: 285000, expenses: 185000, netIncome: 100000 },
    { month: 'Jun', revenue: 292000, expenses: 188000, netIncome: 104000 },
    { month: 'Jul', revenue: 298000, expenses: 190000, netIncome: 108000 },
    { month: 'Aug', revenue: 305000, expenses: 192000, netIncome: 113000 },
    { month: 'Sep', revenue: 312000, expenses: 195000, netIncome: 117000 },
    { month: 'Oct', revenue: 318000, expenses: 198000, netIncome: 120000 },
    { month: 'Nov', revenue: 325000, expenses: 200000, netIncome: 125000 },
    { month: 'Dec', revenue: 332000, expenses: 202000, netIncome: 130000 }
  ]

  const occupancyData = [
    { month: 'Jan', occupancyRate: 88.5 },
    { month: 'Feb', occupancyRate: 89.2 },
    { month: 'Mar', occupancyRate: 90.1 },
    { month: 'Apr', occupancyRate: 91.3 },
    { month: 'May', occupancyRate: 92.0 },
    { month: 'Jun', occupancyRate: 92.8 },
    { month: 'Jul', occupancyRate: 93.2 },
    { month: 'Aug', occupancyRate: 93.8 },
    { month: 'Sep', occupancyRate: 94.1 },
    { month: 'Oct', occupancyRate: 94.5 },
    { month: 'Nov', occupancyRate: 95.0 },
    { month: 'Dec', occupancyRate: 95.3 }
  ]

  const propertyTypeData = [
    { name: 'Residential', value: 65, count: 28 },
    { name: 'Commercial', value: 25, count: 12 },
    { name: 'Mixed Use', value: 10, count: 5 }
  ]

  const maintenanceTypeData = [
    { name: 'HVAC', value: 35, cost: 125000 },
    { name: 'Plumbing', value: 25, cost: 85000 },
    { name: 'Electrical', value: 20, cost: 65000 },
    { name: 'General', value: 15, cost: 45000 },
    { name: 'Emergency', value: 5, cost: 25000 }
  ]

  const tenantRetentionData = [
    { month: 'Jan', retentionRate: 92.5, newTenants: 12, moveOuts: 8 },
    { month: 'Feb', retentionRate: 93.2, newTenants: 15, moveOuts: 6 },
    { month: 'Mar', retentionRate: 94.1, newTenants: 18, moveOuts: 7 },
    { month: 'Apr', retentionRate: 93.8, newTenants: 14, moveOuts: 9 },
    { month: 'May', retentionRate: 94.5, newTenants: 16, moveOuts: 5 },
    { month: 'Jun', retentionRate: 95.2, newTenants: 20, moveOuts: 4 },
    { month: 'Jul', retentionRate: 95.8, newTenants: 22, moveOuts: 3 },
    { month: 'Aug', retentionRate: 96.1, newTenants: 19, moveOuts: 3 },
    { month: 'Sep', retentionRate: 95.9, newTenants: 17, moveOuts: 4 },
    { month: 'Oct', retentionRate: 96.3, newTenants: 21, moveOuts: 2 },
    { month: 'Nov', retentionRate: 96.7, newTenants: 23, moveOuts: 2 },
    { month: 'Dec', retentionRate: 97.0, newTenants: 25, moveOuts: 1 }
  ]

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedDateRange, selectedProperty])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      
      // Mock data - replace with actual API calls
      setFinancialMetrics({
        totalRevenue: 3542000,
        totalExpenses: 2280000,
        netIncome: 1262000,
        occupancyRate: 95.3,
        averageRent: 8750,
        collectionRate: 96.8,
        monthlyGrowth: 2.3,
        yearOverYearGrowth: 12.5
      })

      setPropertyMetrics({
        totalProperties: 45,
        totalUnits: 320,
        occupiedUnits: 305,
        vacantUnits: 12,
        maintenanceUnits: 3,
        averageDaysVacant: 18,
        turnoverRate: 8.2
      })

      setTenantMetrics({
        totalTenants: 287,
        newTenants: 52,
        renewals: 158,
        moveOuts: 24,
        retentionRate: 92.4,
        averageTenureMonths: 28,
        satisfactionScore: 4.6
      })

      setMaintenanceMetrics({
        totalRequests: 345,
        completedRequests: 325,
        pendingRequests: 20,
        averageResolutionDays: 3.2,
        maintenanceCosts: 345000,
        emergencyRequests: 18,
        preventiveMaintenanceRate: 65.8
      })
      
    } catch (error) {
      console.error('Error loading analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {financialMetrics?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{financialMetrics?.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {financialMetrics?.netIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((financialMetrics?.netIncome || 0) / (financialMetrics?.totalRevenue || 1) * 100).toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialMetrics?.occupancyRate}%</div>
            <Progress value={financialMetrics?.occupancyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialMetrics?.collectionRate}%</div>
            <p className="text-xs text-muted-foreground">Payment collections</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Expenses Trend</CardTitle>
          <CardDescription>Monthly financial performance over the year</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`AED ${Number(value).toLocaleString()}`, '']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
              <Line type="monotone" dataKey="netIncome" stroke="#10b981" name="Net Income" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Occupancy & Property Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate Trend</CardTitle>
            <CardDescription>Monthly occupancy percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy Rate']} />
                <Area type="monotone" dataKey="occupancyRate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Type Distribution</CardTitle>
            <CardDescription>Portfolio composition by property type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total Properties</span>
              <span className="font-medium">{propertyMetrics?.totalProperties}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Units</span>
              <span className="font-medium">{propertyMetrics?.totalUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Occupied Units</span>
              <span className="font-medium text-green-600">{propertyMetrics?.occupiedUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Vacant Units</span>
              <span className="font-medium text-orange-600">{propertyMetrics?.vacantUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg. Days Vacant</span>
              <span className="font-medium">{propertyMetrics?.averageDaysVacant} days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tenant Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total Tenants</span>
              <span className="font-medium">{tenantMetrics?.totalTenants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">New Tenants</span>
              <span className="font-medium text-green-600">{tenantMetrics?.newTenants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Renewals</span>
              <span className="font-medium">{tenantMetrics?.renewals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Retention Rate</span>
              <span className="font-medium">{tenantMetrics?.retentionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg. Tenure</span>
              <span className="font-medium">{tenantMetrics?.averageTenureMonths} months</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maintenance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total Requests</span>
              <span className="font-medium">{maintenanceMetrics?.totalRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Completed</span>
              <span className="font-medium text-green-600">{maintenanceMetrics?.completedRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Pending</span>
              <span className="font-medium text-orange-600">{maintenanceMetrics?.pendingRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg. Resolution</span>
              <span className="font-medium">{maintenanceMetrics?.averageResolutionDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Costs</span>
              <span className="font-medium">AED {maintenanceMetrics?.maintenanceCosts.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderFinancialReports = () => (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {financialMetrics?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              YoY Growth: +{financialMetrics?.yearOverYearGrowth}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {financialMetrics?.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((financialMetrics?.totalExpenses || 0) / (financialMetrics?.totalRevenue || 1) * 100).toFixed(1)}% of revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Operating Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {financialMetrics?.netIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Profit Margin: {((financialMetrics?.netIncome || 0) / (financialMetrics?.totalRevenue || 1) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rent</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {financialMetrics?.averageRent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per unit per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
          <CardDescription>Revenue streams and expense analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`AED ${Number(value).toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Bar dataKey="netIncome" fill="#10b981" name="Net Income" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Key financial metrics and ratios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className="text-lg font-semibold text-green-600">+{financialMetrics?.monthlyGrowth}%</p>
                <p className="text-xs">Month over month</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-lg font-semibold">{financialMetrics?.collectionRate}%</p>
                <p className="text-xs">Payment collections</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Expense Ratio</p>
                <p className="text-lg font-semibold">
                  {((financialMetrics?.totalExpenses || 0) / (financialMetrics?.totalRevenue || 1) * 100).toFixed(1)}%
                </p>
                <p className="text-xs">Operating efficiency</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-lg font-semibold text-green-600">8.5%</p>
                <p className="text-xs">Return on investment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share Report
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="last_12_months">Last 12 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Property Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="residential">Residential Only</SelectItem>
                <SelectItem value="commercial">Commercial Only</SelectItem>
                <SelectItem value="mixed">Mixed Use Only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="tenant">Tenant</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewDashboard()}
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {renderFinancialReports()}
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          {/* Occupancy Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{propertyMetrics?.occupancyRate}%</div>
                <Progress value={propertyMetrics?.occupancyRate} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {propertyMetrics?.occupiedUnits} of {propertyMetrics?.totalUnits} units occupied
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Turnover Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{propertyMetrics?.turnoverRate}%</div>
                <p className="text-sm text-muted-foreground">Annual turnover rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Avg. Days Vacant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{propertyMetrics?.averageDaysVacant}</div>
                <p className="text-sm text-muted-foreground">Days to fill vacant units</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Occupancy Trend</CardTitle>
              <CardDescription>Monthly occupancy rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy Rate']} />
                  <Line type="monotone" dataKey="occupancyRate" stroke="#3b82f6" strokeWidth={3} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          {/* Maintenance Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{maintenanceMetrics?.totalRequests}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{maintenanceMetrics?.completedRequests}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Resolution</p>
                    <p className="text-2xl font-bold">{maintenanceMetrics?.averageResolutionDays}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Costs</p>
                    <p className="text-2xl font-bold">AED {maintenanceMetrics?.maintenanceCosts.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance by Type</CardTitle>
              <CardDescription>Distribution of maintenance requests and costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart data={maintenanceTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Requests %" />
                  <Bar yAxisId="right" dataKey="cost" fill="#10b981" name="Cost (AED)" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant" className="space-y-6">
          {/* Tenant Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tenants</p>
                    <p className="text-2xl font-bold">{tenantMetrics?.totalTenants}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Retention Rate</p>
                    <p className="text-2xl font-bold text-green-600">{tenantMetrics?.retentionRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Tenure</p>
                    <p className="text-2xl font-bold">{tenantMetrics?.averageTenureMonths}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Satisfaction</p>
                    <p className="text-2xl font-bold">{tenantMetrics?.satisfactionScore}/5</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tenant Retention & Movement</CardTitle>
              <CardDescription>Monthly tenant retention rates and movement patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={tenantRetentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" domain={[90, 100]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="retentionRate" stroke="#3b82f6" strokeWidth={2} name="Retention Rate %" />
                  <Line yAxisId="right" type="monotone" dataKey="newTenants" stroke="#10b981" strokeWidth={2} name="New Tenants" />
                  <Line yAxisId="right" type="monotone" dataKey="moveOuts" stroke="#ef4444" strokeWidth={2} name="Move Outs" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Custom Reports</h3>
            <p className="text-muted-foreground mb-4">Create personalized reports with custom metrics and visualizations</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Report
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}