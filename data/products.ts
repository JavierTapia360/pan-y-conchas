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
  videoPoster?: string;
  campaignImage?: string;
  description: { en: string; es: string };
  attributes: { en: readonly string[]; es: readonly string[] };
  featured: boolean;
  hidden: boolean;
  sortOrder: number;
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

// Single source of truth for the static storefront. Prices are stored in cents.
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
    videoPoster: assets.skittles.videoPoster,
    campaignImage: assets.skittles.campaignImage,
    description: {
      en: 'A color-forward CUATESFARMZ flower presentation with candy-pop energy and a bold editorial finish.',
      es: 'Una presentación floral CUATESFARMZ llena de color, energía candy-pop y un acabado editorial contundente.',
    },
    attributes: {
      en: ['INDICA', 'SWEET', 'RELAXING', 'HAPPY'],
      es: ['ÍNDICA', 'DULCE', 'RELAJANTE', 'ALEGRE'],
    },
    featured: true,
    hidden: false,
    sortOrder: 0,
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
    videoPoster: assets.jellyDonut.videoPoster,
    campaignImage: assets.jellyDonut.campaignImage,
    description: {
      en: 'Glossy reds, deep pinks and a dessert-inspired visual world give JELLY DONUT its unmistakable identity.',
      es: 'Rojos brillantes, rosas intensos y un universo visual inspirado en postres le dan a JELLY DONUT una identidad inconfundible.',
    },
    attributes: {
      en: ['HYBRID', 'CANDY', 'JOYFUL', 'RELAXING'],
      es: ['HÍBRIDA', 'CANDY', 'ALEGRÍA', 'RELAJANTE'],
    },
    featured: true,
    hidden: false,
    sortOrder: 1,
  },
  {
    slug: 'frosted-fuel',
    name: 'FROSTED FUEL',
    stocks: initialStocks(8),
    available: true,
    updatedAt: null,
    prices: { halfOz: 8000, oz: 17000, qp: 45000 },
    accent: 'ice',
    images: assets.frostedFuel.images,
    video: assets.frostedFuel.video,
    videoPoster: assets.frostedFuel.videoPoster,
    campaignImage: assets.frostedFuel.campaignImage,
    description: {
      en: 'An ice-cold visual direction pairs crisp blue light with the powerful CUATESFARMZ graphic language.',
      es: 'Una dirección visual helada combina luz azul nítida con el lenguaje gráfico contundente de CUATESFARMZ.',
    },
    attributes: {
      en: ['HYBRID', 'SWEET', 'EUPHORIA', 'RELAXATION', 'CREATIVITY'],
      es: ['HÍBRIDA', 'DULCE', 'EUFORIA', 'RELAJACIÓN', 'CREATIVIDAD'],
    },
    featured: true,
    hidden: false,
    sortOrder: 2,
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
    videoPoster: assets.mac1.videoPoster,
    campaignImage: assets.mac1.campaignImage,
    description: {
      en: 'Electric green cuts through a black-and-red foundation for a sharp, high-energy product portrait.',
      es: 'El verde eléctrico atraviesa una base negra y roja para crear un retrato de producto preciso y lleno de energía.',
    },
    attributes: {
      en: ['HYBRID', 'GAS / CANDY', 'EUPHORIA', 'HAPPY', 'CREATIVITY'],
      es: ['HÍBRIDA', 'GAS / CANDY', 'EUFORIA', 'ALEGRE', 'CREATIVIDAD'],
    },
    featured: true,
    hidden: false,
    sortOrder: 3,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
