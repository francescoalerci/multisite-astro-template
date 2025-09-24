# CLAUDE.md — multisite-astro-template

## Purpose
This repository is a **multisite Astro template** for country/city travel sites. One codebase, many deployments. Each deployment is configured by environment variables and fetches content from a headless CMS. The emphasis is:
- **Speed**: Minimal JavaScript, optimized for performance
- **Dynamic Content**: CMS-driven articles and site configuration
- **Multi-deployment**: Same codebase, different configurations per country/city
- **Simplicity**: Environment-driven configuration

If you (Claude) generate or modify code, keep it simple, fast, and maintainable.

## Coding Style & Conventions
- **Formatting**: Default Astro formatter with two-space indentation and trailing commas
- **Component Naming**: PascalCase for components (`LanguageSelector.astro`)
- **Utility Naming**: camelCase for utilities (`getDefaultLanguage`)
- **Component Architecture**: Component-first approach with co-located styles in `.astro` files
- **Environment Access**: Flow through `src/config.ts` for centralized configuration
- **Global Styles**: Keep in `public` or shared stylesheets, not component-specific

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
- **🚀 COMPREHENSIVE SEO SYSTEM** with enterprise-level features:
  - **Canonical URLs** - Dynamic canonical tags to prevent duplicate content
  - **Hreflang Tags** - Smart multilingual SEO with language-aware implementation
  - **Open Graph & Twitter Cards** - Complete social media optimization
  - **Structured Data (JSON-LD)** - WebSite, Article, and BreadcrumbList schemas
  - **Dynamic Robots.txt** - AI-optimized with bot-specific rules
  - **XML Sitemaps** - Multi-locale, auto-updating sitemaps with proper priorities
  - **Performance Optimization** - Preconnect links and resource hints
  - **Zero Hardcoded URLs** - Fully dynamic URL generation from CMS or request context

### 🔄 Current Architecture
- **Astro** basic setup with component-based architecture
- **CMS Integration** with Strapi v5 API and request tracking
- **Environment Configuration** for multi-site deployment
- **Dynamic Content Loading** at build time
- **Debug System** with HTTP monitoring and site information display
- **Internationalization System** with dynamic routing and language switching
- **Brand-aware Design System** with CMS-driven colors and assets
- **Component-based UI** with reusable, themeable components
- **Enterprise SEO Architecture** with dynamic meta generation and search optimization

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
├── components/             # Shared UI components (PascalCase naming)
│   ├── DebugPanel.astro        # Reusable debug panel component
│   ├── LanguageSelector.astro  # Multi-language switcher component
│   ├── NavigationBar.astro     # Site navigation component
│   ├── HeroSection.astro       # Homepage hero component
│   ├── ArticleCard.astro       # Individual article display
│   └── ArticleGrid.astro       # Article listing component
├── layouts/                # Long-form page layouts
│   └── Layout.astro            # Base layout with brand integration
├── pages/                  # Route files and localized content
│   ├── index.astro             # Homepage with dynamic content
│   └── [lang]/
│       ├── index.astro         # Localized homepage
│       └── [...slug].astro     # Dynamic internationalized routes
├── services/               # CMS/API accessors
│   └── cms.ts                  # CMS API service with HTTP request tracking
├── utils/                  # Utilities (camelCase naming)
│   └── language.ts             # Language utilities and mapping
├── config.ts               # Environment variable configuration
public/                     # Static assets
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

