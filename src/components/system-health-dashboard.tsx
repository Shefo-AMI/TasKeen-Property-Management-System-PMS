import React, { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, Info, Play } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { runSystemHealthCheck, formatHealthReport, type SystemHealthReport } from '../utils/system-health-check'
import { toast } from 'sonner@2.0.3'

interface SystemHealthDashboardProps {
  accessToken?: string
}

export function SystemHealthDashboard({ accessToken }: SystemHealthDashboardProps) {
  const [healthReport, setHealthReport] = useState<SystemHealthReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const runHealthCheck = async () => {
    setIsLoading(true)
    try {
      const report = await runSystemHealthCheck(accessToken)
      setHealthReport(report)
      
      // Log to console
      console.log(formatHealthReport(report))
      
      // Show toast notification
      if (report.overall === 'healthy') {
        toast.success('All systems operational!')
      } else if (report.overall === 'degraded') {
        toast.warning('Some services need attention')
      } else {
        toast.error('Critical issues detected')
      }
    } catch (error: any) {
      console.error('Health check failed:', error)
      toast.error(`Health check failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Run initial health check
    runHealthCheck()

    // Auto-refresh every 5 minutes if enabled
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(() => {
        runHealthCheck()
      }, 5 * 60 * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, accessToken])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'not_configured':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Success</Badge>
      case 'error':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Error</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Warning</Badge>
      case 'not_configured':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Not Configured</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getOverallStatusColor = (overall: string) => {
    switch (overall) {
      case 'healthy':
        return 'text-green-500'
      case 'degraded':
        return 'text-yellow-500'
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl tracking-tight">System Health Check</h2>
          <p className="text-muted-foreground mt-2">
            Monitor all backend integrations and services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable Auto-Refresh' : 'Enable Auto-Refresh'}
          </Button>
          <Button
            onClick={runHealthCheck}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Run Health Check
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      {healthReport && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall System Status</CardTitle>
                <CardDescription>
                  Last checked: {new Date(healthReport.timestamp).toLocaleString()}
                </CardDescription>
              </div>
              <div className={`text-4xl font-bold ${getOverallStatusColor(healthReport.overall)}`}>
                {healthReport.overall.toUpperCase()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{healthReport.summary.total}</div>
                <div className="text-sm text-muted-foreground">Total Checks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{healthReport.summary.success}</div>
                <div className="text-sm text-muted-foreground">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{healthReport.summary.warnings}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{healthReport.summary.errors}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Checks */}
      {healthReport && (
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Detailed status of all backend services</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {healthReport.checks.map((check, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <div className="font-medium">{check.service}</div>
                          <div className="text-sm text-muted-foreground mt-1">{check.message}</div>
                          {check.details && (
                            <details className="mt-2">
                              <summary className="text-sm text-primary cursor-pointer hover:underline">
                                View Details
                              </summary>
                              <pre className="text-xs bg-muted p-3 rounded-md mt-2 overflow-x-auto">
                                {JSON.stringify(check.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                    {index < healthReport.checks.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      {healthReport && healthReport.summary.notConfigured > 0 && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Optional Services Not Configured
            </CardTitle>
            <CardDescription>
              These services are optional but recommended for full functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthReport.checks
              .filter(c => c.status === 'not_configured')
              .map((check, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium">{check.service}</h4>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                  {check.service === 'Payment Integration' && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">To enable Stripe payments:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Sign up at <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com</a></li>
                        <li>Get your publishable key from the Stripe Dashboard</li>
                        <li>Add <code className="bg-muted px-2 py-1 rounded">VITE_STRIPE_PUBLIC_KEY</code> to your environment variables</li>
                      </ol>
                    </div>
                  )}
                  {check.service === 'Email Service' && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">To enable Resend email notifications:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a></li>
                        <li>Create an API key from your dashboard</li>
                        <li>Add <code className="bg-muted px-2 py-1 rounded">VITE_RESEND_API_KEY</code> to your environment variables</li>
                      </ol>
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tests</CardTitle>
          <CardDescription>Run specific integration tests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              toast.info('Opening Supabase dashboard...')
              window.open('https://supabase.com/dashboard/project/touwkydlhzxgwhnxpnui', '_blank')
            }}
          >
            <Play className="h-4 w-4" />
            Open Supabase Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              const report = healthReport ? formatHealthReport(healthReport) : 'No health report available'
              console.log(report)
              toast.success('Health report logged to console')
            }}
          >
            <Play className="h-4 w-4" />
            Log Full Report to Console
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
