'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { en } from '@/locales/en';
import { es } from '@/locales/es';
import { track } from '@/lib/analytics';

export type Language = 'es' | 'en';
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? ReadonlyArray<Widen<U>>
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T;
export type Copy = Widen<typeof en>;
type SiteSettings = Record<string, { es: string; en: string }>;
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  copy: Copy;
  siteSettings: SiteSettings;
} | null>(null);
const LOCALE_KEY = 'gf_locale_v1';

function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  let saved: string | null = null;
  try {
    saved =
      window.localStorage.getItem(LOCALE_KEY) ||
      window.localStorage.getItem('gf-language');
  } catch {
    /* Browser storage may be unavailable. */
  }
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'es' || fromUrl === 'en') return fromUrl;
  return detectLanguageFrom(
    saved,
    window.navigator.languages?.length
      ? [...window.navigator.languages]
      : [window.navigator.language],
  );
}

export function detectLanguageFrom(
  saved: string | null,
  languages: string[],
): Language {
  if (saved === 'es' || saved === 'en') return saved;
  return languages.some((item) => item.toLowerCase().startsWith('es'))
    ? 'es'
    : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [settings] = useState<SiteSettings>({});
  useEffect(() => {
    const next = detectLanguage();
    queueMicrotask(() => setLanguageState(next));
    document.documentElement.lang = next;
    document.documentElement.dataset.languageReady = 'true';
  }, []);
  const value = useMemo(
    () => ({
      language,
      siteSettings: settings,
      copy: (() => {
        const base = (language === 'es' ? es : en) as unknown as Copy;
        const get = (key: string, fallback: string) =>
          settings[key]?.[language] || fallback;
        return {
          ...base,
          announcement: get('announcement', base.announcement),
          home: {
            ...base.home,
            title: get('homeHeadline', base.home.title),
            subtitle: get('homeSubheadline', base.home.subtitle),
          },
          about: {
            ...base.about,
            blockOne: get('aboutText', base.about.blockOne),
          },
          contact: {
            ...base.contact,
            intro: get('contactText', base.contact.intro),
          },
          footer: {
            ...base.footer,
            rights: get('footerText', base.footer.rights),
          },
        };
      })(),
      setLanguage(next: Language) {
        try {
          window.localStorage.setItem(LOCALE_KEY, next);
        } catch {
          /* Language still changes for this session. */
        }
        document.documentElement.lang = next;
        document.documentElement.dataset.languageChanging = 'true';
        const url = new URL(window.location.href);
        url.searchParams.set('lang', next);
        window.history.replaceState(
          window.history.state,
          '',
          `${url.pathname}${url.search}${url.hash}`,
        );
        setLanguageState(next);
        track('language_switch', { language: next });
        window.setTimeout(() => {
          delete document.documentElement.dataset.languageChanging;
        }, 180);
      },
    }),
    [language, settings],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
