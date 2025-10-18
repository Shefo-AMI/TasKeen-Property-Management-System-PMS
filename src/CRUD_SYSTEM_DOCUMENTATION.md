# PropertyFlow CRUD System Documentation

## Overview

PropertyFlow now includes a comprehensive CRUD (Create, Read, Update, Delete) system with form validation and document management capabilities. This system allows you to manage all major data types in your property management platform.

## Features

### ✅ Complete CRUD Operations
- **Create**: Add new properties, tenants, leases, and maintenance tickets
- **Read**: View detailed information about all records
- **Update**: Edit existing records with validation
- **Delete**: Remove records with confirmation dialogs

### ✅ Form Validation
- **Schema-based validation** using Zod
- **Real-time validation** with react-hook-form
- **Field-level error messages**
- **Required field indicators**
- **Type-safe form inputs**

### ✅ Document Management
- **File upload** with preview support
- **Multiple file types** (images, PDFs, Excel, Word, etc.)
- **Link documents** to properties, tenants, leases, or maintenance tickets
- **Document categorization** (lease, inspection, maintenance, invoice, photo, other)
- **View, download, and delete** documents
- **Drag-and-drop** file selection

## Components

### 1. Property CRUD (`/components/crud/property-crud.tsx`)

Manages property records with comprehensive validation:

**Fields:**
- Basic Information: name, property type, units, year built
- Location: address, city, state, ZIP code
- Financial: total area, monthly rent
- Additional: description, amenities, image URL

**Validation Rules:**
- Property name: minimum 3 characters
- Address: minimum 5 characters
- ZIP code: must match pattern (e.g., 12345 or 12345-6789)
- Year built: between 1800 and current year
- Monthly rent: cannot be negative

**Usage:**
```tsx
import { PropertyCRUD } from './components/crud/property-crud'

<PropertyCRUD
  open={isOpen}
  mode="create" // or "edit" or "view"
  property={selectedProperty} // optional, for edit/view
  onClose={() => setIsOpen(false)}
  onSave={async (data) => {
    // Save property data to your backend
    console.log('Saving property:', data)
  }}
/>
```

### 2. Tenant CRUD (`/components/crud/tenant-crud.tsx`)

Manages tenant information with detailed validation:

**Fields:**
- Personal Information: first name, last name, date of birth, national ID
- Contact Information: email, phone, alternate phone
- Employment: occupation, employer name
- Emergency Contact: name and phone
- Lease Information: property, unit number, move-in date, rent, deposit

**Validation Rules:**
- Names: minimum 2 characters
- Email: valid email format
- Phone: must match phone number pattern
- Date of birth: valid date format (YYYY-MM-DD)
- National ID: minimum 5 characters
- Monthly rent: must be greater than 0

**Usage:**
```tsx
import { TenantCRUD } from './components/crud/tenant-crud'

<TenantCRUD
  open={isOpen}
  mode="edit"
  tenant={selectedTenant}
  properties={propertyList}
  onClose={() => setIsOpen(false)}
  onSave={async (data) => {
    // Update tenant data
  }}
/>
```

### 3. Lease CRUD (`/components/crud/lease-crud.tsx`)

Manages lease agreements with comprehensive terms:

**Fields:**
- Property & Tenant: property selection, unit number, tenant
- Lease Term: start date, end date, lease type, renewal option
- Financial: monthly rent, security deposit, payment due day, late fees
- Property Rules: pets allowed, smoking allowed, parking spaces, utilities
- Special Terms: custom terms and internal notes

**Validation Rules:**
- All dates: valid format (YYYY-MM-DD)
- Monthly rent: must be greater than 0
- Payment due day: between 1 and 31
- Security deposit: cannot be negative

**Usage:**
```tsx
import { LeaseCRUD } from './components/crud/lease-crud'

<LeaseCRUD
  open={isOpen}
  mode="create"
  properties={propertyList}
  tenants={tenantList}
  onClose={() => setIsOpen(false)}
  onSave={async (data) => {
    // Create lease agreement
  }}
/>
```

### 4. Maintenance CRUD (`/components/crud/maintenance-crud.tsx`)

