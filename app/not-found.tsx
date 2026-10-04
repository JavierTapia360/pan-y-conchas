'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { useLanguage } from '@/components/language-context';
import { assets } from '@/data/assets';
export default function NotFound() {
  const { copy } = useLanguage();
  return (
    <main className="not-found">
      <Image
        src={assets.extras.logo}
        alt="CUATESFARMZ"
        width={1254}
        height={1254}
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
