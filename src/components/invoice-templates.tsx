import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { 
  FileText, 
  Download, 
  Upload, 
  Edit, 
  Copy, 
  Star,
  Plus,
  Building2,
  User,
  Mail,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface InvoiceTemplate {
  id: string
  name: string
  isDefault: boolean
  companyLogo?: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  primaryColor: string
  accentColor: string
  fontFamily: string
  layoutStyle: 'modern' | 'classic' | 'minimal'
  createdAt: string
}

interface InvoiceTemplatesProps {
  templates: InvoiceTemplate[]
  onCreateTemplate: (template: any) => void
  onUpdateTemplate: (id: string, template: any) => void
  onSetDefault: (id: string) => void
}

const predefinedTemplates = [
  {
    name: 'Modern Professional',
    layoutStyle: 'modern',
    primaryColor: '#2563eb',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    description: 'Clean and modern design with blue accents'
  },
  {
    name: 'Classic Business',
    layoutStyle: 'classic',
    primaryColor: '#1f2937',
    accentColor: '#374151',
    fontFamily: 'Times New Roman',
    description: 'Traditional business layout with professional styling'
  },
  {
    name: 'Minimal Clean',
    layoutStyle: 'minimal',
    primaryColor: '#059669',
    accentColor: '#10b981',
    fontFamily: 'Arial',
    description: 'Minimalist design focusing on content clarity'
  },
  {
    name: 'Property Focus',
    layoutStyle: 'modern',
    primaryColor: '#dc2626',
    accentColor: '#ef4444',
    fontFamily: 'Inter',
    description: 'Designed specifically for property management'
  }
]

export function InvoiceTemplates({ templates, onCreateTemplate, onUpdateTemplate, onSetDefault }: InvoiceTemplatesProps) {
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyLogo: '',
    primaryColor: '#2563eb',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    layoutStyle: 'modern' as 'modern' | 'classic' | 'minimal'
  })

  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.companyName) {
      toast.error('Please fill in template name and company name')
      return
    }

    onCreateTemplate(newTemplate)
    setNewTemplate({
      name: '',
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      companyLogo: '',
      primaryColor: '#2563eb',
      accentColor: '#3b82f6',
      fontFamily: 'Inter',
      layoutStyle: 'modern'
    })
    toast.success('Template created successfully!')
  }

  const handleCreateFromPredefined = (predefined: any) => {
    const template = {
      ...newTemplate,
      ...predefined,
      name: predefined.name + ' - Copy'
    }
    setNewTemplate(template)
  }

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return

    onUpdateTemplate(editingTemplate.id, {
      ...editingTemplate,
      updatedAt: new Date().toISOString()
    })
    setEditingTemplate(null)
    toast.success('Template updated successfully!')
  }

  const generatePreview = (template: any) => {
    return {
      companySection: {
        logo: template.companyLogo,
        name: template.companyName,
        address: template.companyAddress,
        phone: template.companyPhone,
        email: template.companyEmail
      },
      styling: {
        primaryColor: template.primaryColor,
        accentColor: template.accentColor,
        fontFamily: template.fontFamily,
        layoutStyle: template.layoutStyle
      },
      sampleInvoice: {
        number: 'INV-2024-001',
        date: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        items: [
          { description: 'Monthly Rent - Unit 101', qty: 1, rate: 5000, amount: 5000 },
          { description: 'Maintenance Fee', qty: 1, rate: 200, amount: 200 }
        ],
        total: 5200
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Invoice Templates</h3>
          <p className="text-white/80">Create and manage your invoice templates</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Invoice Template</DialogTitle>
              <DialogDescription>
                Design a custom invoice template for your business
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Predefined Templates */}
              <div>
                <Label>Quick Start Templates</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {predefinedTemplates.map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: template.primaryColor }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCreateFromPredefined(template)}
                          >
                            Use Template
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setPreviewTemplate(generatePreview(template))}
                          >
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Custom Template Form */}
              <div className="border-t pt-6">
                <Label className="text-base font-medium">Custom Template</Label>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="e.g., Standard Invoice"
                    />
                  </div>
                  <div>
                    <Label htmlFor="layout-style">Layout Style</Label>
                    <select 
                      id="layout-style"
                      value={newTemplate.layoutStyle}
                      onChange={(e) => setNewTemplate({ ...newTemplate, layoutStyle: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={newTemplate.companyName}
                      onChange={(e) => setNewTemplate({ ...newTemplate, companyName: e.target.value })}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-address">Company Address</Label>
                    <Textarea
                      id="company-address"
                      value={newTemplate.companyAddress}
                      onChange={(e) => setNewTemplate({ ...newTemplate, companyAddress: e.target.value })}
                      placeholder="123 Business Street, City, Country"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-phone">Phone</Label>
                      <Input
                        id="company-phone"
                        value={newTemplate.companyPhone}
                        onChange={(e) => setNewTemplate({ ...newTemplate, companyPhone: e.target.value })}
                        placeholder="+971 50 123 4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={newTemplate.companyEmail}
                        onChange={(e) => setNewTemplate({ ...newTemplate, companyEmail: e.target.value })}
                        placeholder="info@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company-logo">Company Logo URL</Label>
                    <Input
                      id="company-logo"
                      value={newTemplate.companyLogo}
                      onChange={(e) => setNewTemplate({ ...newTemplate, companyLogo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                {/* Color Scheme */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={newTemplate.primaryColor}
                        onChange={(e) => setNewTemplate({ ...newTemplate, primaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={newTemplate.primaryColor}
                        onChange={(e) => setNewTemplate({ ...newTemplate, primaryColor: e.target.value })}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={newTemplate.accentColor}
                        onChange={(e) => setNewTemplate({ ...newTemplate, accentColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={newTemplate.accentColor}
                        onChange={(e) => setNewTemplate({ ...newTemplate, accentColor: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <select 
                      id="font-family"
                      value={newTemplate.fontFamily}
                      onChange={(e) => setNewTemplate({ ...newTemplate, fontFamily: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleCreateTemplate} className="flex-1">
                    Create Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setPreviewTemplate(generatePreview(newTemplate))}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {template.isDefault && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: template.primaryColor }}
                />
              </div>
              <CardDescription>
                {template.companyName} • {template.layoutStyle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{template.companyName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{template.companyEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3" />
                  <span className="truncate">{template.companyPhone}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditingTemplate(template)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setPreviewTemplate(generatePreview(template))}
                >
                  <FileText className="h-3 w-3" />
                </Button>
                {!template.isDefault && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onSetDefault(template.id)}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {templates.length === 0 && (
          <div className="col-span-full text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No templates created yet</p>
            <p className="text-sm text-gray-400">Create your first invoice template to get started</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
              <DialogDescription>
                Preview of how your invoice will look
              </DialogDescription>
            </DialogHeader>
            <div 
              className="border rounded-lg p-8 bg-white"
              style={{ 
                fontFamily: previewTemplate.styling.fontFamily,
                color: '#000'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  {previewTemplate.companySection.logo && (
                    <ImageWithFallback
                      src={previewTemplate.companySection.logo}
                      alt="Company Logo"
                      className="h-16 w-auto mb-4"
                    />
                  )}
                  <h1 
                    className="text-2xl font-bold mb-2"
                    style={{ color: previewTemplate.styling.primaryColor }}
                  >
                    {previewTemplate.companySection.name}
                  </h1>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {previewTemplate.companySection.address}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {previewTemplate.companySection.phone} • {previewTemplate.companySection.email}
                  </div>
                </div>
                <div className="text-right">
                  <h2 
                    className="text-3xl font-bold"
                    style={{ color: previewTemplate.styling.primaryColor }}
                  >
                    INVOICE
                  </h2>
                  <div className="text-sm text-gray-600 mt-2">
                    <div>Invoice #: {previewTemplate.sampleInvoice.number}</div>
                    <div>Date: {previewTemplate.sampleInvoice.date}</div>
                    <div>Due: {previewTemplate.sampleInvoice.dueDate}</div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-8">
                <div 
                  className="grid grid-cols-4 gap-4 p-3 font-medium text-white rounded-t"
                  style={{ backgroundColor: previewTemplate.styling.accentColor }}
                >
                  <div>Description</div>
                  <div className="text-center">Qty</div>
                  <div className="text-center">Rate</div>
                  <div className="text-right">Amount</div>
                </div>
                {previewTemplate.sampleInvoice.items.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border-b">
                    <div>{item.description}</div>
                    <div className="text-center">{item.qty}</div>
                    <div className="text-center">AED {item.rate}</div>
                    <div className="text-right">AED {item.amount}</div>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <div className="w-64">
                    <div 
                      className="flex justify-between p-3 font-bold text-white rounded"
                      style={{ backgroundColor: previewTemplate.styling.primaryColor }}
                    >
                      <span>Total</span>
                      <span>AED {previewTemplate.sampleInvoice.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 text-center">
                Thank you for your business!
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update your invoice template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-company-name">Company Name</Label>
                <Input
                  id="edit-company-name"
                  value={editingTemplate.companyName}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, companyName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-company-address">Company Address</Label>
                <Textarea
                  id="edit-company-address"
                  value={editingTemplate.companyAddress}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, companyAddress: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingTemplate.companyPhone}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, companyPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={editingTemplate.companyEmail}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, companyEmail: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleUpdateTemplate} className="w-full">
                Update Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
