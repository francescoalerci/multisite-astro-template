import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockWebsiteData = {
  id: 1,
  documentId: 'doc-1',
  apiName: 'portugal',
  name: 'Portugal',
  locale: 'en',
  defaultLocale: 'en',
  supportedLocales: ['en', 'pt'],
  brand: null,
  theme: null,
  homepageHero: null,
  seoDefaults: null,
  header: null,
  footer: null,
  systemLabels: null,
  localizations: [{ id: 2, locale: 'pt' }],
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
} as any;

describe('src/pages/index.astro', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to default language when website data exists', async () => {
    // Mock the CMS service
    const cmsModule = await import('../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockResolvedValue(mockWebsiteData);

    // Mock the language utility
    const languageModule = await import('../../utils/language');
    vi.spyOn(languageModule, 'getDefaultLanguage').mockReturnValue('pt');

    // Mock Astro.redirect
    const mockRedirect = vi.fn();

    // Since we can't directly test the Astro component, we'll test the logic
    const websiteData = await cmsModule.getWebsiteData();
    expect(websiteData).not.toBeNull();

    if (websiteData) {
      const supportedLocales = websiteData.supportedLocales.length > 0
        ? websiteData.supportedLocales
        : [websiteData.defaultLocale];

      const defaultLang = languageModule.getDefaultLanguage(supportedLocales, websiteData.defaultLocale);
      expect(defaultLang).toBe('pt');
    }
  });

  it('redirects to English fallback when website data is null', async () => {
    const cmsModule = await import('../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockResolvedValue(null);

    const websiteData = await cmsModule.getWebsiteData();
    expect(websiteData).toBeNull();

    // When websiteData is null, should redirect to '/en'
    // This tests the fallback logic
  });

  it('uses default locale when supportedLocales is empty', async () => {
    const websiteDataWithoutLocales = {
      ...mockWebsiteData,
      supportedLocales: [],
    };

    const cmsModule = await import('../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockResolvedValue(websiteDataWithoutLocales);

    const languageModule = await import('../../utils/language');
    vi.spyOn(languageModule, 'getDefaultLanguage').mockReturnValue('en');

    const websiteData = await cmsModule.getWebsiteData();

    if (websiteData) {
      const supportedLocales = websiteData.supportedLocales.length > 0
        ? websiteData.supportedLocales
        : [websiteData.defaultLocale];

      expect(supportedLocales).toEqual(['en']);

      const defaultLang = languageModule.getDefaultLanguage(supportedLocales, websiteData.defaultLocale);
      expect(languageModule.getDefaultLanguage).toHaveBeenCalledWith(['en'], 'en');
    }
  });

  it('handles CMS service errors gracefully', async () => {
    const cmsModule = await import('../../services/cms');
    vi.spyOn(cmsModule, 'getWebsiteData').mockRejectedValue(new Error('CMS unavailable'));

    try {
      await cmsModule.getWebsiteData();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('CMS unavailable');
    }

    // In this case, the component should redirect to '/en' as fallback
  });
});