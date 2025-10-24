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
import { Progress } from './ui/progress'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Share2,
  Folder,
  FolderOpen,
  File,
  Image,
  FileImage,
  FileSpreadsheet,
  Archive,
  Lock,
  Clock,
  User,
  Calendar,
  Tag,
  Star
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

interface DocumentsSystemProps {
  user: User
  accessToken: string | null
}

interface Document {
  id: string
  name: string
  type: 'contract' | 'lease' | 'invoice' | 'receipt' | 'maintenance' | 'inspection' | 'insurance' | 'license' | 'photo' | 'report' | 'other'
  category: string
  fileType: string
  fileSize: number
  url: string
  thumbnailUrl?: string
  description: string
  tags: string[]
  propertyId?: string
  propertyName?: string
  unitId?: string
  unitNumber?: string
  tenantId?: string
  tenantName?: string
  vendorId?: string
  vendorName?: string
  relatedId?: string
  relatedType?: string
  version: number
  isLatestVersion: boolean
  parentDocumentId?: string
  status: 'draft' | 'active' | 'expired' | 'archived'
  accessLevel: 'public' | 'private' | 'restricted'
  permissions: {
    userId: string
    userName: string
    role: string
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    canShare: boolean
  }[]
  expiryDate?: string
  reminderDays?: number
  metadata: {
    [key: string]: any
  }
  uploadedBy: string
  uploadedAt: string
  lastModifiedBy?: string
  lastModifiedAt?: string
  downloadCount: number
  viewCount: number
}

