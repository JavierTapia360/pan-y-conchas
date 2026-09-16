'use client';

import { createContext, useContext } from 'react';
import type { Language } from '@/lib/language';

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? ReadonlyArray<Widen<U>>
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T;

export type Copy = Widen<(typeof import('@/locales/en'))['en']>;
export type SiteSettings = Record<string, { es: string; en: string }>;

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  copy: Copy;
  siteSettings: SiteSettings;
} | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
