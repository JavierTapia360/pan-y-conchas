'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage } from '@/components/language-context';
import { usePromotionStore } from '@/components/promotion-provider';
import { useCatalog } from '@/hooks/use-catalog';
import { useCatalogCart } from '@/components/catalog-cart-provider';
import {
  isPromotionComponentsAvailable,
  toPromotionCartProduct,
} from '@/data/catalog-cart';
import { PROMOTION_PRESENTATION } from '@/data/promotion';

export function PromotionDetail() {
  const { language, copy } = useLanguage();
  const { promotion } = usePromotionStore();
  const products = useCatalog();
  const { add } = useCatalogCart();
  const available =
    promotion.active &&
    promotion.available &&
    !promotion.hidden &&
    isPromotionComponentsAvailable(promotion, products);
  const cartProduct = toPromotionCartProduct(promotion, language, products);

  useEffect(() => {
    if (!promotion.active || promotion.hidden)
      window.location.replace('/flower');
  }, [promotion.active, promotion.hidden]);

  return (
    <div className="product-page promotion-page">
      <SiteHeader />
      <main className="detail-layout promotion-detail-layout">
        <section className="detail-gallery" aria-label={copy.product.gallery}>
          <div className="detail-main promotion-detail-image">
            <Image
              src={promotion.image}
              alt={`${promotion.names[language]}: ${promotion.descriptions[language]}`}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </div>
        </section>
        <aside className="detail-copy promotion-detail-copy">
          <Link className="detail-back-link" href="/flower" prefetch={false}>
            {copy.actions.backFlower}
          </Link>
          <p className="promotion-detail-badge">
            {language === 'es'
              ? 'OFERTA POR TIEMPO LIMITADO'
              : 'LIMITED-TIME OFFER'}
          </p>
          <h1>{promotion.names[language]}</h1>
          <p className="detail-description">
            {promotion.descriptions[language]}
          </p>
          <ul className="promotion-components">
            <li>
              <strong>CEREAL MILK</strong>
              <span>1 Oz</span>
            </li>
            <li>
              <strong>BUBBLEGUM GELATO</strong>
              <span>1/2 Oz</span>
            </li>
          </ul>
          <div className="promotion-price-block">
            <span>
              {language === 'es' ? 'PRECIO DEL PAQUETE' : 'BUNDLE PRICE'}
            </span>
            <strong>${(promotion.priceCents / 100).toFixed(2)}</strong>
            <small>
              {language === 'es' ? 'ENVÍO INCLUIDO' : 'SHIPPING INCLUDED'}
            </small>
          </div>
          <div className="availability">
            <span>{copy.product.availability}</span>
            <strong>
              <i />
              {available ? copy.status.available : copy.status.soldOut}
            </strong>
          </div>
          <button
            className="catalog-add-button detail-cart-button"
            type="button"
            disabled={!available}
            onClick={() => add(cartProduct, PROMOTION_PRESENTATION)}
          >
            <ShoppingBag aria-hidden="true" />
            <span>
              <b>{available ? copy.cart.add : copy.status.soldOut}</b>
            </span>
          </button>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
