import { UserRole, Permission } from './supabase/types'

/**
 * Get permissions based on user role
 */
export function getPermissions(role: UserRole): Permission {
  switch (role) {
    case 'platform_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canViewAll: true,
        canManageUsers: true,
      }
    
    case 'company_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canViewAll: true, // Can view all company data
        canManageUsers: true,
      }
    
    case 'employee':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: false, // Cannot update
        canDelete: false, // Cannot delete
        canViewAll: false, // Can only view assigned data
        canManageUsers: false,
      }
    
    default:
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canViewAll: false,
        canManageUsers: false,
      }
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  role: UserRole,
  action: 'create' | 'read' | 'update' | 'delete' | 'viewAll' | 'manageUsers'
): boolean {
  const permissions = getPermissions(role)
  
  switch (action) {
    case 'create':
      return permissions.canCreate
    case 'read':
      return permissions.canRead
    case 'update':
      return permissions.canUpdate
    case 'delete':
      return permissions.canDelete
    case 'viewAll':
      return permissions.canViewAll
    case 'manageUsers':
      return permissions.canManageUsers
    default:
      return false
  }
}

/**
 * Get permission description for UI
 */
export function getPermissionDescription(role: UserRole): string {
  switch (role) {
    case 'platform_admin':
      return 'Full access to all platform features and all companies'
    case 'company_admin':
      return 'Full access to company data, properties, tenants, and settings'
    case 'employee':
      return 'Can view and create records, but cannot edit or delete'
    default:
      return 'No permissions'
  }
}
