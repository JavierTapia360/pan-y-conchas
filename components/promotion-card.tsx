'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/components/language-context';
import { usePromotionStore } from '@/components/promotion-provider';
import { useCatalog } from '@/hooks/use-catalog';
import { useCatalogCart } from '@/components/catalog-cart-provider';
import {
  isPromotionComponentsAvailable,
  toPromotionCartProduct,
} from '@/data/catalog-cart';
import { PROMOTION_PRESENTATION } from '@/data/promotion';

export function PromotionCard() {
  const { language, copy } = useLanguage();
  const { promotion } = usePromotionStore();
  const products = useCatalog();
  const { add } = useCatalogCart();
  const item = toPromotionCartProduct(promotion, language, products);
  const available =
    promotion.available && isPromotionComponentsAvailable(promotion, products);
  if (!promotion.active || promotion.hidden) return null;
  return (
    <article
      className={`product-card promotion-card ${available ? '' : 'sold-out'}`}
    >
      <Link
        prefetch={false}
        href={`/flower/${promotion.slug}`}
        className="product-image"
        style={{ viewTransitionName: `product-${promotion.slug}` }}
      >
        <Image
          src={promotion.image}
          alt={`${promotion.names[language]} CUATESFARMZ`}
          fill
          sizes="(max-width: 700px) 82vw, (max-width: 1100px) 45vw, 25vw"
        />
        <span className="promotion-badge">
          {language === 'es'
            ? 'OFERTA POR TIEMPO LIMITADO'
            : 'LIMITED-TIME OFFER'}
        </span>
        {!available ? (
          <span className="sold-overlay">{copy.status.soldOut}</span>
        ) : null}
      </Link>
      <div className="product-meta">
        <div>
          <p className="status">
            <i />
            {available ? copy.status.available : copy.status.soldOut}
          </p>
          <h3>{promotion.names[language]}</h3>
          <p className="promotion-card-description">
            {promotion.descriptions[language]}
          </p>
          <strong className="promotion-card-price">
            ${(promotion.priceCents / 100).toFixed(2)}
          </strong>
          <Link
            prefetch={false}
            href={`/flower/${promotion.slug}`}
            className="product-view-link"
          >
            {copy.actions.view}
          </Link>
        </div>
      </div>
      <button
        type="button"
        className="catalog-add-button product-card-cart"
        disabled={!available}
        onClick={() => add(item, PROMOTION_PRESENTATION)}
      >
        <ShoppingBag aria-hidden="true" />
        <span>
          <b>{available ? copy.cart.add : copy.status.soldOut}</b>
        </span>
      </button>
    </article>
  );
}
