import React from 'react'
import { BuilderPage, BuilderSection, BuilderWidget } from './builder-io-component'
import { builderCustomComponents } from './builder-custom-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Code, Eye, Sparkles } from 'lucide-react'

/**
 * BuilderExamplePage - Examples of how to use Builder.io in PropertyFlow
 * 
 * This component demonstrates different ways to integrate Builder.io content:
 * 1. Full pages
 * 2. Sections
 * 3. Dashboard widgets
 * 4. Custom components
 */

export function BuilderExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Builder.io Examples</h1>
          <p className="text-muted-foreground">
            See how Builder.io content can be integrated into PropertyFlow
          </p>
        </div>
        <Button asChild>
          <a
            href="https://builder.io/content"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Open Builder.io
          </a>
        </Button>
      </div>

      <Tabs defaultValue="full-page">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="full-page">Full Page</TabsTrigger>
          <TabsTrigger value="section">Section</TabsTrigger>
          <TabsTrigger value="widget">Widget</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {/* Full Page Example */}
        <TabsContent value="full-page" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Full Page Integration</CardTitle>
              <CardDescription>
                Load complete pages designed in Builder.io
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code Example
                </h4>
                <pre className="text-sm overflow-x-auto">
{`import { BuilderPage } from './components/builder-io-component'

function LandingPage() {
  return <BuilderPage model="page" />
}

// Builder.io will automatically serve content based on URL
// Example: /about -> shows "about" page from Builder.io
// Example: /contact -> shows "contact" page from Builder.io`}
                </pre>
              </div>

              <div className="border-2 border-dashed rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Create content at this URL in Builder.io to see it here
                  </p>
                </div>
                <BuilderPage
                  model="page"
                  customComponents={builderCustomComponents}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 How to use this</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Go to Builder.io and create a new "Page"</li>
                  <li>Set the URL to match your current path (e.g., /builder-examples)</li>
                  <li>Design your page using drag-and-drop</li>
                  <li>Click Publish</li>
                  <li>Refresh this page to see your content</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Example */}
        <TabsContent value="section" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section Integration</CardTitle>
              <CardDescription>
                Embed reusable sections like headers, footers, or hero blocks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code Example
                </h4>
                <pre className="text-sm overflow-x-auto">
{`import { BuilderSection } from './components/builder-io-component'

function DashboardWithHero() {
  return (
    <div>
      {/* Builder.io hero section */}
      <BuilderSection sectionId="dashboard-hero" />
      
      {/* Your existing dashboard content */}
      <div className="grid grid-cols-3 gap-4">
        {/* ... dashboard content ... */}
      </div>
    </div>
  )
}`}
                </pre>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Example: Hero Section</h4>
                  <BuilderSection sectionId="example-hero" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Create a section with ID "example-hero" in Builder.io to display it here
                  </p>
                </div>

                <div className="border-2 border-dashed rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Example: Announcement Banner</h4>
                  <BuilderSection sectionId="announcement-banner" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Create a section with ID "announcement-banner" for announcements
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">💡 Best Practices</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                  <li>Use sections for reusable content (headers, footers)</li>
                  <li>Give sections meaningful IDs (e.g., "dashboard-hero", "footer")</li>
                  <li>Create once, use across multiple pages</li>
                  <li>Update in Builder.io to update everywhere</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Widget Example */}
        <TabsContent value="widget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Widget Integration</CardTitle>
              <CardDescription>
                Create custom dashboard widgets visually in Builder.io
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code Example
                </h4>
                <pre className="text-sm overflow-x-auto">
{`import { BuilderWidget } from './components/builder-io-component'

function CustomDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BuilderWidget widgetId="revenue-widget" />
      <BuilderWidget widgetId="occupancy-widget" />
      <BuilderWidget widgetId="maintenance-widget" />
    </div>
  )
}`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <BuilderWidget widgetId="widget-1" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Widget ID: "widget-1"
                    </p>
                  </div>
                </div>
                <div className="border-2 border-dashed rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <BuilderWidget widgetId="widget-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Widget ID: "widget-2"
                    </p>
                  </div>
                </div>
                <div className="border-2 border-dashed rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <BuilderWidget widgetId="widget-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Widget ID: "widget-3"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">💡 Widget Ideas</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
                  <li>Revenue statistics with charts</li>
                  <li>Occupancy rates and trends</li>
                  <li>Maintenance request counters</li>
                  <li>Quick action buttons</li>
                  <li>Recent activity feeds</li>
                  <li>Upcoming events calendar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Components Example */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PropertyFlow Custom Components</CardTitle>
              <CardDescription>
                Use PropertyFlow's custom components in Builder.io
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {builderCustomComponents.map((component, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{component.config.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {component.config.inputs?.length || 0} customizable properties
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">Available properties:</p>
                      <div className="flex flex-wrap gap-1">
                        {component.config.inputs?.slice(0, 5).map((input: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {input.name}
                          </span>
                        ))}
                        {(component.config.inputs?.length || 0) > 5 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            +{(component.config.inputs?.length || 0) - 5} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">💡 How to use custom components</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
                  <li>Open Builder.io editor</li>
                  <li>Look for "PropertyFlow" section in the component panel</li>
                  <li>Drag custom components (Property Card, Stats Widget, etc.) onto your page</li>
                  <li>Customize using the properties panel</li>
                  <li>Publish and see them in PropertyFlow</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>
            Common patterns for using Builder.io in PropertyFlow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Import Components</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                import {'{ BuilderPage, BuilderSection, BuilderWidget }'} from './components/builder-io-component'
              </code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Common Patterns</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-muted p-2 rounded">
                  <span className="font-mono">{'<BuilderPage model="page" />'}</span>
                  <span className="text-muted-foreground ml-2">- URL-based page loading</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="font-mono">{'<BuilderSection sectionId="header" />'}</span>
                  <span className="text-muted-foreground ml-2">- Specific section by ID</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="font-mono">{'<BuilderWidget widgetId="stats" />'}</span>
                  <span className="text-muted-foreground ml-2">- Dashboard widget by ID</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Next Steps</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/BUILDER_IO_QUICKSTART.md" target="_blank">
                    Quick Start Guide
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/BUILDER_IO_SETUP.md" target="_blank">
                    Full Documentation
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://www.builder.io/c/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Builder.io Docs
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
