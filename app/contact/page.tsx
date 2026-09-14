import type { Metadata } from 'next';
import { ContactPage } from '@/components/contact-page';
export const metadata: Metadata = { title: 'Contact', description: 'General contact for CUATESFARMZ. This form is not for orders.', alternates: { canonical: '/contact' } };
export default function Page() { return <ContactPage />; }
