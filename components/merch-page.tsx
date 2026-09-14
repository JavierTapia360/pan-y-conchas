'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { EditorialArrow } from '@/components/editorial-arrow';
import { useLanguage } from '@/components/language-provider';
import { useMerch } from '@/hooks/use-merch';
import { useCart } from '@/components/cart-provider';
import { track } from '@/lib/analytics';

export function MerchPage() {
  const { copy, language } = useLanguage();
  const { products, loading } = useMerch();
  const { add, items } = useCart();
  const [choices, setChoices] = useState<Record<string, number>>({});
  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  return (
    <>
      <SiteHeader />
      <main className="merch-page">
        <header>
          <p className="section-kicker">{copy.merch.kicker}</p>
          <h1>{copy.merch.title}</h1>
          <p>{copy.merch.intro}</p>
          <Link prefetch={false} href="/merch/cart" className="text-link">
            {copy.merch.cart} ({count}) <EditorialArrow />
          </Link>
        </header>
        {loading ? (
          <section className="merch-grid" aria-label="Loading merchandise">
            <div className="merch-skeleton" />
            <div className="merch-skeleton" />
          </section>
        ) : products.length === 0 ? (
          <section className="empty-drop">
            <span>CF / DROP 00</span>
            <h2>{copy.merch.empty}</h2>
            <p>{copy.merch.emptyBody}</p>
          </section>
        ) : (
          <section className="merch-grid">
            {products.map((product) => {
              const variantIndex = choices[product.id] || 0;
              const variant = product.variants[variantIndex];
              return (
                <article className="merch-card" key={product.id}>
                  <div className="merch-card-image">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width:700px) 100vw, 50vw"
                      />
                    ) : (
                      <span>CUATESFARMZ / MERCH</span>
                    )}
                  </div>
                  <div className="merch-card-copy">
                    <div>
                      <h2>{product.name}</h2>
                      <p>{product.description[language]}</p>
                    </div>
                    <strong>
                      {new Intl.NumberFormat(
                        language === 'es' ? 'es-MX' : 'en-US',
                        { style: 'currency', currency: 'USD' },
                      ).format(product.priceCents / 100)}
                    </strong>
                    {product.variants.length ? (
                      <label>
                        Variant
                        <select
                          value={variantIndex}
                          onChange={(event) =>
                            setChoices((current) => ({
                              ...current,
                              [product.id]: Number(event.target.value),
                            }))
                          }
                        >
                          {product.variants.map((item, index) => (
                            <option
                              value={index}
                              key={`${item.size}-${item.color}-${index}`}
                            >
                              {[item.size, item.color]
                                .filter(Boolean)
                                .join(' / ') || `Option ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <button
                      className="button button-red"
                      disabled={product.inventory < 1}
                      onClick={() => {
                        add(product, variant);
                        track('add_to_cart', { item_id: product.id, language });
                      }}
                    >
                      {product.inventory < 1 ? 'SOLD OUT' : 'ADD TO CART'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
        <aside className="commerce-guard-note">
          {copy.merch.regulatedGuard}
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
