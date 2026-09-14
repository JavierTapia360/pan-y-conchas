import type { Metadata } from 'next';
import { CatalogCartPage } from '@/components/catalog-cart-page';

export const metadata: Metadata = {
  title: 'Order Summary',
  description: 'Review your CUATESFARMZ Flower cart in this browser.',
  alternates: { canonical: '/cart' },
};

export default function Page() {
  return <CatalogCartPage />;
}
