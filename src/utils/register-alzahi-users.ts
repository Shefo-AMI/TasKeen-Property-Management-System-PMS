/**
 * ALZAHI Users Registration Script
 * Run this script to register all ALZAHI users in Supabase
 * 
 * Usage: Import and call registerAllAlzahiUsers() after Supabase is initialized
 */

import { supabase } from './supabase/client';
import { ALZAHI_USERS } from './alzahi-company-setup';

export async function registerAlzahiUser(userData: typeof ALZAHI_USERS[0]) {
  try {
    console.log(`📝 Registering user: ${userData.email}...`);

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          company_id: userData.companyId,
          company_name: userData.companyName,
          role: userData.role,
          department: userData.department,
          status: userData.status,
          permissions: userData.permissions,
        },
        emailRedirectTo: undefined, // Skip email confirmation for internal setup
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`⚠️  User ${userData.email} already exists`);
        return { success: false, error: 'User already exists', user: null };
      }
      console.error(`❌ Error registering ${userData.email}:`, error.message);
      return { success: false, error: error.message, user: null };
    }

    console.log(`✅ Successfully registered: ${userData.email}`);
    return { success: true, error: null, user: data.user };
  } catch (error: any) {
    console.error(`❌ Exception registering ${userData.email}:`, error.message);
    return { success: false, error: error.message, user: null };
  }
}

export async function registerAllAlzahiUsers() {
  console.log('🚀 Starting ALZAHI user registration...\n');

  const results = [];

  for (const user of ALZAHI_USERS) {
    const result = await registerAlzahiUser(user);
    results.push({ email: user.email, ...result });
    // Wait a bit between registrations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Registration Summary:');
  console.log('─────────────────────────────────────');
  results.forEach(r => {
    const status = r.success ? '✅' : '⚠️';
    console.log(`${status} ${r.email}: ${r.success ? 'Registered' : r.error}`);
  });
  console.log('─────────────────────────────────────\n');

  const successCount = results.filter(r => r.success).length;
  console.log(`✅ ${successCount}/${results.length} users registered successfully`);

  return results;
}

/**
 * Login as ALZAHI user
 */
export async function loginAsAlzahiUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Logged in as: ${email}`);
    return { success: true, session: data.session };
  } catch (error: any) {
    console.error('Login exception:', error.message);
    return { success: false, error: error.message };
  }
}

// Quick access functions for testing
export const ALZAHI_QUICK_LOGIN = {
  nour: () => loginAsAlzahiUser('nour@al-zahi.ae', 'al-zahi2012'),
  mawia: () => loginAsAlzahiUser('mawia@al-zahi.ae', 'al-zahi2012'),
  tareq: () => loginAsAlzahiUser('tareq@al-zahi.ae', 'al-zahi2012'),
  ayham: () => loginAsAlzahiUser('ayham@al-zahi.ae', 'al-zahi2012'),
};

export default {
  registerAlzahiUser,
  registerAllAlzahiUsers,
  loginAsAlzahiUser,
  ALZAHI_QUICK_LOGIN,
};
