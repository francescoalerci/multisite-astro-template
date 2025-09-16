export interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
}

export const languageMap: Record<string, LanguageInfo> = {
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
};

export function getLanguageInfo(langCode: string): LanguageInfo {
  return languageMap[langCode] || { code: langCode, name: langCode.toUpperCase(), flag: '🌐' };
}

export function isValidLanguage(lang: string, availableLocales: string[]): boolean {
  return availableLocales.includes(lang);
}

export function getDefaultLanguage(availableLocales: string[], defaultLocale: string): string {
  return defaultLocale || availableLocales[0] || 'en';
}

export function getCurrentLanguageFromUrl(url: string): string | null {
  const pathSegments = url.split('/').filter(segment => segment.length > 0);
  return pathSegments[0] || null;
}