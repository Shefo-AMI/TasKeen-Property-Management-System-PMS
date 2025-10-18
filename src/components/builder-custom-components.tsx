/**
 * Custom components that can be used in Builder.io
 * These components will appear in the Builder.io visual editor
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Building2, Home, TrendingUp, Users, DollarSign } from 'lucide-react'

// Property Card Component for Builder.io
export function PropertyCard({
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  imageUrl,
  status,
  propertyType,
  onViewDetails,
}: {
  title: string
  location: string
  price: number
  bedrooms?: number
  bathrooms?: number
  area?: string
  imageUrl?: string
  status?: 'available' | 'rented' | 'sold'
  propertyType?: 'villa' | 'apartment' | 'townhouse' | 'penthouse'
  onViewDetails?: () => void
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{title}</CardTitle>
          {status && (
            <Badge variant={status === 'available' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-1">
          <Home className="h-3 w-3" />
          {location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">AED {price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
        
        {(bedrooms || bathrooms || area) && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            {bedrooms && <span>{bedrooms} Beds</span>}
            {bathrooms && <span>{bathrooms} Baths</span>}
            {area && <span>{area}</span>}
          </div>
        )}
        
        {onViewDetails && (
          <Button onClick={onViewDetails} className="w-full">
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Stats Widget Component for Builder.io
export function StatsWidget({
  title,
  value,
  change,
  icon,
  trend,
  description,
}: {
  title: string
  value: string | number
  change?: number
  icon?: 'building' | 'users' | 'dollar' | 'trending'
  trend?: 'up' | 'down'
  description?: string
}) {
  const iconMap = {
    building: Building2,
    users: Users,
    dollar: DollarSign,
    trending: TrendingUp,
  }

  const Icon = icon ? iconMap[icon] : Building2

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
            {change > 0 ? '+' : ''}{change}% from last month
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Hero Section Component for Builder.io
export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  ctaLink,
  overlay,
}: {
  title: string
  subtitle?: string
  backgroundImage?: string
  ctaText?: string
  ctaLink?: string
  overlay?: boolean
}) {
  return (
    <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      {overlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-xl mb-8 opacity-90">{subtitle}</p>
        )}
        {ctaText && (
          <Button size="lg" asChild>
            <a href={ctaLink || '#'}>{ctaText}</a>
          </Button>
        )}
      </div>
    </div>
  )
}

// Feature Grid Component for Builder.io
export function FeatureGrid({
  features,
}: {
  features: Array<{
    title: string
    description: string
    icon?: string
  }>
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Register components with Builder.io
export const builderCustomComponents = [
  {
    component: PropertyCard,
    config: {
      name: 'Property Card',
      inputs: [
        { name: 'title', type: 'string', required: true, defaultValue: 'Luxury Villa in Dubai Marina' },
        { name: 'location', type: 'string', required: true, defaultValue: 'Dubai Marina' },
        { name: 'price', type: 'number', required: true, defaultValue: 150000 },
        { name: 'bedrooms', type: 'number', defaultValue: 3 },
        { name: 'bathrooms', type: 'number', defaultValue: 2 },
        { name: 'area', type: 'string', defaultValue: '2,500 sq ft' },
        { name: 'imageUrl', type: 'file', allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'] },
        {
          name: 'status',
          type: 'string',
          enum: ['available', 'rented', 'sold'],
          defaultValue: 'available',
        },
        {
          name: 'propertyType',
          type: 'string',
          enum: ['villa', 'apartment', 'townhouse', 'penthouse'],
          defaultValue: 'villa',
        },
      ],
    },
  },
  {
    component: StatsWidget,
    config: {
      name: 'Stats Widget',
      inputs: [
        { name: 'title', type: 'string', required: true, defaultValue: 'Total Properties' },
        { name: 'value', type: 'string', required: true, defaultValue: '1,234' },
        { name: 'change', type: 'number', defaultValue: 12 },
        {
          name: 'icon',
          type: 'string',
          enum: ['building', 'users', 'dollar', 'trending'],
          defaultValue: 'building',
        },
        {
          name: 'trend',
          type: 'string',
          enum: ['up', 'down'],
          defaultValue: 'up',
        },
        { name: 'description', type: 'string', defaultValue: 'Active listings' },
      ],
    },
  },
  {
    component: HeroSection,
    config: {
      name: 'Hero Section',
      inputs: [
        { name: 'title', type: 'string', required: true, defaultValue: 'Welcome to PropertyFlow' },
        { name: 'subtitle', type: 'string', defaultValue: 'Manage your properties with ease' },
        { name: 'backgroundImage', type: 'file', allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'] },
        { name: 'ctaText', type: 'string', defaultValue: 'Get Started' },
        { name: 'ctaLink', type: 'string', defaultValue: '/dashboard' },
        { name: 'overlay', type: 'boolean', defaultValue: true },
      ],
    },
  },
  {
    component: FeatureGrid,
    config: {
      name: 'Feature Grid',
      inputs: [
        {
          name: 'features',
          type: 'list',
          subFields: [
            { name: 'title', type: 'string', required: true },
            { name: 'description', type: 'string', required: true },
            { name: 'icon', type: 'string' },
          ],
          defaultValue: [
            {
              title: 'Property Management',
              description: 'Manage all your properties in one place',
            },
            {
              title: 'Tenant Portal',
              description: 'Give tenants easy access to their information',
            },
            {
              title: 'Financial Tracking',
              description: 'Track income, expenses, and generate reports',
            },
          ],
        },
      ],
    },
  },
]
