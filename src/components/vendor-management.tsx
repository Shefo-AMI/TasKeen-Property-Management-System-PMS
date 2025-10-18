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
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { 
  Truck, 
  Plus, 
  Search, 
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Award,
  Users,
  Wrench
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { demoVendors, Vendor } from '../utils/demo-data'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: 'platform_admin' | 'company_admin' | 'employee'
}

interface VendorManagementProps {
  user: User
  accessToken: string | null
}

interface VendorJob {
  id: string
  vendorId: string
  vendorName: string
  maintenanceRequestId: string
  propertyId: string
  propertyName: string
  unitId: string
  unitNumber: string
  jobTitle: string
  jobDescription: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  estimatedCost: number
  actualCost: number
  estimatedHours: number
  actualHours: number
  scheduledDate: string
  startedAt?: string
  completedAt?: string
  rating?: number
  feedback?: string
  invoiceGenerated: boolean
  invoiceId?: string
  createdAt: string
  updatedAt: string
}

interface VendorContract {
  id: string
  vendorId: string
  vendorName: string
  contractNumber: string
  type: 'fixed_term' | 'ongoing' | 'project_based'
  startDate: string
  endDate?: string
  services: string[]
  hourlyRate: number
  emergencyRate: number
  responseTime: number // hours
  paymentTerms: string
  status: 'active' | 'expired' | 'terminated' | 'pending'
  autoRenewal: boolean
  performanceMetrics: {
    responseTime: number
    completionRate: number
    qualityScore: number
    customerSatisfaction: number
  }
  documents: {
    id: string
    name: string
    type: string
    url: string
    expiryDate?: string
  }[]
  createdAt: string
  updatedAt: string
}

// Demo data for jobs and contracts
const demoVendorJobs: VendorJob[] = [
  {
    id: 'job-001',
    vendorId: 'vendor-001',
    vendorName: 'Ahmed Hassan - CoolTech Services',
    maintenanceRequestId: 'maint-001',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    jobTitle: 'AC Unit Repair',
    jobDescription: 'AC unit not cooling properly in main bedroom',
    category: 'HVAC',
    priority: 'high',
    status: 'in_progress',
    estimatedCost: 500,
    actualCost: 0,
    estimatedHours: 3,
    actualHours: 0,
    scheduledDate: '2024-01-16T10:00:00Z',
    startedAt: '2024-01-16T10:15:00Z',
    invoiceGenerated: false,
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-16T10:15:00Z'
  },
  {
    id: 'job-002',
    vendorId: 'vendor-002',
    vendorName: 'ElectroFix Dubai',
    maintenanceRequestId: 'maint-002',
    propertyId: 'prop-002',
    propertyName: 'Business Bay Executive Center',
    unitId: 'unit-003',
    unitNumber: '1501',
    jobTitle: 'Projector Repair',
    jobDescription: 'Conference room projector displaying distorted colors',
    category: 'Electrical',
    priority: 'medium',
    status: 'completed',
    estimatedCost: 300,
    actualCost: 280,
    estimatedHours: 4,
    actualHours: 4,
    scheduledDate: '2024-01-11T14:00:00Z',
    startedAt: '2024-01-11T14:00:00Z',
    completedAt: '2024-01-12T16:30:00Z',
    rating: 5,
    feedback: 'Excellent work, very professional and timely',
    invoiceGenerated: true,
    invoiceId: 'inv-002',
    createdAt: '2024-01-10T11:15:00Z',
    updatedAt: '2024-01-12T16:30:00Z'
  }
]

