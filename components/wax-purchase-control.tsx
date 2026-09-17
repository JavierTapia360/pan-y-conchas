'use client';

import { useState } from 'react';
import { useCatalogCart } from '@/components/catalog-cart-provider';
import { useLanguage } from '@/components/language-context';
import { getCatalogPresentationLabel } from '@/data/catalog-cart';
import {
  waxPresentationOrder,
  waxProduct,
  type WaxPresentation,
} from '@/data/wax';

export function WaxPurchaseControl() {
  const { add } = useCatalogCart();
  const { copy, language } = useLanguage();
  const [presentation, setPresentation] = useState<WaxPresentation>('pieces5');
  const currency = new Intl.NumberFormat(
    language === 'es' ? 'es-US' : 'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  );
  const price = waxProduct.prices[presentation];
  const perPiece = waxProduct.perPiecePrices[presentation];

  return (
    <section className="wax-purchase" aria-label={copy.wax.purchase}>
      <header>
        <span>{copy.product.availability}</span>
        <strong className={waxProduct.available ? 'available' : 'sold-out'}>
          {waxProduct.available ? copy.status.available : copy.status.soldOut}
        </strong>
      </header>
      <div className="wax-purchase-price" aria-live="polite">
        <strong>{currency.format(price / 100)}</strong>
        <span>
          {currency.format(perPiece / 100)} {copy.wax.perPiece}
        </span>
      </div>
      <fieldset disabled={!waxProduct.available}>
        <legend>{copy.cart.presentation}</legend>
        <div className="wax-presentation-options">
          {waxPresentationOrder.map((option) => (
            <label
              key={option}
              aria-label={`${getCatalogPresentationLabel(option, language)} · ${currency.format(waxProduct.prices[option] / 100)}`}
            >
              <input
                type="radio"
                name="wax-presentation"
                value={option}
                checked={presentation === option}
                onChange={() => setPresentation(option)}
              />
              <span>
                <b>{getCatalogPresentationLabel(option, language)}</b>
                <small>
                  {currency.format(waxProduct.prices[option] / 100)}
                </small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        className="catalog-add-button wax-add-button"
        disabled={!waxProduct.available}
        onClick={() => add(waxProduct, presentation)}
        aria-label={`${waxProduct.available ? copy.cart.add : copy.status.soldOut} · WAX · ${getCatalogPresentationLabel(presentation, language)}`}
      >
        <span>
          <b>{waxProduct.available ? copy.cart.add : copy.status.soldOut}</b>
        </span>
      </button>
    </section>
  );
}
