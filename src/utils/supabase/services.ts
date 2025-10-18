import { supabase } from './client'
import type { Property, Tenant, Lease, MaintenanceTicket, Document } from './types'

/**
 * Property Services
 */
export const propertyService = {
  async getAll(companyId: string, searchTerm?: string) {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data as Property[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Property
  },

  async create(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        ...property,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) throw error
    return data as Property
  },

  async update(id: string, updates: Partial<Property>) {
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Property
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async filter(companyId: string, filters: {
    propertyType?: string
    status?: string
    minRent?: number
    maxRent?: number
  }) {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('company_id', companyId)

    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.minRent !== undefined) {
      query = query.gte('monthly_rent', filters.minRent)
    }
    if (filters.maxRent !== undefined) {
      query = query.lte('monthly_rent', filters.maxRent)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Property[]
  }
}

/**
 * Tenant Services
 */
export const tenantService = {
  async getAll(companyId: string, searchTerm?: string) {
    let query = supabase
      .from('tenants')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data as Tenant[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Tenant
  },

  async create(tenant: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tenants')
      .insert([{
        ...tenant,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) throw error
    return data as Tenant
  },

  async update(id: string, updates: Partial<Tenant>) {
    const { data, error } = await supabase
      .from('tenants')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Tenant
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async filter(companyId: string, filters: {
    propertyId?: string
    status?: string
    paymentStatus?: string
  }) {
    let query = supabase
      .from('tenants')
      .select('*')
      .eq('company_id', companyId)

    if (filters.propertyId) {
      query = query.eq('property_id', filters.propertyId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Tenant[]
  }
}

/**
 * Lease Services
 */
export const leaseService = {
  async getAll(companyId: string, searchTerm?: string) {
    let query = supabase
      .from('leases')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`unit_number.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data as Lease[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Lease
  },

  async create(lease: Omit<Lease, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('leases')
      .insert([{
        ...lease,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) throw error
    return data as Lease
  },

  async update(id: string, updates: Partial<Lease>) {
    const { data, error } = await supabase
      .from('leases')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Lease
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('leases')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async filter(companyId: string, filters: {
    propertyId?: string
    tenantId?: string
    status?: string
    leaseType?: string
  }) {
    let query = supabase
      .from('leases')
      .select('*')
      .eq('company_id', companyId)

    if (filters.propertyId) {
      query = query.eq('property_id', filters.propertyId)
    }
    if (filters.tenantId) {
      query = query.eq('tenant_id', filters.tenantId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.leaseType) {
      query = query.eq('lease_type', filters.leaseType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Lease[]
  }
}

/**
 * Maintenance Services
 */
export const maintenanceService = {
  async getAll(companyId: string, searchTerm?: string) {
    let query = supabase
      .from('maintenance_tickets')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data as MaintenanceTicket[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as MaintenanceTicket
  },

  async create(ticket: Omit<MaintenanceTicket, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .insert([{
        ...ticket,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) throw error
    return data as MaintenanceTicket
  },

  async update(id: string, updates: Partial<MaintenanceTicket>) {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MaintenanceTicket
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('maintenance_tickets')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async complete(id: string, actualCost: number, afterPhotos: string[]) {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .update({
        status: 'completed',
        actual_cost: actualCost,
        after_photos: afterPhotos,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MaintenanceTicket
  },

  async filter(companyId: string, filters: {
    propertyId?: string
    priority?: string
    status?: string
    category?: string
  }) {
    let query = supabase
      .from('maintenance_tickets')
      .select('*')
      .eq('company_id', companyId)

    if (filters.propertyId) {
      query = query.eq('property_id', filters.propertyId)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data as MaintenanceTicket[]
  }
}

/**
 * Document Services
 */
export const documentService = {
  async getAll(companyId: string, linkedTo?: string, linkedId?: string) {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (linkedTo && linkedId) {
      query = query.eq('linked_to', linkedTo).eq('linked_id', linkedId)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data as Document[]
  },

  async create(document: Omit<Document, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        ...document,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) throw error
    return data as Document
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file)

    if (error) throw error
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(path)

    return urlData.publicUrl
  },

  async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('documents')
      .remove([path])

    if (error) throw error
  }
}

/**
 * Initialize database tables (for development/testing)
 * Note: In production, use Supabase migrations
 */
export async function initializeTables() {
  // This would typically be done through Supabase migrations
  // Keeping this as a reference for table structure
  console.log('Tables should be created using Supabase migrations')
}
