'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type SyntheticEvent, useRef, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const currency = new Intl.NumberFormat(
    language === 'es' ? 'es-US' : 'en-US',
    { style: 'currency', currency: 'USD' },
  );
  const lines = items.flatMap((item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    return product && item.quantity > 0 ? [{ ...item, product }] : [];
  });

  function validateControl(control: HTMLInputElement | HTMLTextAreaElement) {
    const message = control.validity.valid ? '' : copy.cart.requiredField;
    setErrors((current) => ({ ...current, [control.name]: message }));
    return !message;
  }

  function validateForm(form: HTMLFormElement) {
    const controls = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input[required], textarea[required]',
      ),
    );
    const invalid = controls.filter((control) => !validateControl(control));
    invalid[0]?.focus();
    return invalid.length === 0;
  }

  function review(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) return;
    setReviewed(true);
  }

  function handleFieldBlur(
    event: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    validateControl(event.currentTarget);
  }

  function requestOrder() {
    const form = formRef.current;
    if (!form) return;
    if (!validateForm(form)) {
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
        notes: value('notes'),
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
              {copy.cart.emptyContinue}
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
            </section>

            <form
              ref={formRef}
              className="catalog-demo-form"
              onSubmit={review}
              noValidate
              onChange={(event) => {
                setReviewed(false);
                const control = event.target;
                if (
                  !(control instanceof HTMLInputElement) &&
                  !(control instanceof HTMLTextAreaElement)
                )
                  return;
                if (control.name && control.validity.valid)
                  setErrors((current) => ({
                    ...current,
                    [control.name]: '',
                  }));
              }}
            >
              <p className="section-kicker">{copy.cart.demoDetails}</p>
              <div>
                <label>
                  {copy.cart.demoName} *
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby="delivery-name-error"
                    onBlur={handleFieldBlur}
                  />
                  {errors.name ? (
                    <small id="delivery-name-error" role="alert">
                      {errors.name}
                    </small>
                  ) : null}
                </label>
                <label className="wide">
                  {copy.cart.demoAddress} *
                  <input
                    name="address"
                    autoComplete="street-address"
                    required
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby="delivery-address-error"
                    onBlur={handleFieldBlur}
                  />
                  {errors.address ? (
                    <small id="delivery-address-error" role="alert">
                      {errors.address}
                    </small>
                  ) : null}
                </label>
                <label>
                  {copy.cart.demoCity} *
                  <input
                    name="city"
                    autoComplete="address-level2"
                    required
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby="delivery-city-error"
                    onBlur={handleFieldBlur}
                  />
                  {errors.city ? (
                    <small id="delivery-city-error" role="alert">
                      {errors.city}
                    </small>
                  ) : null}
                </label>
                <label>
                  {copy.cart.demoState} *
                  <input
                    name="state"
                    autoComplete="address-level1"
                    required
                    aria-invalid={Boolean(errors.state)}
                    aria-describedby="delivery-state-error"
                    onBlur={handleFieldBlur}
                  />
                  {errors.state ? (
                    <small id="delivery-state-error" role="alert">
                      {errors.state}
                    </small>
                  ) : null}
                </label>
                <label>
                  {copy.cart.demoZip} *
                  <input
                    name="zip"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    required
                    aria-invalid={Boolean(errors.zip)}
                    aria-describedby="delivery-zip-error"
                    onBlur={handleFieldBlur}
                  />
                  {errors.zip ? (
                    <small id="delivery-zip-error" role="alert">
                      {errors.zip}
                    </small>
                  ) : null}
                </label>
                <label>
                  {copy.cart.demoPhone} *
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby="delivery-phone-error"
                    onBlur={handleFieldBlur}
                  />
                  {errors.phone ? (
                    <small id="delivery-phone-error" role="alert">
                      {errors.phone}
                    </small>
                  ) : null}
                </label>
                <label className="wide">
                  {copy.cart.demoNotes}
                  <textarea name="notes" rows={4} />
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
                    {copy.cart.requestOrder}
                  </button>
                </>
              ) : (
                <button className="button button-dark" type="submit">
                  {copy.cart.demoReview}
                </button>
              )}
            </form>
          </div>
        )}

        {lines.length > 0 ? (
          <nav className="catalog-summary-actions">
            <Link className="text-link" href="/flower" prefetch={false}>
              <ShoppingCart aria-hidden="true" />
              {copy.cart.addMore}
            </Link>
          </nav>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
