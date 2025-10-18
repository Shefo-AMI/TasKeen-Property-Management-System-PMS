# ⚡ TasKeen P.M.S. - Quick Deploy Reference

## 🚀 One Command Deploy

```bash
vercel --prod
```

---

## 📋 Pre-Deployment Check

```bash
# Test build locally
npm install
npm run build
npm run preview
```

If successful → Deploy!

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Platform Admin** | shefo171@gmail.com | Al-zahi2012 |
| **Manager 1** | manager1@alzahi.com | Alzahi2024! |
| **Manager 2** | manager2@alzahi.com | Alzahi2024! |
| **Maintenance 1** | maintenance1@alzahi.com | Alzahi2024! |
| **Maintenance 2** | maintenance2@alzahi.com | Alzahi2024! |

---

## ✅ Verification Steps

### 1. After Deployment
- Access your Vercel URL
- Login as Platform Admin
- Navigate to: **Platform Admin → System Health**
- Verify all indicators are ✅ GREEN

### 2. Run Tests
```javascript
// In browser console
window.runDeploymentTests()
```

### 3. Test Features
- ✅ Create a property
- ✅ Add a tenant
- ✅ Create maintenance ticket
- ✅ Generate invoice
- ✅ Upload document

---

## 🔧 Environment Variables (Pre-Configured)

Already set in `vercel.json`:
```
VITE_SUPABASE_URL=https://touwkydlhzxgwhnxpnui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_EDGE_FUNCTION_URL=https://touwkydlhzxgwhnxpnui.supabase.co/functions/v1/make-server-a4833a9b
```

---

## 📊 What's Included

- ✅ **4 Users** (2 managers, 2 maintenance)
- ✅ **3 Properties** (161 total units)
- ✅ **ALZAHI Company** pre-configured
- ✅ **Live Supabase Backend**
- ✅ **All CRUD Operations**
- ✅ **Payment & Invoicing**
- ✅ **Document Management**
- ✅ **Role-Based Access**
- ✅ **Automated Rules**
- ✅ **System Monitoring**

---

## 🐛 Quick Troubleshooting

### Can't login?
- Check browser console
- Verify Supabase is accessible
- Check environment variables

### Build fails?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment variables not working?
- Add manually in Vercel Dashboard → Settings → Environment Variables
- Redeploy: `vercel --prod`

---

## 📞 Documentation

- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - 5-minute guide
- **[DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)** - Full details
- **[VERCEL_DEPLOYMENT_INSTRUCTIONS.md](VERCEL_DEPLOYMENT_INSTRUCTIONS.md)** - Step-by-step

---

## 🎯 Deploy Methods

### Method 1: CLI (Fastest)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Method 2: npm Script
```bash
npm run deploy
```

### Method 3: GitHub + Vercel
```bash
git push origin main
# Vercel auto-deploys
```

---

## ✨ Success!

After deployment:
- 🌐 Access via Vercel URL
- 🔑 Login with test accounts
- ✅ Verify system health
- 🎉 You're live!

---

**Deploy now:** `vercel --prod`
