'use client';

import { useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import {
  productPresentationLabels,
  productPresentationOrder,
  type Product,
  type ProductPresentation,
} from '@/data/products';
import { useCatalogCart } from '@/components/catalog-cart-provider';
import { useLanguage } from '@/components/language-provider';

export function CatalogAddButton({
  product,
  className = '',
  compact = false,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  const { add } = useCatalogCart();
  const { copy, language } = useLanguage();
  const pricedPresentations = useMemo(
    () =>
      productPresentationOrder.filter(
        (presentation) => product.prices[presentation] != null,
      ),
    [product.prices],
  );
  const firstAvailable =
    pricedPresentations.find((option) => product.stocks[option] > 0) ||
    pricedPresentations[0] ||
    'halfOz';
  const [selectedPresentation, setPresentation] =
    useState<ProductPresentation>(firstAvailable);
  const presentation = pricedPresentations.includes(selectedPresentation)
    ? selectedPresentation
    : firstAvailable;

  const soldOut = product.stocks[presentation] <= 0;
  const pricePending = pricedPresentations.length === 0;
  const currency = new Intl.NumberFormat(
    language === 'es' ? 'es-US' : 'en-US',
    { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
  );
  if (pricePending && !soldOut) return null;

  return (
    <div
      className={`catalog-purchase-control ${compact ? 'compact' : ''} ${className}`.trim()}
    >
      {!pricePending && (
        <fieldset>
          <legend>{copy.cart.presentation}</legend>
          {compact ? (
            <select
              value={presentation}
              onChange={(event) =>
                setPresentation(event.target.value as ProductPresentation)
              }
              aria-label={`${copy.cart.presentation}: ${product.name}`}
            >
              {pricedPresentations.map((option) => (
                <option value={option} key={option}>
                  {productPresentationLabels[option]} ·{' '}
                  {currency.format((product.prices[option] || 0) / 100)} ·{' '}
                  {product.stocks[option] > 0
                    ? copy.status.available
                    : copy.status.soldOut}
                </option>
              ))}
            </select>
          ) : (
            <div className="catalog-presentation-options">
              {pricedPresentations.map((option) => (
                <label
                  key={option}
                  aria-label={`${productPresentationLabels[option]} ${currency.format((product.prices[option] || 0) / 100)}`}
                >
                  <input
                    type="radio"
                    name={`presentation-${product.slug}`}
                    value={option}
                    checked={presentation === option}
                    onChange={() => setPresentation(option)}
                  />
                  <span>
                    <b>{productPresentationLabels[option]}</b>
                    <small>
                      {currency.format((product.prices[option] || 0) / 100)}
                    </small>
                    <em
                      className={product.stocks[option] > 0 ? '' : 'sold-out'}
                    >
                      {product.stocks[option] > 0
                        ? copy.status.available
                        : copy.status.soldOut}
                    </em>
                  </span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      )}
      <button
        type="button"
        className="catalog-add-button"
        disabled={soldOut || pricePending}
        onClick={() => add(product, presentation)}
        aria-label={`${soldOut ? copy.status.soldOut : pricePending ? copy.cart.pricePending : copy.cart.add} ${product.name} · ${productPresentationLabels[presentation]}`}
      >
        <ShoppingBag aria-hidden="true" />
        <span>
          <b>
            {soldOut
              ? copy.status.soldOut
              : pricePending
                ? copy.cart.pricePending
                : copy.cart.add}
          </b>
        </span>
      </button>
    </div>
  );
}
