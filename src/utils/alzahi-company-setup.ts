/**
 * ALZAHI PROPERTY MANAGEMENT & GENERAL MAINTENANCE
 * Company Setup and Initial Data
 */

import companyLogo from 'figma:asset/af2600a9f374c13b4cde70b7f5737a1703c9a037.png';

export const ALZAHI_COMPANY = {
  id: 'alzahi-property-management',
  name: 'ALZAHI PROPERTY MANAGEMENT & GENERAL MAINTENANCE',
  shortName: 'ALZAHI PM',
  logo: companyLogo,
  address: {
    street: 'ALFAKHR STREET',
    area: 'ALZAHIYAH',
    city: 'ABU DHABI',
    country: 'UNITED ARAB EMIRATES',
    fullAddress: 'ALFAKHR STREET, ALZAHIYAH, ABU DHABI, UNITED ARAB EMIRATES'
  },
  contact: {
    email: 'info@al-zahi.ae',
    phone: '+971-XX-XXX-XXXX'
  },
  settings: {
    currency: 'AED',
    timezone: 'Asia/Dubai',
    language: 'en'
  }
};

export const ALZAHI_USERS = [
  {
    email: 'nour@al-zahi.ae',
    password: 'al-zahi2012',
    fullName: 'Nour Al-Zahi',
    role: 'company_admin', // Same authorities as admin
    companyId: ALZAHI_COMPANY.id,
    companyName: ALZAHI_COMPANY.name,
    permissions: ['all'], // Full access
    status: 'active',
    department: 'Management'
  },
  {
    email: 'mawia@al-zahi.ae',
    password: 'al-zahi2012',
    fullName: 'Mawia Al-Zahi',
    role: 'company_admin', // Same authorities as admin
    companyId: ALZAHI_COMPANY.id,
    companyName: ALZAHI_COMPANY.name,
    permissions: ['all'], // Full access
    status: 'active',
    department: 'Management'
  },
  {
    email: 'tareq@al-zahi.ae',
    password: 'al-zahi2012',
    fullName: 'Tareq Al-Zahi',
    role: 'maintenance_staff', // Maintenance team member
    companyId: ALZAHI_COMPANY.id,
    companyName: ALZAHI_COMPANY.name,
    permissions: ['maintenance_read', 'maintenance_write', 'maintenance_update'], // Only maintenance access
    status: 'active',
    department: 'Maintenance'
  },
  {
    email: 'ayham@al-zahi.ae',
    password: 'al-zahi2012',
    fullName: 'Ayham Al-Zahi',
    role: 'maintenance_staff', // Maintenance team member
    companyId: ALZAHI_COMPANY.id,
    companyName: ALZAHI_COMPANY.name,
    permissions: ['maintenance_read', 'maintenance_write', 'maintenance_update'], // Only maintenance access
    status: 'active',
    department: 'Maintenance'
  }
];

export const ALZAHI_PROPERTIES = [
  {
    id: 'almeknas-146',
    name: 'ALMEKNAS BUILDING 146',
    type: 'mixed', // Residential & Commercial
    address: {
      street: 'ALMEKNAS',
      building: '146',
      area: 'ALZAHIYAH',
      city: 'ABU DHABI',
      country: 'UAE'
    },
    owner: {
      name: '(TO BE UPDATED)',
      contact: ''
    },
    totalUnits: 105,
    units: {
      apartments: 97,
      shops: 8
    },
    companyId: ALZAHI_COMPANY.id,
    status: 'active',
    yearBuilt: null,
    floors: null
  },
  {
    id: 'al-sharjah-346',
    name: 'AL SHARJAH 346',
    type: 'mixed', // Residential & Commercial
    address: {
      street: 'AL SHARJAH',
      building: '346',
      area: 'ALZAHIYAH',
      city: 'ABU DHABI',
      country: 'UAE'
    },
    owner: {
      name: 'MR. SAIF RASHED AL NUIMI',
      contact: ''
    },
    totalUnits: 51,
    units: {
      apartments: 48,
      shops: 3
    },
    companyId: ALZAHI_COMPANY.id,
    status: 'active',
    yearBuilt: null,
    floors: null
  },
  {
    id: 'al-bahiyah',
    name: 'AL BAHIYAH BUILDING',
    type: 'residential', // Residential only
    address: {
      street: 'AL BAHIYAH',
      building: '',
      area: 'ALZAHIYAH',
      city: 'ABU DHABI',
      country: 'UAE'
    },
    owner: {
      name: 'MR. SAIF RASHED AL NUIMI',
      contact: ''
    },
    totalUnits: 5,
    units: {
      apartments: 5,
      shops: 0
    },
    companyId: ALZAHI_COMPANY.id,
    status: 'active',
    yearBuilt: null,
    floors: null
  }
];

export const ROLE_PERMISSIONS = {
  platform_admin: {
    label: 'Platform Administrator',
    description: 'Full system access',
    permissions: ['all']
  },
  company_admin: {
    label: 'Company Manager',
    description: 'Full company access - same as admin',
    permissions: [
      'properties_all',
      'units_all',
      'tenants_all',
      'leases_all',
      'maintenance_all',
      'accounting_all',
      'payments_all',
      'reports_all',
      'users_manage',
      'settings_manage'
    ]
  },
  maintenance_staff: {
    label: 'Maintenance Team',
    description: 'Maintenance tasks only',
    permissions: [
      'maintenance_read',
      'maintenance_write',
      'maintenance_update',
      'maintenance_photos',
      'maintenance_comments'
    ],
    restrictedTo: ['maintenance'] // Only access maintenance section
  },
  employee: {
    label: 'Employee',
    description: 'Limited access',
    permissions: [
      'properties_read',
      'units_read',
      'tenants_read',
      'maintenance_read'
    ]
  }
};

export function hasPermission(userRole: string, permission: string): boolean {
  const rolePerms = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  if (!rolePerms) return false;
  
  // Platform admin and company admin have all permissions
  if (rolePerms.permissions.includes('all')) return true;
  
  // Check specific permission
  return rolePerms.permissions.includes(permission);
}

export function canAccessSection(userRole: string, section: string): boolean {
  const rolePerms = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  if (!rolePerms) return false;
  
  // Platform admin and company admin can access all
  if (rolePerms.permissions.includes('all')) return true;
  
  // Check if role is restricted to specific sections
  if (rolePerms.restrictedTo) {
    return rolePerms.restrictedTo.includes(section);
  }
  
  // Check if user has relevant permissions for the section
  const sectionPermissions: Record<string, string[]> = {
    overview: ['all', 'properties_read'],
    buildings: ['all', 'properties_all', 'properties_read'],
    properties: ['all', 'properties_all', 'properties_read'],
    units: ['all', 'units_all', 'units_read'],
    maintenance: ['all', 'maintenance_all', 'maintenance_read'],
    accounting: ['all', 'accounting_all', 'accounting_read'],
    leases: ['all', 'leases_all', 'leases_read'],
    payments: ['all', 'payments_all', 'payments_read'],
    reports: ['all', 'reports_all', 'reports_read'],
    documents: ['all', 'properties_all', 'properties_read'],
    settings: ['all', 'settings_manage']
  };
  
  const requiredPerms = sectionPermissions[section] || [];
  return requiredPerms.some(perm => rolePerms.permissions.includes(perm));
}

export default {
  ALZAHI_COMPANY,
  ALZAHI_USERS,
  ALZAHI_PROPERTIES,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessSection
};
