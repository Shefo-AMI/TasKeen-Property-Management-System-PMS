# PropertyFlow CRUD System - Quick Reference

## 🚀 Quick Start

### 1. Setup Supabase (One-time)

```bash
# In Supabase Dashboard → SQL Editor
# Copy and run: /supabase/migrations/001_create_crud_tables.sql
```

### 2. Access Data Management

1. Login to PropertyFlow
2. Sidebar → **Data Management** (Database icon)
3. Choose tab: Properties | Tenants | Leases | Maintenance

## 📋 Common Operations

### Create Property

```typescript
import { propertyService } from './utils/supabase/services'

await propertyService.create({
  company_id: user.companyId,
  name: 'Sunset Towers',
  address: '123 Sheikh Zayed Road',
  city: 'Dubai',
  state: 'Dubai',
  zip_code: '00000',
  property_type: 'residential',
  units: 24,
  year_built: 2020,
  total_area: 25000,
  monthly_rent: 48000,
  status: 'active',
  occupancy_rate: 85,
})
```

### Get All Properties

```typescript
const properties = await propertyService.getAll(user.companyId)
```

### Search Properties

```typescript
const results = await propertyService.getAll(user.companyId, 'Dubai')
```

### Filter Properties

```typescript
const filtered = await propertyService.filter(user.companyId, {
  propertyType: 'residential',
  status: 'active',
  minRent: 5000,
  maxRent: 20000,
})
```

### Update Property

```typescript
await propertyService.update(propertyId, {
  monthly_rent: 50000,
  status: 'active',
})
```

### Delete Property

```typescript
await propertyService.delete(propertyId)
```

## 👥 Create Tenant

```typescript
await tenantService.create({
  company_id: user.companyId,
  first_name: 'Ahmed',
  last_name: 'Al-Mansouri',
  email: 'ahmed@example.com',
  phone: '+971 50 123 4567',
  date_of_birth: '1990-01-15',
  national_id: '784-1990-1234567-1',
  occupation: 'Engineer',
  emergency_contact: 'Fatima Al-Mansouri',
  emergency_phone: '+971 50 765 4321',
  move_in_date: '2024-01-01',
  monthly_rent: 4500,
  security_deposit: 9000,
  property_id: propertyId,
  unit_number: '301',
  status: 'active',
  payment_status: 'current',
})
```

## 📄 Create Lease

```typescript
await leaseService.create({
  company_id: user.companyId,
  property_id: propertyId,
  unit_number: '301',
  tenant_id: tenantId,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  monthly_rent: 4500,
  security_deposit: 9000,
  payment_due_day: 1,
  lease_type: 'yearly',
  renewal_option: 'manual',
  status: 'active',
})
```

## 🔧 Create Maintenance Ticket

```typescript
await maintenanceService.create({
  company_id: user.companyId,
  title: 'AC not working',
  description: 'Unit 301 AC stopped cooling',
  priority: 'high',
  category: 'hvac',
  property_id: propertyId,
  unit_number: '301',
  tenant_id: tenantId,
  estimated_cost: 500,
  status: 'open',
  created_by: user.id,
})
```

## 📎 Upload Document

```typescript
// Upload file
const url = await documentService.uploadFile(
  file,
  `${companyId}/property/${propertyId}/${file.name}`
)

// Create document record
await documentService.create({
  company_id: companyId,
  name: file.name,
  type: file.type,
  size: file.size,
  url: url,
  category: 'lease',
  linked_to: 'property',
  linked_id: propertyId,
  linked_name: 'Sunset Towers',
  uploaded_by: user.fullName,
})
```

## 🔍 Search & Filter Patterns

### Property Filters

```typescript
propertyService.filter(companyId, {
  propertyType: 'residential' | 'commercial' | 'mixed' | 'industrial',
  status: 'active' | 'inactive' | 'maintenance',
  minRent: 5000,
  maxRent: 20000,
})
```

### Tenant Filters

```typescript
tenantService.filter(companyId, {
  propertyId: 'property-uuid',
  status: 'active' | 'pending' | 'inactive' | 'evicted',
  paymentStatus: 'current' | 'late' | 'delinquent',
})
```

### Maintenance Filters

```typescript
maintenanceService.filter(companyId, {
  propertyId: 'property-uuid',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'open' | 'in_progress' | 'completed' | 'cancelled',
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other',
})
```

## 🔐 Permission Checks

```typescript
import { getPermissions, hasPermission } from './utils/permissions'

// Get all permissions for a role
const permissions = getPermissions(user.role)

// Check specific permission
if (hasPermission(user.role, 'create')) {
  // Show "Add" button
}

if (hasPermission(user.role, 'update')) {
  // Show "Edit" button
}

if (hasPermission(user.role, 'delete')) {
  // Show "Delete" button
}
```

### Permission Matrix

