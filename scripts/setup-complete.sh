#!/bin/bash

# Complete Setup Script for Supabase + Vercel
# This script automates as much as possible

echo "🚀 TasKeen P.M.S. - Complete Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Supabase Setup
echo -e "${YELLOW}Step 1: Supabase Setup${NC}"
echo "-------------------------"

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    echo ""
    echo "Get it from: https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui/settings/api"
    echo ""
    echo "Then run:"
    echo "  export SUPABASE_SERVICE_ROLE_KEY='your_key_here'"
    echo "  ./scripts/setup-complete.sh"
    exit 1
fi

echo "Creating admin user..."
node scripts/create-admin-user.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Supabase setup complete!${NC}"
else
    echo -e "${RED}❌ Supabase setup failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Vercel Setup${NC}"
echo "----------------------"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
    echo "Install it with: npm install -g vercel"
    echo "Then run: vercel login"
    echo ""
    echo "After that, set environment variables manually in Vercel dashboard"
    exit 0
fi

echo "Setting up Vercel environment variables..."
node scripts/setup-vercel.ts

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Verify login at http://localhost:3000/login"
echo "2. Check Supabase dashboard for user"
echo "3. Deploy to Vercel: vercel --prod"

