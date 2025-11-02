/**
 * Supabase Setup Automation Script
 * 
 * This script automates:
 * 1. Creating admin user
 * 2. Setting user metadata
 * 3. Verifying configuration
 * 
 * Usage:
 *   - Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 *   - Run: npm run setup:supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://touwkydlhzxgwhnxpnui.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required!');
  console.log('\nTo get your service role key:');
  console.log('1. Go to: https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui');
  console.log('2. Navigate to: Settings → API');
  console.log('3. Copy the "service_role" key (NOT the anon key)');
  console.log('4. Set it as: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

// Create admin client with service role (full permissions)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ADMIN_EMAIL = 'shefo171@gmail.com';
const ADMIN_PASSWORD = 'Al-zahi2012';

async function setupSupabase() {
  console.log('🚀 Starting Supabase setup...\n');

  try {
    // Step 1: Check if user already exists
    console.log('📋 Step 1: Checking if admin user exists...');
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      throw listError;
    }

    const existingUser = existingUsers.users.find(u => u.email === ADMIN_EMAIL);

    if (existingUser) {
      console.log('✅ Admin user already exists');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Confirmed: ${existingUser.email_confirmed_at ? 'Yes' : 'No'}`);

      // Update user metadata if needed
      if (!existingUser.user_metadata?.role || existingUser.user_metadata.role !== 'platform_admin') {
        console.log('\n📝 Updating user metadata...');
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            user_metadata: {
              role: 'platform_admin',
              full_name: 'Platform Administrator',
              company_name: 'TasKeen P.M.S Platform',
              company_id: 'platform-admin',
              employee_count: 1,
              status: 'active',
            },
          }
        );

        if (updateError) {
          console.error('❌ Error updating user metadata:', updateError.message);
        } else {
          console.log('✅ User metadata updated successfully');
        }
      }

      // Confirm user if not confirmed
      if (!existingUser.email_confirmed_at) {
        console.log('\n📧 Confirming user email...');
        const { data: confirmData, error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            email_confirm: true,
          }
        );

        if (confirmError) {
          console.error('❌ Error confirming user:', confirmError.message);
        } else {
          console.log('✅ User email confirmed');
        }
      }

      // Update password if needed (optional - be careful!)
      console.log('\n✅ Admin user is ready!');
      console.log(`   Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
      return;
    }

    // Step 2: Create new admin user
    console.log('\n📋 Step 2: Creating admin user...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'platform_admin',
        full_name: 'Platform Administrator',
        company_name: 'TasKeen P.M.S Platform',
        company_id: 'platform-admin',
        employee_count: 1,
        status: 'active',
      },
    });

    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      throw createError;
    }

    if (newUser.user) {
      console.log('✅ Admin user created successfully!');
      console.log(`   User ID: ${newUser.user.id}`);
      console.log(`   Email: ${newUser.user.email}`);
      console.log(`   Confirmed: Yes`);
      console.log(`\n✅ Setup complete!`);
      console.log(`\n🔑 Login credentials:`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Verify SUPABASE_SERVICE_ROLE_KEY is correct');
    console.error('2. Check that you have admin access to the Supabase project');
    console.error('3. Ensure the project is active and accessible');
    process.exit(1);
  }
}

// Run setup
setupSupabase();

