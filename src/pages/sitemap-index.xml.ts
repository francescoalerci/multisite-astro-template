import type { APIRoute } from 'astro';
import { getWebsiteData, getArticles } from '../services/cms';

export const GET: APIRoute = async ({ site, url }) => {
  try {
    const websiteData = await getWebsiteData();
    // Priority: CMS baseUrl -> Astro.site -> Current request URL
    const baseUrl = websiteData?.baseUrl || site?.toString() || `${url.protocol}//${url.host}`;
    const supportedLocales = websiteData?.supportedLocales || ['en'];

    // Generate sitemap URLs for each locale
    const sitemapUrls = supportedLocales.map(locale => {
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      return `  <sitemap>
    <loc>${cleanBaseUrl}/sitemap-${locale}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</sitemapindex>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};