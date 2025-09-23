import { describe, expect, it } from 'vitest';
import {
  getLanguageInfo,
  getDefaultLanguage,
  getCurrentLanguageFromUrl,
  isValidLanguage,
} from '../language';

describe('language utilities', () => {
  it('returns known language metadata and falls back for unknown codes', () => {
    expect(getLanguageInfo('en').name).toBe('English');
    expect(getLanguageInfo('zz')).toEqual({ code: 'zz', name: 'ZZ', flag: '🌐' });
  });

  it('validates locales correctly', () => {
    const locales = ['en', 'fr'];
    expect(isValidLanguage('en', locales)).toBe(true);
    expect(isValidLanguage('it', locales)).toBe(false);
  });

  it('selects sensible default language', () => {
    expect(getDefaultLanguage(['fr', 'en'], 'fr')).toBe('fr');
    expect(getDefaultLanguage(['fr', 'en'], '')).toBe('fr');
    expect(getDefaultLanguage([], '')).toBe('en');
  });

  it('extracts current language from url path', () => {
    expect(getCurrentLanguageFromUrl('/en/articles/foo')).toBe('en');
    expect(getCurrentLanguageFromUrl('/')).toBeNull();
  });
});
