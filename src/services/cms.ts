import { config } from '../config';

interface Website {
  id: number;
  documentId: string;
  name: string;
  apiName: string;
  baseUrl: string;
  locales: string[];
  defaultLocale: string;
  brandColor: string;
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
    const url = `${config.cmsUrl}/api/websites?filters[apiName][$eq]=${config.websiteApiName}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.cmsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CMSResponse<Website[]> = await response.json();

    return result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('Error fetching website data:', error);
    return null;
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const url = `${config.cmsUrl}/api/articles?filters[website][apiName][$eq]=${config.websiteApiName}&populate=*&sort=updatedAt:desc&pagination[page]=1&pagination[pageSize]=100`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.cmsApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CMSResponse<Article[]> = await response.json();

    return result.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}