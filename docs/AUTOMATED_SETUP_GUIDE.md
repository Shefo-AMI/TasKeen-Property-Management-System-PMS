# 🤖 Automated Supabase & Vercel Setup Guide

## 🎯 What This Does

These scripts automate the setup process for:
1. ✅ **Creating admin user in Supabase** (via API)
2. ✅ **Setting user metadata**
3. ✅ **Configuring Vercel** (instructions provided)

---

## 🚀 Quick Start (Windows PowerShell)

### Step 1: Get Supabase Service Role Key

1. Go to: **https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui/settings/api**
2. Find **"service_role"** key (NOT the anon key)
3. Copy it

### Step 2: Run Setup Script

```powershell
# Set the service role key
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Run the setup script
node scripts/create-admin-user.js
```

**That's it!** The admin user will be created automatically.

---

## 🚀 Quick Start (Mac/Linux)

### Step 1: Get Supabase Service Role Key

1. Go to: **https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui/settings/api**
2. Find **"service_role"** key
3. Copy it

### Step 2: Run Setup Script

```bash
# Set the service role key
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Run the setup script
node scripts/create-admin-user.js
```

---

## 📋 What Gets Created

### Admin User
- **Email:** `shefo171@gmail.com`
- **Password:** `Al-zahi2012`
- **Role:** `platform_admin`
- **Status:** Active & Email Confirmed
- **Metadata:**
  - Full Name: Platform Administrator
  - Company: TasKeen P.M.S Platform
  - Company ID: platform-admin

---

## 🔧 Scripts Available

### 1. `create-admin-user.js` (Main Script)
**Purpose:** Creates admin user in Supabase

**Usage:**
```bash
node scripts/create-admin-user.js
```

**Requirements:**
- `SUPABASE_SERVICE_ROLE_KEY` environment variable

### 2. `setup-supabase.ts` (TypeScript Version)
**Purpose:** Full Supabase setup with TypeScript

**Usage:**
```bash
npm run setup:supabase
```

### 3. `setup-complete.ps1` / `setup-complete.sh`
**Purpose:** Complete automated setup

**Usage (Windows):**
```powershell
.\scripts\setup-complete.ps1
```

**Usage (Mac/Linux):**
```bash
chmod +x scripts/setup-complete.sh
./scripts/setup-complete.sh
```

---

## 🌐 Vercel Environment Variables

The scripts will guide you, but here's what to add manually:

### Via Vercel Dashboard:

1. Go to: **https://vercel.com/dashboard**
2. Select your project
3. **Settings** → **Environment Variables**
4. Add these for **Production**, **Preview**, and **Development**:

```
VITE_SUPABASE_URL=https://touwkydlhzxgwhnxpnui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdXdreWRsaHp4Z3dobnhwbnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODQ4ODAsImV4cCI6MjA3NDU2MDg4MH0.GYLJ-JcTz6RVZmg8cqyzlnFUpBP6pwxtCj1xGWMBmss
VITE_APP_NAME=TasKeen P.M.S.
VITE_APP_ENV=production
```

5. Click **Save** and **Redeploy**

### Via Vercel CLI (if installed):

```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
# Repeat for preview and development environments
```

---

## ✅ Verification

After running the script:

1. **Check Supabase Dashboard:**
   - Go to: **Authentication** → **Users**
   - You should see `shefo171@gmail.com`

2. **Test Login:**
   - Go to: `http://localhost:3000/login`
   - Email: `shefo171@gmail.com`
   - Password: `Al-zahi2012`
   - Should log in successfully!

---

## 🐛 Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY not set"

**Solution:**
```powershell
# Windows
$env:SUPABASE_SERVICE_ROLE_KEY="your_key_here"

# Mac/Linux
export SUPABASE_SERVICE_ROLE_KEY="your_key_here"
```

### Error: "User already exists"

**This is OK!** The script will detect and update the existing user.

### Error: "Unauthorized" or "Invalid API key"

**Solution:**
- Verify you're using the **service_role** key (NOT anon key)
- Check the key is correct
- Ensure project is active

### Script runs but login still fails

**Check:**
1. Email confirmation is disabled in Supabase dashboard
2. User exists in Supabase Authentication → Users
3. Browser console for errors
4. Network tab for failed requests

---

## 📝 Manual Alternative

If scripts don't work, follow the manual steps in:
- `LOGIN_FIX_COMPLETE.md`
- `SUPABASE_FIX_GUIDE.md`

---

## 🎉 Success!

Once the script completes, you should be able to:
- ✅ Log in to the app
- ✅ Access the dashboard
- ✅ Use all features

**Next:** Deploy to Vercel and you're live! 🚀

