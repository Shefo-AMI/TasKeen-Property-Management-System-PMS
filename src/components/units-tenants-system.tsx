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
import { 
  Key, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  DollarSign,
  Home,
  Bed,
  Bath,
  Square,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Upload,
  Camera,
  Star,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { CSVImportDialog } from './csv-import-dialog'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: string
  status: string
}

interface UnitsTenantsSystemProps {
  user: User
  accessToken: string | null
}

interface Unit {
  id: string
  propertyId: string
  propertyName: string
  unitNumber: string
  type: string
  bedrooms: number
  bathrooms: number
  sqft: number
  rent: number
  status: 'occupied' | 'vacant' | 'maintenance' | 'reserved'
  tenant?: Tenant
  leaseStart?: string
  leaseEnd?: string
  deposit?: number
  amenities: string[]
  images: string[]
  virtualTour?: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  employmentInfo: {
    employer: string
    position: string
    income: number
  }
  moveInDate: string
  leaseEndDate: string
  rentAmount: number
  depositAmount: number
  status: 'active' | 'notice_given' | 'eviction' | 'moved_out'
  documents: Document[]
  paymentHistory: Payment[]
  notes: string
}

interface Document {
  id: string
  name: string
  type: string
  url: string
  uploadDate: string
}

interface Payment {
  id: string
  amount: number
  date: string
  status: 'paid' | 'pending' | 'overdue'
  type: 'rent' | 'deposit' | 'utility' | 'fee'
}

