import { config } from '../config';

interface HttpRequest {
  url: string;
  method: string;
  status: number;
  duration: number;
  timestamp: Date;
  response?: any;
  error?: string;
}

const httpRequests: HttpRequest[] = [];

export function getHttpRequests(): HttpRequest[] {
  return httpRequests;
}

async function trackHttpRequest<T>(url: string, requestInit: RequestInit): Promise<T> {
  const startTime = Date.now();
  const request: HttpRequest = {
    url,
    method: requestInit.method || 'GET',
    status: 0,
    duration: 0,
    timestamp: new Date(),
  };

  try {
    const response = await fetch(url, requestInit);
    const endTime = Date.now();

    request.status = response.status;
    request.duration = endTime - startTime;

    if (!response.ok) {
      request.error = `HTTP ${response.status} ${response.statusText}`;
      throw new Error(request.error);
    }

    const data = await response.json();
    request.response = data;

    if (config.isDevelopment) {
      httpRequests.unshift(request);
      if (httpRequests.length > 20) {
        httpRequests.length = 20;
      }
    }

    return data as T;
  } catch (error) {
    const endTime = Date.now();
    request.duration = endTime - startTime;
    request.error = error instanceof Error ? error.message : 'Unknown error';

    if (config.isDevelopment) {
      httpRequests.unshift(request);
      if (httpRequests.length > 20) {
        httpRequests.length = 20;
      }
    }

    throw error;
  }
}

function buildCmsHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.cmsApiToken) {
    headers.Authorization = `Bearer ${config.cmsApiToken}`;
  }

  return headers;
}

export interface Media {
  id: number;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, { url: string }> | null;
}

export interface SEODefaults {
  id: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface ThemePaletteSet {
  id?: number;
  primary?: string | null;
  secondary?: string | null;
  accent?: string | null;
  background?: string | null;
  surface?: string | null;
  muted?: string | null;
  neutral?: string | null;
}

export interface ThemePalette {
  id: number;
  brandColor?: string | null;
  palette?: ThemePaletteSet | null;
}

export interface BrandIdentity {
  id: number;
  logo?: Media | null;
  favicon?: Media | null;
}

export type LinkType = 'internal_route' | 'external_url';

export interface NavMenuItem {
  id: number;
  label: string;
  linkType: LinkType;
  path?: string | null;
  url?: string | null;
  openInNewTab?: boolean | null;
}

export interface NavLinkGroup {
  id: number;
  groupTitle?: string | null;
  links?: NavMenuItem[];
}

export interface UIHeader {
  id: number;
  brandDisplayName?: string | null;
  tagline?: string | null;
  primaryNav?: NavMenuItem[];
}

export interface UIFooter {
  id: number;
  aboutText?: string | null;
  linkGroups?: NavLinkGroup[];
  copyrightText?: string | null;
}

export interface UISystemLabels {
  id: number;
  searchPlaceholder?: string | null;
  readMoreLabel?: string | null;
  backToHomeLabel?: string | null;
}

export interface HeroMin {
  id: number;
  image?: Media | null;
  alt?: string | null;
}

export interface WebsiteLocalization {
  id: number;
  documentId: string;
  locale: string;
  name?: string | null;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string | null;
  body?: string | null;
  coverImage?: Media | null;
  readingTime?: number | null;
  seo?: SEODefaults | null;
  website?: Website | null;
  tags?: Tag[];
  author?: Author | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale?: string;
  [key: string]: any;
}

export interface Tag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  website?: Website | null;
  articles?: Article[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale?: string;
  [key: string]: any;
}

export interface Author {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: Media | null;
  links?: Record<string, unknown>[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  [key: string]: any;
}

export interface Website {
  id: number;
  documentId: string;
  apiName: string;
  name: string;
  locale: string;
  defaultLocale: string;
  supportedLocales: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  brand?: BrandIdentity | null;
  theme?: ThemePalette | null;
  homepageHero?: HeroMin | null;
  seoDefaults?: SEODefaults | null;
  header?: UIHeader | null;
  footer?: UIFooter | null;
  systemLabels?: UISystemLabels | null;
  articles?: Article[];
  tags?: Tag[];
  localizations?: WebsiteLocalization[];
  [key: string]: any;
}

interface CMSResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

function ensureStringArray(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }

