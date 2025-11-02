# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these variables for **Production**, **Preview**, and **Development**:

### Required Variables:

```env
VITE_SUPABASE_URL=https://touwkydlhzxgwhnxpnui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdXdreWRsaHp4Z3dobnhwbnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODQ4ODAsImV4cCI6MjA3NDU2MDg4MH0.GYLJ-JcTz6RVZmg8cqyzlnFUpBP6pwxtCj1xGWMBmss
```

### Optional Variables (Add as needed):

```env
VITE_EDGE_FUNCTION_URL=https://touwkydlhzxgwhnxpnui.supabase.co/functions/v1/make-server-a4833a9b
VITE_APP_NAME=TasKeen P.M.S.
VITE_APP_ENV=production
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
VITE_RESEND_API_KEY=your_resend_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_BUILDER_IO_API_KEY=your_builder_io_key
```

## Steps:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings** → **Environment Variables**
4. **Add each variable** for all environments (Production, Preview, Development)
5. **Redeploy** your application after adding variables

## Important Notes:

- Variables must start with `VITE_` to be exposed to the frontend
- After adding variables, trigger a new deployment
- Don't commit `.env` files to Git (they're already in .gitignore)

