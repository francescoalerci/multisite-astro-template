# CLAUDE.md — multisite-astro-template

## Purpose
This repository is a **multisite Astro template** for country/city travel sites. One codebase, many deployments. Each deployment is configured by environment variables and built to **static HTML** (SSG). The emphasis is:
- **Speed**: zero JS by default, minimal CSS, Astro islands only when necessary.
- **SEO**: canonical, hreflang, JSON-LD, sitemap, robots.
- **i18n**: localized routes (`/[lang]/...`) driven by env vars.
- **Simplicity**: no database, no runtime server dependencies.

If you (Claude) generate or modify code, **preserve SSG**, avoid heavy dependencies, and keep output accessible and semantic.

---

## High-level architecture
- **Astro** with `output: "static"`.
- **Build-time fetch** from a headless CMS:
  - `CMS_URL` (e.g., `https://cms.falerci.com`)
  - `CMS_API_TOKEN` (read-only)
  - `SITE_API_NAME` (e.g., `portugal`)
- **Locales** controlled via env:
  - `DEFAULT_LOCALE` (e.g., `en`)
  - `LOCALES` (comma-separated: `en,fr,it,es,pt`)
- **SEO & branding** via env:
  - `SITE_URL`, `BRAND_NAME`, `BRAND_COLOR`, optional `ANALYTICS_ID`, `ASSETS_BASE_URL`
- **Output**: `/dist` folder, deployable to S3 + CloudFront or any static host.

---

## Environment variables
Create `.env` from `.env.example`.

Required:
- `CMS_URL`: `https://cms.falerci.com`
- `CMS_API_TOKEN`: read-only token
- `SITE_API_NAME`: site key in the CMS (e.g., `portugal`)

Recommended:
- `SITE_URL`: canonical base URL (e.g., `https://portugal.example.com`)
- `DEFAULT_LOCALE`: `en`
- `LOCALES`: `en,fr,it,es,pt`
- `BRAND_NAME`: shown in meta + JSON-LD
- `BRAND_COLOR`: hex for theme-color/manifest
- `ANALYTICS_ID`: GA4/Plausible (optional)
- `ASSETS_BASE_URL`: CDN for images (optional)
- `BUILD_TIME_ISO`: injected by CI for sitemap lastmod

---

## File layout (target)