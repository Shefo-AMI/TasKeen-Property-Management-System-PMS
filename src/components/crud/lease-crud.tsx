import React, { useState } from 'react'
import { useForm } from 'react-hook-form@7.55.0'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from 'sonner@2.0.3'
import { FileText, Loader2, Calendar, DollarSign, User } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import { Badge } from '../ui/badge'

// Lease validation schema
const leaseSchema = z.object({
  propertyId: z.string().min(1, 'Property must be selected'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  tenantId: z.string().min(1, 'Tenant must be selected'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  monthlyRent: z.number().min(1, 'Monthly rent must be greater than 0'),
  securityDeposit: z.number().min(0, 'Security deposit cannot be negative'),
  paymentDueDay: z.number().min(1).max(31, 'Must be between 1 and 31'),
  lateFeeAmount: z.number().min(0, 'Late fee cannot be negative').optional(),
  lateFeeGracePeriod: z.number().min(0).max(30).optional(),
  leaseType: z.enum(['fixed', 'month_to_month', 'yearly']),
  renewalOption: z.enum(['auto_renew', 'manual', 'no_renewal']),
  petAllowed: z.boolean().optional(),
  petDeposit: z.number().min(0).optional(),
  smokingAllowed: z.boolean().optional(),
  utilitiesIncluded: z.string().optional(),
  parkingSpaces: z.number().min(0).optional(),
  specialTerms: z.string().optional(),
  notes: z.string().optional(),
})

type LeaseFormData = z.infer<typeof leaseSchema>

interface Lease extends LeaseFormData {
  id: string
  status: 'draft' | 'active' | 'expiring_soon' | 'expired' | 'terminated'
  createdAt: Date
  updatedAt: Date
  signedDate?: Date
  documentUrl?: string
}

interface LeaseCRUDProps {
  open: boolean
  mode: 'create' | 'edit' | 'view'
  lease?: Lease
  properties?: Array<{ id: string; name: string }>
  tenants?: Array<{ id: string; name: string }>
  onClose: () => void
  onSave: (data: LeaseFormData) => Promise<void>
}

export function LeaseCRUD({ open, mode, lease, properties = [], tenants = [], onClose, onSave }: LeaseCRUDProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: lease || {
      propertyId: '',
      unitNumber: '',
      tenantId: '',
      startDate: '',
      endDate: '',
      monthlyRent: 0,
      securityDeposit: 0,
      paymentDueDay: 1,
      lateFeeAmount: 50,
      lateFeeGracePeriod: 5,
      leaseType: 'yearly',
      renewalOption: 'manual',
      petAllowed: false,
      petDeposit: 0,
      smokingAllowed: false,
      utilitiesIncluded: '',
      parkingSpaces: 0,
      specialTerms: '',
      notes: '',
    },
  })

  const propertyId = watch('propertyId')
  const leaseType = watch('leaseType')
  const petAllowed = watch('petAllowed')

  const onSubmit = async (data: LeaseFormData) => {
    try {
      setIsSubmitting(true)
      await onSave(data)
      toast.success(mode === 'create' ? 'Lease created successfully!' : 'Lease updated successfully!')
      reset()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save lease')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsSubmitting(true)
      toast.success('Lease deleted successfully!')
      setShowDeleteDialog(false)
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete lease')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      active: 'bg-green-500',
      expiring_soon: 'bg-yellow-500',
      expired: 'bg-red-500',
      terminated: 'bg-red-700',
    }
    return colors[status] || colors.draft
  }

  const isReadOnly = mode === 'view'

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {mode === 'create' && 'Create New Lease'}
              {mode === 'edit' && 'Edit Lease Agreement'}
              {mode === 'view' && 'Lease Agreement Details'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' && 'Create a new lease agreement'}
              {mode === 'edit' && 'Update lease agreement information'}
              {mode === 'view' && 'View lease agreement details'}
            </DialogDescription>
          </DialogHeader>

          {lease && mode === 'view' && (
            <div className="flex gap-2 mb-4">
              <Badge className={`${getStatusColor(lease.status)} text-white`}>
                {lease.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Property & Tenant Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Property & Tenant
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="propertyId">Property *</Label>
                  <Select
                    value={propertyId}
                    onValueChange={(value) => setValue('propertyId', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
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
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input
                    id="unitNumber"
                    {...register('unitNumber')}
                    disabled={isReadOnly}
                    placeholder="101"
                  />
                  {errors.unitNumber && (
                    <p className="text-destructive text-sm mt-1">{errors.unitNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tenantId">Tenant *</Label>
                  <Select
                    value={watch('tenantId')}
                    onValueChange={(value) => setValue('tenantId', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                      {tenants.length === 0 && (
                        <SelectItem value="demo-tenant-1">John Doe</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.tenantId && (
                    <p className="text-destructive text-sm mt-1">{errors.tenantId.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Lease Term */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Lease Term
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                    disabled={isReadOnly}
                  />
                  {errors.startDate && (
                    <p className="text-destructive text-sm mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register('endDate')}
                    disabled={isReadOnly}
                  />
                  {errors.endDate && (
                    <p className="text-destructive text-sm mt-1">{errors.endDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="leaseType">Lease Type *</Label>
                  <Select
                    value={leaseType}
                    onValueChange={(value) => setValue('leaseType', value as any)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Term</SelectItem>
                      <SelectItem value="month_to_month">Month to Month</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.leaseType && (
                    <p className="text-destructive text-sm mt-1">{errors.leaseType.message}</p>
                  )}
                </div>

                <div className="col-span-3">
                  <Label htmlFor="renewalOption">Renewal Option *</Label>
                  <Select
                    value={watch('renewalOption')}
                    onValueChange={(value) => setValue('renewalOption', value as any)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto_renew">Auto Renew</SelectItem>
                      <SelectItem value="manual">Manual Renewal</SelectItem>
                      <SelectItem value="no_renewal">No Renewal</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.renewalOption && (
                    <p className="text-destructive text-sm mt-1">{errors.renewalOption.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Terms */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Terms
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyRent">Monthly Rent ($) *</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    step="0.01"
                    {...register('monthlyRent', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="1500.00"
                  />
                  {errors.monthlyRent && (
                    <p className="text-destructive text-sm mt-1">{errors.monthlyRent.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="securityDeposit">Security Deposit ($) *</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    step="0.01"
                    {...register('securityDeposit', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="3000.00"
                  />
                  {errors.securityDeposit && (
                    <p className="text-destructive text-sm mt-1">{errors.securityDeposit.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentDueDay">Payment Due Day *</Label>
                  <Input
                    id="paymentDueDay"
                    type="number"
                    {...register('paymentDueDay', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="1"
                    min="1"
                    max="31"
                  />
                  {errors.paymentDueDay && (
                    <p className="text-destructive text-sm mt-1">{errors.paymentDueDay.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lateFeeAmount">Late Fee Amount ($)</Label>
                  <Input
                    id="lateFeeAmount"
                    type="number"
                    step="0.01"
                    {...register('lateFeeAmount', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <Label htmlFor="lateFeeGracePeriod">Late Fee Grace Period (days)</Label>
                  <Input
                    id="lateFeeGracePeriod"
                    type="number"
                    {...register('lateFeeGracePeriod', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            {/* Property Rules */}
            <div className="space-y-4">
              <h3>Property Rules & Amenities</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="petAllowed"
                    {...register('petAllowed')}
                    disabled={isReadOnly}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="petAllowed" className="cursor-pointer">
                    Pets Allowed
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smokingAllowed"
                    {...register('smokingAllowed')}
                    disabled={isReadOnly}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="smokingAllowed" className="cursor-pointer">
                    Smoking Allowed
                  </Label>
                </div>

                {petAllowed && (
                  <div>
                    <Label htmlFor="petDeposit">Pet Deposit ($)</Label>
                    <Input
                      id="petDeposit"
                      type="number"
                      step="0.01"
                      {...register('petDeposit', { valueAsNumber: true })}
                      disabled={isReadOnly}
                      placeholder="500.00"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                  <Input
                    id="parkingSpaces"
                    type="number"
                    {...register('parkingSpaces', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="1"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="utilitiesIncluded">Utilities Included</Label>
                  <Input
                    id="utilitiesIncluded"
                    {...register('utilitiesIncluded')}
                    disabled={isReadOnly}
                    placeholder="Water, Gas, Electricity, etc."
                  />
                </div>
              </div>
            </div>

            {/* Special Terms & Notes */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="specialTerms">Special Terms</Label>
                <Textarea
                  id="specialTerms"
                  {...register('specialTerms')}
                  disabled={isReadOnly}
                  placeholder="Any special lease terms or conditions..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  disabled={isReadOnly}
                  placeholder="Internal notes (not visible to tenant)..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting}
                >
                  Delete Lease
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                {mode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Create Lease' : 'Save Changes'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this lease agreement. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Lease
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export type { Lease, LeaseFormData }
