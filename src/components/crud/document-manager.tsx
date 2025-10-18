import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from 'sonner@2.0.3'
import { FileText, Upload, Loader2, File, Image as ImageIcon, FileSpreadsheet, Link2, X, Download, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import { ScrollArea } from '../ui/scroll-area'

interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  category: 'lease' | 'inspection' | 'maintenance' | 'invoice' | 'photo' | 'other'
  linkedTo: 'property' | 'tenant' | 'lease' | 'maintenance'
  linkedId: string
  linkedName: string
  uploadedBy: string
  uploadedAt: Date
  description?: string
}

interface DocumentUploadData {
  file?: File
  name: string
  category: string
  linkedTo: string
  linkedId: string
  description: string
}

interface DocumentManagerProps {
  open: boolean
  onClose: () => void
  linkedTo?: 'property' | 'tenant' | 'lease' | 'maintenance'
  linkedId?: string
  linkedName?: string
  properties?: Array<{ id: string; name: string }>
  tenants?: Array<{ id: string; name: string }>
  existingDocuments?: Document[]
  onUpload: (data: DocumentUploadData) => Promise<void>
  onDelete?: (documentId: string) => Promise<void>
}

export function DocumentManager({
  open,
  onClose,
  linkedTo,
  linkedId,
  linkedName,
  properties = [],
  tenants = [],
  existingDocuments = [],
  onUpload,
  onDelete,
}: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState('')
  const [category, setCategory] = useState<string>(linkedTo === 'maintenance' ? 'maintenance' : 'other')
  const [selectedLinkedTo, setSelectedLinkedTo] = useState<string>(linkedTo || 'property')
  const [selectedLinkedId, setSelectedLinkedId] = useState<string>(linkedId || '')
  const [description, setDescription] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setDocumentName(file.name)

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile && !documentName) {
      toast.error('Please select a file or enter a document name')
      return
    }

    if (!selectedLinkedId) {
      toast.error('Please select what this document is linked to')
      return
    }

    try {
      setIsUploading(true)
      
      await onUpload({
        file: selectedFile || undefined,
        name: documentName,
        category,
        linkedTo: selectedLinkedTo,
        linkedId: selectedLinkedId,
        description,
      })

      toast.success('Document uploaded successfully!')
      
      // Reset form
      setSelectedFile(null)
      setDocumentName('')
      setDescription('')
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!onDelete) return

    try {
      await onDelete(documentId)
      toast.success('Document deleted successfully!')
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document')
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getCategoryBadgeColor = (cat: string) => {
    const colors: Record<string, string> = {
      lease: 'bg-blue-500',
      inspection: 'bg-green-500',
      maintenance: 'bg-orange-500',
      invoice: 'bg-purple-500',
      photo: 'bg-pink-500',
      other: 'bg-gray-500',
    }
    return colors[cat] || colors.other
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Manager
            </DialogTitle>
            <DialogDescription>
              Upload and manage documents for properties, tenants, and leases
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
            {/* Upload Section */}
            <div className="space-y-4 overflow-y-auto pr-2">
              <h3>Upload New Document</h3>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(selectedFile.type)}
                        <div>
                          <p className="text-sm">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="border rounded-lg p-2">
                    <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded" />
                  </div>
                )}

                {/* Document Name */}
                <div>
                  <Label htmlFor="documentName">Document Name *</Label>
                  <Input
                    id="documentName"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="e.g., Lease Agreement 2024"
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lease">Lease Agreement</SelectItem>
                      <SelectItem value="inspection">Inspection Report</SelectItem>
                      <SelectItem value="maintenance">Maintenance Record</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Link To */}
                <div>
                  <Label htmlFor="linkedTo">Link To *</Label>
                  <Select 
                    value={selectedLinkedTo} 
                    onValueChange={(value) => {
                      setSelectedLinkedTo(value)
                      setSelectedLinkedId('')
                    }}
                    disabled={!!linkedTo}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="maintenance">Maintenance Ticket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Property/Tenant */}
                <div>
                  <Label htmlFor="linkedId">
                    {selectedLinkedTo === 'property' && 'Select Property *'}
                    {selectedLinkedTo === 'tenant' && 'Select Tenant *'}
                    {selectedLinkedTo === 'lease' && 'Lease ID *'}
                    {selectedLinkedTo === 'maintenance' && 'Maintenance Ticket ID *'}
                  </Label>
                  {(selectedLinkedTo === 'property' || selectedLinkedTo === 'tenant') ? (
                    <Select 
                      value={selectedLinkedId} 
                      onValueChange={setSelectedLinkedId}
                      disabled={!!linkedId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select a ${selectedLinkedTo}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedLinkedTo === 'property' && properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                        {selectedLinkedTo === 'tenant' && tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                        {((selectedLinkedTo === 'property' && properties.length === 0) || 
                          (selectedLinkedTo === 'tenant' && tenants.length === 0)) && (
                          <SelectItem value="demo-1">Demo Item</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={selectedLinkedId}
                      onChange={(e) => setSelectedLinkedId(e.target.value)}
                      placeholder="Enter ID"
                      disabled={!!linkedId}
                    />
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes about this document..."
                    rows={3}
                  />
                </div>

                {/* Upload Button */}
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading || (!selectedFile && !documentName)}
                  className="w-full"
                >
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </div>

            {/* Existing Documents Section */}
            <div className="space-y-4 overflow-hidden flex flex-col">
              <h3>Existing Documents ({existingDocuments.length})</h3>
              
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {existingDocuments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No documents uploaded yet</p>
                      <p className="text-sm">Upload your first document to get started</p>
                    </div>
                  ) : (
                    existingDocuments.map((doc) => (
                      <Card key={doc.id} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {getFileIcon(doc.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{doc.name}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge className={`${getCategoryBadgeColor(doc.category)} text-white text-xs`}>
                                    {doc.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Link2 className="h-3 w-3" />
                                    {doc.linkedName}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(doc.url, '_blank')}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = doc.url
                                  link.download = doc.name
                                  link.click()
                                }}
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {onDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDocumentToDelete(doc.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this document. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => documentToDelete && handleDelete(documentToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export type { Document, DocumentUploadData }
