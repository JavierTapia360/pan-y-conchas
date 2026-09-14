import type { MetadataRoute } from 'next';
import { products } from '@/data/products';

const origin = 'https://cuatesfarmz.estradajokabet380.chatgpt.site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/flower',
    '/wax',
    '/about',
    '/contact',
    '/cart',
    '/faq',
    '/merch',
    '/privacy',
    '/terms',
    '/21-plus',
  ];
  const visibleProducts = products.filter((product) => !product.hidden);
  return [
    ...routes.map((route) => ({
      url: `${origin}${route}`,
      changeFrequency:
        route === '' || route === '/flower'
          ? ('weekly' as const)
          : ('monthly' as const),
      priority: route === '' ? 1 : 0.7,
    })),
    ...visibleProducts.map((product) => ({
      url: `${origin}/flower/${product.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
