import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Zap, Mail, Key, User, Building, Users as UsersIcon } from 'lucide-react'

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (formData: any) => Promise<void>
  onShowAdminSetup?: () => void
}

// Cyber-Luxe Neon Styles
const cyberStyles = `
  @keyframes neon-pulse {
    0%, 100% {
      text-shadow: 
        0 0 10px #00ffff,
        0 0 20px #00ffff,
        0 0 30px #00ffff,
        0 0 40px #00ffff;
    }
    50% {
      text-shadow:
        0 0 20px #00ffff,
        0 0 30px #00ffff,
        0 0 40px #00ffff,
        0 0 50px #00ffff,
        0 0 60px #00ffff;
    }
  }

  @keyframes glow-border {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1);
    }
    50% {
      box-shadow: 0 0 40px rgba(0, 255, 255, 0.8), inset 0 0 30px rgba(0, 255, 255, 0.2);
    }
  }

  @keyframes border-flow {
    0%, 100% { border-color: rgba(0, 255, 255, 0.4); }
    50% { border-color: rgba(0, 255, 255, 1); }
  }

  .neon-text {
    animation: neon-pulse 2s ease-in-out infinite;
    color: #00ffff;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .cyber-card {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
    border: 2px solid rgba(0, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 255, 255, 0.15);
    animation: border-flow 3s ease-in-out infinite;
    backdrop-filter: blur(20px);
  }

  .cyber-input {
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(0, 255, 255, 0.3);
    color: #e2e8f0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cyber-input:focus {
    border-color: #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.95);
  }

  .cyber-input::placeholder {
    color: rgba(148, 163, 184, 0.5);
  }

  .cyber-button {
    background: linear-gradient(135deg, #0ea5e9 0%, #00ffff 100%);
    border: 1px solid #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .cyber-button:hover {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.4);
    transform: translateY(-2px);
  }

  .cyber-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  .cyber-button:hover::before {
    left: 100%;
  }

  .cyber-logo {
    animation: glow-border 2s ease-in-out infinite;
  }

  .cyber-tab-active {
    background: linear-gradient(135deg, #0ea5e9 0%, #00ffff 100%);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  }

  .subtitle-glow {
    color: #22d3ee;
    text-shadow: 0 0 10px rgba(6, 182, 212, 0.8);
    letter-spacing: 0.2em;
  }
`

export function AuthForm({ onLogin, onRegister, onShowAdminSetup }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    employeeCount: '',
    role: 'company_admin'
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) return

    setIsLoading(true)
    try {
      await onLogin(loginForm.email, loginForm.password)
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (!registerForm.email || !registerForm.password || !registerForm.fullName || !registerForm.companyName) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await onRegister({
        email: registerForm.email,
        password: registerForm.password,
        fullName: registerForm.fullName,
        companyName: registerForm.companyName,
        employeeCount: parseInt(registerForm.employeeCount) || 1,
        role: registerForm.role
      })
      
      // Reset form on success
      setRegisterForm({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        companyName: '',
        employeeCount: '',
        role: 'company_admin'
      })
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{cyberStyles}</style>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Cyber Logo & Title */}
          <div className="text-center mb-8 space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-50 animate-pulse"></div>
                
                {/* Logo container */}
                <div className="relative cyber-logo w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center border-2 border-cyan-500 shadow-2xl">
                  <Zap className="h-12 w-12 text-cyan-400" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Neon Title */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black neon-text tracking-wider">
                TasKeen P.M.S
              </h1>
              <p className="text-base sm:text-lg font-bold subtitle-glow">
                PROPERTY MANAGEMENT SYSTEM
              </p>
              <p className="text-sm text-slate-400 font-medium">
                Next-Generation Property Management Platform
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="cyber-card">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-cyan-500/20 p-1">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:cyber-tab-active data-[state=active]:text-white transition-all font-bold"
                >
                  SIGN IN
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:cyber-tab-active data-[state=active]:text-white transition-all font-bold"
                >
                  REGISTER
                </TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-cyan-300">Welcome Back</CardTitle>
                  <CardDescription className="text-slate-400">
                    Access your TasKeen P.M.S account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-cyan-300 font-semibold">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-400 z-10" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-10 cyber-input h-11"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-cyan-300 font-semibold">Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-cyan-400 z-10" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 cyber-input h-11"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full cyber-button text-white font-bold text-base h-12 mt-6" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'ACCESSING SYSTEM...' : 'SIGN IN'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-cyan-300">Create Account</CardTitle>
                  <CardDescription className="text-slate-400">
                    Join TasKeen P.M.S and start managing properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-cyan-300 font-semibold">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-cyan-400 z-10" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 cyber-input h-11"
                          value={registerForm.fullName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-cyan-300 font-semibold">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-400 z-10" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-10 cyber-input h-11"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-cyan-300 font-semibold">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Min. 6 chars"
                          className="cyber-input h-11"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                          minLength={6}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-cyan-300 font-semibold">Confirm</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm"
                          className="cyber-input h-11"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-company" className="text-cyan-300 font-semibold">Company Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-cyan-400 z-10" />
                        <Input
                          id="register-company"
                          type="text"
                          placeholder="Your Company Ltd."
                          className="pl-10 cyber-input h-11"
                          value={registerForm.companyName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, companyName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-employees" className="text-cyan-300 font-semibold">Team Size</Label>
                      <div className="relative">
                        <UsersIcon className="absolute left-3 top-3 h-4 w-4 text-cyan-400 z-10" />
                        <Input
                          id="register-employees"
                          type="number"
                          placeholder="Number of employees"
                          className="pl-10 cyber-input h-11"
                          value={registerForm.employeeCount}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, employeeCount: e.target.value }))}
                          min={1}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full cyber-button text-white font-bold text-base h-12 mt-6" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="px-6 pb-6">
              <p className="text-xs text-center text-slate-400 border-t border-cyan-500/20 pt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy. All rights reserved.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
