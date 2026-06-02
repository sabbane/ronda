/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { ar } from './translations/ar';

const translations = {
  en,
  fr,
  ar
};

const LanguageContext = createContext();

const safeGetLocalStorage = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (e) {
    console.warn('[LanguageContext] localStorage is blocked:', e);
    return fallback;
  }
};

const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('[LanguageContext] localStorage is blocked:', e);
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = safeGetLocalStorage('ronda-lang', 'en');
    return translations[saved] ? saved : 'en';
  });

  const changeLanguage = (lang) => {
    const target = translations[lang] ? lang : 'en';
    setLanguage(target);
    safeSetLocalStorage('ronda-lang', target);
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language] || translations['en'];
    for (const k of keys) {
      if (!value || value[k] === undefined) return key;
      value = value[k];
    }

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return Object.keys(params).reduce((str, paramKey) => {
        return str.replaceAll(`{${paramKey}}`, params[paramKey]);
      }, value);
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
