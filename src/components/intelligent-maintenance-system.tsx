import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { 
  Wrench, AlertTriangle, CheckCircle, Clock, Star, 
  Calendar, DollarSign, User, Building, Phone, Mail,
  MapPin, FileText, Camera, QrCode, TrendingUp, Plus,
  Search, Filter, Download, Upload, Settings
} from "lucide-react";
import { supabase } from "../utils/supabase";

interface Vendor {
  id: string;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  total_jobs: number;
  completed_jobs: number;
  status: string;
}

interface WorkOrder {
  id: string;
  work_order_number: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  property_id: string;
  unit_number: string;
  vendor_id?: string;
  estimated_cost: number;
  actual_cost?: number;
  scheduled_date?: string;
  status: string;
  created_at: string;
}

interface Equipment {
  id: string;
  equipment_type: string;
  brand: string;
  model_number: string;
  property_id: string;
  unit_number?: string;
  last_service_date?: string;
  next_service_date?: string;
  status: string;
}

interface PreventiveMaintenance {
  id: string;
  schedule_name: string;
  description: string;
  frequency: string;
  next_due_date: string;
  is_active: boolean;
  priority: string;
}

export function IntelligentMaintenanceSystem({ companyId }: { companyId: string }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [preventiveSchedules, setPreventiveSchedules] = useState<PreventiveMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("work-orders");
  const [showAddWorkOrder, setShowAddWorkOrder] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    openWorkOrders: 0,
    inProgressWorkOrders: 0,
    completedThisMonth: 0,
    averageCompletionTime: 0,
    totalCostThisMonth: 0,
    upcomingPreventive: 0,
  });

  useEffect(() => {
    loadMaintenanceData();
  }, [companyId]);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);

      // Load vendors
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('*')
        .eq('company_id', companyId)
        .order('rating', { ascending: false });

      // Load work orders
      const { data: workOrdersData } = await supabase
        .from('work_orders')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(100);

      // Load equipment
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('*')
        .eq('company_id', companyId)
        .order('next_service_date', { ascending: true });

      // Load preventive maintenance schedules
      const { data: preventiveData } = await supabase
        .from('preventive_maintenance_schedules')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true });

      setVendors(vendorsData || []);
      setWorkOrders(workOrdersData || []);
      setEquipment(equipmentData || []);
      setPreventiveSchedules(preventiveData || []);

      // Calculate statistics
      calculateStats(workOrdersData || [], preventiveData || []);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: WorkOrder[], preventive: PreventiveMaintenance[]) => {
    const openOrders = orders.filter(o => o.status === 'open').length;
    const inProgress = orders.filter(o => o.status === 'in_progress').length;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const completedThisMonth = orders.filter(
      o => o.status === 'completed' && new Date(o.created_at) >= thisMonth
    ).length;

    const totalCost = orders
      .filter(o => o.status === 'completed' && o.actual_cost && new Date(o.created_at) >= thisMonth)
      .reduce((sum, o) => sum + (o.actual_cost || 0), 0);

    const upcomingPreventive = preventive.filter(
      p => new Date(p.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    setStats({
      openWorkOrders: openOrders,
      inProgressWorkOrders: inProgress,
      completedThisMonth,
      averageCompletionTime: 0, // Would need more complex calculation
      totalCostThisMonth: totalCost,
      upcomingPreventive,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'emergency':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const assignVendorToWorkOrder = async (workOrderId: string, vendorId: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ 
          vendor_id: vendorId,
          status: 'assigned'
        })
        .eq('id', workOrderId);

      if (error) throw error;

      toast.success('Vendor assigned successfully');
      loadMaintenanceData();
    } catch (error) {
      console.error('Error assigning vendor:', error);
      toast.error('Failed to assign vendor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Intelligent Maintenance System 🔧</h1>
          <p className="text-muted-foreground">
            Advanced work order management with vendor tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            Generate QR Codes
          </Button>
          <Button onClick={() => setShowAddWorkOrder(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgressWorkOrders} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Work orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost (MTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCostThisMonth)}</div>
            <p className="text-xs text-muted-foreground">Maintenance expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Preventive</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingPreventive}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="preventive">Preventive</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Work Orders Tab */}
        <TabsContent value="work-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Work Orders</CardTitle>
                  <CardDescription>Manage maintenance requests and work orders</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {workOrders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            order.priority === 'urgent' || order.priority === 'emergency' 
                              ? 'bg-red-100' 
                              : order.priority === 'high' 
                              ? 'bg-orange-100' 
                              : 'bg-blue-100'
                          }`}>
                            <Wrench className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{order.title}</p>
                              <Badge variant={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{order.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                Unit {order.unit_number}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.created_at).toLocaleDateString()}
                              </span>
                              {order.estimated_cost > 0 && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(order.estimated_cost)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          {!order.vendor_id && order.status === 'open' && (
                            <Button size="sm" variant="outline">
                              Assign Vendor
                            </Button>
                          )}
                        </div>
                      </div>
                      {order.vendor_id && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            Assigned to: <span className="font-medium">Vendor {order.vendor_id.slice(0, 8)}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vendor Database</CardTitle>
                  <CardDescription>Manage contractors and service providers</CardDescription>
                </div>
                <Button onClick={() => setShowAddVendor(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map((vendor) => (
                  <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{vendor.vendor_name}</CardTitle>
                          <CardDescription>{vendor.contact_person}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{vendor.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{vendor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {vendor.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Completed Jobs</p>
                          <p className="font-bold">{vendor.completed_jobs} / {vendor.total_jobs}</p>
                        </div>
                        <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                          {vendor.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Equipment Tracking</CardTitle>
                  <CardDescription>Monitor appliances and equipment with warranties</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Equipment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold capitalize">{item.equipment_type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{item.brand} - {item.model_number}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unit {item.unit_number || 'Common Area'}
                      </p>
                    </div>
                    <div className="text-right">
                      {item.next_service_date && (
                        <p className="text-sm">
                          Next Service: {new Date(item.next_service_date).toLocaleDateString()}
                        </p>
                      )}
                      <Badge variant={item.status === 'operational' ? 'default' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preventive Maintenance Tab */}
        <TabsContent value="preventive" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Preventive Maintenance Schedule</CardTitle>
                  <CardDescription>Recurring maintenance tasks and inspections</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preventiveSchedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{schedule.schedule_name}</p>
                        <p className="text-sm text-muted-foreground">{schedule.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {schedule.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(schedule.next_due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getPriorityColor(schedule.priority)}>
                          {schedule.priority}
                        </Badge>
                        {schedule.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Average Response Time</h3>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">2.5 hours</p>
                  <p className="text-sm text-green-600 mt-2">↓ 15% from last month</p>
                </div>
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Completion Rate</h3>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">94%</p>
                  <p className="text-sm text-green-600 mt-2">↑ 3% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
