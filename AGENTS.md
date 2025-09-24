# Repository Guidelines — multisite-astro-template

## Purpose
This repository is a **multisite Astro template** for country/city travel sites. One codebase, many deployments. Each deployment is configured by environment variables and fetches content from a headless CMS. The template includes **enterprise-level SEO optimization** with comprehensive meta tags, structured data, and performance features.

## Project Structure & Module Organization
The Astro app lives under `src`, with route files in `src/pages` and localized content served from `src/pages/[lang]/index.astro`. Shared UI components (PascalCase naming) live in `src/components`, long-form layouts in `src/layouts`, and CMS/API accessors in `src/services/cms.ts`. Utilities (camelCase naming) such as locale helpers belong in `src/utils`, while static assets reside in `public`. Build and TypeScript settings are centralized in `astro.config.mjs` and `tsconfig.json`.

Key homepage elements (NavigationBar, HeroSection, ArticleCard/Grid, DebugPanel) are extracted into dedicated components under `src/components`. New UI work should follow this component-first approach so that pages focus on data loading and orchestration while presentation logic remains encapsulated and reusable.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Run `npm run dev` for the local development server, `npm run build` to generate the static site in `dist`, and `npm run preview` to verify the production build. Use `npm run astro -- check` to lint Astro/TypeScript templates and surface configuration issues before committing.
Unit and integration tests run with Vitest (`npm run test`), with watch/coverage helpers available via `npm run test:watch` and `npm run test:coverage`.

## Coding Style & Naming Conventions
Follow the default Astro formatter (two-space indentation, trailing commas where valid) and keep components in PascalCase (`LanguageSelector.astro`) and utilities in camelCase (`getDefaultLanguage`). Co-locate component-specific styles inside the `.astro` file when practical; global styles and assets belong in `public` or a shared stylesheet. Environment access should flow through `src/config.ts` so CMS credentials and flags stay centralized.

## Testing Guidelines
**Test Coverage:**
- Unit and integration tests run with Vitest
- Component tests for UI elements (NavigationBar, HeroSection, ArticleCard/Grid, DebugPanel, NoWebsiteFallback)
- Service tests for CMS integration and locale utilities
- Test files use `*.test.ts` or `*.spec.ts` naming convention

**Testing Requirements:**
- Accompany all feature work and bug fixes with automated tests
- Target both happy-path and edge-case behavior
- Validate multiple locales and CMS fallbacks before pull requests
- Keep test suite up to date as repository evolves
- Keep `AGENTS.md` and `CLAUDE.md` in sync whenever workflow or repository guidelines change

The Vitest suite currently covers locale utilities, the CMS service, the localized homepage loader, layout/fallback UI, and key components. Extend these specs whenever behaviour changes and add coverage for any new components or services before merging.

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

## CMS & Localization Notes
**CMS Configuration:**
- Ensure `CMS_URL`, `CMS_API_TOKEN`, and `WEBSITE_API_NAME` are set in your environment before running any commands
- Treat production CMS content as source of truth
- Avoid hardcoding copy in components beyond sensible fallbacks
- When adding locales, update Strapi first, then confirm routing picks up new locale
- Ensure `getStaticPaths` and language selectors support new locales

**Content Management:**
- All content filtered by `WEBSITE_API_NAME` for multi-site deployment
- Localized content automatically filtered by language parameter
- CMS-driven branding ensures consistent visual identity across deployments

## Environment Variables
**Required:**
- `CMS_URL`: `https://cms.falerci.com`
- `CMS_API_TOKEN`: API authentication token
- `WEBSITE_API_NAME`: site identifier (e.g., `portugal`, `italy`)

**Optional:**
- `NODE_ENV`: Set to `development` to enable debug panel and HTTP tracking

## 🚀 SEO & Performance System

### Enterprise SEO Features
This template includes comprehensive SEO optimization designed for high search engine performance:

**Core SEO Components:**
- **Canonical URLs**: Dynamic canonical tags prevent duplicate content penalties
- **Multilingual Hreflang**: Smart language-aware implementation avoiding 404s
- **Social Media**: Complete Open Graph and Twitter Cards with dynamic images
- **Structured Data**: WebSite, Article, and BreadcrumbList schemas (JSON-LD)
- **Search Crawling**: Dynamic robots.txt with AI crawler blocking, multi-locale XML sitemaps
- **Performance**: Preconnect links, proper caching headers, zero hardcoded URLs

**SEO File Structure:**
```
src/
├── layouts/Layout.astro           # Enhanced with comprehensive SEO meta tags
├── pages/
│   ├── robots.txt.ts             # Dynamic, AI-optimized robots.txt
│   ├── sitemap-index.xml.ts      # Multi-locale sitemap index
│   └── sitemap-[locale].xml.ts   # Per-language sitemaps
└── utils/page.server.ts          # SEO data processing utilities
```

**URL Resolution Priority**: `websiteData.baseUrl` → `Astro.site` → `${url.protocol}//${url.host}`

**Robots.txt AI Optimization**: Blocks ChatGPT, Claude, GPTBot, PerplexityBot while allowing Google, Bing, social media crawlers.

**Dynamic Sitemaps**: Auto-updating with proper priorities (Homepage: 1.0, Articles: 0.7, Tags: 0.5) and real article timestamps.

---

## API Endpoints
1. **Website Data**: `GET /api/websites?filters[apiName][$eq]={WEBSITE_API_NAME}&populate=*`
2. **Articles**: `GET /api/articles?filters[website][apiName][$eq]={WEBSITE_API_NAME}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100&locale={LOCALE}`
3. **Tags**: `GET /api/tags?filters[website][apiName][$eq]={WEBSITE_API_NAME}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100&locale={LOCALE}`
4. **Authors**: `GET /api/authors?populate=*&sort=name:asc&pagination[page]=1&pagination[pageSize]=100`
