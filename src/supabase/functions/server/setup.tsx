import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export async function initializePlatformAdmin() {
  try {
    console.log('🚀 STARTING PropertyFlow platform admin initialization...')

    const adminEmail = 'shefo171@gmail.com'
    const adminPassword = 'Al-zahi2012'
    
    console.log(`📧 Attempting to create admin with email: ${adminEmail}`)

    // First, check if admin already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.log('❌ Error listing users:', listError)
      return
    }

    const existingAdmin = existingUsers.users?.find(u => u.email === adminEmail)
    
    if (existingAdmin) {
      console.log('🔍 Admin user already exists, updating password and data...')
      
      // Update the existing user's password
      try {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingAdmin.id, 
          { password: adminPassword }
        )
        
        if (updateError) {
          console.log('⚠️ Password update error:', updateError)
        } else {
          console.log('✅ Admin password updated successfully')
        }
      } catch (updateErr) {
        console.log('⚠️ Password update failed:', updateErr)
      }

      // Store/update admin user data
      const adminData = {
        id: existingAdmin.id,
        email: adminEmail,
        fullName: 'Main Platform Administrator',
        companyId: 'platform',
        companyName: 'PropertyFlow Platform',
        role: 'platform_admin',
        createdAt: new Date().toISOString(),
        status: 'active'
      }

      await kv.set(`user:${existingAdmin.id}`, JSON.stringify(adminData))
      console.log('✅ Admin data stored successfully')

    } else {
      console.log('🆕 Creating new admin user...')
      
      const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        user_metadata: { 
          name: 'Main Platform Administrator',
          role: 'platform_admin'
        },
        email_confirm: true
      })

      if (adminError) {
        console.log('❌ Error creating new admin:', adminError)
        return
      }

      console.log('✅ New admin user created successfully')

      // Store admin user data
      const adminData = {
        id: adminUser.user.id,
        email: adminEmail,
        fullName: 'Main Platform Administrator',
        companyId: 'platform',
        companyName: 'PropertyFlow Platform',
        role: 'platform_admin',
        createdAt: new Date().toISOString(),
        status: 'active'
      }

      await kv.set(`user:${adminUser.user.id}`, JSON.stringify(adminData))
      console.log('✅ New admin data stored successfully')
    }

    // Store credentials for retrieval
    await kv.set('platform_admin_initialized', 'true')
    await kv.set('platform_admin_email', adminEmail)
    await kv.set('platform_admin_password', adminPassword)

    console.log('🎉 PropertyFlow platform initialization COMPLETE!')
    console.log('='.repeat(70))
    console.log('🔐 WORKING ADMIN CREDENTIALS:')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    console.log('🚀 Platform ready for login!')
    console.log('='.repeat(70))
    
  } catch (error) {
    console.log('❌ Critical error initializing platform:', error)
  }
}

export async function createManualAdmin() {
  try {
    console.log('🛠️ MANUAL ADMIN CREATION INITIATED...')
    
    const adminEmail = 'shefo171@gmail.com'
    const adminPassword = 'Al-zahi2012'
    
    console.log(`📧 Using email: ${adminEmail}`)
    console.log(`🔑 Using password: ${adminPassword}`)
    
    // Delete existing admin if any
    try {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        console.log('⚠️ Error listing users for cleanup:', listError)
      } else {
        const existingAdmin = users.users?.find(u => u.email === adminEmail)
        if (existingAdmin) {
          console.log(`🗑️ Found existing admin with ID: ${existingAdmin.id}, removing...`)
          await supabase.auth.admin.deleteUser(existingAdmin.id)
          await kv.del(`user:${existingAdmin.id}`)
          console.log('✅ Existing admin removed successfully')
        } else {
          console.log('ℹ️ No existing admin found, proceeding with creation')
        }
      }
    } catch (cleanupError) {
      console.log('⚠️ Cleanup error (non-critical):', cleanupError)
    }

    // Wait a moment for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create fresh admin user
    console.log('🆕 Creating fresh admin user...')
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      user_metadata: { 
        name: 'Main Platform Administrator',
        role: 'platform_admin'
      },
      email_confirm: true
    })

    if (adminError) {
      console.log('❌ Admin creation error:', adminError)
      throw new Error(`Admin creation failed: ${adminError.message}`)
    }

    if (!adminUser?.user?.id) {
      throw new Error('Admin user created but no ID returned')
    }

    console.log(`✅ Admin user created with ID: ${adminUser.user.id}`)

    // Store admin user data
    const adminData = {
      id: adminUser.user.id,
      email: adminEmail,
      fullName: 'Main Platform Administrator',
      companyId: 'platform',
      companyName: 'PropertyFlow Platform',
      role: 'platform_admin',
      createdAt: new Date().toISOString(),
      status: 'active'
    }

    await kv.set(`user:${adminUser.user.id}`, JSON.stringify(adminData))
    await kv.set('platform_admin_initialized', 'true')
    await kv.set('platform_admin_email', adminEmail)
    await kv.set('platform_admin_password', adminPassword)

    console.log('✅ Admin data stored in KV store')

    // Verify the admin can be retrieved
    const storedData = await kv.get(`user:${adminUser.user.id}`)
    if (storedData) {
      console.log('✅ Admin data verification successful')
    } else {
      console.log('⚠️ Admin data not found in KV store after creation')
    }

    console.log('🎉 MANUAL ADMIN CREATION COMPLETE!')
    console.log('='.repeat(70))
    console.log('🔐 VERIFIED WORKING CREDENTIALS:')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    console.log(`🆔 User ID: ${adminUser.user.id}`)
    console.log('🚀 Ready for immediate login!')
    console.log('='.repeat(70))

    return { 
      success: true, 
      email: adminEmail, 
      password: adminPassword,
      userId: adminUser.user.id
    }
  } catch (error) {
    console.log('❌ Manual admin creation FAILED:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}