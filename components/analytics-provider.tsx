'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ANALYTICS_CONSENT_KEY, track } from '@/lib/analytics';
import { FEATURES } from '@/features/features';
import { useLanguage } from '@/components/language-provider';

type Choice = 'accepted' | 'declined' | null;

export function AnalyticsProvider() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [choice, setChoice] = useState<Choice>(null);
  useEffect(() => {
    if (!FEATURES.analytics) return;
    let saved: Choice = null;
    try {
      const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
      saved = value === 'accepted' || value === 'declined' ? value : null;
    } catch {
      /* Consent remains session-only. */
    }
    queueMicrotask(() => setChoice(saved));
  }, []);
  useEffect(() => {
    if (choice === 'accepted') track('page_view', { language });
  }, [pathname, language, choice]);
  if (!FEATURES.analytics || choice) return null;
  const decide = (next: Exclude<Choice, null>) => {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_KEY, next);
    } catch {
      /* Apply for this page view. */
    }
    setChoice(next);
    if (next === 'accepted')
      queueMicrotask(() => track('page_view', { language }));
  };
  return (
    <aside
      className="privacy-banner"
      aria-label={
        language === 'es'
          ? 'Preferencias de analítica'
          : 'Analytics preferences'
      }
    >
      <p>
        {language === 'es'
          ? 'Analítica anónima guardada solo en este navegador para mejorar el sitio. No se envía a un servidor.'
          : 'Anonymous analytics saved only in this browser to improve the site. Nothing is sent to a server.'}
      </p>
      <div>
        <button
          className="button button-red"
          onClick={() => decide('accepted')}
        >
          {language === 'es' ? 'Aceptar' : 'Accept'}
        </button>
        <button
          className="button button-outline"
          onClick={() => decide('declined')}
        >
          {language === 'es' ? 'Rechazar' : 'Decline'}
        </button>
      </div>
    </aside>
  );
}
