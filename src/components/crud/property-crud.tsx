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
import { Building2, Loader2, MapPin, DollarSign, Home, Image as ImageIcon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'

// Property validation schema
const propertySchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  propertyType: z.enum(['residential', 'commercial', 'mixed', 'industrial']),
  units: z.number().min(1, 'Must have at least 1 unit'),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()),
  totalArea: z.number().min(1, 'Total area must be greater than 0'),
  monthlyRent: z.number().min(0, 'Monthly rent cannot be negative'),
  description: z.string().optional(),
  amenities: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface Property extends PropertyFormData {
  id: string
  status: 'active' | 'inactive' | 'maintenance'
  occupancyRate: number
  createdAt: Date
}

interface PropertyCRUDProps {
  open: boolean
  mode: 'create' | 'edit' | 'view'
  property?: Property
  onClose: () => void
  onSave: (data: PropertyFormData) => Promise<void>
}

export function PropertyCRUD({ open, mode, property, onClose, onSave }: PropertyCRUDProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property || {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      propertyType: 'residential',
      units: 1,
      yearBuilt: new Date().getFullYear(),
      totalArea: 0,
      monthlyRent: 0,
      description: '',
      amenities: '',
      imageUrl: '',
    },
  })

  const propertyType = watch('propertyType')

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setIsSubmitting(true)
      await onSave(data)
      toast.success(mode === 'create' ? 'Property created successfully!' : 'Property updated successfully!')
      reset()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save property')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsSubmitting(true)
      // Call delete API here
      toast.success('Property deleted successfully!')
      setShowDeleteDialog(false)
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete property')
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
              <Building2 className="h-5 w-5" />
              {mode === 'create' && 'Create New Property'}
              {mode === 'edit' && 'Edit Property'}
              {mode === 'view' && 'Property Details'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' && 'Add a new property to your portfolio'}
              {mode === 'edit' && 'Update property information'}
              {mode === 'view' && 'View property information'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    disabled={isReadOnly}
                    placeholder="e.g., Sunset Apartments"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={propertyType}
                    onValueChange={(value) => setValue('propertyType', value as any)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="mixed">Mixed Use</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyType && (
                    <p className="text-destructive text-sm mt-1">{errors.propertyType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="units">Number of Units *</Label>
                  <Input
                    id="units"
                    type="number"
                    {...register('units', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="1"
                  />
                  {errors.units && (
                    <p className="text-destructive text-sm mt-1">{errors.units.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="yearBuilt">Year Built *</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    {...register('yearBuilt', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder={new Date().getFullYear().toString()}
                  />
                  {errors.yearBuilt && (
                    <p className="text-destructive text-sm mt-1">{errors.yearBuilt.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    disabled={isReadOnly}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="text-destructive text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    disabled={isReadOnly}
                    placeholder="Dubai"
                  />
                  {errors.city && (
                    <p className="text-destructive text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">Emirate/State *</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    disabled={isReadOnly}
                    placeholder="Dubai"
                  />
                  {errors.state && (
                    <p className="text-destructive text-sm mt-1">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode')}
                    disabled={isReadOnly}
                    placeholder="12345"
                  />
                  {errors.zipCode && (
                    <p className="text-destructive text-sm mt-1">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalArea">Total Area (sq ft) *</Label>
                  <Input
                    id="totalArea"
                    type="number"
                    {...register('totalArea', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="2000"
                  />
                  {errors.totalArea && (
                    <p className="text-destructive text-sm mt-1">{errors.totalArea.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="monthlyRent">Monthly Rent ($) *</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    {...register('monthlyRent', { valueAsNumber: true })}
                    disabled={isReadOnly}
                    placeholder="2000"
                  />
                  {errors.monthlyRent && (
                    <p className="text-destructive text-sm mt-1">{errors.monthlyRent.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Additional Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Property Image URL</Label>
                  <Input
                    id="imageUrl"
                    {...register('imageUrl')}
                    disabled={isReadOnly}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.imageUrl && (
                    <p className="text-destructive text-sm mt-1">{errors.imageUrl.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    disabled={isReadOnly}
                    placeholder="Describe the property..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="amenities">Amenities</Label>
                  <Textarea
                    id="amenities"
                    {...register('amenities')}
                    disabled={isReadOnly}
                    placeholder="Pool, Gym, Parking, etc."
                    rows={2}
                  />
                </div>
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
                  Delete Property
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                {mode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Create Property' : 'Save Changes'}
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
              This will permanently delete this property and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export type { Property, PropertyFormData }
