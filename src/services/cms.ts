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
  defaultLocale?: string | null;
  supportedLocales?: string[] | string | null;
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

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

function unwrapEntity<T>(entity: unknown): T | null {
  if (!entity) {
    return null;
  }

  if (Array.isArray(entity)) {
    return entity.length > 0 ? unwrapEntity<T>(entity[0]) : null;
  }

  if (isObject(entity) && 'attributes' in entity && isObject(entity.attributes)) {
    const { attributes, id, ...rest } = entity as Record<string, any>;
    return { id, ...attributes, ...rest } as T;
  }

  return entity as T;
}

function unwrapSingleRelation<T>(value: unknown): T | null {
  if (!value) {
    return null;
  }

  if (isObject(value) && 'data' in value) {
    return unwrapEntity<T>((value as Record<string, any>).data);
  }

  return unwrapEntity<T>(value);
}

function unwrapCollectionRelation<T>(value: unknown): T[] {
  if (!value) {
    return [];
  }

  if (isObject(value) && 'data' in value) {
    const data = (value as Record<string, any>).data;

    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data
        .map(item => unwrapEntity<T>(item))
        .filter((entry): entry is T => Boolean(entry));
    }

    const single = unwrapEntity<T>(data);
    return single ? [single] : [];
  }

  if (Array.isArray(value)) {
    return value
      .map(item => unwrapEntity<T>(item))
      .filter((entry): entry is T => Boolean(entry));
  }

  const single = unwrapEntity<T>(value);
  return single ? [single] : [];
}

function ensureStringArray(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === 'string')
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((entry): entry is string => typeof entry === 'string')
          .map(entry => entry.trim())
          .filter(entry => entry.length > 0);
      }
    } catch {
      const csv = trimmed
        .split(',')
        .map(token => token.trim())
        .filter(token => token.length > 0);

      if (csv.length > 0) {
        return csv;
      }
    }
  }

  return fallback;
}

function uniqueDefined(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    if (!seen.has(value)) {
      seen.add(value);
      ordered.push(value);
    }
  }

  return ordered;
}

function normalizeNavMenuItem(raw: unknown): NavMenuItem | null {
  const item = unwrapEntity<NavMenuItem>(raw);
  if (!item || !item.label) {
    return null;
  }

  const linkType: LinkType = item.linkType === 'external_url' ? 'external_url' : 'internal_route';

  return {
    ...item,
    linkType,
    path: item.path ?? null,
    url: item.url ?? null,
    openInNewTab: item.openInNewTab ?? false,
  };
}

function normalizeNavLinkGroup(raw: unknown): NavLinkGroup | null {
  const group = unwrapEntity<NavLinkGroup>(raw);
  if (!group) {
    return null;
  }

  const links = unwrapCollectionRelation<NavMenuItem>(group.links)
    .map(normalizeNavMenuItem)
    .filter((entry): entry is NavMenuItem => Boolean(entry));

  return {
    ...group,
    links,
  };
}

function normalizeHero(raw: unknown): HeroMin | null {
  const hero = unwrapEntity<HeroMin>(raw);
  if (!hero) {
    return null;
  }

  return {
    ...hero,
    image: unwrapSingleRelation<Media>((hero as any).image ?? hero.image),
  };
}

function normalizeAuthor(raw: unknown): Author | null {
  const author = unwrapEntity<Author>(raw);
  if (!author) {
    return null;
  }

  return {
    ...author,
    avatar: unwrapSingleRelation<Media>(author.avatar),
  };
}

function normalizeTag(raw: unknown): Tag | null {
  const tag = unwrapEntity<Tag>(raw);
  if (!tag) {
    return null;
  }

  return {
    ...tag,
    website: undefined,
    articles: [],
  };
}

function normalizeArticle(raw: unknown): Article | null {
  const article = unwrapEntity<Article>(raw);
  if (!article) {
    return null;
  }

  const tags = unwrapCollectionRelation<Tag>(article.tags)
    .map(normalizeTag)
    .filter((entry): entry is Tag => Boolean(entry));

  return {
    ...article,
    website: undefined,
    tags,
    coverImage: unwrapSingleRelation<Media>(article.coverImage),
    author: normalizeAuthor(article.author) ?? undefined,
    seo: unwrapSingleRelation<SEODefaults>(article.seo),
  };
}

