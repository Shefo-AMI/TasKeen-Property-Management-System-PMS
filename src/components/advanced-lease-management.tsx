import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { 
  FileText, CheckCircle, AlertCircle, Clock, Calendar,
  Users, DollarSign, Edit, Send, Download, Plus,
  RefreshCw, XCircle, FileSignature, Bell, TrendingUp
} from "lucide-react";
import { supabase } from "../utils/supabase";

interface LeaseAgreement {
  id: string;
  lease_number: string;
  property_id: string;
  unit_number: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  signature_status: string;
  landlord_signed: boolean;
  tenant_signed: boolean;
  renewal_option: string;
  created_at: string;
}

interface LeaseRenewal {
  id: string;
  original_lease_id: string;
  renewal_status: string;
  renewal_offer_date: string;
  proposed_rent: number;
  rent_increase_percentage: number;
  tenant_response?: string;
}

interface LeaseViolation {
  id: string;
  lease_id: string;
  violation_type: string;
  violation_date: string;
  severity: string;
  is_resolved: boolean;
  description: string;
}

interface LeaseTemplate {
  id: string;
  template_name: string;
  template_type: string;
  is_default: boolean;
  is_active: boolean;
}

export function AdvancedLeaseManagement({ companyId }: { companyId: string }) {
  const [leases, setLeases] = useState<LeaseAgreement[]>([]);
  const [renewals, setRenewals] = useState<LeaseRenewal[]>([]);
  const [violations, setViolations] = useState<LeaseViolation[]>([]);
  const [templates, setTemplates] = useState<LeaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("active-leases");

  // Statistics
  const [stats, setStats] = useState({
    activeLeases: 0,
    expiringLeases: 0,
    pendingSignatures: 0,
    renewalsPending: 0,
    violationsOpen: 0,
    averageLeaseValue: 0,
  });

  useEffect(() => {
    loadLeaseData();
  }, [companyId]);

  const loadLeaseData = async () => {
    try {
      setLoading(true);

      // Load lease agreements
      const { data: leasesData } = await supabase
        .from('lease_agreements')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      // Load renewals
      const { data: renewalsData } = await supabase
        .from('lease_renewals')
        .select('*')
        .in('original_lease_id', leasesData?.map(l => l.id) || [])
        .order('renewal_offer_date', { ascending: false });

      // Load violations
      const { data: violationsData } = await supabase
        .from('lease_violations')
        .select('*')
        .eq('company_id', companyId)
        .order('violation_date', { ascending: false });

      // Load templates
      const { data: templatesData } = await supabase
        .from('lease_templates')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true);

      setLeases(leasesData || []);
      setRenewals(renewalsData || []);
      setViolations(violationsData || []);
      setTemplates(templatesData || []);

      calculateStats(leasesData || [], renewalsData || [], violationsData || []);
    } catch (error) {
      console.error('Error loading lease data:', error);
      toast.error('Failed to load lease data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    leasesList: LeaseAgreement[], 
    renewalsList: LeaseRenewal[], 
    violationsList: LeaseViolation[]
  ) => {
    const active = leasesList.filter(l => l.status === 'active').length;
    const expiring = leasesList.filter(l => l.status === 'expiring_soon').length;
    const pendingSig = leasesList.filter(l => l.signature_status !== 'fully_signed').length;
    const renewalsPending = renewalsList.filter(r => r.renewal_status === 'pending' || r.renewal_status === 'offered').length;
    const violationsOpen = violationsList.filter(v => !v.is_resolved).length;
    
    const totalRent = leasesList
      .filter(l => l.status === 'active')
      .reduce((sum, l) => sum + l.monthly_rent, 0);
    const avgValue = active > 0 ? totalRent / active : 0;

    setStats({
      activeLeases: active,
      expiringLeases: expiring,
      pendingSignatures: pendingSig,
      renewalsPending,
      violationsOpen,
      averageLeaseValue: avgValue,
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
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending_signature':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignatureStatusIcon = (lease: LeaseAgreement) => {
    if (lease.landlord_signed && lease.tenant_signed) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (lease.landlord_signed || lease.tenant_signed) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const sendRenewalOffer = async (leaseId: string) => {
    try {
      const lease = leases.find(l => l.id === leaseId);
      if (!lease) return;

      const rentIncrease = 5; // 5% increase
      const newRent = lease.monthly_rent * (1 + rentIncrease / 100);

      const { error } = await supabase
        .from('lease_renewals')
        .insert({
          original_lease_id: leaseId,
          renewal_status: 'offered',
          renewal_offer_date: new Date().toISOString().split('T')[0],
          renewal_offer_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          proposed_start_date: lease.end_date,
          proposed_end_date: new Date(new Date(lease.end_date).setFullYear(new Date(lease.end_date).getFullYear() + 1)).toISOString().split('T')[0],
          proposed_rent: newRent,
          rent_increase_percentage: rentIncrease,
          created_by: 'system',
        });

      if (error) throw error;

      toast.success('Renewal offer sent successfully');
      loadLeaseData();
    } catch (error) {
      console.error('Error sending renewal offer:', error);
      toast.error('Failed to send renewal offer');
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
          <h1 className="text-3xl font-bold">Advanced Lease Management 📄</h1>
          <p className="text-muted-foreground">
            E-signature integration and automated lease renewals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lease
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLeases}</div>
            <p className="text-xs text-muted-foreground">
              {stats.expiringLeases} expiring soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <FileSignature className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSignatures}</div>
            <p className="text-xs text-muted-foreground">Awaiting e-signature</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewal Offers</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.renewalsPending}</div>
            <p className="text-xs text-muted-foreground">Pending response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Violations</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.violationsOpen}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active-leases">Active Leases</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
        </TabsList>

        {/* Active Leases Tab */}
        <TabsContent value="active-leases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Lease Agreements</CardTitle>
              <CardDescription>Manage current and upcoming leases</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {leases.filter(l => l.status === 'active' || l.status === 'expiring_soon').map((lease) => (
                    <div key={lease.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-lg">{lease.lease_number}</p>
                            <Badge className={getStatusColor(lease.status)}>
                              {lease.status.replace('_', ' ')}
                            </Badge>
                            {getSignatureStatusIcon(lease)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Property</p>
                              <p className="font-medium">Unit {lease.unit_number}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Monthly Rent</p>
                              <p className="font-medium">{formatCurrency(lease.monthly_rent)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-medium">{new Date(lease.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date</p>
                              <p className="font-medium">{new Date(lease.end_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {lease.status === 'expiring_soon' && (
                            <Button size="sm" onClick={() => sendRenewalOffer(lease.id)}>
                              <RefreshCw className="mr-2 h-3 w-3" />
                              Send Renewal
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                      
                      {/* Signature Status */}
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            {lease.landlord_signed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>Landlord</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {lease.tenant_signed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>Tenant</span>
                          </div>
                        </div>
                        {!lease.tenant_signed && (
                          <Button size="sm" variant="ghost">
                            <Send className="mr-2 h-3 w-3" />
                            Resend Signature Request
                          </Button>
                        )}
                      </div>

                      {/* Days until expiration */}
                      {lease.status === 'expiring_soon' && (
                        <>
                          <Separator className="my-3" />
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <Bell className="h-4 w-4" />
                            <span>
                              Expires in {Math.ceil((new Date(lease.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Renewals Tab */}
        <TabsContent value="renewals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lease Renewals</CardTitle>
              <CardDescription>Track renewal offers and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renewals.map((renewal) => {
                  const originalLease = leases.find(l => l.id === renewal.original_lease_id);
                  return (
                    <div key={renewal.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {originalLease?.lease_number || 'Unknown Lease'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Offered: {new Date(renewal.renewal_offer_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          renewal.renewal_status === 'accepted' ? 'default' :
                          renewal.renewal_status === 'declined' ? 'destructive' :
                          'secondary'
                        }>
                          {renewal.renewal_status}
                        </Badge>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Rent</p>
                          <p className="font-semibold">{formatCurrency(originalLease?.monthly_rent || 0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Proposed Rent</p>
                          <p className="font-semibold">{formatCurrency(renewal.proposed_rent)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Increase</p>
                          <p className="font-semibold text-green-600">
                            +{renewal.rent_increase_percentage}%
                          </p>
                        </div>
                      </div>
                      {renewal.tenant_response && (
                        <>
                          <Separator className="my-3" />
                          <div className="text-sm">
                            <p className="text-muted-foreground mb-1">Tenant Response:</p>
                            <p>{renewal.tenant_response}</p>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lease Violations</CardTitle>
              <CardDescription>Track and manage lease violations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div key={violation.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold capitalize">
                            {violation.violation_type.replace('_', ' ')}
                          </p>
                          <Badge variant={
                            violation.severity === 'critical' ? 'destructive' :
                            violation.severity === 'severe' ? 'default' :
                            'secondary'
                          }>
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {violation.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Date: {new Date(violation.violation_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={violation.is_resolved ? 'default' : 'destructive'}>
                        {violation.is_resolved ? 'Resolved' : 'Open'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lease Templates</CardTitle>
                  <CardDescription>Manage lease agreement templates</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{template.template_name}</CardTitle>
                          <CardDescription className="capitalize">
                            {template.template_type.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        {template.is_default && (
                          <Badge>Default</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <FileText className="mr-2 h-3 w-3" />
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections">
          <Card>
            <CardHeader>
              <CardTitle>Move-In/Move-Out Inspections</CardTitle>
              <CardDescription>Property condition documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Inspection management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