Manages maintenance tickets with priority and tracking:

**Fields:**
- Basic Information: title, description, priority, category
- Location: property, unit number, tenant
- Assignment: assigned vendor/staff, scheduled date
- Cost: estimated cost, actual cost (on completion)

**Special Features:**
- **Complete ticket** with actual cost
- **Auto-generate invoice** when completed
- **Before/after photos** support
- **Priority levels**: low, medium, high, urgent
- **Categories**: plumbing, electrical, HVAC, appliance, structural, pest, other

**Usage:**
```tsx
import { MaintenanceCRUD } from './components/crud/maintenance-crud'

<MaintenanceCRUD
  open={isOpen}
  mode="view"
  maintenance={selectedTicket}
  properties={propertyList}
  tenants={tenantList}
  vendors={vendorList}
  onClose={() => setIsOpen(false)}
  onSave={async (data) => {
    // Save maintenance ticket
  }}
  onComplete={async (id, actualCost, afterPhotos) => {
    // Complete ticket and generate invoice
  }}
/>
```

### 5. Document Manager (`/components/crud/document-manager.tsx`)

Manages document uploads and organization:

**Features:**
- Upload files with drag-and-drop
- Image preview
- Category tagging (lease, inspection, maintenance, invoice, photo, other)
- Link to properties, tenants, leases, or maintenance tickets
- View, download, and delete documents
- File size display
- Upload date tracking

**Supported File Types:**
- Images (JPEG, PNG, GIF, WebP)
- PDFs
- Word documents (.doc, .docx)
- Excel spreadsheets (.xls, .xlsx)
- Text files

**Usage:**
```tsx
import { DocumentManager } from './components/crud/document-manager'

<DocumentManager
  open={isOpen}
  linkedTo="property" // or "tenant", "lease", "maintenance"
  linkedId="property-123"
  linkedName="Sunset Towers"
  properties={propertyList}
  tenants={tenantList}
  existingDocuments={documents}
  onClose={() => setIsOpen(false)}
  onUpload={async (data) => {
    // Handle file upload
    const formData = new FormData()
    if (data.file) {
      formData.append('file', data.file)
    }
    formData.append('name', data.name)
    formData.append('category', data.category)
    // Upload to server
  }}
  onDelete={async (documentId) => {
    // Delete document
  }}
/>
```

## Data Management Page

The main CRUD management page (`/components/crud-management-page.tsx`) provides a unified interface for all CRUD operations:

**Access:** Navigate to "Data Management" in the sidebar (Database icon)

**Tabs:**
- **Properties**: View and manage all properties
- **Tenants**: View and manage all tenants
- **Leases**: View and manage lease agreements
- **Maintenance**: View and manage maintenance tickets

**Features:**
- Grid/card view of all records
- Quick actions (View, Edit, Delete)
- Create new records with dedicated buttons
- Status badges and visual indicators
- Real-time updates after CRUD operations
- Document manager accessible from header

## Form Validation

All forms use **Zod schemas** for validation and **react-hook-form** for state management:

### Example Validation Schema

```typescript
import * as z from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number'),
  monthlyRent: z.number().min(1, 'Must be greater than 0'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
})
```

### Validation Features

1. **Real-time validation**: Errors appear as you type
2. **Field-level errors**: Each field shows specific error messages
3. **Submit prevention**: Form won't submit with validation errors
4. **Type safety**: TypeScript ensures correct data types

## Integration with Backend

### Saving Data

Each CRUD component accepts an `onSave` callback:

```typescript
const handleSave = async (data: PropertyFormData) => {
  try {
    // Example: Save to Supabase
    const { data: property, error } = await supabase
      .from('properties')
      .insert([data])
    
    if (error) throw error
    
    toast.success('Property created successfully!')
  } catch (error) {
    toast.error('Failed to save property')
    throw error
  }
}
```

### Deleting Data

Delete operations include confirmation dialogs:

```typescript
const handleDelete = async (id: string) => {
  // Confirmation dialog automatically shown by CRUD component
  
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
```

### Uploading Documents

