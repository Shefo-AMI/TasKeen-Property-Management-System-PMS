import React, { useState, useEffect } from 'react'
import { builder } from '@builder.io/react'
import { BUILDER_IO_API_KEY, BUILDER_MODELS } from '../utils/builder-config'
import { builderCustomComponents } from './builder-custom-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Copy, ExternalLink, Info, Sparkles } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface BuilderEditorProps {
  user?: {
    email: string
    role: string
    companyName: string
  }
}

export function BuilderEditorManager({ user }: BuilderEditorProps) {
  const [isConfigured, setIsConfigured] = useState(false)
  const [apiKey, setApiKey] = useState(BUILDER_IO_API_KEY)
  const [selectedModel, setSelectedModel] = useState('page')

  useEffect(() => {
    // Check if Builder.io is configured
    const configured = BUILDER_IO_API_KEY && BUILDER_IO_API_KEY !== 'YOUR_BUILDER_IO_API_KEY'
    setIsConfigured(configured)

    // Register custom components only if configured
    if (configured) {
      try {
        builderCustomComponents.forEach((component) => {
          builder.registerComponent(component.component, component.config)
        })
      } catch (error) {
        console.error('Error registering Builder.io components:', error)
      }
    }
  }, [])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  const integrationExamples = {
    page: `import { BuilderPage } from './components/builder-io-component'

// Use in your component
function CustomPage() {
  return (
    <div>
      <BuilderPage model="page" />
    </div>
  )
}`,
    section: `import { BuilderSection } from './components/builder-io-component'

// Use in your component
function DashboardWithBuilderSection() {
  return (
    <div>
      <h1>My Dashboard</h1>
      <BuilderSection sectionId="hero-section" />
    </div>
  )
}`,
    widget: `import { BuilderWidget } from './components/builder-io-component'

// Use in your component  
function DashboardWithWidget() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <BuilderWidget widgetId="stats-widget-1" />
      <BuilderWidget widgetId="stats-widget-2" />
      <BuilderWidget widgetId="stats-widget-3" />
    </div>
  )
}`,
  }

  return (
    <div className="space-y-6">
      {/* Setup Instructions */}
      {!isConfigured && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Builder.io Setup Required</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>To use Builder.io with PropertyFlow, follow these steps:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Sign up at <a href="https://www.builder.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">builder.io</a></li>
              <li>Create a new space for PropertyFlow</li>
              <li>Copy your API key from Account Settings</li>
              <li>Add it to your environment variables as VITE_BUILDER_IO_API_KEY</li>
              <li>Restart your development server</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Builder.io Integration</CardTitle>
          </div>
          <CardDescription>
            Visual page builder integration for PropertyFlow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                {isConfigured ? '✅ Configured and Ready' : '⚠️ API Key Required'}
              </p>
            </div>
            {isConfigured && (
              <Button variant="outline" asChild>
                <a
                  href="https://builder.io/content"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Builder.io
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          {isConfigured && (
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={apiKey.substring(0, 20) + '...'}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={() => handleCopyCode(apiKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Models */}
      <Card>
        <CardHeader>
          <CardTitle>Available Content Models</CardTitle>
          <CardDescription>
            Create different types of content in Builder.io
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Pages</h4>
              <p className="text-sm text-muted-foreground">
                Full page layouts for marketing, landing pages, and custom views
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded">model: "page"</code>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Sections</h4>
              <p className="text-sm text-muted-foreground">
                Reusable sections like headers, footers, and hero sections
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded">model: "section"</code>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Dashboard Widgets</h4>
              <p className="text-sm text-muted-foreground">
                Custom dashboard widgets and analytics displays
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded">model: "dashboard-widget"</code>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Property Cards</h4>
              <p className="text-sm text-muted-foreground">
                Customizable property listing cards and templates
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded">model: "property-card"</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Components */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Custom Components</CardTitle>
          <CardDescription>
            These PropertyFlow components are available in the Builder.io editor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {builderCustomComponents.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{component.config.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {component.config.inputs?.length || 0} customizable properties
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const inputs = component.config.inputs?.map((input: any) => input.name).join(', ')
                    toast.info(`Properties: ${inputs}`)
                  }}
                >
                  View Props
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
          <CardDescription>
            Copy and paste these examples to use Builder.io content in your app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="page">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="page">Page</TabsTrigger>
              <TabsTrigger value="section">Section</TabsTrigger>
              <TabsTrigger value="widget">Widget</TabsTrigger>
            </TabsList>
            
            <TabsContent value="page" className="space-y-2">
              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{integrationExamples.page}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(integrationExamples.page)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="section" className="space-y-2">
              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{integrationExamples.section}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(integrationExamples.section)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="widget" className="space-y-2">
              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{integrationExamples.widget}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(integrationExamples.widget)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="https://www.builder.io/c/docs/intro" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Builder.io Documentation
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="https://www.builder.io/c/docs/custom-components-setup" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Custom Components Guide
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="https://www.builder.io/c/blueprints" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Builder.io Templates
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
