# Supabase CRUD Integration Setup Guide

## Overview

This guide will walk you through setting up the Supabase backend for PropertyFlow's CRUD system with:
- ✅ Database tables for properties, tenants, leases, maintenance, and documents
- ✅ Row Level Security (RLS) policies
- ✅ File storage for documents
- ✅ Search and filter functionality
- ✅ Role-based permissions (Platform Admin, Company Admin, Employee)

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Supabase project created
- Supabase URL and anon key configured in your app

## Step 1: Run Database Migration

### Option A: Using Supabase Dashboard (Recommended for Quick Setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/supabase/migrations/001_create_crud_tables.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Initialize Supabase in your project (if not done)
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

## Step 2: Verify Tables Creation

After running the migration, verify that the following tables were created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see:
   - `properties`
   - `tenants`
   - `leases`
   - `maintenance_tickets`
   - `documents`

## Step 3: Set Up Storage Bucket

The migration automatically creates a `documents` storage bucket. Verify:

1. Go to **Storage** in Supabase Dashboard
2. You should see a bucket named `documents`
3. The bucket is set to public access for easy retrieval

### Storage Structure

Files will be organized as:
```
documents/
├── {company_id}/
│   ├── property/
│   │   └── {property_id}/
│   │       └── {filename}
│   ├── tenant/
│   │   └── {tenant_id}/
│   │       └── {filename}
│   ├── lease/
│   │   └── {lease_id}/
│   │       └── {filename}
│   └── maintenance/
│       └── {ticket_id}/
│           └── {filename}
```

## Step 4: Configure Row Level Security (RLS)

The migration includes RLS policies that:

### How RLS Works in PropertyFlow

- **Company Isolation**: Users can only access data from their own company
- **User Context**: Set `app.current_company_id` to filter data
- **Automatic Filtering**: All queries are automatically filtered by company

### Setting Company Context

When making Supabase queries, the app automatically filters by `company_id` in the service functions. No additional configuration needed!

## Step 5: Test the Integration

### 1. Create a Test Property

```typescript
import { propertyService } from './utils/supabase/services'

const newProperty = await propertyService.create({
  company_id: 'your-company-id',
  name: 'Test Property',
  address: '123 Test St',
  city: 'Dubai',
  state: 'Dubai',
  zip_code: '00000',
  property_type: 'residential',
  units: 10,
  year_built: 2020,
  total_area: 5000,
  monthly_rent: 10000,
  status: 'active',
  occupancy_rate: 0,
})

console.log('Property created:', newProperty)
```

### 2. Retrieve All Properties

```typescript
const properties = await propertyService.getAll('your-company-id')
console.log('Properties:', properties)
```

### 3. Search Properties

```typescript
const searchResults = await propertyService.getAll('your-company-id', 'Dubai')
console.log('Search results:', searchResults)
```

### 4. Filter Properties

```typescript
const filtered = await propertyService.filter('your-company-id', {
  propertyType: 'residential',
  status: 'active',
  minRent: 5000,
  maxRent: 20000,
})
console.log('Filtered properties:', filtered)
```

## Step 6: Understanding Permissions

### Permission Levels

#### Platform Admin
- Full access to all companies and data
- Can create, read, update, delete everything
- Can manage users across all companies

#### Company Admin
- Full access to their company's data
- Can create, read, update, delete company records
- Can manage users within their company

#### Employee
- Can view and create records
- **Cannot** edit or delete records
- Limited to assigned data (when implemented)

### Permission Checks in Code

```typescript
import { getPermissions, hasPermission } from './utils/permissions'

const user = { role: 'company_admin' }
const permissions = getPermissions(user.role)

if (permissions.canCreate) {
  // Show "Add Property" button
}

if (permissions.canUpdate) {
  // Show "Edit" button
}

if (permissions.canDelete) {
  // Show "Delete" button
}
```

### UI Permission Handling

The CRUD Management page automatically handles permissions:
- Hides "Add" buttons for users without create permission
- Hides "Edit" buttons for users without update permission
- Hides "Delete" buttons for users without delete permission
- Shows permission messages when actions are restricted

## Step 7: Using the CRUD System

### Access Data Management

1. Log in to PropertyFlow
2. Click **"Data Management"** in the sidebar (Database icon)
3. Choose a tab: Properties, Tenants, Leases, or Maintenance

### Create New Records

1. Click **"Add Property"** (or Add Tenant, Create Lease, etc.)
2. Fill in the required fields
3. Click **"Create"** or **"Save"**
4. Record is automatically saved to Supabase

### Search Records

1. Type in the search box at the top
2. Results update automatically (with 500ms debounce)
3. Searches across relevant fields (name, address, email, etc.)

### Filter Records

1. Click **"Filters"** button
2. Set filter criteria (type, status, price range, etc.)
3. Click **"Apply Filters"**
4. Click **X** to clear all filters

### Edit Records

1. Click the **Edit** icon (pencil) on any card
2. Modify the fields
3. Click **"Save Changes"**
4. Record is updated in Supabase

### Delete Records

