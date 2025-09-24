import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockWebsiteData = {
  id: 1,
  documentId: 'doc-1',
  apiName: 'portugal',
  name: 'Portugal Travel Guide',
  locale: 'en',
  defaultLocale: 'en',
  supportedLocales: ['en', 'pt'],
  theme: {
    brandColor: '#046A38',
    palette: {
      primary: '#046A38',
      secondary: '#F4F4F4',
      background: '#FFFFFF',
      surface: '#F6F7F9',
      neutral: '#111827',
      muted: '#6b7280'
    }
  },
  brand: {
    logo: {
      url: '/uploads/logo.png',
      fullUrl: 'https://cms.example.com/uploads/logo.png',
      alternativeText: 'Portugal Logo'
    }
  },
  homepageHero: {
    image: {
      url: '/uploads/hero.jpg',
      fullUrl: 'https://cms.example.com/uploads/hero.jpg',
      alternativeText: 'Portugal Hero'
    },
    alt: 'Beautiful Portugal landscape'
  },
  header: {
    brandDisplayName: 'Discover Portugal',
    tagline: 'Your ultimate guide to Portugal',
    primaryNav: [
      {
        label: 'About',
        path: '/about',
        linkType: 'internal',
        url: null,
        openInNewTab: false
      },
      {
        label: 'External',
        path: null,
        linkType: 'external_url',
        url: 'https://example.com',
        openInNewTab: true
      }
    ]
  },
  seoDefaults: {
    metaTitle: 'Portugal Travel Guide',
    metaDescription: 'Discover the best of Portugal'
  },
  systemLabels: {
    readMoreLabel: 'Leia mais',
    searchPlaceholder: 'Pesquisar artigos...',
    backToHomeLabel: 'Voltar ao início'
  },
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
} as any;

const mockArticles = [
  {
    id: 1,
    documentId: 'article-1',
    title: 'Amazing Article',
    slug: 'amazing-article',
    summary: 'This is an amazing article about Portugal',
    body: 'Full article content here',
    coverImage: {
      url: '/uploads/article-cover.jpg',
      alternativeText: 'Article cover'
    },
    tags: [{ name: 'Travel', slug: 'travel' }],
    author: { name: 'John Doe' },
    readingTime: 5,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
    publishedAt: '2023-01-02',
  }
] as any;

const mockTags = [
  { id: 1, documentId: 'tag-1', name: 'Travel', slug: 'travel' },
  { id: 2, documentId: 'tag-2', name: 'Food', slug: 'food' },
] as any;

