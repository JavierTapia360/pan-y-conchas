'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';
import { useLanguage } from '@/components/language-context';
import { Check, Plus, Scale } from 'lucide-react';
import {
  productSelectionItem,
  useSelection,
} from '@/components/selection-provider';
import { track } from '@/lib/analytics';
import { CatalogAddButton } from '@/components/catalog-add-button';
import { EditorialArrow } from '@/components/editorial-arrow';

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { copy, language } = useLanguage();
  const { add, remove, contains, toggleCompare, isCompared } = useSelection();
  const soldOut = product.available === false;
  const selectionId = `flower:${product.slug}`;
  const selected = contains(selectionId);
  const compared = isCompared(selectionId);
  const selectionItem = productSelectionItem(product);
  return (
    <article
      className={`product-card accent-${product.accent} ${soldOut ? 'sold-out' : ''}`}
    >
      <Link
        prefetch={false}
        href={`/flower/${product.slug}`}
        className="product-image"
        style={{ viewTransitionName: `product-${product.slug}` }}
      >
        <picture>
          {product.mobileImage && (
            <source media="(max-width: 700px)" srcSet={product.mobileImage} />
          )}
          <Image
            src={product.images[0]}
            alt={`${product.name} CUATESFARMZ flower`}
            fill
            sizes="(max-width: 700px) 82vw, (max-width: 1100px) 45vw, 25vw"
          />
        </picture>
        <span className="card-number">0{index + 1}</span>
        {soldOut && <span className="sold-overlay">{copy.status.soldOut}</span>}
      </Link>
      <div className="product-meta">
        <div>
          <p className="status">
            <i />
            {product.available === true
              ? copy.status.available
              : product.available === false
                ? copy.status.soldOut
                : copy.status.inquire}
          </p>
          <h3>{product.name}</h3>
          <button
            className={compared ? 'compare-link active' : 'compare-link'}
            aria-pressed={compared}
            onClick={() => toggleCompare(selectionItem)}
          >
            <Scale aria-hidden="true" />
            {compared ? copy.selection.comparing : copy.selection.addCompare}
          </button>
        </div>
        <div className="product-meta-actions">
          <button
            className={
              selected
                ? 'selection-card-button selected'
                : 'selection-card-button'
            }
            aria-label={`${selected ? copy.selection.remove : copy.selection.add} ${product.name}`}
            aria-pressed={selected}
            onClick={() => {
              if (selected) {
                remove(selectionId);
                track('selection_remove', { slug: product.slug, language });
              } else {
                add(selectionItem);
                track('selection_add', { slug: product.slug, language });
              }
            }}
          >
            {selected ? (
              <Check aria-hidden="true" />
            ) : (
              <Plus aria-hidden="true" />
            )}
          </button>
          <Link
            prefetch={false}
            href={`/flower/${product.slug}`}
            aria-label={`${copy.actions.view} ${product.name}`}
            className="round-arrow"
          >
            <EditorialArrow />
          </Link>
        </div>
      </div>
      <CatalogAddButton product={product} className="product-card-cart" />
    </article>
  );
}
