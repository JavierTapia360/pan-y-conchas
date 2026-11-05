import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { products } from '@/data/products';
import { getPromotion, promotions } from '@/data/promotion';
import { PromotionDetail } from '@/components/promotion-detail';

export function generateStaticParams() {
  return [
    ...products
      .filter((product) => !product.hidden)
      .map(({ slug }) => ({ slug })),
    ...promotions
      .filter((promotion) => promotion.active && !promotion.hidden)
      .map(({ slug }) => ({ slug })),
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const promotion = getPromotion(slug);
  if (promotion) {
    return {
      title: promotion.names.en,
      description: promotion.descriptions.en,
      alternates: { canonical: `/flower/${promotion.slug}` },
      openGraph: { images: [{ url: promotion.image }] },
    };
  }
  const product = products.find((item) => item.slug === slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.en,
    alternates: { canonical: `/flower/${product.slug}` },
    openGraph: {
      title: `${product.name} — CUATESFARMZ`,
      description: product.description.en,
      images: [{ url: product.images[0] }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — CUATESFARMZ`,
      description: product.description.en,
      images: [product.images[0]],
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promotion = getPromotion(slug);
  if (promotion) return <PromotionDetail slug={promotion.slug} />;
  const product = products.find((item) => item.slug === slug);
  if (!product || product.hidden) notFound();
  return <ProductDetail product={product} />;
}
