import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Building2, Users, FileText, Wrench, FolderOpen, Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { PropertyCRUD, TenantCRUD, LeaseCRUD, MaintenanceCRUD, DocumentManager } from './crud'
import type { Property, Tenant, Lease, Maintenance, Document } from './crud'
import { toast } from 'sonner'

// Mock data for demonstration
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Sunset Towers',
    address: '123 Sheikh Zayed Road',
    city: 'Dubai',
    state: 'Dubai',
    zipCode: '00000',
    propertyType: 'residential',
    units: 24,
    yearBuilt: 2018,
    totalArea: 25000,
    monthlyRent: 48000,
    status: 'active',
    occupancyRate: 92,
    description: 'Luxury residential complex with modern amenities',
    amenities: 'Pool, Gym, Parking, Security',
    imageUrl: '',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Marina Heights',
    address: '456 Dubai Marina',
    city: 'Dubai',
    state: 'Dubai',
    zipCode: '00000',
    propertyType: 'residential',
    units: 36,
    yearBuilt: 2020,
    totalArea: 35000,
    monthlyRent: 72000,
    status: 'active',
    occupancyRate: 95,
    description: 'Premium waterfront apartments',
    amenities: 'Marina View, Gym, Pool, Concierge',
    imageUrl: '',
    createdAt: new Date('2023-03-20'),
  },
]

const mockTenants: Tenant[] = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Al-Mansouri',
    email: 'ahmed.mansouri@example.com',
    phone: '+971 50 123 4567',
    dateOfBirth: '1985-05-15',
    nationalId: '784-1985-1234567-1',
    occupation: 'Software Engineer',
    emergencyContact: 'Fatima Al-Mansouri',
    emergencyPhone: '+971 50 765 4321',
    moveInDate: '2023-06-01',
    monthlyRent: 4500,
    securityDeposit: 9000,
    propertyId: '1',
    unitNumber: '301',
    status: 'active',
    paymentStatus: 'current',
    createdAt: new Date('2023-05-15'),
  },
]

const mockLeases: Lease[] = [
  {
    id: '1',
    propertyId: '1',
    unitNumber: '301',
    tenantId: '1',
    startDate: '2023-06-01',
    endDate: '2024-06-01',
    monthlyRent: 4500,
    securityDeposit: 9000,
    paymentDueDay: 1,
    lateFeeAmount: 100,
    lateFeeGracePeriod: 5,
    leaseType: 'yearly',
    renewalOption: 'manual',
    petAllowed: false,
    smokingAllowed: false,
    parkingSpaces: 1,
    status: 'active',
    createdAt: new Date('2023-05-20'),
    updatedAt: new Date('2023-05-20'),
  },
]

const mockMaintenance: Maintenance[] = [
  {
    id: '1',
    title: 'AC not cooling properly',
    description: 'The air conditioning in unit 301 is not cooling effectively',
    priority: 'high',
    category: 'hvac',
    propertyId: '1',
    unitNumber: '301',
    tenantId: '1',
    status: 'in_progress',
    createdBy: 'system',
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-10-08'),
    estimatedCost: 500,
  },
]

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Lease Agreement - Ahmed Al-Mansouri',
    type: 'application/pdf',
    size: 245678,
    url: 'https://example.com/lease.pdf',
    category: 'lease',
    linkedTo: 'lease',
    linkedId: '1',
    linkedName: 'Unit 301 - Sunset Towers',
    uploadedBy: 'Admin',
    uploadedAt: new Date('2023-05-20'),
    description: 'Signed lease agreement for 1 year term',
  },
]

