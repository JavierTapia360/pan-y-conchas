'use client';

import Image from 'next/image';
import type { Product } from '@/data/products';
import { useCatalogCart } from '@/components/catalog-cart-provider';
import { useLanguage } from '@/components/language-provider';
import { CatalogAddButton } from '@/components/catalog-add-button';

export function MobileCartBar({ product }: { product: Product }) {
  const { count, setOpen } = useCatalogCart();
  const { copy } = useLanguage();
  if (
    Object.values(product.prices).every((price) => price == null) &&
    product.available
  )
    return null;
  return (
    <aside className="mobile-catalog-cart-bar" aria-label={copy.cart.title}>
      <button onClick={() => setOpen(true)} aria-label={copy.cart.open}>
        <span>
          <Image src={product.images[0]} alt="" fill sizes="42px" />
        </span>
        <b>{count}</b>
      </button>
      <div>
        <small>{copy.nav.flower}</small>
        <strong>{product.name}</strong>
      </div>
      <CatalogAddButton product={product} compact />
    </aside>
  );
}
