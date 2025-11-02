# Builder.io Integration Guide for PropertyFlow

This guide will help you set up and use Builder.io with your PropertyFlow application.

## 🚀 Quick Start

### 1. Create a Builder.io Account

1. Go to [https://www.builder.io](https://www.builder.io)
2. Sign up for a free account
3. Create a new "Space" for PropertyFlow

### 2. Get Your API Key

1. In Builder.io, go to **Account Settings** → **Space Settings**
2. Copy your **Public API Key**
3. Add it to your environment variables:

Create a `.env` file in your project root:
```env
VITE_BUILDER_IO_API_KEY=your-api-key-here
```

### 3. Install Required Packages

The following package needs to be imported in your project:

```bash
npm install @builder.io/react
```

Note: In Figma Make, you can simply import it and it will be available:
```typescript
import { builder, BuilderComponent } from '@builder.io/react'
```

### 4. Restart Your Development Server

After adding the environment variable, restart your dev server for changes to take effect.

## 📦 What's Included

### Components

1. **BuilderContent** (`/components/builder-io-component.tsx`)
   - Core component for rendering Builder.io content
   - Handles loading states and errors
   - Supports all content models

2. **BuilderPage** (`/components/builder-io-component.tsx`)
   - Renders full pages from Builder.io
   - Perfect for landing pages and marketing content

3. **BuilderSection** (`/components/builder-io-component.tsx`)
   - Renders specific sections by ID
   - Great for headers, footers, hero sections

4. **BuilderWidget** (`/components/builder-io-component.tsx`)
   - Renders dashboard widgets
   - Customizable dashboard components

5. **BuilderEditorManager** (`/components/builder-io-editor.tsx`)
   - Management interface for Builder.io integration
   - Shows setup status, examples, and documentation

### Custom Components

The following PropertyFlow components are registered and available in the Builder.io visual editor:

1. **Property Card** - Display property listings with images, details, and CTAs
2. **Stats Widget** - Dashboard statistics with icons and trends
3. **Hero Section** - Full-width hero sections with background images
4. **Feature Grid** - Grid layout for features and benefits

## 🎨 Using Builder.io in PropertyFlow

### Method 1: Add to Main Dashboard

Edit `/components/main-dashboard.tsx` to add Builder.io integration:

```typescript
import { BuilderEditorManager } from './builder-io-editor'

// Add to your sidebar navigation items:
{
  title: 'Builder.io',
  url: '/builder',
  icon: Sparkles,
  onClick: () => setActiveView('builder-manager')
}

// Add to your view rendering:
{activeView === 'builder-manager' && (
  <BuilderEditorManager user={user} />
)}
```

### Method 2: Create Landing Pages

```typescript
import { BuilderPage } from './components/builder-io-component'

function LandingPage() {
  return <BuilderPage model="page" />
}
```

### Method 3: Add Custom Sections

```typescript
import { BuilderSection } from './components/builder-io-component'

function Dashboard() {
  return (
    <div>
      <BuilderSection sectionId="dashboard-hero" />
      {/* Your existing dashboard content */}
    </div>
  )
}
```

### Method 4: Dynamic Dashboard Widgets

```typescript
import { BuilderWidget } from './components/builder-io-component'

function CustomDashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <BuilderWidget widgetId="revenue-widget" />
      <BuilderWidget widgetId="occupancy-widget" />
      <BuilderWidget widgetId="maintenance-widget" />
    </div>
  )
}
```

## 🛠️ Creating Content in Builder.io

### Step 1: Create Models

In your Builder.io dashboard:

1. Go to **Models**
2. Create the following models:
   - `page` - For full pages
   - `section` - For reusable sections
   - `dashboard-widget` - For dashboard widgets
   - `property-card` - For property listings

### Step 2: Design Your Content

1. Click **New Entry** in Builder.io
2. Select your model (e.g., "page")
3. Use the visual editor to design:
   - Drag and drop components
   - Use PropertyFlow custom components (Property Card, Stats Widget, etc.)
   - Customize styling and content
   - Preview on different devices

### Step 3: Publish and Use

1. Click **Publish** in Builder.io
2. Your content is now live
3. Use the components in PropertyFlow:

```typescript
// For a page at URL /marketing
<BuilderPage model="page" />

// For a specific section
<BuilderSection sectionId="your-section-id" />

// For a dashboard widget
<BuilderWidget widgetId="your-widget-id" />
```

## 🎯 Use Cases for PropertyFlow

### 1. Marketing Pages
Create beautiful landing pages without touching code:
- Property showcases
- Company information pages
- Service offerings
- Testimonials and reviews

### 2. Dynamic Dashboard Widgets
Build custom dashboard widgets visually:
- KPI displays
- Chart configurations
- Quick action panels
- Announcement banners

### 3. Email Templates
Design email templates for:
- Rent reminders
- Maintenance updates
- Welcome messages
- Invoices and receipts

### 4. Property Listings
Create custom property card layouts:
- Featured properties
- Search result cards
- Property detail pages
- Comparison views

### 5. Tenant Portal Pages
Customize tenant-facing pages:
- Welcome pages
- FAQ sections
- Service request forms
- Payment portals

## 🔧 Advanced Configuration

### Passing Custom Data

```typescript
<BuilderPage 
  model="page"
  data={{
    user: currentUser,
    properties: propertyList,
    companyName: 'PropertyFlow',
  }}
/>
```

### URL-based Content

Builder.io automatically serves content based on URL:

```typescript
// Content served based on window.location.pathname
<BuilderPage model="page" />

// /about → shows "about" page
// /contact → shows "contact" page
```

### Custom Component Registration

To add more custom components, edit `/components/builder-custom-components.tsx`:

```typescript
export const builderCustomComponents = [
  // ... existing components
  {
    component: YourCustomComponent,
    config: {
      name: 'Your Component Name',
      inputs: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        // ... more inputs
      ],
    },
  },
]
```

## 📱 Preview Mode

Builder.io includes a preview mode for editors:

1. In Builder.io editor, click **Preview**
2. Your app will load with the draft content
3. Make changes and see them in real-time
4. Publish when ready

## 🌐 Multi-language Support

Support multiple languages:

```typescript
<BuilderPage 
  model="page"
  locale="ar-AE"  // Arabic (UAE)
/>
```

## 🔐 Access Control

Restrict Builder.io content by role:

```typescript
function ProtectedBuilderPage({ user }) {
  if (user.role !== 'platform_admin') {
    return <div>Access denied</div>
  }
  
  return <BuilderPage model="admin-page" />
}
```

## 📊 Analytics

Builder.io includes built-in analytics:

1. Track page views
2. A/B testing
3. Conversion tracking
4. Heatmaps (in paid plans)

## 🆘 Troubleshooting

### API Key Not Working
- Ensure you're using the **Public API Key**, not the Private Key
- Check that the environment variable is set correctly
- Restart your development server

### Content Not Loading
- Verify the content is published in Builder.io
- Check browser console for errors
- Ensure the model name matches exactly

### Custom Components Not Showing
- Confirm components are registered in `builder-custom-components.tsx`
- Check that Builder.io SDK is initialized
- Refresh the Builder.io editor

### Styling Issues
- Builder.io uses Tailwind CSS by default
- Custom styles can be added in the Builder.io editor
- Ensure global styles don't conflict

## 📚 Resources

- [Builder.io Documentation](https://www.builder.io/c/docs/intro)
- [React SDK Guide](https://www.builder.io/c/docs/developers)
- [Custom Components](https://www.builder.io/c/docs/custom-components-setup)
- [API Reference](https://www.builder.io/c/docs/api-reference)

## 💡 Best Practices

1. **Use Models** - Create separate models for different content types
2. **Reuse Sections** - Create reusable sections for headers, footers, etc.
3. **Test Before Publishing** - Always preview content before publishing
4. **Version Control** - Use Builder.io's version history
5. **Optimize Images** - Compress images before uploading
6. **Mobile First** - Design for mobile, then desktop
7. **Accessibility** - Use semantic HTML and alt text
8. **Performance** - Lazy load heavy content

## 🎓 Next Steps

1. ✅ Set up your Builder.io account
2. ✅ Add your API key to environment variables
3. ✅ Explore the Builder.io editor
4. ✅ Create your first page or section
5. ✅ Integrate it into PropertyFlow
6. ✅ Customize with PropertyFlow components
7. ✅ Share with your team

---

For questions or support, visit the [Builder.io Community](https://forum.builder.io/) or contact the PropertyFlow team.
