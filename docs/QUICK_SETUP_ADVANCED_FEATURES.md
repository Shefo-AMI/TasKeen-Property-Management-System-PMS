# Quick Setup Guide - Advanced Features

## 🚀 5-Minute Setup

### Step 1: Run Database Migrations

```bash
# Using Supabase CLI (Recommended)
supabase db push

# Or manually via SQL
# Connect to your Supabase database and run:
# - src/supabase/migrations/004_financial_management_system.sql
# - src/supabase/migrations/005_intelligent_maintenance_system.sql
# - src/supabase/migrations/006_advanced_lease_management.sql
# - src/supabase/migrations/007_vacancy_listing_management.sql
```

### Step 2: Update Environment Variables

Add to your `.env` file:

```env
# Optional: E-Signature Integration
VITE_DOCUSIGN_API_KEY=your_key_here
VITE_HELLOSIGN_API_KEY=your_key_here

# Optional: Background Checks
VITE_TRANSUNION_API_KEY=your_key_here
VITE_EXPERIAN_API_KEY=your_key_here

# Optional: Listing Syndication
VITE_ZILLOW_API_KEY=your_key_here
VITE_APARTMENTS_API_KEY=your_key_here
```

### Step 3: Add Navigation Links

Update your main dashboard navigation to include:

```tsx
// In your main-dashboard.tsx or navigation component

import { 
  DollarSign, Wrench, FileText, Home 
} from "lucide-react";

const navigationItems = [
  {
    title: "Financial Management",
    icon: DollarSign,
    path: "/financial",
    description: "Manage finances and UAE VAT"
  },
  {
    title: "Maintenance System",
    icon: Wrench,
    path: "/maintenance",
    description: "Work orders and vendors"
  },
  {
    title: "Lease Management",
    icon: FileText,
    path: "/leases",
    description: "Leases and renewals"
  },
  {
    title: "Listings & Vacancies",
    icon: Home,
    path: "/listings",
    description: "Property listings and applications"
  }
];
```

### Step 4: Add Routes to App.tsx

```tsx
import { SmartFinancialManagement } from "./components/smart-financial-management";
import { IntelligentMaintenanceSystem } from "./components/intelligent-maintenance-system";
import { AdvancedLeaseManagement } from "./components/advanced-lease-management";
import { VacancyListingManagement } from "./components/vacancy-listing-management";

// Inside your Routes component:
<Route 
  path="/financial" 
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
      <SmartFinancialManagement companyId={user.companyId} />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/maintenance" 
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
      <IntelligentMaintenanceSystem companyId={user.companyId} />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/leases" 
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
      <AdvancedLeaseManagement companyId={user.companyId} />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/listings" 
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
      <VacancyListingManagement companyId={user.companyId} />
    </ProtectedRoute>
  } 
/>
```

### Step 5: Test the Features

```bash
# Start the development server
npm run dev

# Navigate to:
# http://localhost:5173/financial
# http://localhost:5173/maintenance
# http://localhost:5173/leases
# http://localhost:5173/listings
```

---

## 📊 Feature Overview

### 1. Smart Financial Management 💰
- **Access:** `/financial`
- **Key Features:**
  - Rent collection tracking
  - Expense management
  - UAE VAT (5%) compliance
  - Profit & Loss statements
  - Cash flow projections
  - Bank reconciliation

### 2. Intelligent Maintenance System 🔧
- **Access:** `/maintenance`
- **Key Features:**
  - Work order management
  - Vendor database with ratings
  - Equipment tracking
  - Preventive maintenance
  - QR code issue reporting
  - Cost estimation

### 3. Advanced Lease Management 📄
- **Access:** `/leases`
- **Key Features:**
  - E-signature integration
  - Automated renewals (30-day reminders)
  - Lease templates
  - Violation tracking
  - Move-in/out inspections
  - Security deposit itemization

### 4. Vacancy & Listing Management 📢
- **Access:** `/listings`
- **Key Features:**
  - Multi-platform syndication
  - Applicant tracking
  - Credit/background checks
  - Lead scoring
  - Showing scheduling
  - Marketing analytics

---

## 🎯 Quick Actions

### Create Your First Financial Account
1. Go to `/financial`
2. Click "Accounts" tab
3. Click "Add Account"
4. Enter bank details
5. Save

### Create Your First Work Order
1. Go to `/maintenance`
2. Click "New Work Order"
3. Fill in details
4. System auto-assigns vendor
5. Track progress

### Create Your First Lease
1. Go to `/leases`
2. Click "New Lease"
3. Select template
4. Fill tenant info
5. Send for e-signature

### Create Your First Listing
1. Go to `/listings`
2. Click "New Listing"
3. Add property details
4. Upload photos
5. Click "Syndicate" to publish

---

## 🔧 Troubleshooting

### Issue: "Company ID not found"
**Solution:** Ensure user object has `companyId` property set after login.

```tsx
// In your auth logic:
const user = {
  id: session.user.id,
  email: session.user.email,
  companyId: profile.company_id, // Make sure this is set
  // ... other fields
};
```

### Issue: "RLS policy violation"
**Solution:** Set the company context before queries:

```tsx
await supabase.rpc('set_config', {
  setting: 'app.current_company_id',
  value: companyId
});
```

### Issue: Tables not found
**Solution:** Run migrations in correct order (004 → 005 → 006 → 007)

---

## 📱 Mobile Testing

Test on mobile devices:
```bash
# Get your local IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Access from mobile:
http://YOUR_IP:5173
```

---

## 🎨 Customization

### Change Color Scheme
Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#8B5CF6', // Purple
        // Change to your brand color
      }
    }
  }
}
```

### Add Custom Fields
Modify migration files before running:

```sql
-- Add custom field to properties
ALTER TABLE properties 
ADD COLUMN custom_field TEXT;
```

---

## 📚 Next Steps

1. ✅ **Customize Templates** - Add your lease templates
2. ✅ **Import Vendors** - Add your contractor database
3. ✅ **Set Up Accounts** - Connect bank accounts
4. ✅ **Configure Syndication** - Add API keys for listing platforms
5. ✅ **Train Team** - Share documentation with staff

---

## 💡 Pro Tips

1. **Use Preventive Maintenance** - Set up recurring schedules to avoid emergency repairs
2. **Enable Auto-Renewals** - Let the system handle lease renewals automatically
3. **Syndicate Listings** - Reach more tenants by publishing to multiple platforms
4. **Track Everything** - Use the financial module to track all income and expenses for tax time
5. **QR Codes** - Generate QR codes for common areas to enable quick issue reporting

---

## 📞 Need Help?

- 📖 Full Documentation: `ADVANCED_FEATURES_IMPLEMENTATION.md`
- 🐛 Report Issues: GitHub Issues
- 💬 Community: Discord Server
- 📧 Email: support@taskeen-pms.com

---

**Ready to go!** 🚀

Your advanced features are now set up and ready to use. Start by creating your first financial account or work order to see the system in action.
