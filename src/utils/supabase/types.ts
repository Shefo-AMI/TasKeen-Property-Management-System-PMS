// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>
      }
      tenants: {
        Row: Tenant
        Insert: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Tenant, 'id' | 'created_at' | 'updated_at'>>
      }
      leases: {
        Row: Lease
        Insert: Omit<Lease, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lease, 'id' | 'created_at' | 'updated_at'>>
      }
      maintenance_tickets: {
        Row: MaintenanceTicket
        Insert: Omit<MaintenanceTicket, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MaintenanceTicket, 'id' | 'created_at' | 'updated_at'>>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'created_at'>
        Update: Partial<Omit<Document, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Property {
  id: string
  company_id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  property_type: 'residential' | 'commercial' | 'mixed' | 'industrial'
  units: number
  year_built: number
  total_area: number
  monthly_rent: number
  status: 'active' | 'inactive' | 'maintenance'
  occupancy_rate: number
  description?: string
  amenities?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  alternate_phone?: string
  date_of_birth: string
  national_id: string
  occupation: string
  employer_name?: string
  emergency_contact: string
  emergency_phone: string
  move_in_date: string
  lease_end_date?: string
  monthly_rent: number
  security_deposit: number
  property_id: string
  unit_number: string
  status: 'active' | 'pending' | 'inactive' | 'evicted'
  payment_status: 'current' | 'late' | 'delinquent'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Lease {
  id: string
  company_id: string
  property_id: string
  unit_number: string
  tenant_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  security_deposit: number
  payment_due_day: number
  late_fee_amount?: number
  late_fee_grace_period?: number
  lease_type: 'fixed' | 'month_to_month' | 'yearly'
  renewal_option: 'auto_renew' | 'manual' | 'no_renewal'
  pet_allowed?: boolean
  pet_deposit?: number
  smoking_allowed?: boolean
  utilities_included?: string
  parking_spaces?: number
  special_terms?: string
  notes?: string
  status: 'draft' | 'active' | 'expiring_soon' | 'expired' | 'terminated'
  signed_date?: string
  document_url?: string
  created_at: string
  updated_at: string
}

export interface MaintenanceTicket {
  id: string
  company_id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other'
  property_id: string
  unit_number?: string
  tenant_id?: string
  assigned_to?: string
  estimated_cost?: number
  actual_cost?: number
  scheduled_date?: string
  completed_at?: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  created_by: string
  notes?: string
  before_photos?: string[]
  after_photos?: string[]
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  company_id: string
  name: string
  type: string
  size: number
  url: string
  category: 'lease' | 'inspection' | 'maintenance' | 'invoice' | 'photo' | 'other'
  linked_to: 'property' | 'tenant' | 'lease' | 'maintenance'
  linked_id: string
  linked_name: string
  uploaded_by: string
  description?: string
  created_at: string
}

// Permissions type
export type UserRole = 'platform_admin' | 'company_admin' | 'employee'

export interface Permission {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  canViewAll: boolean // Can view all company data
  canManageUsers: boolean
}
