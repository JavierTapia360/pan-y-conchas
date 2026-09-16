'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type SyntheticEvent, useRef, useState } from 'react';
import { EditorialArrow } from '@/components/editorial-arrow';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { useCatalogCart } from '@/components/catalog-cart-provider';
import { useLanguage } from '@/components/language-context';
import { productPresentationLabels } from '@/data/products';
import { buildTelegramOrderUrl } from '@/lib/telegram';
import { track } from '@/lib/analytics';

export function CatalogCartPage() {
  const { copy, language } = useLanguage();
  const { items, products, subtotalCents } = useCatalogCart();
  const [reviewed, setReviewed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const currency = new Intl.NumberFormat(
    language === 'es' ? 'es-US' : 'en-US',
    { style: 'currency', currency: 'USD' },
  );
  const lines = items.flatMap((item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    return product && item.quantity > 0 ? [{ ...item, product }] : [];
  });

  function review(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    setReviewed(true);
  }

  function requestOrder() {
    const form = formRef.current;
    if (!form) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      setReviewed(false);
      return;
    }
    const data = new FormData(form);
    const value = (key: string) => {
      const entry = data.get(key);
      return typeof entry === 'string' ? entry.trim() : '';
    };
    const url = buildTelegramOrderUrl({
      language,
      lines: lines.map(({ product, presentation, quantity }) => ({
        name: product.name,
        presentation,
        quantity,
        unitPriceCents: product.prices[presentation] || 0,
      })),
      subtotalCents,
      customer: {
        name: value('name'),
        address: value('address'),
        city: value('city'),
        state: value('state'),
        zip: value('zip'),
        phone: value('phone'),
      },
    });
    track('order_request', { language, channel: 'telegram' });
    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
    else window.location.assign(url);
  }

  return (
    <>
      <SiteHeader />
      <main className="catalog-summary-page">
        <header>
          <p className="section-kicker">CUATESFARMZ / CART</p>
          <h1>{copy.cart.summary}</h1>
          <p>{copy.cart.summaryDescription}</p>
        </header>

        {lines.length === 0 ? (
          <section className="catalog-summary-empty">
            <h2>{copy.cart.empty}</h2>
            <p>{copy.cart.emptyBody}</p>
            <Link className="button button-red" href="/flower" prefetch={false}>
              {copy.cart.continue} <EditorialArrow />
            </Link>
          </section>
        ) : (
          <div className="catalog-summary-layout">
            <section className="catalog-summary-items">
              <div className="catalog-summary-heading" aria-hidden="true">
                <span>{copy.cart.product}</span>
                <span>{copy.cart.presentation}</span>
                <span>{copy.cart.quantity}</span>
                <span>{copy.cart.price}</span>
                <span>{copy.cart.lineSubtotal}</span>
              </div>
              {lines.map(({ product, presentation, quantity }) => {
                const price = product.prices[presentation] || 0;
                return (
                  <article key={`${product.slug}:${presentation}`}>
                    <Link href={`/flower/${product.slug}`} prefetch={false}>
                      <span className="catalog-summary-image">
                        <Image
                          src={product.images[0]}
                          alt=""
                          fill
                          sizes="88px"
                        />
                      </span>
                      <strong>{product.name}</strong>
                    </Link>
                    <span data-label={copy.cart.presentation}>
                      {productPresentationLabels[presentation]}
                    </span>
                    <span data-label={copy.cart.quantity}>{quantity}</span>
                    <span data-label={copy.cart.price}>
                      {currency.format(price / 100)}
                    </span>
                    <b data-label={copy.cart.lineSubtotal}>
                      {currency.format((price * quantity) / 100)}
                    </b>
                  </article>
                );
              })}
              <div className="catalog-summary-total">
                <span>{copy.cart.subtotal}</span>
                <strong>{currency.format(subtotalCents / 100)}</strong>
              </div>
              <p className="catalog-summary-stock-note">
                {copy.cart.manualStock}
              </p>
            </section>

            <form
              ref={formRef}
              className="catalog-demo-form"
              onSubmit={review}
              onChange={() => setReviewed(false)}
            >
              <p className="section-kicker">{copy.cart.demoDetails}</p>
              <div>
                <label>
                  {copy.cart.demoName}
                  <input name="name" autoComplete="name" required />
                </label>
                <label className="wide">
                  {copy.cart.demoAddress}
                  <input
                    name="address"
                    autoComplete="street-address"
                    required
                  />
                </label>
                <label>
                  {copy.cart.demoCity}
                  <input name="city" autoComplete="address-level2" required />
                </label>
                <label>
                  {copy.cart.demoState}
                  <input name="state" autoComplete="address-level1" required />
                </label>
                <label>
                  {copy.cart.demoZip}
                  <input name="zip" autoComplete="postal-code" required />
                </label>
                <label>
                  {copy.cart.demoPhone}
                  <input name="phone" type="tel" autoComplete="tel" required />
                </label>
              </div>
              <p>{copy.cart.demoOnly}</p>
              {reviewed ? (
                <>
                  <output className="catalog-demo-success">
                    {copy.cart.demoReviewed}
                  </output>
                  <p className="catalog-telegram-note">
                    {copy.cart.telegramReady}
                  </p>
                  <button
                    className="button button-red catalog-request-order"
                    type="button"
                    onClick={requestOrder}
                  >
                    {copy.cart.requestOrder} <EditorialArrow />
                  </button>
                </>
              ) : (
                <button className="button button-dark" type="submit">
                  {copy.cart.demoReview} <EditorialArrow />
                </button>
              )}
            </form>
          </div>
        )}

        <nav className="catalog-summary-actions">
          <Link className="text-link" href="/flower" prefetch={false}>
            {copy.cart.continue} <EditorialArrow />
          </Link>
          <Link className="text-link" href="/contact" prefetch={false}>
            {copy.actions.contact} <EditorialArrow />
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
