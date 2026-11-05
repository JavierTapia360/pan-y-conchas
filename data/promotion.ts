import type { Language } from '@/lib/language';
import { assets } from '@/data/assets';
import type { ProductPresentation } from '@/data/products';

export const PROMOTION_SLUG = 'cereal-bubblegum-promo';
export const PROMOTION_PRESENTATION = 'bundle' as const;

export type PromotionSettings = {
  slug: string;
  names: Record<Language, string>;
  descriptions: Record<Language, string>;
  image: string;
  priceCents: number;
  normalPriceCents?: number;
  shippingIncluded: boolean;
  active: boolean;
  available: boolean;
  hidden: boolean;
  updatedAt: string | null;
  components: readonly {
    slug: string;
    presentation: ProductPresentation;
    quantity: 1;
  }[];
};

export const promotionDefaults: PromotionSettings = {
  slug: PROMOTION_SLUG,
  names: { es: 'SUPER PROMOCIÓN', en: 'SUPER PROMOTION' },
  descriptions: {
    es: '1 Oz de Cereal Milk + 1 Oz de Bubblegum Gelato. Se agregan $17 de envío estándar al resumen.',
    en: '1 Oz Cereal Milk + 1 Oz Bubblegum Gelato. $17 standard shipping is added at summary.',
  },
  image: assets.promotion.cerealBubblegum,
  priceCents: 12734,
  normalPriceCents: 16498,
  shippingIncluded: false,
  active: true,
  available: true,
  hidden: false,
  updatedAt: null,
  components: [
    { slug: 'cereal-milk', presentation: 'oz', quantity: 1 },
    { slug: 'bubble-gum', presentation: 'oz', quantity: 1 },
  ],
};

export const additionalPromotions: readonly PromotionSettings[] = [
  {
    slug: 'cereal-white-gummies-bubblegum-promo',
    names: { es: 'PROMOCIÓN TRIPLE', en: 'TRIPLE PROMOTION' },
    descriptions: {
      es: '1 Oz de Cereal Milk + 1 Oz de White Gummies + 1 Oz de Bubblegum Gelato. Envío incluido.',
      en: '1 Oz Cereal Milk + 1 Oz White Gummies + 1 Oz Bubblegum Gelato. Shipping included.',
    },
    image: assets.promotion.cerealWhiteGummiesBubblegum,
    priceCents: 24949,
    normalPriceCents: 34497,
    shippingIncluded: true,
    active: true,
    available: true,
    hidden: false,
    updatedAt: null,
    components: [
      { slug: 'cereal-milk', presentation: 'oz', quantity: 1 },
      { slug: 'white-gummies', presentation: 'oz', quantity: 1 },
      { slug: 'bubble-gum', presentation: 'oz', quantity: 1 },
    ],
  },
  {
    slug: 'cereal-white-gummies-jelly-promo',
    names: { es: 'PROMOCIÓN QP', en: 'QP PROMOTION' },
    descriptions: {
      es: '1 QP de Cereal Milk + 1 Oz de White Gummies + 1 Oz de Jelly Donut. Envío incluido.',
      en: '1 QP Cereal Milk + 1 Oz White Gummies + 1 Oz Jelly Donut. Shipping included.',
    },
    image: assets.promotion.cerealWhiteGummiesJelly,
    priceCents: 46199,
    normalPriceCents: 52999,
    shippingIncluded: true,
    active: true,
    available: true,
    hidden: false,
    updatedAt: null,
    components: [
      { slug: 'cereal-milk', presentation: 'qp', quantity: 1 },
      { slug: 'white-gummies', presentation: 'oz', quantity: 1 },
      { slug: 'jelly-donut', presentation: 'oz', quantity: 1 },
    ],
  },
];

export const promotions = [promotionDefaults, ...additionalPromotions] as const;
export const PROMOTION_SLUGS = promotions.map((promotion) => promotion.slug);
export const SHIPPING_INCLUDED_PROMOTION_SLUGS = promotions
  .filter((promotion) => promotion.shippingIncluded)
  .map((promotion) => promotion.slug);

export function getPromotion(slug: string) {
  return promotions.find((promotion) => promotion.slug === slug);
}
