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

// Global request tracker for development
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
      httpRequests.unshift(request); // Add to beginning
      // Keep only last 20 requests
      if (httpRequests.length > 20) {
        httpRequests.length = 20;
      }
    }

    return data;
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

export interface MediaAsset {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
}

export interface ThemePaletteSet {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  muted?: string;
  neutral?: string;
}

export interface ThemePalette {
  brandColor?: string;
  palette?: ThemePaletteSet;
}

export interface NavMenuItem {
  id?: number;
  label: string;
  linkType: 'internal_route' | 'external_url';
  path?: string | null;
  url?: string | null;
  openInNewTab?: boolean;
}

export interface NavLinkGroup {
  id?: number;
  groupTitle?: string | null;
  links: NavMenuItem[];
}

export interface WebsiteHeader {
  brandDisplayName?: string;
  tagline?: string;
  primaryNav: NavMenuItem[];
}

export interface WebsiteFooter {
  aboutText?: string | null;
  linkGroups: NavLinkGroup[];
  copyrightText?: string | null;
}

export interface WebsiteSystemLabels {
  searchPlaceholder?: string;
  readMoreLabel?: string;
  backToHomeLabel?: string;
}

export interface SeoDefaults {
  metaTitle?: string;
  metaDescription?: string;
}

export interface WebsiteLocalizationSummary {
  id: number;
  locale: string;
  name?: string;
}

export interface Tag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  readingTime?: number | null;
  coverImage?: MediaAsset;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  seo?: SeoDefaults;
  tags: Tag[];
}

export interface Website {
  id: number;
  documentId: string;
  name: string;
  apiName: string;
  defaultLocale: string;
  supportedLocales: string[];
  locale: string;
  brand?: {
    logo?: MediaAsset;
    favicon?: MediaAsset;
  };
  theme?: ThemePalette;
  homepageHero?: {
    image?: MediaAsset;
    alt?: string | null;
  };
  seoDefaults?: SeoDefaults;
  header?: WebsiteHeader;
  footer?: WebsiteFooter;
  systemLabels?: WebsiteSystemLabels;
  tags: Tag[];
  articles: Article[];
  localizations: WebsiteLocalizationSummary[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
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

function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function resolveMedia(media: any): MediaAsset | undefined {
  if (!media) {
    return undefined;
  }

  const mediaEntry = Array.isArray(media) ? media[0] : media;

  if (!mediaEntry || typeof mediaEntry !== 'object' || !mediaEntry.url) {
    return undefined;
  }

  return {
    id: mediaEntry.id,
    url: mediaEntry.url,
    alternativeText: mediaEntry.alternativeText ?? mediaEntry.alt ?? undefined,
    caption: mediaEntry.caption ?? undefined,
    width: mediaEntry.width ?? undefined,
    height: mediaEntry.height ?? undefined,
    formats: mediaEntry.formats ?? undefined,
  };
}

function normalizeNavMenuItem(item: any): NavMenuItem | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  return {
    id: item.id,
    label: item.label ?? '',
    linkType: item.linkType ?? 'internal_route',
    path: item.path ?? null,
    url: item.url ?? null,
    openInNewTab: item.openInNewTab ?? false,
  };
}

function normalizeLinkGroup(group: any): NavLinkGroup | null {
  if (!group || typeof group !== 'object') {
    return null;
  }

  return {
    id: group.id,
    groupTitle: group.groupTitle ?? null,
    links: ensureArray(group.links)
      .map(normalizeNavMenuItem)
      .filter((item): item is NavMenuItem => item !== null),
  };
}

function normalizeTag(tag: any): Tag | null {
  if (!tag || typeof tag !== 'object') {
    return null;
  }

  return {
    id: tag.id,
    documentId: tag.documentId,
    name: tag.name ?? '',
    slug: tag.slug ?? '',
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
    publishedAt: tag.publishedAt,
  };
}

function normalizeArticle(article: any): Article | null {
  if (!article || typeof article !== 'object') {
    return null;
  }

  return {
    id: article.id,
    documentId: article.documentId,
    title: article.title ?? '',
    slug: article.slug ?? '',
    summary: article.summary ?? null,
    body: article.body ?? null,
    readingTime: typeof article.readingTime === 'number' ? article.readingTime : null,
    coverImage: resolveMedia(article.coverImage),
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    publishedAt: article.publishedAt,
    locale: article.locale ?? '',
    seo: article.seo ? {
      metaTitle: article.seo.metaTitle ?? undefined,
      metaDescription: article.seo.metaDescription ?? undefined,
    } : undefined,
    tags: ensureArray(article.tags)
      .map(normalizeTag)
      .filter((tag): tag is Tag => tag !== null),
  };
}

function normalizeWebsite(data: any): Website | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const supportedLocales = Array.isArray(data.supportedLocales)
    ? data.supportedLocales.filter((locale: unknown): locale is string => typeof locale === 'string')
    : [];

  const localizationLocales = ensureArray(data.localizations)
    .map((loc: any) => loc?.locale)
    .filter((locale: unknown): locale is string => typeof locale === 'string');

  const resolvedLocales = Array.from(
    new Set(
      [
        data.locale,
        data.defaultLocale,
        ...supportedLocales,
        ...localizationLocales,
      ].filter((locale): locale is string => typeof locale === 'string' && locale.length > 0)
    )
  );

