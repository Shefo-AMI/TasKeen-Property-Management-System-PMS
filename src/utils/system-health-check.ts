/**
 * TasKeen P.M.S. System Health Check
 * 
 * Comprehensive health check for all backend integrations:
 * - Supabase Auth
 * - Edge Functions (make-server-a4833a9b)
 * - Storage (if configured)
 * - Payment Gateway (if configured)
 * - Email Service (if configured)
 */

import { supabase } from './supabase/client'
import { projectId, publicAnonKey } from './supabase/info'

export interface HealthCheckResult {
  service: string
  status: 'success' | 'error' | 'warning' | 'not_configured'
  message: string
  details?: any
  timestamp: string
}

export interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'critical'
  timestamp: string
  checks: HealthCheckResult[]
  summary: {
    total: number
    success: number
    errors: number
    warnings: number
    notConfigured: number
  }
}

const SERVER_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b`

/**
 * Check if environment variables are configured
 */
function checkEnvironmentVariables(): HealthCheckResult {
  const requiredVars = {
    'Supabase URL': !!projectId,
    'Supabase Anon Key': !!publicAnonKey,
  }

  const optionalVars = {
    'Resend API Key': !!(import.meta.env.VITE_RESEND_API_KEY),
    'Stripe Public Key': !!(import.meta.env.VITE_STRIPE_PUBLIC_KEY),
  }

  const missingRequired = Object.entries(requiredVars)
    .filter(([_, exists]) => !exists)
    .map(([name]) => name)

  const missingOptional = Object.entries(optionalVars)
    .filter(([_, exists]) => !exists)
    .map(([name]) => name)

  if (missingRequired.length > 0) {
    return {
      service: 'Environment Variables',
      status: 'error',
      message: `Missing required environment variables: ${missingRequired.join(', ')}`,
      details: { required: requiredVars, optional: optionalVars },
      timestamp: new Date().toISOString()
    }
  }

  if (missingOptional.length > 0) {
    return {
      service: 'Environment Variables',
      status: 'warning',
      message: `Optional features not configured: ${missingOptional.join(', ')}`,
      details: { required: requiredVars, optional: optionalVars },
      timestamp: new Date().toISOString()
    }
  }

  return {
    service: 'Environment Variables',
    status: 'success',
    message: 'All environment variables configured',
    details: { required: requiredVars, optional: optionalVars },
    timestamp: new Date().toISOString()
  }
}

/**
 * Check Supabase connection and authentication
 */
async function checkSupabaseAuth(): Promise<HealthCheckResult> {
  try {
    console.log('🔍 Checking Supabase Auth...')

    // Try to get current session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return {
        service: 'Supabase Auth',
        status: 'error',
        message: `Auth check failed: ${error.message}`,
        details: { error },
        timestamp: new Date().toISOString()
      }
    }

    return {
      service: 'Supabase Auth',
      status: 'success',
      message: data.session ? 'Auth service working - User logged in' : 'Auth service working - No active session',
      details: {
        hasSession: !!data.session,
        projectId,
        url: `https://${projectId}.supabase.co`
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      service: 'Supabase Auth',
      status: 'error',
      message: `Auth connection failed: ${error.message}`,
      details: { error: error.toString() },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Check Edge Function availability
 */
