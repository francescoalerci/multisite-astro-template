import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import NoWebsiteFallback from '../NoWebsiteFallback.astro';

describe('NoWebsiteFallback', () => {
  it('renders default guidance message', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NoWebsiteFallback, {});
    expect(html).toContain('Configuration Required');
    expect(html).toContain('Unable to load website data');
  });

  it('renders custom message when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NoWebsiteFallback, {
      props: { message: 'Custom fallback' },
    });
    expect(html).toContain('Custom fallback');
  });
});
