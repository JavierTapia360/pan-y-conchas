import {
  productPresentationLabels,
  productPresentationOrder,
  type Product,
  type ProductPresentation,
} from '@/data/products';
import { waxPresentationOrder, type WaxPresentation } from '@/data/wax';
import type { Language } from '@/lib/language';
import {
  PROMOTION_PRESENTATION,
  type PromotionSettings,
} from '@/data/promotion';

export type CatalogPresentation =
  | ProductPresentation
  | WaxPresentation
  | typeof PROMOTION_PRESENTATION;

export type CatalogCartProduct = {
  kind: 'flower' | 'wax' | 'bundle';
  slug: string;
  name: string;
  href: string;
  images: readonly string[];
  available: boolean;
  hidden: boolean;
  inventoryMode: 'numeric' | 'availability';
  prices: Partial<Record<CatalogPresentation, number | null>>;
  stocks?: Partial<Record<CatalogPresentation, number>>;
};

export const catalogPresentationOrder: readonly CatalogPresentation[] = [
  ...productPresentationOrder,
  ...waxPresentationOrder,
  PROMOTION_PRESENTATION,
];

export function isCatalogPresentation(
  value: unknown,
): value is CatalogPresentation {
  return catalogPresentationOrder.includes(value as CatalogPresentation);
}

export function toCatalogCartProduct(product: Product): CatalogCartProduct {
  return {
    kind: 'flower',
    slug: product.slug,
    name: product.name,
    href: `/flower/${product.slug}`,
    images: product.images,
    available: product.available,
    hidden: product.hidden,
    inventoryMode: 'numeric',
    prices: product.prices,
    stocks: product.stocks,
  };
}

export function isPromotionComponentsAvailable(
  promotion: PromotionSettings,
  products: readonly Product[],
) {
  return promotion.components.every((component) => {
    const product = products.find((item) => item.slug === component.slug);
    return Boolean(
      product &&
      !product.hidden &&
      product.available &&
      product.stocks[component.presentation] > 0,
    );
  });
}

export function toPromotionCartProduct(
  promotion: PromotionSettings,
  language: Language,
  products: readonly Product[],
): CatalogCartProduct {
  return {
    kind: 'bundle',
    slug: promotion.slug,
    name: promotion.names[language],
    href: `/flower/${promotion.slug}`,
    images: [promotion.image],
    available:
      promotion.active &&
      promotion.available &&
      isPromotionComponentsAvailable(promotion, products),
    hidden: promotion.hidden || !promotion.active,
    inventoryMode: 'availability',
    prices: { [PROMOTION_PRESENTATION]: promotion.priceCents },
  };
}

export function getCatalogPresentationLabel(
  presentation: CatalogPresentation,
  language: Language,
) {
  if (presentation in productPresentationLabels)
    return productPresentationLabels[presentation as ProductPresentation];
  if (presentation === PROMOTION_PRESENTATION)
    return language === 'es' ? 'PAQUETE' : 'BUNDLE';
  const pieces: Record<WaxPresentation, number> = {
    pieces5: 5,
    pieces10: 10,
    pieces25: 25,
  };
  return `${pieces[presentation as WaxPresentation]} ${
    language === 'es' ? 'PIEZAS' : 'PIECES'
  }`;
}

export function getCatalogPrice(
  product: Pick<CatalogCartProduct, 'prices'>,
  presentation: CatalogPresentation,
) {
  return product.prices[presentation] ?? null;
}

export function getCatalogStockLimit(
  product: Pick<CatalogCartProduct, 'inventoryMode' | 'stocks' | 'available'>,
  presentation: CatalogPresentation,
) {
  if (product.inventoryMode === 'availability') return null;
  return Math.max(0, product.stocks?.[presentation] ?? 0);
}

export function isCatalogPresentationAvailable(
  product: Pick<
    CatalogCartProduct,
    'inventoryMode' | 'stocks' | 'available' | 'hidden'
  >,
  presentation: CatalogPresentation,
) {
  if (product.hidden || !product.available) return false;
  const limit = getCatalogStockLimit(product, presentation);
  return limit === null || limit > 0;
}
