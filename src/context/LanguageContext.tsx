import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, Translations } from '../i18n/types';
import { translations, getTranslation } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isBengali: boolean;
  dict: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'jpg_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') {
        return saved;
      }
      // Check if old preference exists as full string
      if (saved === 'বাংলা') return 'bn';
      if (saved === 'English') return 'en';
    } catch {
      // Fallback
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Unable to persist language preference', e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  }, [language, setLanguage]);

  // Synchronize document attribute and font rendering
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.setAttribute('data-lang', language);
      document.body.setAttribute('data-lang', language);

      if (language === 'bn') {
        document.body.classList.add('font-bengali');
      } else {
        document.body.classList.remove('font-bengali');
      }
    }
  }, [language]);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return getTranslation(language, key, fallback);
    },
    [language]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isBengali: language === 'bn',
    dict: translations[language] || translations.en
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
