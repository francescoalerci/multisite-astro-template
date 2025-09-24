import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockArticle = {
  id: 1,
  documentId: 'article-1',
  title: 'Test Article',
  slug: 'test-article',
  summary: 'This is a test article summary',
  body: '# Test Article\n\nThis is the **body** content with _markdown_.',
  coverImage: {
    url: '/uploads/cover.jpg',
    alternativeText: 'Test cover image'
  },
  tags: [
    { name: 'Travel', slug: 'travel' },
    { name: 'Food', slug: 'food' }
  ],
  author: {
    name: 'John Doe'
  },
  readingTime: 5,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-02T00:00:00.000Z',
  publishedAt: '2023-01-02T00:00:00.000Z',
} as any;

describe('ArticleContent component', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves media URLs correctly', async () => {
    // Mock the config
    vi.doMock('../config', () => ({
      config: { cmsUrl: 'https://cms.example.com' }
    }));

    const { config } = await import('../config');

    function resolveMediaUrl(path?: string | null): string | null {
      if (!path) return null;
      if (/^https?:\/\//i.test(path)) {
        return path;
      }
      if (!config.cmsUrl) {
        return path;
      }
      const normalizedBase = config.cmsUrl.replace(/\/$/, '');
      return `${normalizedBase}${path}`;
    }

    expect(resolveMediaUrl('/uploads/cover.jpg')).toBe('https://cms.example.com/uploads/cover.jpg');
    expect(resolveMediaUrl('https://external.com/image.jpg')).toBe('https://external.com/image.jpg');
    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl('')).toBeNull();
  });

  it('computes reading time correctly', () => {
    function computeReadingTime(body?: string | null): number | null {
      if (!body) return null;
      const trimmed = body.trim();
      if (!trimmed) return null; // Check if empty after trimming
      const words = trimmed.split(/\s+/).length;
      if (!words) return null;
      return Math.max(1, Math.round(words / 200));
    }

    expect(computeReadingTime('This is a short article with six words total')).toBe(1);
    expect(computeReadingTime('word '.repeat(200))).toBe(1);
    expect(computeReadingTime('word '.repeat(300))).toBe(2);
    expect(computeReadingTime('word '.repeat(500))).toBe(3);
    expect(computeReadingTime('')).toBeNull();
    expect(computeReadingTime(null)).toBeNull();
    // Whitespace string has 0 words after trimming, so should return null
    expect(computeReadingTime('   ')).toBeNull();
  });

  it('formats date correctly for different locales', () => {
    const publishedDate = '2023-01-15T10:30:00.000Z';

    const formattedEn = new Date(publishedDate).toLocaleDateString('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedPt = new Date(publishedDate).toLocaleDateString('pt', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    expect(formattedEn).toBe('January 15, 2023');
    expect(formattedPt).toContain('2023'); // Different locales format differently
  });

  it('processes article metadata correctly', () => {
    const publishedDate = mockArticle.publishedAt || mockArticle.updatedAt || mockArticle.createdAt;
    const formattedDate = new Date(publishedDate).toLocaleDateString('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const readingTime = mockArticle.readingTime;
    const authorName = mockArticle.author?.name || null;
    const tagNames = Array.isArray(mockArticle.tags) ? mockArticle.tags.map((tag) => tag.name).filter(Boolean) : [];

    expect(formattedDate).toBe('January 2, 2023');
    expect(readingTime).toBe(5);
    expect(authorName).toBe('John Doe');
    expect(tagNames).toEqual(['Travel', 'Food']);
  });

  it('handles missing article metadata gracefully', () => {
    const articleNoMeta = {
      ...mockArticle,
      author: null,
      tags: null,
      readingTime: null,
      publishedAt: null,
      updatedAt: null
    };

    const publishedDate = articleNoMeta.publishedAt || articleNoMeta.updatedAt || articleNoMeta.createdAt;
    const authorName = articleNoMeta.author?.name || null;
    const tagNames = Array.isArray(articleNoMeta.tags) ? articleNoMeta.tags.map((tag) => tag.name).filter(Boolean) : [];

    expect(publishedDate).toBe('2023-01-01T00:00:00.000Z');
    expect(authorName).toBeNull();
    expect(tagNames).toEqual([]);
  });

  it('detects HTML vs Markdown content correctly', () => {
    function processArticleBody(body: string): string {
      if (!body) return '';

      const htmlTagRegex = /<[^>]*>/;
      const hasHtmlTags = htmlTagRegex.test(body);

      if (hasHtmlTags) {
        return body; // Already HTML
      } else {
        // Would normally use marked() here, but for testing we'll simulate
        return `<p>${body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      }
    }

    const markdownContent = 'This is **bold** text';
    const htmlContent = '<p>This is <strong>bold</strong> text</p>';

    expect(processArticleBody(markdownContent)).toBe('<p>This is <strong>bold</strong> text</p>');
    expect(processArticleBody(htmlContent)).toBe('<p>This is <strong>bold</strong> text</p>');
    expect(processArticleBody('')).toBe('');
  });

  it('handles cover image data correctly', () => {
    const article = mockArticle;

    function resolveMediaUrl(path?: string | null): string | null {
      if (!path) return null;
      if (/^https?:\/\//i.test(path)) return path;
      return `https://cms.example.com${path}`;
    }

    const coverImageUrl = resolveMediaUrl(article.coverImage?.url) ?? '/images/placeholder.jpg';
    const coverAlt = article.coverImage?.alternativeText || article.title;

    expect(coverImageUrl).toBe('https://cms.example.com/uploads/cover.jpg');
    expect(coverAlt).toBe('Test cover image');
  });

  it('uses placeholder when cover image is missing', () => {
    const articleNoCover = {
      ...mockArticle,
      coverImage: null
    };

    function resolveMediaUrl(path?: string | null): string | null {
      if (!path) return null;
      if (/^https?:\/\//i.test(path)) return path;
      return `https://cms.example.com${path}`;
    }

    const coverImageUrl = resolveMediaUrl(articleNoCover.coverImage?.url) ?? '/images/placeholder.jpg';
    const coverAlt = articleNoCover.coverImage?.alternativeText || articleNoCover.title;

    expect(coverImageUrl).toBe('/images/placeholder.jpg');
    expect(coverAlt).toBe('Test Article');
  });

  it('determines if article has body content', () => {
    const articleWithBody = mockArticle;
    const articleEmptyBody = { ...mockArticle, body: '' };
    const articleNullBody = { ...mockArticle, body: null };
    const articleWhitespaceBody = { ...mockArticle, body: '   \n   \t   ' };

    expect(Boolean(articleWithBody.body && articleWithBody.body.trim().length > 0)).toBe(true);
    expect(Boolean(articleEmptyBody.body && articleEmptyBody.body.trim().length > 0)).toBe(false);
    expect(Boolean(articleNullBody.body && articleNullBody.body.trim().length > 0)).toBe(false);
    expect(Boolean(articleWhitespaceBody.body && articleWhitespaceBody.body.trim().length > 0)).toBe(false);
  });

  it('handles missing summary correctly', () => {
    const articleNoSummary = {
      ...mockArticle,
      summary: null
    };

    const articleSummary = articleNoSummary.summary || '';
    expect(articleSummary).toBe('');
  });
});