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
import { Calendar } from './ui/calendar'
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import { 
  Eye, 
  Plus, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Camera,
  FileText,
  Download,
  Upload,
  Edit,
  Trash2,
  Star,
  Building2,
  Key,
  Users,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: 'platform_admin' | 'company_admin' | 'employee'
}

interface InspectionsSystemProps {
  user: User
  accessToken: string | null
}

interface InspectionTemplate {
  id: string
  name: string
  description: string
  type: 'move_in' | 'move_out' | 'routine' | 'annual' | 'maintenance' | 'custom'
  propertyTypes: string[]
  checklistItems: ChecklistItem[]
  requiredPhotos: string[]
  estimatedDuration: number // minutes
  active: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface ChecklistItem {
  id: string
  category: string
  item: string
  description: string
  required: boolean
  hasSubItems: boolean
  subItems?: ChecklistItem[]
  photoRequired: boolean
  notes: string
}

interface Inspection {
  id: string
  inspectionNumber: string
  type: 'move_in' | 'move_out' | 'routine' | 'annual' | 'maintenance' | 'custom'
  propertyId: string
  propertyName: string
  unitId: string
  unitNumber: string
  tenantId?: string
  tenantName?: string
  inspectorId: string
  inspectorName: string
  templateId: string
  templateName: string
  scheduledDate: string
  scheduledTime: string
  startedAt?: string
  completedAt?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  checklist: InspectionChecklistItem[]
  photos: InspectionPhoto[]
  findings: InspectionFinding[]
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_attention'
  overallScore: number // percentage
  notes: string
  reportGenerated: boolean
  reportUrl?: string
  nextInspectionDate?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface InspectionChecklistItem {
  id: string
  templateItemId: string
  category: string
  item: string
  status: 'not_started' | 'passed' | 'failed' | 'needs_attention' | 'not_applicable'
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  notes: string
  photoIds: string[]
  repairRequired: boolean
  estimatedCost: number
}

interface InspectionPhoto {
  id: string
  checklistItemId?: string
  category: string
  description: string
  url: string
  timestamp: string
  location: {
    room: string
    area: string
  }
  annotations: {
    x: number
    y: number
    note: string
  }[]
}

interface InspectionFinding {
  id: string
  type: 'damage' | 'maintenance' | 'safety' | 'cleanliness' | 'compliance' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  location: string
  photoIds: string[]
  actionRequired: string
  estimatedCost: number
  urgency: 'immediate' | 'within_week' | 'within_month' | 'next_inspection'
  assignedTo?: string
  status: 'open' | 'in_progress' | 'resolved' | 'deferred'
  notes: string
}

// Demo data
const demoInspectionTemplates: InspectionTemplate[] = [
  {
    id: 'template-001',
    name: 'Standard Move-In Inspection',
    description: 'Comprehensive inspection for new tenant move-ins',
    type: 'move_in',
    propertyTypes: ['residential', 'apartment'],
    checklistItems: [
      {
        id: 'item-001',
        category: 'Kitchen',
        item: 'Appliances',
        description: 'Check all kitchen appliances for proper function',
        required: true,
        hasSubItems: true,
        subItems: [
          {
            id: 'sub-001',
            category: 'Kitchen',
            item: 'Refrigerator',
            description: 'Check cooling, ice maker, water dispenser',
            required: true,
            hasSubItems: false,
            photoRequired: true,
            notes: ''
          },
          {
            id: 'sub-002',
            category: 'Kitchen',
            item: 'Dishwasher',
            description: 'Test wash cycle and drainage',
            required: true,
            hasSubItems: false,
            photoRequired: true,
            notes: ''
          }
        ],
        photoRequired: true,
        notes: ''
      },
      {
        id: 'item-002',
        category: 'Living Room',
        item: 'Flooring',
        description: 'Inspect carpet, tiles, or hardwood for damage',
        required: true,
        hasSubItems: false,
        photoRequired: true,
        notes: ''
      },
      {
        id: 'item-003',
        category: 'Bathroom',
        item: 'Plumbing',
        description: 'Check faucets, shower, toilet for leaks',
        required: true,
        hasSubItems: false,
        photoRequired: true,
        notes: ''
      }
    ],
    requiredPhotos: ['Overview', 'Kitchen', 'Living Room', 'Bedrooms', 'Bathrooms'],
    estimatedDuration: 90,
    active: true,
    createdBy: 'System',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
]

const demoInspections: Inspection[] = [
  {
    id: 'insp-001',
    inspectionNumber: 'INS-2024-001',
    type: 'routine',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    inspectorId: 'inspector-001',
    inspectorName: 'Sarah Johnson',
    templateId: 'template-001',
    templateName: 'Standard Move-In Inspection',
    scheduledDate: '2024-01-18',
    scheduledTime: '14:00',
    status: 'scheduled',
    priority: 'normal',
    checklist: [
      {
        id: 'check-001',
        templateItemId: 'item-001',
        category: 'Kitchen',
        item: 'Appliances',
        status: 'not_started',
        condition: 'good',
        notes: '',
        photoIds: [],
        repairRequired: false,
        estimatedCost: 0
      },
      {
        id: 'check-002',
        templateItemId: 'item-002',
        category: 'Living Room',
        item: 'Flooring',
        status: 'not_started',
        condition: 'good',
        notes: '',
        photoIds: [],
        repairRequired: false,
        estimatedCost: 0
      }
    ],
    photos: [],
    findings: [],
    overallCondition: 'good',
    overallScore: 0,
    notes: 'Quarterly inspection as per lease agreement',
    reportGenerated: false,
    nextInspectionDate: '2024-04-18',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z'
  },
  {
    id: 'insp-002',
    inspectionNumber: 'INS-2024-002',
    type: 'move_out',
    propertyId: 'prop-002',
    propertyName: 'Business Bay Executive Center',
    unitId: 'unit-003',
    unitNumber: '1501',
    inspectorId: 'inspector-002',
    inspectorName: 'Ahmed Al-Mansouri',
    templateId: 'template-001',
    templateName: 'Standard Move-In Inspection',
    scheduledDate: '2024-01-20',
    scheduledTime: '10:00',
    startedAt: '2024-01-20T10:15:00Z',
    completedAt: '2024-01-20T12:30:00Z',
    status: 'completed',
    priority: 'high',
    checklist: [
      {
        id: 'check-003',
        templateItemId: 'item-001',
        category: 'Office Area',
        item: 'Equipment',
        status: 'passed',
        condition: 'excellent',
        notes: 'All equipment in perfect working condition',
        photoIds: ['photo-001'],
        repairRequired: false,
        estimatedCost: 0
      },
      {
        id: 'check-004',
        templateItemId: 'item-002',
        category: 'Conference Room',
        item: 'Furniture',
        status: 'needs_attention',
        condition: 'fair',
        notes: 'Conference table has minor scratches',
        photoIds: ['photo-002'],
        repairRequired: true,
        estimatedCost: 500
      }
    ],
    photos: [
      {
        id: 'photo-001',
        checklistItemId: 'check-003',
        category: 'Office Area',
        description: 'Overview of office equipment',
        url: 'office-equipment.jpg',
        timestamp: '2024-01-20T10:30:00Z',
        location: {
          room: 'Main Office',
          area: 'Workstation'
        },
        annotations: []
      },
      {
        id: 'photo-002',
        checklistItemId: 'check-004',
        category: 'Conference Room',
        description: 'Conference table scratches',
        url: 'table-damage.jpg',
        timestamp: '2024-01-20T11:15:00Z',
        location: {
          room: 'Conference Room',
          area: 'Center Table'
        },
        annotations: [
          {
            x: 150,
            y: 200,
            note: 'Scratches on surface'
          }
        ]
      }
    ],
    findings: [
      {
        id: 'finding-001',
        type: 'damage',
        severity: 'low',
        title: 'Conference Table Surface Damage',
        description: 'Minor scratches on conference table surface, likely from normal use',
        location: 'Conference Room - Center Table',
        photoIds: ['photo-002'],
        actionRequired: 'Surface refinishing or replacement',
        estimatedCost: 500,
        urgency: 'within_month',
        status: 'open',
        notes: 'Cosmetic damage only, does not affect functionality'
      }
    ],
    overallCondition: 'good',
    overallScore: 85,
    notes: 'Overall in good condition, minor cosmetic issues noted',
    reportGenerated: true,
    reportUrl: 'inspection-report-002.pdf',
    createdBy: 'Ahmed Al-Mansouri',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T12:30:00Z'
  }
]

export function InspectionsSystem({ user, accessToken }: InspectionsSystemProps) {
  const [activeTab, setActiveTab] = useState('inspections')
  const [inspections, setInspections] = useState<Inspection[]>(demoInspections)
  const [templates, setTemplates] = useState<InspectionTemplate[]>(demoInspectionTemplates)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [showCreateInspection, setShowCreateInspection] = useState(false)
  const [showInspectionDetails, setShowInspectionDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter inspections
  const getFilteredInspections = () => {
    return inspections.filter(inspection => {
      const matchesSearch = searchTerm === '' || 
        inspection.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus
      const matchesType = filterType === 'all' || inspection.type === filterType

      return matchesSearch && matchesStatus && matchesType
    }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
  }

  const getStatusColor = (status: Inspection['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'rescheduled': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Inspection['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'normal': return 'bg-blue-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getConditionColor = (condition: Inspection['overallCondition']) => {
    switch (condition) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-orange-600'
      case 'needs_attention': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleCreateInspection = async (inspectionData: Partial<Inspection>) => {
    setIsLoading(true)
    try {
      const newInspection: Inspection = {
        id: `insp-${Date.now()}`,
        inspectionNumber: `INS-${new Date().getFullYear()}-${String(inspections.length + 1).padStart(3, '0')}`,
        type: inspectionData.type || 'routine',
        propertyId: inspectionData.propertyId || '',
        propertyName: inspectionData.propertyName || '',
        unitId: inspectionData.unitId || '',
        unitNumber: inspectionData.unitNumber || '',
        tenantId: inspectionData.tenantId,
        tenantName: inspectionData.tenantName,
        inspectorId: user.id,
        inspectorName: user.fullName,
        templateId: inspectionData.templateId || '',
        templateName: inspectionData.templateName || '',
        scheduledDate: inspectionData.scheduledDate || '',
        scheduledTime: inspectionData.scheduledTime || '',
        status: 'scheduled',
        priority: inspectionData.priority || 'normal',
        checklist: [],
        photos: [],
        findings: [],
        overallCondition: 'good',
        overallScore: 0,
        notes: inspectionData.notes || '',
        reportGenerated: false,
        createdBy: user.fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...inspectionData
      }

      setInspections(prev => [newInspection, ...prev])
      setShowCreateInspection(false)
      toast.success('Inspection scheduled successfully')
    } catch (error) {
      toast.error('Failed to create inspection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInspection = (inspectionId: string) => {
    setInspections(prev => prev.map(insp => 
      insp.id === inspectionId 
        ? { 
            ...insp, 
            status: 'in_progress', 
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : insp
    ))
    toast.success('Inspection started')
  }

  const handleCompleteInspection = (inspectionId: string) => {
    setInspections(prev => prev.map(insp => 
      insp.id === inspectionId 
        ? { 
            ...insp, 
            status: 'completed', 
            completedAt: new Date().toISOString(),
            reportGenerated: true,
            reportUrl: `inspection-report-${inspectionId}.pdf`,
            updatedAt: new Date().toISOString()
          }
        : insp
    ))
    toast.success('Inspection completed and report generated')
  }

  const renderInspectionsList = () => (
    <div className="space-y-4">
      {getFilteredInspections().map((inspection) => (
        <Card key={inspection.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{inspection.inspectionNumber}</h3>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status.replace('_', ' ')}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(inspection.priority)}`} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Property</p>
                    <p className="font-medium">{inspection.propertyName}</p>
                    <p className="text-muted-foreground">Unit {inspection.unitNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Inspector</p>
                    <p className="font-medium">{inspection.inspectorName}</p>
                    <p className="text-muted-foreground">
                      {new Date(inspection.scheduledDate).toLocaleDateString()} at {inspection.scheduledTime}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{inspection.type.replace('_', ' ')}</p>
                    {inspection.tenantName && (
                      <p className="text-muted-foreground">Tenant: {inspection.tenantName}</p>
                    )}
                  </div>
                </div>
                
                {inspection.status === 'completed' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Overall Condition: 
                          <span className={`ml-2 capitalize ${getConditionColor(inspection.overallCondition)}`}>
                            {inspection.overallCondition.replace('_', ' ')}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Score: {inspection.overallScore}%
                        </p>
                      </div>
                      {inspection.findings.length > 0 && (
                        <Badge variant="outline" className="text-orange-600">
                          {inspection.findings.length} findings
                        </Badge>
                      )}
                    </div>
                    <Progress value={inspection.overallScore} className="mt-2" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedInspection(inspection)
                    setShowInspectionDetails(true)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                
                {inspection.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() => handleStartInspection(inspection.id)}
                  >
                    Start
                  </Button>
                )}
                
                {inspection.status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => handleCompleteInspection(inspection.id)}
                  >
                    Complete
                  </Button>
                )}
                
                {inspection.reportGenerated && (
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {getFilteredInspections().length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No inspections found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'No inspections scheduled yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderTemplatesList = () => (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Badge variant="outline" className="capitalize">
                    {template.type.replace('_', ' ')}
                  </Badge>
                  {template.active && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-3">{template.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Checklist Items</p>
                    <p className="font-medium">{template.checklistItems.length} items</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Estimated Duration</p>
                    <p className="font-medium">{template.estimatedDuration} minutes</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Property Types</p>
                    <p className="font-medium">{template.propertyTypes.join(', ')}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderInspectionDetails = () => {
    if (!selectedInspection) return null

    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedInspection.inspectionNumber}</h3>
              <Badge className={getStatusColor(selectedInspection.status)}>
                {selectedInspection.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Property</Label>
                <p>{selectedInspection.propertyName} - Unit {selectedInspection.unitNumber}</p>
              </div>
              <div>
                <Label>Inspector</Label>
                <p>{selectedInspection.inspectorName}</p>
              </div>
              <div>
                <Label>Scheduled</Label>
                <p>{new Date(selectedInspection.scheduledDate).toLocaleDateString()} at {selectedInspection.scheduledTime}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="capitalize">{selectedInspection.type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedInspection.checklist.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{item.item}</h4>
                          <Badge variant="outline">{item.category}</Badge>
                          {item.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {item.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                          {item.status === 'needs_attention' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Condition</Label>
                            <p className={`capitalize ${getConditionColor(item.condition as any)}`}>
                              {item.condition}
                            </p>
                          </div>
                          {item.estimatedCost > 0 && (
                            <div>
                              <Label>Estimated Repair Cost</Label>
                              <p>AED {item.estimatedCost.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                        
                        {item.notes && (
                          <div className="mt-2">
                            <Label>Notes</Label>
                            <p className="text-sm">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          {selectedInspection.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {selectedInspection.photos.map((photo) => (
                    <div key={photo.id} className="border rounded-lg p-2">
                      <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">{photo.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {photo.location.room} - {photo.location.area}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Findings */}
          {selectedInspection.findings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Findings & Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedInspection.findings.map((finding) => (
                    <div key={finding.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{finding.title}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="capitalize">
                            {finding.type}
                          </Badge>
                          <Badge variant="outline" className={
                            finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {finding.severity}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Location</Label>
                          <p>{finding.location}</p>
                        </div>
                        <div>
                          <Label>Estimated Cost</Label>
                          <p>AED {finding.estimatedCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label>Action Required</Label>
                          <p>{finding.actionRequired}</p>
                        </div>
                        <div>
                          <Label>Urgency</Label>
                          <p className="capitalize">{finding.urgency.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {selectedInspection.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Inspection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Overall Condition</Label>
                    <p className={`capitalize ${getConditionColor(selectedInspection.overallCondition)}`}>
                      {selectedInspection.overallCondition.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <Label>Overall Score</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedInspection.overallScore} className="flex-1" />
                      <span className="text-sm font-medium">{selectedInspection.overallScore}%</span>
                    </div>
                  </div>
                </div>
                
                {selectedInspection.notes && (
                  <div className="mt-4">
                    <Label>Notes</Label>
                    <p className="text-sm">{selectedInspection.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Property Inspections</h2>
          <p className="text-muted-foreground">Manage property inspections and reports</p>
        </div>
        <Button onClick={() => setShowCreateInspection(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Inspection
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
                  placeholder="Search inspections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="move_in">Move In</SelectItem>
                <SelectItem value="move_out">Move Out</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="mt-6">
          {renderInspectionsList()}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          {renderTemplatesList()}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Inspection Reports</h3>
              <p className="text-muted-foreground">
                View and download completed inspection reports
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Inspection Dialog */}
      <Dialog open={showCreateInspection} onOpenChange={setShowCreateInspection}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Inspection</DialogTitle>
            <DialogDescription>
              Create a new property inspection
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            handleCreateInspection({
              type: formData.get('type') as Inspection['type'],
              propertyId: formData.get('propertyId') as string,
              propertyName: formData.get('propertyName') as string,
              unitId: formData.get('unitId') as string,
              unitNumber: formData.get('unitNumber') as string,
              templateId: formData.get('templateId') as string,
              templateName: formData.get('templateName') as string,
              scheduledDate: formData.get('scheduledDate') as string,
              scheduledTime: formData.get('scheduledTime') as string,
              priority: formData.get('priority') as Inspection['priority'],
              notes: formData.get('notes') as string,
            })
          }}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Inspection Type</Label>
                  <Select name="type" defaultValue="routine">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="move_in">Move In</SelectItem>
                      <SelectItem value="move_out">Move Out</SelectItem>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="propertyName">Property</Label>
                <Select name="propertyId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prop-001">Burj Al Marina Residence</SelectItem>
                    <SelectItem value="prop-002">Business Bay Executive Center</SelectItem>
                    <SelectItem value="prop-003">Al Ain Heritage Villas</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="propertyName" value="Burj Al Marina Residence" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitId">Unit</Label>
                  <Select name="unitId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit-001">1205</SelectItem>
                      <SelectItem value="unit-002">0803</SelectItem>
                      <SelectItem value="unit-003">1501</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="unitNumber" value="1205" />
                </div>

                <div>
                  <Label htmlFor="templateId">Template</Label>
                  <Select name="templateId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="templateName" value="Standard Move-In Inspection" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Date</Label>
                  <Input 
                    id="scheduledDate" 
                    name="scheduledDate" 
                    type="date" 
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledTime">Time</Label>
                  <Input 
                    id="scheduledTime" 
                    name="scheduledTime" 
                    type="time" 
                    defaultValue="09:00"
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Additional notes or special instructions..." 
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Scheduling...' : 'Schedule Inspection'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateInspection(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspection Details Dialog */}
      <Dialog open={showInspectionDetails} onOpenChange={setShowInspectionDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Inspection Details
              {selectedInspection && ` - ${selectedInspection.inspectionNumber}`}
            </DialogTitle>
            <DialogDescription>
              View inspection details, checklist, and findings
            </DialogDescription>
          </DialogHeader>

          {renderInspectionDetails()}
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{inspections.filter(i => i.status === 'scheduled').length}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{inspections.filter(i => i.status === 'in_progress').length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{inspections.filter(i => i.status === 'completed').length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {inspections.reduce((sum, i) => sum + i.findings.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Findings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
