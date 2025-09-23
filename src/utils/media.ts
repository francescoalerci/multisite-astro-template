import { config } from '../config';
import type { MediaAsset } from '../services/cms';

function normalizeCmsBaseUrl(): string {
  return (config.cmsUrl || '').replace(/\/$/, '');
}

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith('http')) {
    return path;
  }

  const baseUrl = normalizeCmsBaseUrl();

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl}${path}`;
}

export function getMediaAssetUrl(asset?: MediaAsset | null): string | null {
  if (!asset) {
    return null;
  }

  return resolveMediaUrl(asset.url);
}
