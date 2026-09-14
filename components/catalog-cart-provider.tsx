'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  productPresentationOrder,
  type Product,
  type ProductPresentation,
} from '@/data/products';
import { useCatalog, type CatalogProduct } from '@/hooks/use-catalog';
import { track } from '@/lib/analytics';

export type CatalogCartItem = {
  slug: string;
  presentation: ProductPresentation;
  quantity: number;
};
export type CatalogCartNotice = {
  id: number;
  kind: 'added' | 'limit' | 'adjusted' | 'sold-out' | 'price';
  name: string;
  presentation?: ProductPresentation;
  stock?: number;
};

const CART_KEY = 'gf_cart_v1';
const isPresentation = (value: unknown): value is ProductPresentation =>
  productPresentationOrder.includes(value as ProductPresentation);
export const catalogCartItemKey = (
  item: Pick<CatalogCartItem, 'slug' | 'presentation'>,
) => `${item.slug}:${item.presentation}`;

export function reconcileCartItems(
  items: CatalogCartItem[],
  products: Pick<CatalogProduct, 'slug' | 'stocks' | 'prices' | 'hidden'>[],
) {
  const productBySlug = new Map(products.map((item) => [item.slug, item]));
  const seen = new Set<string>();
  let changed = false;
  let adjustment: {
    slug: string;
    presentation: ProductPresentation;
    stock: number;
  } | null = null;
  const next: CatalogCartItem[] = [];

  for (const item of items) {
    const product = productBySlug.get(item.slug);
    const key = isPresentation(item.presentation)
      ? catalogCartItemKey(item)
      : '';
    const valid =
      typeof item.slug === 'string' &&
      isPresentation(item.presentation) &&
      Number.isInteger(item.quantity) &&
      item.quantity >= 0 &&
      product != null &&
      product.prices[item.presentation] != null &&
      !product.hidden &&
      !seen.has(key);
    if (!valid) {
      changed = true;
      continue;
    }
    seen.add(key);
    const stock = Math.max(0, product.stocks[item.presentation]);
    const quantity = Math.min(item.quantity, stock);
    if (quantity !== item.quantity) {
      changed = true;
      adjustment ||= {
        slug: item.slug,
        presentation: item.presentation,
        stock,
      };
    }
    if (quantity > 0)
      next.push(quantity === item.quantity ? item : { ...item, quantity });
  }
  return { items: changed ? next : items, adjustment };
}

const CatalogCartContext = createContext<{
  items: CatalogCartItem[];
  products: CatalogProduct[];
  count: number;
  subtotalCents: number;
  open: boolean;
  notice: CatalogCartNotice | null;
  setOpen: (open: boolean) => void;
  add: (product: Product, presentation: ProductPresentation) => void;
  remove: (slug: string, presentation: ProductPresentation) => void;
  setQuantity: (
    slug: string,
    presentation: ProductPresentation,
    quantity: number,
  ) => void;
  clear: () => void;
  dismissNotice: () => void;
} | null>(null);

export function CatalogCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const products = useCatalog();
  const [items, setItems] = useState<CatalogCartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<CatalogCartNotice | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem(CART_KEY) || '[]',
      ) as CatalogCartItem[];
      queueMicrotask(() => {
        setItems(Array.isArray(stored) ? stored : []);
        setHydrated(true);
      });
    } catch {
      queueMicrotask(() => setHydrated(true));
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* The cart remains usable for the current page session. */
    }
  }, [hydrated, items]);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setItems((current) => {
        const reconciled = reconcileCartItems(current, products);
        if (reconciled.adjustment) {
          const product = products.find(
            (item) => item.slug === reconciled.adjustment?.slug,
          );
          if (product)
            setNotice({
              id: Date.now(),
              kind: 'adjusted',
              name: product.name,
              presentation: reconciled.adjustment.presentation,
              stock: reconciled.adjustment.stock,
            });
        }
        return reconciled.items;
      });
    });
    return () => {
      active = false;
    };
  }, [hydrated, products]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const add = useCallback(
    (requested: Product, presentation: ProductPresentation) => {
      const product =
        products.find((item) => item.slug === requested.slug) || requested;
      const stock = product.stocks[presentation];
      if (stock <= 0) {
        setNotice({
          id: Date.now(),
          kind: 'sold-out',
          name: product.name,
          presentation,
        });
        return;
      }
      if (product.prices[presentation] == null) {
        setNotice({ id: Date.now(), kind: 'price', name: product.name });
        return;
      }
      const key = catalogCartItemKey({ slug: product.slug, presentation });
      const existing = items.find((item) => catalogCartItemKey(item) === key);
      if ((existing?.quantity || 0) >= stock) {
        setNotice({
          id: Date.now(),
          kind: 'limit',
          name: product.name,
          presentation,
          stock,
        });
        return;
      }
      setItems(
        existing
          ? items.map((item) =>
              catalogCartItemKey(item) === key
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...items, { slug: product.slug, presentation, quantity: 1 }],
      );
      setNotice({
        id: Date.now(),
        kind: 'added',
        name: product.name,
        presentation,
      });
      track('add_to_cart', {
        slug: product.slug,
        presentation,
      });
      setOpen(true);
    },
    [items, products],
  );

  const setQuantity = useCallback(
    (
      slug: string,
      presentation: ProductPresentation,
      requestedQuantity: number,
    ) => {
      const product = products.find((item) => item.slug === slug);
      if (!product) return;
      const quantity = Math.max(0, Math.trunc(requestedQuantity));
      const key = catalogCartItemKey({ slug, presentation });
      if (quantity <= 0) {
        setItems((current) =>
          current.filter((item) => catalogCartItemKey(item) !== key),
        );
        return;
      }
      setItems((current) => {
        const maximum = Math.max(0, product.stocks[presentation]);
        if (quantity > maximum) {
          setNotice({
            id: Date.now(),
            kind: 'limit',
            name: product.name,
            presentation,
            stock: maximum,
          });
        }
        return current.map((item) =>
          catalogCartItemKey(item) === key
            ? { ...item, quantity: Math.min(quantity, maximum) }
            : item,
        );
      });
    },
    [products],
  );

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalCents = items.reduce((sum, item) => {
      const product = products.find((entry) => entry.slug === item.slug);
      return sum + (product?.prices[item.presentation] || 0) * item.quantity;
    }, 0);
    return {
      items,
      products,
      count,
      subtotalCents,
      open,
      notice,
      setOpen,
      add,
      remove(slug: string, presentation: ProductPresentation) {
        const key = catalogCartItemKey({ slug, presentation });
        setItems((current) =>
          current.filter((item) => catalogCartItemKey(item) !== key),
        );
      },
      setQuantity,
      clear() {
        setItems([]);
      },
      dismissNotice() {
        setNotice(null);
      },
    };
  }, [add, items, notice, open, products, setQuantity]);

  return (
    <CatalogCartContext.Provider value={value}>
      {children}
    </CatalogCartContext.Provider>
  );
}

export function useCatalogCart() {
  const context = useContext(CatalogCartContext);
  if (!context)
    throw new Error('useCatalogCart must be used within CatalogCartProvider');
  return context;
}
