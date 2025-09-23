import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ArticleCard from '../ArticleCard.astro';

async function renderCard(props: Record<string, any>) {
  const container = await AstroContainer.create();
  return container.renderToString(ArticleCard, { props });
}

describe('ArticleCard', () => {
  const baseArticle = {
    title: 'Explore Lisbon',
    slug: 'explore-lisbon',
    summary: 'A short guide to Lisbon highlights.',
    updatedAt: '2025-01-01T00:00:00.000Z',
    readingTime: 5,
    tags: [{ name: 'Travel' }],
    coverImage: { url: '/uploads/lisbon.jpg', alternativeText: 'Lisbon skyline' },
  };

  it('renders featured variant with summary', async () => {
    const html = await renderCard({
      article: baseArticle,
      locale: 'en',
      variant: 'featured',
      readMoreLabel: 'Read more',
      summaryFallback: 'Fallback summary',
    });

    expect(html).toContain('Explore Lisbon');
    expect(html).toContain('Lisbon skyline');
    expect(html).toContain('Read more');
    expect(html).toContain('Travel');
  });

  it('uses fallback summary when missing', async () => {
    const html = await renderCard({
      article: { ...baseArticle, summary: null },
      locale: 'en',
      variant: 'small',
      readMoreLabel: 'Keep reading',
      summaryFallback: 'Fallback summary',
    });

    expect(html).toContain('Fallback summary');
  });
});
