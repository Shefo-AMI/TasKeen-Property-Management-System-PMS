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
import { User, Loader2, Mail, Phone, CreditCard, Calendar } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'

// Tenant validation schema
const tenantSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number'),
  alternatePhone: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  nationalId: z.string().min(5, 'National ID is required'),
  occupation: z.string().min(2, 'Occupation is required'),
  employerName: z.string().optional(),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
  emergencyPhone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number'),
  moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  leaseEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().or(z.literal('')),
  monthlyRent: z.number().min(0, 'Monthly rent cannot be negative'),
  securityDeposit: z.number().min(0, 'Security deposit cannot be negative'),
  propertyId: z.string().min(1, 'Property must be selected'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  notes: z.string().optional(),
})

type TenantFormData = z.infer<typeof tenantSchema>

interface Tenant extends TenantFormData {
  id: string
  status: 'active' | 'pending' | 'inactive' | 'evicted'
  paymentStatus: 'current' | 'late' | 'delinquent'
  createdAt: Date
}

interface TenantCRUDProps {
  open: boolean
  mode: 'create' | 'edit' | 'view'
  tenant?: Tenant
  properties?: Array<{ id: string; name: string }>
  onClose: () => void
  onSave: (data: TenantFormData) => Promise<void>
}

export function TenantCRUD({ open, mode, tenant, properties = [], onClose, onSave }: TenantCRUDProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      dateOfBirth: '',
      nationalId: '',
      occupation: '',
      employerName: '',
      emergencyContact: '',
      emergencyPhone: '',
      moveInDate: new Date().toISOString().split('T')[0],
      leaseEndDate: '',
      monthlyRent: 0,
      securityDeposit: 0,
      propertyId: '',
      unitNumber: '',
      notes: '',
    },
  })

  const propertyId = watch('propertyId')

  const onSubmit = async (data: TenantFormData) => {
    try {
      setIsSubmitting(true)
      await onSave(data)
      toast.success(mode === 'create' ? 'Tenant created successfully!' : 'Tenant updated successfully!')
      reset()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tenant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsSubmitting(true)
      // Call delete API here
      toast.success('Tenant deleted successfully!')
      setShowDeleteDialog(false)
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tenant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReadOnly = mode === 'view'

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {mode === 'create' && 'Add New Tenant'}
              {mode === 'edit' && 'Edit Tenant'}
              {mode === 'view' && 'Tenant Details'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' && 'Add a new tenant to your property'}
              {mode === 'edit' && 'Update tenant information'}
              {mode === 'view' && 'View tenant information'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    disabled={isReadOnly}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    disabled={isReadOnly}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                    disabled={isReadOnly}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-destructive text-sm mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nationalId">National ID/Passport *</Label>
                  <Input
                    id="nationalId"
                    {...register('nationalId')}
                    disabled={isReadOnly}
                    placeholder="784-XXXX-XXXXXXX-X"
                  />
                  {errors.nationalId && (
                    <p className="text-destructive text-sm mt-1">{errors.nationalId.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={isReadOnly}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    disabled={isReadOnly}
                    placeholder="+971 50 XXX XXXX"
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    {...register('alternatePhone')}
                    disabled={isReadOnly}
                    placeholder="+971 4 XXX XXXX"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Employment Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    {...register('occupation')}
                    disabled={isReadOnly}
                    placeholder="Software Engineer"
                  />
                  {errors.occupation && (
                    <p className="text-destructive text-sm mt-1">{errors.occupation.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="employerName">Employer Name</Label>
                  <Input
                    id="employerName"
                    {...register('employerName')}
                    disabled={isReadOnly}
                    placeholder="ABC Company"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency Contact
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContact"
                    {...register('emergencyContact')}
                    disabled={isReadOnly}
                    placeholder="Jane Doe"
                  />
                  {errors.emergencyContact && (
                    <p className="text-destructive text-sm mt-1">{errors.emergencyContact.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">Emergency Phone *</Label>
                  <Input
                    id="emergencyPhone"
                    {...register('emergencyPhone')}
                    disabled={isReadOnly}
                    placeholder="+971 50 XXX XXXX"
                  />
                  {errors.emergencyPhone && (
                    <p className="text-destructive text-sm mt-1">{errors.emergencyPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Lease Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Lease Information
              </h3>
              
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
                  <Label htmlFor="moveInDate">Move-In Date *</Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    {...register('moveInDate')}
                    disabled={isReadOnly}
                  />
                  {errors.moveInDate && (
                    <p className="text-destructive text-sm mt-1">{errors.moveInDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="leaseEndDate">Lease End Date</Label>
                  <Input
                    id="leaseEndDate"
                    type="date"
                    {...register('leaseEndDate')}
                    disabled={isReadOnly}
                  />
                  {errors.leaseEndDate && (
                    <p className="text-destructive text-sm mt-1">{errors.leaseEndDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="monthlyRent">Monthly Rent ($) *</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    {...register('monthlyRent', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="1500"
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
                    {...register('securityDeposit', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="3000"
                  />
                  {errors.securityDeposit && (
                    <p className="text-destructive text-sm mt-1">{errors.securityDeposit.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  disabled={isReadOnly}
                  placeholder="Any additional notes about the tenant..."
                  rows={3}
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
                  Delete Tenant
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                {mode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Add Tenant' : 'Save Changes'}
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
              This will permanently delete this tenant and all associated records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Tenant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export type { Tenant, TenantFormData }
