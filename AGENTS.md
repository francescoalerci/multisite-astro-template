# Repository Guidelines

## Project Structure & Module Organization
The Astro app lives under `src`, with route files in `src/pages` and localized content served from `src/pages/[lang]/index.astro`. Shared UI lives in `src/components`, long-form layouts in `src/layouts`, and CMS/API accessors in `src/services/cms.ts`. Utilities such as locale helpers belong in `src/utils`, while static assets reside in `public`. Build and TypeScript settings are centralized in `astro.config.mjs` and `tsconfig.json`.

Key homepage elements (navigation, hero, article grid, CMS fallback) are now extracted into dedicated components under `src/components`. New UI work should follow this component-first approach so that pages focus on data loading and orchestration while presentation logic remains encapsulated and reusable.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Run `npm run dev` for the local development server, `npm run build` to generate the static site in `dist`, and `npm run preview` to verify the production build. Use `npm run astro -- check` to lint Astro/TypeScript templates and surface configuration issues before committing.

## Coding Style & Naming Conventions
Follow the default Astro formatter (two-space indentation, trailing commas where valid) and keep components in PascalCase (`LanguageSelector.astro`) and utilities in camelCase (`getDefaultLanguage`). Co-locate component-specific styles inside the `.astro` file when practical; global styles and assets belong in `public` or a shared stylesheet. Environment access should flow through `src/config.ts` so CMS credentials and flags stay centralized.

## Testing Guidelines
There is no automated test suite yet; sanity-check pages by running `npm run dev` and monitoring the in-app Debug Panel for Strapi calls. When adding tests, prefer colocated `*.test.ts` or `*.spec.ts` files inside the relevant directory and target critical services such as `getArticles`. Validate multiple locales and CMS fallbacks before opening a pull request.

## Commit & Pull Request Guidelines
Commits follow an imperative tone and concise scope (e.g., `Implement full internationalization with language routing`). Reference linked issues or CMS schema updates in the body when relevant, and keep commits focused on one logical change. Pull requests should include a summary, screenshots for UI work, impacted locales, and any required Strapi seed data or environment variable updates.

## CMS & Localization Notes
Ensure `CMS_URL`, `CMS_API_TOKEN`, and `WEBSITE_API_NAME` are set in your environment before running any commands. When adding locales, update Strapi first, then confirm `getStaticPaths` and language selectors pick up the new locale. Treat production CMS content as source of truth—avoid hardcoding copy in components beyond sensible fallbacks.
