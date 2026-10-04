import type { Metadata } from 'next';
import { CatalogPage } from '@/components/catalog-page';

export const metadata: Metadata = {
  title: 'Exclusive Drop',
  description:
    'Explore the CUATESFARMZ Exclusive Drop. Availability subject to applicable law.',
  alternates: { canonical: '/flower' },
};
export default function FlowerPage() {
  return <CatalogPage />;
}
