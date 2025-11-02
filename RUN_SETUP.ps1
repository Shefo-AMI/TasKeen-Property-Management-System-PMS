# Quick Setup Script - Run This!
# This will prompt you for your Supabase Service Role Key

Write-Host "🚀 TasKeen P.M.S. - Automated Supabase Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if key is already set
if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "📋 You need your Supabase Service Role Key" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get it from:" -ForegroundColor White
    Write-Host "   https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui/settings/api" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Look for 'service_role' key (NOT the anon key)" -ForegroundColor Yellow
    Write-Host ""
    
    # Prompt for the key
    $serviceKey = Read-Host "Paste your SUPABASE_SERVICE_ROLE_KEY here"
    
    if ($serviceKey) {
        $env:SUPABASE_SERVICE_ROLE_KEY = $serviceKey
        Write-Host ""
        Write-Host "✅ Key set! Running setup..." -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ No key provided. Exiting." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Service role key already set!" -ForegroundColor Green
    Write-Host ""
}

# Run the setup script
Write-Host "🔧 Creating admin user..." -ForegroundColor Yellow
node scripts/create-admin-user.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Setup Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Test login at: http://localhost:3000/login" -ForegroundColor White
    Write-Host "   Email: shefo171@gmail.com" -ForegroundColor White
    Write-Host "   Password: Al-zahi2012" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Set Vercel environment variables (see VERCEL_ENV_SETUP.md)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Setup failed. Check errors above." -ForegroundColor Red
}

