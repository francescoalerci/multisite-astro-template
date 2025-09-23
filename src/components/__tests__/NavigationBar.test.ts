import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import NavigationBar from '../NavigationBar.astro';

async function renderNavigationBar(props: Record<string, any>) {
  const container = await AstroContainer.create();
  return container.renderToString(NavigationBar, {
    props,
  });
}

describe('NavigationBar', () => {
  it('renders brand name and nav links', async () => {
    const html = await renderNavigationBar({
      homeHref: '/en',
      brandLogoUrl: 'https://cdn/logo.png',
      brandLogoAlt: 'Logo',
      brandDisplayName: 'Test Site',
      navLinks: [
        { label: 'Destinations', href: '/en/destinations' },
        { label: 'Itineraries', href: '/en/itineraries', openInNewTab: true },
      ],
      availableLocales: ['en', 'it'],
      currentLocale: 'en',
      currentPath: '/en',
      accentColor: '#FF8A00',
      showLanguageSelector: true,
    });

    expect(html).toContain('Test Site');
    expect(html).toContain('Destinations');
    expect(html).toContain('href="/en/destinations"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('language-selector');
  });

  it('hides language selector when disabled', async () => {
    const html = await renderNavigationBar({
      homeHref: '/en',
      brandDisplayName: 'Test Site',
      navLinks: [],
      availableLocales: ['en', 'it'],
      currentLocale: 'en',
      currentPath: '/en',
      accentColor: '#FF8A00',
      showLanguageSelector: false,
    });

    expect(html).not.toContain('language-selector');
  });
});
