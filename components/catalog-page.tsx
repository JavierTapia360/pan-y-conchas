'use client';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ProductCard } from '@/components/product-card';
import { useLanguage } from '@/components/language-context';
import { useCatalog } from '@/hooks/use-catalog';
import { PromotionCard } from '@/components/promotion-card';
import { usePromotionStore } from '@/components/promotion-provider';

export function CatalogPage() {
  const { copy } = useLanguage();
  const visible = useCatalog().filter((product) => !product.hidden);
  const { promotions } = usePromotionStore();
  return (
    <>
      <SiteHeader />
      <main>
        <header className="page-hero">
          <p className="section-kicker">{copy.flower.kicker}</p>
          <h1>{copy.flower.title}</h1>
          <p>{copy.flower.intro}</p>
        </header>
        <section className="catalog-grid">
          {promotions.map((promotion) => (
            <PromotionCard key={promotion.slug} promotion={promotion} />
          ))}
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
