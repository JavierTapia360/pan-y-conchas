import { products } from '@/data/products';

export type MediaLibraryItem = {
  url: string;
  product: string;
  kind: 'image' | 'video';
  role: 'hero' | 'gallery' | 'mobile' | 'video';
};

export const mediaLibrary: MediaLibraryItem[] = products.flatMap((product) => [
  ...product.images.map((url, index) => ({
    url,
    product: product.slug,
    kind: 'image' as const,
    role: index === 0 ? ('hero' as const) : ('gallery' as const),
  })),
  ...(product.video
    ? [
        {
          url: product.video,
          product: product.slug,
          kind: 'video' as const,
          role: 'video' as const,
        },
      ]
    : []),
]);
