import type { APIRoute } from 'astro';
import { getWebsiteData, getArticles, getTags } from '../services/cms';
import { getLocalizedSegment } from '../utils/urlSegments';

export const GET: APIRoute = async ({ params, site, url }) => {
  try {
    const locale = params.locale as string;
    const websiteData = await getWebsiteData();
    // Priority: CMS baseUrl -> Astro.site -> Current request URL
    const baseUrl = websiteData?.baseUrl || site?.toString() || `${url.protocol}//${url.host}`;
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // Validate locale
    const supportedLocales = websiteData?.supportedLocales || ['en'];
    if (!supportedLocales.includes(locale)) {
      return new Response('Locale not found', { status: 404 });
    }

    const articles = await getArticles(locale);
    const tags = await getTags(locale);

    const currentDate = new Date().toISOString();
    const articlesSegment = getLocalizedSegment(locale, 'articles');
    const tagsSegment = getLocalizedSegment(locale, 'tags');

    // Generate URLs
    const urls: string[] = [];

    // Homepage
    urls.push(`  <url>
    <loc>${cleanBaseUrl}/${locale}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

    // Articles listing page
    if (articles.length > 0) {
      urls.push(`  <url>
    <loc>${cleanBaseUrl}/${locale}/${articlesSegment}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
    }

    // Individual articles
    articles.forEach(article => {
      const lastmod = article.updatedAt || article.publishedAt || article.createdAt;
      urls.push(`  <url>
    <loc>${cleanBaseUrl}/${locale}/${articlesSegment}/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });

    // Tag pages (if you have tag listing pages)
    tags.forEach(tag => {
      urls.push(`  <url>
    <loc>${cleanBaseUrl}/${locale}/tag/${tag.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap for locale:', params.locale, error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};

export async function getStaticPaths() {
  try {
    const websiteData = await getWebsiteData();
    const supportedLocales = websiteData?.supportedLocales || ['en'];

    return supportedLocales.map(locale => ({
      params: { locale }
    }));
  } catch (error) {
    console.error('Error generating sitemap static paths:', error);
    return [];
  }
}