import {
  hasAvailablePresentation,
  productPresentationOrder,
  products,
  type Product,
} from '@/data/products';

export const LOCAL_CATALOG_KEY = 'gf_catalog_local_v1';
export const LOCAL_CATALOG_EVENT = 'gf-catalog-local-change';

export const getDefaultCatalog = () =>
  products.map((product) => ({
    ...product,
    stocks: { ...product.stocks },
    prices: { ...product.prices },
    images: [...product.images],
    description: { ...product.description },
  }));

export function normalizeLocalProduct(
  value: unknown,
  fallback: Product,
): Product {
  if (!value || typeof value !== 'object') return fallback;
  const candidate = value as Partial<Product>;
  const stocks = Object.fromEntries(
    productPresentationOrder.map((key) => {
      const value = candidate.stocks?.[key];
      return [
        key,
        Number.isInteger(value) && Number(value) >= 0
          ? Number(value)
          : fallback.stocks[key],
      ];
    }),
  ) as Product['stocks'];
  const prices = Object.fromEntries(
    productPresentationOrder.map((key) => {
      const value = candidate.prices?.[key];
      return [
        key,
        value === null || (Number.isInteger(value) && Number(value) >= 0)
          ? value
          : fallback.prices[key],
      ];
    }),
  ) as Product['prices'];
  const images = Array.isArray(candidate.images)
    ? candidate.images.filter(
        (item): item is string => typeof item === 'string' && item.length > 0,
      )
    : [...fallback.images];

  return {
    ...fallback,
    name:
      typeof candidate.name === 'string' && candidate.name.trim()
        ? candidate.name.trim()
        : fallback.name,
    stocks,
    prices,
    available: hasAvailablePresentation(stocks),
    updatedAt:
      typeof candidate.updatedAt === 'string'
        ? candidate.updatedAt
        : fallback.updatedAt,
    images: images.length ? images : [...fallback.images],
    mobileImage:
      typeof candidate.mobileImage === 'string' &&
      images.includes(candidate.mobileImage)
        ? candidate.mobileImage
        : undefined,
    video:
      typeof candidate.video === 'string' && candidate.video
        ? candidate.video
        : undefined,
    description: {
      es:
        typeof candidate.description?.es === 'string' &&
        candidate.description.es.trim()
          ? candidate.description.es.trim()
          : fallback.description.es,
      en:
        typeof candidate.description?.en === 'string' &&
        candidate.description.en.trim()
          ? candidate.description.en.trim()
          : fallback.description.en,
    },
    featured:
      typeof candidate.featured === 'boolean'
        ? candidate.featured
        : fallback.featured,
    hidden:
      typeof candidate.hidden === 'boolean'
        ? candidate.hidden
        : fallback.hidden,
    sortOrder:
      Number.isInteger(candidate.sortOrder) && Number(candidate.sortOrder) >= 0
        ? Number(candidate.sortOrder)
        : fallback.sortOrder,
  };
}

export function readLocalCatalog(): Product[] {
  const defaults = getDefaultCatalog();
  if (typeof window === 'undefined') return defaults;
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(LOCAL_CATALOG_KEY) || '[]',
    ) as unknown;
    if (!Array.isArray(stored)) return defaults;
    const bySlug = new Map(
      stored
        .filter((entry): entry is Partial<Product> & { slug: string } =>
          Boolean(
            entry &&
            typeof entry === 'object' &&
            typeof (entry as Partial<Product>).slug === 'string',
          ),
        )
        .map((entry) => [entry.slug, entry]),
    );
    return defaults
      .map((fallback) =>
        normalizeLocalProduct(bySlug.get(fallback.slug), fallback),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return defaults;
  }
}

export function writeLocalCatalog(next: Product[]) {
  window.localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(LOCAL_CATALOG_EVENT));
}

export function resetLocalCatalog() {
  window.localStorage.removeItem(LOCAL_CATALOG_KEY);
  window.dispatchEvent(new Event(LOCAL_CATALOG_EVENT));
}
