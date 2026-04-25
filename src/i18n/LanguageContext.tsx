import { createContext, useContext, useState, ReactNode } from 'react';
import { Locale, Translations, languageConfig, translations } from './translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(languageConfig.locale);
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): Translations {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx.t;
}

export function useLocale(): [Locale, (locale: Locale) => void] {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLocale must be used within LanguageProvider');
  return [ctx.locale, ctx.setLocale];
}
