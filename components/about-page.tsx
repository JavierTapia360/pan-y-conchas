'use client';

import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage } from '@/components/language-context';
import { assets } from '@/data/assets';

export function AboutPage() {
  const { copy } = useLanguage();
  return (
    <>
      <SiteHeader />
      <main className="about-page">
        <header>
          <p className="section-kicker">{copy.about.kicker}</p>
          <h1>{copy.about.title}</h1>
          <p>{copy.about.lead}</p>
        </header>
        <div className="about-image">
          <Image
            src={assets.extras.desktopHero}
            alt="CUATESFARMZ brand campaign"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <section className="about-editorial">
          <p className="graffiti-note">{copy.about.note}</p>
          <div>
            <p>{copy.about.blockOne}</p>
            <p>{copy.about.blockTwo}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
