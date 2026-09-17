'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';
import { useLanguage } from '@/components/language-context';
import { CatalogAddButton } from '@/components/catalog-add-button';

export function ProductCard({ product }: { product: Product }) {
  const { copy } = useLanguage();
  const soldOut = product.available === false;
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
          <Link
            prefetch={false}
            href={`/flower/${product.slug}`}
            className="product-view-link"
          >
            {copy.actions.view}
          </Link>
        </div>
      </div>
      <CatalogAddButton product={product} className="product-card-cart" />
    </article>
  );
}