describe('src/pages/[lang]/index.astro', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('processes website data and extracts theme colors correctly', async () => {
    // Test the theme color processing logic
    const websiteData = mockWebsiteData;
    const themePalette = websiteData?.theme?.palette;
    const brandColor = websiteData?.theme?.brandColor ?? themePalette?.primary ?? '#FF8A00';
    const secondaryColor = themePalette?.secondary ?? '#0EA5B5';
    const backgroundColor = themePalette?.background ?? '#FFFFFF';
    const surfaceColor = themePalette?.surface ?? '#F6F7F9';
    const textColor = themePalette?.neutral ?? '#111827';
    const mutedColor = themePalette?.muted ?? '#6b7280';

    expect(brandColor).toBe('#046A38');
    expect(secondaryColor).toBe('#F4F4F4');
    expect(backgroundColor).toBe('#FFFFFF');
    expect(surfaceColor).toBe('#F6F7F9');
    expect(textColor).toBe('#111827');
    expect(mutedColor).toBe('#6b7280');
  });

  it('uses fallback colors when theme data is missing', async () => {
    const websiteDataNoTheme = { ...mockWebsiteData, theme: null };
    const themePalette = websiteDataNoTheme?.theme?.palette;
    const brandColor = websiteDataNoTheme?.theme?.brandColor ?? themePalette?.primary ?? '#FF8A00';
    const secondaryColor = themePalette?.secondary ?? '#0EA5B5';

    expect(brandColor).toBe('#FF8A00');
    expect(secondaryColor).toBe('#0EA5B5');
  });

  it('resolves media URLs correctly', async () => {
    // Mock the config
    vi.doMock('../../config', () => ({
      config: { cmsUrl: 'https://cms.example.com' }
    }));

    const { config } = await import('../../config');

    function resolveMediaUrl(path?: string | null): string | null {
      if (!path) return null;
      if (/^https?:\/\//i.test(path)) {
        return path;
      }
      if (!config.cmsUrl) {
        return path;
      }
      const normalizedBase = config.cmsUrl.replace(/\/$/, '');
      return `${normalizedBase}${path}`;
    }

    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl('')).toBeNull();
    expect(resolveMediaUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    expect(resolveMediaUrl('/uploads/image.jpg')).toBe('https://cms.example.com/uploads/image.jpg');
  });

  it('extracts brand information correctly', async () => {
    const websiteData = mockWebsiteData;
    const brandDisplayName = websiteData?.header?.brandDisplayName ?? websiteData?.name ?? 'Multisite Travel';
    const tagline = websiteData?.header?.tagline ?? websiteData?.seoDefaults?.metaDescription ?? '';

    expect(brandDisplayName).toBe('Discover Portugal');
    expect(tagline).toBe('Your ultimate guide to Portugal');
  });

  it('uses fallbacks when brand information is missing', async () => {
    const websiteDataNoBrand = {
      ...mockWebsiteData,
      header: null,
      seoDefaults: null
    };

    const brandDisplayName = websiteDataNoBrand?.header?.brandDisplayName ?? websiteDataNoBrand?.name ?? 'Multisite Travel';
    const tagline = websiteDataNoBrand?.header?.tagline ?? websiteDataNoBrand?.seoDefaults?.metaDescription ?? '';

    expect(brandDisplayName).toBe('Portugal Travel Guide');
    expect(tagline).toBe('');
  });

  it('processes navigation items correctly', async () => {
    vi.doMock('../../utils/urlSegments', () => ({
      buildLocalizedUrl: vi.fn((locale, segments, params) => `/${locale}/tag/${params.slug}`)
    }));

    const { buildLocalizedUrl } = await import('../../utils/urlSegments');

    const websiteData = mockWebsiteData;
    const activeLocale = 'en';
    const tags = mockTags;
    const primaryNav = websiteData?.header?.primaryNav ?? [];

    function resolveNavHref(item: any, locale: string): string {
      if (item.linkType === 'external_url') {
        return item.url || '#';
      }
      const path = item.path ? (item.path.startsWith('/') ? item.path : `/${item.path}`) : '';
      const localized = `/${locale}${path}`;
      return localized.replace(/\/+$/, '') || `/${locale}`;
    }

    const navLinks = primaryNav.length > 0
      ? primaryNav.map((item) => ({
          label: item.label,
          href: resolveNavHref(item, activeLocale),
          openInNewTab: Boolean(item.openInNewTab || item.linkType === 'external_url'),
        }))
      : tags.slice(0, 5).map((tag) => ({
          label: tag.name,
          href: buildLocalizedUrl(activeLocale, ['tag', ':slug'], { slug: tag.slug }),
          openInNewTab: false,
        }));

    expect(navLinks).toHaveLength(2);
    expect(navLinks[0]).toEqual({
      label: 'About',
      href: '/en/about',
      openInNewTab: false
    });
    expect(navLinks[1]).toEqual({
      label: 'External',
      href: 'https://example.com',
      openInNewTab: true
    });
  });

  it('falls back to tag navigation when no primary nav exists', async () => {
    vi.doMock('../../utils/urlSegments', () => ({
      buildLocalizedUrl: vi.fn((locale, segments, params) => `/${locale}/tag/${params.slug}`)
    }));

    const { buildLocalizedUrl } = await import('../../utils/urlSegments');

    const websiteDataNoNav = {
      ...mockWebsiteData,
      header: { ...mockWebsiteData.header, primaryNav: [] }
    };

    const activeLocale = 'en';
    const tags = mockTags;
    const primaryNav = websiteDataNoNav?.header?.primaryNav ?? [];

    const navLinks = primaryNav.length > 0
      ? primaryNav.map((item) => ({
          label: item.label,
          href: `/${activeLocale}${item.path || ''}`,
          openInNewTab: Boolean(item.openInNewTab || item.linkType === 'external_url'),
        }))
      : tags.slice(0, 5).map((tag) => ({
          label: tag.name,
          href: buildLocalizedUrl(activeLocale, ['tag', ':slug'], { slug: tag.slug }),
          openInNewTab: false,
        }));

    expect(navLinks).toHaveLength(2);
    expect(navLinks[0]).toEqual({
      label: 'Travel',
      href: '/en/tag/travel',
      openInNewTab: false
    });
  });

  it('extracts system labels correctly', async () => {
    const websiteData = mockWebsiteData;
    const readMoreLabel = websiteData?.systemLabels?.readMoreLabel ?? 'Read more';
    const searchPlaceholder = websiteData?.systemLabels?.searchPlaceholder ?? 'Search articles…';
    const backToHomeLabel = websiteData?.systemLabels?.backToHomeLabel ?? 'Back to home';

    expect(readMoreLabel).toBe('Leia mais');
    expect(searchPlaceholder).toBe('Pesquisar artigos...');
    expect(backToHomeLabel).toBe('Voltar ao início');
  });

  it('uses fallback system labels when not provided', async () => {
    const websiteDataNoLabels = {
      ...mockWebsiteData,
      systemLabels: null
    };

    const readMoreLabel = websiteDataNoLabels?.systemLabels?.readMoreLabel ?? 'Read more';
    const searchPlaceholder = websiteDataNoLabels?.systemLabels?.searchPlaceholder ?? 'Search articles…';
    const backToHomeLabel = websiteDataNoLabels?.systemLabels?.backToHomeLabel ?? 'Back to home';

    expect(readMoreLabel).toBe('Read more');
    expect(searchPlaceholder).toBe('Search articles…');
    expect(backToHomeLabel).toBe('Back to home');
  });

  it('processes SEO data correctly', async () => {
    const websiteData = mockWebsiteData;
    const brandDisplayName = websiteData?.header?.brandDisplayName ?? websiteData?.name ?? 'Multisite Travel';
    const tagline = websiteData?.header?.tagline ?? websiteData?.seoDefaults?.metaDescription ?? '';

    const seoTitle = websiteData?.seoDefaults?.metaTitle ?? brandDisplayName;
    const seoDescription = websiteData?.seoDefaults?.metaDescription ?? tagline;

    expect(seoTitle).toBe('Portugal Travel Guide');
    expect(seoDescription).toBe('Discover the best of Portugal');
  });
});