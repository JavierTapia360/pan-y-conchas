import type { Metadata } from 'next';
import { FaqPage } from '@/components/faq-page';
export const metadata: Metadata = {
  title: 'FAQ',
  description: 'General CUATESFARMZ website information.',
  alternates: { canonical: '/faq' },
};
export default function Page() {
  return <FaqPage />;
}
