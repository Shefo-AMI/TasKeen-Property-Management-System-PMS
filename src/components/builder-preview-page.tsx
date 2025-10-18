import React from 'react'
import { BuilderPage, BuilderSection, BuilderWidget } from './builder-io-component'
import { builderCustomComponents } from './builder-custom-components'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'

interface BuilderPreviewPageProps {
  type?: 'page' | 'section' | 'widget'
  contentId?: string
  onBack?: () => void
}

/**
 * BuilderPreviewPage - A dedicated page for previewing Builder.io content
 * 
 * This component can be used to:
 * - Preview Builder.io pages during development
 * - Display marketing pages created in Builder.io
 * - Embed Builder.io sections within the app
 * - Test custom components in Builder.io
 */
export function BuilderPreviewPage({
  type = 'page',
  contentId,
  onBack,
}: BuilderPreviewPageProps) {
  const renderContent = () => {
    switch (type) {
      case 'page':
        return (
          <BuilderPage
            model="page"
            customComponents={builderCustomComponents}
          />
        )
      case 'section':
        return contentId ? (
          <BuilderSection sectionId={contentId} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No section ID provided</p>
          </div>
        )
      case 'widget':
        return contentId ? (
          <div className="max-w-md mx-auto">
            <BuilderWidget widgetId={contentId} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No widget ID provided</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {onBack && (
        <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto">
        {renderContent()}
      </div>
    </div>
  )
}

/**
 * Example usage in main-dashboard.tsx:
 * 
 * Add a new menu item to show Builder.io content:
 * 
 * {
 *   title: 'Builder.io Pages',
 *   url: '/builder',
 *   icon: Sparkles,
 *   onClick: () => setActiveView('builder-preview')
 * }
 * 
 * Then in the render section:
 * 
 * {activeView === 'builder-preview' && (
 *   <BuilderPreviewPage
 *     type="page"
 *     onBack={() => setActiveView('overview')}
 *   />
 * )}
 */