export function CRUDManagementPage() {
  const [activeTab, setActiveTab] = useState('properties')
  
  // Property CRUD state
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false)
  const [propertyMode, setPropertyMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>()
  const [properties, setProperties] = useState<Property[]>(mockProperties)

  // Tenant CRUD state
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false)
  const [tenantMode, setTenantMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>()
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants)

  // Lease CRUD state
  const [leaseDialogOpen, setLeaseDialogOpen] = useState(false)
  const [leaseMode, setLeaseMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedLease, setSelectedLease] = useState<Lease | undefined>()
  const [leases, setLeases] = useState<Lease[]>(mockLeases)

  // Maintenance CRUD state
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | undefined>()
  const [maintenanceTickets, setMaintenanceTickets] = useState<Maintenance[]>(mockMaintenance)

  // Document Manager state
  const [documentManagerOpen, setDocumentManagerOpen] = useState(false)
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)

  // Property handlers
  const handlePropertySave = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (propertyMode === 'create') {
      const newProperty: Property = {
        ...data,
        id: Date.now().toString(),
        status: 'active',
        occupancyRate: 0,
        createdAt: new Date(),
      }
      setProperties([...properties, newProperty])
    } else {
      setProperties(properties.map(p => 
        p.id === selectedProperty?.id ? { ...p, ...data } : p
      ))
    }
  }

  // Tenant handlers
  const handleTenantSave = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (tenantMode === 'create') {
      const newTenant: Tenant = {
        ...data,
        id: Date.now().toString(),
        status: 'active',
        paymentStatus: 'current',
        createdAt: new Date(),
      }
      setTenants([...tenants, newTenant])
    } else {
      setTenants(tenants.map(t => 
        t.id === selectedTenant?.id ? { ...t, ...data } : t
      ))
    }
  }

  // Lease handlers
  const handleLeaseSave = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (leaseMode === 'create') {
      const newLease: Lease = {
        ...data,
        id: Date.now().toString(),
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setLeases([...leases, newLease])
    } else {
      setLeases(leases.map(l => 
        l.id === selectedLease?.id ? { ...l, ...data, updatedAt: new Date() } : l
      ))
    }
  }

  // Maintenance handlers
  const handleMaintenanceSave = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (maintenanceMode === 'create') {
      const newTicket: Maintenance = {
        ...data,
        id: Date.now().toString(),
        status: 'open',
        createdBy: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setMaintenanceTickets([...maintenanceTickets, newTicket])
    } else {
      setMaintenanceTickets(maintenanceTickets.map(m => 
        m.id === selectedMaintenance?.id ? { ...m, ...data, updatedAt: new Date() } : m
      ))
    }
  }

  const handleMaintenanceComplete = async (id: string, actualCost: number, afterPhotos: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setMaintenanceTickets(maintenanceTickets.map(m => 
      m.id === id ? { 
        ...m, 
        status: 'completed', 
        actualCost,
        afterPhotos,
        completedAt: new Date(),
        updatedAt: new Date(),
      } : m
    ))
    
    toast.success('Invoice generated successfully!')
  }

  // Document handlers
  const handleDocumentUpload = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newDoc: Document = {
      id: Date.now().toString(),
      name: data.name,
      type: data.file?.type || 'application/pdf',
      size: data.file?.size || 0,
      url: data.file ? URL.createObjectURL(data.file) : 'https://example.com/doc.pdf',
      category: data.category,
      linkedTo: data.linkedTo,
      linkedId: data.linkedId,
      linkedName: 'Selected Item',
      uploadedBy: 'Current User',
      uploadedAt: new Date(),
      description: data.description,
    }
    
    setDocuments([...documents, newDoc])
  }

  const handleDocumentDelete = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    setDocuments(documents.filter(d => d.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Data Management</h1>
          <p className="text-muted-foreground">
            Create, read, update, and delete all property management data
          </p>
        </div>
        <Button onClick={() => setDocumentManagerOpen(true)}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Document Manager
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="properties">
            <Building2 className="mr-2 h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="tenants">
            <Users className="mr-2 h-4 w-4" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="leases">
            <FileText className="mr-2 h-4 w-4" />
            Leases
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="mr-2 h-4 w-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2>Properties ({properties.length})</h2>
            <Button onClick={() => {
              setPropertyMode('create')
              setSelectedProperty(undefined)
              setPropertyDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle>{property.name}</CardTitle>
                  <CardDescription>{property.address}, {property.city}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units:</span>
                    <span>{property.units}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Rent:</span>
                    <span>${property.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy:</span>
                    <span>{property.occupancyRate}%</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPropertyMode('view')
                        setSelectedProperty(property)
                        setPropertyDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPropertyMode('edit')
                        setSelectedProperty(property)
                        setPropertyDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2>Tenants ({tenants.length})</h2>
            <Button onClick={() => {
              setTenantMode('create')
              setSelectedTenant(undefined)
              setTenantDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardHeader>
                  <CardTitle>{tenant.firstName} {tenant.lastName}</CardTitle>
                  <CardDescription>Unit {tenant.unitNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="truncate ml-2">{tenant.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{tenant.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Rent:</span>
                    <span>${tenant.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-green-500 text-white">{tenant.status}</Badge>
                    <Badge className="bg-blue-500 text-white">{tenant.paymentStatus}</Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTenantMode('view')
                        setSelectedTenant(tenant)
                        setTenantDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTenantMode('edit')
                        setSelectedTenant(tenant)
                        setTenantDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leases Tab */}
        <TabsContent value="leases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2>Lease Agreements ({leases.length})</h2>
            <Button onClick={() => {
              setLeaseMode('create')
              setSelectedLease(undefined)
              setLeaseDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Lease
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leases.map((lease) => (
              <Card key={lease.id}>
                <CardHeader>
                  <CardTitle>Unit {lease.unitNumber}</CardTitle>
                  <CardDescription>
                    {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Rent:</span>
                    <span>${lease.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Security Deposit:</span>
                    <span>${lease.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{lease.leaseType.replace('_', ' ')}</span>
                  </div>
                  <Badge className="bg-green-500 text-white">{lease.status}</Badge>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLeaseMode('view')
                        setSelectedLease(lease)
                        setLeaseDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLeaseMode('edit')
                        setSelectedLease(lease)
                        setLeaseDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2>Maintenance Tickets ({maintenanceTickets.length})</h2>
            <Button onClick={() => {
              setMaintenanceMode('create')
              setSelectedMaintenance(undefined)
              setMaintenanceDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <CardTitle>{ticket.title}</CardTitle>
                  <CardDescription>Unit {ticket.unitNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                  <div className="flex gap-2">
                    <Badge className={
                      ticket.priority === 'urgent' ? 'bg-red-500 text-white' :
                      ticket.priority === 'high' ? 'bg-orange-500 text-white' :
                      ticket.priority === 'medium' ? 'bg-yellow-500 text-white' :
                      'bg-blue-500 text-white'
                    }>
                      {ticket.priority}
                    </Badge>
                    <Badge className={
                      ticket.status === 'completed' ? 'bg-green-500 text-white' :
                      ticket.status === 'in_progress' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Cost:</span>
                    <span>${ticket.estimatedCost?.toLocaleString() || 'TBD'}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMaintenanceMode('view')
                        setSelectedMaintenance(ticket)
                        setMaintenanceDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMaintenanceMode('edit')
                        setSelectedMaintenance(ticket)
                        setMaintenanceDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CRUD Dialogs */}
      <PropertyCRUD
        open={propertyDialogOpen}
        mode={propertyMode}
        property={selectedProperty}
        onClose={() => setPropertyDialogOpen(false)}
        onSave={handlePropertySave}
      />

      <TenantCRUD
        open={tenantDialogOpen}
        mode={tenantMode}
        tenant={selectedTenant}
        properties={properties.map(p => ({ id: p.id, name: p.name }))}
        onClose={() => setTenantDialogOpen(false)}
        onSave={handleTenantSave}
      />

      <LeaseCRUD
        open={leaseDialogOpen}
        mode={leaseMode}
        lease={selectedLease}
        properties={properties.map(p => ({ id: p.id, name: p.name }))}
        tenants={tenants.map(t => ({ id: t.id, name: `${t.firstName} ${t.lastName}` }))}
        onClose={() => setLeaseDialogOpen(false)}
        onSave={handleLeaseSave}
      />

      <MaintenanceCRUD
        open={maintenanceDialogOpen}
        mode={maintenanceMode}
        maintenance={selectedMaintenance}
        properties={properties.map(p => ({ id: p.id, name: p.name }))}
        tenants={tenants.map(t => ({ id: t.id, name: `${t.firstName} ${t.lastName}` }))}
        onClose={() => setMaintenanceDialogOpen(false)}
        onSave={handleMaintenanceSave}
        onComplete={handleMaintenanceComplete}
      />

      <DocumentManager
        open={documentManagerOpen}
        onClose={() => setDocumentManagerOpen(false)}
        properties={properties.map(p => ({ id: p.id, name: p.name }))}
        tenants={tenants.map(t => ({ id: t.id, name: `${t.firstName} ${t.lastName}` }))}
        existingDocuments={documents}
        onUpload={handleDocumentUpload}
        onDelete={handleDocumentDelete}
      />
    </div>
  )
}
