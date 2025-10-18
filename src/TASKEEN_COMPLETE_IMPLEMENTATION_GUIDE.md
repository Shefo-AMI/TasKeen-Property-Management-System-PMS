# 🚀 TasKeen P.M.S - Complete Implementation Guide

## ✅ COMPLETED (Just Now)

### 1. Login Page - Cyber-Luxe Theme ✅
- ✅ Removed "© 2024 PropertyFlow" 
- ✅ Removed "Quick Admin Login" section
- ✅ Enhanced login/register box with cyber design
- ✅ Modern blinking neon logo (Zap icon with cyan glow)
- ✅ App name: "TasKeen P.M.S PROPERTY MANAGEMENT SYSTEM" in huge neon text
- ✅ Cyber-Luxe dark theme with electric cyan accents
- ✅ Animated glow effects and pulsing borders
- ✅ Background sliding photos remain unchanged

### 2. Global Cyber-Luxe Theme ✅
- ✅ Deep Charcoal (#0f172a) background
- ✅ Electric Cyan (#00ffff) primary color
- ✅ Neon Blue (#0ea5e9) secondary color
- ✅ Animated glow effects throughout
- ✅ Sidebar page names with neon hover effects
- ✅ Cyber card designs with glowing borders

## 📋 TO IMPLEMENT (Next Steps)

### 1. Sidebar Neon Enhancement

Update `/components/main-dashboard.tsx` sidebar navigation items:

```tsx
// Add to each sidebar item:
<SidebarMenuItem>
  <SidebarMenuButton
    asChild
    className="group hover:text-cyan-400 transition-all duration-300"
  >
    <Link to="/dashboard" className="flex items-center gap-3">
      <LayoutDashboard className="h-5 w-5 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
      <span className="font-semibold tracking-wide group-hover:text-shadow-neon">
        DASHBOARD
      </span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>

// Repeat for all items: UNITS, TENANTS, LEASES, MAINTENANCE, etc.
// Use uppercase and semibold font for all page names
```

### 2. Building & Unit Management System

Create `/components/buildings-units-system.tsx`:

```tsx
// Key Features:
interface Building {
  id: string;
  name: string;
  address: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
}

interface Unit {
  id: string;
  building_id: string;
  unit_number: string;
  status: 'vacant' | 'occupied';
  tenant_id?: string;
  rent_amount: number;
  contract_start_date?: string;
  contract_end_date?: string;
  payment_schedule: Payment[];
  documents: Document[];
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
  cheque_photo?: string;
  payment_method: 'cash' | 'bank_transfer' | 'cheque';
}

// Auto-calculate payments:
function generatePaymentSchedule(
  totalRent: number,
  numberOfPayments: number,
  startDate: string
): Payment[] {
  const paymentAmount = totalRent / numberOfPayments;
  const payments: Payment[] = [];
  
  for (let i = 0; i < numberOfPayments; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + (i * 12 / numberOfPayments));
    
    payments.push({
      id: generateId(),
      date: paymentDate.toISOString(),
      amount: paymentAmount,
      status: i === 0 ? 'paid' : 'pending',
      payment_method: 'cheque'
    });
  }
  
  return payments;
}
```

#### Database Schema for Buildings/Units:

```sql
-- Add to migration file
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  total_units INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  contract_start_date DATE,
  contract_end_date DATE,
  number_of_payments INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  invoice_id UUID,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Advanced Dashboard Charts

Update `/components/main-dashboard.tsx` with Recharts:

```tsx
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Vacancy Rate Trends
function VacancyTrendsChart() {
  const data = [
    { month: 'Jan', rate: 15 },
    { month: 'Feb', rate: 12 },
    { month: 'Mar', rate: 10 },
    { month: 'Apr', rate: 8 },
    { month: 'May', rate: 5 },
    { month: 'Jun', rate: 7 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
        <XAxis dataKey="month" stroke="#00ffff" />
        <YAxis stroke="#00ffff" />
        <Tooltip
          contentStyle={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid #00ffff',
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="rate" 
          stroke="#00ffff" 
          strokeWidth={3}
          dot={{ fill: '#00ffff', r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Monthly Rent Collection
function RentCollectionChart() {
  const data = [
    { month: 'Jan', collected: 45000, remaining: 5000 },
    { month: 'Feb', collected: 48000, remaining: 2000 },
    { month: 'Mar', collected: 47000, remaining: 3000 },
    { month: 'Apr', collected: 50000, remaining: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
        <XAxis dataKey="month" stroke="#00ffff" />
        <YAxis stroke="#00ffff" />
        <Tooltip
          contentStyle={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid #00ffff',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="collected" fill="#00ffff" name="Collected" />
        <Bar dataKey="remaining" fill="#22d3ee" name="Remaining" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Maintenance Priority Distribution
function MaintenancePriorityChart() {
  const data = [
    { name: 'Urgent', value: 5, color: '#ef4444' },
    { name: 'Important', value: 12, color: '#f59e0b' },
    { name: 'Secondary', value: 8, color: '#22d3ee' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### 4. Automated Rules Engine

Create `/utils/rules-engine.ts`:

```typescript
import { supabase } from './supabase/client';

// Lease Expiration Alerts
export async function checkLeaseExpirations() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const { data: expiringLeases } = await supabase
    .from('leases')
    .select('*, tenants(*), properties(*)')
    .lte('end_date', thirtyDaysFromNow.toISOString())
    .eq('status', 'active');

  for (const lease of expiringLeases || []) {
    await sendLeaseExpirationEmail({
      tenantEmail: lease.tenants.email,
      propertyManager: lease.properties.manager_email,
      tenantName: `${lease.tenants.first_name} ${lease.tenants.last_name}`,
      propertyName: lease.properties.name,
      endDate: lease.end_date,
    });
  }
}

// Payment Reminders
export async function sendPaymentReminders() {
  const fifteenDaysFromNow = new Date();
  fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

  const { data: upcomingPayments } = await supabase
    .from('unit_payments')
    .select('*, units(*, tenants(*))')
    .lte('payment_date', fifteenDaysFromNow.toISOString())
    .eq('status', 'pending');

  for (const payment of upcomingPayments || []) {
    await generateAndSendInvoice({
      tenantEmail: payment.units.tenants.email,
      amount: payment.amount,
      dueDate: payment.payment_date,
      unitNumber: payment.units.unit_number,
    });
  }
}

// Auto-run every day at 9 AM
export function startRulesEngine() {
  // Run immediately on startup
  checkLeaseExpirations();
  sendPaymentReminders();

  // Then run every 24 hours
  setInterval(() => {
    checkLeaseExpirations();
    sendPaymentReminders();
  }, 24 * 60 * 60 * 1000);
}

// Email sending functions (integrate with your email service)
async function sendLeaseExpirationEmail(data: any) {
  // TODO: Integrate with SendGrid, Resend, or your email service
  console.log('Sending lease expiration email:', data);
  
  // Example with fetch to email API:
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     to: [data.tenantEmail, data.propertyManager],
  //     subject: `Lease Expiration Notice - ${data.propertyName}`,
  //     template: 'lease-expiration',
  //     data: data
  //   })
  // });
}

async function generateAndSendInvoice(data: any) {
  // TODO: Generate invoice and send
  console.log('Generating and sending invoice:', data);
}
```

### 5. Document Intelligence - Auto-Tagging

Update `/components/crud/document-manager.tsx`:

```typescript
// Auto-suggest category based on file content/name
function suggestDocumentCategory(fileName: string, fileContent?: string): string {
  const name = fileName.toLowerCase();
  
  if (name.includes('lease') || name.includes('contract')) {
    return 'lease';
  }
  if (name.includes('invoice') || name.includes('receipt')) {
    return 'invoice';
  }
  if (name.includes('inspection') || name.includes('report')) {
    return 'inspection';
  }
  if (name.includes('id') || name.includes('passport') || name.includes('license')) {
    return 'tenant_documents';
  }
  if (name.includes('cheque') || name.includes('payment')) {
    return 'invoice';
  }
  if (name.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return 'photo';
  }
  
  return 'other';
}

// OCR Integration (optional - for reading text from PDFs/images)
async function extractTextFromDocument(file: File): Promise<string> {
  // TODO: Integrate with Tesseract.js or cloud OCR service
  return '';
}
```

### 6. Maintenance Auto-Assignment

Update `/components/enhanced-maintenance-system.tsx`:

```typescript
// Auto-assign based on category
const MAINTENANCE_VENDORS = {
  plumbing: 'vendor-plumber-id',
  electrical: 'vendor-electrician-id',
  hvac: 'vendor-hvac-id',
  appliance: 'employee-maintenance-id',
  structural: 'vendor-contractor-id',
  pest: 'vendor-pest-control-id',
};

function autoAssignMaintenance(category: string): string | undefined {
  return MAINTENANCE_VENDORS[category as keyof typeof MAINTENANCE_VENDORS];
}

// When creating ticket:
const newTicket = await maintenanceService.create({
  ...ticketData,
  assigned_to: autoAssignMaintenance(ticketData.category) || ticketData.assigned_to,
});
```

### 7. Enhanced AI Assistant

Create `/components/ai-assistant-enhanced.tsx`:

```tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Sparkles, Send } from 'lucide-react';

// AI capabilities
const AI_CAPABILITIES = [
  'Maintenance ticket triage and priority assessment',
  'Lease contract analysis and summary',
  'Payment history insights',
  'Vacancy rate predictions',
  'Platform navigation help',
  'Report generation assistance',
];

export function AIAssistantEnhanced({ user }: { user: User }) {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if question is platform-related
      if (isOutOfScope(input)) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I can only help with TasKeen P.M.S platform-related questions. Please ask about properties, tenants, maintenance, or other platform features.'
        }]);
        setIsLoading(false);
        return;
      }

      // Call AI API (OpenAI, Anthropic, or your own)
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          user: {
            id: user.id,
            role: user.role, // Respect user role permissions
          }
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  function isOutOfScope(question: string): boolean {
    const outOfScopeKeywords = [
      'weather', 'news', 'stock', 'recipe', 'joke', 'game',
      'personal advice', 'medical', 'legal advice'
    ];
    
    return outOfScopeKeywords.some(keyword => 
      question.toLowerCase().includes(keyword)
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* AI Capabilities */}
      <Card className="p-4 mb-4">
        <h3 className="flex items-center gap-2 font-bold text-cyan-400 mb-2">
          <Sparkles className="h-5 w-5" />
          AI Assistant Capabilities
        </h3>
        <ul className="text-sm text-slate-300 space-y-1">
          {AI_CAPABILITIES.map((cap, i) => (
            <li key={i}>• {cap}</li>
          ))}
        </ul>
      </Card>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`p-3 max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                : 'bg-slate-800 text-slate-200'
            }`}>
              {msg.content}
            </Card>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your properties, maintenance, or platform features..."
          className="cyber-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button 
          onClick={handleSend}
          disabled={isLoading}
          className="cyber-button"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
```

## 🔧 Integration Steps

### 1. Enable in App.tsx

```tsx
import { startRulesEngine } from './utils/rules-engine';

// In App component useEffect:
useEffect(() => {
  // Start automated rules
  startRulesEngine();
}, []);
```

### 2. Add to Dashboard Routes

```tsx
<Route path="/dashboard/buildings" element={<BuildingsUnitsSystem />} />
<Route path="/dashboard/ai-assistant" element={<AIAssistantEnhanced user={user} />} />
```

### 3. Update Sidebar

Add menu items for Buildings, Units, Enhanced AI, etc.

## 📊 Testing Checklist

- [ ] Login page displays with cyber-luxe theme
- [ ] Neon text animations work
- [ ] Sidebar items glow on hover
- [ ] Dashboard shows advanced charts
- [ ] Building/Unit system creates units
- [ ] Payment schedule auto-calculates
- [ ] Lease expiration emails send (30 days before)
- [ ] Payment reminders send (15 days before)
- [ ] Document auto-tagging suggests correct category
- [ ] Maintenance auto-assigns to vendors
- [ ] AI assistant responds to platform questions
- [ ] AI assistant rejects out-of-scope questions

## 🎨 Final Polish

1. All headings should be UPPERCASE with semibold font
2. All sidebar items should have neon glow on hover
3. Dark mode should be enabled by default
4. Charts should use cyan/blue color scheme
5. Cards should have subtle glow borders
6. Buttons should have hover glow effects

## 🚀 Deployment

Once all features are implemented:
1. Test thoroughly in dev mode
2. Build: `npm run build`
3. Deploy to Vercel/Netlify
4. Set up email service for notifications
5. Configure AI API keys
6. Test production environment

---

**Your TasKeen P.M.S. transformation is 20% complete!**  
Continue implementing features from this guide to reach 100%. 🎯
