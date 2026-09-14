import { assets } from '@/data/assets';

export type Product = {
  slug: string;
  name: string;
  stocks: ProductStocks;
  available: boolean;
  updatedAt: string | null;
  prices: ProductPrices;
  accent: 'candy' | 'pink' | 'ice' | 'green';
  images: readonly string[];
  mobileImage?: string;
  video?: string;
  description: { en: string; es: string };
};

export const productPresentationOrder = ['halfOz', 'oz', 'qp'] as const;
export const adminPresentationOrder = ['qp', 'oz', 'halfOz'] as const;
export type ProductPresentation = (typeof productPresentationOrder)[number];
export type ProductPrices = Record<ProductPresentation, number | null>;
export type ProductStocks = Record<ProductPresentation, number>;

export const productPresentationLabels: Record<ProductPresentation, string> = {
  qp: 'QP',
  oz: 'Oz',
  halfOz: '1/2 Oz',
};

export const hasAvailablePresentation = (stocks: ProductStocks) =>
  productPresentationOrder.some((presentation) => stocks[presentation] > 0);

const initialStocks = (stock: number): ProductStocks => ({
  halfOz: stock,
  oz: stock,
  qp: stock,
});

// These are the launch fallbacks. Admin inventory rows override them without a code change.
// Prices are launch fallbacks in cents. D1 inventory rows override them.
export const products: Product[] = [
  {
    slug: 'skittles',
    name: 'SKITTLES',
    stocks: initialStocks(8),
    available: true,
    updatedAt: null,
    prices: { halfOz: 9000, oz: 18000, qp: 47000 },
    accent: 'candy',
    images: assets.skittles.images,
    video: assets.skittles.video,
    description: {
      en: 'A color-forward CUATESFARMZ flower presentation with candy-pop energy and a bold editorial finish.',
      es: 'Una presentación floral CUATESFARMZ llena de color, energía candy-pop y un acabado editorial contundente.',
    },
  },
  {
    slug: 'jelly-donut',
    name: 'JELLY DONUT',
    stocks: initialStocks(4),
    available: true,
    updatedAt: null,
    prices: { halfOz: 9000, oz: 18000, qp: 47000 },
    accent: 'pink',
    images: assets.jellyDonut.images,
    video: assets.jellyDonut.video,
    description: {
      en: 'Glossy reds, deep pinks and a dessert-inspired visual world give JELLY DONUT its unmistakable identity.',
      es: 'Rojos brillantes, rosas intensos y un universo visual inspirado en postres le dan a JELLY DONUT una identidad inconfundible.',
    },
  },
  {
    slug: 'frosted-fuel',
    name: 'FROSTED FUEL',
    stocks: initialStocks(0),
    available: false,
    updatedAt: null,
    prices: { halfOz: 8000, oz: 17000, qp: 45000 },
    accent: 'ice',
    images: assets.frostedFuel.images,
    video: assets.frostedFuel.video,
    description: {
      en: 'An ice-cold visual direction pairs crisp blue light with the powerful CUATESFARMZ graphic language.',
      es: 'Una dirección visual helada combina luz azul nítida con el lenguaje gráfico contundente de CUATESFARMZ.',
    },
  },
  {
    slug: 'mac-1',
    name: 'MAC 1',
    stocks: initialStocks(12),
    available: true,
    updatedAt: null,
    prices: { halfOz: 11000, oz: 20000, qp: 52000 },
    accent: 'green',
    images: assets.mac1.images,
    video: assets.mac1.video,
    description: {
      en: 'Electric green cuts through a black-and-red foundation for a sharp, high-energy product portrait.',
      es: 'El verde eléctrico atraviesa una base negra y roja para crear un retrato de producto preciso y lleno de energía.',
    },
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
