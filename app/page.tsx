'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ProductCard } from '@/components/product-card';
import { SectionReveal } from '@/components/section-reveal';
import { VideoModal } from '@/components/video-modal';
import { NewsletterForm } from '@/components/newsletter-form';
import { useLanguage } from '@/components/language-context';
import { assets } from '@/data/assets';
import { useCatalog } from '@/hooks/use-catalog';

export default function Home() {
  const { copy } = useLanguage();
  const catalog = useCatalog();
  const reduceMotion = useReducedMotion();
  const featured = catalog
    .filter((product) => product.featured && !product.hidden)
    .slice(0, 4);
  const filmProduct =
    catalog.find((product) => product.slug === 'skittles') || catalog[0];
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
            <p className="eyebrow">{copy.home.eyebrow}</p>
            <h1 id="hero-title">{copy.home.title}</h1>
            <p className="hero-subtitle">{copy.home.subtitle}</p>
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
              <Image src={categoryProduct.images[0]} alt="" fill sizes="50vw" />
            ) : null}
            <strong>FLOWER</strong>
          </Link>
          <Link prefetch={false} href="/wax">
            <Image src={assets.wax.images[0]} alt="" fill sizes="50vw" />
            <strong>WAX</strong>
          </Link>
        </section>

        <section className="section featured-section">
          <SectionReveal className="section-heading">
            <div>
              <p className="section-kicker">{copy.home.featuredKicker}</p>
              <h2>{copy.home.featured}</h2>
            </div>
            <p>{copy.home.featuredBody}</p>
          </SectionReveal>
          <div className="product-grid product-swipe">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          <div className="swipe-indicator" aria-hidden="true">
            <span />
          </div>
        </section>

        <section className="film-section">
          <SectionReveal className="film-copy">
            <p className="section-kicker">{copy.home.filmKicker}</p>
            <h2>{copy.home.filmTitle}</h2>
            {filmProduct?.video ? (
              <VideoModal
                src={filmProduct.video}
                poster={filmProduct.videoPoster || filmProduct.images[0]}
                label={`CUATESFARMZ ${filmProduct.name} film`}
              />
            ) : null}
          </SectionReveal>
          <SectionReveal className="film-visual">
            {filmProduct ? (
              <Image
                src={filmProduct.campaignImage || filmProduct.images[0]}
                alt={`${filmProduct.name} CUATESFARMZ campaign portrait`}
                fill
                sizes="(max-width: 800px) 100vw, 65vw"
              />
            ) : null}
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
          </div>
          <NewsletterForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
