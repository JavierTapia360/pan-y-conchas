'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage } from '@/components/language-context';

export function LegalPage({ type }: { type: 'privacy' | 'terms' | 'age' }) {
  const { copy } = useLanguage();
  const title =
    type === 'privacy'
      ? copy.legal.privacyTitle
      : type === 'terms'
        ? copy.legal.termsTitle
        : copy.legal.ageTitle;
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <p className="section-kicker">CUATESFARMZ / LEGAL</p>
        <h1>{title}</h1>
        {/* TODO: Replace with counsel-approved legal text before launch. */}
        <div className="legal-placeholder">
          <strong>REVIEW REQUIRED</strong>
          <p>{copy.legal.placeholder}</p>
        </div>
        <Link prefetch={false} href="/" className="button button-dark">
          {copy.legal.back}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
