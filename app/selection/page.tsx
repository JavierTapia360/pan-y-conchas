import type { Metadata } from 'next';
import { SelectionPage } from '@/components/selection-page';

export const metadata: Metadata = {
  title: 'My selection',
  description:
    'A private, non-transactional list of CUATESFARMZ Flower and Wax catalog items.',
  alternates: { canonical: '/selection' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SelectionPage />;
}
