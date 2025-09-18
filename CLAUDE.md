# CLAUDE.md — multisite-astro-template

## Purpose
This repository is a **multisite Astro template** for country/city travel sites. One codebase, many deployments. Each deployment is configured by environment variables and fetches content from a headless CMS. The emphasis is:
- **Speed**: Minimal JavaScript, optimized for performance
- **Dynamic Content**: CMS-driven articles and site configuration
- **Multi-deployment**: Same codebase, different configurations per country/city
- **Simplicity**: Environment-driven configuration

If you (Claude) generate or modify code, keep it simple, fast, and maintainable.

---

## Current Implementation Status

### ✅ Completed Features
- Basic Astro project structure with layout system
- Environment variable configuration system (NODE_ENV support)
- CMS integration for website data and articles
- Dynamic homepage displaying site name and articles
- TypeScript interfaces for CMS data
- **HTTP request tracking system** with performance monitoring
- **Reusable DebugPanel component** with tabbed interface
- **Development-only debug features** (hidden in production)
- **Real-time API monitoring** with error handling
- **Full internationalization system** with language routing and switching
- **Dynamic language selector component** with country flags and names
- **CMS-driven branding** with dynamic logos, favicons, and brand colors
- **Responsive design system** with CSS custom properties integration
- **Category/tags integration** for content organization

### 🔄 Current Architecture
- **Astro** basic setup with component-based architecture
- **CMS Integration** with Strapi v5 API and request tracking
- **Environment Configuration** for multi-site deployment
- **Dynamic Content Loading** at build time
- **Debug System** with HTTP monitoring and site information display
- **Internationalization System** with dynamic routing and language switching
- **Brand-aware Design System** with CMS-driven colors and assets
- **Component-based UI** with reusable, themeable components

---

## Environment Variables
Create `.env` from `.env.example`.

**Required:**
- `CMS_URL`: `https://cms.falerci.com`
- `CMS_API_TOKEN`: API authentication token
- `WEBSITE_API_NAME`: site identifier (e.g., `portugal`, `italy`)

**Optional:**
- `NODE_ENV`: Set to `development` to enable debug panel and HTTP tracking

**Currently Used API Endpoints:**
1. **Website Data**: `GET /api/websites?filters[apiName][$eq]={WEBSITE_API_NAME}&populate=*`
2. **Articles**: `GET /api/articles?filters[website][apiName][$eq]={WEBSITE_API_NAME}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100&locale={LOCALE}`
3. **Tags**: `GET /api/tags?filters[website][apiName][$eq]={WEBSITE_API_NAME}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100&locale={LOCALE}`
4. **Authors**: `GET /api/authors?populate=*&sort=name:asc&pagination[page]=1&pagination[pageSize]=100`

---

## Project Structure
```
src/
├── components/
│   ├── DebugPanel.astro        # Reusable debug panel component
│   └── LanguageSelector.astro  # Multi-language switcher component
├── config.ts                   # Environment variable configuration
├── services/
│   └── cms.ts                  # CMS API service with HTTP request tracking
├── layouts/
│   └── Layout.astro            # Base layout with brand integration
├── utils/
│   └── language.ts             # Language utilities and mapping
└── pages/
    ├── index.astro             # Homepage with dynamic content
    └── [lang]/
        └── [...slug].astro     # Dynamic internationalized routes
```

---

## API Integration Details

### Website Data Response
```json
{
  "data": [{
    "id": 3,
    "documentId": "xyz123",
    "name": "Portugal Travel Guide",
    "apiName": "portugal",
    "baseUrl": "https://portugal.yourbrand.com",
    "locales": ["en", "pt", "es", "fr", "it"],
    "defaultLocale": "en",
    "logo": {
      "url": "/uploads/logo.png",
      "alternativeText": "Logo"
    },
    "favicon": {
      "url": "/uploads/favicon.ico",
      "alternativeText": "Favicon"
    },
    "globalSEO": {
      "metaTitle": "Portugal Travel Guide",
      "metaDescription": "Your ultimate guide to Portugal"
    },
    "brandColors": [{
      "primary": "#046A38",
      "secondary": "#F4F4F4",
      "background": "#FFFFFF",
      "text": "#333333"
    }]
  }]
}
```

### Articles Response
Returns array of localized articles filtered by website apiName, sorted by updatedAt descending.
- Articles now have `summary` instead of `excerpt`
- Articles now have `body` instead of `content`
- Articles include `coverImage`, `readingTime`, `seo`, and relationships to `tags` and `author`

