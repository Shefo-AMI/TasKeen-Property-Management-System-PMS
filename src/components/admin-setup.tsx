import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Copy, RefreshCw, CheckCircle, AlertCircle, Bug, Users } from 'lucide-react'
import { toast } from 'sonner'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AdminSetupProps {
  onComplete?: () => void
}

export function AdminSetup({ onComplete }: AdminSetupProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isGettingCredentials, setIsGettingCredentials] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const [isForceInit, setIsForceInit] = useState(false)
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const createAdmin = async () => {
    setIsCreating(true)
    setStatus('idle')
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCredentials(data.credentials)
        setStatus('success')
        toast.success('Admin account created successfully!')
        
        // Auto-copy credentials to clipboard
        try {
          await copyToClipboard(`Email: ${data.credentials.email}\nPassword: ${data.credentials.password}`)
        } catch (error) {
          console.warn('Auto-copy failed, manual copy available')
        }
        
        if (onComplete) {
          setTimeout(onComplete, 2000)
        }
      } else {
        setStatus('error')
        toast.error(data.error || 'Failed to create admin account')
      }
    } catch (error) {
      console.error('Create admin error:', error)
      setStatus('error')
      toast.error('Network error - please try again')
    } finally {
      setIsCreating(false)
    }
  }

  const getCurrentCredentials = async () => {
    setIsGettingCredentials(true)
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/admin-credentials`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setCredentials(data)
        setStatus('success')
        toast.success('Current credentials retrieved!')
      } else {
        // If server doesn't respond, show the default new credentials
        setCredentials({
          email: 'shefo171@gmail.com',
          password: 'Al-zahi2012'
        })
        setStatus('success')
        toast.success('Default admin credentials loaded!')
      }
    } catch (error) {
      console.error('Get credentials error:', error)
      // If there's a network error, show the default new credentials
      setCredentials({
        email: 'shefo171@gmail.com',
        password: 'Al-zahi2012'
      })
      setStatus('success')
      toast.success('Default admin credentials loaded!')
    } finally {
      setIsGettingCredentials(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      // Check if clipboard API is available and secure context
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
      } else {
        // Fallback method for older browsers or insecure contexts
        fallbackCopyToClipboard(text)
      }
    } catch (error) {
      console.error('Clipboard error:', error)
      // Use fallback on any error
      fallbackCopyToClipboard(text)
    }
  }

  const fallbackCopyToClipboard = (text: string) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      // Try to copy using execCommand
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        toast.success('Copied to clipboard!')
      } else {
        // If execCommand also fails, show the text in a dialog
        showTextDialog(text)
      }
    } catch (error) {
      console.error('Fallback copy error:', error)
      showTextDialog(text)
    }
  }

  const showTextDialog = (text: string) => {
    // As a last resort, show the text in an alert
    const message = `Please copy this manually:\n\n${text}`
    alert(message)
    toast.info('Please copy the credentials manually')
  }

  const debugUsers = async () => {
    setIsDebugging(true)
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/debug-users`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setDebugInfo(data)
        toast.success('Debug info retrieved!')
        console.log('Debug info:', data)
      } else {
        toast.error('Failed to get debug info')
      }
    } catch (error) {
      console.error('Debug error:', error)
      toast.error('Network error during debug')
    } finally {
      setIsDebugging(false)
    }
  }

  const forceInit = async () => {
    setIsForceInit(true)
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/force-init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Platform re-initialized! Try getting credentials now.')
        // Clear any cached data
        setCredentials(null)
        setDebugInfo(null)
        setStatus('idle')
      } else {
        toast.error('Failed to re-initialize platform')
      }
    } catch (error) {
      console.error('Force init error:', error)
      toast.error('Network error during re-initialization')
    } finally {
      setIsForceInit(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Admin Setup
          </CardTitle>
          <CardDescription className="text-white/80">
            Create or retrieve PropertyFlow admin credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!credentials && (
            <>
              <Button 
                onClick={createAdmin}
                disabled={isCreating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-2"
              >
                {isCreating ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Create Fresh Admin Account
              </Button>

              <Button 
                onClick={getCurrentCredentials}
                disabled={isGettingCredentials}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 mb-2"
              >
                {isGettingCredentials ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Get Current Credentials
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={forceInit}
                  disabled={isForceInit}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {isForceInit ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Re-init
                </Button>

                <Button 
                  onClick={debugUsers}
                  disabled={isDebugging}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {isDebugging ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Bug className="h-3 w-3 mr-1" />
                  )}
                  Debug
                </Button>
              </div>
            </>
          )}

          {credentials && (
            <div className="space-y-3">
              <div className="text-center">
                <Badge 
                  variant={status === 'success' ? 'default' : 'destructive'}
                  className="mb-4"
                >
                  {status === 'success' ? 'Admin Ready' : 'Check Required'}
                </Badge>
              </div>

              <div className="space-y-2 p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Email:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.email)}
                    className="text-white hover:bg-white/10 p-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-white break-all text-sm bg-black/20 p-2 rounded">
                  {credentials.email}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Password:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.password)}
                    className="text-white hover:bg-white/10 p-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-white break-all text-sm bg-black/20 p-2 rounded">
                  {credentials.password}
                </p>
              </div>

              <Button 
                onClick={() => copyToClipboard(`Email: ${credentials.email}\nPassword: ${credentials.password}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Both Credentials
              </Button>

              {onComplete && (
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={onComplete}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Continue to Login
                  </Button>
                  
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/sync-user`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${publicAnonKey}`,
                            'Content-Type': 'application/json'
                          }
                        })
                        
                        if (response.ok) {
                          toast.success('User data synced successfully!')
                        } else {
                          toast.error('Failed to sync user data')
                        }
                      } catch (error) {
                        toast.error('Sync failed - please try again')
                      }
                    }}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync Data
                  </Button>
                </div>
              )}
            </div>
          )}

          {debugInfo && (
            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10">
              <h4 className="text-white text-sm mb-2 flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Debug Info
              </h4>
              <div className="text-xs text-white/70 space-y-1">
                <p>Supabase Users: {debugInfo.total_supabase}</p>
                <p>KV Store Users: {debugInfo.total_kv}</p>
                {debugInfo.supabase_users?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-white/90">Users found:</p>
                    {debugInfo.supabase_users.map((user: any, index: number) => (
                      <p key={index} className="ml-2">• {user.email}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-white/60 text-center mt-4">
            Use these credentials to login as Platform Administrator
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