  return {
    id: data.id,
    documentId: data.documentId,
    name: data.name ?? '',
    apiName: data.apiName ?? '',
    defaultLocale: data.defaultLocale ?? 'en',
    supportedLocales: resolvedLocales.length > 0 ? resolvedLocales : ['en'],
    locale: data.locale ?? data.defaultLocale ?? 'en',
    brand: data.brand
      ? {
          logo: resolveMedia(data.brand.logo),
          favicon: resolveMedia(data.brand.favicon),
        }
      : undefined,
    theme: data.theme
      ? {
          brandColor: data.theme.brandColor ?? undefined,
          palette: data.theme.palette ?? undefined,
        }
      : undefined,
    homepageHero: data.homepageHero
      ? {
          image: resolveMedia(data.homepageHero.image),
          alt: data.homepageHero.alt ?? null,
        }
      : undefined,
    seoDefaults: data.seoDefaults
      ? {
          metaTitle: data.seoDefaults.metaTitle ?? undefined,
          metaDescription: data.seoDefaults.metaDescription ?? undefined,
        }
      : undefined,
    header: data.header
      ? {
          brandDisplayName: data.header.brandDisplayName ?? undefined,
          tagline: data.header.tagline ?? undefined,
          primaryNav: ensureArray(data.header.primaryNav)
            .map(normalizeNavMenuItem)
            .filter((item): item is NavMenuItem => item !== null),
        }
      : undefined,
    footer: data.footer
      ? {
          aboutText: data.footer.aboutText ?? null,
          linkGroups: ensureArray(data.footer.linkGroups)
            .map(normalizeLinkGroup)
            .filter((group): group is NavLinkGroup => group !== null),
          copyrightText: data.footer.copyrightText ?? null,
        }
      : undefined,
    systemLabels: data.systemLabels
      ? {
          searchPlaceholder: data.systemLabels.searchPlaceholder ?? undefined,
          readMoreLabel: data.systemLabels.readMoreLabel ?? undefined,
          backToHomeLabel: data.systemLabels.backToHomeLabel ?? undefined,
        }
      : undefined,
    tags: ensureArray(data.tags)
      .map(normalizeTag)
      .filter((tag): tag is Tag => tag !== null),
    articles: ensureArray(data.articles)
      .map(normalizeArticle)
      .filter((article): article is Article => article !== null),
    localizations: ensureArray(data.localizations)
      .map((loc: any): WebsiteLocalizationSummary | null => {
        if (!loc || typeof loc !== 'object') {
          return null;
        }

        return {
          id: loc.id,
          locale: loc.locale ?? '',
          name: loc.name ?? undefined,
        };
      })
      .filter((loc): loc is WebsiteLocalizationSummary => loc !== null),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
  };
}

function getCmsBaseUrl(): string {
  const baseUrl = config.cmsUrl;

  if (!baseUrl) {
    throw new Error('CMS_URL is not configured');
  }

  return baseUrl.replace(/\/$/, '');
}

function buildWebsiteRequestUrl(locale?: string): string {
  const cmsBaseUrl = getCmsBaseUrl();
  const params = new URLSearchParams();
  params.set('filters[apiName][$eq]', config.websiteApiName ?? '');
  params.set('populate', '*');

  if (locale) {
    params.set('locale', locale);
  }

  return `${cmsBaseUrl}/api/websites?${params.toString()}`;
}

function buildArticlesRequestUrl(locale?: string): string {
  const cmsBaseUrl = getCmsBaseUrl();
  const params = new URLSearchParams();
  params.set('filters[website][apiName][$eq]', config.websiteApiName ?? '');
  params.set('populate', '*');
  params.set('sort', 'updatedAt:desc');
  params.set('pagination[page]', '1');
  params.set('pagination[pageSize]', '100');

  if (locale) {
    params.set('locale', locale);
  }

  return `${cmsBaseUrl}/api/articles?${params.toString()}`;
}

function buildTagsRequestUrl(locale?: string): string {
  const cmsBaseUrl = getCmsBaseUrl();
  const params = new URLSearchParams();
  params.set('filters[website][apiName][$eq]', config.websiteApiName ?? '');
  params.set('populate', '*');
  params.set('sort', 'name:asc');
  params.set('pagination[page]', '1');
  params.set('pagination[pageSize]', '100');

  if (locale) {
    params.set('locale', locale);
  }

  return `${cmsBaseUrl}/api/tags?${params.toString()}`;
}

function getCmsHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (config.cmsApiToken) {
    headers['Authorization'] = `Bearer ${config.cmsApiToken}`;
  }

  return headers;
}

export async function getWebsiteData(locale?: string): Promise<Website | null> {
  try {
    const url = buildWebsiteRequestUrl(locale);

    const result: CMSResponse<any[]> = await trackHttpRequest(url, {
      headers: getCmsHeaders(),
    });

    if (!Array.isArray(result.data) || result.data.length === 0) {
      return null;
    }

    const normalized = normalizeWebsite(result.data[0]);
    return normalized;
  } catch (error) {
    console.error('Error fetching website data:', error);
    return null;
  }
}

export async function getArticles(locale?: string): Promise<Article[]> {
  try {
    const url = buildArticlesRequestUrl(locale);

    const result: CMSResponse<any[]> = await trackHttpRequest(url, {
      headers: getCmsHeaders(),
    });

    return ensureArray(result.data)
      .map(normalizeArticle)
      .filter((article): article is Article => article !== null);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getTags(locale?: string): Promise<Tag[]> {
  try {
    const url = buildTagsRequestUrl(locale);

    const result: CMSResponse<any[]> = await trackHttpRequest(url, {
      headers: getCmsHeaders(),
    });

    return ensureArray(result.data)
      .map(normalizeTag)
      .filter((tag): tag is Tag => tag !== null);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
