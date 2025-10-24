import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Building2, Plus, Edit, Trash2, Key, Users, DollarSign, Calendar, Upload, FileImage, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  created_at: string;
}

interface Unit {
  id: string;
  building_id: string;
  unit_number: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  rent_amount: number;
  status: 'vacant' | 'occupied';
  vacant_since?: string;
  tenant_id?: string;
  tenant_name?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  number_of_payments: number;
  payments: Payment[];
  documents: UnitDocument[];
}

interface Payment {
  id: string;
  payment_number: number;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: 'cash' | 'bank_transfer' | 'cheque';
  cheque_photo_url?: string;
  notes?: string;
}

interface UnitDocument {
  id: string;
  type: 'contract' | 'cheque' | 'tenant_id' | 'other';
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

interface BuildingsUnitsManagementProps {
  user: any;
  accessToken: string | null;
}

export function BuildingsUnitsManagement({ user, accessToken }: BuildingsUnitsManagementProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [showUnitDialog, setShowUnitDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [activeTab, setActiveTab] = useState('buildings');

  // Building Form State
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    address: '',
    city: '',
    total_units: 0,
  });

  // Unit Form State
  const [unitForm, setUnitForm] = useState({
    unit_number: '',
    floor: 1,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 0,
    rent_amount: 0,
    status: 'vacant' as 'vacant' | 'occupied',
    tenant_name: '',
    contract_start_date: '',
    contract_end_date: '',
    number_of_payments: 1,
  });

  // Mock data - Replace with actual API calls
  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = () => {
    // Mock data
    const mockBuildings: Building[] = [
      {
        id: '1',
        name: 'Marina Heights Tower',
        address: 'Dubai Marina',
        city: 'Dubai',
        total_units: 50,
        occupied_units: 42,
        vacant_units: 8,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Downtown Residence',
        address: 'Downtown Dubai',
        city: 'Dubai',
        total_units: 30,
        occupied_units: 28,
        vacant_units: 2,
        created_at: new Date().toISOString(),
      },
    ];
    setBuildings(mockBuildings);
  };

  const loadUnits = (buildingId: string) => {
    // Mock units
    const mockUnits: Unit[] = [
      {
        id: '1',
        building_id: buildingId,
        unit_number: '101',
        floor: 1,
        bedrooms: 2,
        bathrooms: 2,
        area_sqft: 1200,
        rent_amount: 90000,
        status: 'occupied',
        tenant_name: 'Ahmed Hassan',
        contract_start_date: '2024-01-01',
        contract_end_date: '2024-12-31',
        number_of_payments: 3,
        payments: generatePaymentSchedule(90000, 3, '2024-01-01'),
        documents: [],
      },
      {
        id: '2',
        building_id: buildingId,
        unit_number: '102',
        floor: 1,
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: 800,
        rent_amount: 60000,
        status: 'vacant',
        vacant_since: '2024-10-01',
        number_of_payments: 1,
        payments: [],
        documents: [],
      },
    ];
    setUnits(mockUnits);
  };

  const generatePaymentSchedule = (totalRent: number, numberOfPayments: number, startDate: string): Payment[] => {
    const paymentAmount = totalRent / numberOfPayments;
    const payments: Payment[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < numberOfPayments; i++) {
      const paymentDate = new Date(start);
      paymentDate.setMonth(paymentDate.getMonth() + Math.floor((i * 12) / numberOfPayments));

      payments.push({
        id: `payment-${i + 1}`,
        payment_number: i + 1,
        date: paymentDate.toISOString().split('T')[0],
        amount: paymentAmount,
        status: i === 0 ? 'paid' : 'pending',
        payment_method: 'cheque',
        notes: '',
      });
    }

    return payments;
  };

  const handleCreateBuilding = () => {
    const newBuilding: Building = {
      id: Date.now().toString(),
      ...buildingForm,
      occupied_units: 0,
      vacant_units: buildingForm.total_units,
      created_at: new Date().toISOString(),
    };

    setBuildings([...buildings, newBuilding]);
    setShowBuildingDialog(false);
    setBuildingForm({ name: '', address: '', city: '', total_units: 0 });
    toast.success('Building created successfully!');
  };

