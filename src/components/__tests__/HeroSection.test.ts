import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import HeroSection from '../HeroSection.astro';

async function renderHero(props: Record<string, any>) {
  const container = await AstroContainer.create();
  const html = await container.renderToString(HeroSection, { props });
  return html;
}

describe('HeroSection', () => {
  it('renders title, tagline, and CTA', async () => {
    const html = await renderHero({
      title: 'Discover Portugal',
      tagline: 'Explore with curated guides',
      backgroundUrl: 'https://cdn/hero.jpg',
      primaryColor: '#ff8a00',
      secondaryColor: '#0ea5b5',
      ctaLabel: 'Read more',
      ctaHref: '#articles',
      srText: 'Portugal hero image',
    });

    expect(html).toContain('Discover Portugal');
    expect(html).toContain('Explore with curated guides');
    expect(html).toContain('href="#articles"');
    expect(html).toContain('Read more');
  });

  it('falls back to gradient when no background image provided', async () => {
    const html = await renderHero({
      title: 'Fallback Hero',
      primaryColor: '#000',
      secondaryColor: '#fff',
      ctaLabel: 'Get started',
      ctaHref: '/start',
    });

    expect(html).toContain('Get started');
    expect(html).not.toContain('sr-only');
  });
});
