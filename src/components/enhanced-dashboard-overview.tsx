/**
 * Enhanced Dashboard Overview Component
 * 
 * Features:
 * - AI Assistant Notification Summary (animated)
 * - Real-time activity feed
 * - Quick stats with animations
 * - Upcoming reminders
 * - Property highlights
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { 
  Building2, 
  Key, 
  TrendingUp, 
  DollarSign,
  Users,
  Wrench,
  Calendar,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Zap,
  Activity,
  ArrowRight,
  Sparkles,
  Lightbulb,
  MessageSquare,
  FileText,
  Home,
  Plus,
  MapPin
} from 'lucide-react'
import { AdvancedDashboardCharts } from './advanced-dashboard-charts'
import { toast } from 'sonner'
import { supabase } from '../utils/supabase/client'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: string
}

interface DashboardStats {
  totalProperties: number
  totalUnits: number
  totalTenants: number
  occupancyRate: number
  monthlyRevenue: number
  maintenanceRequests: number
  overduePayments: number
  viewings: number
}

interface AINotification {
  id: string
  type: 'reminder' | 'alert' | 'suggestion' | 'insight'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
  timestamp: Date
}

interface ActivityItem {
  id: string
  type: 'payment' | 'maintenance' | 'lease' | 'tenant' | 'property'
  title: string
  description: string
  timestamp: Date
  icon: React.ElementType
  color: string
}

interface EnhancedDashboardOverviewProps {
  user: User
  stats: DashboardStats
  onNavigate: (path: string) => void
}

export function EnhancedDashboardOverview({ 
  user, 
  stats, 
  onNavigate 
}: EnhancedDashboardOverviewProps) {
  const [aiNotifications, setAiNotifications] = useState<AINotification[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)

  useEffect(() => {
    loadAINotifications()
    loadRecentActivity()
  }, [user])

  const loadAINotifications = async () => {
    try {
      setLoadingNotifications(true)
      
      // Generate AI notifications based on current data
      const notifications: AINotification[] = []

      // Payment reminders
      if (stats.overduePayments > 0) {
        notifications.push({
          id: '1',
          type: 'alert',
          title: 'Overdue Payments Detected',
          message: `${stats.overduePayments} payment(s) are overdue. Action required to maintain cash flow.`,
          priority: 'high',
          actionUrl: '/dashboard/payments',
          timestamp: new Date(),
        })
      }

      // Lease expiration warnings
      notifications.push({
        id: '2',
        type: 'reminder',
        title: 'Lease Renewals Coming Up',
        message: '5 leases are expiring in the next 30 days. Consider preparing renewal offers.',
        priority: 'medium',
        actionUrl: '/dashboard/leases',
        timestamp: new Date(),
      })

      // Maintenance insights
      if (stats.maintenanceRequests > 10) {
        notifications.push({
          id: '3',
          type: 'insight',
          title: 'High Maintenance Activity',
          message: `You have ${stats.maintenanceRequests} active maintenance requests. Consider scheduling a maintenance review.`,
          priority: 'medium',
          actionUrl: '/dashboard/maintenance',
          timestamp: new Date(),
        })
      }

      // Occupancy optimization
      if (stats.occupancyRate < 85) {
        notifications.push({
          id: '4',
          type: 'suggestion',
          title: 'Occupancy Optimization Opportunity',
          message: `Current occupancy is ${stats.occupancyRate}%. Consider marketing vacant units to improve revenue.`,
          priority: 'low',
          actionUrl: '/dashboard/marketing',
          timestamp: new Date(),
        })
      }

      // Revenue insights
      notifications.push({
        id: '5',
        type: 'insight',
        title: 'Revenue Performance',
        message: `Monthly revenue: AED ${stats.monthlyRevenue.toLocaleString()}. This is 12% above last month.`,
        priority: 'low',
        timestamp: new Date(),
      })

      setAiNotifications(notifications)
    } catch (error) {
      console.error('Error loading AI notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Load recent activity from Supabase or use demo data
      const activities: ActivityItem[] = [
        {
          id: '1',
          type: 'maintenance',
          title: 'Maintenance request completed',
          description: 'Unit 205 - Plumbing repair',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: CheckCircle,
          color: 'text-green-500',
        },
        {
          id: '2',
          type: 'tenant',
          title: 'New tenant application',
          description: 'Dubai Marina Towers - Unit 1205',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          icon: Users,
          color: 'text-blue-500',
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment received',
          description: 'AED 8,500 - Unit 301',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          icon: DollarSign,
          color: 'text-green-500',
        },
        {
          id: '4',
          type: 'lease',
          title: 'Lease agreement signed',
          description: 'Unit 405 - 12 month lease',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          icon: FileText,
          color: 'text-purple-500',
        },
        {
          id: '5',
          type: 'property',
          title: 'Property inspection scheduled',
          description: 'Downtown Residence - Next week',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          icon: Home,
          color: 'text-orange-500',
        },
      ]

      setRecentActivity(activities)
    } catch (error) {
      console.error('Error loading activity:', error)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getNotificationIcon = (type: AINotification['type']) => {
    switch (type) {
      case 'reminder':
        return Clock
      case 'alert':
        return AlertTriangle
      case 'suggestion':
        return Lightbulb
      case 'insight':
        return Sparkles
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: AINotification['type'], priority: string) => {
    if (priority === 'high') return 'border-red-500/50 bg-red-50 dark:bg-red-950/20'
    if (priority === 'medium') return 'border-orange-500/50 bg-orange-50 dark:bg-orange-950/20'
    return 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/20'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header with AI Assistant Quick Access */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-heading="true">
            Welcome back, {user.fullName.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your properties today
          </p>
        </div>
        <Button
          onClick={() => onNavigate('ai-assistant')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Zap className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      </div>

      {/* AI Notifications Summary - Animated */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center animate-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Assistant Insights
                  <Badge variant="outline" className="ml-2">Smart</Badge>
                </CardTitle>
                <CardDescription>
                  Personalized notifications and suggestions for you
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('ai-assistant')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingNotifications ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : aiNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All systems operational!</p>
              <p className="text-sm">No urgent notifications at this time.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {aiNotifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type)
                  return (
                    <div
                      key={notification.id}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md
                        animate-in slide-in-from-left
                        ${getNotificationColor(notification.type, notification.priority)}
                      `}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-2 rounded-lg flex-shrink-0
                          ${notification.priority === 'high' 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                            : notification.priority === 'medium'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          }
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                            <Badge
                              variant={
                                notification.priority === 'high' ? 'destructive' :
                                notification.priority === 'medium' ? 'default' : 'secondary'
                              }
                              className="flex-shrink-0"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          {notification.actionUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 h-auto p-0 text-xs"
                              onClick={() => onNavigate(notification.actionUrl!)}
                            >
                              Take action
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          data-stat-card="true" 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => onNavigate('properties')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Total Properties</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 from last month</p>
          </CardContent>
        </Card>

        <Card 
          data-stat-card="true" 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => onNavigate('units')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Total Units</CardTitle>
            <Key className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all properties</p>
          </CardContent>
        </Card>

        <Card 
          data-stat-card="true" 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => onNavigate('units')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Occupancy Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.occupancyRate}%</div>
            <Progress value={stats.occupancyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card 
          data-stat-card="true" 
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => onNavigate('accounting')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Monthly Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">AED {stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Enhanced */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="h-auto flex-col py-4 hover:scale-105 transition-transform" 
              variant="outline"
              onClick={() => onNavigate('properties')}
            >
              <Plus className="h-6 w-6 mb-2" />
              Add Property
            </Button>
            <Button 
              className="h-auto flex-col py-4 hover:scale-105 transition-transform" 
              variant="outline"
              onClick={() => onNavigate('units')}
            >
              <Users className="h-6 w-6 mb-2" />
              Add Tenant
            </Button>
            <Button 
              className="h-auto flex-col py-4 hover:scale-105 transition-transform" 
              variant="outline"
              onClick={() => onNavigate('maintenance')}
            >
              <Wrench className="h-6 w-6 mb-2" />
              Create Maintenance
            </Button>
            <Button 
              className="h-auto flex-col py-4 hover:scale-105 transition-transform" 
              variant="outline"
              onClick={() => onNavigate('accounting')}
            >
              <FileText className="h-6 w-6 mb-2" />
              Generate Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (activity.type === 'payment') onNavigate('payments')
                        if (activity.type === 'maintenance') onNavigate('maintenance')
                        if (activity.type === 'lease') onNavigate('leases')
                        if (activity.type === 'tenant') onNavigate('units')
                        if (activity.type === 'property') onNavigate('properties')
                      }}
                    >
                      <Icon className={`h-4 w-4 ${activity.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.overduePayments > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Urgent Maintenance</p>
                    <p className="text-xs text-red-700 dark:text-red-300">{stats.overduePayments} overdue payments</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate('payments')}
                    className="border-red-300 dark:border-red-800"
                  >
                    View
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Lease Expiring Soon</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">8 leases expire within 30 days</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate('leases')}
                  className="border-orange-300 dark:border-orange-800"
                >
                  Review
                </Button>
              </div>
              
              {stats.maintenanceRequests > 5 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                  <Wrench className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Active Maintenance</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">{stats.maintenanceRequests} requests pending</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate('maintenance')}
                    className="border-yellow-300 dark:border-yellow-800"
                  >
                    Manage
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Charts */}
      <AdvancedDashboardCharts companyId={user.companyId} />
    </div>
  )
}

