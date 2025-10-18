/**
 * Builder.io Configuration
 * 
 * This file contains the configuration for Builder.io integration.
 * To use Builder.io with PropertyFlow:
 * 
 * 1. Sign up at https://www.builder.io
 * 2. Create a new space for PropertyFlow
 * 3. Get your API key from the Account Settings
 * 4. Replace 'YOUR_BUILDER_IO_API_KEY' below with your actual API key
 * 5. Register custom components in the registerBuilderComponents function
 */

// Safely get the Builder.io API key from environment variables
const getBuilderApiKey = (): string => {
  // Check if import.meta.env is available
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_BUILDER_IO_API_KEY || 'YOUR_BUILDER_IO_API_KEY'
  }
  
  // Fallback for environments where import.meta is not available
  return 'YOUR_BUILDER_IO_API_KEY'
}

export const BUILDER_IO_API_KEY = getBuilderApiKey()

// Builder.io models configuration
export const BUILDER_MODELS = {
  PAGE: 'page',
  SECTION: 'section',
  HEADER: 'header',
  FOOTER: 'footer',
  DASHBOARD_WIDGET: 'dashboard-widget',
  PROPERTY_CARD: 'property-card',
  ANNOUNCEMENT: 'announcement',
}

// Builder.io content zones for different parts of the app
export const BUILDER_ZONES = {
  HERO: 'hero-section',
  DASHBOARD: 'dashboard-content',
  PROPERTY_LISTING: 'property-listing',
  TENANT_PORTAL: 'tenant-portal',
  ANALYTICS: 'analytics-widgets',
  MARKETING: 'marketing-content',
}

export const builderConfig = {
  apiKey: BUILDER_IO_API_KEY,
  // Enable preview mode for editors
  canTrack: true,
  // Custom field types
  customFields: {
    uaeProperty: {
      name: 'UAE Property',
      type: 'object',
      subFields: [
        { name: 'propertyId', type: 'string', required: true },
        { name: 'propertyType', type: 'string', enum: ['villa', 'apartment', 'townhouse', 'penthouse'] },
        { name: 'location', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'imageUrl', type: 'file', allowedFileTypes: ['jpeg', 'png', 'webp'] },
      ],
    },
    dashboardWidget: {
      name: 'Dashboard Widget',
      type: 'object',
      subFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'widgetType', type: 'string', enum: ['chart', 'stat', 'list', 'table'] },
        { name: 'dataSource', type: 'string' },
        { name: 'refreshInterval', type: 'number', defaultValue: 60000 },
      ],
    },
  },
}

export default builderConfig
