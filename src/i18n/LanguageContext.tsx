import { createContext, useContext, useState, ReactNode } from 'react';
import { Locale, Translations, translations } from './translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const SUPPORTED: Locale[] = ['en', 'de'];

function detectLocale(): Locale {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale; // e.g. "de-DE", "en-US"
    const lang = tag.split('-')[0].toLowerCase();
    return (SUPPORTED.includes(lang as Locale) ? lang : 'en') as Locale;
  } catch {
    return 'en';
  }
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);
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
