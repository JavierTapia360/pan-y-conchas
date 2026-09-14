'use client';

import Link from 'next/link';
import { type SyntheticEvent, useMemo, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage } from '@/components/language-provider';
import { useCart } from '@/components/cart-provider';
import { useMerch } from '@/hooks/use-merch';
import { track } from '@/lib/analytics';
import { EditorialArrow } from '@/components/editorial-arrow';

export function CheckoutPage() {
  const { copy, language } = useLanguage();
  const { items } = useCart();
  const { products, loading } = useMerch();
  const [state, setState] = useState<'idle' | 'busy' | 'unavailable' | 'error'>(
    'idle',
  );
  const detailed = items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return product ? [{ ...item, product }] : [];
  });
  const total = useMemo(
    () =>
      detailed.reduce(
        (sum, item) => sum + item.product.priceCents * item.quantity,
        0,
      ),
    [detailed],
  );
  const t =
    language === 'es'
      ? {
          contact: 'Contacto',
          shipping: 'Envío',
          name: 'Nombre completo',
          address: 'Dirección',
          line2: 'Apartamento (opcional)',
          city: 'Ciudad',
          state: 'Estado',
          postal: 'Código postal',
          country: 'País',
          payment: 'Proveedor sandbox',
          submit: 'Continuar al pago seguro',
          unavailable:
            'El proveedor sandbox todavía no está configurado. Tu carrito no fue cobrado.',
        }
      : {
          contact: 'Contact',
          shipping: 'Shipping',
          name: 'Full name',
          address: 'Address',
          line2: 'Apartment (optional)',
          city: 'City',
          state: 'State',
          postal: 'Postal code',
          country: 'Country',
          payment: 'Sandbox provider',
          submit: 'Continue to secure payment',
          unavailable:
            'The sandbox provider is not configured yet. Your cart was not charged.',
        };
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.checkValidity() || !detailed.length) {
      event.currentTarget.reportValidity();
      return;
    }
    setState('busy');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    track('begin_checkout', { language, value_cents: String(total) });
    try {
      const response = await fetch('/api/merch/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: detailed.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            variant: item.variant,
          })),
          email: data.email,
          provider: data.provider,
          shipping: {
            name: data.name,
            line1: data.line1,
            line2: data.line2,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
          },
        }),
      });
      setState(
        response.status === 503
          ? 'unavailable'
          : response.ok
            ? 'idle'
            : 'error',
      );
    } catch {
      setState('error');
    }
  }
  return (
    <>
      <SiteHeader />
      <main className="checkout-page">
        <p className="section-kicker">MERCH / CHECKOUT</p>
        <h1>{copy.merch.checkout}</h1>
        {loading ? (
          <div className="checkout-notice">
            <p>Loading…</p>
          </div>
        ) : detailed.length === 0 ? (
          <div className="checkout-notice">
            <b>EMPTY CART</b>
            <p>{copy.merch.empty}</p>
            <Link prefetch={false} href="/merch" className="text-link">
              {copy.merch.continue} <EditorialArrow />
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={submit}>
              <fieldset>
                <legend>01 / {t.contact}</legend>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                  />
                </label>
              </fieldset>
              <fieldset>
                <legend>02 / {t.shipping}</legend>
                <label>
                  {t.name}
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                  />
                </label>
                <label className="wide">
                  {t.address}
                  <input name="line1" autoComplete="address-line1" required />
                </label>
                <label className="wide">
                  {t.line2}
                  <input name="line2" autoComplete="address-line2" />
                </label>
                <label>
                  {t.city}
                  <input name="city" autoComplete="address-level2" required />
                </label>
                <label>
                  {t.state}
                  <input name="state" autoComplete="address-level1" required />
                </label>
                <label>
                  {t.postal}
                  <input
                    name="postalCode"
                    autoComplete="postal-code"
                    required
                  />
                </label>
                <label>
                  {t.country}
                  <select
                    name="country"
                    autoComplete="country"
                    defaultValue="US"
                  >
                    <option value="US">United States</option>
                    <option value="MX">México</option>
                  </select>
                </label>
              </fieldset>
              <fieldset>
                <legend>03 / {t.payment}</legend>
                <label>
                  <span className="radio-row">
                    <input
                      type="radio"
                      name="provider"
                      value="stripe"
                      defaultChecked
                    />{' '}
                    Stripe sandbox
                  </span>
                </label>
                <label>
                  <span className="radio-row">
                    <input type="radio" name="provider" value="paypal" /> PayPal
                    sandbox
                  </span>
                </label>
              </fieldset>
              {state === 'unavailable' ? (
                <output className="checkout-feedback">{t.unavailable}</output>
              ) : null}
              {state === 'error' ? (
                <p className="form-error" role="alert">
                  {copy.contact.required}
                </p>
              ) : null}
              <button className="button button-red" disabled={state === 'busy'}>
                {state === 'busy' ? '…' : t.submit}
              </button>
            </form>
            <aside className="checkout-summary">
              <p className="section-kicker">ORDER SUMMARY</p>
              {detailed.map((item) => (
                <div
                  key={`${item.id}-${item.variant?.size}-${item.variant?.color}`}
                >
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <b>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format((item.product.priceCents * item.quantity) / 100)}
                  </b>
                </div>
              ))}
              <div className="checkout-total">
                <span>{copy.merch.subtotal}</span>
                <strong>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(total / 100)}
                </strong>
              </div>
              <p>{copy.merch.regulatedGuard}</p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
