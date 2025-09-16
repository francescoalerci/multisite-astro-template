# Multisite Astro Template

A lean Astro template designed for **multi-deployment** scenarios. Deploy the same codebase multiple times with different environment variables to create country/city-specific websites powered by a headless CMS.

## ✨ Features

- **🌍 Multi-site deployment** - One codebase, many sites (portugal.site.com, italy.site.com, etc.)
- **📡 CMS Integration** - Dynamic content from headless CMS with automatic filtering
- **🔧 Debug Panel** - Development-only debug panel with HTTP request tracking
- **⚡ Performance** - Minimal JavaScript, optimized for speed
- **🛠 Developer Experience** - TypeScript, environment-driven configuration

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <this-repo>
   cd multisite-astro-template
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your CMS credentials
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

```text
src/
├── components/
│   └── DebugPanel.astro       # Development debug panel
├── layouts/
│   └── Layout.astro           # Base layout component
├── pages/
│   └── index.astro            # Homepage with dynamic content
├── services/
│   └── cms.ts                 # CMS API integration with HTTP tracking
└── config.ts                  # Environment configuration
```

## ⚙️ Environment Variables

Create `.env` from `.env.example` and configure:

**Required:**
- `CMS_URL` - Your headless CMS URL
- `CMS_API_TOKEN` - Read-only API token
- `WEBSITE_API_NAME` - Site identifier (e.g., `portugal`, `italy`)

**Optional:**
- `NODE_ENV` - Set to `development` for debug panel

## 🌍 Multi-Site Deployment

Deploy the same codebase multiple times with different environment variables:

```bash
# Portugal deployment
WEBSITE_API_NAME=portugal npm run build

# Italy deployment
WEBSITE_API_NAME=italy npm run build
```

Each deployment will automatically:
- Show the correct site name and branding from CMS
- Display articles filtered for that specific site
- Use the appropriate locales and configuration

## 🔧 Development Features

### Debug Panel
When `NODE_ENV=development`, a debug panel appears in the bottom-right corner showing:
- **Info Tab**: Environment variables, site configuration, CMS data
- **HTTP Tab**: Real-time API request monitoring with performance metrics

### HTTP Request Tracking
All CMS API calls are automatically tracked with:
- Request URL, method, and status codes
- Response times and error handling
- Color-coded status indicators

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Install dependencies                             |
| `npm run dev`             | Start local dev server at `localhost:4321`       |
| `npm run build`           | Build production site to `./dist/`               |
| `npm run preview`         | Preview build locally before deploying          |

## 🎯 Use Cases

Perfect for:
- **Travel sites** (portugal.travel.com, italy.travel.com)
- **Regional businesses** with multiple locations
- **Multi-language sites** with shared content structure
- **Franchise websites** with location-specific content

## 📖 Documentation

See `CLAUDE.md` for detailed technical documentation and implementation notes.
