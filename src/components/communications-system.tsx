import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Checkbox } from './ui/checkbox'
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  Video, 
  Plus, 
  Search, 
  Filter,
  Users,
  Building2,
  Bell,
  Calendar,
  Paperclip,
  Eye,
  Archive,
  Trash2,
  Star,
  Reply,
  Forward,
  Settings,
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

interface CommunicationsSystemProps {
  user: User
  accessToken: string | null
}

interface Message {
  id: string
  type: 'email' | 'sms' | 'internal' | 'notification' | 'announcement'
  subject: string
  content: string
  fromId: string
  fromName: string
  fromEmail?: string
  toIds: string[]
  toNames: string[]
  toEmails?: string[]
  cc?: string[]
  bcc?: string[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed'
  parentMessageId?: string
  threadId?: string
  propertyId?: string
  propertyName?: string
  unitId?: string
  unitNumber?: string
  tenantId?: string
  tenantName?: string
  maintenanceRequestId?: string
  scheduled?: boolean
  scheduledDate?: string
  attachments: {
    id: string
    name: string
    type: string
    size: number
    url: string
  }[]
  tags: string[]
  starred: boolean
  archived: boolean
  readReceipts: {
    userId: string
    userName: string
    readAt: string
  }[]
  createdAt: string
  updatedAt: string
}

interface Contact {
  id: string
  type: 'tenant' | 'vendor' | 'staff' | 'owner' | 'agent'
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  propertyId?: string
  propertyName?: string
  unitId?: string
  unitNumber?: string
  preferredContact: 'email' | 'sms' | 'phone'
  timezone: string
  language: string
  tags: string[]
  notes: string
  lastContact?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'rent_reminder' | 'lease_expiry' | 'maintenance_update' | 'welcome' | 'payment_confirmation' | 'custom'
  variables: string[]
  category: string
  active: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Demo data
const demoMessages: Message[] = [
  {
    id: 'msg-001',
    type: 'email',
    subject: 'February Rent Reminder - Unit 1205',
    content: 'Dear Omar,\n\nThis is a friendly reminder that your rent payment for February 2024 is due on February 1st.\n\nAmount: AED 8,500\nUnit: 1205, Burj Al Marina Residence\n\nPlease ensure payment is made by the due date to avoid any late fees.\n\nBest regards,\nPropertyFlow Management',
    fromId: 'system',
    fromName: 'PropertyFlow System',
    fromEmail: 'noreply@propertyflow.ae',
    toIds: ['tenant-001'],
    toNames: ['Omar Al-Hassan'],
    toEmails: ['omar.hassan@email.com'],
    priority: 'normal',
    status: 'sent',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    attachments: [],
    tags: ['rent', 'reminder', 'automatic'],
    starred: false,
    archived: false,
    readReceipts: [],
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z'
  },
  {
    id: 'msg-002',
    type: 'internal',
    subject: 'AC Repair Completed - Unit 1205',
    content: 'The AC repair for Unit 1205 has been completed successfully. The tenant has been notified and is satisfied with the work. Invoice has been generated and sent to accounting.',
    fromId: 'maint-001',
    fromName: 'Ahmed Hassan',
    fromEmail: 'ahmed@cooltech.ae',
    toIds: ['admin-001'],
    toNames: ['Property Manager'],
    priority: 'normal',
    status: 'read',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    maintenanceRequestId: 'maint-001',
    attachments: [
      {
        id: 'att-001',
        name: 'completion-photos.pdf',
        type: 'pdf',
        size: 2048000,
        url: 'completion-photos.pdf'
      }
    ],
    tags: ['maintenance', 'completed', 'hvac'],
    starred: true,
    archived: false,
    readReceipts: [
      {
        userId: 'admin-001',
        userName: 'Property Manager',
        readAt: '2024-01-16T14:30:00Z'
      }
    ],
    createdAt: '2024-01-16T13:45:00Z',
    updatedAt: '2024-01-16T14:30:00Z'
  },
  {
    id: 'msg-003',
    type: 'email',
    subject: 'Welcome to Business Bay Executive Center',
    content: 'Dear Sarah,\n\nWelcome to Business Bay Executive Center! We are excited to have you as our new tenant.\n\nYour lease details:\n- Unit: 1501\n- Move-in Date: September 1, 2023\n- Monthly Rent: AED 12,000\n\nPlease find attached:\n- Building rules and regulations\n- Emergency contact numbers\n- Parking guidelines\n\nIf you have any questions, please don\'t hesitate to contact us.\n\nBest regards,\nSarah Johnson\nProperty Manager',
    fromId: 'manager-002',
    fromName: 'Sarah Johnson',
    fromEmail: 'sarah.johnson@propertyflow.ae',
    toIds: ['tenant-002'],
    toNames: ['Sarah Mitchell'],
    toEmails: ['sarah.mitchell@email.com'],
    priority: 'normal',
    status: 'read',
    propertyId: 'prop-002',
    propertyName: 'Business Bay Executive Center',
    unitId: 'unit-003',
    unitNumber: '1501',
    tenantId: 'tenant-002',
    tenantName: 'Sarah Mitchell',
    attachments: [
      {
        id: 'att-002',
        name: 'building-guidelines.pdf',
        type: 'pdf',
        size: 1024000,
        url: 'building-guidelines.pdf'
      }
    ],
    tags: ['welcome', 'new-tenant', 'guidelines'],
    starred: false,
    archived: false,
    readReceipts: [
      {
        userId: 'tenant-002',
        userName: 'Sarah Mitchell',
        readAt: '2023-08-26T10:15:00Z'
      }
    ],
    createdAt: '2023-08-25T16:00:00Z',
    updatedAt: '2023-08-26T10:15:00Z'
  },
  {
    id: 'msg-004',
    type: 'sms',
    subject: 'Maintenance Scheduled - Tomorrow 10 AM',
    content: 'Hi Omar, your AC repair is scheduled for tomorrow (Jan 16) at 10:00 AM. Please ensure someone is available to provide access. Thanks! - PropertyFlow',
    fromId: 'system',
    fromName: 'PropertyFlow SMS',
    toIds: ['tenant-001'],
    toNames: ['Omar Al-Hassan'],
    priority: 'high',
    status: 'delivered',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    maintenanceRequestId: 'maint-001',
    attachments: [],
    tags: ['maintenance', 'reminder', 'sms'],
    starred: false,
    archived: false,
    readReceipts: [],
    createdAt: '2024-01-15T17:30:00Z',
    updatedAt: '2024-01-15T17:30:00Z'
  }
]

const demoContacts: Contact[] = [
  {
    id: 'contact-001',
    type: 'tenant',
    firstName: 'Omar',
    lastName: 'Al-Hassan',
    email: 'omar.hassan@email.com',
    phone: '+971-50-123-4567',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    preferredContact: 'email',
    timezone: 'Asia/Dubai',
    language: 'en',
    tags: ['vip', 'excellent-tenant'],
    notes: 'Prefers email communication, very responsive',
    lastContact: '2024-01-15T17:30:00Z',
    active: true,
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2024-01-15T17:30:00Z'
  },
  {
    id: 'contact-002',
    type: 'tenant',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+971-55-876-5432',
    company: 'Global Marketing FZ',
    propertyId: 'prop-002',
    propertyName: 'Business Bay Executive Center',
    unitId: 'unit-003',
    unitNumber: '1501',
    preferredContact: 'email',
    timezone: 'Asia/Dubai',
    language: 'en',
    tags: ['business-tenant', 'corporate'],
    notes: 'Business hours communication preferred',
    lastContact: '2023-08-26T10:15:00Z',
    active: true,
    createdAt: '2023-08-20T14:00:00Z',
    updatedAt: '2023-08-26T10:15:00Z'
  },
  {
    id: 'contact-003',
    type: 'vendor',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed@cooltech.ae',
    phone: '+971-50-555-0001',
    company: 'CoolTech Services',
    preferredContact: 'phone',
    timezone: 'Asia/Dubai',
    language: 'en',
    tags: ['hvac', 'reliable', 'emergency'],
    notes: 'Available for emergency calls, excellent service',
    lastContact: '2024-01-16T13:45:00Z',
    active: true,
    createdAt: '2023-01-15T09:00:00Z',
    updatedAt: '2024-01-16T13:45:00Z'
  }
]

const demoTemplates: EmailTemplate[] = [
  {
    id: 'template-001',
    name: 'Rent Reminder',
    subject: '{{MONTH}} Rent Reminder - Unit {{UNIT_NUMBER}}',
    content: 'Dear {{TENANT_NAME}},\n\nThis is a friendly reminder that your rent payment for {{MONTH}} {{YEAR}} is due on {{DUE_DATE}}.\n\nAmount: {{RENT_AMOUNT}}\nUnit: {{UNIT_NUMBER}}, {{PROPERTY_NAME}}\n\nPlease ensure payment is made by the due date to avoid any late fees.\n\nBest regards,\n{{COMPANY_NAME}}',
    type: 'rent_reminder',
    variables: ['TENANT_NAME', 'MONTH', 'YEAR', 'DUE_DATE', 'RENT_AMOUNT', 'UNIT_NUMBER', 'PROPERTY_NAME', 'COMPANY_NAME'],
    category: 'rent',
    active: true,
    createdBy: 'system',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'template-002',
    name: 'Maintenance Completion',
    subject: 'Maintenance Completed - {{MAINTENANCE_TYPE}}',
    content: 'Dear {{TENANT_NAME}},\n\nWe are pleased to inform you that the maintenance work for {{MAINTENANCE_TYPE}} in your unit has been completed successfully.\n\nWork Details:\n- Description: {{MAINTENANCE_DESCRIPTION}}\n- Completed Date: {{COMPLETION_DATE}}\n- Technician: {{TECHNICIAN_NAME}}\n\nIf you have any concerns about the work performed, please contact us immediately.\n\nThank you for your patience.\n\nBest regards,\n{{COMPANY_NAME}}',
    type: 'maintenance_update',
    variables: ['TENANT_NAME', 'MAINTENANCE_TYPE', 'MAINTENANCE_DESCRIPTION', 'COMPLETION_DATE', 'TECHNICIAN_NAME', 'COMPANY_NAME'],
    category: 'maintenance',
    active: true,
    createdBy: 'system',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
]

export function CommunicationsSystem({ user, accessToken }: CommunicationsSystemProps) {
  const [activeTab, setActiveTab] = useState('inbox')
  const [messages, setMessages] = useState<Message[]>(demoMessages)
  const [contacts, setContacts] = useState<Contact[]>(demoContacts)
  const [templates, setTemplates] = useState<EmailTemplate[]>(demoTemplates)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter messages based on tab and filters
  const getFilteredMessages = () => {
    let filtered = messages

    // Filter by tab
    switch (activeTab) {
      case 'inbox':
        filtered = filtered.filter(m => m.toIds.includes(user.id))
        break
      case 'sent':
        filtered = filtered.filter(m => m.fromId === user.id)
        break
      case 'drafts':
        filtered = filtered.filter(m => m.status === 'draft')
        break
      case 'starred':
        filtered = filtered.filter(m => m.starred)
        break
      case 'archived':
        filtered = filtered.filter(m => m.archived)
        break
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.fromName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent': return <Send className="h-3 w-3 text-blue-500" />
      case 'delivered': return <Send className="h-3 w-3 text-green-500" />
      case 'read': return <Eye className="h-3 w-3 text-green-600" />
      case 'failed': return <Trash2 className="h-3 w-3 text-red-500" />
      default: return null
    }
  }

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'normal': return 'text-gray-600'
      case 'low': return 'text-gray-400'
      default: return 'text-gray-600'
    }
  }

