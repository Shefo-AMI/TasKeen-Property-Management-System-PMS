import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'
import { initializePlatformAdmin, createManualAdmin } from './setup.tsx'

const app = new Hono()

// Initialize platform admin on startup with error handling
initializePlatformAdmin().catch(error => {
  console.log('Platform admin initialization error:', error)
})

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Helper function to verify user
async function verifyUser(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('🔍 Auth header received:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid auth header format');
      return null;
    }
    
    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      console.log('❌ No access token found');
      return null;
    }
    
    console.log('🔐 Verifying token with Supabase...');
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log('❌ Token verification error:', error.message);
      return null;
    }
    
    if (!user) {
      console.log('❌ No user found for token');
      return null;
    }
    
    console.log('✅ User verified:', { id: user.id, email: user.email });
    return user;
  } catch (error) {
    console.log('💥 Verify user error:', error);
    return null;
  }
}

// Helper function to get user role and company
async function getUserRole(userId: string) {
  const userData = await kv.get(`user:${userId}`);
  return userData ? JSON.parse(userData) : null;
}

// User Registration Route
app.post('/make-server-a4833a9b/register', async (c) => {
  try {
    const { email, password, companyName, employeeCount, fullName, role } = await c.req.json()
    
    // Create pending user registration
    const registrationId = crypto.randomUUID()
    const registrationData = {
      id: registrationId,
      email,
      password,
      companyName,
      employeeCount,
      fullName,
      role: role || 'company_admin',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    await kv.set(`registration:${registrationId}`, JSON.stringify(registrationData))
    await kv.set(`registration:email:${email}`, registrationId)
    
    return c.json({ 
      success: true, 
      message: 'Registration submitted for approval',
      registrationId 
    })
  } catch (error) {
    console.log('Registration error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// Get pending registrations (Platform Admin only)
app.get('/make-server-a4833a9b/pending-registrations', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userRole = await getUserRole(user.id)
    if (userRole?.role !== 'platform_admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const registrations = await kv.getByPrefix('registration:')
    const pendingRegs = registrations
      .filter(item => item.key.startsWith('registration:') && !item.key.includes('email:'))
      .map(item => JSON.parse(item.value))
      .filter(reg => reg.status === 'pending')
    
    return c.json({ registrations: pendingRegs })
  } catch (error) {
    console.log('Get pending registrations error:', error)
    return c.json({ error: 'Failed to fetch registrations' }, 500)
  }
})

// Approve/Reject Registration
app.post('/make-server-a4833a9b/approve-registration', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userRole = await getUserRole(user.id)
    if (userRole?.role !== 'platform_admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const { registrationId, approved } = await c.req.json()
    
    const registrationData = await kv.get(`registration:${registrationId}`)
    if (!registrationData) {
      return c.json({ error: 'Registration not found' }, 404)
    }
    
    const registration = JSON.parse(registrationData)
    
    if (approved) {
      // Create the user account
      const companyId = crypto.randomUUID()
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: registration.email,
        password: registration.password,
        user_metadata: { 
          name: registration.fullName,
          companyId: companyId,
          role: registration.role
        },
        email_confirm: true
      })
      
      if (error) {
        console.log('User creation error:', error)
        return c.json({ error: 'Failed to create user account' }, 500)
      }
      
      // Store user data
      const userData = {
        id: newUser.user.id,
        email: registration.email,
        fullName: registration.fullName,
        companyId: companyId,
        companyName: registration.companyName,
        role: registration.role,
        employeeCount: registration.employeeCount,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      
      await kv.set(`user:${newUser.user.id}`, JSON.stringify(userData))
      await kv.set(`company:${companyId}`, JSON.stringify({
        id: companyId,
        name: registration.companyName,
        adminId: newUser.user.id,
        employeeCount: registration.employeeCount,
        createdAt: new Date().toISOString()
      }))
      
      // Update registration status
      registration.status = 'approved'
      registration.approvedAt = new Date().toISOString()
      await kv.set(`registration:${registrationId}`, JSON.stringify(registration))
      
      return c.json({ success: true, message: 'User approved and created' })
    } else {
      // Reject registration
      registration.status = 'rejected'
      registration.rejectedAt = new Date().toISOString()
      await kv.set(`registration:${registrationId}`, JSON.stringify(registration))
      
      return c.json({ success: true, message: 'Registration rejected' })
    }
  } catch (error) {
    console.log('Approve registration error:', error)
    return c.json({ error: 'Failed to process registration' }, 500)
  }
})

// Get user profile
app.get('/make-server-a4833a9b/profile', async (c) => {
  try {
    console.log('📱 Profile request received');
    
    const user = await verifyUser(c.req.raw)
    if (!user) {
      console.log('❌ User verification failed - returning 401');
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    console.log('👤 Looking up user data for:', user.id);
    const userData = await getUserRole(user.id)
    
    if (!userData) {
      console.log('❌ No user data found in KV store, creating from auth data...');
      
      // Try to create user data from auth information if missing
      const defaultUserData = {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.name || user.email,
        companyId: user.user_metadata?.role === 'platform_admin' ? 'platform' : 'unknown',
        companyName: user.user_metadata?.role === 'platform_admin' ? 'PropertyFlow Platform' : 'Unknown Company',
        role: user.user_metadata?.role || 'employee',
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      
      // Store the default data
      await kv.set(`user:${user.id}`, JSON.stringify(defaultUserData))
      console.log('✅ Created default user data');
      
      return c.json({ user: defaultUserData })
    }
    
    console.log('✅ User data found, returning profile');
    return c.json({ user: userData })
  } catch (error) {
    console.log('💥 Get profile error:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// Properties CRUD
app.get('/make-server-a4833a9b/properties', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const properties = await kv.getByPrefix(`property:${companyId}:`)
    const propertyList = properties.map(item => JSON.parse(item.value))
    
    return c.json({ properties: propertyList })
  } catch (error) {
    console.log('Get properties error:', error)
    return c.json({ error: 'Failed to fetch properties' }, 500)
  }
})

app.post('/make-server-a4833a9b/properties', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const propertyData = await c.req.json()
    const propertyId = crypto.randomUUID()
    
    const property = {
      id: propertyId,
      companyId,
      ...propertyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`property:${companyId}:${propertyId}`, JSON.stringify(property))
    
    return c.json({ success: true, property })
  } catch (error) {
    console.log('Create property error:', error)
    return c.json({ error: 'Failed to create property' }, 500)
  }
})

// Tenants CRUD
app.get('/make-server-a4833a9b/tenants', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const tenants = await kv.getByPrefix(`tenant:${companyId}:`)
    const tenantList = tenants.map(item => JSON.parse(item.value))
    
    return c.json({ tenants: tenantList })
  } catch (error) {
    console.log('Get tenants error:', error)
    return c.json({ error: 'Failed to fetch tenants' }, 500)
  }
})

app.post('/make-server-a4833a9b/tenants', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const tenantData = await c.req.json()
    const tenantId = crypto.randomUUID()
    
    const tenant = {
      id: tenantId,
      companyId,
      ...tenantData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`tenant:${companyId}:${tenantId}`, JSON.stringify(tenant))
    
    return c.json({ success: true, tenant })
  } catch (error) {
    console.log('Create tenant error:', error)
    return c.json({ error: 'Failed to create tenant' }, 500)
  }
})

