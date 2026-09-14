import type { Metadata } from 'next';
import { AboutPage } from '@/components/about-page';
export const metadata: Metadata = {
  title: 'About',
  description: 'The visual world and culture of CUATESFARMZ.',
  alternates: { canonical: '/about' },
};
export default function Page() {
  return <AboutPage />;
}
