'use client';

import { useEffect, useState } from 'react';
import { merchProducts as fallback, type MerchProduct } from '@/data/merch';

export function useMerch() {
  const [products, setProducts] = useState<MerchProduct[]>(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/merch/products', { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ products: MerchProduct[] }> : null)
      .then((data) => { if (data?.products) setProducts(data.products); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  return { products, loading };
}
