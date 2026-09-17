'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage } from '@/components/language-context';
import { assets } from '@/data/assets';
import { WaxPurchaseControl } from '@/components/wax-purchase-control';

export function WaxPage() {
  const { copy, language, siteSettings } = useLanguage();
  const [active, setActive] = useState(0);
  const getSetting = (key: string, fallback: string) =>
    siteSettings[key]?.[language] || fallback;
  const configuredHero = siteSettings.waxHero?.[language];
  const waxImages = configuredHero?.startsWith('/assets/')
    ? [
        configuredHero,
        ...assets.wax.images.filter((image) => image !== configuredHero),
      ]
    : [...assets.wax.images];
  return (
    <div className="wax-page">
      <SiteHeader />
      <main>
        <section className="wax-hero">
          <div>
            <p className="section-kicker">{copy.wax.kicker}</p>
            <h1>{copy.wax.title}</h1>
            <h2>{getSetting('waxHeadline', copy.wax.subtitle)}</h2>
            <p>{getSetting('waxBody', copy.wax.body)}</p>
            <WaxPurchaseControl />
          </div>
          <div className="wax-hero-image">
            <Image
              src={waxImages[0]}
              alt="CUATESFARMZ black and gold wax device"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 55vw"
            />
          </div>
        </section>
        <section className="wax-gallery">
          <div className="section-heading">
            <div>
              <p className="section-kicker">CUATESFARMZ / WAX</p>
              <h2>{copy.wax.gallery}</h2>
            </div>
            <p>{copy.wax.disclaimer}</p>
          </div>
          <div className="wax-main">
            <Image
              key={waxImages[active] || waxImages[0]}
              src={waxImages[active] || waxImages[0]}
              alt={`Wax device view ${active + 1}`}
              fill
              sizes="90vw"
            />
          </div>
          <div className="wax-thumbs">
            {waxImages.map((image, index) => (
              <button
                key={image}
                onClick={() => setActive(index)}
                className={index === active ? 'active' : ''}
                aria-label={`View wax image ${index + 1}`}
              >
                <Image src={image} alt="" fill sizes="140px" />
              </button>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