async function checkEdgeFunction(accessToken?: string): Promise<HealthCheckResult> {
  try {
    console.log('🔍 Checking Edge Functions...')

    // Test health endpoint (or profile endpoint if authenticated)
    const endpoint = accessToken 
      ? `${SERVER_BASE_URL}/profile`
      : `${SERVER_BASE_URL}/admin-credentials`

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        service: 'Edge Functions',
        status: 'error',
        message: `Edge function responded with ${response.status}: ${errorText}`,
        details: { 
          status: response.status,
          endpoint,
          error: errorText
        },
        timestamp: new Date().toISOString()
      }
    }

    const data = await response.json()

    return {
      service: 'Edge Functions',
      status: 'success',
      message: 'Edge functions are operational',
      details: {
        endpoint,
        authenticated: !!accessToken,
        response: data
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      service: 'Edge Functions',
      status: 'error',
      message: `Edge function connection failed: ${error.message}`,
      details: { 
        error: error.toString(),
        url: SERVER_BASE_URL
      },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Check CRUD endpoints
 */
async function checkCRUDEndpoints(accessToken?: string): Promise<HealthCheckResult> {
  if (!accessToken) {
    return {
      service: 'CRUD Endpoints',
      status: 'warning',
      message: 'Cannot test CRUD endpoints - user not authenticated',
      timestamp: new Date().toISOString()
    }
  }

  try {
    console.log('🔍 Checking CRUD endpoints...')

    const endpoints = [
      '/properties',
      '/tenants',
      '/maintenance-requests',
      '/payments',
      '/dashboard-stats'
    ]

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${SERVER_BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })

          return {
            endpoint,
            status: response.status,
            ok: response.ok
          }
        } catch (error: any) {
          return {
            endpoint,
            status: 0,
            ok: false,
            error: error.message
          }
        }
      })
    )

    const failedEndpoints = results.filter(r => !r.ok)

    if (failedEndpoints.length > 0) {
      return {
        service: 'CRUD Endpoints',
        status: 'warning',
        message: `${failedEndpoints.length} of ${endpoints.length} endpoints failed`,
        details: { results },
        timestamp: new Date().toISOString()
      }
    }

    return {
      service: 'CRUD Endpoints',
      status: 'success',
      message: `All ${endpoints.length} CRUD endpoints operational`,
      details: { results },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      service: 'CRUD Endpoints',
      status: 'error',
      message: `CRUD endpoint check failed: ${error.message}`,
      details: { error: error.toString() },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Check Supabase Storage
 */
async function checkStorage(accessToken?: string): Promise<HealthCheckResult> {
  try {
    console.log('🔍 Checking Supabase Storage...')

    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return {
        service: 'Supabase Storage',
        status: 'error',
        message: `Storage check failed: ${error.message}`,
        details: { error },
        timestamp: new Date().toISOString()
      }
    }

    const taskeenBuckets = buckets?.filter(b => b.name.includes('taskeen') || b.name.includes('make-a4833a9b')) || []

    return {
      service: 'Supabase Storage',
      status: 'success',
      message: `Storage accessible - ${buckets?.length || 0} buckets found`,
      details: {
        totalBuckets: buckets?.length || 0,
        taskeenBuckets: taskeenBuckets.length,
        bucketNames: buckets?.map(b => b.name) || []
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      service: 'Supabase Storage',
      status: 'warning',
      message: `Storage check failed: ${error.message}`,
      details: { error: error.toString() },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Check Payment Integration
 */
async function checkPaymentIntegration(): Promise<HealthCheckResult> {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

  if (!stripeKey) {
    return {
      service: 'Payment Integration',
      status: 'not_configured',
      message: 'Stripe not configured - Set VITE_STRIPE_PUBLIC_KEY to enable payments',
      timestamp: new Date().toISOString()
    }
  }

  return {
    service: 'Payment Integration',
    status: 'success',
    message: 'Stripe configured',
    details: {
      stripeConfigured: true,
      publicKeyPrefix: stripeKey.substring(0, 12) + '...'
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * Check Email Service Integration
 */
async function checkEmailService(): Promise<HealthCheckResult> {
  const resendKey = import.meta.env.VITE_RESEND_API_KEY

  if (!resendKey) {
    return {
      service: 'Email Service',
      status: 'not_configured',
      message: 'Resend not configured - Set VITE_RESEND_API_KEY to enable email notifications',
      timestamp: new Date().toISOString()
    }
  }

  return {
    service: 'Email Service',
    status: 'success',
    message: 'Resend configured',
    details: {
      resendConfigured: true,
      keyPrefix: resendKey.substring(0, 12) + '...'
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * Run complete system health check
 */
export async function runSystemHealthCheck(accessToken?: string): Promise<SystemHealthReport> {
  console.log('🏥 Starting comprehensive system health check...')

  const checks: HealthCheckResult[] = []

  // Run all checks
  checks.push(checkEnvironmentVariables())
  checks.push(await checkSupabaseAuth())
  checks.push(await checkEdgeFunction(accessToken))
  checks.push(await checkCRUDEndpoints(accessToken))
  checks.push(await checkStorage(accessToken))
  checks.push(await checkPaymentIntegration())
  checks.push(await checkEmailService())

  // Calculate summary
  const summary = {
    total: checks.length,
    success: checks.filter(c => c.status === 'success').length,
    errors: checks.filter(c => c.status === 'error').length,
    warnings: checks.filter(c => c.status === 'warning').length,
    notConfigured: checks.filter(c => c.status === 'not_configured').length
  }

  // Determine overall health
  let overall: 'healthy' | 'degraded' | 'critical'
  if (summary.errors > 0) {
    overall = 'critical'
  } else if (summary.warnings > 0) {
    overall = 'degraded'
  } else {
    overall = 'healthy'
  }

  const report: SystemHealthReport = {
    overall,
    timestamp: new Date().toISOString(),
    checks,
    summary
  }

  console.log('🏥 Health check complete:', {
    overall,
    summary
  })

  return report
}

/**
 * Format health report for console display
 */
export function formatHealthReport(report: SystemHealthReport): string {
  const statusEmoji = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    not_configured: '⏭️'
  }

  const overallEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    critical: '❌'
  }

  let output = '\n'
  output += '═══════════════════════════════════════════════════════\n'
  output += '     TasKeen P.M.S. System Health Check Report\n'
  output += '═══════════════════════════════════════════════════════\n\n'
  output += `Overall Status: ${overallEmoji[report.overall]} ${report.overall.toUpperCase()}\n`
  output += `Timestamp: ${new Date(report.timestamp).toLocaleString()}\n\n`
  output += '───────────────────────────────────────────────────────\n'
  output += 'Service Checks:\n'
  output += '───────────────────────────────────────────────────────\n\n'

  report.checks.forEach((check) => {
    output += `${statusEmoji[check.status]} ${check.service}\n`
    output += `   ${check.message}\n`
    if (check.details) {
      output += `   Details: ${JSON.stringify(check.details, null, 2).split('\n').join('\n   ')}\n`
    }
    output += '\n'
  })

  output += '───────────────────────────────────────────────────────\n'
  output += 'Summary:\n'
  output += '───────────────────────────────────────────────────────\n'
  output += `Total Checks: ${report.summary.total}\n`
  output += `✅ Success: ${report.summary.success}\n`
  output += `❌ Errors: ${report.summary.errors}\n`
  output += `⚠️  Warnings: ${report.summary.warnings}\n`
  output += `⏭️  Not Configured: ${report.summary.notConfigured}\n`
  output += '═══════════════════════════════════════════════════════\n\n'

  return output
}

/**
 * Quick health check for critical services only
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const authCheck = await checkSupabaseAuth()
    const edgeFunctionCheck = await checkEdgeFunction()

    return authCheck.status === 'success' && edgeFunctionCheck.status === 'success'
  } catch (error) {
    console.error('Quick health check failed:', error)
    return false
  }
}
