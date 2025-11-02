# 🏢 ALZAHI Property Management - Setup Guide

## Company Information

**Company Name:** ALZAHI PROPERTY MANAGEMENT & GENERAL MAINTENANCE  
**Address:** ALFAKHR STREET, ALZAHIYAH, ABU DHABI, UNITED ARAB EMIRATES  
**Logo:** Integrated ✅

## 👥 User Accounts

### Managers (Full Admin Access)

1. **Nour Al-Zahi** (Manager)
   - Email: `nour@al-zahi.ae`
   - Password: `al-zahi2012`
   - Role: Company Admin
   - Access: **Full system access** (same as platform admin)

2. **Mawia Al-Zahi** (Manager)
   - Email: `mawia@al-zahi.ae`
   - Password: `al-zahi2012`
   - Role: Company Admin
   - Access: **Full system access** (same as platform admin)

### Maintenance Team (Limited Access)

3. **Tareq Al-Zahi** (Maintenance)
   - Email: `tareq@al-zahi.ae`
   - Password: `al-zahi2012`
   - Role: Maintenance Staff
   - Access: **Maintenance section only**

4. **Ayham Al-Zahi** (Maintenance)
   - Email: `ayham@al-zahi.ae`
   - Password: `al-zahi2012`
   - Role: Maintenance Staff
   - Access: **Maintenance section only**

## 🏢 Properties

### 1. ALMEKNAS BUILDING 146
- **Type:** Mixed (Residential & Commercial)
- **Owner:** (TO BE UPDATED)
- **Total Units:** 105
  - Apartments: 97
  - Shops: 8
- **Location:** ALMEKNAS STREET, ALZAHIYAH, ABU DHABI

### 2. AL SHARJAH 346
- **Type:** Mixed (Residential & Commercial)
- **Owner:** MR. SAIF RASHED AL NUIMI
- **Total Units:** 51
  - Apartments: 48
  - Shops: 3
- **Location:** AL SHARJAH STREET, ALZAHIYAH, ABU DHABI

### 3. AL BAHIYAH BUILDING
- **Type:** Residential
- **Owner:** MR. SAIF RASHED AL NUIMI
- **Total Units:** 5
  - Apartments: 5
  - Shops: 0
- **Location:** AL BAHIYAH STREET, ALZAHIYAH, ABU DHABI

## 🚀 Quick Setup Steps

### Method 1: Automatic Setup (Recommended)

1. **Run the setup wizard:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `/admin-setup` (or use the setup wizard route)

3. **Follow the wizard steps** to:
   - View company information
   - Create all 4 user accounts automatically
   - Setup all 3 properties

4. **Login** with any of the accounts above

### Method 2: Manual Supabase Setup

1. **Go to Supabase SQL Editor**

2. **Run the migration:**
   ```sql
   -- Copy and paste from: /supabase/migrations/003_alzahi_users_setup.sql
   ```

3. **Create users via Supabase Auth:**
   - Go to Authentication > Users
   - Add each user manually with their email/password
   - Or use the registration API

4. **Update user metadata:**
   ```sql
   -- See comments in 003_alzahi_users_setup.sql for UPDATE commands
   ```

## 🔐 Role-Based Access Control

### Company Admin (Nour & Mawia)
✅ Dashboard  
✅ Buildings & Units  
✅ Properties  
✅ Tenants  
✅ Maintenance  
✅ Accounting  
✅ Leases  
✅ Payments  
✅ Reports  
✅ Documents  
✅ Settings  

### Maintenance Staff (Tareq & Ayham)
✅ Dashboard (limited view)  
✅ Maintenance (full access)  
❌ All other sections (restricted)  

## 📝 Next Steps

### For Managers (Nour & Mawia):

1. **Login** with your credentials
2. **Navigate to Buildings** section
3. **Add units** to each property:
   - ALMEKNAS: Add 97 apartment units + 8 shop units
   - AL SHARJAH 346: Add 48 apartment units + 3 shop units
   - AL BAHIYAH: Add 5 apartment units

4. **For each unit, add:**
   - Unit number
   - Tenant details (when occupied)
   - Lease contract (PDF upload)
   - Payment schedule
   - Tenant documents (ID, passport, etc.)

5. **Upload property photos** via Documents section

6. **Create maintenance tasks** as needed

### For Maintenance Team (Tareq & Ayham):

1. **Login** with your credentials
2. **Access Maintenance** section only
3. **View assigned tickets**
4. **Update ticket status**
5. **Upload before/after photos**
6. **Add completion notes**

## 🎨 Features Enabled

✅ **Cyber-Luxe Theme** - Modern neon design  
✅ **Company Logo** - ALZAHI logo in sidebar  
✅ **Role-Based Access** - Different permissions per role  
✅ **Auto Payment Calculation** - Automatic payment schedules  
✅ **Document Auto-Tagging** - Smart document categorization  
✅ **Lease Expiration Alerts** - 30-day notifications  
✅ **Payment Reminders** - 15-day notifications  
✅ **Mobile Responsive** - Works on all devices  

## 📊 Dashboard Stats

Once units are added, the dashboard will show:
- Total Properties: 3
- Total Units: 161
- Occupancy Rate: (auto-calculated)
- Monthly Revenue: (sum of all rents)
- Vacant Units: (auto-tracked)
- Upcoming Payments: (15-day alerts)
- Maintenance Tickets: (all active tickets)

## 🔧 Technical Details

### Files Modified:
- `/utils/alzahi-company-setup.ts` - Company data & permissions
- `/components/role-based-access.tsx` - Access control
- `/components/main-dashboard.tsx` - Role-based sidebar
- `/supabase/migrations/003_alzahi_users_setup.sql` - Database setup
- `/utils/register-alzahi-users.ts` - User registration script

### Database Tables:
- `properties` - Property information
- `buildings` - Buildings management
- `units` - Unit details
- `unit_payments` - Payment tracking
- `tenants` - Tenant information
- `leases` - Lease contracts
- `maintenance_tickets` - Maintenance tracking

## 📞 Support

For technical issues:
1. Check browser console (F12) for errors
2. Verify user role in sidebar (shows company name)
3. Ensure Supabase connection is active
4. Check that migration 003 has been run

## ✅ Setup Checklist

- [ ] Run migration 003 in Supabase
- [ ] Create 4 user accounts
- [ ] Verify all users can login
- [ ] Test manager access (all sections visible)
- [ ] Test maintenance access (only maintenance visible)
- [ ] Add units to properties
- [ ] Upload property photos
- [ ] Test payment schedule calculation
- [ ] Test maintenance ticket creation
- [ ] Verify document auto-tagging

---

**Setup Date:** October 12, 2024  
**Version:** TasKeen P.M.S. v1.0  
**Status:** Ready for Production ✅
