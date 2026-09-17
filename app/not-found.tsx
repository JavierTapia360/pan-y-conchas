'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { useLanguage } from '@/components/language-context';
export default function NotFound() {
  const { copy } = useLanguage();
  return (
    <main className="not-found">
      <Image
        src="/assets/cuatesfarmz-logo-c.png"
        alt="CUATESFARMZ"
        width={360}
        height={120}
      />
      <b>404</b>
      <h1>{copy.notFound.title}</h1>
      <p>{copy.notFound.body}</p>
      <Link prefetch={false} href="/" className="button button-red">
        {copy.notFound.action}
      </Link>
    </main>
  );
}
