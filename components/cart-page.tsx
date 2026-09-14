'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage } from '@/components/language-provider';
import { cartItemKey, useCart } from '@/components/cart-provider';
import { useMerch } from '@/hooks/use-merch';

export function CartPage() {
  const { copy } = useLanguage();
  const { items, remove, setQuantity } = useCart();
  const { products, loading } = useMerch();
  const detailed = items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return product ? [{ ...item, product, key: cartItemKey(item) }] : [];
  });
  const subtotal = detailed.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  return (
    <>
      <SiteHeader />
      <main className="cart-page">
        <p className="section-kicker">CUATESFARMZ / MERCH</p>
        <h1>{copy.merch.cart}</h1>
        {loading ? (
          <div className="cart-empty">
            <p>Loading…</p>
          </div>
        ) : detailed.length === 0 ? (
          <div className="cart-empty">
            <p>{copy.merch.empty}</p>
            <Link prefetch={false} className="button button-dark" href="/merch">
              {copy.merch.continue}
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {detailed.map(({ product, quantity, variant, key }) => (
                <article key={key}>
                  <div>
                    <h2>{product.name}</h2>
                    {variant ? (
                      <p>
                        {[variant.size, variant.color]
                          .filter(Boolean)
                          .join(' / ')}
                      </p>
                    ) : null}
                  </div>
                  <label>
                    {copy.merch.quantity}
                    <input
                      type="number"
                      min="1"
                      max={product.inventory}
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(
                          key,
                          Number(event.target.value),
                          product.inventory,
                        )
                      }
                    />
                  </label>
                  <button onClick={() => remove(key)}>
                    {copy.merch.remove}
                  </button>
                </article>
              ))}
            </div>
            <div className="cart-total">
              <span>{copy.merch.subtotal}</span>
              <strong>
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: 'USD',
                }).format(subtotal / 100)}
              </strong>
              <p className="commerce-guard-note">
                {copy.merch.checkoutPending}
              </p>
            </div>
          </>
        )}
        <p className="commerce-guard-note">{copy.merch.regulatedGuard}</p>
      </main>
      <SiteFooter />
    </>
  );
}
