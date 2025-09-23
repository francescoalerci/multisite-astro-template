import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockWebsite = {
  id: 1,
  documentId: 'doc-1',
  apiName: 'portugal',
  name: 'Portugal',
  locale: 'en',
  defaultLocale: 'en',
  supportedLocales: ['en', 'it'],
  brand: null,
  theme: null,
  homepageHero: null,
  seoDefaults: null,
  header: null,
  footer: null,
  systemLabels: null,
  localizations: [{ id: 2, locale: 'it' }],
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
} as any;

const mockArticles = [
  {
    id: 1,
    documentId: 'article-1',
    title: 'Article',
    slug: 'article',
    summary: 'Summary',
    body: 'Body',
    createdAt: '',
    updatedAt: '',
    publishedAt: '',
  },
] as any;

const mockTags = [
  { id: 1, documentId: 'tag-1', name: 'Travel', slug: 'travel', createdAt: '', updatedAt: '', publishedAt: '' },
] as any;

describe('page.server', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns supported locales from website data', async () => {
    const cmsModule = await import('../../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockResolvedValue(mockWebsite);

    const { generateStaticPaths } = await import('../page.server');
    const paths = await generateStaticPaths();
    expect(paths).toEqual([
      { params: { lang: 'en' } },
      { params: { lang: 'it' } },
    ]);
  });

  it('returns default locales when CMS unavailable', async () => {
    const cmsModule = await import('../../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockResolvedValue(null);

    const { generateStaticPaths } = await import('../page.server');
    const paths = await generateStaticPaths();
    expect(paths.map((p) => p.params.lang)).toEqual(['en', 'pt', 'es', 'fr', 'it']);
  });

  it('redirects to default locale when none requested', async () => {
    const cmsModule = await import('../../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockResolvedValue(mockWebsite);
    vi.spyOn(cmsModule, 'getLocalizedWebsiteData').mockResolvedValue(mockWebsite);
    vi.spyOn(cmsModule, 'getArticles').mockResolvedValue(mockArticles);
    vi.spyOn(cmsModule, 'getTags').mockResolvedValue(mockTags);

    const { loadHomepage } = await import('../page.server');
    const result = await loadHomepage(undefined);
    expect(result.redirect).toBe('/en');
  });

  it('redirects to fallback when locale invalid', async () => {
    const cmsModule = await import('../../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockResolvedValue(mockWebsite);
    vi.spyOn(cmsModule, 'getLocalizedWebsiteData').mockResolvedValue(mockWebsite);
    vi.spyOn(cmsModule, 'getArticles').mockResolvedValue(mockArticles);
    vi.spyOn(cmsModule, 'getTags').mockResolvedValue(mockTags);

    const { loadHomepage } = await import('../page.server');
    const result = await loadHomepage('fr');
    expect(result.redirect).toBe('/en');
  });

  it('returns hydrated data for valid locale', async () => {
    const cmsModule = await import('../../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockResolvedValue(mockWebsite);
    vi.spyOn(cmsModule, 'getLocalizedWebsiteData').mockResolvedValue(mockWebsite);
    vi.spyOn(cmsModule, 'getArticles').mockResolvedValue(mockArticles);
    vi.spyOn(cmsModule, 'getTags').mockResolvedValue(mockTags);

    const { loadHomepage } = await import('../page.server');
    const result = await loadHomepage('en');
    expect(result.redirect).toBeUndefined();
    expect(result.articles).toHaveLength(1);
    expect(result.activeLocale).toBe('en');
    expect(result.supportedLocales).toEqual(['en', 'it']);
  });
});