**Build, Test, and Development Commands:**
```bash
npm install              # Install dependencies
npm run dev             # Start local development server
npm run build           # Generate static site in dist/
npm run preview         # Verify production build
npm run astro -- check  # Lint Astro/TypeScript templates
npm run test            # Run unit and integration tests with Vitest
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Testing Expectations

- Every feature or bug fix must ship with automated tests. Prefer colocated `*.test.ts` / `*.spec.ts` files and cover both happy-path and edge cases.
- The Vitest suite currently covers locale utilities, CMS services, localized homepage loading, layout/fallback UI, and core components (NavigationBar, HeroSection, ArticleCard/Grid, DebugPanel, NoWebsiteFallback).
- Keep these specs up to date as behaviour changes. Add component/service coverage alongside new functionality before merging.
- When updating workflow guidance, mirror the change in both `AGENTS.md` and `CLAUDE.md` so all assistants share the same instructions.

**Environment Setup:**
1. Copy `.env.example` to `.env`
2. Set your CMS credentials and website API name
3. Start development server

**Required Environment Variables:**
- `CMS_URL`: CMS endpoint URL
- `CMS_API_TOKEN`: API authentication token
- `WEBSITE_API_NAME`: Site identifier for content filtering

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

---

## Testing Guidelines

**Test Coverage:**
- Unit and integration tests run with Vitest
- Component tests for UI elements (NavigationBar, HeroSection, ArticleCard/Grid)
- Service tests for CMS integration and locale utilities
- Test files use `*.test.ts` or `*.spec.ts` naming convention

**Testing Requirements:**
- Accompany all feature work and bug fixes with automated tests
- Target both happy-path and edge-case behavior
- Validate multiple locales and CMS fallbacks before pull requests
- Keep test suite up to date as repository evolves

---

## Commit & Pull Request Guidelines

**Commit Standards:**
- Use imperative tone and concise scope (e.g., `Implement full internationalization with language routing`)
- Reference linked issues or CMS schema updates in commit body when relevant
- Keep commits focused on one logical change
- Follow conventional commit format where applicable

**Pull Request Requirements:**
- Include summary and description of changes
- Add screenshots for UI work
- Document impacted locales and languages
- Include any required Strapi seed data or environment variable updates
- Ensure all tests pass before requesting review

---

## CMS & Localization Notes

**CMS Configuration:**
- Treat production CMS content as source of truth
- Avoid hardcoding copy in components beyond sensible fallbacks
- When adding locales, update Strapi first, then confirm routing picks up new locale
- Ensure `getStaticPaths` and language selectors support new locales

**Content Management:**
- All content filtered by `WEBSITE_API_NAME` for multi-site deployment
- Localized content automatically filtered by language parameter
- CMS-driven branding ensures consistent visual identity across deployments

---

## 🚀 SEO & Performance Optimization

### Enterprise SEO Features

This template includes a comprehensive SEO system designed to achieve high search engine scores:

#### **Canonical URLs & Duplicate Content Prevention**
- **Dynamic canonical tags** on every page prevent duplicate content penalties
- **Smart URL resolution** uses CMS `baseUrl` → `Astro.site` → request URL fallback
- **Zero hardcoded URLs** - fully dynamic URL generation

#### **Multilingual SEO (Hreflang)**
- **Language-aware hreflang tags** prevent SEO issues with missing translations
- **Homepage**: Shows all supported locales with proper language targeting
- **Articles**: Conservative approach - only current language to avoid 404s
- **x-default** fallback points to default locale

#### **Social Media Optimization**
- **Open Graph tags**: Complete OG implementation for Facebook, LinkedIn
- **Twitter Cards**: `summary_large_image` cards with proper dimensions
- **Dynamic images**: Uses article cover images or hero images automatically
- **Article metadata**: Publication dates, authors, tags for rich social previews

#### **Structured Data (Schema.org)**
- **WebSite Schema**: Site-wide information with search functionality
- **Article Schema**: Complete article metadata for rich snippets
- **BreadcrumbList Schema**: Navigation hierarchy for better UX
- **JSON-LD format** for optimal search engine compatibility

#### **Search Engine Crawling**
- **Dynamic robots.txt**:
  - Uses CMS base URL automatically
  - **AI-optimized**: Blocks training crawlers (ChatGPT, Claude, etc.)
  - **SEO-friendly**: Allows Google, Bing, Facebook, Twitter bots
  - **Rate limiting**: 1-second crawl delay for aggressive bots
- **XML Sitemaps**:
  - **Multi-locale sitemaps**: Separate sitemap per language
  - **Auto-updating**: New articles appear automatically
  - **Smart priorities**: Homepage (1.0) > Articles (0.7) > Tags (0.5)
  - **Proper timestamps**: Uses actual article update dates

#### **Performance Optimizations**
- **Preconnect links**: CMS, Google Fonts for faster loading
- **DNS prefetch**: External resources resolved early
- **Proper caching headers**: Robots (24h), Sitemaps (1h) cache
- **Efficient meta tag generation**: Minimal overhead, maximum SEO impact

### SEO Implementation Files

```
src/
├── layouts/Layout.astro           # Enhanced with comprehensive SEO meta tags
├── pages/
│   ├── robots.txt.ts             # Dynamic, AI-optimized robots.txt
│   ├── sitemap-index.xml.ts      # Multi-locale sitemap index
│   └── sitemap-[locale].xml.ts   # Per-language sitemaps
└── utils/page.server.ts          # SEO data processing utilities
```

### Usage Examples

**Homepage with SEO**:
```astro
<Layout
  title="Portugal Travel Guide"
  description="Plan your trip to Portugal..."
  websiteData={websiteData}
  currentLocale="en"
  image={heroImage}
>
```

**Article with Full SEO**:
```astro
<Layout
  title={article.title}
  description={article.summary}
  websiteData={websiteData}
  currentLocale="en"
  image={coverImage}
  article={{
    title: article.title,
    summary: article.summary,
    publishedAt: article.publishedAt,
    author: article.author,
    tags: article.tags,
    slug: article.slug
  }}
  breadcrumbs={[
    { name: "Home", url: "/en" },
    { name: "Articles", url: "/en/articles" },
    { name: article.title, url: `/en/articles/${article.slug}` }
  ]}
>
```

### SEO Testing & Validation

**Development Testing**:
- Visit `http://localhost:4321/robots.txt` to verify robots.txt generation
- Check `http://localhost:4321/sitemap-index.xml` for sitemap structure
- Use browser dev tools to inspect meta tags and structured data
- Test social sharing with Facebook Debugger / Twitter Card Validator

**Production Validation**:
- Google Search Console: Submit sitemaps, monitor indexing
- Rich Results Test: Validate structured data implementation
- PageSpeed Insights: Verify performance optimizations
- Social debuggers: Test Open Graph and Twitter Card rendering

This SEO system is designed to achieve enterprise-level search engine optimization while maintaining flexibility for multi-site deployment.
