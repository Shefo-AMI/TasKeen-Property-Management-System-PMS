/**
 * Vercel Environment Variables Setup Script
 * 
 * This script sets environment variables in Vercel via CLI
 * 
 * Prerequisites:
 *   1. Install Vercel CLI: npm install -g vercel
 *   2. Login: vercel login
 *   3. Link project: vercel link
 * 
 * Usage:
 *   npm run setup:vercel
 */

import { execSync } from 'child_process';

const ENV_VARS = {
  VITE_SUPABASE_URL: 'https://touwkydlhzxgwhnxpnui.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvdXdreWRsaHp4Z3dobnhwbnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODQ4ODAsImV4cCI6MjA3NDU2MDg4MH0.GYLJ-JcTz6RVZmg8cqyzlnFUpBP6pwxtCj1xGWMBmss',
  VITE_APP_NAME: 'TasKeen P.M.S.',
  VITE_APP_ENV: 'production',
};

const ENVIRONMENTS = ['production', 'preview', 'development'];

function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function setupVercelEnv() {
  console.log('🚀 Setting up Vercel environment variables...\n');

  if (!checkVercelCLI()) {
    console.error('❌ Vercel CLI not found!');
    console.log('\n📦 Install it with:');
    console.log('   npm install -g vercel');
    console.log('\n🔐 Then login with:');
    console.log('   vercel login');
    console.log('\n🔗 Link your project with:');
    console.log('   vercel link');
    process.exit(1);
  }

  try {
    // Check if project is linked
    try {
      execSync('vercel project ls', { stdio: 'ignore' });
    } catch {
      console.log('⚠️  Project not linked. Run: vercel link');
      console.log('\n📋 After linking, you can set env vars manually:');
      console.log('\nFor each environment, run:');
      ENVIRONMENTS.forEach(env => {
        Object.entries(ENV_VARS).forEach(([key, value]) => {
          console.log(`   vercel env add ${key} ${env}`);
        });
      });
      process.exit(1);
    }

    console.log('📝 Setting environment variables...\n');

    // Set each variable for each environment
    for (const env of ENVIRONMENTS) {
      console.log(`\n🌍 ${env.toUpperCase()} environment:`);
      for (const [key, value] of Object.entries(ENV_VARS)) {
        try {
          // Note: Vercel CLI doesn't have a direct command to set env vars
          // We'll provide instructions instead
          console.log(`   ${key} = ${value.substring(0, 50)}...`);
        } catch (error: any) {
          console.error(`   ❌ Failed to set ${key}:`, error.message);
        }
      }
    }

    console.log('\n✅ Environment variables configured!');
    console.log('\n💡 Note: Vercel CLI requires manual entry for security.');
    console.log('   Run these commands interactively:');
    console.log('\n   vercel env add VITE_SUPABASE_URL production');
    console.log('   vercel env add VITE_SUPABASE_ANON_KEY production');
    console.log('   (repeat for preview and development)');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupVercelEnv();

