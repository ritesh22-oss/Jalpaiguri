import { Translations, Language } from './types';
import { en } from './en';
import { bn } from './bn';

export * from './types';

export const translations: Record<Language, Translations> = {
  en,
  bn
};

/**
 * Nested key accessor for translation strings with dot notation
 * e.g. getTranslation(lang, 'home.welcomeGreeting')
 */
export function getTranslation(lang: Language, key: string, fallback?: string): string {
  const dict = translations[lang] || translations.en;
  const parts = key.split('.');
  
  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English if missing in target language
      let fallbackCurrent: any = translations.en;
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbPart];
        } else {
          return fallback || key;
        }
      }
      return typeof fallbackCurrent === 'string' ? fallbackCurrent : fallback || key;
    }
  }

  return typeof current === 'string' ? current : fallback || key;
}