// Maintenance Requests
app.get('/make-server-a4833a9b/maintenance-requests', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const requests = await kv.getByPrefix(`maintenance:${companyId}:`)
    const requestList = requests.map(item => JSON.parse(item.value))
    
    return c.json({ requests: requestList })
  } catch (error) {
    console.log('Get maintenance requests error:', error)
    return c.json({ error: 'Failed to fetch maintenance requests' }, 500)
  }
})

app.post('/make-server-a4833a9b/maintenance-requests', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const requestData = await c.req.json()
    const requestId = crypto.randomUUID()
    
    const maintenanceRequest = {
      id: requestId,
      companyId,
      ...requestData,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`maintenance:${companyId}:${requestId}`, JSON.stringify(maintenanceRequest))
    
    return c.json({ success: true, request: maintenanceRequest })
  } catch (error) {
    console.log('Create maintenance request error:', error)
    return c.json({ error: 'Failed to create maintenance request' }, 500)
  }
})

// Payments and Invoices
app.get('/make-server-a4833a9b/payments', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const payments = await kv.getByPrefix(`payment:${companyId}:`)
    const paymentList = payments.map(item => JSON.parse(item.value))
    
    return c.json({ payments: paymentList })
  } catch (error) {
    console.log('Get payments error:', error)
    return c.json({ error: 'Failed to fetch payments' }, 500)
  }
})

