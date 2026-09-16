import type { Metadata } from 'next';
import { ContactPage } from '@/components/contact-page';
export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact CUATESFARMZ through the local form or the official Telegram channel.',
  alternates: { canonical: '/contact' },
};
export default function Page() {
  return <ContactPage />;
}
