'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage } from '@/components/language-context';
import { assets } from '@/data/assets';
import { Check, Plus, Scale } from 'lucide-react';
import {
  useSelection,
  waxSelectionItem,
} from '@/components/selection-provider';
import { track } from '@/lib/analytics';
import { MobileSelectionBar } from '@/components/mobile-selection-bar';
import { useEffect } from 'react';

export function WaxPage() {
  const { copy, language, siteSettings } = useLanguage();
  const [active, setActive] = useState(0);
  const { add, remove, contains, toggleCompare, isCompared, recordView } =
    useSelection();
  const selected = contains('wax:device');
  const compared = isCompared('wax:device');
  const selectionItem = useMemo(
    () => waxSelectionItem(copy.selection.waxName),
    [copy.selection.waxName],
  );
  const getSetting = (key: string, fallback: string) =>
    siteSettings[key]?.[language] || fallback;
  const configuredHero = siteSettings.waxHero?.[language];
  const waxImages = configuredHero?.startsWith('/assets/')
    ? [
        configuredHero,
        ...assets.wax.images.filter((image) => image !== configuredHero),
      ]
    : [...assets.wax.images];
  useEffect(() => {
    recordView(selectionItem);
  }, [recordView, selectionItem]);
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
            <button
              className={
                selected
                  ? 'button wax-selection-button selected'
                  : 'button wax-selection-button'
              }
              aria-pressed={selected}
              onClick={() => {
                if (selected) {
                  remove('wax:device');
                  track('selection_remove', { slug: 'wax', language });
                } else {
                  add({ ...selectionItem, image: waxImages[0] });
                  track('selection_add', { slug: 'wax', language });
                }
              }}
            >
              {selected ? (
                <Check aria-hidden="true" />
              ) : (
                <Plus aria-hidden="true" />
              )}
              {selected ? copy.selection.added : copy.selection.add}
            </button>
            <button
              className={
                compared
                  ? 'button wax-compare-button selected'
                  : 'button wax-compare-button'
              }
              aria-pressed={compared}
              onClick={() =>
                toggleCompare({ ...selectionItem, image: waxImages[0] })
              }
            >
              <Scale aria-hidden="true" />
              {compared ? copy.selection.comparing : copy.selection.addCompare}
            </button>
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
      <MobileSelectionBar item={{ ...selectionItem, image: waxImages[0] }} />
      <SiteFooter />
    </div>
  );
}
