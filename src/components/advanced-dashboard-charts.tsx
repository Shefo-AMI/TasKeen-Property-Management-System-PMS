import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Home, AlertCircle } from 'lucide-react';

interface AdvancedDashboardChartsProps {
  companyId?: string;
}

export function AdvancedDashboardCharts({ companyId }: AdvancedDashboardChartsProps) {
  // Mock data - Replace with real API calls
  const rentCollectionData = [
    { month: 'Jan', collected: 450000, expected: 500000, rate: 90 },
    { month: 'Feb', collected: 480000, expected: 500000, rate: 96 },
    { month: 'Mar', collected: 470000, expected: 500000, rate: 94 },
    { month: 'Apr', collected: 490000, expected: 500000, rate: 98 },
    { month: 'May', collected: 495000, expected: 500000, rate: 99 },
    { month: 'Jun', collected: 500000, expected: 500000, rate: 100 },
  ];

  const occupancyTrendsData = [
    { month: 'Jan', occupancy: 85, vacant: 15 },
    { month: 'Feb', occupancy: 87, vacant: 13 },
    { month: 'Mar', occupancy: 89, vacant: 11 },
    { month: 'Apr', occupancy: 91, vacant: 9 },
    { month: 'May', occupancy: 92, vacant: 8 },
    { month: 'Jun', occupancy: 94, vacant: 6 },
  ];

  const maintenancePriorityData = [
    { name: 'Urgent', value: 5, color: '#ef4444' },
    { name: 'High', value: 12, color: '#f59e0b' },
    { name: 'Medium', value: 23, color: '#eab308' },
    { name: 'Low', value: 8, color: '#22c55e' },
  ];

  const propertyRevenueData = [
    { property: 'ALMEKNAS 146', revenue: 180000, units: 105 },
    { property: 'AL SHARJAH 346', revenue: 95000, units: 51 },
    { property: 'AL BAHIYAH', revenue: 25000, units: 5 },
  ];

  const vacancyByPropertyData = [
    { property: 'ALMEKNAS 146', vacant: 8, occupied: 97 },
    { property: 'AL SHARJAH 346', vacant: 3, occupied: 48 },
    { property: 'AL BAHIYAH', vacant: 0, occupied: 5 },
  ];

  // Custom tooltip for cyber theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-primary/30 p-3 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="font-bold text-primary mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' 
                ? entry.value.toLocaleString() 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">98.5%</div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Avg Occupancy</CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">93.2%</div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +1.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">AED 495K</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of AED 500K expected
            </p>
          </CardContent>
        </Card>

        <Card data-stat-card="true" className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">48</div>
            <p className="text-xs text-amber-500 mt-1">5 urgent, 12 high priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rent Collection Chart */}
        <Card data-chart="true">
          <CardHeader>
            <CardTitle>Rent Collection Trends</CardTitle>
            <CardDescription>Monthly rent collection vs expected</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={rentCollectionData}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00ffff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="collected" 
                  stroke="#00ffff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCollected)" 
                  name="Collected (AED)"
                />
                <Area 
                  type="monotone" 
                  dataKey="expected" 
                  stroke="#22d3ee" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorExpected)" 
                  name="Expected (AED)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Trends Chart */}
        <Card data-chart="true">
          <CardHeader>
            <CardTitle>Occupancy Trends</CardTitle>
            <CardDescription>Occupied vs vacant units over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#00ffff" 
                  strokeWidth={3}
                  dot={{ fill: '#00ffff', r: 5 }}
                  name="Occupancy (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="vacant" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5 }}
                  name="Vacant (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Revenue Bar Chart */}
        <Card data-chart="true" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Property</CardTitle>
            <CardDescription>Monthly revenue per building</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={propertyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                <XAxis dataKey="property" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  fill="#00ffff" 
                  name="Revenue (AED)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maintenance Priority Pie Chart */}
        <Card data-chart="true">
          <CardHeader>
            <CardTitle>Maintenance Priority</CardTitle>
            <CardDescription>Distribution of ticket priority</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={maintenancePriorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {maintenancePriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {maintenancePriorityData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vacancy by Property */}
      <Card data-chart="true">
        <CardHeader>
          <CardTitle>Vacancy Analysis by Property</CardTitle>
          <CardDescription>Occupied vs vacant units per building</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vacancyByPropertyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="property" type="category" stroke="#94a3b8" width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="occupied" stackId="a" fill="#00ffff" name="Occupied" />
              <Bar dataKey="vacant" stackId="a" fill="#ef4444" name="Vacant" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
