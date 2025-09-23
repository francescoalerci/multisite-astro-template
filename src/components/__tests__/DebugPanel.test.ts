import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

const fakeRequests = [
  {
    url: 'https://cms.example/api/websites',
    method: 'GET',
    status: 200,
    duration: 42,
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
  },
];

describe('DebugPanel', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock('../../config', () => ({
      config: {
        cmsUrl: 'https://cms.example',
        cmsApiToken: 'token',
        websiteApiName: 'portugal',
        nodeEnv: 'development',
        isDevelopment: true,
      },
    }));
    vi.mock('../../services/cms', async () => {
      const actual = await vi.importActual<typeof import('../../services/cms')>('../../services/cms');
      return {
        ...actual,
        getHttpRequests: () => fakeRequests,
      };
    });
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('prints request information when in development', async () => {
    const DebugPanel = (await import('../DebugPanel.astro')).default;
    const container = await AstroContainer.create();

    const html = await container.renderToString(DebugPanel, {
      props: {
        websiteData: {
          name: 'Test Site',
          defaultLocale: 'en',
          supportedLocales: ['en', 'it'],
          updatedAt: new Date().toISOString(),
          brand: null,
          theme: null,
          systemLabels: null,
        },
        articles: [{}],
        additionalInfo: { Foo: 'Bar' },
      },
    });

    expect(html).toContain('Debug');
    expect(html).toContain('Articles');
    expect(html).toContain('https://cms.example/api/websites');
  });
});
