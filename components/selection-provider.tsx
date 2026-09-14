'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type Product } from '@/data/products';
import { assets } from '@/data/assets';
import { useCatalog, type CatalogProduct } from '@/hooks/use-catalog';

export type SelectionItem = {
  id: string;
  kind: 'flower' | 'wax';
  slug?: string;
  name: string;
  image: string;
  accent?: 'candy' | 'pink' | 'ice' | 'green' | 'gold';
};

const SELECTION_KEY = 'gf_catalog_selection_v1';
const COMPARE_KEY = 'gf_catalog_compare_v1';
const RECENT_KEY = 'gf_catalog_recent_v1';
const REGION_KEY = 'gf_catalog_region_v1';

export type SelectionToast = {
  id: number;
  kind: 'added' | 'removed' | 'compare' | 'limit';
  item?: SelectionItem;
};

export function productSelectionItem(product: Product): SelectionItem {
  return {
    id: `flower:${product.slug}`,
    kind: 'flower',
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    accent: product.accent,
  };
}

export function waxSelectionItem(name = 'WAX'): SelectionItem {
  return {
    id: 'wax:device',
    kind: 'wax',
    name,
    image: assets.wax.images[0],
    accent: 'gold',
  };
}

export function toggleSelectionItems(
  items: SelectionItem[],
  item: SelectionItem,
) {
  return items.some((entry) => entry.id === item.id)
    ? items.filter((entry) => entry.id !== item.id)
    : [...items, item];
}

export function toggleComparisonItems(
  items: SelectionItem[],
  item: SelectionItem,
) {
  if (items.some((entry) => entry.id === item.id))
    return items.filter((entry) => entry.id !== item.id);
  return items.length >= 3 ? items : [...items, item];
}

const SelectionContext = createContext<{
  items: SelectionItem[];
  compareItems: SelectionItem[];
  recentItems: SelectionItem[];
  region: string;
  toast: SelectionToast | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: SelectionItem, reveal?: boolean) => void;
  remove: (id: string) => void;
  toggle: (item: SelectionItem) => void;
  clear: () => void;
  contains: (id: string) => boolean;
  toggleCompare: (item: SelectionItem) => void;
  isCompared: (id: string) => boolean;
  recordView: (item: SelectionItem) => void;
  setRegion: (region: string) => void;
  dismissToast: () => void;
} | null>(null);

function isSelectionItem(item: unknown): item is SelectionItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Partial<SelectionItem>;
  return (
    typeof candidate.id === 'string' &&
    (candidate.kind === 'flower' || candidate.kind === 'wax') &&
    typeof candidate.name === 'string' &&
    typeof candidate.image === 'string'
  );
}

function sharedItemsFromUrl(catalog: CatalogProduct[]) {
  const requested = new URLSearchParams(window.location.search)
    .get('selection')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (!requested?.length) return [];
  return requested.flatMap<SelectionItem>((value) => {
    if (value === 'wax') {
      return [waxSelectionItem()];
    }
    const product = catalog.find((entry) => entry.slug === value);
    return product ? [productSelectionItem(product)] : [];
  });
}

