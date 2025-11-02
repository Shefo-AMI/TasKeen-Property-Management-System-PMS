# ============================================
# TasKeen PMS - Vercel Deployment Script
# PowerShell Script for Windows
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TasKeen PMS - Vercel Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "IMPORTANT: Please edit .env file and add your Supabase credentials!" -ForegroundColor Red
    Write-Host "1. Open .env file" -ForegroundColor Yellow
    Write-Host "2. Add VITE_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "3. Add VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter when you've configured .env file"
}
Write-Host "✓ Environment file found" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Run type check
Write-Host "Running TypeScript type check..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: TypeScript errors found, but continuing..." -ForegroundColor Yellow
}
Write-Host "✓ Type check complete" -ForegroundColor Green
Write-Host ""

# Build for production
Write-Host "Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Production build complete" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Vercel CLI!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Vercel CLI ready" -ForegroundColor Green
Write-Host ""

# Deploy to Vercel
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You will be prompted to:" -ForegroundColor Yellow
Write-Host "1. Login to Vercel (if not already logged in)" -ForegroundColor Yellow
Write-Host "2. Select or create a project" -ForegroundColor Yellow
Write-Host "3. Configure deployment settings" -ForegroundColor Yellow
Write-Host ""

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Visit your Vercel dashboard to see deployment URL" -ForegroundColor Yellow
    Write-Host "2. Add environment variables in Vercel dashboard:" -ForegroundColor Yellow
    Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host "   - VITE_APP_URL (your Vercel URL)" -ForegroundColor Yellow
    Write-Host "3. Test your production app" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    Write-Host ""
}
