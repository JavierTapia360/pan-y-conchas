'use client';

import { merchProducts as fallback, type MerchProduct } from '@/data/merch';

export function useMerch() {
  return { products: fallback as MerchProduct[], loading: false };
}
