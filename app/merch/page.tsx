import type { Metadata } from 'next';
import { MerchPage } from '@/components/merch-page';
export const metadata: Metadata = {
  title: 'Merch',
  description:
    'Conventional CUATESFARMZ merchandise. Flower and Wax are excluded from commerce.',
  alternates: { canonical: '/merch' },
};
export default function Page() {
  return <MerchPage />;
}
