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

### 🔄 Current Architecture
- **Astro** basic setup with component-based architecture
- **CMS Integration** with Strapi-style API and request tracking
- **Environment Configuration** for multi-site deployment
- **Dynamic Content Loading** at build time
- **Debug System** with HTTP monitoring and site information display

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
1. **Website Data**: `GET /api/websites?filters[apiName][$eq]={WEBSITE_API_NAME}`
2. **Articles**: `GET /api/articles?filters[website][apiName][$eq]={WEBSITE_API_NAME}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100`

---

## Project Structure
```
src/
├── components/
│   └── DebugPanel.astro   # Reusable debug panel component
├── config.ts              # Environment variable configuration
├── services/
│   └── cms.ts             # CMS API service with HTTP request tracking
├── layouts/
│   └── Layout.astro       # Base layout component
└── pages/
    └── index.astro        # Homepage with dynamic content
```

---

## API Integration Details

### Website Data Response
```json
{
  "data": [{
    "id": 33,
    "name": "Portugal Travel Guide",
    "apiName": "portugal",
    "defaultLocale": "en",
    "supportedLocales": ["en", "it"],
    "locale": "en",
    "brand": {
      "logo": { "url": "/uploads/logo.png" },
      "favicon": { "url": "/uploads/favicon.png" }
    },
    "theme": {
      "brandColor": "#FF8A00"
    },
    "seoDefaults": {
      "metaTitle": "Portugal Travel Guide - Your Travel Companion",
      "metaDescription": "Plan your trip to Portugal with curated itineraries and local insights."
    },
    "header": {
      "brandDisplayName": "Portugal Travel Guide",
      "tagline": "Discover Portugal, One Journey at a Time"
    },
    "footer": {
      "aboutText": "Portugal Travel Guide helps travellers explore the country with practical advice."
    },
    "systemLabels": {
      "searchPlaceholder": "Search articles…"
    }
  }]
}
```

### Articles Response
Returns array of articles filtered by website apiName, sorted by updatedAt descending. Each article now includes localized `summary`, `body`, `readingTime`, related `tags`, and optional `seo` metadata.

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