```typescript
const handleDocumentUpload = async (data: DocumentUploadData) => {
  const formData = new FormData()
  
  if (data.file) {
    // Upload file to storage (e.g., Supabase Storage)
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`${data.linkedTo}/${data.linkedId}/${data.file.name}`, data.file)
    
    if (uploadError) throw uploadError
    
    // Save document metadata to database
    const { error: dbError } = await supabase
      .from('documents')
      .insert([{
        name: data.name,
        category: data.category,
        linkedTo: data.linkedTo,
        linkedId: data.linkedId,
        url: fileData.path,
        description: data.description,
      }])
    
    if (dbError) throw dbError
  }
}
```

## Best Practices

### 1. Error Handling

Always wrap CRUD operations in try-catch blocks:

```typescript
const handleSave = async (data: any) => {
  try {
    setIsSubmitting(true)
    await saveToDB(data)
    toast.success('Saved successfully!')
    onClose()
  } catch (error: any) {
    toast.error(error.message || 'Save failed')
  } finally {
    setIsSubmitting(false)
  }
}
```

### 2. Loading States

Show loading indicators during operations:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

// In your button:
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Save
</Button>
```

### 3. Data Validation

Always validate on both client and server:

```typescript
// Client-side (Zod)
const schema = z.object({
  email: z.string().email(),
})

// Server-side (your API)
if (!isValidEmail(data.email)) {
  throw new Error('Invalid email')
}
```

### 4. User Feedback

Provide clear feedback for all actions:

```typescript
// Success
toast.success('Property created successfully!')

// Error
toast.error('Failed to save property')

// Loading
setIsSubmitting(true)
```

## Customization

### Adding New Fields

1. Update the Zod schema:
```typescript
const propertySchema = z.object({
  // ... existing fields
  customField: z.string().min(3, 'Custom field required'),
})
```

2. Add the form field:
```tsx
<div>
  <Label htmlFor="customField">Custom Field</Label>
  <Input
    id="customField"
    {...register('customField')}
    disabled={isReadOnly}
  />
  {errors.customField && (
    <p className="text-destructive text-sm mt-1">
      {errors.customField.message}
    </p>
  )}
</div>
```

### Custom Validation Rules

```typescript
const schema = z.object({
  email: z.string()
    .email('Invalid email')
    .refine(
      (email) => email.endsWith('@company.com'),
      'Must be a company email'
    ),
})
```

## Troubleshooting

### Form Not Submitting

1. Check console for validation errors
2. Ensure all required fields are filled
3. Verify Zod schema matches form fields

### Documents Not Uploading

1. Check file size limits
2. Verify file type is supported
3. Check storage permissions
4. Ensure proper error handling

### Validation Errors Not Showing

1. Ensure `{errors.fieldName && ...}` is present
2. Check that field is registered with `{...register('fieldName')}`
3. Verify Zod schema has proper error messages

## Next Steps

1. **Connect to your backend**: Replace mock data with real API calls
2. **Add file storage**: Integrate with cloud storage (Supabase Storage, AWS S3, etc.)
3. **Implement search/filter**: Add search and filter functionality
4. **Add bulk operations**: Enable bulk delete, export, etc.
5. **Customize fields**: Add company-specific fields to forms
6. **Add permissions**: Implement role-based access control

## TypeScript Types

All CRUD components export their types for type safety:

```typescript
import type { 
  Property, 
  PropertyFormData,
  Tenant,
  TenantFormData,
  Lease,
  LeaseFormData,
  Maintenance,
  MaintenanceFormData,
  Document,
  DocumentUploadData
} from './components/crud'
```

## Summary

The PropertyFlow CRUD system provides:

- ✅ Full CRUD operations for all major data types
- ✅ Comprehensive form validation with Zod
- ✅ Document management with file upload
- ✅ Type-safe TypeScript interfaces
- ✅ Beautiful UI with shadcn components
- ✅ Real-time validation feedback
- ✅ Confirmation dialogs for destructive actions
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ Easy integration with any backend

Your PropertyFlow application is now fully equipped with production-ready data management capabilities!
