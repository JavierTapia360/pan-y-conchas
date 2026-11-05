import { SHIPPING_INCLUDED_PROMOTION_SLUGS } from '@/data/promotion';

export const STANDARD_SHIPPING_CENTS = 1700;
export const PROMO_SHIPPING_CENTS = 0;

export type ShippingLine = { slug: string; quantity: number };

export function calculateShippingCents(lines: readonly ShippingLine[]) {
  const populated = lines.filter((line) => line.quantity > 0);
  if (populated.length === 0) return 0;
  return populated.some(
    (line) => !SHIPPING_INCLUDED_PROMOTION_SLUGS.includes(line.slug),
  )
    ? STANDARD_SHIPPING_CENTS
    : PROMO_SHIPPING_CENTS;
}