function normalizeWebsite(rawWebsite: unknown): Website {
  const base = unwrapEntity<Website>(rawWebsite);

  if (!base) {
    throw new Error('Received invalid website payload from CMS');
  }

  const brand = unwrapSingleRelation<BrandIdentity>(base.brand);
  const themeRaw = unwrapSingleRelation<ThemePalette>(base.theme);
  const paletteRaw = themeRaw?.palette ?? null;
  const themePalette = paletteRaw
    ? unwrapSingleRelation<ThemePaletteSet>(paletteRaw) || (isObject(paletteRaw) ? { ...(paletteRaw as ThemePaletteSet) } : null)
    : null;
  const theme = themeRaw
    ? {
        ...themeRaw,
        palette: themePalette,
      }
    : null;

  const homepageHero = normalizeHero(base.homepageHero);
  const seoDefaults = unwrapSingleRelation<SEODefaults>(base.seoDefaults);

  const headerRaw = unwrapSingleRelation<UIHeader>(base.header);
  const header = headerRaw
    ? {
        ...headerRaw,
        primaryNav: unwrapCollectionRelation<NavMenuItem>(headerRaw.primaryNav)
          .map(normalizeNavMenuItem)
          .filter((entry): entry is NavMenuItem => Boolean(entry)),
      }
    : null;

  const footerRaw = unwrapSingleRelation<UIFooter>(base.footer);
  const footer = footerRaw
    ? {
        ...footerRaw,
        linkGroups: unwrapCollectionRelation<NavLinkGroup>(footerRaw.linkGroups)
          .map(normalizeNavLinkGroup)
          .filter((entry): entry is NavLinkGroup => Boolean(entry)),
      }
    : null;

  const systemLabels = unwrapSingleRelation<UISystemLabels>(base.systemLabels);

  const articles = unwrapCollectionRelation<Article>(base.articles)
    .map(normalizeArticle)
    .filter((entry): entry is Article => Boolean(entry))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const tags = unwrapCollectionRelation<Tag>(base.tags)
    .map(normalizeTag)
    .filter((entry): entry is Tag => Boolean(entry))
    .sort((a, b) => a.name.localeCompare(b.name));

  const localizationEntries = unwrapCollectionRelation<WebsiteLocalization>(base.localizations).map(localization => ({
    ...localization,
    supportedLocales: ensureStringArray(localization.supportedLocales, []),
  }));

  const supportedLocales = uniqueDefined([
    base.defaultLocale,
    ...ensureStringArray(base.supportedLocales, []),
    base.locale,
    ...localizationEntries.map(entry => entry.locale),
  ]);

  return {
    ...base,
    brand,
    theme,
    homepageHero,
    seoDefaults,
    header,
    footer,
    systemLabels,
    articles,
    tags,
    localizations: localizationEntries,
    supportedLocales,
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
    if (!config.cmsUrl) {
      console.error('CMS_URL env is not configured. Unable to fetch website data.');
      return null;
    }

    const params = new URLSearchParams();
    if (config.websiteApiName) {
      params.set('filters[apiName][$eq]', config.websiteApiName);
    }
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

    const baseUrl = config.cmsUrl.replace(/\/$/, '');
    const url = `${baseUrl}/api/websites?${params.toString()}`;

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
    if (!config.cmsUrl) {
      console.error('CMS_URL env is not configured. Unable to fetch articles.');
      return [];
    }

    const params = new URLSearchParams();
    if (config.websiteApiName) {
      params.set('filters[website][apiName][$eq]', config.websiteApiName);
    }
    params.set('populate', 'coverImage,tags,author,seo');
    params.set('sort', 'updatedAt:desc');
    params.set('pagination[page]', '1');
    params.set('pagination[pageSize]', '100');
    params.set('publicationState', 'live');

    if (locale) {
      params.set('locale', locale);
    }

    const baseUrl = config.cmsUrl.replace(/\/$/, '');
    const url = `${baseUrl}/api/articles?${params.toString()}`;

    const result = await trackHttpRequest<CMSResponse<Article[]>>(url, {
      headers: buildCmsHeaders(),
    });

    const rawArticles = Array.isArray(result.data) ? result.data : [];
    return rawArticles
      .map(normalizeArticle)
      .filter((entry): entry is Article => Boolean(entry));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getTags(locale?: string): Promise<Tag[]> {
  try {
    if (!config.cmsUrl) {
      console.error('CMS_URL env is not configured. Unable to fetch tags.');
      return [];
    }

    const params = new URLSearchParams();
    if (config.websiteApiName) {
      params.set('filters[website][apiName][$eq]', config.websiteApiName);
    }
    params.set('populate', 'articles');
    params.set('sort', 'updatedAt:desc');
    params.set('pagination[page]', '1');
    params.set('pagination[pageSize]', '100');
    params.set('publicationState', 'live');

    if (locale) {
      params.set('locale', locale);
    }

    const baseUrl = config.cmsUrl.replace(/\/$/, '');
    const url = `${baseUrl}/api/tags?${params.toString()}`;

    const result = await trackHttpRequest<CMSResponse<Tag[]>>(url, {
      headers: buildCmsHeaders(),
    });

    const rawTags = Array.isArray(result.data) ? result.data : [];
    return rawTags
      .map(normalizeTag)
      .filter((entry): entry is Tag => Boolean(entry));
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export async function getAuthors(): Promise<Author[]> {
  try {
    if (!config.cmsUrl) {
      console.error('CMS_URL env is not configured. Unable to fetch authors.');
      return [];
    }

    const params = new URLSearchParams();
    params.set('populate', 'avatar');
    params.set('sort', 'name:asc');
    params.set('pagination[page]', '1');
    params.set('pagination[pageSize]', '100');
    params.set('publicationState', 'live');

    const baseUrl = config.cmsUrl.replace(/\/$/, '');
    const url = `${baseUrl}/api/authors?${params.toString()}`;

    const result = await trackHttpRequest<CMSResponse<Author[]>>(url, {
      headers: buildCmsHeaders(),
    });

    const rawAuthors = Array.isArray(result.data) ? result.data : [];
    return rawAuthors
      .map(normalizeAuthor)
      .filter((entry): entry is Author => Boolean(entry));
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}
