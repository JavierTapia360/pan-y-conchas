import type { Metadata } from 'next';
import { CatalogPage } from '@/components/catalog-page';

export const metadata: Metadata = {
  title: 'Flower',
  description:
    'Explore the CUATESFARMZ flower catalog. Availability subject to applicable law.',
  alternates: { canonical: '/flower' },
};
export default function FlowerPage() {
  return <CatalogPage />;
}
