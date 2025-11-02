/**
 * Quick Admin User Creation Script
 * Uses Supabase REST API directly
 * 
 * Run: node scripts/create-admin-user.js
 * 
 * You'll need to set SUPABASE_SERVICE_ROLE_KEY environment variable
 */

const SUPABASE_URL = 'https://touwkydlhzxgwhnxpnui.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = 'shefo171@gmail.com';
const ADMIN_PASSWORD = 'Al-zahi2012';

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required!');
  console.log('\n📋 Get it from:');
  console.log('   https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui/settings/api');
  console.log('\n💡 Then run:');
  console.log(`   $env:SUPABASE_SERVICE_ROLE_KEY="your_key_here"`);
  console.log('   node scripts/create-admin-user.js');
  process.exit(1);
}

async function createAdminUser() {
  console.log('🚀 Creating admin user via Supabase API...\n');

  try {
    // First, check if user already exists
    console.log('📋 Checking if user already exists...');
    const checkResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
    });

    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      const existingUser = checkData.users?.find(u => u.email === ADMIN_EMAIL);
      
      if (existingUser) {
        console.log('✅ User already exists!');
        console.log(`   User ID: ${existingUser.id}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Confirmed: ${existingUser.email_confirmed_at ? 'Yes' : 'No'}`);
        
        // Update user metadata and confirm email
        console.log('\n📝 Updating user metadata and confirming email...');
        const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            user_metadata: {
              role: 'platform_admin',
              full_name: 'Platform Administrator',
              company_name: 'TasKeen P.M.S Platform',
              company_id: 'platform-admin',
              employee_count: 1,
              status: 'active',
            },
            email_confirm: true,
          }),
        });

        if (updateResponse.ok) {
          console.log('✅ User updated successfully!');
        }
        
        console.log('\n🔑 Login credentials:');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('\n✅ You can now log in to the app!');
        return;
      }
    }

    // Create new user via Auth Admin API
    console.log('📝 Creating new admin user...');
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          role: 'platform_admin',
          full_name: 'Platform Administrator',
          company_name: 'TasKeen P.M.S Platform',
          company_id: 'platform-admin',
          employee_count: 1,
          status: 'active',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error response:', JSON.stringify(data, null, 2));
      if (data.message?.includes('already registered') || data.msg?.includes('already')) {
        console.log('\n✅ User already exists!');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log('\n💡 User exists but may need password reset. Check Supabase dashboard.');
        return;
      }
      throw new Error(data.message || data.msg || `HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    console.log('✅ Admin user created successfully!');
    console.log(`   User ID: ${data.id || data.user?.id}`);
    console.log(`   Email: ${data.email || data.user?.email}`);
    console.log(`   Confirmed: ${(data.email_confirmed_at || data.user?.email_confirmed_at) ? 'Yes' : 'No'}`);
    console.log('\n🔑 Login credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n✅ You can now log in to the app!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Verify SUPABASE_SERVICE_ROLE_KEY is correct');
    console.error('2. Check internet connection');
    console.error('3. Ensure Supabase project is active');
    console.error('4. Check Supabase dashboard for user status');
    process.exit(1);
  }
}

createAdminUser();

