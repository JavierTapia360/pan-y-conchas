'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { motion, useReducedMotion } from 'motion/react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SectionReveal } from '@/components/section-reveal';
import { NewsletterForm } from '@/components/newsletter-form';
import { useLanguage } from '@/components/language-context';
import { assets } from '@/data/assets';
import { useCatalog } from '@/hooks/use-catalog';
import { promotionDefaults } from '@/data/promotion';

export default function Home() {
  const { copy, language } = useLanguage();
  const catalog = useCatalog();
  const reduceMotion = useReducedMotion();
  const categoryProduct =
    catalog.find((product) => !product.hidden && product.featured) ||
    catalog[0];
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-media">
            <picture>
              <source
                media="(max-width: 680px)"
                srcSet={assets.extras.mobileHero.replaceAll(' ', '%20')}
              />
              <Image
                src={assets.extras.desktopHero}
                alt={copy.home.heroAlt}
                fill
                priority
                sizes="100vw"
                className="hero-image"
              />
            </picture>
          </div>
          <div className="hero-shade" />
          <motion.div
            className="hero-copy"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sr-only">
              <p className="eyebrow">{copy.home.eyebrow}</p>
              <h1 id="hero-title">{copy.home.title}</h1>
              <p className="hero-subtitle">{copy.home.subtitle}</p>
            </div>
            <div className="hero-actions">
              <Link
                prefetch={false}
                href="/flower"
                className="button button-red"
              >
                {copy.home.flowerCta}
              </Link>
              <Link
                prefetch={false}
                href="/wax"
                className="button button-ghost"
              >
                {copy.home.waxCta}
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="category-strip" aria-label={copy.home.categories}>
          <Link prefetch={false} href="/flower">
            {categoryProduct ? (
              <Image
                src={categoryProduct.cardImage || categoryProduct.images[0]}
                alt=""
                fill
                sizes="50vw"
              />
            ) : null}
            <strong>{copy.nav.flower}</strong>
          </Link>
          <Link prefetch={false} href="/wax">
            <Image src={assets.wax.images[0]} alt="" fill sizes="50vw" />
            <span>{copy.status.comingSoon}</span>
            <strong>WAX</strong>
          </Link>
        </section>

        <section className="film-section film-offer-section">
          <SectionReveal className="film-copy">
            <p className="section-kicker">{copy.home.filmKicker}</p>
            <h2>{copy.home.filmTitle}</h2>
            <figure className="brand-chase-accent">
              <Image
                src={assets.extras.chaseDecoration}
                alt=""
                width={1254}
                height={1254}
              />
              <figcaption>{copy.home.cloudLine}</figcaption>
            </figure>
          </SectionReveal>
          <SectionReveal className="film-visual film-offer-visual">
            <Link
              prefetch={false}
              href={`/flower/${promotionDefaults.slug}`}
              className="film-offer-link"
              aria-label={copy.actions.viewPromotion}
            >
              <Image
                src={promotionDefaults.image}
                alt={`${promotionDefaults.names[language]}: ${promotionDefaults.descriptions[language]}`}
                fill
                sizes="(max-width: 800px) 100vw, 65vw"
              />
            </Link>
          </SectionReveal>
        </section>

        <section className="wax-teaser">
          <div className="wax-photo">
            <Image
              src={assets.wax.images[1]}
              alt="Black and gold wax device"
              fill
              sizes="(max-width: 800px) 100vw, 58vw"
            />
          </div>
          <SectionReveal className="wax-copy">
            <p className="section-kicker">{copy.home.waxKicker}</p>
            <h2>{copy.home.waxTitle}</h2>
            <p>{copy.home.waxBody}</p>
            <Link prefetch={false} href="/wax" className="text-link">
              {copy.home.waxCta}
            </Link>
          </SectionReveal>
        </section>

        <section className="brand-statement">
          <p className="graffiti-note">{copy.home.brandLine}</p>
          <SectionReveal>
            <h2>
              CUATES
              <br />
              FARMZ
            </h2>
            <p>{copy.home.brandBody}</p>
          </SectionReveal>
        </section>

        <section className="newsletter-section">
          <div>
            <p className="section-kicker">CUATESFARMZ / MAIL</p>
            <h2>{copy.home.newsletterTitle}</h2>
            <p>{copy.home.newsletterBody}</p>
            <figure className="brand-flight-accent">
              <Image
                src={assets.extras.planeDecoration}
                alt=""
                width={1421}
                height={1107}
              />
              <figcaption>{copy.home.planeLine}</figcaption>
            </figure>
          </div>
          <NewsletterForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
