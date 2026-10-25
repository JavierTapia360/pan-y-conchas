import { PROMOTION_SLUG } from '@/data/promotion';

export const STANDARD_SHIPPING_CENTS = 1799;
export const PROMO_SHIPPING_CENTS = 0;

export type ShippingLine = { slug: string; quantity: number };

export function calculateShippingCents(lines: readonly ShippingLine[]) {
  const populated = lines.filter((line) => line.quantity > 0);
  if (populated.length === 0) return 0;
  return populated.some((line) => line.slug !== PROMOTION_SLUG)
    ? STANDARD_SHIPPING_CENTS
    : PROMO_SHIPPING_CENTS;
}