export function UnitsTenantsSystem({ user, accessToken }: UnitsTenantsSystemProps) {
  const [activeTab, setActiveTab] = useState('units')
  const [units, setUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [showAddTenant, setShowAddTenant] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)

  useEffect(() => {
    loadUnitsAndTenants()
  }, [])

  const loadUnitsAndTenants = async () => {
    try {
      setIsLoading(true)
      
      // Mock data - replace with actual API calls
      const mockUnits: Unit[] = [
        {
          id: '1',
          propertyId: 'prop1',
          propertyName: 'Dubai Marina Towers',
          unitNumber: '1205',
          type: '2 Bedroom Apartment',
          bedrooms: 2,
          bathrooms: 2,
          sqft: 1200,
          rent: 8500,
          status: 'occupied',
          leaseStart: '2023-12-01',
          leaseEnd: '2024-11-30',
          deposit: 17000,
          amenities: ['Balcony', 'Marina View', 'Parking', 'Gym Access'],
          images: [],
          tenant: {
            id: 't1',
            firstName: 'Ahmed',
            lastName: 'Al-Mansouri',
            email: 'ahmed.mansouri@email.com',
            phone: '+971 50 123 4567',
            emergencyContact: {
              name: 'Fatima Al-Mansouri',
              phone: '+971 50 987 6543',
              relationship: 'Wife'
            },
            employmentInfo: {
              employer: 'Emirates Bank',
              position: 'Senior Manager',
              income: 25000
            },
            moveInDate: '2023-12-01',
            leaseEndDate: '2024-11-30',
            rentAmount: 8500,
            depositAmount: 17000,
            status: 'active',
            documents: [],
            paymentHistory: [],
            notes: 'Excellent tenant, pays on time'
          }
        },
        {
          id: '2',
          propertyId: 'prop1',
          propertyName: 'Dubai Marina Towers',
          unitNumber: '806',
          type: '1 Bedroom Apartment',
          bedrooms: 1,
          bathrooms: 1,
          sqft: 800,
          rent: 6500,
          status: 'vacant',
          amenities: ['City View', 'Parking', 'Gym Access'],
          images: [],
        },
        {
          id: '3',
          propertyId: 'prop2',
          propertyName: 'Business Bay Complex',
          unitNumber: '1501',
          type: 'Office Space',
          bedrooms: 0,
          bathrooms: 2,
          sqft: 1500,
          rent: 12000,
          status: 'maintenance',
          amenities: ['Conference Room', 'Reception Area', 'Parking'],
          images: [],
        }
      ]

      setUnits(mockUnits)
      
    } catch (error) {
      console.error('Error loading units and tenants:', error)
      toast.error('Failed to load units and tenants')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.tenant?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.tenant?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter
    const matchesProperty = propertyFilter === 'all' || unit.propertyId === propertyFilter
    
    return matchesSearch && matchesStatus && matchesProperty
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'default'
      case 'vacant': return 'secondary'
      case 'maintenance': return 'destructive'
      case 'reserved': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <CheckCircle className="h-4 w-4" />
      case 'vacant': return <Key className="h-4 w-4" />
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />
      case 'reserved': return <Clock className="h-4 w-4" />
      default: return <Key className="h-4 w-4" />
    }
  }

  const renderUnitsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredUnits.map((unit) => (
        <Card key={unit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <div className="h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
              {unit.virtualTour && (
                <Badge className="absolute top-2 right-2 bg-white/20 text-white">
                  <Eye className="h-3 w-3 mr-1" />
                  Virtual Tour
                </Badge>
              )}
            </div>
            <Badge 
              className="absolute bottom-2 left-2"
              variant={getStatusColor(unit.status)}
            >
              {getStatusIcon(unit.status)}
              <span className="ml-1 capitalize">{unit.status}</span>
            </Badge>
          </div>
          
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">Unit {unit.unitNumber}</h3>
                <p className="text-sm text-muted-foreground">{unit.propertyName}</p>
              </div>
              <span className="font-bold text-lg">AED {unit.rent.toLocaleString()}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{unit.type}</p>
            
            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {unit.bedrooms}
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                {unit.bathrooms}
              </div>
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                {unit.sqft} sqft
              </div>
            </div>

            {unit.tenant && (
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {unit.tenant.firstName[0]}{unit.tenant.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {unit.tenant.firstName} {unit.tenant.lastName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lease ends: {new Date(unit.tenant.leaseEndDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedUnit(unit)}
              >
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
  )

  const renderUnitDetails = () => (
    <Sheet open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Unit {selectedUnit?.unitNumber}</SheetTitle>
          <SheetDescription>{selectedUnit?.propertyName}</SheetDescription>
        </SheetHeader>
        
        {selectedUnit && (
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            <div className="space-y-6">
              {/* Unit Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unit Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unit Type</Label>
                      <p className="text-sm font-medium">{selectedUnit.type}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge variant={getStatusColor(selectedUnit.status)} className="mt-1">
                        {selectedUnit.status}
                      </Badge>
                    </div>
                    <div>
                      <Label>Monthly Rent</Label>
                      <p className="text-sm font-medium">AED {selectedUnit.rent.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Square Feet</Label>
                      <p className="text-sm font-medium">{selectedUnit.sqft} sqft</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Amenities</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedUnit.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tenant Info */}
              {selectedUnit.tenant && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Tenant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {selectedUnit.tenant.firstName[0]}{selectedUnit.tenant.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedUnit.tenant.firstName} {selectedUnit.tenant.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedUnit.tenant.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Phone</Label>
                        <p className="font-medium">{selectedUnit.tenant.phone}</p>
                      </div>
                      <div>
                        <Label>Move-in Date</Label>
                        <p className="font-medium">
                          {new Date(selectedUnit.tenant.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label>Lease End</Label>
                        <p className="font-medium">
                          {new Date(selectedUnit.tenant.leaseEndDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label>Deposit</Label>
                        <p className="font-medium">AED {selectedUnit.tenant.depositAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <Label>Employment</Label>
                      <p className="text-sm font-medium">{selectedUnit.tenant.employmentInfo.position}</p>
                      <p className="text-sm text-muted-foreground">{selectedUnit.tenant.employmentInfo.employer}</p>
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
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-1" />
                        Lease
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">
                      <Camera className="h-4 w-4 mr-1" />
                      Add Photos
                    </Button>
                    <Button size="sm" variant="outline">
                      <Zap className="h-4 w-4 mr-1" />
                      Virtual Tour
                    </Button>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Tenant
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      Documents
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
          <h2 className="text-2xl font-bold">Units & Tenants</h2>
          <p className="text-muted-foreground">Manage your property units and tenant relationships</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCSVImport(true)}
            className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV/Excel
          </Button>
          <Button onClick={() => setShowAddTenant(true)}>
            <Users className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
          <Button onClick={() => setShowAddUnit(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search units, tenants..."
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
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="prop1">Dubai Marina Towers</SelectItem>
                <SelectItem value="prop2">Business Bay Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{units.length}</p>
              </div>
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-green-600">
                  {units.filter(u => u.status === 'occupied').length}
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
                <p className="text-sm text-muted-foreground">Vacant</p>
                <p className="text-2xl font-bold text-orange-600">
                  {units.filter(u => u.status === 'vacant').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((units.filter(u => u.status === 'occupied').length / units.length) * 100)}%
                </p>
              </div>
              <Progress 
                value={(units.filter(u => u.status === 'occupied').length / units.length) * 100} 
                className="w-8 h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="mt-6">
          {renderUnitsGrid()}
        </TabsContent>
        
        <TabsContent value="table" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                    <TableCell>{unit.propertyName}</TableCell>
                    <TableCell>{unit.type}</TableCell>
                    <TableCell>
                      {unit.tenant ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {unit.tenant.firstName[0]}{unit.tenant.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {unit.tenant.firstName} {unit.tenant.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Vacant</span>
                      )}
                    </TableCell>
                    <TableCell>AED {unit.rent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(unit.status)}>
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedUnit(unit)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {renderUnitDetails()}

      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={showCSVImport}
        onOpenChange={setShowCSVImport}
        onImportComplete={() => {
          loadUnitsAndTenants()
          setShowCSVImport(false)
        }}
        companyId={user.companyId}
      />
    </div>
  )
}
