'use client';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Faq } from '@/components/faq';
export function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="standalone-faq">
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
