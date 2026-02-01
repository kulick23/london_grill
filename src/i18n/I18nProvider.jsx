import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import translations from './translations';

const I18nContext = createContext(null);

const getNested = (obj, path) => {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    return window.localStorage.getItem('lang') || 'en';
  });

  const changeLanguage = useCallback((next) => {
    setLanguage(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lang', next);
    }
  }, []);

  const t = useCallback(
    (key) => {
      const value = getNested(translations[language], key);
      if (value !== undefined) return value;
      const fallback = getNested(translations.en, key);
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage: changeLanguage, t }), [language, changeLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
