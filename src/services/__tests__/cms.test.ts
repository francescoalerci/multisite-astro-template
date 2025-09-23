import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SAMPLE_WEBSITE_RESPONSE = {
  data: [
    {
      id: 1,
      documentId: 'doc-1',
      apiName: 'portugal',
      name: 'Portugal Travel Guide',
      locale: 'en',
      defaultLocale: 'en',
      supportedLocales: ['en', 'it'],
      brand: {
        logo: { url: '/uploads/logo.png', alternativeText: 'Logo' },
        favicon: { url: '/uploads/favicon.png', alternativeText: 'Favicon' },
      },
      theme: {
        brandColor: '#FF8A00',
        palette: {
          primary: '#FF8A00',
          secondary: '#0EA5B5',
          accent: '#FFD141',
          background: '#FFFFFF',
          surface: '#F6F7F9',
          muted: '#94A3B8',
          neutral: '#111827',
        },
      },
      homepageHero: {
        alt: 'Hero alt text',
        image: { url: '/uploads/hero.png', alternativeText: 'Hero alt text' },
      },
      seoDefaults: {
        metaTitle: 'Portugal Travel Guide - Your Travel Companion',
        metaDescription: 'Plan your trip to Portugal with curated itineraries.',
      },
      header: {
        brandDisplayName: 'Portugal Travel Guide',
        tagline: 'Discover Portugal',
        primaryNav: [
          {
            id: 10,
            label: 'Destinations',
            linkType: 'internal_route',
            path: '/destinations',
            openInNewTab: false,
          },
        ],
      },
      footer: {
        aboutText: 'About Portugal Travel Guide',
        copyrightText: '© 2025 Portugal Travel Guide',
        linkGroups: [
          {
            id: 1,
            groupTitle: 'About',
            links: [
              {
                id: 11,
                label: 'Our Mission',
                linkType: 'internal_route',
                path: '/mission',
                openInNewTab: false,
              },
            ],
          },
        ],
      },
      systemLabels: {
        searchPlaceholder: 'Search articles…',
        readMoreLabel: 'Read more',
        backToHomeLabel: 'Back to home',
      },
      localizations: [
        {
          id: 2,
          locale: 'it',
          documentId: 'doc-1-it',
        },
      ],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
      publishedAt: '2025-01-03T00:00:00.000Z',
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 25,
      pageCount: 1,
      total: 1,
    },
  },
};

const SAMPLE_ARTICLES_RESPONSE = {
  data: [
    {
      id: 1,
      documentId: 'article-1',
      title: 'Sample article',
      slug: 'sample-article',
      summary: 'Summary',
      body: 'Body',
      coverImage: {
        url: '/uploads/article.jpg',
        alternativeText: 'Article image',
      },
      readingTime: 5,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
      publishedAt: '2025-01-02T00:00:00.000Z',
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 25,
      pageCount: 1,
      total: 1,
    },
  },
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('cms service', () => {
  beforeEach(() => {
    process.env.CMS_URL = 'https://cms.example';
    process.env.CMS_API_TOKEN = 'token';
    process.env.WEBSITE_API_NAME = 'portugal';
    process.env.NODE_ENV = 'test';
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and normalizes website data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(SAMPLE_WEBSITE_RESPONSE));
    vi.stubGlobal('fetch', fetchMock);

    const { getWebsiteData } = await import('../cms');
    const website = await getWebsiteData();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('filters%5BapiName%5D%5B%24eq%5D=portugal');
    expect(url).toContain('populate%5Bbrand%5D%5Bpopulate%5D=*');

    expect(website?.brand?.logo?.fullUrl).toContain('/uploads/logo.png');
    expect(website?.homepageHero?.image?.fullUrl).toContain('/uploads/hero.png');
    expect(website?.header?.primaryNav[0].label).toBe('Destinations');
    expect(website?.footer?.linkGroups[0].links[0].label).toBe('Our Mission');
    expect(website?.systemLabels?.searchPlaceholder).toBe('Search articles…');
  });

  it('falls back to default locale when localized data is missing', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('locale=it')) {
        return jsonResponse({ data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } } });
      }
      return jsonResponse(SAMPLE_WEBSITE_RESPONSE);
    });
    vi.stubGlobal('fetch', fetchMock);

    const { getLocalizedWebsiteData } = await import('../cms');
    const website = await getLocalizedWebsiteData('it');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(website?.locale).toBe('en');
  });

  it('fetches articles with locale parameter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(SAMPLE_ARTICLES_RESPONSE));
    vi.stubGlobal('fetch', fetchMock);

    const { getArticles } = await import('../cms');
    const articles = await getArticles('en');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/api/articles');
    expect(url).toContain('locale=en');
    expect(articles[0].slug).toBe('sample-article');
  });
});