  return fallback;
}

function normalizeWebsite(rawWebsite: Website): Website {
  const supportedLocales = ensureStringArray(rawWebsite.supportedLocales, []);
  const fallbackLocales = rawWebsite.defaultLocale ? [rawWebsite.defaultLocale] : [];

  return {
    ...rawWebsite,
    supportedLocales: supportedLocales.length > 0 ? supportedLocales : fallbackLocales,
    theme: rawWebsite.theme
      ? {
          ...rawWebsite.theme,
          palette: rawWebsite.theme.palette ? { ...rawWebsite.theme.palette } : rawWebsite.theme.palette,
        }
      : rawWebsite.theme,
    brand: rawWebsite.brand ? { ...rawWebsite.brand } : rawWebsite.brand,
  };
}

export function resolveCmsAssetUrl(media?: Media | null): string | null {
  if (!media?.url) {
    return null;
  }

  if (media.url.startsWith('http')) {
    return media.url;
  }

  if (!config.cmsUrl) {
    console.warn('Missing CMS_URL env. Returning relative asset path for media.');
    return media.url;
  }

  const normalizedBase = config.cmsUrl.replace(/\/$/, '');
  return `${normalizedBase}${media.url}`;
}

export async function getWebsiteData(locale?: string): Promise<Website | null> {
  try {
    const params = new URLSearchParams();
    params.set('filters[apiName][$eq]', config.websiteApiName || '');
    params.set('populate[brand][populate]', '*');
    params.set('populate[theme][populate]', 'palette');
    params.set('populate[homepageHero][populate]', '*');
    params.set('populate[seoDefaults]', '*');
    params.set('populate[header][populate][primaryNav]', '*');
    params.set('populate[footer][populate][linkGroups][populate][links]', '*');
    params.set('populate[systemLabels]', '*');
    params.set('populate[articles][populate]', 'coverImage,tags,author,seo');
    params.set('populate[tags]', '*');
    params.set('publicationState', 'live');

    if (locale) {
      params.set('locale', locale);
    }

    const url = `${config.cmsUrl}/api/websites?${params.toString()}`;

    const result = await trackHttpRequest<CMSResponse<Website[]>>(url, {
      headers: buildCmsHeaders(),
    });

    if (!result.data || result.data.length === 0) {
      return null;
    }

    return normalizeWebsite(result.data[0]);
  } catch (error) {
    console.error('Error fetching website data:', error);
    return null;
  }
}

export async function getArticles(locale?: string): Promise<Article[]> {
  try {
    const params = new URLSearchParams();
    params.set('filters[website][apiName][$eq]', config.websiteApiName || '');
    params.set('populate', 'coverImage,tags,author,seo');
    params.set('sort', 'updatedAt:desc');
    params.set('pagination[page]', '1');
    params.set('pagination[pageSize]', '100');
    params.set('publicationState', 'live');

    if (locale) {
      params.set('locale', locale);
    }

    const url = `${config.cmsUrl}/api/articles?${params.toString()}`;

    const result = await trackHttpRequest<CMSResponse<Article[]>>(url, {
      headers: buildCmsHeaders(),
    });

    return result.data || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getTags(locale?: string): Promise<Tag[]> {
  try {
    const params = new URLSearchParams();
    params.set('filters[website][apiName][$eq]', config.websiteApiName || '');
    params.set('populate', 'articles');
    params.set('sort', 'updatedAt:desc');
    params.set('pagination[page]', '1');
    params.set('pagination[pageSize]', '100');
    params.set('publicationState', 'live');

    if (locale) {
      params.set('locale', locale);
    }

    const url = `${config.cmsUrl}/api/tags?${params.toString()}`;

    const result = await trackHttpRequest<CMSResponse<Tag[]>>(url, {
      headers: buildCmsHeaders(),
    });

    return result.data || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export async function getAuthors(): Promise<Author[]> {
  try {
    const params = new URLSearchParams();
    params.set('populate', 'avatar');
    params.set('sort', 'name:asc');
    params.set('pagination[page]', '1');
    params.set('pagination[pageSize]', '100');
    params.set('publicationState', 'live');

    const url = `${config.cmsUrl}/api/authors?${params.toString()}`;

    const result = await trackHttpRequest<CMSResponse<Author[]>>(url, {
      headers: buildCmsHeaders(),
    });

    return result.data || [];
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}
