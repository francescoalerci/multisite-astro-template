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
- Environment variable configuration system
- CMS integration for website data and articles
- Dynamic homepage displaying site name and articles
- TypeScript interfaces for CMS data

### 🔄 Current Architecture
- **Astro** basic setup
- **CMS Integration** with Strapi-style API
- **Environment Configuration** for multi-site deployment
- **Dynamic Content Loading** at build time

---

## Environment Variables
Create `.env` from `.env.example`.

**Required:**
- `CMS_URL`: `https://cms.falerci.com`
- `CMS_API_TOKEN`: API authentication token
- `WEBSITE_API_NAME`: site identifier (e.g., `portugal`, `italy`)

**Currently Used API Endpoints:**
1. **Website Data**: `GET /api/websites?filters[apiName][$eq]={WEBSITE_API_NAME}`
2. **Articles**: `GET /api/articles?filters[website][apiName][$eq]={WEBSITE_API_NAME}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100`

---

## Project Structure
```
src/
├── config.ts              # Environment variable configuration
├── services/
│   └── cms.ts             # CMS API service functions
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
    "id": 3,
    "name": "Portugal Travel Guide",
    "apiName": "portugal",
    "baseUrl": "https://portugal.yourbrand.com",
    "locales": ["en", "pt", "es", "fr", "it"],
    "defaultLocale": "en",
    "brandColor": "#046A38"
  }]
}
```

### Articles Response
Returns array of articles filtered by website apiName, sorted by updatedAt descending.

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