interface DocumentFolder {
  id: string
  name: string
  description: string
  parentId?: string
  path: string
  type: 'system' | 'custom'
  accessLevel: 'public' | 'private' | 'restricted'
  documentCount: number
  subfolderCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface DocumentTemplate {
  id: string
  name: string
  description: string
  type: 'contract' | 'lease' | 'invoice' | 'report' | 'form'
  category: string
  fileUrl: string
  fields: {
    id: string
    name: string
    type: 'text' | 'date' | 'number' | 'dropdown' | 'checkbox'
    required: boolean
    options?: string[]
  }[]
  active: boolean
  usage: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Demo data
const demoDocuments: Document[] = [
  {
    id: 'doc-001',
    name: 'Tenancy Contract - Omar Al-Hassan',
    type: 'contract',
    category: 'Legal Documents',
    fileType: 'pdf',
    fileSize: 2048000,
    url: 'tenancy-contract-omar.pdf',
    description: 'Signed tenancy contract for Unit 1205',
    tags: ['contract', 'signed', '2023'],
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    relatedId: 'lease-001',
    relatedType: 'lease',
    version: 1,
    isLatestVersion: true,
    status: 'active',
    accessLevel: 'private',
    permissions: [
      {
        userId: 'admin-001',
        userName: 'Property Manager',
        role: 'admin',
        canView: true,
        canEdit: true,
        canDelete: false,
        canShare: true
      },
      {
        userId: 'tenant-001',
        userName: 'Omar Al-Hassan',
        role: 'tenant',
        canView: true,
        canEdit: false,
        canDelete: false,
        canShare: false
      }
    ],
    expiryDate: '2024-05-31',
    reminderDays: 30,
    metadata: {
      signedDate: '2023-05-20',
      renewalClause: true,
      depositAmount: 17000
    },
    uploadedBy: 'Property Manager',
    uploadedAt: '2023-05-20T14:30:00Z',
    downloadCount: 8,
    viewCount: 24
  },
  {
    id: 'doc-002',
    name: 'DEWA Bill - January 2024',
    type: 'invoice',
    category: 'Utilities',
    fileType: 'pdf',
    fileSize: 512000,
    url: 'dewa-bill-jan-2024.pdf',
    description: 'DEWA electricity bill for January 2024',
    tags: ['dewa', 'utilities', 'january-2024'],
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    version: 1,
    isLatestVersion: true,
    status: 'active',
    accessLevel: 'private',
    permissions: [
      {
        userId: 'admin-001',
        userName: 'Property Manager',
        role: 'admin',
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true
      }
    ],
    metadata: {
      amount: 320,
      dueDate: '2024-02-15',
      accountNumber: 'XXXX1234'
    },
    uploadedBy: 'Accounting Team',
    uploadedAt: '2024-01-16T10:00:00Z',
    downloadCount: 3,
    viewCount: 12
  },
  {
    id: 'doc-003',
    name: 'Building Insurance Certificate',
    type: 'insurance',
    category: 'Insurance',
    fileType: 'pdf',
    fileSize: 1024000,
    url: 'building-insurance-2024.pdf',
    description: 'Building insurance certificate for 2024',
    tags: ['insurance', 'building', '2024'],
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    version: 1,
    isLatestVersion: true,
    status: 'active',
    accessLevel: 'restricted',
    permissions: [
      {
        userId: 'admin-001',
        userName: 'Property Manager',
        role: 'admin',
        canView: true,
        canEdit: true,
        canDelete: false,
        canShare: true
      }
    ],
    expiryDate: '2024-12-31',
    reminderDays: 60,
    metadata: {
      policyNumber: 'INS-2024-001',
      insurer: 'Emirates Insurance',
      coverage: 50000000
    },
    uploadedBy: 'Property Manager',
    uploadedAt: '2024-01-01T09:00:00Z',
    downloadCount: 15,
    viewCount: 45
  },
  {
    id: 'doc-004',
    name: 'Maintenance Photos - AC Repair',
    type: 'photo',
    category: 'Maintenance',
    fileType: 'jpg',
    fileSize: 3072000,
    url: 'ac-repair-photos.jpg',
    thumbnailUrl: 'ac-repair-photos-thumb.jpg',
    description: 'Before and after photos of AC repair work',
    tags: ['maintenance', 'ac-repair', 'photos'],
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    relatedId: 'maint-001',
    relatedType: 'maintenance',
    version: 1,
    isLatestVersion: true,
    status: 'active',
    accessLevel: 'private',
    permissions: [
      {
        userId: 'admin-001',
        userName: 'Property Manager',
        role: 'admin',
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true
      }
    ],
    metadata: {
      photographer: 'Ahmed Hassan',
      workOrderId: 'maint-001',
      completionDate: '2024-01-16'
    },
    uploadedBy: 'Ahmed Hassan',
    uploadedAt: '2024-01-16T16:30:00Z',
    downloadCount: 2,
    viewCount: 8
  }
]

const demoFolders: DocumentFolder[] = [
  {
    id: 'folder-001',
    name: 'Contracts & Leases',
    description: 'All tenancy contracts and lease agreements',
    path: '/contracts-leases',
    type: 'system',
    accessLevel: 'private',
    documentCount: 15,
    subfolderCount: 3,
    createdBy: 'System',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'folder-002',
    name: 'Invoices & Receipts',
    description: 'Financial documents and payment records',
    path: '/invoices-receipts',
    type: 'system',
    accessLevel: 'private',
    documentCount: 28,
    subfolderCount: 2,
    createdBy: 'System',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z'
  },
  {
    id: 'folder-003',
    name: 'Maintenance Records',
    description: 'Maintenance requests, reports, and photos',
    path: '/maintenance',
    type: 'system',
    accessLevel: 'private',
    documentCount: 42,
    subfolderCount: 5,
    createdBy: 'System',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-16T16:30:00Z'
  },
  {
    id: 'folder-004',
    name: 'Insurance & Licenses',
    description: 'Insurance certificates and licensing documents',
    path: '/insurance-licenses',
    type: 'system',
    accessLevel: 'restricted',
    documentCount: 8,
    subfolderCount: 0,
    createdBy: 'System',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z'
  }
]

const demoTemplates: DocumentTemplate[] = [
  {
    id: 'template-001',
    name: 'Standard Tenancy Contract',
    description: 'Standard residential tenancy agreement template',
    type: 'contract',
    category: 'Legal',
    fileUrl: 'templates/tenancy-contract-template.pdf',
    fields: [
      {
        id: 'tenant_name',
        name: 'Tenant Name',
        type: 'text',
        required: true
      },
      {
        id: 'property_address',
        name: 'Property Address',
        type: 'text',
        required: true
      },
      {
        id: 'rental_amount',
        name: 'Monthly Rent',
        type: 'number',
        required: true
      },
      {
        id: 'lease_start',
        name: 'Lease Start Date',
        type: 'date',
        required: true
      },
      {
        id: 'lease_end',
        name: 'Lease End Date',
        type: 'date',
        required: true
      }
    ],
    active: true,
    usage: 12,
    createdBy: 'Legal Team',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-06-15T10:00:00Z'
  },
  {
    id: 'template-002',
    name: 'Maintenance Invoice',
    description: 'Invoice template for maintenance services',
    type: 'invoice',
    category: 'Financial',
    fileUrl: 'templates/maintenance-invoice-template.pdf',
    fields: [
      {
        id: 'vendor_name',
        name: 'Vendor Name',
        type: 'text',
        required: true
      },
      {
        id: 'service_description',
        name: 'Service Description',
        type: 'text',
        required: true
      },
      {
        id: 'amount',
        name: 'Amount',
        type: 'number',
        required: true
      },
      {
        id: 'work_date',
        name: 'Work Completion Date',
        type: 'date',
        required: true
      }
    ],
    active: true,
    usage: 25,
    createdBy: 'Accounting Team',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-08-20T14:00:00Z'
  }
]

export function DocumentsSystem({ user, accessToken }: DocumentsSystemProps) {
  const [activeTab, setActiveTab] = useState('documents')
  const [documents, setDocuments] = useState<Document[]>(demoDocuments)
  const [folders, setFolders] = useState<DocumentFolder[]>(demoFolders)
  const [templates, setTemplates] = useState<DocumentTemplate[]>(demoTemplates)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDocumentDetails, setShowDocumentDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter documents
  const getFilteredDocuments = () => {
    let filtered = documents

    if (selectedFolder) {
      // Filter by folder (this would be more complex in a real implementation)
      filtered = filtered.filter(doc => {
        switch (selectedFolder.name) {
          case 'Contracts & Leases':
            return doc.type === 'contract' || doc.type === 'lease'
          case 'Invoices & Receipts':
            return doc.type === 'invoice' || doc.type === 'receipt'
          case 'Maintenance Records':
            return doc.type === 'maintenance' || doc.type === 'photo'
          case 'Insurance & Licenses':
            return doc.type === 'insurance' || doc.type === 'license'
          default:
            return true
        }
      })
    }

    return filtered.filter(document => {
      const matchesSearch = searchTerm === '' || 
        document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = filterType === 'all' || document.type === filterType
      const matchesCategory = filterCategory === 'all' || document.category === filterCategory

      return matchesSearch && matchesType && matchesCategory
    }).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-8 w-8 text-green-500" />
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="h-8 w-8 text-blue-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'archived': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessLevelColor = (level: Document['accessLevel']) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800'
      case 'private': return 'bg-yellow-100 text-yellow-800'
      case 'restricted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUploadDocument = async (documentData: Partial<Document>) => {
    setIsLoading(true)
    try {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: documentData.name || '',
        type: documentData.type || 'other',
        category: documentData.category || 'General',
        fileType: documentData.fileType || 'pdf',
        fileSize: documentData.fileSize || 0,
        url: `documents/${documentData.name}`,
        description: documentData.description || '',
        tags: documentData.tags || [],
        version: 1,
        isLatestVersion: true,
        status: 'active',
        accessLevel: documentData.accessLevel || 'private',
        permissions: [
          {
            userId: user.id,
            userName: user.fullName,
            role: user.role,
            canView: true,
            canEdit: true,
            canDelete: true,
            canShare: true
          }
        ],
        metadata: {},
        uploadedBy: user.fullName,
        uploadedAt: new Date().toISOString(),
        downloadCount: 0,
        viewCount: 0,
        ...documentData
      }

      setDocuments(prev => [newDocument, ...prev])
      setShowUploadDialog(false)
      toast.success('Document uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setIsLoading(false)
    }
  }

  const renderFolderView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {folders.map((folder) => (
        <Card 
          key={folder.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedFolder(folder)}
        >
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              {selectedFolder?.id === folder.id ? (
                <FolderOpen className="h-12 w-12 text-blue-500" />
              ) : (
                <Folder className="h-12 w-12 text-blue-500" />
              )}
            </div>
            <h3 className="font-semibold mb-2">{folder.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{folder.description}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{folder.documentCount} docs</span>
              <span>{folder.subfolderCount} folders</span>
            </div>
            <Badge className={`mt-2 ${getAccessLevelColor(folder.accessLevel)}`}>
              {folder.accessLevel}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderDocumentsList = () => (
    <div className="space-y-4">
      {selectedFolder && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedFolder(null)}
          >
            ← Back to Folders
          </Button>
          <h3 className="font-semibold">{selectedFolder.name}</h3>
        </div>
      )}

      {getFilteredDocuments().map((document) => (
        <Card key={document.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getFileIcon(document.fileType)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{document.name}</h3>
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                      <Badge className={getAccessLevelColor(document.accessLevel)}>
                        {document.accessLevel}
                      </Badge>
                      {document.expiryDate && new Date(document.expiryDate) < new Date() && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-2">{document.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">File Info</p>
                        <p className="font-medium">{document.fileType.toUpperCase()}</p>
                        <p className="text-muted-foreground">{formatFileSize(document.fileSize)}</p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Related To</p>
                        {document.propertyName && (
                          <p className="font-medium">{document.propertyName}</p>
                        )}
                        {document.unitNumber && (
                          <p className="text-muted-foreground">Unit {document.unitNumber}</p>
                        )}
                        {document.tenantName && (
                          <p className="text-muted-foreground">{document.tenantName}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Activity</p>
                        <p className="font-medium">{document.viewCount} views</p>
                        <p className="text-muted-foreground">{document.downloadCount} downloads</p>
                      </div>
                    </div>
                    
                    {document.tags.length > 0 && (
                      <div className="mt-3">
                        <div className="flex gap-1">
                          {document.tags.slice(0, 4).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {document.tags.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{document.tags.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {document.uploadedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </div>
                      {document.expiryDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires: {new Date(document.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDocument(document)
                        setShowDocumentDetails(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {getFilteredDocuments().length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'No documents in this location'}
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
                    {template.type}
                  </Badge>
                  {template.active && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-3">{template.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{template.category}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Fields</p>
                    <p className="font-medium">{template.fields.length} fields</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">{template.usage} times used</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-muted-foreground text-sm mb-1">Template Fields:</p>
                  <div className="flex gap-1 flex-wrap">
                    {template.fields.slice(0, 5).map((field, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {field.name}
                      </Badge>
                    ))}
                    {template.fields.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.fields.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm">
                  Use Template
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
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-muted-foreground">Organize and manage all your property documents</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="lease">Leases</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="receipt">Receipts</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inspection">Inspections</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="photo">Photos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Legal Documents">Legal Documents</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-6">
          {selectedFolder ? renderDocumentsList() : renderFolderView()}
        </TabsContent>

        <TabsContent value="folders" className="mt-6">
          {renderFolderView()}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          {renderTemplatesList()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Activity</CardTitle>
                <CardDescription>Most viewed and downloaded documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents
                    .sort((a, b) => (b.viewCount + b.downloadCount) - (a.viewCount + a.downloadCount))
                    .slice(0, 5)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.fileType)}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{doc.viewCount} views</p>
                          <p className="text-sm text-muted-foreground">{doc.downloadCount} downloads</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Analysis</CardTitle>
                <CardDescription>Document types and storage usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['contract', 'invoice', 'photo', 'insurance'].map((type) => {
                    const typeDocuments = documents.filter(d => d.type === type)
                    const totalSize = typeDocuments.reduce((sum, d) => sum + d.fileSize, 0)
                    const percentage = documents.length > 0 ? (typeDocuments.length / documents.length) * 100 : 0
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize">{type}s</span>
                          <span>{typeDocuments.length} files ({formatFileSize(totalSize)})</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the system
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            handleUploadDocument({
              name: formData.get('name') as string,
              type: formData.get('type') as Document['type'],
              category: formData.get('category') as string,
              description: formData.get('description') as string,
              accessLevel: formData.get('accessLevel') as Document['accessLevel'],
              tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
              fileType: 'pdf', // This would be determined from the file upload
              fileSize: 1024000, // This would be from the file upload
              expiryDate: formData.get('expiryDate') as string || undefined,
            })
          }}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="file">File Upload *</Label>
                <Input id="file" name="file" type="file" required />
              </div>

              <div>
                <Label htmlFor="name">Document Name *</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Document Type</Label>
                  <Select name="type" defaultValue="other">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="license">License</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue="General">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Legal Documents">Legal Documents</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Document description..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select name="accessLevel" defaultValue="private">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
                  <Input id="expiryDate" name="expiryDate" type="date" />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" name="tags" placeholder="tag1, tag2, tag3" />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Uploading...' : 'Upload Document'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Details Dialog */}
      <Dialog open={showDocumentDetails} onOpenChange={setShowDocumentDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFileIcon(selectedDocument.fileType)}
                  {selectedDocument.name}
                </DialogTitle>
                <DialogDescription>
                  Document details and information
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <p className="capitalize">{selectedDocument.type}</p>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <p>{selectedDocument.category}</p>
                    </div>
                    <div>
                      <Label>File Size</Label>
                      <p>{formatFileSize(selectedDocument.fileSize)}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(selectedDocument.status)}>
                        {selectedDocument.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <p>{selectedDocument.description}</p>
                  </div>

                  {selectedDocument.tags.length > 0 && (
                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {selectedDocument.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Uploaded By</Label>
                      <p>{selectedDocument.uploadedBy}</p>
                    </div>
                    <div>
                      <Label>Upload Date</Label>
                      <p>{new Date(selectedDocument.uploadedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedDocument.expiryDate && (
                    <div>
                      <Label>Expiry Date</Label>
                      <p className={new Date(selectedDocument.expiryDate) < new Date() ? 'text-red-600' : ''}>
                        {new Date(selectedDocument.expiryDate).toLocaleDateString()}
                        {new Date(selectedDocument.expiryDate) < new Date() && ' (Expired)'}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Views</Label>
                      <p>{selectedDocument.viewCount}</p>
                    </div>
                    <div>
                      <Label>Downloads</Label>
                      <p>{selectedDocument.downloadCount}</p>
                    </div>
                  </div>

                  {selectedDocument.permissions.length > 0 && (
                    <div>
                      <Label>Permissions</Label>
                      <div className="space-y-2 mt-2">
                        {selectedDocument.permissions.map((permission, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{permission.userName}</p>
                              <p className="text-sm text-muted-foreground">{permission.role}</p>
                            </div>
                            <div className="flex gap-2">
                              {permission.canView && <Badge variant="secondary">View</Badge>}
                              {permission.canEdit && <Badge variant="secondary">Edit</Badge>}
                              {permission.canDelete && <Badge variant="secondary">Delete</Badge>}
                              {permission.canShare && <Badge variant="secondary">Share</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{folders.length}</p>
                <p className="text-sm text-muted-foreground">Folders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatFileSize(documents.reduce((sum, d) => sum + d.fileSize, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Storage Used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
