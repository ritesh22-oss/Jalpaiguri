import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, Translations } from '../i18n/types';
import { translations, getTranslation } from '../i18n';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const CATEGORY_MAP: Record<string, string> = {
  Workers: 'দক্ষ কারিগর',
  Medical: 'চিকিৎসা ও স্বাস্থ্য',
  Blood: 'রক্তদান',
  Jobs: 'স্থানীয় কাজ',
  Vehicle: 'যানবাহন সহায়তা',
  Rentals: 'বাড়ি ও ঘর ভাড়া',
  Shops: 'দোকান ও ব্যবসা',
  Govt: 'সরকারি সেবা',
  Report: 'অভিযোগ জানান',
  Emergency: 'জরুরি এসওএস',
  Electrician: 'ইলেকট্রিশিয়ান',
  Plumber: 'প্লাম্বার',
  Carpenter: 'কাঠমিস্ত্রি',
  Mason: 'রাজমিস্ত্রি',
  Painter: 'রংমিস্ত্রি',
  Mechanic: 'মেকানিক',
  'Appliance Repair': 'যন্ত্রপাতি মেরামত',
  Welder: 'ওয়েল্ডার',
  Cleaner: 'পরিচ্ছন্নতাকর্মী',
  Driver: 'চালক / ড্রাইভার',
  Gardener: 'মালি',
  Tailor: 'দর্জি',
  Doctor: 'চিকিৎসক',
  Hospital: 'হাসপাতাল',
  Pharmacy: 'ওষুধের দোকান',
  'General Physician': 'সাধারণ চিকিৎসক (MBBS)',
  Cardiologist: 'হৃদরোগ বিশেষজ্ঞ',
  Pediatrician: 'শিশু বিশেষজ্ঞ',
  Orthopedic: 'অস্থিরোগ বিশেষজ্ঞ',
  Gynecologist: 'স্ত্রী ও প্রসূতি বিশেষজ্ঞ',
  'ENT Specialist': 'নাক-কান-গলা বিশেষজ্ঞ',
  Dermatologist: 'চর্মরোগ বিশেষজ্ঞ'
};

const LOCALITY_MAP: Record<string, string> = {
  Kadamtala: 'কদমতলা',
  Dinbazar: 'দিনবাজার',
  'Mohanta Para': 'মোহান্ত পাড়া',
  Rajbari: 'রাজবাড়ি',
  'Rajbari Dighi': 'রাজবাড়ি দিঘি',
  'Panda Para': 'পান্ডাপাড়া',
  Maskalaibari: 'মাসকালাইবাড়ি',
  'Hakim Para': 'হাকিমপাড়া',
  Senpara: 'সেনপাড়া',
  'Deshbandhu Para': 'দেশবন্ধু পাড়া',
  Babupara: 'বাবু পাড়া',
  'Shanti Para': 'শান্তিপাড়া',
  'Station Road': 'স্টেশন রোড',
  'Club Road': 'ক্লাব রোড',
  'DBC Road': 'ডিবিসি রোড',
  'Netaji Subhash Bose Road': 'নেতাজি সুভাষ বোস রোড',
  'Sadar Hospital': 'সদর হাসপাতাল',
  'Jubilee Park': 'জুবিলি পার্ক',
  'Teesta Barrage': 'তিস্তা ব্যারেজ',
  Jalpaiguri: 'জলপাইগুড়ি',
  Siliguri: 'শিলিগুড়ি'
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  tCategory: (categoryName: string) => string;
  tLocality: (localityName: string) => string;
  formatNumber: (val: number | string) => string;
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

  const tCategory = useCallback(
    (name: string) => {
      if (language !== 'bn' || !name) return name;
      return CATEGORY_MAP[name] || name;
    },
    [language]
  );

  const tLocality = useCallback(
    (name: string) => {
      if (language !== 'bn' || !name) return name;
      return LOCALITY_MAP[name] || name;
    },
    [language]
  );

  const formatNumber = useCallback(
    (val: number | string) => {
      if (language !== 'bn' || val === undefined || val === null) return String(val ?? '');
      return String(val).replace(/[0-9]/g, (digit) => BN_DIGITS[parseInt(digit, 10)]);
    },
    [language]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    tCategory,
    tLocality,
    formatNumber,
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

