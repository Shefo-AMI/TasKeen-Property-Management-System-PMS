import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Users, Building2, UserCheck, UserX, Settings, LogOut, Activity, Calendar, TrendingUp, Shield, HeartPulse, Rocket } from 'lucide-react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'
import { SystemHealthDashboard } from './system-health-dashboard'
import { DeploymentReadinessReport } from './deployment-readiness-report'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: string
  employeeCount?: number
  status: string
}

interface PlatformStats {
  totalUsers: number
  totalCompanies: number
  pendingRegistrations: number
  activeUsers: number
}

interface PendingRegistration {
  id: string
  email: string
  fullName: string
  companyName: string
  employeeCount: number
  role: string
  status: string
  createdAt: string
}

interface PlatformAdminDashboardProps {
  user: User
  accessToken: string | null
  onLogout: () => void
}

export function PlatformAdminDashboard({ user, accessToken, onLogout }: PlatformAdminDashboardProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPlatformStats = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/platform-stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        throw new Error('Failed to fetch platform stats')
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      toast.error('Failed to load platform statistics')
    }
  }

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/pending-registrations`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPendingRegistrations(data.registrations)
      } else {
        throw new Error('Failed to fetch pending registrations')
      }
    } catch (error) {
      console.error('Error fetching pending registrations:', error)
      toast.error('Failed to load pending registrations')
    }
  }

  const handleApproveRegistration = async (registrationId: string, approved: boolean) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a4833a9b/approve-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ registrationId, approved })
      })

      if (response.ok) {
        toast.success(approved ? 'Registration approved successfully' : 'Registration rejected')
        fetchPendingRegistrations()
        fetchPlatformStats()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to process registration')
      }
    } catch (error: any) {
      console.error('Error processing registration:', error)
      toast.error(error.message || 'Failed to process registration')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchPlatformStats(), fetchPendingRegistrations()])
      setIsLoading(false)
    }

    if (accessToken) {
      loadData()
    }
  }, [accessToken])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Administration</h1>
                <p className="text-sm text-gray-600">PropertyFlow Management Console</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-600">Platform Administrator</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Active user accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
              <p className="text-xs text-muted-foreground">Registered companies</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingRegistrations || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="registrations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registrations">Pending Registrations</TabsTrigger>
            <TabsTrigger value="health">
              <HeartPulse className="h-4 w-4 mr-2" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="deployment">
              <Rocket className="h-4 w-4 mr-2" />
              Deployment
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Pending User Registrations</CardTitle>
                <CardDescription>
                  Review and approve new user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending registrations</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Details</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{registration.fullName}</p>
                              <p className="text-sm text-gray-600">{registration.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{registration.companyName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {registration.role.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{registration.employeeCount}</TableCell>
                          <TableCell>
                            {new Date(registration.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="default">
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Registration</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to approve the registration for {registration.fullName} at {registration.companyName}?
                                      This will create their account and grant them access to the platform.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleApproveRegistration(registration.id, true)}>
                                      Approve
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <UserX className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Registration</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject the registration for {registration.fullName}?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleApproveRegistration(registration.id, false)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <SystemHealthDashboard accessToken={accessToken || undefined} />
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4">
            <DeploymentReadinessReport />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage all platform users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Company Management</CardTitle>
                <CardDescription>
                  View and manage registered companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Company management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Platform settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
