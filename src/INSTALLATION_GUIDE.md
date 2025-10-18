# PropertyFlow - Complete Installation Guide

## 📋 Prerequisites

Before installing PropertyFlow, ensure you have:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0.0 or higher (comes with Node.js)
- **Git** (optional, for version control)
- **Supabase Account** ([Sign up free](https://supabase.com))
- **Modern Web Browser** (Chrome, Firefox, Safari, or Edge)

## 🚀 Quick Start (5 Minutes)

### Step 1: Extract Project Files

Extract the PropertyFlow folder to your desired location:

```bash
# Navigate to your projects directory
cd ~/projects

# Extract the folder (if downloaded as ZIP)
unzip propertyflow.zip
cd propertyflow
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install
```

This will install:
- React & React DOM
- React Router DOM (for navigation)
- Supabase Client
- Tailwind CSS v4
- Shadcn UI Components
- Lucide Icons
- And all other dependencies

### Step 3: Configure Supabase

The project comes pre-configured with Supabase credentials in `/utils/supabase/info.tsx`.

**For production**, you should:

1. Create your own Supabase project at [supabase.com](https://supabase.com)
2. Update `/utils/supabase/info.tsx` with your credentials:

```tsx
export const projectId = "your-project-id"
export const publicAnonKey = "your-anon-key"
```

### Step 4: Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Step 5: Login

Use the Platform Administrator credentials:

```
Email: shefo171@gmail.com
Password: Al-zahi2012
```

## 📦 Detailed Installation

### Option 1: Using the Provided Files

```bash
# 1. Navigate to project directory
cd propertyflow

# 2. Verify package.json exists
ls -la package.json

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

### Option 2: Fresh Setup from Scratch

```bash
# 1. Create new directory
mkdir propertyflow
cd propertyflow

# 2. Copy all files from the provided folder
# Make sure to copy:
# - App.tsx
# - package.json
# - components/
# - utils/
# - styles/
# - All other folders and files

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev
```

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the root directory for additional configuration:

```env
# Supabase Configuration (optional - already in code)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Builder.io (optional)
VITE_BUILDER_IO_API_KEY=your-builder-io-key

# App Configuration
VITE_APP_NAME=PropertyFlow
VITE_APP_URL=http://localhost:5173
```

### Supabase Setup

#### Database Tables

The app uses these Supabase tables (auto-created on first use):

- `profiles` - User profiles
- `companies` - Company information
- `properties` - Property listings
- `units` - Individual units
- `tenants` - Tenant information
- `leases` - Lease agreements
- `maintenance_requests` - Maintenance tracking
- `payments` - Payment records
- `invoices` - Invoice data

#### Authentication Setup

1. Go to Supabase Dashboard → Authentication
2. Enable Email provider
3. Configure email templates (optional)
4. Set up any additional OAuth providers

#### Storage Setup (Optional)

1. Go to Supabase Dashboard → Storage
2. Create buckets:
   - `property-images`
   - `maintenance-photos`
   - `documents`
   - `avatars`

3. Set up storage policies for authenticated users

## 📁 Project Structure

```
propertyflow/
├── App.tsx                     # Main application with Router
├── package.json                # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── index.html                 # HTML entry point
│
├── components/                # React components
│   ├── auth-form.tsx         # Login/Register
│   ├── main-dashboard.tsx    # Main dashboard with Router
│   ├── accounting-system.tsx # Accounting features
│   ├── enhanced-maintenance-system.tsx
│   ├── units-tenants-system.tsx
│   ├── payments-system.tsx
│   ├── leases-contracts-system.tsx
│   ├── documents-system.tsx
│   ├── communications-system.tsx
│   ├── calendar-system.tsx
│   ├── inspections-system.tsx
│   ├── vendor-management.tsx
│   ├── marketing-listings.tsx
│   ├── reports-analytics.tsx
│   ├── ai-assistant.tsx
│   ├── builder-io-editor.tsx
│   ├── dynamic-background.tsx
│   ├── error-boundary.tsx
│   └── ui/                   # Shadcn UI components
│
├── utils/                     # Utility functions
│   ├── supabase/             # Supabase configuration
│   │   ├── client.ts
│   │   ├── index.ts
│   │   └── info.tsx
│   ├── demo-data.ts          # Demo data
│   └── builder-config.ts     # Builder.io config
│
├── styles/                    # Stylesheets
│   └── globals.css           # Tailwind v4 configuration
│
└── supabase/                 # Supabase edge functions
    └── functions/
        └── server/
```

## 🎯 Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🌐 Building for Production

### Step 1: Build the Application

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Step 2: Test Production Build Locally

```bash
npm run preview
```

### Step 3: Deploy

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Option C: Manual Deployment

1. Upload `dist/` folder contents to your web server
2. Configure server to serve `index.html` for all routes (for React Router)

### Server Configuration for React Router

#### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Vercel (vercel.json)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## 🔐 Security Configuration

### Production Checklist

- [ ] Update Supabase credentials
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Configure CORS policies
- [ ] Set up environment variables
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Review and limit API permissions

### Supabase RLS Policies

Example policies for the `properties` table:

```sql
-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own company's properties
CREATE POLICY "Users can view own company properties"
ON properties FOR SELECT
USING (company_id = auth.jwt() ->> 'company_id');

-- Allow company admins to insert properties
CREATE POLICY "Company admins can insert properties"
ON properties FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' = 'company_admin'
  AND company_id = auth.jwt() ->> 'company_id'
);
```

## 🐛 Troubleshooting

### Issue: Dependencies Won't Install

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 5173 Already in Use

```bash
# Option 1: Use different port
npm run dev -- --port 3000

# Option 2: Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID [PID] /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

### Issue: Supabase Connection Errors

1. Check your internet connection
2. Verify Supabase credentials in `/utils/supabase/info.tsx`
3. Check Supabase project status at dashboard
4. Review browser console for specific error messages

### Issue: Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clean build
npm run build -- --force
```

### Issue: React Router Not Working After Deploy

Make sure your server is configured to serve `index.html` for all routes (see Server Configuration section above).

## 📊 Performance Optimization

### Production Build Optimizations

The build process automatically includes:

- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Asset optimization
- ✅ Gzip compression

### Additional Optimizations

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

## 🔄 Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update react-router-dom
```

## 📱 Mobile Development

The app is fully responsive and works on mobile devices. To test:

```bash
# Start dev server
npm run dev

# Access from mobile device on same network
# Use your computer's IP address
http://192.168.1.x:5173
```

## 🆘 Support

### Getting Help

1. Check the documentation files:
   - `README.md` - General overview
   - `ROUTER_INTEGRATION_GUIDE.md` - Router documentation
   - `BUILDER_IO_SETUP.md` - Builder.io integration
   - `ENVIRONMENT_SETUP.md` - Environment configuration

2. Common issues:
   - Authentication problems → Check Supabase configuration
   - Routing issues → See ROUTER_INTEGRATION_GUIDE.md
   - Build errors → Clear cache and rebuild
   - UI issues → Check browser console for errors

### System Requirements

- **Minimum**: 4GB RAM, Dual-core processor
- **Recommended**: 8GB+ RAM, Quad-core processor
- **Browser**: Modern browser with ES6 support
- **Internet**: Stable connection for Supabase

## ✅ Post-Installation Checklist

After installation, verify:

- [ ] App loads at http://localhost:5173
- [ ] Login page appears
- [ ] Can login with admin credentials
- [ ] Dashboard loads correctly
- [ ] Navigation between pages works
- [ ] URL updates when navigating
- [ ] Browser back/forward buttons work
- [ ] All sections are accessible
- [ ] No console errors

## 🎉 Success!

You're now ready to use PropertyFlow! 

**Next Steps:**
1. Login with admin credentials
2. Explore the dashboard
3. Add your first property
4. Customize the platform for your needs
5. Configure Builder.io for visual editing (optional)

**Happy Property Managing! 🏢**
