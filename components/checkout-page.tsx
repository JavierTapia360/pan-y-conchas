'use client';

import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { useLanguage } from '@/components/language-provider';
import { EditorialArrow } from '@/components/editorial-arrow';

export function CheckoutPage() {
  const { copy } = useLanguage();

  return (
    <>
      <SiteHeader />
      <main className="checkout-page checkout-static">
        <p className="section-kicker">CUATESFARMZ / MERCH</p>
        <h1>{copy.merch.checkout}</h1>
        <div className="checkout-notice">
          <b>{copy.merch.checkoutPending}</b>
          <p>{copy.merch.regulatedGuard}</p>
          <Link className="button button-dark" href="/merch/cart">
            {copy.merch.cart}
            <EditorialArrow />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
