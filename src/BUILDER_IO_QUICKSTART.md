# 🚀 Builder.io Quick Start for PropertyFlow

## What is Builder.io?

Builder.io is a visual development platform that allows you to create and manage web content without writing code. With PropertyFlow's Builder.io integration, you can:

- 📄 **Create custom pages** - Build landing pages, marketing content, and more
- 🧩 **Design reusable sections** - Create headers, footers, and content blocks
- 📊 **Build dashboard widgets** - Design custom data visualization components
- 🏠 **Customize property listings** - Create unique property card layouts
- ✨ **No-code editing** - Make changes visually without touching code

## 🎯 Getting Started (5 Minutes)

### Step 1: Access Builder.io Integration

1. Log in to PropertyFlow
2. Click on **"Builder.io Integration"** in the sidebar (look for the ✨ Sparkles icon)
3. You'll see the Builder.io Integration dashboard

### Step 2: Set Up Your Builder.io Account

1. Visit [builder.io](https://www.builder.io) and sign up for a free account
2. Create a new "Space" for PropertyFlow
3. Go to **Account Settings** → **Space Settings**
4. Copy your **Public API Key**

### Step 3: Configure PropertyFlow

**Option A: Using Environment Variables (Recommended)**
1. Create a `.env` file in your project root
2. Add: `VITE_BUILDER_IO_API_KEY=your-api-key-here`
3. Restart your development server

**Option B: Direct Configuration**
1. Open `/utils/builder-config.ts`
2. Replace `YOUR_BUILDER_IO_API_KEY` with your actual API key
3. Save the file

### Step 4: Verify Setup

1. Go back to the Builder.io Integration page in PropertyFlow
2. You should see "✅ Configured and Ready"
3. Click **"Open Builder.io"** to start creating content

## 📝 Creating Your First Page

### In Builder.io:

1. Click **"New"** → **"Page"**
2. Choose a URL path (e.g., `/welcome`)
3. Drag and drop components:
   - Use **PropertyFlow custom components** from the sidebar
   - Add text, images, buttons, etc.
4. Customize styling and content
5. Click **"Publish"**

### In PropertyFlow:

Add this code where you want to display the page:

```typescript
import { BuilderPage } from './components/builder-io-component'

function WelcomePage() {
  return <BuilderPage model="page" />
}
```

The page will automatically load based on the URL path!

## 🎨 PropertyFlow Custom Components

These special components are available in the Builder.io editor:

### 1. Property Card
Beautiful property listing cards with:
- Property images
- Title and location
- Price and details (bedrooms, bathrooms, area)
- Status badges (available, rented, sold)
- "View Details" button

### 2. Stats Widget
Dashboard statistics display with:
- Icon selection (building, users, dollar, trending)
- Large value display
- Percentage change indicators
- Trend indicators (up/down)

### 3. Hero Section
Full-width hero sections with:
- Background images
- Title and subtitle
- Call-to-action button
- Overlay option

### 4. Feature Grid
Grid layout for features with:
- Multiple feature cards
- Titles and descriptions
- Responsive layout

## 💡 Common Use Cases

### 1. Create a Marketing Landing Page

```typescript
// In your routes or components
import { BuilderPage } from './components/builder-io-component'

<BuilderPage model="page" />
```

Then in Builder.io, create a page at `/marketing` with:
- Hero section with UAE property background
- Feature grid showcasing PropertyFlow features
- Property cards showing featured listings
- Call-to-action sections

### 2. Add a Custom Dashboard Header

```typescript
import { BuilderSection } from './components/builder-io-component'

function Dashboard() {
  return (
    <div>
      <BuilderSection sectionId="dashboard-header" />
      {/* Rest of your dashboard */}
    </div>
  )
}
```

### 3. Dynamic Dashboard Widgets

```typescript
import { BuilderWidget } from './components/builder-io-component'

<div className="grid grid-cols-3 gap-4">
  <BuilderWidget widgetId="revenue-stats" />
  <BuilderWidget widgetId="occupancy-stats" />
  <BuilderWidget widgetId="maintenance-stats" />
</div>
```

### 4. Property Showcase Page

In Builder.io, create a page with multiple Property Cards:
- Drag "Property Card" component
- Fill in property details
- Add property images from Unsplash or upload
- Set prices in AED
- Publish and view

## 🔧 Advanced Features

### Pass Dynamic Data

```typescript
<BuilderPage 
  model="page"
  data={{
    userName: user.fullName,
    companyName: user.companyName,
    properties: propertyList,
    stats: dashboardStats
  }}
/>
```

Then use these in Builder.io with data bindings!

### URL-Based Content

Builder.io automatically serves content based on URL:
- `/about` → shows "about" page content
- `/contact` → shows "contact" page content
- Create different pages in Builder.io and they'll load automatically

### A/B Testing

Builder.io includes A/B testing:
1. Create variants in Builder.io
2. Set traffic allocation
3. Track conversions
4. Optimize based on results

## 📚 Content Models Available

| Model | Purpose | Example Use |
|-------|---------|-------------|
| `page` | Full pages | Landing pages, marketing pages |
| `section` | Reusable sections | Headers, footers, hero sections |
| `dashboard-widget` | Dashboard components | Stats, charts, quick actions |
| `property-card` | Property listings | Property showcases, search results |
| `header` | Site headers | Navigation, branding |
| `footer` | Site footers | Links, contact info |

## 🎓 Learning Resources

### In PropertyFlow
- Click on **Builder.io Integration** in the sidebar
- View **Integration Examples** tab for code samples
- Check **Registered Custom Components** for available components
- Use **Quick Links** for documentation

### External Resources
- [Builder.io Documentation](https://www.builder.io/c/docs/intro)
- [React SDK Guide](https://www.builder.io/c/docs/developers)
- [Custom Components Tutorial](https://www.builder.io/c/docs/custom-components-setup)

## ❓ Troubleshooting

### ⚠️ "API Key Required" message
- Make sure you've set the `VITE_BUILDER_IO_API_KEY` environment variable
- Restart your development server after adding the env variable
- Check that you're using the **Public API Key**, not the Private Key

### ⚠️ Content not loading
- Verify the content is **published** in Builder.io (not just saved as draft)
- Check browser console for errors
- Ensure the model name matches exactly (e.g., "page", not "Page")

### ⚠️ Custom components not showing
- Check that components are registered in `/components/builder-custom-components.tsx`
- Refresh the Builder.io editor after making changes
- Clear browser cache if needed

### ⚠️ Styles look different
- Builder.io uses Tailwind CSS by default
- Ensure global styles aren't conflicting
- Use Builder.io's styling options in the editor

## 🎯 Next Steps

1. ✅ Complete the setup steps above
2. ✅ Create your first page in Builder.io
3. ✅ Experiment with PropertyFlow custom components
4. ✅ Build a landing page for your property business
5. ✅ Create custom dashboard widgets
6. ✅ Design a property showcase page
7. ✅ Share your Builder.io content with your team

## 💼 Real-World Examples

### Example 1: Property Showcase Landing Page
Create a beautiful landing page in Builder.io:
- Hero section with Dubai skyline
- "Featured Properties" section with Property Cards
- Stats Widget showing your portfolio size
- Contact form or CTA button
- Footer with company info

### Example 2: Tenant Welcome Page
Design a welcome page for new tenants:
- Welcome message with tenant name (using data binding)
- Quick links to important resources
- Property details using Property Card
- FAQ section
- Contact information

### Example 3: Custom Dashboard
Build a personalized dashboard:
- Header with company branding
- Row of Stats Widgets showing KPIs
- Featured properties section
- Recent activity feed
- Quick action buttons

## 🚀 Pro Tips

1. **Start Simple** - Begin with a single page, then expand
2. **Use Templates** - Builder.io has pre-built templates you can customize
3. **Mobile First** - Always check mobile preview in Builder.io
4. **Reuse Sections** - Create sections once, use them everywhere
5. **Test Before Publishing** - Use Builder.io's preview mode
6. **Optimize Images** - Compress images before uploading
7. **Monitor Performance** - Use Builder.io analytics to track engagement

---

**Need Help?** 
- Check the [full setup guide](/BUILDER_IO_SETUP.md)
- Visit [Builder.io Community Forum](https://forum.builder.io/)
- Contact PropertyFlow support

**Ready to build?** Click on **Builder.io Integration** in your PropertyFlow sidebar to get started! ✨
