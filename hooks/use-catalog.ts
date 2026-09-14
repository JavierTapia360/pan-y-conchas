'use client';

import type { Product } from '@/data/products';
import { useCatalogStore } from '@/components/catalog-provider';

export type CatalogProduct = Product;

export function useCatalog() {
  return useCatalogStore().products;
}
