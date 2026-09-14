import { assets } from '@/data/assets';

export type MediaLibraryItem = {
  url: string;
  product: string;
  kind: 'image' | 'video';
  role: 'hero' | 'gallery' | 'mobile' | 'video';
};

export const mediaLibrary: MediaLibraryItem[] = [
  {
    url: assets.extras.desktopHero,
    product: 'home',
    kind: 'image',
    role: 'hero',
  },
  {
    url: assets.extras.mobileHero,
    product: 'home',
    kind: 'image',
    role: 'mobile',
  },
  ...Object.entries({
    skittles: assets.skittles,
    'jelly-donut': assets.jellyDonut,
    'frosted-fuel': assets.frostedFuel,
    'mac-1': assets.mac1,
  }).flatMap(([product, entry]) => [
    ...entry.images.map((url, index) => ({
      url,
      product,
      kind: 'image' as const,
      role: index === 0 ? ('hero' as const) : ('gallery' as const),
    })),
    ...('video' in entry && entry.video
      ? [
          {
            url: entry.video,
            product,
            kind: 'video' as const,
            role: 'video' as const,
          },
        ]
      : []),
  ]),
  ...assets.wax.images.map((url, index) => ({
    url,
    product: 'wax',
    kind: 'image' as const,
    role: index === 0 ? ('hero' as const) : ('gallery' as const),
  })),
];