  const handleSendMessage = async (messageData: Partial<Message>) => {
    setIsLoading(true)
    try {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        type: messageData.type || 'email',
        subject: messageData.subject || '',
        content: messageData.content || '',
        fromId: user.id,
        fromName: user.fullName,
        fromEmail: user.email,
        toIds: messageData.toIds || [],
        toNames: messageData.toNames || [],
        toEmails: messageData.toEmails || [],
        priority: messageData.priority || 'normal',
        status: 'sent',
        attachments: messageData.attachments || [],
        tags: messageData.tags || [],
        starred: false,
        archived: false,
        readReceipts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...messageData
      }

      setMessages(prev => [newMessage, ...prev])
      setShowCompose(false)
      toast.success('Message sent successfully')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            status: 'read',
            readReceipts: [...msg.readReceipts, {
              userId: user.id,
              userName: user.fullName,
              readAt: new Date().toISOString()
            }]
          }
        : msg
    ))
  }

  const handleStarMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
    ))
  }

  const handleArchiveMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, archived: !msg.archived } : msg
    ))
  }

  const renderMessageList = () => (
    <div className="space-y-2">
      {getFilteredMessages().map((message) => (
        <Card 
          key={message.id} 
          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
            message.status === 'read' ? 'opacity-80' : ''
          } ${selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            setSelectedMessage(message)
            if (message.status !== 'read') {
              handleMarkAsRead(message.id)
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {message.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  <Badge variant="outline" className="text-xs">
                    {message.type}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(message.priority)}`}>
                    {message.priority}
                  </Badge>
                  {getMessageStatusIcon(message.status)}
                </div>
                
                <h4 className={`text-sm truncate ${message.status === 'read' ? 'font-normal' : 'font-semibold'}`}>
                  {message.subject}
                </h4>
                
                <p className="text-xs text-muted-foreground mb-1">
                  From: {message.fromName}
                  {message.propertyName && ` • ${message.propertyName}`}
                  {message.unitNumber && ` • Unit ${message.unitNumber}`}
                </p>
                
                <p className="text-xs text-muted-foreground truncate">
                  {message.content.substring(0, 100)}...
                </p>
                
                {message.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {message.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-right ml-4">
                <p className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {message.attachments.length > 0 && (
                  <div className="flex items-center justify-end mt-1">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-1">
                      {message.attachments.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {getFilteredMessages().length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No messages found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'No messages in this folder'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderMessageDetails = () => {
    if (!selectedMessage) {
      return (
        <Card className="h-full">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a message</h3>
              <p className="text-muted-foreground">Choose a message from the list to view its contents</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="h-full">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{selectedMessage.type}</Badge>
                <Badge variant="outline" className={getPriorityColor(selectedMessage.priority)}>
                  {selectedMessage.priority}
                </Badge>
                {getMessageStatusIcon(selectedMessage.status)}
              </div>
              <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
              <CardDescription>
                From: {selectedMessage.fromName}
                {selectedMessage.fromEmail && ` <${selectedMessage.fromEmail}>`}
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStarMessage(selectedMessage.id)}
              >
                <Star className={`h-4 w-4 ${selectedMessage.starred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleArchiveMessage(selectedMessage.id)}
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Reply className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Forward className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>To:</Label>
                <p>{selectedMessage.toNames.join(', ')}</p>
              </div>
              <div>
                <Label>Date:</Label>
                <p>{new Date(selectedMessage.createdAt).toLocaleDateString()} at {new Date(selectedMessage.createdAt).toLocaleTimeString()}</p>
              </div>
              {selectedMessage.propertyName && (
                <div>
                  <Label>Property:</Label>
                  <p>{selectedMessage.propertyName}</p>
                </div>
              )}
              {selectedMessage.unitNumber && (
                <div>
                  <Label>Unit:</Label>
                  <p>{selectedMessage.unitNumber}</p>
                </div>
              )}
            </div>
            
            {selectedMessage.tags.length > 0 && (
              <div>
                <Label>Tags:</Label>
                <div className="flex gap-1 mt-1">
                  {selectedMessage.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
            </div>
            
            {selectedMessage.attachments.length > 0 && (
              <div className="border-t pt-4">
                <Label>Attachments:</Label>
                <div className="space-y-2 mt-2">
                  {selectedMessage.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                      <Paperclip className="h-4 w-4" />
                      <span className="flex-1">{attachment.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {(attachment.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedMessage.readReceipts.length > 0 && (
              <div className="border-t pt-4">
                <Label>Read Receipts:</Label>
                <div className="space-y-1 mt-2">
                  {selectedMessage.readReceipts.map((receipt, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {receipt.userName} - {new Date(receipt.readAt).toLocaleString()}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Communications</h2>
          <p className="text-muted-foreground">Manage all your communications with tenants, vendors, and staff</p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Compose
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
                  placeholder="Search messages..."
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
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="notification">Notifications</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Communication Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-4">
              <ScrollArea className="h-[600px]">
                {renderMessageList()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sent" className="mt-4">
              <ScrollArea className="h-[600px]">
                {renderMessageList()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="starred" className="mt-4">
              <ScrollArea className="h-[600px]">
                {renderMessageList()}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          <ScrollArea className="h-[650px]">
            {renderMessageDetails()}
          </ScrollArea>
        </div>
      </div>

      {/* Compose Message Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Send a message to tenants, vendors, or staff
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleSendMessage({
                type: formData.get('type') as Message['type'],
                subject: formData.get('subject') as string,
                content: formData.get('content') as string,
                priority: formData.get('priority') as Message['priority'],
                toIds: ['tenant-001'], // This would be dynamic based on recipient selection
                toNames: ['Selected Recipients'],
                toEmails: ['recipient@email.com'],
                tags: ['manual']
              })
            }}>
              <div className="grid gap-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Message Type</Label>
                    <Select name="type" defaultValue="email">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
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
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-tenants">All Tenants</SelectItem>
                      <SelectItem value="property-tenants">Property Tenants</SelectItem>
                      <SelectItem value="vendors">All Vendors</SelectItem>
                      <SelectItem value="staff">Staff Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="Message subject" required />
                </div>

                <div>
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea 
                    id="content" 
                    name="content" 
                    placeholder="Type your message here..." 
                    className="min-h-[200px]"
                    required 
                  />
                </div>

                <div>
                  <Label>Template</Label>
                  <Select onValueChange={(value) => {
                    const template = templates.find(t => t.id === value)
                    if (template) {
                      // Auto-fill form with template data
                      // This would be implemented with form state management
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Use template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                  <Button type="button" variant="outline">
                    Schedule
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{messages.filter(m => m.type === 'email').length}</p>
                <p className="text-sm text-muted-foreground">Emails</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{messages.filter(m => m.type === 'sms').length}</p>
                <p className="text-sm text-muted-foreground">SMS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{messages.filter(m => m.status === 'sent' && m.type !== 'draft').length}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{contacts.filter(c => c.active).length}</p>
                <p className="text-sm text-muted-foreground">Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
