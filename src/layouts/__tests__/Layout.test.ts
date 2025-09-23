import { describe, expect, it, beforeEach } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Layout from '../Layout.astro';

const baseWebsiteData = {
  name: 'Test Site',
  locale: 'en',
  defaultLocale: 'en',
  theme: {
    brandColor: '#FF8A00',
    palette: {
      primary: '#FF8A00',
      secondary: '#0EA5B5',
      accent: '#FFD141',
      background: '#FFFFFF',
      surface: '#F6F7F9',
      muted: '#94A3B8',
      neutral: '#111827',
    },
  },
  brand: {
    logo: {
      url: '/uploads/logo.svg',
      fullUrl: 'https://cdn.example/logo.svg',
      alternativeText: 'Test logo',
    },
    favicon: {
      url: '/uploads/favicon.svg',
      fullUrl: 'https://cdn.example/favicon.svg',
      alternativeText: 'Test favicon',
    },
  },
  footer: {
    aboutText: 'About copy',
    copyrightText: '© Test',
    linkGroups: [],
  },
  systemLabels: null,
};

beforeEach(() => {
  process.env.CMS_URL = 'https://cdn.example';
});

async function renderLayout(props: Record<string, any>) {
  const container = await AstroContainer.create();
  return container.renderToString(Layout, { props });
}

describe('Layout', () => {
  it('renders title, favicon, and footer content', async () => {
    const html = await renderLayout({
      title: 'Homepage',
      websiteData: baseWebsiteData,
    });

    expect(html).toContain('<title>Homepage | Test Site</title>');
    expect(html).toContain('rel="icon"');
    expect(html).toContain('About copy');
    expect(html).toContain('© Test');
  });
});
