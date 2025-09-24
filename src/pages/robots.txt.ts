import type { APIRoute } from 'astro';
import { getWebsiteData } from '../services/cms';

export const GET: APIRoute = async ({ site, url }) => {
  try {
    const websiteData = await getWebsiteData();
    // Priority: CMS baseUrl -> Astro.site -> Current request URL
    const baseUrl = websiteData?.baseUrl || site?.toString() || `${url.protocol}//${url.host}`;
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${cleanBaseUrl}/sitemap-index.xml

# Block common paths that don't need indexing
Disallow: /api/
Disallow: /_astro/
Disallow: /admin/
Disallow: /debug/
Disallow: /_next/
Disallow: /node_modules/

# Allow all search engine bots to crawl images
User-agent: Googlebot-Image
Allow: /

# Allow specific bots for better SEO
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

# Block AI training crawlers (uncomment to enable)
# User-agent: CCBot
# Disallow: /

# User-agent: ChatGPT-User
# Disallow: /

# User-agent: GPTBot
# Disallow: /

# User-agent: Claude-Web
# Disallow: /

# User-agent: anthropic-ai
# Disallow: /

# User-agent: PerplexityBot
# Disallow: /

# User-agent: Bytespider
# Disallow: /

# Crawl-delay for aggressive bots
User-agent: *
Crawl-delay: 1`;

    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);

    // Fallback robots.txt - still dynamic, no hardcoded URLs
    const fallbackBaseUrl = site?.toString() || `${url.protocol}//${url.host}`;
    const fallbackRobots = `User-agent: *
Allow: /

# Fallback sitemap (error occurred)
Sitemap: ${fallbackBaseUrl.replace(/\/$/, '')}/sitemap-index.xml

Disallow: /api/
Disallow: /_astro/
Disallow: /admin/
Disallow: /debug/`;

    return new Response(fallbackRobots, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
};