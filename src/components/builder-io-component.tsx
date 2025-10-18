import React, { useState, useEffect } from 'react'
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react'
import { BUILDER_IO_API_KEY } from '../utils/builder-config'
import { Skeleton } from './ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircle } from 'lucide-react'

// Initialize Builder.io only if API key is configured
if (BUILDER_IO_API_KEY && BUILDER_IO_API_KEY !== 'YOUR_BUILDER_IO_API_KEY') {
  builder.init(BUILDER_IO_API_KEY)
}

interface BuilderContentProps {
  model: string
  contentId?: string
  data?: Record<string, any>
  locale?: string
  options?: {
    enrich?: boolean
    cachebust?: boolean
    includeRefs?: boolean
  }
  customComponents?: any[]
}

export function BuilderContent({
  model,
  contentId,
  data = {},
  locale = 'en-US',
  options = {},
  customComponents = [],
}: BuilderContentProps) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isPreviewing = useIsPreviewing()

  useEffect(() => {
    // Check if Builder.io is configured
    if (!BUILDER_IO_API_KEY || BUILDER_IO_API_KEY === 'YOUR_BUILDER_IO_API_KEY') {
      setError('Builder.io API key not configured. Please add your API key to the .env file.')
      setLoading(false)
      return
    }

    // Register custom components if provided
    if (customComponents.length > 0) {
      customComponents.forEach((component) => {
        builder.registerComponent(component.component, component.config)
      })
    }

    // Fetch content from Builder.io
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)

        const urlPath = window.location.pathname

        const builderContent = await builder
          .get(model, {
            userAttributes: {
              urlPath,
              locale,
              ...data,
            },
            ...(contentId && { query: { id: contentId } }),
            ...options,
          })
          .toPromise()

        setContent(builderContent || null)
        
        if (!builderContent && !isPreviewing) {
          setError('No content found for this page')
        }
      } catch (err) {
        console.error('Error fetching Builder.io content:', err)
        setError('Failed to load content from Builder.io')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [model, contentId, locale, isPreviewing])

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  // Show error state
  if (error && !isPreviewing) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Builder.io Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Show empty state if no content and not previewing
  if (!content && !isPreviewing) {
    return null
  }

  // Render Builder.io content
  return (
    <BuilderComponent
      model={model}
      content={content}
      data={data}
      locale={locale}
    />
  )
}

interface BuilderPageProps {
  model?: string
  data?: Record<string, any>
  customComponents?: any[]
}

/**
 * BuilderPage component for rendering full pages from Builder.io
 * This is useful for creating custom landing pages, marketing pages, etc.
 */
export function BuilderPage({
  model = 'page',
  data = {},
  customComponents = [],
}: BuilderPageProps) {
  return (
    <BuilderContent
      model={model}
      data={data}
      customComponents={customComponents}
      options={{
        enrich: true,
        includeRefs: true,
      }}
    />
  )
}

interface BuilderSectionProps {
  sectionId: string
  data?: Record<string, any>
}

/**
 * BuilderSection component for rendering specific sections
 * This is useful for embedding Builder.io sections within existing pages
 */
export function BuilderSection({ sectionId, data = {} }: BuilderSectionProps) {
  return (
    <BuilderContent
      model="section"
      contentId={sectionId}
      data={data}
    />
  )
}

interface BuilderWidgetProps {
  widgetId: string
  data?: Record<string, any>
}

/**
 * BuilderWidget component for rendering dashboard widgets
 * This allows you to visually design dashboard widgets in Builder.io
 */
export function BuilderWidget({ widgetId, data = {} }: BuilderWidgetProps) {
  return (
    <BuilderContent
      model="dashboard-widget"
      contentId={widgetId}
      data={data}
    />
  )
}

export { builder }
