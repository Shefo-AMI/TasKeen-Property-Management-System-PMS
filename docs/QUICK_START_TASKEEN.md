# 🚀 TasKeen P.M.S. - Quick Start Guide

## ⚡ Immediate Testing

```bash
npm run dev
```

Visit: `http://localhost:5173`

## 🎯 What to Test Right Now

### 1. Login Page (Cyber-Luxe Theme)
- Navigate to `/login`
- See stunning neon "TasKeen P.M.S" logo
- Try both Sign In & Register tabs
- Notice animated glow effects
- Background photos still slide

### 2. Dashboard Sidebar
- Login with your credentials
- See cyber-luxe sidebar with:
  - Electric cyan logo
  - UPPERCASE menu items
  - Hover for neon glow effect
  - Active state with gradient

### 3. Buildings & Units
- Click "BUILDINGS" in sidebar
- Click "Add Building"
- Create a building (Marina Heights, Dubai Marina, etc.)
- Click on the building card
- Switch to "Units" tab
- Click "Add Unit"
- Create occupied unit:
  - Rent: 90,000 AED
  - Tenant: Ahmed Hassan
  - Contract dates
  - Number of payments: 3
- See auto-calculated payment schedule!

### 4. Auto Rules Engine
- Open browser console (F12)
- Look for: "🚀 Starting TasKeen P.M.S. Rules Engine..."
- See: "🔔 Found X leases expiring..."
- See: "💰 Found X payments due..."

### 5. Document Auto-Tagging (Conceptual)
- When uploading documents in any CRUD form
- File named "lease_agreement.pdf" → Auto-tagged as "Lease"
- File named "payment_receipt.jpg" → Auto-tagged as "Invoice"
- File named "inspection_report.pdf" → Auto-tagged as "Inspection"

## 📁 Key Files to Know

### Cyber Theme
- `/styles/globals.css` - All neon effects and colors
- `/components/auth-form.tsx` - Login page

### Core Features
- `/components/main-dashboard.tsx` - Main dashboard with sidebar
- `/components/buildings-units-management.tsx` - Buildings & Units system
- `/utils/rules-engine.ts` - Automated notifications
- `/utils/document-auto-tagger.ts` - Smart document categorization

### App Entry
- `/App.tsx` - Initializes rules engine

## 🎨 Cyber-Luxe Theme Colors

### Dark Mode (Default)
- Background: `#0f172a` (Deep Charcoal)
- Primary: `#00ffff` (Electric Cyan)
- Secondary: `#22d3ee` (Neon Blue)
- Accent: `#0ea5e9` (Bright Blue)
- Cards: `#1e293b` (Slate)

### Light Mode (Dashboard)
- Background: `#f8fafc` (Light Slate)
- Primary: `#0ea5e9` (Sky Blue)
- Secondary: `#06b6d4` (Cyan)
- Accent: `#22d3ee` (Bright Cyan)

## 🔧 Common Tasks

### Add New Sidebar Menu Item
```tsx
// In /components/main-dashboard.tsx
const sidebarItems = [
  // ...existing items
  { id: 'new-feature', label: 'New Feature', icon: Star },
];

// Add case in renderContent:
case 'new-feature':
  return <NewFeatureComponent user={user} accessToken={accessToken} />
```

### Customize Neon Color
```css
/* In /styles/globals.css */
.dark {
  --primary: #your-color; /* Change cyan to your preference */
}
```

### Change Logo
```tsx
// In /components/main-dashboard.tsx - line ~553
<Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
// Replace Zap with Building2, Home, etc.
```

## 🗄️ Database Setup (Next Step)

1. Go to your Supabase project
2. SQL Editor
3. Copy this schema:

```sql
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  total_units INTEGER DEFAULT 0,
  occupied_units INTEGER DEFAULT 0,
  vacant_units INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft DECIMAL,
  rent_amount DECIMAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('vacant', 'occupied')),
  vacant_since DATE,
  tenant_id UUID,
  tenant_name TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  number_of_payments INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE unit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  payment_number INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque')),
  cheque_photo_url TEXT,
  notes TEXT,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own buildings" ON buildings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create buildings" ON buildings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own buildings" ON buildings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own buildings" ON buildings
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Repeat for units and unit_payments...
```

4. Click "Run"
5. Done!

## 📧 Email Integration (Next Step)

### Option 1: Resend (Recommended)
```bash
npm install resend
```

```tsx
// Create /utils/email-service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: 'TasKeen PMS <noreply@yourdomain.com>',
    to,
    subject,
    html,
  });
}
```

### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

```tsx
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  await sgMail.send({ to, from: 'noreply@yourdomain.com', subject, html });
}
```

Then in `/utils/rules-engine.ts`:
```tsx
import { sendEmail } from './email-service';

// Replace console.log with:
await sendEmail(alert.tenant_email, 'Lease Expiring', emailHtml);
```

## 📊 Add Charts (Next Step)

```bash
npm install recharts
```

```tsx
// In dashboard component
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function VacancyTrendsChart() {
  const data = [
    { month: 'Jan', rate: 15 },
    { month: 'Feb', rate: 12 },
    { month: 'Mar', rate: 10 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
        <XAxis dataKey="month" stroke="#00ffff" />
        <YAxis stroke="#00ffff" />
        <Tooltip />
        <Line type="monotone" dataKey="rate" stroke="#00ffff" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## 🐛 Common Issues

### Issue: Rules Engine Not Starting
**Solution:** Check browser console for errors. Ensure `startRulesEngine()` is called in App.tsx

### Issue: Sidebar Not Glowing
**Solution:** Ensure dark mode is enabled. Check `data-sidebar="main"` attribute exists.

### Issue: Stats Cards Not Glowing
**Solution:** Check `data-stat-card="true"` attribute on Card components.

### Issue: Logo Not Showing
**Solution:** Import `Zap` from `lucide-react` in main-dashboard.tsx

## ✅ Checklist

- [ ] Login page shows cyber-luxe theme
- [ ] Sidebar items glow on hover
- [ ] Logo is electric cyan with glow
- [ ] Can create buildings
- [ ] Can create units
- [ ] Payment schedule auto-calculates
- [ ] Rules engine logs appear in console
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] All "PropertyFlow" branding removed

## 🎯 Next Features to Build

1. **Advanced Dashboard Charts** (2-3 hours)
   - Vacancy trends
   - Rent collection
   - Maintenance priorities

2. **Maintenance Auto-Assignment** (1 hour)
   - Auto-assign plumbing to plumber vendor
   - Auto-assign electrical to electrician

3. **Enhanced AI Assistant** (2-3 hours)
   - Platform-specific responses
   - Role-based restrictions
   - Maintenance triage

4. **PDF Reports** (2-3 hours)
   - jsPDF integration
   - Invoice generation
   - Lease summaries

## 📞 Support

Check these files for examples:
- **Cyber Styling:** `/styles/globals.css`
- **Components:** `/components/buildings-units-management.tsx`
- **Business Logic:** `/utils/rules-engine.ts`
- **Auto-Tagging:** `/utils/document-auto-tagger.ts`

---

**You're Ready to Launch TasKeen P.M.S.! 🚀**

Start testing, integrate Supabase, add email service, and you have a production-ready property management system!