app.post('/make-server-a4833a9b/payments', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const paymentData = await c.req.json()
    const paymentId = crypto.randomUUID()
    
    const payment = {
      id: paymentId,
      companyId,
      ...paymentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`payment:${companyId}:${paymentId}`, JSON.stringify(payment))
    
    return c.json({ success: true, payment })
  } catch (error) {
    console.log('Create payment error:', error)
    return c.json({ error: 'Failed to create payment' }, 500)
  }
})

// Reminders
app.get('/make-server-a4833a9b/reminders', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const reminders = await kv.getByPrefix(`reminder:${companyId}:`)
    const reminderList = reminders.map(item => JSON.parse(item.value))
    
    return c.json({ reminders: reminderList })
  } catch (error) {
    console.log('Get reminders error:', error)
    return c.json({ error: 'Failed to fetch reminders' }, 500)
  }
})

app.post('/make-server-a4833a9b/reminders', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const reminderData = await c.req.json()
    const reminderId = crypto.randomUUID()
    
    const reminder = {
      id: reminderId,
      companyId,
      ...reminderData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`reminder:${companyId}:${reminderId}`, JSON.stringify(reminder))
    
    return c.json({ success: true, reminder })
  } catch (error) {
    console.log('Create reminder error:', error)
    return c.json({ error: 'Failed to create reminder' }, 500)
  }
})

// Dashboard statistics
app.get('/make-server-a4833a9b/dashboard-stats', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    // Get counts for dashboard
    const properties = await kv.getByPrefix(`property:${companyId}:`)
    const tenants = await kv.getByPrefix(`tenant:${companyId}:`)
    const maintenanceRequests = await kv.getByPrefix(`maintenance:${companyId}:`)
    const payments = await kv.getByPrefix(`payment:${companyId}:`)
    
    const stats = {
      totalProperties: properties.length,
      totalTenants: tenants.length,
      openMaintenanceRequests: maintenanceRequests.filter(req => 
        JSON.parse(req.value).status === 'open'
      ).length,
      totalPayments: payments.length,
      monthlyRevenue: payments
        .map(p => JSON.parse(p.value))
        .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    }
    
    return c.json({ stats })
  } catch (error) {
    console.log('Get dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
  }
})

// Platform admin stats
app.get('/make-server-a4833a9b/platform-stats', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userRole = await getUserRole(user.id)
    if (userRole?.role !== 'platform_admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const users = await kv.getByPrefix('user:')
    const companies = await kv.getByPrefix('company:')
    const registrations = await kv.getByPrefix('registration:')
    
    const pendingRegistrations = registrations
      .filter(item => !item.key.includes('email:'))
      .map(item => JSON.parse(item.value))
      .filter(reg => reg.status === 'pending')
    
    const stats = {
      totalUsers: users.length,
      totalCompanies: companies.length,
      pendingRegistrations: pendingRegistrations.length,
      activeUsers: users.filter(u => JSON.parse(u.value).status === 'active').length
    }
    
    return c.json({ stats })
  } catch (error) {
    console.log('Get platform stats error:', error)
    return c.json({ error: 'Failed to fetch platform stats' }, 500)
  }
})

// Manual admin creation route (for troubleshooting)
app.post('/make-server-a4833a9b/create-admin', async (c) => {
  try {
    console.log('🛠️ Manual admin creation requested')
    const result = await createManualAdmin()
    
    if (result.success) {
      return c.json({ 
        success: true, 
        message: 'Admin created successfully',
        credentials: {
          email: result.email,
          password: result.password
        }
      })
    } else {
      return c.json({ 
        success: false, 
        error: result.error 
      }, 500)
    }
  } catch (error) {
    console.log('Manual admin creation route error:', error)
    return c.json({ error: 'Failed to create admin' }, 500)
  }
})

// Get current admin credentials
app.get('/make-server-a4833a9b/admin-credentials', async (c) => {
  try {
    const email = await kv.get('platform_admin_email')
    const password = await kv.get('platform_admin_password')
    
    return c.json({
      email: email || 'shefo171@gmail.com',
      password: password || 'Al-zahi2012',
      note: 'These are the current platform admin credentials'
    })
  } catch (error) {
    console.log('Get admin credentials error:', error)
    return c.json({ error: 'Failed to fetch credentials' }, 500)
  }
})

