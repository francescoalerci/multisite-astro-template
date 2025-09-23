import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ArticleGrid from '../ArticleGrid.astro';

async function renderGrid(props: Record<string, any>) {
  const container = await AstroContainer.create();
  return container.renderToString(ArticleGrid, { props });
}

describe('ArticleGrid', () => {
  const baseArticle = (index: number) => ({
    title: `Article ${index}`,
    slug: `article-${index}`,
    summary: `Summary ${index}`,
    updatedAt: '2025-01-01T00:00:00.000Z',
    readingTime: 4,
    tags: [{ name: 'Travel' }],
    coverImage: { url: `/uploads/article-${index}.jpg`, alternativeText: `Article ${index}` },
  });

  it('renders featured, secondary, and additional articles', async () => {
    const html = await renderGrid({
      articles: [baseArticle(1), baseArticle(2), baseArticle(3), baseArticle(4)],
      locale: 'en',
      readMoreLabel: 'Read more',
      summaryFallback: 'Fallback',
    });

    expect(html).toContain('Article 1');
    expect(html).toContain('Article 2');
    expect(html).toContain('Article 4');
  });
});
