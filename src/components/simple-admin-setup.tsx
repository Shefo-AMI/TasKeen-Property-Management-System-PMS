import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { supabase } from '../utils/supabase'
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface SimpleAdminSetupProps {
  onComplete?: () => void
  onBack?: () => void
}

export function SimpleAdminSetup({ onComplete, onBack }: SimpleAdminSetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('shefo171@gmail.com')
  const [password, setPassword] = useState('Al-zahi2012')
  const [confirmPassword, setConfirmPassword] = useState('Al-zahi2012')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleCreateAdmin = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)
    setStatus('idle')
    
    try {
      // First try to sign in to see if account already exists
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInData.user && !signInError) {
        setStatus('success')
        toast.success('Platform admin account already exists and is working!')
        if (onComplete) {
          setTimeout(onComplete, 1500)
        }
        return
      }

      // If sign in failed, try to create the account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Platform Administrator',
            role: 'platform_admin',
            company_name: 'PropertyFlow Platform',
            company_id: 'platform',
            employee_count: 1
          }
        }
      })

      if (error) {
        console.error('Signup error:', error)
        
        if (error.message.includes('already registered')) {
          // Account exists but password is wrong
          toast.error('Account exists but password is incorrect. Please check your credentials.')
          setStatus('error')
        } else {
          toast.error(error.message || 'Failed to create admin account')
          setStatus('error')
        }
        return
      }

      if (data.user) {
        setStatus('success')
        
        if (data.user.email_confirmed_at) {
          // Account is ready to use
          toast.success('Platform admin account created and confirmed!')
        } else {
          // Email confirmation required
          toast.success('Platform admin account created! Please check your email to confirm your account.')
        }
        
        if (onComplete) {
          setTimeout(onComplete, 2000)
        }
      }

    } catch (error: any) {
      console.error('Admin creation error:', error)
      toast.error(error.message || 'Failed to create admin account')
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-white">Platform Admin Setup</CardTitle>
          <CardDescription className="text-white/80">
            Create or verify the platform administrator account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm admin password"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              disabled={isLoading}
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-100 text-sm">Admin account ready!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-100 text-sm">Setup failed. Please try again.</span>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleCreateAdmin}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Admin...
                </>
              ) : (
                'Create/Verify Admin Account'
              )}
            </Button>

            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            )}
          </div>

          <div className="text-center text-xs text-white/60">
            <p>This will create or verify the platform administrator account</p>
            <p className="mt-1">Email: {email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}