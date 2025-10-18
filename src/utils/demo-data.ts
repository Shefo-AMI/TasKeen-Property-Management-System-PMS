// Comprehensive demo data for PropertyFlow
export interface Property {
  id: string
  name: string
  address: string
  city: string
  country: string
  type: 'Residential' | 'Commercial' | 'Mixed Use' | 'Heritage'
  units: number
  totalSqft: number
  yearBuilt: number
  occupancyRate: number
  monthlyRent: number
  monthlyRevenue: number
  status: 'Active' | 'Under Construction' | 'Maintenance'
  imageUrl?: string
  walkthrough3D?: string
  amenities: string[]
  description: string
  manager: string
  createdAt: string
  updatedAt: string
}

export interface Unit {
  id: string
  propertyId: string
  propertyName: string
  unitNumber: string
  floor: number
  type: 'Studio' | '1BR' | '2BR' | '3BR' | '4BR' | 'Penthouse' | 'Office' | 'Retail'
  bedrooms: number
  bathrooms: number
  sqft: number
  rent: number
  deposit: number
  status: 'occupied' | 'vacant' | 'maintenance' | 'reserved'
  furnished: boolean
  balcony: boolean
  parking: boolean
  tenant?: Tenant
  lastInspection?: string
  nextInspection?: string
  images: string[]
  amenities: string[]
  description: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  emiratesId: string
  passportNumber: string
  occupation: string
  company: string
  monthlyIncome: number
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  moveInDate: string
  leaseStart: string
  leaseEnd: string
  rentAmount: number
  depositAmount: number
  status: 'active' | 'pending' | 'moved_out' | 'evicted'
  unitId: string
  unitNumber: string
  propertyName: string
  documents: {
    id: string
    name: string
    type: string
    uploadDate: string
  }[]
  paymentHistory: Payment[]
  maintenanceRequests: MaintenanceRequest[]
  notes: string
  creditScore: number
  previousAddress: string
  createdAt: string
  updatedAt: string
}

export interface MaintenanceRequest {
  id: string
  propertyId: string
  propertyName: string
  unitId: string
  unitNumber: string
  tenantId?: string
  tenantName?: string
  title: string
  description: string
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Appliances' | 'Structural' | 'Cleaning' | 'Painting' | 'Security' | 'General'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'assigned' | 'in_progress' | 'pending_parts' | 'completed' | 'cancelled'
  assignee?: string
  vendor?: string
  estimatedCost: number
  actualCost: number
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  completedDate?: string
  images: {
    id: string
    url: string
    type: 'before' | 'progress' | 'after'
    description: string
    uploadDate: string
  }[]
  timeTracking: {
    start?: string
    end?: string
    duration?: number
    description: string
  }[]
  invoice?: {
    id: string
    amount: number
    status: 'draft' | 'sent' | 'paid'
  }
  notes: string[]
}

