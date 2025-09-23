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

interface Website {
  id: number;
  documentId: string;
  name: string;
  apiName: string;
  baseUrl: string;
  locales: string[];
  defaultLocale: string;
  brandColor: string;
  logo?: {
    url: string;
    alternativeText: string;
  };
  favicon?: {
    url: string;
    alternativeText: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  [key: string]: any;
}

interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
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

export async function getWebsiteData(): Promise<Website | null> {
  try {
    const url = `${config.cmsUrl}/api/websites?filters[apiName][$eq]=${config.websiteApiName}&populate=*`;

    const result: CMSResponse<Website[]> = await trackHttpRequest(url, {
      headers: {
        'Authorization': `Bearer ${config.cmsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    return result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('Error fetching website data:', error);
    return null;
  }
}

export async function getArticles(locale?: string): Promise<Article[]> {
  try {
    let url = `${config.cmsUrl}/api/articles?filters[website][apiName][$eq]=${config.websiteApiName}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100`;

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

export async function getCategories(locale?: string): Promise<Category[]> {
  try {
    let url = `${config.cmsUrl}/api/categories?filters[website][apiName][$eq]=${config.websiteApiName}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100`;

    // Add locale parameter if provided
    if (locale) {
      url += `&locale=${locale}`;
    }

    const result: CMSResponse<Category[]> = await trackHttpRequest(url, {
      headers: {
        'Authorization': `Bearer ${config.cmsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}