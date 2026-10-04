'use client';

import { useLanguage } from '@/components/language-context';

export function WaxPurchaseControl() {
  const { copy } = useLanguage();

  return (
    <section className="wax-coming-soon" aria-labelledby="wax-coming-soon">
      <p>{copy.product.availability}</p>
      <h3 id="wax-coming-soon">{copy.wax.comingSoon}</h3>
      <span>{copy.wax.comingSoonBody}</span>
    </section>
  );
}