// Sync user data from auth to KV store
app.post('/make-server-a4833a9b/sync-user', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    console.log('🔄 Syncing user data for:', user.email)
    
    // Create comprehensive user data
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      companyId: user.user_metadata?.role === 'platform_admin' ? 'platform' : 'company_' + user.id.slice(0, 8),
      companyName: user.user_metadata?.role === 'platform_admin' ? 'PropertyFlow Platform' : 'User Company',
      role: user.user_metadata?.role || 'employee',
      employeeCount: user.user_metadata?.role === 'platform_admin' ? 0 : 1,
      createdAt: user.created_at || new Date().toISOString(),
      status: 'active'
    }
    
    await kv.set(`user:${user.id}`, JSON.stringify(userData))
    console.log('✅ User data synced successfully')
    
    return c.json({ success: true, user: userData })
  } catch (error) {
    console.log('Sync user error:', error)
    return c.json({ error: 'Failed to sync user data' }, 500)
  }
})

// Debug route to check users
app.get('/make-server-a4833a9b/debug-users', async (c) => {
  try {
    console.log('🔍 Debug: Listing all users...')
    
    const { data: users, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.log('❌ Error listing users:', error)
      return c.json({ error: error.message }, 500)
    }

    const userList = users.users?.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      user_metadata: user.user_metadata
    })) || []

    console.log(`📊 Found ${userList.length} users`)
    userList.forEach(user => {
      console.log(`👤 User: ${user.email} (ID: ${user.id})`)
    })

    // Also check KV store for user data
    const kvUsers = await kv.getByPrefix('user:')
    console.log(`📦 Found ${kvUsers.length} users in KV store`)

    return c.json({
      supabase_users: userList,
      kv_users: kvUsers.map(item => ({
        key: item.key,
        value: JSON.parse(item.value)
      })),
      total_supabase: userList.length,
      total_kv: kvUsers.length
    })
  } catch (error) {
    console.log('Debug users error:', error)
    return c.json({ error: 'Failed to debug users' }, 500)
  }
})

// Force admin initialization
app.post('/make-server-a4833a9b/force-init', async (c) => {
  try {
    console.log('🔄 Force initialization requested...')
    await initializePlatformAdmin()
    return c.json({ success: true, message: 'Platform re-initialized' })
  } catch (error) {
    console.log('Force init error:', error)
    return c.json({ error: 'Failed to force initialize' }, 500)
  }
})

// =================== ACCOUNTING SYSTEM ENDPOINTS ===================

// Invoices CRUD
app.get('/make-server-a4833a9b/accounting/invoices', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const invoices = await kv.getByPrefix(`invoice:${companyId}:`)
    const invoiceList = invoices.map(item => JSON.parse(item.value))
    
    return c.json({ invoices: invoiceList })
  } catch (error) {
    console.log('Get invoices error:', error)
    return c.json({ error: 'Failed to fetch invoices' }, 500)
  }
})

app.post('/make-server-a4833a9b/accounting/invoices', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const invoiceData = await c.req.json()
    const invoiceId = crypto.randomUUID()
    
    const invoice = {
      id: invoiceId,
      companyId,
      ...invoiceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`invoice:${companyId}:${invoiceId}`, JSON.stringify(invoice))
    
    return c.json({ success: true, invoice })
  } catch (error) {
    console.log('Create invoice error:', error)
    return c.json({ error: 'Failed to create invoice' }, 500)
  }
})

// Invoice Templates CRUD
app.get('/make-server-a4833a9b/accounting/templates', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const templates = await kv.getByPrefix(`template:${companyId}:`)
    const templateList = templates.map(item => JSON.parse(item.value))
    
    return c.json({ templates: templateList })
  } catch (error) {
    console.log('Get templates error:', error)
    return c.json({ error: 'Failed to fetch templates' }, 500)
  }
})

app.post('/make-server-a4833a9b/accounting/templates', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const templateData = await c.req.json()
    const templateId = crypto.randomUUID()
    
    const template = {
      id: templateId,
      companyId,
      ...templateData,
      isDefault: false, // Set first template as default if none exists
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Check if this is the first template
    const existingTemplates = await kv.getByPrefix(`template:${companyId}:`)
    if (existingTemplates.length === 0) {
      template.isDefault = true
    }
    
    await kv.set(`template:${companyId}:${templateId}`, JSON.stringify(template))
    
    return c.json({ success: true, template })
  } catch (error) {
    console.log('Create template error:', error)
    return c.json({ error: 'Failed to create template' }, 500)
  }
})

