# Complete Setup Script for Supabase + Vercel (PowerShell)
# This script automates as much as possible

Write-Host "🚀 TasKeen P.M.S. - Complete Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Supabase Setup
Write-Host "Step 1: Supabase Setup" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "Get it from: https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui/settings/api"
    Write-Host ""
    Write-Host "Then run:"
    Write-Host '  $env:SUPABASE_SERVICE_ROLE_KEY="your_key_here"'
    Write-Host "  .\scripts\setup-complete.ps1"
    exit 1
}

Write-Host "Creating admin user..."
node scripts/create-admin-user.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Supabase setup complete!" -ForegroundColor Green
} else {
    Write-Host "❌ Supabase setup failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Vercel Setup" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not installed" -ForegroundColor Yellow
    Write-Host "Install it with: npm install -g vercel"
    Write-Host "Then run: vercel login"
    Write-Host ""
    Write-Host "After that, set environment variables manually in Vercel dashboard"
    exit 0
}

Write-Host "Setting up Vercel environment variables..."
Write-Host ""
Write-Host "📋 Manual Steps Required:" -ForegroundColor Yellow
Write-Host "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
Write-Host "2. Add these variables for Production, Preview, and Development:"
Write-Host ""
Write-Host "   VITE_SUPABASE_URL=https://touwkydlhzxgwhnxpnui.supabase.co"
Write-Host "   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Write-Host ""

Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:"
Write-Host "1. Verify login at http://localhost:3000/login"
Write-Host "2. Check Supabase dashboard for user"
Write-Host "3. Deploy to Vercel: vercel --prod"

