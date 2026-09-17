import { assets } from '@/data/assets';

export const waxPresentationOrder = [
  'pieces5',
  'pieces10',
  'pieces25',
] as const;

export type WaxPresentation = (typeof waxPresentationOrder)[number];

export const waxProduct = {
  kind: 'wax' as const,
  slug: 'wax',
  name: 'WAX',
  href: '/wax',
  images: assets.wax.images,
  available: true,
  hidden: false,
  inventoryMode: 'availability' as const,
  prices: {
    pieces5: 10000,
    pieces10: 19000,
    pieces25: 35000,
  },
  perPiecePrices: {
    pieces5: 2000,
    pieces10: 1900,
    pieces25: 1400,
  },
};
