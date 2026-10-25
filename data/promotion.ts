import type { Language } from '@/lib/language';
import { assets } from '@/data/assets';

export const PROMOTION_SLUG = 'cereal-bubblegum-promo';
export const PROMOTION_PRESENTATION = 'bundle' as const;

export type PromotionSettings = {
  slug: typeof PROMOTION_SLUG;
  names: Record<Language, string>;
  descriptions: Record<Language, string>;
  image: string;
  priceCents: number;
  active: boolean;
  available: boolean;
  hidden: boolean;
  updatedAt: string | null;
  components: readonly {
    slug: 'cereal-milk' | 'bubble-gum';
    presentation: 'oz' | 'halfOz';
    quantity: 1;
  }[];
};

export const promotionDefaults: PromotionSettings = {
  slug: PROMOTION_SLUG,
  names: { es: 'SUPER PROMOCIÓN', en: 'SUPER PROMOTION' },
  descriptions: {
    es: '1 Oz de Cereal Milk + 1/2 Oz de Bubblegum Gelato. Envío incluido.',
    en: '1 Oz Cereal Milk + 1/2 Oz Bubblegum Gelato. Shipping included.',
  },
  image: assets.promotion.cerealBubblegum,
  priceCents: 17012,
  active: true,
  available: true,
  hidden: false,
  updatedAt: null,
  components: [
    { slug: 'cereal-milk', presentation: 'oz', quantity: 1 },
    { slug: 'bubble-gum', presentation: 'halfOz', quantity: 1 },
  ],
};