### Tags Response
Returns array of tags filtered by website apiName (replaces categories).

### Authors Response
Returns array of all authors with bio, avatar, and social links.

---

## Development

**Start Development Server:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Environment Setup:**
1. Copy `.env.example` to `.env`
2. Set your CMS credentials and website API name
3. Start development server

---

## Deployment Strategy

This template is designed for **multi-deployment**:

1. **Same Codebase**: Deploy identical code multiple times
2. **Different Configs**: Each deployment uses different environment variables
3. **Site-Specific Content**: Each site shows content filtered by its `WEBSITE_API_NAME`

**Example Deployments:**
- Portugal site: `WEBSITE_API_NAME=portugal`
- Italy site: `WEBSITE_API_NAME=italy`
- Spain site: `WEBSITE_API_NAME=spain`

Each deployment will automatically show the correct site name, branding, and articles from the CMS.

---

## Internationalization System

### Multi-language Support
The template includes comprehensive internationalization capabilities:

**Features:**
- **Dynamic Language Routing**: URLs like `/en/`, `/pt/`, `/es/` automatically handled
- **Language Selector Component**: Dropdown with country flags and language names
- **CMS-driven Locales**: Available languages defined in website configuration
- **Locale-aware Content**: Articles and content automatically filtered by language
- **SEO-friendly URLs**: Clean language prefixes in all routes

### Language Selector Component
**Location:** `src/components/LanguageSelector.astro`

**Props:**
- `availableLocales` - Array of language codes from CMS
- `currentLang` - Currently active language
- `currentPath` - Current page path for language switching

**Features:**
- **Theme-aware Styling**: Uses CSS custom properties for brand integration
- **Smooth Animations**: Hover effects and transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Auto-close**: Closes when clicking outside dropdown

### Language Utilities
**Location:** `src/utils/language.ts`

Provides mapping between language codes and display information:
- Country flag emojis
- Full language names
- Language-specific formatting

---

## Brand Integration System

### Dynamic Branding
All visual elements are CMS-driven and automatically applied:

**Brand Elements:**
- **Logos and Favicons**: Automatically loaded from CMS assets
- **Color Schemes**: CSS custom properties set from brand colors
- **Typography**: Consistent with brand guidelines
- **Visual Identity**: Seamless brand consistency across sites

### CSS Custom Properties
Brand colors are injected as CSS variables:
```css
--primary: #046A38
--secondary: #F4F4F4
--background: #FFFFFF
--text: #333333
--border: #d1d5db
--shadow: rgba(0, 0, 0, 0.05)
```

Components automatically use these variables for consistent theming.

---

## Debug Panel & Development Tools

### DebugPanel Component
**Location:** `src/components/DebugPanel.astro`

A reusable development-only component that provides comprehensive debugging information:

**Props:**
- `websiteData` - Website configuration from CMS
- `articles` - Array of articles for current site
- `additionalInfo` - Optional object for page-specific debug data

**Features:**
- **Automatic visibility** - Only shows when `NODE_ENV=development`
- **Tabbed interface** - Info and HTTP request tabs
- **Toggleable UI** - Can be hidden/shown with floating toggle button
- **Bottom-right positioning** - Non-intrusive placement

### HTTP Request Tracking
**Location:** `src/services/cms.ts`

Automatic tracking of all CMS API calls with detailed monitoring:

**Tracked Data:**
- Request URL, method, and HTTP status
- Response time in milliseconds
- Timestamp of request
- Error messages for failed requests
- Complete request/response cycle

**Features:**
- **Development-only** - Tracking disabled in production
- **Real-time display** - Shows in HTTP tab of debug panel
- **Color-coded status** - Green (success), red (error), yellow (other)
- **Performance monitoring** - Duration tracking for optimization
- **Error handling** - Detailed error messages and status codes

### Usage Examples

**Basic usage in any page:**
```astro
---
import DebugPanel from '../components/DebugPanel.astro';
import { getWebsiteData, getArticles } from '../services/cms';

const websiteData = await getWebsiteData();
const articles = await getArticles();
---

<Layout>
  <!-- Your page content -->
  <DebugPanel websiteData={websiteData} articles={articles} />
</Layout>
```

**With additional page-specific info:**
```astro
<DebugPanel
  websiteData={websiteData}
  articles={articles}
  additionalInfo={{
    'Page Type': 'Blog List',
    'Total Posts': posts.length,
    'Current Filter': filter
  }}
/>
```