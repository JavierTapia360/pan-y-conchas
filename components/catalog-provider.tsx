'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Product } from '@/data/products';
import {
  LOCAL_CATALOG_EVENT,
  LOCAL_CATALOG_KEY,
  readLocalCatalog,
  resetLocalCatalog,
  writeLocalCatalog,
} from '@/lib/local-catalog';

type CatalogContextValue = {
  products: Product[];
  saveProduct: (product: Product) => void;
  resetCatalog: () => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => readLocalCatalog());

  const refresh = useCallback(() => setProducts(readLocalCatalog()), []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_CATALOG_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(LOCAL_CATALOG_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(LOCAL_CATALOG_EVENT, refresh);
    };
  }, [refresh]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      saveProduct(product) {
        const next = readLocalCatalog()
          .map((item) => (item.slug === product.slug ? product : item))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        writeLocalCatalog(next);
        setProducts(next);
      },
      resetCatalog() {
        resetLocalCatalog();
        refresh();
      },
    }),
    [products, refresh],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalogStore() {
  const context = useContext(CatalogContext);
  if (!context)
    throw new Error('useCatalogStore must be used inside CatalogProvider');
  return context;
}