| Role            | Create | Read | Update | Delete | View All | Manage Users |
|-----------------|--------|------|--------|--------|----------|--------------|
| Platform Admin  | ✅     | ✅   | ✅     | ✅     | ✅       | ✅           |
| Company Admin   | ✅     | ✅   | ✅     | ✅     | ✅       | ✅           |
| Employee        | ✅     | ✅   | ❌     | ❌     | ❌       | ❌           |

## 📊 Database Schema Quick Reference

### Properties Table

```typescript
{
  id: uuid,
  company_id: string,
  name: string,
  address: string,
  city: string,
  state: string,
  zip_code: string,
  property_type: 'residential' | 'commercial' | 'mixed' | 'industrial',
  units: number,
  year_built: number,
  total_area: number,
  monthly_rent: number,
  status: 'active' | 'inactive' | 'maintenance',
  occupancy_rate: number,
  description?: string,
  amenities?: string,
  image_url?: string,
  created_at: timestamp,
  updated_at: timestamp,
}
```

### Tenants Table

```typescript
{
  id: uuid,
  company_id: string,
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  alternate_phone?: string,
  date_of_birth: date,
  national_id: string,
  occupation: string,
  employer_name?: string,
  emergency_contact: string,
  emergency_phone: string,
  move_in_date: date,
  lease_end_date?: date,
  monthly_rent: number,
  security_deposit: number,
  property_id: uuid,
  unit_number: string,
  status: 'active' | 'pending' | 'inactive' | 'evicted',
  payment_status: 'current' | 'late' | 'delinquent',
  notes?: string,
  created_at: timestamp,
  updated_at: timestamp,
}
```

## 🛠️ Troubleshooting

### Issue: "Failed to load data"

```typescript
// Check company ID
console.log('Company ID:', user.companyId)

// Test connection
const { data, error } = await supabase.from('properties').select('count')
console.log('Connection test:', { data, error })
```

### Issue: "Permission denied"

```typescript
// Check user role
console.log('User role:', user.role)

// Check permissions
const permissions = getPermissions(user.role)
console.log('Permissions:', permissions)
```

### Issue: "File upload failed"

```typescript
// Check storage bucket
const { data: buckets } = await supabase.storage.listBuckets()
console.log('Buckets:', buckets)

// Verify file size
console.log('File size (MB):', file.size / (1024 * 1024))
```

## 🎨 UI Components

### Property Card

```typescript
<Card>
  <CardHeader>
    <CardTitle>{property.name}</CardTitle>
    <CardDescription>{property.address}</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex justify-between">
      <span>Units:</span>
      <span>{property.units}</span>
    </div>
    <Button onClick={() => handleEdit(property)}>
      <Pencil className="h-4 w-4" />
    </Button>
  </CardContent>
</Card>
```

### Search Bar

```typescript
<Input
  placeholder="Search..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

### Filter Sheet

```typescript
<Sheet open={showFilters} onOpenChange={setShowFilters}>
  <SheetTrigger asChild>
    <Button variant="outline">
      <Filter className="mr-2 h-4 w-4" />
      Filters
    </Button>
  </SheetTrigger>
  <SheetContent>
    {/* Filter controls */}
  </SheetContent>
</Sheet>
```

## 📝 Validation Rules

### Property

- Name: min 3 characters
- Address: min 5 characters
- ZIP Code: format `12345` or `12345-6789`
- Year Built: 1800 to current year
- Monthly Rent: ≥ 0

### Tenant

- Names: min 2 characters each
- Email: valid email format
- Phone: valid phone number
- Date of Birth: valid date (YYYY-MM-DD)
- Monthly Rent: > 0

### Lease

- Dates: valid date format (YYYY-MM-DD)
- Monthly Rent: > 0
- Payment Due Day: 1-31
- Security Deposit: ≥ 0

## 🚨 Error Handling

```typescript
try {
  await propertyService.create(data)
  toast.success('Property created!')
} catch (error: any) {
  console.error('Error:', error)
  toast.error(error.message || 'Failed to create property')
}
```

## 💡 Best Practices

1. **Always check permissions** before showing UI elements
2. **Use try-catch** for all async operations
3. **Validate data** before sending to Supabase
4. **Show loading states** during operations
5. **Provide user feedback** with toasts
6. **Handle errors gracefully** with fallback UI
7. **Test with different roles** to verify permissions
8. **Search with debounce** to reduce API calls

## 📚 Related Documentation

- [Complete CRUD Documentation](./CRUD_SYSTEM_DOCUMENTATION.md)
- [Supabase Setup Guide](./SUPABASE_CRUD_SETUP.md)
- [Project Summary](./PROJECT_COMPLETE_SUMMARY.md)

## 🎯 Key Takeaways

✅ All CRUD operations go through service functions
✅ Permissions are checked at UI and database level
✅ Search is debounced (500ms) for better performance
✅ Filters apply multiple criteria simultaneously
✅ Documents are stored in Supabase Storage
✅ All operations show loading states and user feedback
✅ Company data is automatically isolated via RLS

Need help? Check the full documentation or open an issue!