export function reconcileSelectionItems(
  items: SelectionItem[],
  catalog: CatalogProduct[],
) {
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));
  let changed = false;
  const next = items.flatMap((item) => {
    if (item.kind === 'wax') {
      const canonical = waxSelectionItem();
      if (
        item.name !== canonical.name ||
        item.image !== canonical.image ||
        item.accent !== canonical.accent
      )
        changed = true;
      return [canonical];
    }
    const product = item.slug ? bySlug.get(item.slug) : undefined;
    if (!product || product.hidden) {
      changed = true;
      return [];
    }
    const canonical = productSelectionItem(product);
    if (
      item.name !== canonical.name ||
      item.image !== canonical.image ||
      item.accent !== canonical.accent
    )
      changed = true;
    return [canonical];
  });
  return changed ? next : items;
}

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const catalog = useCatalog();
  const [initialCatalog] = useState(catalog);
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [compareItems, setCompareItems] = useState<SelectionItem[]>([]);
  const [recentItems, setRecentItems] = useState<SelectionItem[]>([]);
  const [region, setRegionState] = useState('');
  const [toast, setToast] = useState<SelectionToast | null>(null);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem(SELECTION_KEY) || '[]',
      ) as SelectionItem[];
      const compared = JSON.parse(
        window.localStorage.getItem(COMPARE_KEY) || '[]',
      ) as SelectionItem[];
      const recent = JSON.parse(
        window.localStorage.getItem(RECENT_KEY) || '[]',
      ) as SelectionItem[];
      const shared = sharedItemsFromUrl(initialCatalog);
      queueMicrotask(() => {
        setItems(
          [...stored.filter(isSelectionItem), ...shared].filter(
            (item, index, all) =>
              all.findIndex((entry) => entry.id === item.id) === index,
          ),
        );
        setCompareItems(compared.filter(isSelectionItem).slice(0, 3));
        setRecentItems(recent.filter(isSelectionItem).slice(0, 6));
        setRegionState(window.localStorage.getItem(REGION_KEY) || '');
        setHydrated(true);
      });
    } catch {
      queueMicrotask(() => setHydrated(true));
    }
  }, [initialCatalog]);

  useEffect(() => {
    if (!hydrated) return;
    queueMicrotask(() => {
      setItems((current) => reconcileSelectionItems(current, catalog));
      setCompareItems((current) => reconcileSelectionItems(current, catalog));
      setRecentItems((current) => reconcileSelectionItems(current, catalog));
    });
  }, [catalog, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SELECTION_KEY, JSON.stringify(items));
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(compareItems));
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(recentItems));
      window.localStorage.setItem(REGION_KEY, region);
    } catch {
      /* The selection remains available until this page closes. */
    }
  }, [compareItems, hydrated, items, recentItems, region]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const add = useCallback((item: SelectionItem, reveal = false) => {
    setItems((current) =>
      current.some((entry) => entry.id === item.id)
        ? current
        : [...current, item],
    );
    setToast({ id: Date.now(), kind: 'added', item });
    if (reveal) setOpen(true);
  }, []);

  const toggleCompare = useCallback((item: SelectionItem) => {
    setCompareItems((current) => {
      if (current.some((entry) => entry.id === item.id)) {
        setToast({ id: Date.now(), kind: 'compare', item });
        return toggleComparisonItems(current, item);
      }
      if (current.length >= 3) {
        setToast({ id: Date.now(), kind: 'limit' });
        return current;
      }
      setToast({ id: Date.now(), kind: 'compare', item });
      return toggleComparisonItems(current, item);
    });
  }, []);

  const recordView = useCallback((item: SelectionItem) => {
    setRecentItems((current) =>
      [item, ...current.filter((entry) => entry.id !== item.id)].slice(0, 6),
    );
  }, []);

  const setRegion = useCallback((nextRegion: string) => {
    setRegionState(nextRegion);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({
      items,
      compareItems,
      recentItems,
      region,
      toast,
      open,
      setOpen,
      add,
      remove(id: string) {
        setItems((current) => {
          const removed = current.find((item) => item.id === id);
          if (removed)
            setToast({ id: Date.now(), kind: 'removed', item: removed });
          return current.filter((item) => item.id !== id);
        });
        setCompareItems((current) => current.filter((item) => item.id !== id));
      },
      toggle(item: SelectionItem) {
        setItems((current) => toggleSelectionItems(current, item));
      },
      clear() {
        setItems([]);
        setCompareItems([]);
      },
      contains(id: string) {
        return items.some((item) => item.id === id);
      },
      toggleCompare,
      isCompared(id: string) {
        return compareItems.some((item) => item.id === id);
      },
      recordView,
      setRegion,
      dismissToast,
    }),
    [
      add,
      compareItems,
      dismissToast,
      items,
      open,
      recentItems,
      recordView,
      region,
      setRegion,
      toast,
      toggleCompare,
    ],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const value = useContext(SelectionContext);
  if (!value)
    throw new Error('useSelection must be used within SelectionProvider');
  return value;
}
