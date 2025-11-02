import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { 
  Home, Eye, MessageSquare, FileText, DollarSign, Calendar,
  TrendingUp, Users, CheckCircle, Clock, Star, MapPin,
  Share2, Plus, Search, Filter, Download, Image
} from "lucide-react";
import { supabase } from "../utils/supabase";

interface PropertyListing {
  id: string;
  listing_title: string;
  property_id: string;
  unit_number: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  monthly_rent: number;
  available_date: string;
  status: string;
  views_count: number;
  inquiries_count: number;
  applications_count: number;
  photos: string[];
  featured: boolean;
}

interface RentalApplication {
  id: string;
  application_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  listing_id: string;
  status: string;
  application_date: string;
  monthly_income: number;
  credit_score?: number;
  overall_score?: number;
}

interface ListingLead {
  id: string;
  listing_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  lead_source: string;
  lead_status: string;
  lead_score: number;
  created_at: string;
}

interface ShowingAppointment {
  id: string;
  listing_id: string;
  applicant_name: string;
  applicant_email: string;
  showing_date: string;
  showing_time: string;
  status: string;
  showing_type: string;
}

export function VacancyListingManagement({ companyId }: { companyId: string }) {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [leads, setLeads] = useState<ListingLead[]>([]);
  const [showings, setShowings] = useState<ShowingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("listings");

  // Statistics
  const [stats, setStats] = useState({
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalApplications: 0,
    averageTimeToLease: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadListingData();
  }, [companyId]);

  const loadListingData = async () => {
    try {
      setLoading(true);

      // Load listings
      const { data: listingsData } = await supabase
        .from('property_listings')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      // Load applications
      const { data: applicationsData } = await supabase
        .from('rental_applications')
        .select('*')
        .eq('company_id', companyId)
        .order('application_date', { ascending: false })
        .limit(100);

      // Load leads
      const { data: leadsData } = await supabase
        .from('listing_leads')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(100);

      // Load showings
      const { data: showingsData } = await supabase
        .from('showing_appointments')
        .select('*')
        .eq('company_id', companyId)
        .order('showing_date', { ascending: false })
        .limit(100);

      setListings(listingsData || []);
      setApplications(applicationsData || []);
      setLeads(leadsData || []);
      setShowings(showingsData || []);

      calculateStats(listingsData || [], applicationsData || [], leadsData || []);
    } catch (error) {
      console.error('Error loading listing data:', error);
      toast.error('Failed to load listing data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    listingsList: PropertyListing[], 
    applicationsList: RentalApplication[], 
    leadsList: ListingLead[]
  ) => {
    const active = listingsList.filter(l => l.status === 'active').length;
    const totalViews = listingsList.reduce((sum, l) => sum + l.views_count, 0);
    const totalInquiries = listingsList.reduce((sum, l) => sum + l.inquiries_count, 0);
    const totalApplications = listingsList.reduce((sum, l) => sum + l.applications_count, 0);
    
    const conversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

    setStats({
      activeListings: active,
      totalViews,
      totalInquiries,
      totalApplications,
      averageTimeToLease: 0, // Would need more complex calculation
      conversionRate,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'denied':
        return 'destructive';
      case 'under_review':
      case 'screening':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const syndicateListing = async (listingId: string) => {
    try {
      const platforms = ['zillow', 'apartments_com', 'trulia', 'realtor_com'];
      
      for (const platform of platforms) {
        await supabase
          .from('listing_syndications')
          .insert({
            listing_id: listingId,
            platform,
            syndication_status: 'pending',
            auto_renew: true,
          });
      }

      toast.success('Listing syndicated to multiple platforms');
      loadListingData();
    } catch (error) {
      console.error('Error syndicating listing:', error);
      toast.error('Failed to syndicate listing');
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
          <h1 className="text-3xl font-bold">Vacancy & Listing Management 📢</h1>
          <p className="text-muted-foreground">
            Multi-platform syndication and applicant tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Syndicate All
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">Available properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalInquiries} inquiries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Views to applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="showings">Showings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Listings Tab */}
        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Property Listings</CardTitle>
                  <CardDescription>Manage and syndicate property listings</CardDescription>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Listing Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img 
                          src={listing.photos[0]} 
                          alt={listing.listing_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Image className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {listing.featured && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge className={`absolute top-2 left-2 ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </Badge>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-1">{listing.listing_title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Unit {listing.unit_number}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Property Details */}
                      <div className="flex items-center justify-between text-sm">
                        <span>{listing.bedrooms} bed • {listing.bathrooms} bath</span>
                        <span>{listing.square_feet} sq ft</span>
                      </div>

                      {/* Rent */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(listing.monthly_rent)}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>

                      {/* Available Date */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Available: {new Date(listing.available_date).toLocaleDateString()}
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-semibold">{listing.views_count}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-semibold">{listing.inquiries_count}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Inquiries</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-semibold">{listing.applications_count}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Apps</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => syndicateListing(listing.id)}
                        >
                          <Share2 className="mr-2 h-3 w-3" />
                          Syndicate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rental Applications</CardTitle>
              <CardDescription>Review and process rental applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {applications.map((app) => {
                    const listing = listings.find(l => l.id === app.listing_id);
                    return (
                      <div key={app.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-lg">
                                {app.first_name} {app.last_name}
                              </p>
                              <Badge variant={getApplicationStatusColor(app.status)}>
                                {app.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Application #</p>
                                <p className="font-medium">{app.application_number}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Property</p>
                                <p className="font-medium">{listing?.listing_title || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Monthly Income</p>
                                <p className="font-medium">{formatCurrency(app.monthly_income)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Credit Score</p>
                                <p className="font-medium">{app.credit_score || 'Pending'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {app.overall_score && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{app.overall_score}</div>
                                <p className="text-xs text-muted-foreground">Score</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{app.email}</span>
                          <span>•</span>
                          <span>{app.phone}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {app.status === 'submitted' && (
                            <>
                              <Button size="sm" variant="default">
                                <CheckCircle className="mr-2 h-3 w-3" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive">
                                Deny
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Tracking</CardTitle>
              <CardDescription>Manage inquiries and potential tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => {
                  const listing = listings.find(l => l.id === lead.listing_id);
                  return (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{lead.first_name} {lead.last_name}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {lead.lead_source}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Lead Score</p>
                          <div className="flex items-center gap-2">
                            <Progress value={lead.lead_score} className="w-20" />
                            <span className="font-bold">{lead.lead_score}</span>
                          </div>
                        </div>
                        <Badge variant={
                          lead.lead_status === 'leased' ? 'default' :
                          lead.lead_status === 'lost' ? 'destructive' :
                          'secondary'
                        }>
                          {lead.lead_status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Showings Tab */}
        <TabsContent value="showings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Showing Appointments</CardTitle>
              <CardDescription>Schedule and manage property showings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showings.map((showing) => {
                  const listing = listings.find(l => l.id === showing.listing_id);
                  return (
                    <div key={showing.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{showing.applicant_name}</p>
                          <p className="text-sm text-muted-foreground">{showing.applicant_email}</p>
                          <p className="text-sm mt-2">{listing?.listing_title || 'Unknown Property'}</p>
                        </div>
                        <Badge variant={
                          showing.status === 'completed' ? 'default' :
                          showing.status === 'cancelled' ? 'destructive' :
                          'secondary'
                        }>
                          {showing.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(showing.showing_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {showing.showing_time}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {showing.showing_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-4">Lead Sources</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Zillow</span>
                      <div className="flex items-center gap-2">
                        <Progress value={35} className="w-32" />
                        <span className="text-sm font-semibold">35%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Apartments.com</span>
                      <div className="flex items-center gap-2">
                        <Progress value={28} className="w-32" />
                        <span className="text-sm font-semibold">28%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Website</span>
                      <div className="flex items-center gap-2">
                        <Progress value={22} className="w-32" />
                        <span className="text-sm font-semibold">22%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Referral</span>
                      <div className="flex items-center gap-2">
                        <Progress value={15} className="w-32" />
                        <span className="text-sm font-semibold">15%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-4">Average Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Days to Lease</p>
                      <p className="text-3xl font-bold">23</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cost Per Lead</p>
                      <p className="text-3xl font-bold">{formatCurrency(45)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Application Rate</p>
                      <p className="text-3xl font-bold">12%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
