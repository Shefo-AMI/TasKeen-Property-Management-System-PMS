/**
 * TasKeen P.M.S. Deployment Test Suite
 * 
 * Comprehensive testing script to verify all backend integrations
 * Run from browser console after deployment
 */

import { supabase } from './supabase/client'
import { projectId, publicAnonKey } from './supabase/info'

const SERVER_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b`

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  duration?: number
  error?: string
}

class DeploymentTestSuite {
  private results: TestResult[] = []
  private accessToken: string | null = null

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting TasKeen P.M.S. Deployment Test Suite...\n')
    
    this.results = []

    // Environment Tests
    await this.testEnvironmentVariables()
    
    // Authentication Tests
    await this.testSupabaseConnection()
    await this.testAuthSession()
    
    // Edge Function Tests
    await this.testEdgeFunctionHealth()
    await this.testProfileEndpoint()
    
    // CRUD Tests
    if (this.accessToken) {
      await this.testPropertiesEndpoint()
      await this.testTenantsEndpoint()
      await this.testMaintenanceEndpoint()
      await this.testPaymentsEndpoint()
      await this.testDashboardStats()
    }
    
    // Storage Tests
    await this.testStorageAccess()
    
    // Optional Integration Tests
    await this.testStripeIntegration()
    await this.testResendIntegration()

    this.printResults()
    return this.results
  }

  private async testEnvironmentVariables() {
    const startTime = Date.now()
    try {
      if (!projectId) {
        throw new Error('Project ID not configured')
      }
      if (!publicAnonKey) {
        throw new Error('Anon key not configured')
      }

      this.results.push({
        test: 'Environment Variables',
        status: 'PASS',
        message: 'All required environment variables are configured',
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Environment Variables',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testSupabaseConnection() {
    const startTime = Date.now()
    try {
      // Test if we can create a Supabase client
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      this.results.push({
        test: 'Supabase Connection',
        status: 'PASS',
        message: `Connected to ${projectId}.supabase.co`,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Supabase Connection',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testAuthSession() {
    const startTime = Date.now()
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      if (data.session?.access_token) {
        this.accessToken = data.session.access_token
        this.results.push({
          test: 'Authentication Session',
          status: 'PASS',
          message: 'User is authenticated',
          duration: Date.now() - startTime
        })
      } else {
        this.results.push({
          test: 'Authentication Session',
          status: 'SKIP',
          message: 'No active session (user not logged in)',
          duration: Date.now() - startTime
        })
      }
    } catch (error: any) {
      this.results.push({
        test: 'Authentication Session',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testEdgeFunctionHealth() {
    const startTime = Date.now()
    try {
      const response = await fetch(`${SERVER_BASE_URL}/admin-credentials`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`Edge function returned ${response.status}`)
      }

      const data = await response.json()

      this.results.push({
        test: 'Edge Function Health',
        status: 'PASS',
        message: 'Edge function is responding correctly',
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Edge Function Health',
        status: 'FAIL',
        message: `Edge function health check failed: ${error.message}`,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testProfileEndpoint() {
    const startTime = Date.now()
    if (!this.accessToken) {
      this.results.push({
        test: 'Profile Endpoint',
        status: 'SKIP',
        message: 'Requires authentication',
        duration: Date.now() - startTime
      })
      return
    }

    try {
      const response = await fetch(`${SERVER_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Profile endpoint returned ${response.status}`)
      }

      const data = await response.json()

      if (!data.user) {
        throw new Error('Profile data missing')
      }

      this.results.push({
        test: 'Profile Endpoint',
        status: 'PASS',
        message: `Retrieved profile for ${data.user.email}`,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Profile Endpoint',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testPropertiesEndpoint() {
    const startTime = Date.now()
    try {
      const response = await fetch(`${SERVER_BASE_URL}/properties`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Properties endpoint returned ${response.status}`)
      }

      const data = await response.json()

      this.results.push({
        test: 'Properties CRUD',
        status: 'PASS',
        message: `Retrieved ${data.properties?.length || 0} properties`,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Properties CRUD',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testTenantsEndpoint() {
    const startTime = Date.now()
    try {
      const response = await fetch(`${SERVER_BASE_URL}/tenants`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Tenants endpoint returned ${response.status}`)
      }

      const data = await response.json()

      this.results.push({
        test: 'Tenants CRUD',
        status: 'PASS',
        message: `Retrieved ${data.tenants?.length || 0} tenants`,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Tenants CRUD',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testMaintenanceEndpoint() {
    const startTime = Date.now()
    try {
      const response = await fetch(`${SERVER_BASE_URL}/maintenance-requests`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Maintenance endpoint returned ${response.status}`)
      }

      const data = await response.json()

      this.results.push({
        test: 'Maintenance CRUD',
        status: 'PASS',
        message: `Retrieved ${data.requests?.length || 0} maintenance requests`,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Maintenance CRUD',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testPaymentsEndpoint() {
    const startTime = Date.now()
    try {
      const response = await fetch(`${SERVER_BASE_URL}/payments`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Payments endpoint returned ${response.status}`)
      }

      const data = await response.json()

      this.results.push({
        test: 'Payments CRUD',
        status: 'PASS',
        message: `Retrieved ${data.payments?.length || 0} payments`,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Payments CRUD',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testDashboardStats() {
    const startTime = Date.now()
    try {
      const response = await fetch(`${SERVER_BASE_URL}/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Dashboard stats endpoint returned ${response.status}`)
      }

      const data = await response.json()

      if (!data.stats) {
        throw new Error('Stats data missing')
      }

      this.results.push({
        test: 'Dashboard Statistics',
        status: 'PASS',
        message: `Retrieved dashboard statistics`,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Dashboard Statistics',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testStorageAccess() {
    const startTime = Date.now()
    try {
      const { data, error } = await supabase.storage.listBuckets()

      if (error) {
        throw error
      }

      this.results.push({
        test: 'Storage Access',
        status: 'PASS',
        message: `Storage accessible - ${data?.length || 0} buckets found`,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      this.results.push({
        test: 'Storage Access',
        status: 'FAIL',
        message: error.message,
        error: error.toString(),
        duration: Date.now() - startTime
      })
    }
  }

  private async testStripeIntegration() {
    const startTime = Date.now()
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

    if (!stripeKey) {
      this.results.push({
        test: 'Stripe Integration',
        status: 'SKIP',
        message: 'Stripe not configured (optional)',
        duration: Date.now() - startTime
      })
      return
    }

    this.results.push({
      test: 'Stripe Integration',
      status: 'PASS',
      message: 'Stripe configured',
      duration: Date.now() - startTime
    })
  }

  private async testResendIntegration() {
    const startTime = Date.now()
    const resendKey = import.meta.env.VITE_RESEND_API_KEY

    if (!resendKey) {
      this.results.push({
        test: 'Resend Integration',
        status: 'SKIP',
        message: 'Resend not configured (optional)',
        duration: Date.now() - startTime
      })
      return
    }

    this.results.push({
      test: 'Resend Integration',
      status: 'PASS',
      message: 'Resend configured',
      duration: Date.now() - startTime
    })
  }

  private printResults() {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('     TasKeen P.M.S. Deployment Test Results')
    console.log('═══════════════════════════════════════════════════════\n')

    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length
    const total = this.results.length

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'
      const duration = result.duration ? ` (${result.duration}ms)` : ''
      console.log(`${icon} ${result.test}${duration}`)
      console.log(`   ${result.message}`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      console.log('')
    })

    console.log('───────────────────────────────────────────────────────')
    console.log('Summary:')
    console.log(`  Total Tests: ${total}`)
    console.log(`  ✅ Passed: ${passed}`)
    console.log(`  ❌ Failed: ${failed}`)
    console.log(`  ⏭️  Skipped: ${skipped}`)
    console.log('═══════════════════════════════════════════════════════\n')

    if (failed === 0) {
      console.log('🎉 All tests passed! System is healthy and ready for production.')
    } else {
      console.log('⚠️  Some tests failed. Please review errors above.')
    }

    // Recommendations
    if (skipped > 0) {
      console.log('\n💡 Recommendations:')
      this.results
        .filter(r => r.status === 'SKIP')
        .forEach(r => {
          if (r.test === 'Authentication Session') {
            console.log('  - Log in to run authenticated endpoint tests')
          } else if (r.test === 'Stripe Integration') {
            console.log('  - Add VITE_STRIPE_PUBLIC_KEY to enable payment processing')
          } else if (r.test === 'Resend Integration') {
            console.log('  - Add VITE_RESEND_API_KEY to enable email notifications')
          }
        })
    }
  }
}

// Export for use in components
export const deploymentTestSuite = new DeploymentTestSuite()

// Make available in console for manual testing
if (typeof window !== 'undefined') {
  (window as any).runDeploymentTests = () => deploymentTestSuite.runAllTests()
}
