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