export interface Payment {
  id: string
  tenantId: string
  tenantName: string
  unitId: string
  unitNumber: string
  propertyName: string
  amount: number
  currency: string
  type: 'rent' | 'deposit' | 'utilities' | 'maintenance' | 'late_fee' | 'other'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'overdue'
  dueDate: string
  paidDate?: string
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'online'
  reference: string
  description: string
  late: boolean
  lateFee: number
  receiptUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Lease {
  id: string
  tenantId: string
  tenantName: string
  unitId: string
  unitNumber: string
  propertyName: string
  startDate: string
  endDate: string
  monthlyRent: number
  depositAmount: number
  currency: string
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed'
  type: 'fixed' | 'month_to_month' | 'annual'
  renewalOptions: boolean
  petPolicy: 'allowed' | 'not_allowed' | 'with_deposit'
  smokingPolicy: 'allowed' | 'not_allowed'
  sublettingAllowed: boolean
  documents: {
    id: string
    name: string
    type: string
    url: string
    signedDate?: string
  }[]
  terms: string[]
  specialConditions: string
  autoRenewal: boolean
  noticeRequired: number
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  type: 'rent' | 'maintenance' | 'utilities' | 'deposit' | 'late_fee' | 'other'
  clientType: 'tenant' | 'vendor' | 'company'
  clientId: string
  clientName: string
  clientEmail: string
  clientAddress: string
  amount: number
  currency: string
  tax: number
  totalAmount: number
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paidDate?: string
  description: string
  items: {
    id: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  relatedId?: string
  relatedType?: 'maintenance' | 'lease' | 'unit'
  template: 'standard' | 'maintenance' | 'rent' | 'custom'
  paymentTerms: string
  notes: string
  attachments: {
    id: string
    name: string
    url: string
    type: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Cleaning' | 'Security' | 'Landscaping' | 'General'
  specialties: string[]
  rating: number
  hourlyRate: number
  availability: 'available' | 'busy' | 'unavailable'
  lastJobDate?: string
  totalJobs: number
  averageResponseTime: number
  address: string
  licenseNumber: string
  insuranceExpiry: string
  emergencyContact: boolean
  preferredPaymentMethod: string
  notes: string
  documents: {
    id: string
    name: string
    type: string
    expiryDate?: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface Report {
  id: string
  name: string
  type: 'financial' | 'occupancy' | 'maintenance' | 'tenant' | 'property' | 'custom'
  dateRange: {
    start: string
    end: string
  }
  data: any
  generatedAt: string
  generatedBy: string
  format: 'pdf' | 'excel' | 'csv'
  url?: string
}

// Demo Data Generation
export const demoProperties: Property[] = [
  {
    id: 'prop-001',
    name: 'Burj Al Marina Residence',
    address: 'Dubai Marina Walk, Marina District',
    city: 'Dubai',
    country: 'UAE',
    type: 'Residential',
    units: 45,
    totalSqft: 55000,
    yearBuilt: 2019,
    occupancyRate: 92.3,
    monthlyRent: 85000,
    monthlyRevenue: 1530000,
    status: 'Active',
    walkthrough3D: 'https://virtual-tour.example.com/marina-towers',
    amenities: ['Swimming Pool', 'Gym', 'Concierge', 'Parking', 'Security'],
    description: 'Luxury residential tower with stunning marina views',
    manager: 'Ahmed Al-Mansouri',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'prop-002',
    name: 'Business Bay Executive Center',
    address: 'Business Bay Boulevard, Business Bay',
    city: 'Dubai',
    country: 'UAE',
    type: 'Commercial',
    units: 28,
    totalSqft: 42000,
    yearBuilt: 2020,
    occupancyRate: 85.7,
    monthlyRent: 125000,
    monthlyRevenue: 2800000,
    status: 'Active',
    amenities: ['Conference Rooms', 'High Speed Internet', 'Parking', 'Reception'],
    description: 'Modern office complex in the heart of Business Bay',
    manager: 'Sarah Johnson',
    createdAt: '2023-03-20',
    updatedAt: '2024-01-10'
  },
  {
    id: 'prop-003',
    name: 'Al Ain Heritage Villas',
    address: 'Al Ain Heritage District, Al Ain',
    city: 'Al Ain',
    country: 'UAE',
    type: 'Heritage',
    units: 12,
    totalSqft: 18000,
    yearBuilt: 1985,
    occupancyRate: 100,
    monthlyRent: 35000,
    monthlyRevenue: 420000,
    status: 'Active',
    amenities: ['Garden', 'Traditional Architecture', 'Parking', 'Cultural Tours'],
    description: 'Traditional UAE heritage villas with modern amenities',
    manager: 'Mohammed Al-Zaabi',
    createdAt: '2023-06-10',
    updatedAt: '2024-01-05'
  },
  {
    id: 'prop-004',
    name: 'Downtown Heights',
    address: 'Sheikh Zayed Road, Downtown Dubai',
    city: 'Dubai',
    country: 'UAE',
    type: 'Mixed Use',
    units: 65,
    totalSqft: 78000,
    yearBuilt: 2021,
    occupancyRate: 88.5,
    monthlyRent: 145000,
    monthlyRevenue: 3480000,
    status: 'Active',
    amenities: ['Shopping Mall', 'Restaurants', 'Gym', 'Pool', 'Metro Access'],
    description: 'Mixed-use development with retail and residential units',
    manager: 'Fatima Al-Rashid',
    createdAt: '2023-08-15',
    updatedAt: '2024-01-12'
  },
  {
    id: 'prop-005',
    name: 'Sharjah Cultural Complex',
    address: 'Heart of Sharjah, Sharjah',
    city: 'Sharjah',
    country: 'UAE',
    type: 'Heritage',
    units: 20,
    totalSqft: 25000,
    yearBuilt: 1990,
    occupancyRate: 95.0,
    monthlyRent: 48000,
    monthlyRevenue: 912000,
    status: 'Active',
    amenities: ['Art Galleries', 'Museum Access', 'Traditional Souqs', 'Cultural Events'],
    description: 'Heritage complex showcasing Emirati culture and traditions',
    manager: 'Hassan Al-Sharqi',
    createdAt: '2023-11-01',
    updatedAt: '2024-01-08'
  }
]

export const demoUnits: Unit[] = [
  {
    id: 'unit-001',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitNumber: '1205',
    floor: 12,
    type: '2BR',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    rent: 8500,
    deposit: 17000,
    status: 'occupied',
    furnished: true,
    balcony: true,
    parking: true,
    images: ['unit1-1.jpg', 'unit1-2.jpg'],
    amenities: ['Balcony', 'Built-in Wardrobes', 'Kitchen Appliances'],
    description: 'Spacious 2-bedroom apartment with marina views',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'unit-002',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitNumber: '0803',
    floor: 8,
    type: '1BR',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 850,
    rent: 6500,
    deposit: 13000,
    status: 'vacant',
    furnished: false,
    balcony: true,
    parking: true,
    images: ['unit2-1.jpg'],
    amenities: ['Balcony', 'Built-in Wardrobes'],
    description: 'Cozy 1-bedroom apartment, recently renovated',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-10'
  },
  {
    id: 'unit-003',
    propertyId: 'prop-002',
    propertyName: 'Business Bay Executive Center',
    unitNumber: '1501',
    floor: 15,
    type: 'Office',
    bedrooms: 0,
    bathrooms: 2,
    sqft: 1800,
    rent: 12000,
    deposit: 24000,
    status: 'occupied',
    furnished: true,
    balcony: false,
    parking: true,
    images: ['office1-1.jpg'],
    amenities: ['Conference Room', 'Reception Area', 'Pantry'],
    description: 'Executive office suite with city views',
    createdAt: '2023-03-20',
    updatedAt: '2024-01-08'
  },
  {
    id: 'unit-004',
    propertyId: 'prop-003',
    propertyName: 'Al Ain Heritage Villas',
    unitNumber: 'V001',
    floor: 1,
    type: '3BR',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2200,
    rent: 4500,
    deposit: 9000,
    status: 'occupied',
    furnished: false,
    balcony: true,
    parking: true,
    images: ['villa1-1.jpg', 'villa1-2.jpg'],
    amenities: ['Garden', 'Traditional Architecture', 'Private Entrance', 'Majlis'],
    description: 'Traditional UAE heritage villa with modern amenities',
    createdAt: '2023-06-10',
    updatedAt: '2024-01-05'
  },
  {
    id: 'unit-005',
    propertyId: 'prop-004',
    propertyName: 'Downtown Heights',
    unitNumber: '2105',
    floor: 21,
    type: '2BR',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1400,
    rent: 9500,
    deposit: 19000,
    status: 'vacant',
    furnished: true,
    balcony: true,
    parking: true,
    images: ['downtown1-1.jpg'],
    amenities: ['City Views', 'Metro Access', 'Mall Access', 'Pool'],
    description: 'Modern 2-bedroom with stunning city and Burj Khalifa views',
    createdAt: '2023-08-15',
    updatedAt: '2024-01-12'
  },
  {
    id: 'unit-006',
    propertyId: 'prop-005',
    propertyName: 'Sharjah Cultural Complex',
    unitNumber: 'S102',
    floor: 1,
    type: '1BR',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 900,
    rent: 3200,
    deposit: 6400,
    status: 'occupied',
    furnished: false,
    balcony: false,
    parking: true,
    images: ['sharjah1-1.jpg'],
    amenities: ['Cultural Access', 'Souk Access', 'Traditional Design'],
    description: 'Cultural apartment in the heart of heritage Sharjah',
    createdAt: '2023-11-01',
    updatedAt: '2024-01-08'
  }
]

export const demoTenants: Tenant[] = [
  {
    id: 'tenant-001',
    firstName: 'Omar',
    lastName: 'Al-Hassan',
    email: 'omar.hassan@email.com',
    phone: '+971-50-123-4567',
    nationality: 'UAE',
    emiratesId: '784-1985-1234567-8',
    passportNumber: 'A12345678',
    occupation: 'Software Engineer',
    company: 'Emirates Tech Solutions',
    monthlyIncome: 15000,
    emergencyContact: {
      name: 'Amina Al-Hassan',
      phone: '+971-50-987-6543',
      relationship: 'Spouse'
    },
    moveInDate: '2023-06-01',
    leaseStart: '2023-06-01',
    leaseEnd: '2024-05-31',
    rentAmount: 8500,
    depositAmount: 17000,
    status: 'active',
    unitId: 'unit-001',
    unitNumber: '1205',
    propertyName: 'Burj Al Marina Residence',
    documents: [
      {
        id: 'doc-001',
        name: 'Emirates ID Copy',
        type: 'identification',
        uploadDate: '2023-05-15'
      },
      {
        id: 'doc-002',
        name: 'Salary Certificate',
        type: 'income',
        uploadDate: '2023-05-15'
      }
    ],
    paymentHistory: [],
    maintenanceRequests: [],
    notes: 'Excellent tenant, always pays on time',
    creditScore: 750,
    previousAddress: 'Al Barsha, Dubai',
    createdAt: '2023-05-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'tenant-002',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+971-55-876-5432',
    nationality: 'British',
    emiratesId: '784-1990-2345678-9',
    passportNumber: 'B87654321',
    occupation: 'Marketing Manager',
    company: 'Global Marketing FZ',
    monthlyIncome: 18000,
    emergencyContact: {
      name: 'James Mitchell',
      phone: '+971-55-123-4567',
      relationship: 'Brother'
    },
    moveInDate: '2023-09-01',
    leaseStart: '2023-09-01',
    leaseEnd: '2024-08-31',
    rentAmount: 12000,
    depositAmount: 24000,
    status: 'active',
    unitId: 'unit-003',
    unitNumber: '1501',
    propertyName: 'Business Bay Executive Center',
    documents: [
      {
        id: 'doc-003',
        name: 'Passport Copy',
        type: 'identification',
        uploadDate: '2023-08-20'
      }
    ],
    paymentHistory: [],
    maintenanceRequests: [],
    notes: 'Business tenant, professional and reliable',
    creditScore: 780,
    previousAddress: 'DIFC, Dubai',
    createdAt: '2023-08-20',
    updatedAt: '2024-01-12'
  },
  {
    id: 'tenant-003',
    firstName: 'Mohammed',
    lastName: 'Al-Zaabi',
    email: 'mohammed.zaabi@email.com',
    phone: '+971-50-444-5555',
    nationality: 'UAE',
    emiratesId: '784-1988-3456789-0',
    passportNumber: 'UAE123456',
    occupation: 'Cultural Coordinator',
    company: 'Sharjah Heritage Authority',
    monthlyIncome: 12000,
    emergencyContact: {
      name: 'Fatima Al-Zaabi',
      phone: '+971-50-444-6666',
      relationship: 'Sister'
    },
    moveInDate: '2023-12-01',
    leaseStart: '2023-12-01',
    leaseEnd: '2024-11-30',
    rentAmount: 3200,
    depositAmount: 6400,
    status: 'active',
    unitId: 'unit-006',
    unitNumber: 'S102',
    propertyName: 'Sharjah Cultural Complex',
    documents: [
      {
        id: 'doc-004',
        name: 'Emirates ID Copy',
        type: 'identification',
        uploadDate: '2023-11-15'
      }
    ],
    paymentHistory: [],
    maintenanceRequests: [],
    notes: 'Local tenant, very respectful of cultural heritage',
    creditScore: 720,
    previousAddress: 'Al Nahda, Sharjah',
    createdAt: '2023-11-15',
    updatedAt: '2024-01-08'
  },
  {
    id: 'tenant-004',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    email: 'elena.rodriguez@email.com',
    phone: '+971-56-777-8888',
    nationality: 'Spanish',
    emiratesId: '784-1992-4567890-1',
    passportNumber: 'ESP987654',
    occupation: 'Architect',
    company: 'Emirates Architecture',
    monthlyIncome: 22000,
    emergencyContact: {
      name: 'Carlos Rodriguez',
      phone: '+34-600-123-456',
      relationship: 'Brother'
    },
    moveInDate: '2024-01-15',
    leaseStart: '2024-01-15',
    leaseEnd: '2025-01-14',
    rentAmount: 9500,
    depositAmount: 19000,
    status: 'pending',
    unitId: 'unit-005',
    unitNumber: '2105',
    propertyName: 'Downtown Heights',
    documents: [
      {
        id: 'doc-005',
        name: 'Passport Copy',
        type: 'identification',
        uploadDate: '2024-01-10'
      },
      {
        id: 'doc-006',
        name: 'Employment Letter',
        type: 'income',
        uploadDate: '2024-01-10'
      }
    ],
    paymentHistory: [],
    maintenanceRequests: [],
    notes: 'New tenant, application in process',
    creditScore: 800,
    previousAddress: 'Barcelona, Spain',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  }
]

export const demoMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint-001',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-001',
    unitNumber: '1205',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    title: 'AC Unit Not Cooling Properly',
    description: 'The main bedroom AC unit is not cooling efficiently. Temperature remains high even on maximum setting.',
    category: 'HVAC',
    priority: 'high',
    status: 'assigned',
    assignee: 'Ahmed Hassan - HVAC Specialist',
    vendor: 'CoolTech Services',
    estimatedCost: 500,
    actualCost: 0,
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    scheduledDate: '2024-01-16T10:00:00Z',
    images: [
      {
        id: 'img-001',
        url: 'ac-unit-before.jpg',
        type: 'before',
        description: 'AC unit before repair',
        uploadDate: '2024-01-15T09:35:00Z'
      }
    ],
    timeTracking: [],
    notes: ['Tenant reported issue this morning', 'Scheduled for tomorrow morning']
  },
  {
    id: 'maint-002',
    propertyId: 'prop-002',
    propertyName: 'Business Bay Executive Center',
    unitId: 'unit-003',
    unitNumber: '1501',
    tenantId: 'tenant-002',
    tenantName: 'Sarah Mitchell',
    title: 'Conference Room Projector Malfunction',
    description: 'The conference room projector is displaying distorted colors and occasionally shuts off.',
    category: 'Electrical',
    priority: 'medium',
    status: 'completed',
    assignee: 'Tech Solutions UAE',
    vendor: 'ElectroFix Dubai',
    estimatedCost: 300,
    actualCost: 280,
    createdAt: '2024-01-10T11:15:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
    scheduledDate: '2024-01-11T14:00:00Z',
    completedDate: '2024-01-12T16:30:00Z',
    images: [
      {
        id: 'img-002',
        url: 'projector-before.jpg',
        type: 'before',
        description: 'Projector showing color distortion',
        uploadDate: '2024-01-10T11:20:00Z'
      },
      {
        id: 'img-003',
        url: 'projector-after.jpg',
        type: 'after',
        description: 'Projector working normally after repair',
        uploadDate: '2024-01-12T16:25:00Z'
      }
    ],
    timeTracking: [
      {
        start: '2024-01-11T14:00:00Z',
        end: '2024-01-11T16:30:00Z',
        duration: 150,
        description: 'Initial diagnosis and part ordering'
      },
      {
        start: '2024-01-12T15:00:00Z',
        end: '2024-01-12T16:30:00Z',
        duration: 90,
        description: 'Part installation and testing'
      }
    ],
    invoice: {
      id: 'inv-002',
      amount: 280,
      status: 'sent'
    },
    notes: ['Issue resolved by replacing lamp and color wheel', 'Tenant satisfied with repair quality']
  },
  {
    id: 'maint-003',
    propertyId: 'prop-003',
    propertyName: 'Al Ain Heritage Villas',
    unitId: 'unit-004',
    unitNumber: 'V001',
    tenantId: 'tenant-003',
    tenantName: 'Mohammed Al-Zaabi',
    title: 'Traditional Door Restoration',
    description: 'Restore traditional wooden entrance door to maintain heritage character',
    category: 'Structural',
    priority: 'medium',
    status: 'open',
    assignee: 'Heritage Restoration Specialists',
    vendor: 'Al Ain Traditional Crafts',
    estimatedCost: 2500,
    actualCost: 0,
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-18T08:00:00Z',
    scheduledDate: '2024-01-25T09:00:00Z',
    images: [
      {
        id: 'img-004',
        url: 'door-restoration-before.jpg',
        type: 'before',
        description: 'Traditional door showing wear',
        uploadDate: '2024-01-18T08:10:00Z'
      }
    ],
    timeTracking: [],
    notes: ['Maintain traditional craftsmanship methods', 'Use authentic materials only']
  },
  {
    id: 'maint-004',
    propertyId: 'prop-004',
    propertyName: 'Downtown Heights',
    unitId: 'unit-005',
    unitNumber: '2105',
    title: 'Smart Home System Setup',
    description: 'Install and configure smart home automation system for new tenant',
    category: 'Electrical',
    priority: 'low',
    status: 'scheduled',
    assignee: 'Smart Tech Solutions',
    vendor: 'Dubai Smart Home',
    estimatedCost: 1200,
    actualCost: 0,
    createdAt: '2024-01-16T15:30:00Z',
    updatedAt: '2024-01-16T15:30:00Z',
    scheduledDate: '2024-01-22T10:00:00Z',
    images: [],
    timeTracking: [],
    notes: ['Include smart lighting, climate control, and security', 'Provide tenant training']
  },
  {
    id: 'maint-005',
    propertyId: 'prop-005',
    propertyName: 'Sharjah Cultural Complex',
    unitId: 'unit-006',
    unitNumber: 'S102',
    tenantId: 'tenant-003',
    tenantName: 'Mohammed Al-Zaabi',
    title: 'Traditional Tile Replacement',
    description: 'Replace damaged traditional ceramic tiles in bathroom',
    category: 'General',
    priority: 'high',
    status: 'assigned',
    assignee: 'Heritage Maintenance Team',
    vendor: 'Sharjah Traditional Tiles',
    estimatedCost: 800,
    actualCost: 0,
    createdAt: '2024-01-19T11:20:00Z',
    updatedAt: '2024-01-19T14:45:00Z',
    scheduledDate: '2024-01-21T08:00:00Z',
    images: [
      {
        id: 'img-005',
        url: 'damaged-tiles.jpg',
        type: 'before',
        description: 'Cracked traditional ceramic tiles',
        uploadDate: '2024-01-19T11:25:00Z'
      }
    ],
    timeTracking: [],
    notes: ['Source matching traditional tiles', 'Maintain cultural authenticity']
  }
]

export const demoPayments: Payment[] = [
  {
    id: 'pay-001',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    unitId: 'unit-001',
    unitNumber: '1205',
    propertyName: 'Burj Al Marina Residence',
    amount: 8500,
    currency: 'AED',
    type: 'rent',
    status: 'completed',
    dueDate: '2024-01-01',
    paidDate: '2023-12-28',
    paymentMethod: 'bank_transfer',
    reference: 'BT-2024-001-001',
    description: 'January 2024 Rent Payment',
    late: false,
    lateFee: 0,
    receiptUrl: 'receipt-pay-001.pdf',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-28'
  },
  {
    id: 'pay-002',
    tenantId: 'tenant-002',
    tenantName: 'Sarah Mitchell',
    unitId: 'unit-003',
    unitNumber: '1501',
    propertyName: 'Business Bay Executive Center',
    amount: 12000,
    currency: 'AED',
    type: 'rent',
    status: 'completed',
    dueDate: '2024-01-01',
    paidDate: '2024-01-02',
    paymentMethod: 'cheque',
    reference: 'CHQ-2024-002-001',
    description: 'January 2024 Office Rent',
    late: true,
    lateFee: 120,
    receiptUrl: 'receipt-pay-002.pdf',
    createdAt: '2023-12-01',
    updatedAt: '2024-01-02'
  },
  {
    id: 'pay-003',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    unitId: 'unit-001',
    unitNumber: '1205',
    propertyName: 'Burj Al Marina Residence',
    amount: 8500,
    currency: 'AED',
    type: 'rent',
    status: 'pending',
    dueDate: '2024-02-01',
    paymentMethod: 'bank_transfer',
    reference: 'BT-2024-001-002',
    description: 'February 2024 Rent Payment',
    late: false,
    lateFee: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'pay-004',
    tenantId: 'tenant-003',
    tenantName: 'Mohammed Al-Zaabi',
    unitId: 'unit-006',
    unitNumber: 'S102',
    propertyName: 'Sharjah Cultural Complex',
    amount: 3200,
    currency: 'AED',
    type: 'rent',
    status: 'completed',
    dueDate: '2024-01-01',
    paidDate: '2023-12-30',
    paymentMethod: 'bank_transfer',
    reference: 'BT-2024-003-001',
    description: 'January 2024 Rent Payment',
    late: false,
    lateFee: 0,
    receiptUrl: 'receipt-pay-004.pdf',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-30'
  },
  {
    id: 'pay-005',
    tenantId: 'tenant-003',
    tenantName: 'Mohammed Al-Zaabi',
    unitId: 'unit-006',
    unitNumber: 'S102',
    propertyName: 'Sharjah Cultural Complex',
    amount: 3200,
    currency: 'AED',
    type: 'rent',
    status: 'pending',
    dueDate: '2024-02-01',
    paymentMethod: 'bank_transfer',
    reference: 'BT-2024-003-002',
    description: 'February 2024 Rent Payment',
    late: false,
    lateFee: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'pay-006',
    tenantId: 'tenant-004',
    tenantName: 'Elena Rodriguez',
    unitId: 'unit-005',
    unitNumber: '2105',
    propertyName: 'Downtown Heights',
    amount: 19000,
    currency: 'AED',
    type: 'deposit',
    status: 'completed',
    dueDate: '2024-01-15',
    paidDate: '2024-01-12',
    paymentMethod: 'bank_transfer',
    reference: 'BT-2024-004-DEP',
    description: 'Security Deposit',
    late: false,
    lateFee: 0,
    receiptUrl: 'receipt-pay-006.pdf',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12'
  },
  {
    id: 'pay-007',
    tenantId: 'tenant-004',
    tenantName: 'Elena Rodriguez',
    unitId: 'unit-005',
    unitNumber: '2105',
    propertyName: 'Downtown Heights',
    amount: 9500,
    currency: 'AED',
    type: 'rent',
    status: 'pending',
    dueDate: '2024-02-15',
    paymentMethod: 'bank_transfer',
    reference: 'BT-2024-004-001',
    description: 'February 2024 Rent Payment (Prorated)',
    late: false,
    lateFee: 0,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
]

export const demoLeases: Lease[] = [
  {
    id: 'lease-001',
    tenantId: 'tenant-001',
    tenantName: 'Omar Al-Hassan',
    unitId: 'unit-001',
    unitNumber: '1205',
    propertyName: 'Burj Al Marina Residence',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    monthlyRent: 8500,
    depositAmount: 17000,
    currency: 'AED',
    status: 'active',
    type: 'fixed',
    renewalOptions: true,
    petPolicy: 'not_allowed',
    smokingPolicy: 'not_allowed',
    sublettingAllowed: false,
    documents: [
      {
        id: 'lease-doc-001',
        name: 'Tenancy Contract',
        type: 'contract',
        url: 'lease-001-contract.pdf',
        signedDate: '2023-05-20'
      }
    ],
    terms: [
      'Rent due on 1st of each month',
      'No pets allowed',
      'No smoking in the unit',
      '30 days notice required for termination'
    ],
    specialConditions: 'Tenant responsible for DEWA bills',
    autoRenewal: false,
    noticeRequired: 30,
    createdAt: '2023-05-20',
    updatedAt: '2023-06-01'
  },
  {
    id: 'lease-002',
    tenantId: 'tenant-002',
    tenantName: 'Sarah Mitchell',
    unitId: 'unit-003',
    unitNumber: '1501',
    propertyName: 'Business Bay Executive Center',
    startDate: '2023-09-01',
    endDate: '2024-08-31',
    monthlyRent: 12000,
    depositAmount: 24000,
    currency: 'AED',
    status: 'active',
    type: 'fixed',
    renewalOptions: true,
    petPolicy: 'not_allowed',
    smokingPolicy: 'not_allowed',
    sublettingAllowed: false,
    documents: [
      {
        id: 'lease-doc-002',
        name: 'Commercial Lease Agreement',
        type: 'contract',
        url: 'lease-002-contract.pdf',
        signedDate: '2023-08-25'
      }
    ],
    terms: [
      'Rent due on 1st of each month',
      'Business hours: 8 AM - 8 PM',
      'No residential use allowed',
      '60 days notice required for termination'
    ],
    specialConditions: 'Includes utilities and cleaning services',
    autoRenewal: false,
    noticeRequired: 60,
    createdAt: '2023-08-25',
    updatedAt: '2023-09-01'
  },
  {
    id: 'lease-003',
    tenantId: 'tenant-003',
    tenantName: 'Mohammed Al-Zaabi',
    unitId: 'unit-006',
    unitNumber: 'S102',
    propertyName: 'Sharjah Cultural Complex',
    startDate: '2023-12-01',
    endDate: '2024-11-30',
    monthlyRent: 3200,
    depositAmount: 6400,
    currency: 'AED',
    status: 'active',
    type: 'fixed',
    renewalOptions: true,
    petPolicy: 'not_allowed',
    smokingPolicy: 'not_allowed',
    sublettingAllowed: false,
    documents: [
      {
        id: 'lease-doc-003',
        name: 'Heritage Residential Lease',
        type: 'contract',
        url: 'lease-003-contract.pdf',
        signedDate: '2023-11-20'
      }
    ],
    terms: [
      'Rent due on 1st of each month',
      'Respect cultural heritage guidelines',
      'No modifications to traditional features',
      '30 days notice required for termination'
    ],
    specialConditions: 'Tenant must maintain cultural heritage aspects of the unit',
    autoRenewal: false,
    noticeRequired: 30,
    createdAt: '2023-11-20',
    updatedAt: '2023-12-01'
  },
  {
    id: 'lease-004',
    tenantId: 'tenant-004',
    tenantName: 'Elena Rodriguez',
    unitId: 'unit-005',
    unitNumber: '2105',
    propertyName: 'Downtown Heights',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    monthlyRent: 9500,
    depositAmount: 19000,
    currency: 'AED',
    status: 'active',
    type: 'fixed',
    renewalOptions: true,
    petPolicy: 'allowed',
    smokingPolicy: 'not_allowed',
    sublettingAllowed: true,
    documents: [
      {
        id: 'lease-doc-004',
        name: 'Premium Residential Lease',
        type: 'contract',
        url: 'lease-004-contract.pdf',
        signedDate: '2024-01-10'
      }
    ],
    terms: [
      'Rent due on 15th of each month',
      'Pet allowed with additional deposit',
      'No smoking in the unit',
      '60 days notice required for termination',
      'Smart home system included'
    ],
    specialConditions: 'Includes premium amenities and concierge services',
    autoRenewal: true,
    noticeRequired: 60,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  }
]

export const demoInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2024-001',
    type: 'rent',
    clientType: 'tenant',
    clientId: 'tenant-001',
    clientName: 'Omar Al-Hassan',
    clientEmail: 'omar.hassan@email.com',
    clientAddress: 'Unit 1205, Burj Al Marina Residence, Dubai Marina',
    amount: 8500,
    currency: 'AED',
    tax: 0,
    totalAmount: 8500,
    status: 'paid',
    issueDate: '2023-12-01',
    dueDate: '2024-01-01',
    paidDate: '2023-12-28',
    description: 'January 2024 Rent Payment',
    items: [
      {
        id: 'item-001',
        description: 'Monthly Rent - January 2024',
        quantity: 1,
        unitPrice: 8500,
        totalPrice: 8500
      }
    ],
    relatedId: 'lease-001',
    relatedType: 'lease',
    template: 'rent',
    paymentTerms: 'Due on 1st of each month',
    notes: 'Thank you for your payment',
    attachments: [],
    createdAt: '2023-12-01',
    updatedAt: '2023-12-28'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2024-002',
    type: 'maintenance',
    clientType: 'tenant',
    clientId: 'tenant-002',
    clientName: 'Sarah Mitchell',
    clientEmail: 'sarah.mitchell@email.com',
    clientAddress: 'Unit 1501, Business Bay Executive Center, Business Bay',
    amount: 280,
    currency: 'AED',
    tax: 14,
    totalAmount: 294,
    status: 'sent',
    issueDate: '2024-01-12',
    dueDate: '2024-01-27',
    description: 'Conference Room Projector Repair',
    items: [
      {
        id: 'item-002',
        description: 'Projector Lamp Replacement',
        quantity: 1,
        unitPrice: 180,
        totalPrice: 180
      },
      {
        id: 'item-003',
        description: 'Color Wheel Replacement',
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100
      }
    ],
    relatedId: 'maint-002',
    relatedType: 'maintenance',
    template: 'maintenance',
    paymentTerms: 'Due within 15 days',
    notes: 'Parts warranty: 6 months',
    attachments: [
      {
        id: 'att-001',
        name: 'Before-After Photos',
        url: 'projector-repair-photos.pdf',
        type: 'pdf'
      }
    ],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2024-003',
    type: 'rent',
    clientType: 'tenant',
    clientId: 'tenant-003',
    clientName: 'Mohammed Al-Zaabi',
    clientEmail: 'mohammed.zaabi@email.com',
    clientAddress: 'Unit S102, Sharjah Cultural Complex, Heart of Sharjah',
    amount: 3200,
    currency: 'AED',
    tax: 0,
    totalAmount: 3200,
    status: 'paid',
    issueDate: '2023-12-01',
    dueDate: '2024-01-01',
    paidDate: '2023-12-30',
    description: 'January 2024 Rent Payment',
    items: [
      {
        id: 'item-004',
        description: 'Monthly Rent - January 2024',
        quantity: 1,
        unitPrice: 3200,
        totalPrice: 3200
      }
    ],
    relatedId: 'lease-003',
    relatedType: 'lease',
    template: 'rent',
    paymentTerms: 'Due on 1st of each month',
    notes: 'Heritage property - special terms apply',
    attachments: [],
    createdAt: '2023-12-01',
    updatedAt: '2023-12-30'
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2024-004',
    type: 'deposit',
    clientType: 'tenant',
    clientId: 'tenant-004',
    clientName: 'Elena Rodriguez',
    clientEmail: 'elena.rodriguez@email.com',
    clientAddress: 'Unit 2105, Downtown Heights, Sheikh Zayed Road',
    amount: 19000,
    currency: 'AED',
    tax: 0,
    totalAmount: 19000,
    status: 'paid',
    issueDate: '2024-01-10',
    dueDate: '2024-01-15',
    paidDate: '2024-01-12',
    description: 'Security Deposit - Downtown Heights',
    items: [
      {
        id: 'item-005',
        description: 'Security Deposit - Unit 2105',
        quantity: 1,
        unitPrice: 19000,
        totalPrice: 19000
      }
    ],
    relatedId: 'lease-004',
    relatedType: 'lease',
    template: 'rent',
    paymentTerms: 'Due on lease signing',
    notes: 'Refundable security deposit',
    attachments: [],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12'
  },
  {
    id: 'inv-005',
    invoiceNumber: 'INV-2024-005',
    type: 'maintenance',
    clientType: 'vendor',
    clientId: 'vendor-003',
    clientName: 'Heritage Restoration Specialists',
    clientEmail: 'info@heritagerestoration.ae',
    clientAddress: 'Al Ain Traditional Crafts District',
    amount: 2500,
    currency: 'AED',
    tax: 125,
    totalAmount: 2625,
    status: 'draft',
    issueDate: '2024-01-18',
    dueDate: '2024-02-02',
    description: 'Traditional Door Restoration Services',
    items: [
      {
        id: 'item-006',
        description: 'Traditional Door Assessment',
        quantity: 1,
        unitPrice: 500,
        totalPrice: 500
      },
      {
        id: 'item-007',
        description: 'Heritage Wood Treatment',
        quantity: 1,
        unitPrice: 1200,
        totalPrice: 1200
      },
      {
        id: 'item-008',
        description: 'Traditional Hardware Restoration',
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800
      }
    ],
    relatedId: 'maint-003',
    relatedType: 'maintenance',
    template: 'maintenance',
    paymentTerms: 'Due within 15 days',
    notes: 'Heritage restoration requires specialized materials',
    attachments: [
      {
        id: 'att-002',
        name: 'Restoration Plan',
        url: 'door-restoration-plan.pdf',
        type: 'pdf'
      }
    ],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18'
  }
]

export const demoVendors: Vendor[] = [
  {
    id: 'vendor-001',
    name: 'Ahmed Hassan',
    company: 'CoolTech Services',
    email: 'ahmed@cooltech.ae',
    phone: '+971-50-555-0001',
    category: 'HVAC',
    specialties: ['Air Conditioning', 'Ventilation', 'Refrigeration'],
    rating: 4.8,
    hourlyRate: 150,
    availability: 'available',
    lastJobDate: '2024-01-10',
    totalJobs: 45,
    averageResponseTime: 2.5,
    address: 'Al Quoz Industrial Area, Dubai',
    licenseNumber: 'HVAC-2023-001',
    insuranceExpiry: '2024-12-31',
    emergencyContact: true,
    preferredPaymentMethod: 'Bank Transfer',
    notes: 'Excellent work quality, very reliable',
    documents: [
      {
        id: 'vendor-doc-001',
        name: 'Trade License',
        type: 'license',
        expiryDate: '2024-12-31'
      }
    ],
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'vendor-002',
    name: 'ElectroFix Dubai',
    company: 'ElectroFix Dubai LLC',
    email: 'service@electrofix.ae',
    phone: '+971-50-555-0002',
    category: 'Electrical',
    specialties: ['Electrical Repairs', 'Installation', 'Maintenance'],
    rating: 4.6,
    hourlyRate: 120,
    availability: 'available',
    lastJobDate: '2024-01-12',
    totalJobs: 38,
    averageResponseTime: 3.0,
    address: 'Deira, Dubai',
    licenseNumber: 'ELEC-2023-002',
    insuranceExpiry: '2024-11-30',
    emergencyContact: false,
    preferredPaymentMethod: 'Cash',
    notes: 'Professional service, competitive rates',
    documents: [
      {
        id: 'vendor-doc-002',
        name: 'Insurance Certificate',
        type: 'insurance',
        expiryDate: '2024-11-30'
      }
    ],
    createdAt: '2023-02-20',
    updatedAt: '2024-01-12'
  },
  {
    id: 'vendor-003',
    name: 'Heritage Restoration Specialists',
    company: 'Al Ain Traditional Crafts LLC',
    email: 'info@heritagerestoration.ae',
    phone: '+971-50-555-0003',
    category: 'General',
    specialties: ['Heritage Restoration', 'Traditional Crafts', 'Wood Working'],
    rating: 4.9,
    hourlyRate: 200,
    availability: 'available',
    lastJobDate: '2024-01-18',
    totalJobs: 18,
    averageResponseTime: 1.5,
    address: 'Al Ain Traditional Crafts District, Al Ain',
    licenseNumber: 'HERITAGE-2023-003',
    insuranceExpiry: '2024-10-31',
    emergencyContact: false,
    preferredPaymentMethod: 'Bank Transfer',
    notes: 'Specialized in UAE heritage property restoration',
    documents: [
      {
        id: 'vendor-doc-003',
        name: 'Heritage Specialist Certificate',
        type: 'certificate',
        expiryDate: '2025-06-30'
      }
    ],
    createdAt: '2023-03-15',
    updatedAt: '2024-01-18'
  },
  {
    id: 'vendor-004',
    name: 'Dubai Smart Home',
    company: 'Smart Tech Solutions FZ',
    email: 'service@dubaismarthome.ae',
    phone: '+971-50-555-0004',
    category: 'Electrical',
    specialties: ['Smart Home Systems', 'Automation', 'Security Systems'],
    rating: 4.7,
    hourlyRate: 180,
    availability: 'busy',
    lastJobDate: '2024-01-16',
    totalJobs: 62,
    averageResponseTime: 2.0,
    address: 'Dubai Internet City, Dubai',
    licenseNumber: 'SMART-2023-004',
    insuranceExpiry: '2024-09-30',
    emergencyContact: false,
    preferredPaymentMethod: 'Online Payment',
    notes: 'Leading smart home technology provider',
    documents: [
      {
        id: 'vendor-doc-004',
        name: 'Technology License',
        type: 'license',
        expiryDate: '2024-12-31'
      }
    ],
    createdAt: '2023-04-01',
    updatedAt: '2024-01-16'
  },
  {
    id: 'vendor-005',
    name: 'Sharjah Traditional Tiles',
    company: 'Traditional Tiles & Ceramics LLC',
    email: 'orders@traditionaltiles.ae',
    phone: '+971-50-555-0005',
    category: 'General',
    specialties: ['Traditional Tiles', 'Ceramic Restoration', 'Heritage Materials'],
    rating: 4.6,
    hourlyRate: 120,
    availability: 'available',
    lastJobDate: '2024-01-15',
    totalJobs: 34,
    averageResponseTime: 3.0,
    address: 'Heritage District, Sharjah',
    licenseNumber: 'TILES-2023-005',
    insuranceExpiry: '2024-08-31',
    emergencyContact: false,
    preferredPaymentMethod: 'Cash',
    notes: 'Authentic traditional tiles and restoration materials',
    documents: [
      {
        id: 'vendor-doc-005',
        name: 'Supplier Certificate',
        type: 'certificate',
        expiryDate: '2024-12-31'
      }
    ],
    createdAt: '2023-05-10',
    updatedAt: '2024-01-15'
  },
  {
    id: 'vendor-006',
    name: 'Emirates Cleaning Services',
    company: 'Professional Cleaning LLC',
    email: 'bookings@emiratesclean.ae',
    phone: '+971-50-555-0006',
    category: 'Cleaning',
    specialties: ['Deep Cleaning', 'Move-in/out Cleaning', 'Regular Maintenance'],
    rating: 4.4,
    hourlyRate: 80,
    availability: 'available',
    lastJobDate: '2024-01-19',
    totalJobs: 156,
    averageResponseTime: 4.0,
    address: 'Al Qusais Industrial Area, Dubai',
    licenseNumber: 'CLEAN-2023-006',
    insuranceExpiry: '2024-07-31',
    emergencyContact: true,
    preferredPaymentMethod: 'Bank Transfer',
    notes: 'Reliable cleaning services for all property types',
    documents: [
      {
        id: 'vendor-doc-006',
        name: 'Cleaning License',
        type: 'license',
        expiryDate: '2024-12-31'
      }
    ],
    createdAt: '2023-06-01',
    updatedAt: '2024-01-19'
  }
]

// Helper functions to get demo data
export const getDemoData = () => ({
  properties: demoProperties,
  units: demoUnits,
  tenants: demoTenants,
  maintenanceRequests: demoMaintenanceRequests,
  payments: demoPayments,
  leases: demoLeases,
  invoices: demoInvoices,
  vendors: demoVendors
})

export const getPropertyById = (id: string) => demoProperties.find(p => p.id === id)
export const getUnitById = (id: string) => demoUnits.find(u => u.id === id)
export const getTenantById = (id: string) => demoTenants.find(t => t.id === id)
export const getUnitsForProperty = (propertyId: string) => demoUnits.filter(u => u.propertyId === propertyId)
export const getMaintenanceForProperty = (propertyId: string) => demoMaintenanceRequests.filter(m => m.propertyId === propertyId)
export const getPaymentsForTenant = (tenantId: string) => demoPayments.filter(p => p.tenantId === tenantId)

// Calculate dashboard statistics
export const calculateDashboardStats = () => {
  const totalProperties = demoProperties.length
  const totalUnits = demoUnits.length
  const occupiedUnits = demoUnits.filter(u => u.status === 'occupied').length
  const totalTenants = demoTenants.filter(t => t.status === 'active').length
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0
  const monthlyRevenue = demoProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0)
  const openMaintenanceRequests = demoMaintenanceRequests.filter(m => m.status === 'open' || m.status === 'assigned' || m.status === 'in_progress').length
  const overduePayments = demoPayments.filter(p => p.status === 'overdue' || (p.status === 'pending' && new Date(p.dueDate) < new Date())).length

  return {
    totalProperties,
    totalUnits,
    totalTenants,
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    monthlyRevenue,
    maintenanceRequests: openMaintenanceRequests,
    overduePayments,
    viewings: 47 // Updated mock data for viewings
  }
}