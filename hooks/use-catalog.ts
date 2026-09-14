'use client';

import { useEffect, useState } from 'react';
import { products as defaults, type Product } from '@/data/products';
export type CatalogProduct = Product & {
  featured?: boolean;
  hidden?: boolean;
  sortOrder?: number;
};
export function useCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>(
    defaults.map((product, index) => ({
      ...product,
      featured: true,
      hidden: false,
      sortOrder: index,
    })),
  );
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () =>
      fetch('/api/catalog', { signal: controller.signal, cache: 'no-store' })
        .then((response) =>
          response.ok
            ? (response.json() as Promise<{ products: CatalogProduct[] }>)
            : null,
        )
        .then((data) => data?.products && setProducts(data.products))
        .catch(() => {});
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const refreshFromAdmin = (event: StorageEvent) => {
      if (event.key === 'gf_catalog_refresh_v1') void refresh();
    };
    void refresh();
    const interval = window.setInterval(refresh, 8_000);
    window.addEventListener('focus', refresh);
    window.addEventListener('gf-catalog-refresh', refresh);
    window.addEventListener('storage', refreshFromAdmin);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('gf-catalog-refresh', refresh);
      window.removeEventListener('storage', refreshFromAdmin);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);
  return products;
}
