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
  cardImage?: string;
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
    name: 'ZKITTLEZ',
    stocks: initialStocks(8),
    available: true,
    updatedAt: null,
    prices: { halfOz: 6499, oz: 11999, qp: 32250 },
    accent: 'candy',
    images: [assets.skittles.cover, ...assets.skittles.images.slice(1)],
    cardImage: assets.skittles.cover,
    video: assets.skittles.video,
    videoPoster: assets.skittles.cover,
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
    sortOrder: 2,
  },
  {
    slug: 'jelly-donut',
    name: 'JELLY DONUT',
    stocks: initialStocks(4),
    available: true,
    updatedAt: null,
    prices: { halfOz: 6499, oz: 11999, qp: 32250 },
    accent: 'pink',
    images: [assets.jellyDonut.cover, ...assets.jellyDonut.images.slice(1)],
    cardImage: assets.jellyDonut.cover,
    video: assets.jellyDonut.video,
    videoPoster: assets.jellyDonut.cover,
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
    images: [assets.frostedFuel.cover, ...assets.frostedFuel.images.slice(1)],
    cardImage: assets.frostedFuel.cover,
    video: assets.frostedFuel.video,
    videoPoster: assets.frostedFuel.cover,
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
    hidden: true,
    sortOrder: 3,
  },
  {
    slug: 'mac-1',
    name: 'MAC 1',
    stocks: initialStocks(12),
    available: true,
    updatedAt: null,
    prices: { halfOz: 6499, oz: 11999, qp: 32250 },
    accent: 'green',
    images: [assets.mac1.cover, ...assets.mac1.images.slice(1)],
    cardImage: assets.mac1.cover,
    video: assets.mac1.video,
    videoPoster: assets.mac1.cover,
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
    sortOrder: 0,
  },
  {
    slug: 'bubble-gum',
    name: 'BUBBLEGUM GELATO',
    stocks: initialStocks(10),
    available: true,
    updatedAt: null,
    prices: { halfOz: 5999, oz: 10499, qp: 28999 },
    accent: 'pink',
    images: assets.bubbleGum.images,
    cardImage: assets.bubbleGum.images[0],
    video: assets.bubbleGum.video,
    videoPoster: assets.bubbleGum.images[0],
    description: {
      en: 'Bubblegum color, a bold graphic cover, and close-up flower photography give this drop its own visual rhythm.',
      es: 'Color bubblegum, una portada gráfica contundente y fotografía floral de cerca marcan el ritmo visual de este drop.',
    },
    attributes: { en: [], es: [] },
    featured: true,
    hidden: false,
    sortOrder: 4,
  },
  {
    slug: 'cereal-milk',
    name: 'CEREAL MILK',
    stocks: initialStocks(10),
    available: true,
    updatedAt: null,
    prices: { halfOz: 5999, oz: 10499, qp: 28999 },
    accent: 'candy',
    images: assets.cerealMilk.images,
    cardImage: assets.cerealMilk.images[0],
    video: assets.cerealMilk.video,
    videoPoster: assets.cerealMilk.images[0],
    description: {
      en: 'A playful cereal-inspired cover meets a straightforward, detail-rich gallery of the flower itself.',
      es: 'Una portada inspirada en el cereal se une a una galería directa y llena de detalles de la flor.',
    },
    attributes: { en: [], es: [] },
    featured: true,
    hidden: false,
    sortOrder: 5,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
