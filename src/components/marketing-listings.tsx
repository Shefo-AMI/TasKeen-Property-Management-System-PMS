import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import { 
  Star, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Camera,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  TrendingUp,
  Share2,
  ExternalLink,
  Image,
  Video,
  Globe,
  Target,
  Users,
  Mail,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface User {
  id: string
  email: string
  fullName: string
  companyId: string
  companyName: string
  role: 'platform_admin' | 'company_admin' | 'employee'
}

interface MarketingListingsProps {
  user: User
  accessToken: string | null
}

interface PropertyListing {
  id: string
  propertyId: string
  propertyName: string
  unitId: string
  unitNumber: string
  title: string
  description: string
  listingType: 'rent' | 'sale'
  status: 'draft' | 'active' | 'rented' | 'sold' | 'suspended'
  price: number
  currency: string
  bedrooms: number
  bathrooms: number
  sqft: number
  furnishing: 'furnished' | 'unfurnished' | 'semi_furnished'
  amenities: string[]
  features: string[]
  images: {
    id: string
    url: string
    caption: string
    isPrimary: boolean
    order: number
  }[]
  virtualTour?: string
  floorPlan?: string
  location: {
    address: string
    area: string
    city: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  availability: {
    availableFrom: string
    leaseTerm?: string
    minimumStay?: number
  }
  contact: {
    agentId: string
    agentName: string
    agentPhone: string
    agentEmail: string
  }
  marketing: {
    platforms: string[]
    featured: boolean
    priority: 'low' | 'medium' | 'high'
    keywords: string[]
    targetAudience: string[]
  }
  analytics: {
    views: number
    inquiries: number
    viewings: number
    applications: number
    conversionRate: number
  }
  seo: {
    metaTitle: string
    metaDescription: string
    slug: string
  }
  createdBy: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

interface MarketingCampaign {
  id: string
  name: string
  type: 'property_promotion' | 'brand_awareness' | 'lead_generation' | 'tenant_retention'
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate: string
  endDate: string
  budget: number
  spent: number
  targetAudience: {
    demographics: string[]
    interests: string[]
    location: string[]
    income: string
  }
  platforms: string[]
  content: {
    headline: string
    description: string
    images: string[]
    callToAction: string
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    cpc: number
    roi: number
  }
  propertyIds: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface Lead {
  id: string
  source: 'website' | 'social_media' | 'referral' | 'walk_in' | 'phone' | 'email' | 'agent'
  listingId?: string
  listingTitle?: string
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'application_received' | 'approved' | 'rejected' | 'converted'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
    preferredContact: 'email' | 'phone' | 'whatsapp'
  }
  requirements: {
    budget: {
      min: number
      max: number
    }
    bedrooms: number[]
    areas: string[]
    moveInDate: string
    leaseTerm: string
  }
  assignedTo?: string
  notes: string
  interactions: {
    id: string
    type: 'call' | 'email' | 'meeting' | 'viewing' | 'application'
    date: string
    notes: string
    outcome: string
  }[]
  tags: string[]
  score: number
  createdAt: string
  updatedAt: string
}

// Demo data
const demoListings: PropertyListing[] = [
  {
    id: 'listing-001',
    propertyId: 'prop-001',
    propertyName: 'Burj Al Marina Residence',
    unitId: 'unit-002',
    unitNumber: '0803',
    title: 'Stunning 1BR Apartment with Marina Views',
    description: 'Beautiful 1-bedroom apartment in the prestigious Burj Al Marina Residence. Features modern amenities, stunning marina views, and premium finishes throughout. Located in the heart of Dubai Marina with easy access to restaurants, shopping, and entertainment.',
    listingType: 'rent',
    status: 'active',
    price: 6500,
    currency: 'AED',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 850,
    furnishing: 'unfurnished',
    amenities: ['Swimming Pool', 'Gym', 'Concierge', 'Parking', 'Security', 'Marina Views'],
    features: ['Built-in Wardrobes', 'Modern Kitchen', 'Marble Floors', 'Floor-to-Ceiling Windows'],
    images: [
      {
        id: 'img-001',
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        caption: 'Living room with marina views',
        isPrimary: true,
        order: 1
      },
      {
        id: 'img-002',
        url: 'https://images.unsplash.com/photo-1560449752-8dd7d23a8d0b?w=800',
        caption: 'Modern kitchen',
        isPrimary: false,
        order: 2
      }
    ],
    virtualTour: 'https://virtual-tour.example.com/marina-803',
    location: {
      address: 'Burj Al Marina Residence, Dubai Marina Walk',
      area: 'Dubai Marina',
      city: 'Dubai',
      coordinates: {
        lat: 25.0657,
        lng: 55.1364
      }
    },
    availability: {
      availableFrom: '2024-02-01',
      leaseTerm: '1 year',
      minimumStay: 12
    },
    contact: {
      agentId: 'agent-001',
      agentName: 'Sarah Johnson',
      agentPhone: '+971-50-123-4567',
      agentEmail: 'sarah.johnson@propertyflow.ae'
    },
    marketing: {
      platforms: ['PropertyFinder', 'Dubizzle', 'Bayut', 'Company Website'],
      featured: true,
      priority: 'high',
      keywords: ['marina views', 'luxury apartment', 'dubai marina', '1 bedroom'],
      targetAudience: ['young professionals', 'expats', 'couples']
    },
    analytics: {
      views: 245,
      inquiries: 18,
      viewings: 8,
      applications: 3,
      conversionRate: 16.7
    },
    seo: {
      metaTitle: '1BR Marina View Apartment for Rent | Burj Al Marina',
      metaDescription: 'Luxury 1-bedroom apartment with stunning marina views in Dubai Marina. Modern amenities, premium location. Available for rent.',
      slug: 'burj-al-marina-1br-apartment-0803'
    },
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    publishedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'listing-002',
    propertyId: 'prop-002',
    propertyName: 'Business Bay Executive Center',
    unitId: 'unit-004',
    unitNumber: '1205',
    title: 'Premium Office Space in Business Bay',
    description: 'Modern office space in the heart of Business Bay with stunning city views. Perfect for growing businesses and startups. Includes reception area, conference room, and flexible workspace.',
    listingType: 'rent',
    status: 'active',
    price: 10000,
    currency: 'AED',
    bedrooms: 0,
    bathrooms: 2,
    sqft: 1500,
    furnishing: 'furnished',
    amenities: ['High Speed Internet', 'Conference Rooms', 'Reception', 'Parking', 'Security'],
    features: ['City Views', 'Modern Fitout', 'Flexible Layout', 'Meeting Rooms'],
    images: [
      {
        id: 'img-003',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        caption: 'Modern office space',
        isPrimary: true,
        order: 1
      }
    ],
    location: {
      address: 'Business Bay Executive Center, Business Bay Boulevard',
      area: 'Business Bay',
      city: 'Dubai'
    },
    availability: {
      availableFrom: '2024-01-20',
      leaseTerm: '2 years',
      minimumStay: 24
    },
    contact: {
      agentId: 'agent-002',
      agentName: 'Ahmed Al-Mansouri',
      agentPhone: '+971-50-987-6543',
      agentEmail: 'ahmed.mansouri@propertyflow.ae'
    },
    marketing: {
      platforms: ['PropertyFinder', 'Commercial Bay', 'Company Website'],
      featured: false,
      priority: 'medium',
      keywords: ['office space', 'business bay', 'commercial', 'startup'],
      targetAudience: ['businesses', 'startups', 'freelancers']
    },
    analytics: {
      views: 89,
      inquiries: 12,
      viewings: 5,
      applications: 2,
      conversionRate: 16.7
    },
    seo: {
      metaTitle: 'Office Space for Rent in Business Bay | Executive Center',
      metaDescription: 'Premium office space in Business Bay with city views. Perfect for businesses and startups. Fully furnished and ready to move in.',
      slug: 'business-bay-office-space-1205'
    },
    createdBy: 'Ahmed Al-Mansouri',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z',
    publishedAt: '2024-01-12T12:00:00Z'
  }
]

const demoCampaigns: MarketingCampaign[] = [
  {
    id: 'campaign-001',
    name: 'Marina Views Winter Promotion',
    type: 'property_promotion',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    budget: 15000,
    spent: 8500,
    targetAudience: {
      demographics: ['25-40 years', 'High income', 'Professionals'],
      interests: ['Luxury living', 'Marina lifestyle', 'Modern apartments'],
      location: ['Dubai', 'Abu Dhabi', 'International'],
      income: '15000+ AED'
    },
    platforms: ['Google Ads', 'Facebook', 'Instagram', 'PropertyFinder'],
    content: {
      headline: 'Luxury Marina Living Awaits You',
      description: 'Discover stunning 1BR apartments with breathtaking marina views. Move in ready with special winter rates.',
      images: ['marina-promo-1.jpg', 'marina-promo-2.jpg'],
      callToAction: 'Book Viewing Today'
    },
    metrics: {
      impressions: 125000,
      clicks: 2100,
      conversions: 35,
      ctr: 1.68,
      cpc: 4.05,
      roi: 145
    },
    propertyIds: ['prop-001'],
    createdBy: 'Marketing Team',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  }
]

const demoLeads: Lead[] = [
  {
    id: 'lead-001',
    source: 'website',
    listingId: 'listing-001',
    listingTitle: 'Stunning 1BR Apartment with Marina Views',
    status: 'viewing_scheduled',
    priority: 'high',
    contact: {
      firstName: 'Michael',
      lastName: 'Thompson',
      email: 'michael.thompson@email.com',
      phone: '+971-55-123-4567',
      preferredContact: 'phone'
    },
    requirements: {
      budget: {
        min: 6000,
        max: 8000
      },
      bedrooms: [1, 2],
      areas: ['Dubai Marina', 'JBR'],
      moveInDate: '2024-02-01',
      leaseTerm: '1 year'
    },
    assignedTo: 'Sarah Johnson',
    notes: 'Very interested, looking to move quickly. Prefers marina views.',
    interactions: [
      {
        id: 'int-001',
        type: 'email',
        date: '2024-01-18T10:30:00Z',
        notes: 'Initial inquiry about the listing',
        outcome: 'Positive response, scheduled viewing'
      },
      {
        id: 'int-002',
        type: 'call',
        date: '2024-01-18T14:15:00Z',
        notes: 'Called to confirm viewing and discuss requirements',
        outcome: 'Viewing confirmed for tomorrow'
      }
    ],
    tags: ['hot-lead', 'marina-preference', 'quick-mover'],
    score: 85,
    createdAt: '2024-01-18T10:25:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: 'lead-002',
    source: 'social_media',
    status: 'new',
    priority: 'medium',
    contact: {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@email.com',
      phone: '+971-50-987-6543',
      preferredContact: 'email'
    },
    requirements: {
      budget: {
        min: 8000,
        max: 12000
      },
      bedrooms: [2, 3],
      areas: ['Business Bay', 'Downtown'],
      moveInDate: '2024-03-01',
      leaseTerm: '2 years'
    },
    notes: 'Looking for office space for startup company. Flexible on timing.',
    interactions: [],
    tags: ['new-lead', 'commercial-interest'],
    score: 65,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  }
]

export function MarketingListings({ user, accessToken }: MarketingListingsProps) {
  const [activeTab, setActiveTab] = useState('listings')
  const [listings, setListings] = useState<PropertyListing[]>(demoListings)
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(demoCampaigns)
  const [leads, setLeads] = useState<Lead[]>(demoLeads)
  const [selectedListing, setSelectedListing] = useState<PropertyListing | null>(null)
  const [showCreateListing, setShowCreateListing] = useState(false)
  const [showListingDetails, setShowListingDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter listings
  const getFilteredListings = () => {
    return listings.filter(listing => {
      const matchesSearch = searchTerm === '' || 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.area.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || listing.status === filterStatus
      const matchesType = filterType === 'all' || listing.listingType === filterType

      return matchesSearch && matchesStatus && matchesType
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const getStatusColor = (status: PropertyListing['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'rented': return 'bg-blue-100 text-blue-800'
      case 'sold': return 'bg-purple-100 text-purple-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: MarketingCampaign['priority'] | Lead['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleCreateListing = async (listingData: Partial<PropertyListing>) => {
    setIsLoading(true)
    try {
      const newListing: PropertyListing = {
        id: `listing-${Date.now()}`,
        propertyId: listingData.propertyId || '',
        propertyName: listingData.propertyName || '',
        unitId: listingData.unitId || '',
        unitNumber: listingData.unitNumber || '',
        title: listingData.title || '',
        description: listingData.description || '',
        listingType: listingData.listingType || 'rent',
        status: 'draft',
        price: listingData.price || 0,
        currency: 'AED',
        bedrooms: listingData.bedrooms || 0,
        bathrooms: listingData.bathrooms || 0,
        sqft: listingData.sqft || 0,
        furnishing: listingData.furnishing || 'unfurnished',
        amenities: listingData.amenities || [],
        features: listingData.features || [],
        images: [],
        location: listingData.location || {
          address: '',
          area: '',
          city: 'Dubai'
        },
        availability: listingData.availability || {
          availableFrom: new Date().toISOString().split('T')[0]
        },
        contact: {
          agentId: user.id,
          agentName: user.fullName,
          agentPhone: '',
          agentEmail: user.email
        },
        marketing: {
          platforms: [],
          featured: false,
          priority: 'medium',
          keywords: [],
          targetAudience: []
        },
        analytics: {
          views: 0,
          inquiries: 0,
          viewings: 0,
          applications: 0,
          conversionRate: 0
        },
        seo: {
          metaTitle: listingData.title || '',
          metaDescription: listingData.description?.substring(0, 160) || '',
          slug: (listingData.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        },
        createdBy: user.fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...listingData
      }

      setListings(prev => [newListing, ...prev])
      setShowCreateListing(false)
      toast.success('Listing created successfully')
    } catch (error) {
      toast.error('Failed to create listing')
    } finally {
      setIsLoading(false)
    }
  }

  const renderListingsList = () => (
    <div className="space-y-4">
      {getFilteredListings().map((listing) => (
        <Card key={listing.id} className="overflow-hidden">
          <div className="flex">
            <div className="w-64 h-48 bg-gray-100 relative">
              {listing.images.length > 0 ? (
                <ImageWithFallback
                  src={listing.images.find(img => img.isPrimary)?.url || listing.images[0]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {listing.marketing.featured && (
                <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                  Featured
                </Badge>
              )}
              <Badge className={`absolute top-2 right-2 ${getStatusColor(listing.status)}`}>
                {listing.status}
              </Badge>
            </div>
            
            <CardContent className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{listing.title}</h3>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(listing.marketing.priority)}`} />
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{listing.description.substring(0, 150)}...</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Property</p>
                      <p className="font-medium">{listing.propertyName}</p>
                      <p className="text-muted-foreground">Unit {listing.unitNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Details</p>
                      <div className="flex items-center gap-3">
                        {listing.bedrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {listing.bedrooms}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {listing.bathrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          {listing.sqft} sq ft
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="text-lg font-bold text-green-600">
                        {listing.currency} {listing.price.toLocaleString()}
                        {listing.listingType === 'rent' ? '/month' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.location.area}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.analytics.views} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {listing.analytics.inquiries} inquiries
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Available {new Date(listing.availability.availableFrom).toLocaleDateString()}
                    </div>
                  </div>

                  {listing.marketing.platforms.length > 0 && (
                    <div className="mt-3">
                      <p className="text-muted-foreground text-sm mb-1">Listed on:</p>
                      <div className="flex gap-1">
                        {listing.marketing.platforms.slice(0, 3).map((platform, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                        {listing.marketing.platforms.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{listing.marketing.platforms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedListing(listing)
                      setShowListingDetails(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {listing.status === 'draft' && (
                    <Button size="sm">
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
      
      {getFilteredListings().length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'No property listings created yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCampaignsList = () => (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <Badge className={
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {campaign.status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {campaign.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-4">{campaign.content.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">AED {campaign.budget.toLocaleString()}</p>
                    <p className="text-muted-foreground">Spent: AED {campaign.spent.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Performance</p>
                    <p className="font-medium">{campaign.metrics.impressions.toLocaleString()} impressions</p>
                    <p className="text-muted-foreground">{campaign.metrics.clicks} clicks</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Conversion</p>
                    <p className="font-medium">{campaign.metrics.conversions} conversions</p>
                    <p className="text-muted-foreground">CTR: {campaign.metrics.ctr}%</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">ROI</p>
                    <p className="font-medium text-green-600">{campaign.metrics.roi}%</p>
                    <p className="text-muted-foreground">CPC: AED {campaign.metrics.cpc}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-muted-foreground text-sm mb-1">Platforms:</p>
                  <div className="flex gap-1">
                    {campaign.platforms.map((platform, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Campaign Progress</span>
                    <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                  </div>
                  <Progress value={(campaign.spent / campaign.budget) * 100} />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {campaign.status === 'active' && (
                  <Button size="sm" variant="outline">
                    Pause
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderLeadsList = () => (
    <div className="space-y-4">
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{lead.contact.firstName} {lead.contact.lastName}</h3>
                  <Badge className={
                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'viewing_scheduled' ? 'bg-purple-100 text-purple-800' :
                    lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {lead.status.replace('_', ' ')}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(lead.priority)}`} />
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{lead.score}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">{lead.contact.email}</p>
                    <p className="text-muted-foreground">{lead.contact.phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Requirements</p>
                    <p className="font-medium">
                      AED {lead.requirements.budget.min.toLocaleString()} - {lead.requirements.budget.max.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      {lead.requirements.bedrooms.join('/')} BR in {lead.requirements.areas.join(', ')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Timeline</p>
                    <p className="font-medium">Move in: {new Date(lead.requirements.moveInDate).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">Term: {lead.requirements.leaseTerm}</p>
                  </div>
                </div>
                
                {lead.listingTitle && (
                  <div className="mt-3">
                    <p className="text-muted-foreground text-sm">Interested in:</p>
                    <p className="font-medium">{lead.listingTitle}</p>
                  </div>
                )}
                
                {lead.notes && (
                  <div className="mt-3">
                    <p className="text-muted-foreground text-sm">Notes:</p>
                    <p className="text-sm">{lead.notes}</p>
                  </div>
                )}
                
                {lead.tags.length > 0 && (
                  <div className="mt-3">
                    <div className="flex gap-1">
                      {lead.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Source: {lead.source.replace('_', ' ')}
                  </div>
                  {lead.assignedTo && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Assigned to: {lead.assignedTo}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button size="sm">
                  Update Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Marketing & Listings</h2>
          <p className="text-muted-foreground">Manage property listings, campaigns, and leads</p>
        </div>
        <Button onClick={() => setShowCreateListing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="listings">Property Listings</TabsTrigger>
          <TabsTrigger value="campaigns">Marketing Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Leads & Inquiries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {renderListingsList()}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          {renderCampaignsList()}
        </TabsContent>

        <TabsContent value="leads" className="mt-6">
          {renderLeadsList()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Listing Performance</CardTitle>
                <CardDescription>Views and inquiries by property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.slice(0, 5).map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">{listing.location.area}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{listing.analytics.views} views</p>
                        <p className="text-sm text-muted-foreground">{listing.analytics.inquiries} inquiries</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['website', 'social_media', 'referral', 'walk_in'].map((source) => {
                    const sourceLeads = leads.filter(l => l.source === source)
                    const percentage = leads.length > 0 ? (sourceLeads.length / leads.length) * 100 : 0
                    
                    return (
                      <div key={source} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize">{source.replace('_', ' ')}</span>
                          <span>{sourceLeads.length} leads ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Listing Dialog */}
      <Dialog open={showCreateListing} onOpenChange={setShowCreateListing}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
            <DialogDescription>
              Create a new property listing for marketing
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleCreateListing({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                listingType: formData.get('listingType') as PropertyListing['listingType'],
                price: Number(formData.get('price')),
                bedrooms: Number(formData.get('bedrooms')),
                bathrooms: Number(formData.get('bathrooms')),
                sqft: Number(formData.get('sqft')),
                furnishing: formData.get('furnishing') as PropertyListing['furnishing'],
                propertyId: formData.get('propertyId') as string,
                propertyName: 'Burj Al Marina Residence', // This would be dynamic
                unitId: formData.get('unitId') as string,
                unitNumber: formData.get('unitNumber') as string,
                location: {
                  address: formData.get('address') as string,
                  area: formData.get('area') as string,
                  city: 'Dubai'
                },
                availability: {
                  availableFrom: formData.get('availableFrom') as string,
                  leaseTerm: formData.get('leaseTerm') as string
                }
              })
            }}>
              <div className="grid gap-4 p-1">
                <div>
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input id="title" name="title" required />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    className="min-h-[100px]"
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listingType">Listing Type</Label>
                    <Select name="listingType" defaultValue="rent">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Price (AED) *</Label>
                    <Input id="price" name="price" type="number" min="0" required />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input id="bedrooms" name="bedrooms" type="number" min="0" defaultValue="1" />
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input id="bathrooms" name="bathrooms" type="number" min="0" defaultValue="1" />
                  </div>

                  <div>
                    <Label htmlFor="sqft">Square Feet</Label>
                    <Input id="sqft" name="sqft" type="number" min="0" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="furnishing">Furnishing</Label>
                  <Select name="furnishing" defaultValue="unfurnished">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                      <SelectItem value="semi_furnished">Semi Furnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyId">Property</Label>
                    <Select name="propertyId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prop-001">Burj Al Marina Residence</SelectItem>
                        <SelectItem value="prop-002">Business Bay Executive Center</SelectItem>
                        <SelectItem value="prop-003">Al Ain Heritage Villas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="unitId">Unit</Label>
                    <Select name="unitId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit-001">1205</SelectItem>
                        <SelectItem value="unit-002">0803</SelectItem>
                        <SelectItem value="unit-003">1501</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="unitNumber" value="0803" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" />
                  </div>

                  <div>
                    <Label htmlFor="area">Area</Label>
                    <Input id="area" name="area" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availableFrom">Available From</Label>
                    <Input 
                      id="availableFrom" 
                      name="availableFrom" 
                      type="date" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="leaseTerm">Lease Term</Label>
                    <Select name="leaseTerm" defaultValue="1 year">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6 months">6 months</SelectItem>
                        <SelectItem value="1 year">1 year</SelectItem>
                        <SelectItem value="2 years">2 years</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Listing'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateListing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{listings.filter(l => l.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {listings.reduce((sum, l) => sum + l.analytics.views, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {listings.reduce((sum, l) => sum + l.analytics.inquiries, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-sm text-muted-foreground">Active Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
