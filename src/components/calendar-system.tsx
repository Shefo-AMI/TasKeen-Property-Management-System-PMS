import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Calendar } from './ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  MapPin,
  Users,
  Wrench,
  Key,
  Video,
  Phone,
  Mail,
  Bell,
  Filter,
  Search
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: 'platform_admin' | 'company_admin' | 'employee'
}

interface CalendarSystemProps {
  user: User
  accessToken: string | null
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  type: 'maintenance' | 'inspection' | 'viewing' | 'meeting' | 'lease_expiry' | 'payment_due' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  attendees: string[]
  propertyId?: string
  propertyName?: string
  unitId?: string
  unitNumber?: string
  tenantId?: string
  tenantName?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
  reminders: {
    type: 'email' | 'sms' | 'push'
    time: number // minutes before event
  }[]
  createdBy: string
  assignedTo?: string
  notes: string
  recurring: {
    enabled: boolean
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval?: number
    endDate?: string
  }
  createdAt: string
  updatedAt: string
}

// Demo calendar events data
const demoCalendarEvents: CalendarEvent[] = [
  {
    id: 'event-001',
    title: 'AC Unit Repair - Marina Towers',
    description: 'Scheduled maintenance for AC unit not cooling properly',
    type: 'maintenance',
    priority: 'high',
    startDate: '2024-01-16',
    endDate: '2024-01-16',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Unit 1205, Burj Al Marina Residence',
    attendees: ['Ahmed Hassan - HVAC Specialist', 'Omar Al-Hassan (Tenant)'],
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    status: 'scheduled',
    reminders: [
      { type: 'email', time: 60 },
      { type: 'sms', time: 30 }
    ],
    createdBy: 'Property Manager',
    assignedTo: 'Ahmed Hassan',
    notes: 'Bring replacement parts if needed',
    recurring: { enabled: false },
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  },
  {
    id: 'event-002',
    title: 'Unit Inspection - Business Bay',
    description: 'Quarterly inspection of office unit',
    type: 'inspection',
    priority: 'medium',
    startDate: '2024-01-18',
    endDate: '2024-01-18',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Unit 1501, Business Bay Executive Center',
    attendees: ['Sarah Johnson (Property Manager)', 'Sarah Mitchell (Tenant)'],
    propertyId: 'prop-002',
    propertyName: 'Business Bay Executive Center',
    unitId: 'unit-003',
    unitNumber: '1501',
    tenantId: 'tenant-002',
    tenantName: 'Sarah Mitchell',
    status: 'scheduled',
    reminders: [
      { type: 'email', time: 1440 }, // 24 hours
      { type: 'email', time: 120 }   // 2 hours
    ],
    createdBy: 'Sarah Johnson',
    assignedTo: 'Sarah Johnson',
    notes: 'Check all appliances and document any issues',
    recurring: { 
      enabled: true, 
      frequency: 'monthly',
      interval: 3,
      endDate: '2024-12-31'
    },
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z'
  },
  {
    id: 'event-003',
    title: 'Property Viewing - Downtown Heights',
    description: 'Showing available unit to potential tenant',
    type: 'viewing',
    priority: 'medium',
    startDate: '2024-01-17',
    endDate: '2024-01-17',
    startTime: '16:00',
    endTime: '16:30',
    location: 'Unit 2105, Downtown Heights',
    attendees: ['Fatima Al-Rashid (Agent)', 'Potential Tenant'],
    propertyId: 'prop-004',
    propertyName: 'Downtown Heights',
    status: 'scheduled',
    reminders: [
      { type: 'email', time: 60 }
    ],
    createdBy: 'Fatima Al-Rashid',
    assignedTo: 'Fatima Al-Rashid',
    notes: 'Prepare unit keys and brochures',
    recurring: { enabled: false },
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-15T14:20:00Z'
  },
  {
    id: 'event-004',
    title: 'Lease Renewal Meeting',
    description: 'Discuss lease renewal terms with tenant',
    type: 'meeting',
    priority: 'high',
    startDate: '2024-01-22',
    endDate: '2024-01-22',
    startTime: '10:00',
    endTime: '11:00',
    location: 'PropertyFlow Office',
    attendees: ['Omar Al-Hassan (Tenant)', 'Property Manager'],
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    status: 'scheduled',
    reminders: [
      { type: 'email', time: 2880 }, // 48 hours
      { type: 'email', time: 60 }
    ],
    createdBy: 'Property Manager',
    notes: 'Prepare new lease terms and rental agreement',
    recurring: { enabled: false },
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  },
  {
    id: 'event-005',
    title: 'Monthly Rent Due - Multiple Units',
    description: 'February 2024 rent collection',
    type: 'payment_due',
    priority: 'high',
    startDate: '2024-02-01',
    endDate: '2024-02-01',
    startTime: '00:00',
    endTime: '23:59',
    location: 'All Properties',
    attendees: ['All Active Tenants'],
    status: 'scheduled',
    reminders: [
      { type: 'email', time: 10080 }, // 7 days
      { type: 'email', time: 4320 },  // 3 days
      { type: 'sms', time: 1440 }     // 1 day
    ],
    createdBy: 'System',
    notes: 'Automated rent collection reminder',
    recurring: { 
      enabled: true, 
      frequency: 'monthly',
      interval: 1
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export function CalendarSystem({ user, accessToken }: CalendarSystemProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>(demoCalendarEvents)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter events based on selected date and filters
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const matchesDate = event.startDate === dateStr
      const matchesType = filterType === 'all' || event.type === filterType
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesDate && matchesType && matchesSearch
    })
  }

  // Get upcoming events
  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0]
    return events
      .filter(event => event.startDate >= today)
      .sort((a, b) => new Date(a.startDate + 'T' + a.startTime).getTime() - new Date(b.startDate + 'T' + b.startTime).getTime())
      .slice(0, 10)
  }

  // Get events for current week
  const getWeekEvents = () => {
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    const startStr = startOfWeek.toISOString().split('T')[0]
    const endStr = endOfWeek.toISOString().split('T')[0]
    
    return events.filter(event => event.startDate >= startStr && event.startDate <= endStr)
  }

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'inspection': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'viewing': return 'bg-green-100 text-green-800 border-green-200'
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'lease_expiry': return 'bg-red-100 text-red-800 border-red-200'
      case 'payment_due': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleAddEvent = async (eventData: Partial<CalendarEvent>) => {
    setIsLoading(true)
    try {
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: eventData.title || '',
        description: eventData.description || '',
        type: eventData.type || 'other',
        priority: eventData.priority || 'medium',
        startDate: eventData.startDate || selectedDate.toISOString().split('T')[0],
        endDate: eventData.endDate || selectedDate.toISOString().split('T')[0],
        startTime: eventData.startTime || '09:00',
        endTime: eventData.endTime || '10:00',
        location: eventData.location || '',
        attendees: eventData.attendees || [],
        status: 'scheduled',
        reminders: eventData.reminders || [{ type: 'email', time: 60 }],
        createdBy: user.fullName,
        notes: eventData.notes || '',
        recurring: eventData.recurring || { enabled: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...eventData
      }

      setEvents(prev => [...prev, newEvent])
      setShowAddEvent(false)
      toast.success('Event added successfully')
    } catch (error) {
      toast.error('Failed to add event')
    } finally {
      setIsLoading(false)
    }
  }

  const renderCalendarView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Manage your schedule and events</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="agenda">Agenda</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setShowAddEvent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Events for {selectedDate.toDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getEventTypeColor(event.type)}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                        <h4 className="font-medium text-sm">{event.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.startTime} - {event.endTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {event.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No events scheduled for this date
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderAgendaView = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </div>
          <Button onClick={() => setShowAddEvent(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {getUpcomingEvents().map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex flex-col items-center text-center min-w-[60px]">
                <div className="text-lg font-bold">
                  {new Date(event.startDate).getDate()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>
              
              <div className={`w-1 h-12 rounded-full ${getPriorityColor(event.priority)}`} />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge variant="outline" className={getEventTypeColor(event.type)}>
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {event.startTime} - {event.endTime}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {event.location}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium capitalize">{event.status}</p>
                {event.assignedTo && (
                  <p className="text-xs text-muted-foreground">
                    Assigned to: {event.assignedTo}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Calendar & Events</h2>
          <p className="text-muted-foreground">Manage appointments, inspections, and schedules</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inspection">Inspections</SelectItem>
                <SelectItem value="viewing">Viewings</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="lease_expiry">Lease Expiry</SelectItem>
                <SelectItem value="payment_due">Payment Due</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="month">Month View</TabsTrigger>
          <TabsTrigger value="agenda">Agenda View</TabsTrigger>
        </TabsList>

        <TabsContent value="month">
          {renderCalendarView()}
        </TabsContent>

        <TabsContent value="agenda">
          {renderAgendaView()}
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedEvent.priority)}`} />
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription>
                  Event details and information
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Badge className={getEventTypeColor(selectedEvent.type)}>
                      {selectedEvent.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge variant="outline">
                      {selectedEvent.priority}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm">{new Date(selectedEvent.startDate).toDateString()}</p>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <p className="text-sm">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                </div>

                <div>
                  <Label>Location</Label>
                  <p className="text-sm flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedEvent.location}
                  </p>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>

                {selectedEvent.attendees.length > 0 && (
                  <div>
                    <Label>Attendees</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <Badge key={index} variant="outline">
                          {attendee}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm">{selectedEvent.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                  <Button size="sm" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Set Reminder
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new calendar event
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            handleAddEvent({
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              type: formData.get('type') as CalendarEvent['type'],
              priority: formData.get('priority') as CalendarEvent['priority'],
              startDate: formData.get('startDate') as string,
              endDate: formData.get('endDate') as string,
              startTime: formData.get('startTime') as string,
              endTime: formData.get('endTime') as string,
              location: formData.get('location') as string,
              notes: formData.get('notes') as string,
            })
          }}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input id="title" name="title" required />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select name="type" defaultValue="other">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="viewing">Viewing</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="date" 
                    defaultValue={selectedDate.toISOString().split('T')[0]}
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="date" 
                    defaultValue={selectedDate.toISOString().split('T')[0]}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" type="time" defaultValue="09:00" required />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" type="time" defaultValue="10:00" required />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Event location" />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Additional notes..." />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddEvent(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}