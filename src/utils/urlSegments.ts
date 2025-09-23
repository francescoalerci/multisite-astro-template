export interface UrlSegmentTranslations {
  [key: string]: {
    [segment: string]: string;
  };
}

/**
 * URL segment translations for different languages
 */
export const urlSegments: UrlSegmentTranslations = {
  en: {
    articles: 'articles',
    tags: 'tags',
    tag: 'tag',
    search: 'search',
    about: 'about',
    contact: 'contact'
  },
  it: {
    articles: 'articoli',
    tags: 'argomenti',
    tag: 'argomento',
    search: 'cerca',
    about: 'chi-siamo',
    contact: 'contatti'
  },
  es: {
    articles: 'articulos',
    tags: 'etiquetas',
    tag: 'etiqueta',
    search: 'buscar',
    about: 'acerca-de',
    contact: 'contacto'
  },
  fr: {
    articles: 'articles',
    tags: 'etiquettes',
    tag: 'etiquette',
    search: 'recherche',
    about: 'a-propos',
    contact: 'contact'
  },
  pt: {
    articles: 'artigos',
    tags: 'tags',
    tag: 'tag',
    search: 'buscar',
    about: 'sobre',
    contact: 'contato'
  },
  de: {
    articles: 'artikel',
    tags: 'tags',
    tag: 'tag',
    search: 'suche',
    about: 'uber-uns',
    contact: 'kontakt'
  }
};

/**
 * Get localized URL segment for a given language and segment key
 */
export function getLocalizedSegment(lang: string, segmentKey: string): string {
  return urlSegments[lang]?.[segmentKey] || urlSegments.en[segmentKey] || segmentKey;
}

/**
 * Get the segment key from a localized segment value
 */
export function getSegmentKey(lang: string, localizedSegment: string): string | null {
  const langSegments = urlSegments[lang];
  if (!langSegments) return null;

  // Find the key that matches the localized segment
  for (const [key, value] of Object.entries(langSegments)) {
    if (value === localizedSegment) {
      return key;
    }
  }

  return null;
}

/**
 * Build a localized URL path
 */
export function buildLocalizedUrl(lang: string, segments: string[], params: Record<string, string> = {}): string {
  const localizedSegments = segments.map(segment => {
    // If it's a parameter placeholder (starts with :), replace it with actual value
    if (segment.startsWith(':') && params[segment.slice(1)]) {
      return params[segment.slice(1)];
    }
    // Otherwise, localize the segment
    return getLocalizedSegment(lang, segment);
  });

  return `/${lang}/${localizedSegments.join('/')}`;
}

/**
 * Parse a localized URL to extract the original segment keys
 */
export function parseLocalizedUrl(lang: string, path: string): string[] | null {
  // Remove leading slash and language prefix
  const segments = path.replace(/^\/[^\/]+\//, '').split('/').filter(Boolean);

  const segmentKeys: string[] = [];

  for (const segment of segments) {
    const key = getSegmentKey(lang, segment);
    if (key) {
      segmentKeys.push(key);
    } else {
      // If we can't find a key, it might be a dynamic parameter (slug, etc.)
      segmentKeys.push(segment);
    }
  }

  return segmentKeys;
}