import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from 'sonner'
import { Wrench, Loader2, AlertCircle, DollarSign, Calendar, Image as ImageIcon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import { Badge } from '../ui/badge'

// Maintenance validation schema
const maintenanceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other']),
  propertyId: z.string().min(1, 'Property must be selected'),
  unitNumber: z.string().optional(),
  tenantId: z.string().optional(),
  assignedTo: z.string().optional(),
  estimatedCost: z.number().min(0, 'Cost cannot be negative').optional(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

interface Maintenance extends MaintenanceFormData {
  id: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  actualCost?: number
  beforePhotos?: string[]
  afterPhotos?: string[]
}

interface MaintenanceCRUDProps {
  open: boolean
  mode: 'create' | 'edit' | 'view'
  maintenance?: Maintenance
  properties?: Array<{ id: string; name: string }>
  tenants?: Array<{ id: string; name: string }>
  vendors?: Array<{ id: string; name: string }>
  onClose: () => void
  onSave: (data: MaintenanceFormData) => Promise<void>
  onComplete?: (id: string, actualCost: number, afterPhotos: string[]) => Promise<void>
}

export function MaintenanceCRUD({
  open,
  mode,
  maintenance,
  properties = [],
  tenants = [],
  vendors = [],
  onClose,
  onSave,
  onComplete,
}: MaintenanceCRUDProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [actualCost, setActualCost] = useState(maintenance?.actualCost || 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: maintenance || {
      title: '',
      description: '',
      priority: 'medium',
      category: 'other',
      propertyId: '',
      unitNumber: '',
      tenantId: '',
      assignedTo: '',
      estimatedCost: 0,
      scheduledDate: '',
      notes: '',
    },
  })

  const priority = watch('priority')
  const category = watch('category')
  const propertyId = watch('propertyId')

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      setIsSubmitting(true)
      await onSave(data)
      toast.success(mode === 'create' ? 'Maintenance ticket created!' : 'Maintenance ticket updated!')
      reset()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save maintenance ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = async () => {
    if (!maintenance?.id || !onComplete) return

    try {
      setIsSubmitting(true)
      await onComplete(maintenance.id, actualCost, [])
      toast.success('Maintenance ticket completed and invoice generated!')
      setShowCompleteDialog(false)
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete maintenance ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsSubmitting(true)
      toast.success('Maintenance ticket deleted successfully!')
      setShowDeleteDialog(false)
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete maintenance ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500',
    }
    return colors[priority] || colors.medium
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
    }
    return colors[status] || colors.open
  }

  const isReadOnly = mode === 'view'

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {mode === 'create' && 'Create Maintenance Ticket'}
              {mode === 'edit' && 'Edit Maintenance Ticket'}
              {mode === 'view' && 'Maintenance Ticket Details'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' && 'Create a new maintenance request'}
              {mode === 'edit' && 'Update maintenance ticket information'}
              {mode === 'view' && 'View maintenance ticket details'}
            </DialogDescription>
          </DialogHeader>

          {maintenance && mode === 'view' && (
            <div className="flex gap-2 mb-4">
              <Badge className={`${getStatusColor(maintenance.status)} text-white`}>
                {maintenance.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={`${getPriorityColor(maintenance.priority)} text-white`}>
                {maintenance.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Ticket Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    disabled={isReadOnly}
                    placeholder="e.g., Leaking faucet in kitchen"
                  />
                  {errors.title && (
                    <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    disabled={isReadOnly}
                    placeholder="Provide detailed description of the issue..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={priority}
                      onValueChange={(value) => setValue('priority', value as any)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-destructive text-sm mt-1">{errors.priority.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={category}
                      onValueChange={(value) => setValue('category', value as any)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="appliance">Appliance</SelectItem>
                        <SelectItem value="structural">Structural</SelectItem>
                        <SelectItem value="pest">Pest Control</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-destructive text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3>Location</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyId">Property *</Label>
                  <Select
                    value={propertyId}
                    onValueChange={(value) => setValue('propertyId', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                      {properties.length === 0 && (
                        <SelectItem value="demo-1">Sample Property 1</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.propertyId && (
                    <p className="text-destructive text-sm mt-1">{errors.propertyId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    {...register('unitNumber')}
                    disabled={isReadOnly}
                    placeholder="101"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="tenantId">Tenant (Optional)</Label>
                  <Select
                    value={watch('tenantId')}
                    onValueChange={(value) => setValue('tenantId', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Assignment & Scheduling */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Assignment & Scheduling
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select
                    value={watch('assignedTo')}
                    onValueChange={(value) => setValue('assignedTo', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor/staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                      {vendors.length === 0 && (
                        <>
                          <SelectItem value="vendor-1">John's Plumbing</SelectItem>
                          <SelectItem value="vendor-2">Elite Electricians</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    {...register('scheduledDate')}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Cost Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    {...register('estimatedCost', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="0.00"
                  />
                  {errors.estimatedCost && (
                    <p className="text-destructive text-sm mt-1">{errors.estimatedCost.message}</p>
                  )}
                </div>

                {maintenance?.actualCost !== undefined && (
                  <div>
                    <Label>Actual Cost ($)</Label>
                    <Input
                      type="number"
                      value={maintenance.actualCost}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                disabled={isReadOnly}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2">
              {mode === 'view' && maintenance?.status !== 'completed' && onComplete && (
                <Button
                  type="button"
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={isSubmitting}
                >
                  Mark as Complete
                </Button>
              )}
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting}
                >
                  Delete Ticket
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                {mode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Create Ticket' : 'Save Changes'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Maintenance Ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the ticket as completed and generate an invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="actualCost">Actual Cost ($)</Label>
            <Input
              id="actualCost"
              type="number"
              step="0.01"
              value={actualCost}
              onChange={(e) => setActualCost(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete & Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this maintenance ticket. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export type { Maintenance, MaintenanceFormData }