// Maintenance Tickets for Invoicing
app.get('/make-server-a4833a9b/accounting/maintenance-tickets', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    // Get maintenance requests and add mock photo data for invoicing
    const maintenanceRequests = await kv.getByPrefix(`maintenance:${companyId}:`)
    const ticketList = maintenanceRequests.map(item => {
      const ticket = JSON.parse(item.value)
      return {
        ...ticket,
        beforePhotos: ticket.beforePhotos || [],
        afterPhotos: ticket.afterPhotos || [],
        completedAt: ticket.status === 'completed' ? ticket.updatedAt : null
      }
    })
    
    return c.json({ tickets: ticketList })
  } catch (error) {
    console.log('Get maintenance tickets error:', error)
    return c.json({ error: 'Failed to fetch maintenance tickets' }, 500)
  }
})

// Create invoice from maintenance ticket
app.post('/make-server-a4833a9b/accounting/maintenance/:ticketId/invoice', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const ticketId = c.req.param('ticketId')
    const ticketData = await kv.get(`maintenance:${companyId}:${ticketId}`)
    
    if (!ticketData) {
      return c.json({ error: 'Maintenance ticket not found' }, 404)
    }
    
    const ticket = JSON.parse(ticketData)
    
    if (ticket.status !== 'completed') {
      return c.json({ error: 'Ticket must be completed before invoicing' }, 400)
    }
    
    if (ticket.invoiceId) {
      return c.json({ error: 'Invoice already exists for this ticket' }, 400)
    }
    
    // Create invoice for the maintenance work
    const invoiceId = crypto.randomUUID()
    const invoice = {
      id: invoiceId,
      companyId,
      invoiceNumber: `MAINT-${Date.now()}`,
      clientName: `Property Maintenance - ${ticket.propertyId}`,
      clientEmail: 'maintenance@property.com',
      amount: 500, // Default maintenance cost - can be customized
      currency: 'AED',
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{
        id: crypto.randomUUID(),
        description: ticket.title,
        quantity: 1,
        rate: 500,
        amount: 500
      }],
      notes: `Maintenance work completed: ${ticket.description}`,
      propertyId: ticket.propertyId,
      tenantId: ticket.tenantId,
      maintenanceTicketId: ticketId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`invoice:${companyId}:${invoiceId}`, JSON.stringify(invoice))
    
    // Update ticket with invoice ID
    ticket.invoiceId = invoiceId
    ticket.updatedAt = new Date().toISOString()
    await kv.set(`maintenance:${companyId}:${ticketId}`, JSON.stringify(ticket))
    
    return c.json({ success: true, invoice, ticket })
  } catch (error) {
    console.log('Create maintenance invoice error:', error)
    return c.json({ error: 'Failed to create maintenance invoice' }, 500)
  }
})

// Send invoice by email
app.post('/make-server-a4833a9b/accounting/invoices/:invoiceId/send', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const invoiceId = c.req.param('invoiceId')
    const invoiceData = await kv.get(`invoice:${companyId}:${invoiceId}`)
    
    if (!invoiceData) {
      return c.json({ error: 'Invoice not found' }, 404)
    }
    
    const invoice = JSON.parse(invoiceData)
    
    // Update invoice status to sent
    invoice.status = 'sent'
    invoice.sentAt = new Date().toISOString()
    invoice.updatedAt = new Date().toISOString()
    
    await kv.set(`invoice:${companyId}:${invoiceId}`, JSON.stringify(invoice))
    
    // In a real implementation, you would send the email here
    console.log(`📧 Invoice ${invoice.invoiceNumber} sent to ${invoice.clientEmail}`)
    
    return c.json({ success: true, message: 'Invoice sent successfully' })
  } catch (error) {
    console.log('Send invoice error:', error)
    return c.json({ error: 'Failed to send invoice' }, 500)
  }
})

// Export invoice
app.get('/make-server-a4833a9b/accounting/invoices/:invoiceId/export', async (c) => {
  try {
    const user = await verifyUser(c.req.raw)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const userData = await getUserRole(user.id)
    const companyId = userData?.companyId
    
    if (!companyId) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    const invoiceId = c.req.param('invoiceId')
    const format = c.req.query('format') || 'pdf'
    
    const invoiceData = await kv.get(`invoice:${companyId}:${invoiceId}`)
    
    if (!invoiceData) {
      return c.json({ error: 'Invoice not found' }, 404)
    }
    
    const invoice = JSON.parse(invoiceData)
    
    // For demo purposes, return the invoice data
    // In a real implementation, you would generate the actual file
    const exportData = {
      invoice,
      format,
      exportedAt: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.${format}"`
      }
    })
  } catch (error) {
    console.log('Export invoice error:', error)
    return c.json({ error: 'Failed to export invoice' }, 500)
  }
})

Deno.serve(app.fetch)