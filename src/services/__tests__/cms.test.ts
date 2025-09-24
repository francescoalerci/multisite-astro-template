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
    vi.clearAllMocks();
    vi.resetModules();
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

  // Edge Cases and Error Handling Tests

  it('handles network errors gracefully', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);

    const { getWebsiteData } = await import('../cms');
    const website = await getWebsiteData();

    expect(website).toBeNull();
  });

  it('handles HTTP error responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('Server Error', { status: 500, statusText: 'Internal Server Error' })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { getWebsiteData } = await import('../cms');
    const website = await getWebsiteData();

    expect(website).toBeNull();
  });

  it('handles malformed JSON responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('Invalid JSON', { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { getWebsiteData } = await import('../cms');
    const website = await getWebsiteData();

    expect(website).toBeNull();
  });

  it('returns empty array when articles request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);

    const { getArticles } = await import('../cms');
    const articles = await getArticles('en');

    expect(articles).toEqual([]);
  });

  it('returns null when CMS_URL is not configured', async () => {
    // Mock the config module to simulate missing CMS_URL
    vi.doMock('../../config', () => ({
      config: {
        cmsUrl: null,
        cmsApiToken: 'token',
        websiteApiName: 'portugal',
        nodeEnv: 'test',
        isDevelopment: false,
      }
    }));

    vi.resetModules();

    const { getWebsiteData } = await import('../cms');
    const website = await getWebsiteData();

    expect(website).toBeNull();
  });

  it('returns empty array when CMS_URL is not configured for articles', async () => {
    // Mock the config module to simulate missing CMS_URL
    vi.doMock('../../config', () => ({
      config: {
        cmsUrl: null,
        cmsApiToken: 'token',
        websiteApiName: 'portugal',
        nodeEnv: 'test',
        isDevelopment: false,
      }
    }));

    vi.resetModules();

    const { getArticles } = await import('../cms');
    const articles = await getArticles('en');

    expect(articles).toEqual([]);
  });

  it('handles missing WEBSITE_API_NAME for article by slug', async () => {
    delete process.env.WEBSITE_API_NAME;

    const { getArticleBySlug } = await import('../cms');
    const article = await getArticleBySlug('test-slug', 'en');

    expect(article).toBeNull();
  });

  it('handles missing WEBSITE_API_NAME for articles', async () => {
    // Mock the config module to simulate missing WEBSITE_API_NAME
    vi.doMock('../../config', () => ({
      config: {
        cmsUrl: 'https://cms.example',
        cmsApiToken: 'token',
        websiteApiName: null,
        nodeEnv: 'test',
        isDevelopment: false,
      }
    }));

    vi.resetModules();

    const { getArticles } = await import('../cms');
    const articles = await getArticles('en');

    expect(articles).toEqual([]);
  });

  it('tracks HTTP requests in development mode', async () => {
    // Mock the config module to simulate development mode
    vi.doMock('../../config', () => ({
      config: {
        cmsUrl: 'https://cms.example',
        cmsApiToken: 'token',
        websiteApiName: 'portugal',
        nodeEnv: 'development',
        isDevelopment: true,
      }
    }));

    vi.resetModules();

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(SAMPLE_WEBSITE_RESPONSE));
    vi.stubGlobal('fetch', fetchMock);

    const { getWebsiteData, getHttpRequests } = await import('../cms');

    // Clear previous requests
    const requests = getHttpRequests();
    requests.length = 0;

    await getWebsiteData();

    const httpRequests = getHttpRequests();
    expect(httpRequests.length).toBeGreaterThanOrEqual(1);
    if (httpRequests.length > 0) {
      expect(httpRequests[0].url).toContain('/api/websites');
      expect(httpRequests[0].method).toBe('GET');
      expect(httpRequests[0].status).toBe(200);
      expect(httpRequests[0].duration).toBeGreaterThanOrEqual(0);
    }
  });

  it('tracks HTTP errors in development mode', async () => {
    // Mock the config module to simulate development mode
    vi.doMock('../../config', () => ({
      config: {
        cmsUrl: 'https://cms.example',
        cmsApiToken: 'token',
        websiteApiName: 'portugal',
        nodeEnv: 'development',
        isDevelopment: true,
      }
    }));

    vi.resetModules();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response('Not Found', { status: 404, statusText: 'Not Found' })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { getWebsiteData, getHttpRequests } = await import('../cms');

    // Clear previous requests
    const requests = getHttpRequests();
    requests.length = 0;

    await getWebsiteData();

    const httpRequests = getHttpRequests();
    expect(httpRequests).toHaveLength(1);
    expect(httpRequests[0].status).toBe(404);
    expect(httpRequests[0].error).toBe('HTTP 404 Not Found');
  });

  it('limits HTTP request history to 20 items', async () => {
    // Mock the config module to simulate development mode
    vi.doMock('../../config', () => ({
      config: {
        cmsUrl: 'https://cms.example',
        cmsApiToken: 'token',
        websiteApiName: 'portugal',
        nodeEnv: 'development',
        isDevelopment: true,
      }
    }));

    vi.resetModules();

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(SAMPLE_WEBSITE_RESPONSE));
    vi.stubGlobal('fetch', fetchMock);

    const { getWebsiteData, getHttpRequests } = await import('../cms');

    // Clear previous requests
    const requests = getHttpRequests();
    requests.length = 0;

    // Make 25 requests
    for (let i = 0; i < 25; i++) {
      await getWebsiteData();
    }

    const httpRequests = getHttpRequests();
    expect(httpRequests).toHaveLength(20);
  });

  it('fetches article by slug successfully', async () => {
    // Ensure we're not using mocked config that breaks functionality
    vi.resetModules();

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(SAMPLE_ARTICLES_RESPONSE));
    vi.stubGlobal('fetch', fetchMock);

    const { getArticleBySlug } = await import('../cms');
    const article = await getArticleBySlug('sample-article', 'en');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('filters%5Bslug%5D%5B%24eq%5D=sample-article');
    expect(url).toContain('locale=en');
    expect(article?.slug).toBe('sample-article');
  });

  it('returns null when article not found by slug', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      data: [],
      meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } }
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { getArticleBySlug } = await import('../cms');
    const article = await getArticleBySlug('non-existent-article', 'en');

    expect(article).toBeNull();
  });

  it('fetches tags successfully', async () => {
    // Ensure we're not using mocked config that breaks functionality
    vi.resetModules();

    const tagsResponse = {
      data: [
        {
          id: 1,
          documentId: 'tag-1',
          name: 'Travel',
          slug: 'travel',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-02',
          publishedAt: '2023-01-02'
        }
      ],
      meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 } }
    };

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(tagsResponse));
    vi.stubGlobal('fetch', fetchMock);

    const { getTags } = await import('../cms');
    const tags = await getTags('en');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/api/tags');
    expect(url).toContain('locale=en');
    expect(tags[0].name).toBe('Travel');
  });

  it('returns empty array when tags request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);

    const { getTags } = await import('../cms');
    const tags = await getTags('en');

    expect(tags).toEqual([]);
  });

  it('fetches authors successfully', async () => {
    const authorsResponse = {
      data: [
        {
          id: 1,
          documentId: 'author-1',
          name: 'John Doe',
          bio: 'Travel writer',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-02',
          publishedAt: '2023-01-02'
        }
      ],
      meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 } }
    };

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(authorsResponse));
    vi.stubGlobal('fetch', fetchMock);

    const { getAuthors } = await import('../cms');
    const authors = await getAuthors();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/api/authors');
    expect(authors[0].name).toBe('John Doe');
  });

  it('returns empty array when authors request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);

    const { getAuthors } = await import('../cms');
    const authors = await getAuthors();

    expect(authors).toEqual([]);
  });

  it('normalizes website data with missing optional fields', async () => {
    const minimalWebsiteResponse = {
      data: [{
        id: 1,
        documentId: 'doc-1',
        apiName: 'minimal',
        name: 'Minimal Site',
        locale: 'en',
        defaultLocale: 'en',
        supportedLocales: ['en'],
        // All other fields are null/undefined
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        publishedAt: '2023-01-03T00:00:00.000Z',
      }],
      meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 } }
    };

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(minimalWebsiteResponse));
    vi.stubGlobal('fetch', fetchMock);

    const { getWebsiteData } = await import('../cms');
    const website = await getWebsiteData();

    expect(website?.name).toBe('Minimal Site');
    expect(website?.brand).toBeNull();
    expect(website?.theme).toBeNull();
    expect(website?.homepageHero).toBeNull();
    expect(website?.seoDefaults).toBeNull();
    expect(website?.header).toBeNull();
    expect(website?.footer).toBeNull();
    expect(website?.systemLabels).toBeNull();
  });
});
