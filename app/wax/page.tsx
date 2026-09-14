import type { Metadata } from 'next';
import { WaxPage } from '@/components/wax-page';
export const metadata: Metadata = {
  title: 'WAX',
  description: 'CUATESFARMZ WAX device visual catalog.',
  alternates: { canonical: '/wax' },
};
export default function Page() {
  return <WaxPage />;
}