const demoVendorContracts: VendorContract[] = [
  {
    id: 'contract-001',
    vendorId: 'vendor-001',
    vendorName: 'Ahmed Hassan - CoolTech Services',
    contractNumber: 'CTR-2024-001',
    type: 'ongoing',
    startDate: '2024-01-01',
    services: ['HVAC Maintenance', 'Air Conditioning Repair', 'Ventilation Services'],
    hourlyRate: 150,
    emergencyRate: 200,
    responseTime: 4,
    paymentTerms: 'Net 30 days',
    status: 'active',
    autoRenewal: true,
    performanceMetrics: {
      responseTime: 2.5,
      completionRate: 95,
      qualityScore: 4.8,
      customerSatisfaction: 4.7
    },
    documents: [
      {
        id: 'doc-001',
        name: 'Service Agreement',
        type: 'contract',
        url: 'service-agreement-001.pdf',
        expiryDate: '2024-12-31'
      },
      {
        id: 'doc-002',
        name: 'Insurance Certificate',
        type: 'insurance',
        url: 'insurance-cert-001.pdf',
        expiryDate: '2024-12-31'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
]

export function VendorManagement({ user, accessToken }: VendorManagementProps) {
  const [activeTab, setActiveTab] = useState('vendors')
  const [vendors, setVendors] = useState<Vendor[]>(demoVendors)
  const [vendorJobs, setVendorJobs] = useState<VendorJob[]>(demoVendorJobs)
  const [vendorContracts, setVendorContracts] = useState<VendorContract[]>(demoVendorContracts)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [showVendorDetails, setShowVendorDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAvailability, setFilterAvailability] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter vendors
  const getFilteredVendors = () => {
    return vendors.filter(vendor => {
      const matchesSearch = searchTerm === '' || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory
      const matchesAvailability = filterAvailability === 'all' || vendor.availability === filterAvailability

      return matchesSearch && matchesCategory && matchesAvailability
    }).sort((a, b) => b.rating - a.rating)
  }

  const getAvailabilityColor = (availability: Vendor['availability']) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'unavailable': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobStatusColor = (status: VendorJob['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddVendor = async (vendorData: Partial<Vendor>) => {
    setIsLoading(true)
    try {
      const newVendor: Vendor = {
        id: `vendor-${Date.now()}`,
        name: vendorData.name || '',
        company: vendorData.company || '',
        email: vendorData.email || '',
        phone: vendorData.phone || '',
        category: vendorData.category || 'General',
        specialties: vendorData.specialties || [],
        rating: 0,
        hourlyRate: vendorData.hourlyRate || 0,
        availability: 'available',
        totalJobs: 0,
        averageResponseTime: 0,
        address: vendorData.address || '',
        licenseNumber: vendorData.licenseNumber || '',
        insuranceExpiry: vendorData.insuranceExpiry || '',
        emergencyContact: vendorData.emergencyContact || false,
        preferredPaymentMethod: vendorData.preferredPaymentMethod || 'Bank Transfer',
        notes: vendorData.notes || '',
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...vendorData
      }

      setVendors(prev => [...prev, newVendor])
      setShowAddVendor(false)
      toast.success('Vendor added successfully')
    } catch (error) {
      toast.error('Failed to add vendor')
    } finally {
      setIsLoading(false)
    }
  }

  const renderVendorsList = () => (
    <div className="space-y-4">
      {getFilteredVendors().map((vendor) => (
        <Card key={vendor.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{vendor.name}</h3>
                    <Badge className={getAvailabilityColor(vendor.availability)}>
                      {vendor.availability}
                    </Badge>
                    {vendor.emergencyContact && (
                      <Badge variant="outline" className="text-red-600">
                        Emergency
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-2">{vendor.company}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{vendor.category}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({vendor.totalJobs} jobs)</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium">AED {vendor.hourlyRate}/hr</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-muted-foreground text-sm">Specialties:</p>
                    <div className="flex gap-1 mt-1">
                      {vendor.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {vendor.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{vendor.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {vendor.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {vendor.email}
                    </div>
                    {vendor.lastJobDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last job: {new Date(vendor.lastJobDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedVendor(vendor)
                    setShowVendorDetails(true)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button size="sm">
                  <Wrench className="h-4 w-4 mr-2" />
                  Assign Job
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {getFilteredVendors().length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'No vendors available'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderJobsList = () => (
    <div className="space-y-4">
      {vendorJobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{job.jobTitle}</h3>
                  <Badge className={getJobStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={
                    job.priority === 'urgent' ? 'text-red-600' :
                    job.priority === 'high' ? 'text-orange-600' :
                    job.priority === 'medium' ? 'text-yellow-600' :
                    'text-gray-600'
                  }>
                    {job.priority}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Vendor</p>
                    <p className="font-medium">{job.vendorName}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Property</p>
                    <p className="font-medium">{job.propertyName}</p>
                    <p className="text-muted-foreground">Unit {job.unitNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Scheduled</p>
                    <p className="font-medium">
                      {new Date(job.scheduledDate).toLocaleDateString()} at{' '}
                      {new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mt-2">{job.jobDescription}</p>
                
                <div className="flex items-center gap-6 mt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Estimated: </span>
                    <span className="font-medium">AED {job.estimatedCost.toLocaleString()}</span>
                  </div>
                  {job.actualCost > 0 && (
                    <div>
                      <span className="text-muted-foreground">Actual: </span>
                      <span className="font-medium">AED {job.actualCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Hours: </span>
                    <span className="font-medium">{job.estimatedHours}h estimated</span>
                  </div>
                  {job.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{job.rating}</span>
                    </div>
                  )}
                </div>
                
                {job.feedback && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm"><strong>Feedback:</strong> {job.feedback}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Details
                </Button>
                {job.invoiceGenerated && (
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Invoice
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderContractsList = () => (
    <div className="space-y-4">
      {vendorContracts.map((contract) => (
        <Card key={contract.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{contract.contractNumber}</h3>
                  <Badge className={
                    contract.status === 'active' ? 'bg-green-100 text-green-800' :
                    contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                    contract.status === 'terminated' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {contract.status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {contract.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-3">{contract.vendorName}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Services</p>
                    <div className="space-y-1">
                      {contract.services.slice(0, 2).map((service, index) => (
                        <p key={index} className="font-medium">{service}</p>
                      ))}
                      {contract.services.length > 2 && (
                        <p className="text-muted-foreground">+{contract.services.length - 2} more</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Rates</p>
                    <p className="font-medium">AED {contract.hourlyRate}/hr</p>
                    <p className="text-muted-foreground">Emergency: AED {contract.emergencyRate}/hr</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Performance</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Quality:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">{contract.performanceMetrics.qualityScore}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Completion:</span>
                        <span className="text-xs font-medium">{contract.performanceMetrics.completionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Contract Period</p>
                    <p className="font-medium">
                      {new Date(contract.startDate).toLocaleDateString()}
                      {contract.endDate && ` - ${new Date(contract.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm">Response Time</p>
                    <p className="font-medium">{contract.responseTime} hours</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Contract
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vendor Management</h2>
          <p className="text-muted-foreground">Manage vendors, contractors, and service providers</p>
        </div>
        <Button onClick={() => setShowAddVendor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="Cleaning">Cleaning</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAvailability} onValueChange={setFilterAvailability}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="mt-6">
          {renderVendorsList()}
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          {renderJobsList()}
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          {renderContractsList()}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
                <CardDescription>Based on ratings and completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 5)
                    .map((vendor) => (
                      <div key={vendor.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-muted-foreground">{vendor.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{vendor.totalJobs} jobs</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
                <CardDescription>Average response times by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['HVAC', 'Electrical', 'Plumbing', 'General'].map((category) => {
                    const categoryVendors = vendors.filter(v => v.category === category)
                    const avgResponseTime = categoryVendors.length > 0 
                      ? categoryVendors.reduce((sum, v) => sum + v.averageResponseTime, 0) / categoryVendors.length 
                      : 0
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {avgResponseTime.toFixed(1)}h avg
                          </span>
                        </div>
                        <Progress value={Math.max(0, 100 - (avgResponseTime * 10))} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <Dialog open={showAddVendor} onOpenChange={setShowAddVendor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Add a new vendor or service provider
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            handleAddVendor({
              name: formData.get('name') as string,
              company: formData.get('company') as string,
              email: formData.get('email') as string,
              phone: formData.get('phone') as string,
              category: formData.get('category') as Vendor['category'],
              specialties: (formData.get('specialties') as string).split(',').map(s => s.trim()),
              hourlyRate: Number(formData.get('hourlyRate')),
              address: formData.get('address') as string,
              licenseNumber: formData.get('licenseNumber') as string,
              insuranceExpiry: formData.get('insuranceExpiry') as string,
              emergencyContact: formData.get('emergencyContact') === 'on',
              preferredPaymentMethod: formData.get('paymentMethod') as string,
              notes: formData.get('notes') as string,
            })
          }}>
            <ScrollArea className="max-h-[60vh]">
              <div className="grid gap-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Contact Name *</Label>
                    <Input id="name" name="name" required />
                  </div>

                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input id="company" name="company" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="HVAC">HVAC</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Landscaping">Landscaping</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (AED) *</Label>
                    <Input id="hourlyRate" name="hourlyRate" type="number" min="0" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                  <Input 
                    id="specialties" 
                    name="specialties" 
                    placeholder="e.g., Air Conditioning, Plumbing Repair, Installation"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" placeholder="Business address" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input id="licenseNumber" name="licenseNumber" />
                  </div>

                  <div>
                    <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                    <Input id="insuranceExpiry" name="insuranceExpiry" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                    <Select name="paymentMethod" defaultValue="Bank Transfer">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input type="checkbox" id="emergencyContact" name="emergencyContact" />
                    <Label htmlFor="emergencyContact">Available for emergency calls</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Additional notes about the vendor..." 
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Vendor'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddVendor(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{vendors.length}</p>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{vendors.filter(v => v.availability === 'available').length}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{vendorJobs.filter(j => j.status === 'in_progress').length}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {vendors.length > 0 ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1) : '0.0'}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}