  const handleCreateUnit = () => {
    if (!selectedBuilding) return;

    const payments = unitForm.status === 'occupied' 
      ? generatePaymentSchedule(unitForm.rent_amount, unitForm.number_of_payments, unitForm.contract_start_date)
      : [];

    const newUnit: Unit = {
      id: Date.now().toString(),
      building_id: selectedBuilding.id,
      ...unitForm,
      payments,
      documents: [],
    };

    setUnits([...units, newUnit]);
    setShowUnitDialog(false);
    setUnitForm({
      unit_number: '',
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      area_sqft: 0,
      rent_amount: 0,
      status: 'vacant',
      tenant_name: '',
      contract_start_date: '',
      contract_end_date: '',
      number_of_payments: 1,
    });
    toast.success('Unit created successfully!');
  };

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding(building);
    loadUnits(building.id);
    setActiveTab('units');
  };

  const handleUpdatePayment = (unitId: string, paymentId: string, updates: Partial<Payment>) => {
    setUnits(units.map(unit => {
      if (unit.id === unitId) {
        return {
          ...unit,
          payments: unit.payments.map(payment => 
            payment.id === paymentId ? { ...payment, ...updates } : payment
          ),
        };
      }
      return unit;
    }));
    toast.success('Payment updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-heading="true">Buildings & Units</h1>
          <p className="text-muted-foreground mt-1">Manage your property portfolio</p>
        </div>
        <Button onClick={() => setShowBuildingDialog(true)} data-primary="true" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Building
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buildings">Buildings</TabsTrigger>
          <TabsTrigger value="units" disabled={!selectedBuilding}>
            Units {selectedBuilding && `- ${selectedBuilding.name}`}
          </TabsTrigger>
        </TabsList>

        {/* Buildings Tab */}
        <TabsContent value="buildings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <Card
                key={building.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectBuilding(building)}
                data-stat-card="true"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Building2 className="h-8 w-8 text-primary" />
                    <Badge variant={building.vacant_units > 0 ? 'secondary' : 'default'}>
                      {building.occupied_units}/{building.total_units} Occupied
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{building.name}</CardTitle>
                  <CardDescription>{building.address}, {building.city}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Units:</span>
                      <span className="font-semibold">{building.total_units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vacant:</span>
                      <span className="font-semibold text-amber-600">{building.vacant_units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Occupancy:</span>
                      <span className="font-semibold text-green-600">
                        {Math.round((building.occupied_units / building.total_units) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-4">
          {selectedBuilding && (
            <>
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Badge variant="outline" className="gap-2">
                    <Key className="h-3 w-3" />
                    {units.length} Total Units
                  </Badge>
                  <Badge variant="outline" className="gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    {units.filter(u => u.status === 'occupied').length} Occupied
                  </Badge>
                  <Badge variant="outline" className="gap-2">
                    <X className="h-3 w-3 text-amber-600" />
                    {units.filter(u => u.status === 'vacant').length} Vacant
                  </Badge>
                </div>
                <Button onClick={() => setShowUnitDialog(true)} data-primary="true" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Unit
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map((unit) => (
                  <Card key={unit.id} data-stat-card="true">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Key className="h-6 w-6 text-primary" />
                          <CardTitle>Unit {unit.unit_number}</CardTitle>
                        </div>
                        <Badge variant={unit.status === 'occupied' ? 'default' : 'secondary'}>
                          {unit.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {unit.bedrooms} BR | {unit.bathrooms} BA | {unit.area_sqft} sqft
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rent:</span>
                          <span className="font-bold text-primary">AED {unit.rent_amount.toLocaleString()}</span>
                        </div>

                        {unit.status === 'occupied' && unit.tenant_name && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tenant:</span>
                              <span className="font-semibold">{unit.tenant_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Contract:</span>
                              <span className="font-semibold text-xs">
                                {unit.contract_start_date} to {unit.contract_end_date}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Payments:</span>
                              <span className="font-semibold">
                                {unit.payments.filter(p => p.status === 'paid').length}/{unit.payments.length} Paid
                              </span>
                            </div>
                          </>
                        )}

                        {unit.status === 'vacant' && unit.vacant_since && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vacant Since:</span>
                            <span className="font-semibold text-amber-600">{unit.vacant_since}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <FileImage className="h-3 w-3 mr-1" />
                          Docs
                        </Button>
                      </div>

                      {/* Payment Schedule */}
                      {unit.status === 'occupied' && unit.payments.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                          <h4 className="text-xs font-semibold mb-2 uppercase">Payment Schedule</h4>
                          <div className="space-y-1">
                            {unit.payments.map((payment) => (
                              <div key={payment.id} className="flex justify-between items-center text-xs">
                                <span>Payment {payment.payment_number}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{payment.date}</span>
                                  <Badge 
                                    variant={payment.status === 'paid' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {payment.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Building Dialog */}
      <Dialog open={showBuildingDialog} onOpenChange={setShowBuildingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
            <DialogDescription>Create a new building in your portfolio</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building-name">Building Name *</Label>
                <Input
                  id="building-name"
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  placeholder="Marina Heights Tower"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={buildingForm.city}
                  onChange={(e) => setBuildingForm({ ...buildingForm, city: e.target.value })}
                  placeholder="Dubai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={buildingForm.address}
                onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                placeholder="Dubai Marina"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-units">Total Units *</Label>
              <Input
                id="total-units"
                type="number"
                value={buildingForm.total_units}
                onChange={(e) => setBuildingForm({ ...buildingForm, total_units: parseInt(e.target.value) || 0 })}
                placeholder="50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBuildingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBuilding} data-primary="true">
              Create Building
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Unit Dialog */}
      <Dialog open={showUnitDialog} onOpenChange={setShowUnitDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>Create a new unit in {selectedBuilding?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit Number *</Label>
                <Input
                  value={unitForm.unit_number}
                  onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
                  placeholder="101"
                />
              </div>
              <div className="space-y-2">
                <Label>Floor *</Label>
                <Input
                  type="number"
                  value={unitForm.floor}
                  onChange={(e) => setUnitForm({ ...unitForm, floor: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bedrooms *</Label>
                <Input
                  type="number"
                  value={unitForm.bedrooms}
                  onChange={(e) => setUnitForm({ ...unitForm, bedrooms: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bathrooms *</Label>
                <Input
                  type="number"
                  value={unitForm.bathrooms}
                  onChange={(e) => setUnitForm({ ...unitForm, bathrooms: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Area (sqft) *</Label>
                <Input
                  type="number"
                  value={unitForm.area_sqft}
                  onChange={(e) => setUnitForm({ ...unitForm, area_sqft: parseInt(e.target.value) || 0 })}
                  placeholder="1200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rent Amount (AED) *</Label>
                <Input
                  type="number"
                  value={unitForm.rent_amount}
                  onChange={(e) => setUnitForm({ ...unitForm, rent_amount: parseInt(e.target.value) || 0 })}
                  placeholder="90000"
                />
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={unitForm.status}
                  onValueChange={(value: 'vacant' | 'occupied') => setUnitForm({ ...unitForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {unitForm.status === 'occupied' && (
              <>
                <div className="space-y-2">
                  <Label>Tenant Name *</Label>
                  <Input
                    value={unitForm.tenant_name}
                    onChange={(e) => setUnitForm({ ...unitForm, tenant_name: e.target.value })}
                    placeholder="Ahmed Hassan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contract Start Date *</Label>
                    <Input
                      type="date"
                      value={unitForm.contract_start_date}
                      onChange={(e) => setUnitForm({ ...unitForm, contract_start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contract End Date *</Label>
                    <Input
                      type="date"
                      value={unitForm.contract_end_date}
                      onChange={(e) => setUnitForm({ ...unitForm, contract_end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Number of Payments *</Label>
                  <Select
                    value={unitForm.number_of_payments.toString()}
                    onValueChange={(value) => setUnitForm({ ...unitForm, number_of_payments: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Payment (Full Year)</SelectItem>
                      <SelectItem value="2">2 Payments (Semi-Annual)</SelectItem>
                      <SelectItem value="3">3 Payments</SelectItem>
                      <SelectItem value="4">4 Payments (Quarterly)</SelectItem>
                      <SelectItem value="6">6 Payments (Bi-Monthly)</SelectItem>
                      <SelectItem value="12">12 Payments (Monthly)</SelectItem>
                    </SelectContent>
                  </Select>
                  {unitForm.number_of_payments > 0 && unitForm.rent_amount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Each payment: AED {(unitForm.rent_amount / unitForm.number_of_payments).toLocaleString()}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUnitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUnit} data-primary="true">
              Create Unit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
