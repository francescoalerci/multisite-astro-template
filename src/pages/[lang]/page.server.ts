import {
  getWebsiteData,
  getLocalizedWebsiteData,
  getArticles,
  getTags,
  type Website,
  type Article,
  type Tag,
} from '../../services/cms';
import { getDefaultLanguage, isValidLanguage } from '../../utils/language';

export async function generateStaticPaths() {
  try {
    const websiteData = await getWebsiteData();

    if (!websiteData) {
      return [
        { params: { lang: 'en' } },
        { params: { lang: 'pt' } },
        { params: { lang: 'es' } },
        { params: { lang: 'fr' } },
        { params: { lang: 'it' } },
      ];
    }

    const supportedLocales = websiteData.supportedLocales.length > 0
      ? websiteData.supportedLocales
      : [websiteData.defaultLocale];

    return supportedLocales.map((locale) => ({ params: { lang: locale } }));
  } catch (error) {
    console.error('Error in generateStaticPaths:', error);
    return [
      { params: { lang: 'en' } },
      { params: { lang: 'pt' } },
      { params: { lang: 'es' } },
      { params: { lang: 'fr' } },
      { params: { lang: 'it' } },
    ];
  }
}

export interface HomepageLoadResult {
  websiteData: Website | null;
  articles: Article[];
  tags: Tag[];
  supportedLocales: string[];
  activeLocale: string;
  requestedLocale?: string;
  redirect?: string;
}

export async function loadHomepage(requestedLocale?: string): Promise<HomepageLoadResult> {
  let websiteData: Website | null = null;
  let articles: Article[] = [];
  let tags: Tag[] = [];
  let supportedLocales: string[] = [];

  try {
    if (requestedLocale) {
      websiteData = await getLocalizedWebsiteData(requestedLocale);
    } else {
      websiteData = await getWebsiteData();
    }

    if (websiteData) {
      supportedLocales = websiteData.supportedLocales.length > 0
        ? websiteData.supportedLocales
        : [websiteData.defaultLocale];
    }

    if (!websiteData) {
      console.warn('Website data unavailable. Rendering fallback state.');
      return {
        websiteData: null,
        articles: [],
        tags: [],
        supportedLocales: [],
        activeLocale: requestedLocale ?? 'en',
        requestedLocale,
      };
    }

    if (!requestedLocale) {
      const defaultLang = getDefaultLanguage(supportedLocales, websiteData.defaultLocale);
      return {
        websiteData,
        articles,
        tags,
        supportedLocales,
        activeLocale: websiteData.locale,
        requestedLocale,
        redirect: `/${defaultLang}`,
      };
    }

    if (!isValidLanguage(requestedLocale, supportedLocales) || websiteData.locale !== requestedLocale) {
      const fallbackLocale = getDefaultLanguage(supportedLocales, websiteData.defaultLocale);
      return {
        websiteData,
        articles,
        tags,
        supportedLocales,
        activeLocale: websiteData.locale,
        requestedLocale,
        redirect: `/${fallbackLocale}`,
      };
    }

    articles = await getArticles(requestedLocale);
    tags = await getTags(requestedLocale);

    return {
      websiteData,
      articles,
      tags,
      supportedLocales,
      activeLocale: websiteData.locale,
      requestedLocale,
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return {
      websiteData: null,
      articles: [],
      tags: [],
      supportedLocales: [],
      activeLocale: requestedLocale ?? 'en',
      requestedLocale,
    };
  }
}
