import { describe, it, expect } from 'vitest';
import { buildLocalizedUrl, getLocalizedSegment, getSegmentKey, parseLocalizedUrl } from '../urlSegments';

describe('urlSegments', () => {
  describe('getLocalizedSegment', () => {
    it('returns localized segments for different languages', () => {
      expect(getLocalizedSegment('en', 'articles')).toBe('articles');
      expect(getLocalizedSegment('it', 'articles')).toBe('articoli');
      expect(getLocalizedSegment('es', 'articles')).toBe('articulos');
      expect(getLocalizedSegment('pt', 'articles')).toBe('artigos');
      expect(getLocalizedSegment('fr', 'articles')).toBe('articles');
      expect(getLocalizedSegment('de', 'articles')).toBe('artikel');
    });

    it('falls back to English for unsupported languages', () => {
      expect(getLocalizedSegment('zh', 'articles')).toBe('articles');
      expect(getLocalizedSegment('ja', 'contact')).toBe('contact');
    });

    it('returns the key itself for unknown segments', () => {
      expect(getLocalizedSegment('en', 'unknown-segment')).toBe('unknown-segment');
      expect(getLocalizedSegment('it', 'missing-key')).toBe('missing-key');
    });

    it('handles all supported segment types', () => {
      const segmentTypes = ['articles', 'tags', 'tag', 'search', 'about', 'contact'];

      segmentTypes.forEach(segment => {
        expect(typeof getLocalizedSegment('en', segment)).toBe('string');
        expect(typeof getLocalizedSegment('it', segment)).toBe('string');
        expect(typeof getLocalizedSegment('es', segment)).toBe('string');
      });
    });
  });

  describe('getSegmentKey', () => {
    it('returns segment keys for localized values', () => {
      expect(getSegmentKey('it', 'articoli')).toBe('articles');
      expect(getSegmentKey('es', 'articulos')).toBe('articles');
      expect(getSegmentKey('pt', 'artigos')).toBe('articles');
      expect(getSegmentKey('de', 'artikel')).toBe('articles');
    });

    it('handles different languages correctly', () => {
      expect(getSegmentKey('it', 'argomenti')).toBe('tags');
      expect(getSegmentKey('es', 'etiquetas')).toBe('tags');
      expect(getSegmentKey('fr', 'etiquettes')).toBe('tags');
    });

    it('returns null for unsupported languages', () => {
      expect(getSegmentKey('zh', 'articles')).toBeNull();
      expect(getSegmentKey('ja', 'contact')).toBeNull();
    });

    it('returns null for unknown localized segments', () => {
      expect(getSegmentKey('en', 'unknown-segment')).toBeNull();
      expect(getSegmentKey('it', 'unknown-italian-word')).toBeNull();
    });

    it('handles case sensitivity correctly', () => {
      expect(getSegmentKey('en', 'Articles')).toBeNull(); // Case sensitive
      expect(getSegmentKey('en', 'articles')).toBe('articles');
    });
  });

  describe('buildLocalizedUrl', () => {
    it('builds basic localized URLs', () => {
      expect(buildLocalizedUrl('en', ['articles'])).toBe('/en/articles');
      expect(buildLocalizedUrl('it', ['articles'])).toBe('/it/articoli');
      expect(buildLocalizedUrl('es', ['articles'])).toBe('/es/articulos');
      expect(buildLocalizedUrl('pt', ['about'])).toBe('/pt/sobre');
    });

    it('handles empty segments array', () => {
      expect(buildLocalizedUrl('en', [])).toBe('/en/');
    });

    it('handles multiple segments', () => {
      expect(buildLocalizedUrl('it', ['articles', 'tags'])).toBe('/it/articoli/argomenti');
      expect(buildLocalizedUrl('es', ['search', 'contact'])).toBe('/es/buscar/contacto');
    });

    it('handles parameter substitution', () => {
      expect(buildLocalizedUrl('en', ['articles', ':slug'], { slug: 'my-article' })).toBe('/en/articles/my-article');
      expect(buildLocalizedUrl('it', ['tag', ':name'], { name: 'travel' })).toBe('/it/argomento/travel');
    });

    it('handles multiple parameters', () => {
      expect(buildLocalizedUrl('en', ['articles', ':category', 'tag', ':slug'], {
        category: 'travel',
        slug: 'lisbon-guide'
      })).toBe('/en/articles/travel/tag/lisbon-guide');
    });

    it('handles missing parameters gracefully', () => {
      expect(buildLocalizedUrl('en', ['articles', ':slug'], {})).toBe('/en/articles/:slug');
      expect(buildLocalizedUrl('en', ['articles', ':slug'])).toBe('/en/articles/:slug');
    });

    it('handles unknown segment keys', () => {
      expect(buildLocalizedUrl('en', ['unknown-segment'])).toBe('/en/unknown-segment');
      expect(buildLocalizedUrl('it', ['custom-page'])).toBe('/it/custom-page');
    });

    it('handles mixed known and unknown segments', () => {
      expect(buildLocalizedUrl('it', ['articles', 'custom', 'tags'])).toBe('/it/articoli/custom/argomenti');
    });
  });

  describe('parseLocalizedUrl', () => {
    it('parses basic localized URLs', () => {
      expect(parseLocalizedUrl('it', '/it/articoli')).toEqual(['articles']);
      expect(parseLocalizedUrl('es', '/es/articulos')).toEqual(['articles']);
      expect(parseLocalizedUrl('pt', '/pt/sobre')).toEqual(['about']);
    });

    it('handles multiple segments', () => {
      expect(parseLocalizedUrl('it', '/it/articoli/argomenti')).toEqual(['articles', 'tags']);
      expect(parseLocalizedUrl('es', '/es/buscar/contacto')).toEqual(['search', 'contact']);
    });

    it('handles dynamic segments (slugs)', () => {
      expect(parseLocalizedUrl('en', '/en/articles/my-article-slug')).toEqual(['articles', 'my-article-slug']);
      expect(parseLocalizedUrl('it', '/it/articoli/travel-guide')).toEqual(['articles', 'travel-guide']);
    });

    it('handles mixed localized and dynamic segments', () => {
      expect(parseLocalizedUrl('it', '/it/articoli/travel/argomento/food')).toEqual(['articles', 'travel', 'tag', 'food']);
    });

    it('handles empty or root paths', () => {
      expect(parseLocalizedUrl('en', '/en/')).toEqual([]);
      // Note: /en without trailing slash doesn't match the regex pattern
      // so it returns the language code as a segment
      expect(parseLocalizedUrl('en', '/en')).toEqual(['en']);
    });

    it('handles unknown localized segments', () => {
      expect(parseLocalizedUrl('en', '/en/custom-page')).toEqual(['custom-page']);
      expect(parseLocalizedUrl('it', '/it/pagina-custom')).toEqual(['pagina-custom']);
    });
  });

  describe('edge cases and error handling', () => {
    it('handles empty strings and null values', () => {
      expect(getLocalizedSegment('', 'articles')).toBe('articles'); // Falls back to English
      expect(getLocalizedSegment('en', '')).toBe(''); // Returns empty string
      expect(getSegmentKey('', 'articles')).toBeNull();
      expect(buildLocalizedUrl('', ['articles'])).toBe('//articles');
    });

    it('handles very long segments', () => {
      const longSegment = 'a'.repeat(1000);
      expect(getLocalizedSegment('en', longSegment)).toBe(longSegment);
      expect(buildLocalizedUrl('en', [longSegment])).toBe(`/en/${longSegment}`);
    });

    it('handles special characters in segments', () => {
      const specialChars = 'test-with_special.chars';
      expect(buildLocalizedUrl('en', [specialChars])).toBe(`/en/${specialChars}`);
    });

    it('handles Unicode characters', () => {
      expect(buildLocalizedUrl('en', ['café'])).toBe('/en/café');
      expect(parseLocalizedUrl('en', '/en/café')).toEqual(['café']);
    });

    it('handles parameter substitution with special characters', () => {
      expect(buildLocalizedUrl('en', ['search', ':query'], { query: 'hello world' })).toBe('/en/search/hello world');
      expect(buildLocalizedUrl('en', ['tag', ':name'], { name: 'food & drink' })).toBe('/en/tag/food & drink');
    });

    it('preserves case in unknown segments', () => {
      expect(buildLocalizedUrl('en', ['CustomPage'])).toBe('/en/CustomPage');
      expect(parseLocalizedUrl('en', '/en/CustomPage')).toEqual(['CustomPage']);
    });
  });
});