1. Click **Edit** on a record
2. Click **"Delete"** button
3. Confirm deletion in the dialog
4. Record is permanently deleted

### Upload Documents

1. Click **"Documents"** button in header
2. Click **"Choose File"** or drag and drop
3. Set document category and link to property/tenant
4. Add description (optional)
5. Click **"Upload Document"**
6. File is saved to Supabase Storage

## Step 8: Advanced Features

### Search Implementation

```typescript
// Search across multiple fields
const results = await propertyService.getAll(companyId, 'Dubai')
// Searches: name, address, city

const tenantResults = await tenantService.getAll(companyId, 'john')
// Searches: first_name, last_name, email
```

### Complex Filters

```typescript
// Multiple filter criteria
const properties = await propertyService.filter(companyId, {
  propertyType: 'residential',
  status: 'active',
  minRent: 5000,
  maxRent: 20000,
})

// Maintenance ticket filters
const tickets = await maintenanceService.filter(companyId, {
  priority: 'urgent',
  status: 'open',
  category: 'plumbing',
})
```

### Document Management

```typescript
// Upload document
const file = event.target.files[0]
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
  linked_name: 'Property Name',
  uploaded_by: user.fullName,
})
```

### Maintenance Completion with Invoice

```typescript
// Complete maintenance and generate invoice
await maintenanceService.complete(
  ticketId,
  actualCost,
  afterPhotos
)
// Automatically updates status to 'completed'
// Adds actual_cost and after_photos
// Triggers invoice generation (integrate with accounting system)
```

## Step 9: Troubleshooting

### Common Issues

#### 1. "Failed to load data"

**Cause**: Missing or invalid company_id

**Solution**:
```typescript
// Ensure user.companyId is set correctly
console.log('Company ID:', user.companyId)
```

#### 2. "Permission denied"

**Cause**: RLS policies blocking access

**Solution**:
- Check that `company_id` matches user's company
- Verify RLS policies are properly configured
- Check if user has correct role

#### 3. "File upload failed"

**Cause**: Storage bucket not created or wrong permissions

**Solution**:
- Verify `documents` bucket exists in Storage
- Check storage policies allow authenticated uploads
- Ensure file size is within limits

#### 4. "Search not working"

**Cause**: Database indexes not created

**Solution**:
- Re-run the migration to create indexes
- Check that search term is properly URL-encoded

### Debug Mode

Enable detailed logging:

```typescript
// In service functions
console.log('Query:', { companyId, searchTerm, filters })

// Check Supabase response
const { data, error } = await supabase.from('properties').select('*')
console.log('Supabase Response:', { data, error })
```

## Step 10: Production Checklist

Before deploying to production:

- [ ] All database tables created
- [ ] Storage bucket configured
- [ ] RLS policies enabled and tested
- [ ] Indexes created for performance
- [ ] Error handling implemented
- [ ] Permission checks working
- [ ] Search and filter tested
- [ ] File upload tested
- [ ] Company isolation verified
- [ ] Backup strategy in place

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         PropertyFlow Frontend           │
│  (React + TypeScript + Tailwind)        │
└────────────────┬────────────────────────┘
                 │
                 ├─ Permissions Check (utils/permissions.ts)
                 │  └─ Role-based access control
                 │
                 ├─ CRUD Services (utils/supabase/services.ts)
                 │  ├─ propertyService
                 │  ├─ tenantService
                 │  ├─ leaseService
                 │  ├─ maintenanceService
                 │  └─ documentService
                 │
                 ▼
┌─────────────────────────────────────────┐
│           Supabase Backend              │
├─────────────────────────────────────────┤
│  Database Tables                        │
│  ├─ properties                          │
│  ├─ tenants                             │
│  ├─ leases                              │
│  ├─ maintenance_tickets                 │
│  └─ documents                           │
├─────────────────────────────────────────┤
│  Row Level Security (RLS)               │
│  └─ Company-based data isolation        │
├─────────────────────────────────────────┤
│  Storage                                │
│  └─ documents bucket (files)            │
└─────────────────────────────────────────┘
```

## Next Steps

1. **Customize Fields**: Add company-specific fields to tables
2. **Add Validations**: Implement server-side validation rules
3. **Set Up Backups**: Configure automatic database backups
4. **Monitor Performance**: Use Supabase dashboard to track query performance
5. **Add Audit Logs**: Track who created/updated records
6. **Implement Soft Deletes**: Archive records instead of deleting
7. **Add Webhooks**: Trigger actions on record changes
8. **Optimize Indexes**: Add indexes for frequently queried fields

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- PropertyFlow documentation: See `/CRUD_SYSTEM_DOCUMENTATION.md`
- Debug with browser console and Supabase logs

## Summary

✅ **Complete Backend Setup** - All tables, RLS, and storage configured
✅ **Permission System** - Role-based access control implemented  
✅ **Search & Filter** - Full-text search and advanced filtering
✅ **Document Management** - File upload with categorization
✅ **Production Ready** - Secure, scalable, and performant

Your PropertyFlow CRUD system is now fully integrated with Supabase! 🎉
