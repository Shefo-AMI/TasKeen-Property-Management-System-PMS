# ⚡ Quick Setup - Supabase & Vercel Integration

## 🎯 Automated Setup (Recommended)

I've created scripts that integrate directly with Supabase and Vercel!

---

## 🚀 One-Command Setup (Windows)

### Step 1: Get Your Supabase Service Role Key

1. Go to: **https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui/settings/api**
2. Scroll to **"service_role"** section
3. Click **"Reveal"** and copy the key

### Step 2: Run the Automation Script

```powershell
# Set your service role key
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Run the script
node scripts/create-admin-user.js
```

**That's it!** The script will:
- ✅ Create admin user automatically
- ✅ Set user metadata
- ✅ Confirm email
- ✅ Configure everything

---

## 🚀 One-Command Setup (Mac/Linux)

```bash
# Set your service role key
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Run the script
node scripts/create-admin-user.js
```

---

## 📋 What the Script Does

The `create-admin-user.js` script:
1. Connects to your Supabase project using the service role key
2. Creates the admin user (`shefo171@gmail.com`)
3. Sets password (`Al-zahi2012`)
4. Auto-confirms email (no email verification needed)
5. Sets user metadata (role, company, etc.)

---

## ✅ After Running Script

### 1. Verify in Supabase Dashboard

- Go to: **Authentication → Users**
- You should see: `shefo171@gmail.com`
- Status: **Confirmed** ✅

### 2. Test Login

- Open: `http://localhost:3000/login`
- Email: `shefo171@gmail.com`
- Password: `Al-zahi2012`
- **Should work immediately!** ✅

### 3. (Optional) Disable Email Confirmation

Even though the script confirms the user, for new signups:
- Go to: **Authentication → Settings → Auth**
- Turn OFF **"Enable email confirmations"**
- Click **Save**

---

## 🌐 Vercel Setup

### Option 1: Via Dashboard (Easiest)

1. Go to: **https://vercel.com/dashboard**
2. Select your project
3. **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add these for **Production**, **Preview**, **Development**:

```
Key: VITE_SUPABASE_URL
Value: https://touwkydlhzxgwhnxpnui.supabase.co
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdXdreWRsaHp4Z3dobnhwbnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODQ4ODAsImV4cCI6MjA3NDU2MDg4MH0.GYLJ-JcTz6RVZmg8cqyzlnFUpBP6pwxtCj1xGWMBmss
```

6. Click **Save** for each
7. **Redeploy** your project

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Repeat for preview and development
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
```

---

## 🐛 Troubleshooting

### Script Error: "SUPABASE_SERVICE_ROLE_KEY not set"

**Solution:**
```powershell
# Windows PowerShell
$env:SUPABASE_SERVICE_ROLE_KEY="your_key_here"

# Windows CMD
set SUPABASE_SERVICE_ROLE_KEY=your_key_here

# Mac/Linux
export SUPABASE_SERVICE_ROLE_KEY="your_key_here"
```

### Script Error: "Unauthorized"

- Make sure you're using the **service_role** key (NOT anon key)
- Verify the key is correct
- Check project is active

### User Created But Login Fails

1. Check Supabase Dashboard → **Authentication → Users**
2. Verify user is **confirmed** (green checkmark)
3. Check browser console for errors
4. Try clearing localStorage: `localStorage.clear()` in browser console

---

## 📚 Files Created

- ✅ `scripts/create-admin-user.js` - Main automation script
- ✅ `scripts/setup-supabase.ts` - TypeScript version
- ✅ `scripts/setup-vercel.ts` - Vercel setup helper
- ✅ `scripts/supabase-setup.sql` - SQL alternative
- ✅ `AUTOMATED_SETUP_GUIDE.md` - Full documentation

---

## 🎉 Success!

Once setup is complete:
- ✅ Admin user created in Supabase
- ✅ Login works immediately
- ✅ Vercel environment variables configured
- ✅ Ready to deploy!

**Next Step:** Deploy to Vercel and go live! 🚀

---

## 💡 Quick Reference

**Get Service Role Key:**
https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui/settings/api

**Run Setup:**
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="your_key"
node scripts/create-admin-user.js
```

**Test Login:**
- URL: `http://localhost:3000/login`
- Email: `shefo171@gmail.com`
- Password: `Al-zahi2012`

