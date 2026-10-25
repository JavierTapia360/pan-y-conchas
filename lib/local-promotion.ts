import { promotionDefaults, type PromotionSettings } from '@/data/promotion';

export const LOCAL_PROMOTION_KEY = 'gf_promo_local_v1';
export const LOCAL_PROMOTION_EVENT = 'gf-promo-local-change';

export function normalizePromotion(value: unknown): PromotionSettings {
  if (!value || typeof value !== 'object') return { ...promotionDefaults };
  const candidate = value as Partial<PromotionSettings>;
  return {
    ...promotionDefaults,
    priceCents:
      Number.isInteger(candidate.priceCents) &&
      Number(candidate.priceCents) >= 0
        ? Number(candidate.priceCents)
        : promotionDefaults.priceCents,
    active:
      typeof candidate.active === 'boolean'
        ? candidate.active
        : promotionDefaults.active,
    available:
      typeof candidate.available === 'boolean'
        ? candidate.available
        : promotionDefaults.available,
    hidden:
      typeof candidate.hidden === 'boolean'
        ? candidate.hidden
        : promotionDefaults.hidden,
    updatedAt:
      typeof candidate.updatedAt === 'string' ? candidate.updatedAt : null,
  };
}

export function readLocalPromotion() {
  if (typeof window === 'undefined') return { ...promotionDefaults };
  try {
    return normalizePromotion(
      JSON.parse(window.localStorage.getItem(LOCAL_PROMOTION_KEY) || 'null'),
    );
  } catch {
    return { ...promotionDefaults };
  }
}

export function writeLocalPromotion(promotion: PromotionSettings) {
  window.localStorage.setItem(LOCAL_PROMOTION_KEY, JSON.stringify(promotion));
  window.dispatchEvent(new Event(LOCAL_PROMOTION_EVENT));
}
