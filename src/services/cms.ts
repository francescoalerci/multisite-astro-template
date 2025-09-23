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

type Maybe<T> = T | null | undefined;

export interface MediaAsset {
  id: number | null;
  url: string;
  fullUrl: string | null;
  alternativeText?: string | null;
  mime?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface SEOMeta {
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface NavMenuItem {
  id: number | null;
  label: string;
  linkType: 'internal_route' | 'external_url';
  path?: string | null;
  url?: string | null;
  openInNewTab?: boolean;
}

export interface NavLinkGroup {
  id: number | null;
  groupTitle?: string | null;
  links: NavMenuItem[];
}

export interface HeaderContent {
  brandDisplayName: string;
  tagline?: string | null;
  primaryNav: NavMenuItem[];
}

export interface FooterContent {
  aboutText?: string | null;
  linkGroups: NavLinkGroup[];
  copyrightText?: string | null;
}

export interface SystemLabels {
  searchPlaceholder?: string | null;
  readMoreLabel?: string | null;
  backToHomeLabel?: string | null;
}

export interface ThemePaletteSet {
  primary?: string | null;
  secondary?: string | null;
  accent?: string | null;
  background?: string | null;
  surface?: string | null;
  muted?: string | null;
  neutral?: string | null;
}

export interface ThemePalette {
  brandColor?: string | null;
  palette?: ThemePaletteSet | null;
}

export interface BrandIdentity {
  logo: MediaAsset | null;
  favicon: MediaAsset | null;
}

export interface HeroMin {
  image: MediaAsset | null;
  alt?: string | null;
}

export interface Website {
  id: number;
  documentId: string;
  apiName: string;
  name: string;
  locale: string;
  defaultLocale: string;
  supportedLocales: string[];
  brand: BrandIdentity | null;
  theme: ThemePalette | null;
  homepageHero: HeroMin | null;
  seoDefaults: SEOMeta | null;
  header: HeaderContent | null;
  footer: FooterContent | null;
  systemLabels: SystemLabels | null;
  localizations: Array<{ id: number; documentId?: string; locale: string }>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverImage?: {
    url: string;
    alternativeText: string;
  };
  readingTime?: number;
  seo?: SEOMeta;
  website?: Website;
  tags?: Tag[];
  author?: Author;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  [key: string]: any;
}

interface Tag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  website?: Website;
  articles?: Article[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  [key: string]: any;
}

interface Author {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: {
    url: string;
    alternativeText: string;
  };
  links?: any[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
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

interface WebsiteRaw {
  id: number;
  documentId: string;
  apiName: string;
  name: string;
  locale: string;
  defaultLocale: string;
  supportedLocales?: string[] | null;
  brand?: Record<string, any> | null;
  theme?: Record<string, any> | null;
  homepageHero?: Record<string, any> | null;
  seoDefaults?: Record<string, any> | null;
  header?: Record<string, any> | null;
  footer?: Record<string, any> | null;
  systemLabels?: Record<string, any> | null;
  localizations?: any[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  [key: string]: any;
}

function makeAbsoluteUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (!config.cmsUrl) {
    console.warn('CMS_URL is not configured. Returning relative media URL.');
    return url;
  }
  const normalizedBase = config.cmsUrl.replace(/\/$/, '');
  return `${normalizedBase}${url}`;
}

function ensureArray<T>(value: Maybe<T | T[]>): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeMedia(media: Maybe<any>): MediaAsset | null {
  if (!media) return null;

  const mediaData = media.data ?? media;
  if (!mediaData) return null;

  const attributes = mediaData.attributes ?? mediaData;
  const url: string | undefined = attributes.url ?? attributes.src;

  if (!url) {
    return null;
  }

  const id: number | null = mediaData.id ?? attributes.id ?? null;

  return {
    id,
    url,
    fullUrl: makeAbsoluteUrl(url),
    alternativeText: attributes.alternativeText ?? attributes.alt ?? null,
    mime: attributes.mime ?? null,
    width: attributes.width ?? null,
    height: attributes.height ?? null,
  };
}

function normalizeNavItem(item: Maybe<Record<string, any>>): NavMenuItem | null {
  if (!item) return null;

  const linkType = item.linkType === 'external_url' ? 'external_url' : 'internal_route';

  return {
    id: item.id ?? null,
    label: item.label ?? 'Untitled',
    linkType,
    path: item.path ?? null,
    url: item.url ?? null,
    openInNewTab: Boolean(item.openInNewTab),
  };
}

function normalizeNavGroup(group: Maybe<Record<string, any>>): NavLinkGroup | null {
  if (!group) return null;

  const links = ensureArray(group.links)
    .map(normalizeNavItem)
    .filter((link): link is NavMenuItem => Boolean(link));

  return {
    id: group.id ?? null,
    groupTitle: group.groupTitle ?? null,
    links,
  };
}

function normalizeWebsite(raw: WebsiteRaw): Website {
  const brand: BrandIdentity | null = raw.brand
    ? {
        logo: normalizeMedia((raw.brand as any).logo),
        favicon: normalizeMedia((raw.brand as any).favicon),
      }
    : null;

  const themePalette: ThemePalette | null = raw.theme
    ? {
        brandColor: (raw.theme as any).brandColor ?? null,
        palette: (raw.theme as any).palette
          ? {
              primary: (raw.theme as any).palette.primary ?? null,
              secondary: (raw.theme as any).palette.secondary ?? null,
              accent: (raw.theme as any).palette.accent ?? null,
              background: (raw.theme as any).palette.background ?? null,
              surface: (raw.theme as any).palette.surface ?? null,
              muted: (raw.theme as any).palette.muted ?? null,
              neutral: (raw.theme as any).palette.neutral ?? null,
            }
          : null,
      }
    : null;

  const header: HeaderContent | null = raw.header
    ? {
        brandDisplayName: raw.header.brandDisplayName ?? raw.name,
        tagline: raw.header.tagline ?? null,
        primaryNav: ensureArray(raw.header.primaryNav)
          .map(normalizeNavItem)
          .filter((item): item is NavMenuItem => Boolean(item)),
      }
    : null;

  const footer: FooterContent | null = raw.footer
    ? {
        aboutText: raw.footer.aboutText ?? null,
        linkGroups: ensureArray(raw.footer.linkGroups)
          .map(normalizeNavGroup)
          .filter((group): group is NavLinkGroup => Boolean(group)),
        copyrightText: raw.footer.copyrightText ?? null,
      }
    : null;

  const systemLabels: SystemLabels | null = raw.systemLabels
    ? {
        searchPlaceholder: raw.systemLabels.searchPlaceholder ?? null,
        readMoreLabel: raw.systemLabels.readMoreLabel ?? null,
        backToHomeLabel: raw.systemLabels.backToHomeLabel ?? null,
      }
    : null;

  const homepageHero: HeroMin | null = raw.homepageHero
    ? {
        image: normalizeMedia(raw.homepageHero.image ?? raw.homepageHero.media),
        alt: raw.homepageHero.alt ?? null,
      }
    : null;

  const seoDefaults: SEOMeta | null = raw.seoDefaults
    ? {
        metaTitle: raw.seoDefaults.metaTitle ?? null,
        metaDescription: raw.seoDefaults.metaDescription ?? null,
      }
    : null;

  return {
    id: raw.id,
    documentId: raw.documentId,
    apiName: raw.apiName,
    name: raw.name,
    locale: raw.locale,
    defaultLocale: raw.defaultLocale,
    supportedLocales: ensureArray(raw.supportedLocales).filter(Boolean) as string[],
    brand,
    theme: themePalette,
    homepageHero,
    seoDefaults,
    header,
    footer,
    systemLabels,
    localizations: ensureArray(raw.localizations).map((loc: any) => ({
      id: loc.id,
      documentId: loc.documentId,
      locale: loc.locale,
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    publishedAt: raw.publishedAt,
  };
}

function buildWebsiteUrl(locale?: string | null): string | null {
  if (!config.cmsUrl) {
    console.error('CMS_URL environment variable is not configured.');
    return null;
  }

  const params = new URLSearchParams();

  if (config.websiteApiName) {
    params.set('filters[apiName][$eq]', config.websiteApiName);
  }

  params.set('populate[brand][populate]', '*');
  params.set('populate[theme][populate]', '*');
  params.set('populate[homepageHero][populate]', '*');
  params.set('populate[header][populate]', '*');
  params.set('populate[footer][populate][linkGroups][populate]', 'links');
  params.set('populate[seoDefaults]', '*');
  params.set('populate[systemLabels]', '*');
  params.append('populate[localizations][fields]', 'id');
  params.append('populate[localizations][fields]', 'locale');

  if (locale) {
    params.set('locale', locale);
  }

  const baseUrl = config.cmsUrl.replace(/\/$/, '');
  return `${baseUrl}/api/websites?${params.toString()}`;
}

async function fetchWebsite(locale?: string | null): Promise<Website | null> {
  const url = buildWebsiteUrl(locale);

  if (!url) {
    return null;
  }

  try {
    const result: CMSResponse<WebsiteRaw[]> = await trackHttpRequest(url, {
      headers: {
        'Authorization': `Bearer ${config.cmsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!Array.isArray(result.data) || result.data.length === 0) {
      return null;
    }

    return normalizeWebsite(result.data[0]);
  } catch (error) {
    console.error(`Error fetching website data${locale ? ` for locale "${locale}"` : ''}:`, error);
    return null;
  }
}

export async function getWebsiteData(): Promise<Website | null> {
  return fetchWebsite();
}

export async function getLocalizedWebsiteData(locale: string): Promise<Website | null> {
  const localized = await fetchWebsite(locale);

  if (localized) {
    return localized;
  }

  console.warn(`Website data not found for locale "${locale}". Falling back to default locale.`);
  return fetchWebsite();
}

export async function getArticles(locale?: string): Promise<Article[]> {
  try {
    if (!config.cmsUrl) {
      console.error('CMS_URL environment variable is not configured.');
      return [];
    }

    if (!config.websiteApiName) {
      console.error('WEBSITE_API_NAME environment variable is not configured.');
      return [];
    }

    const baseUrl = config.cmsUrl.replace(/\/$/, '');
    const apiName = encodeURIComponent(config.websiteApiName);

    let url = `${baseUrl}/api/articles?filters[website][apiName][$eq]=${apiName}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100`;

    // Add locale parameter if provided
    if (locale) {
      url += `&locale=${locale}`;
    }

    const result: CMSResponse<Article[]> = await trackHttpRequest(url, {
      headers: {
        'Authorization': `Bearer ${config.cmsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getTags(locale?: string): Promise<Tag[]> {
  try {
    if (!config.cmsUrl) {
      console.error('CMS_URL environment variable is not configured.');
      return [];
    }

    if (!config.websiteApiName) {
      console.error('WEBSITE_API_NAME environment variable is not configured.');
      return [];
    }

    const baseUrl = config.cmsUrl.replace(/\/$/, '');
    const apiName = encodeURIComponent(config.websiteApiName);

    let url = `${baseUrl}/api/tags?filters[website][apiName][$eq]=${apiName}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100`;

    // Add locale parameter if provided
    if (locale) {
      url += `&locale=${locale}`;
    }

    const result: CMSResponse<Tag[]> = await trackHttpRequest(url, {
      headers: {
        'Authorization': `Bearer ${config.cmsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export async function getAuthors(): Promise<Author[]> {
  try {
    if (!config.cmsUrl) {
      console.error('CMS_URL environment variable is not configured.');
      return [];
    }

    const baseUrl = config.cmsUrl.replace(/\/$/, '');
    const url = `${baseUrl}/api/authors?populate=*&sort=name:asc&pagination[page]=1&pagination[pageSize]=100`;

    const result: CMSResponse<Author[]> = await trackHttpRequest(url, {
      headers: {
        'Authorization': `Bearer ${config.cmsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}
