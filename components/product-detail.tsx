'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/data/products';
import { useLanguage } from '@/components/language-provider';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { VideoModal } from '@/components/video-modal';
import { useCatalog } from '@/hooks/use-catalog';
import { ProductCard } from '@/components/product-card';
import { track } from '@/lib/analytics';
import { Check, Plus, Scale } from 'lucide-react';
import {
  productSelectionItem,
  useSelection,
} from '@/components/selection-provider';
import { RecentlyViewed } from '@/components/recently-viewed';
import { CatalogAddButton } from '@/components/catalog-add-button';
import { MobileCartBar } from '@/components/mobile-cart-bar';

export function ProductDetail({
  product: sourceProduct,
}: {
  product: Product;
}) {
  const router = useRouter();
  const liveCatalog = useCatalog();
  const catalog = liveCatalog.filter((item) => !item.hidden);
  const liveProduct = liveCatalog.find(
    (item) => item.slug === sourceProduct.slug,
  );
  const product =
    liveProduct && !liveProduct.hidden ? liveProduct : sourceProduct;
  const { copy, language } = useLanguage();
  const { add, remove, contains, toggleCompare, isCompared, recordView } =
    useSelection();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const lightboxDialog = useRef<HTMLDialogElement>(null);
  const lightboxTrigger = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const currentIndex = catalog.findIndex((item) => item.slug === product.slug);
  const related = catalog
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);
  const selectionId = `flower:${product.slug}`;
  const selected = contains(selectionId);
  const compared = isCompared(selectionId);
  const selectionItem = productSelectionItem(product);
  useEffect(() => {
    if (liveProduct?.hidden) router.replace('/flower');
  }, [liveProduct?.hidden, router]);
  useEffect(() => {
    const deviceType = window.matchMedia('(max-width: 700px)').matches
      ? 'mobile'
      : window.matchMedia('(max-width: 1100px)').matches
        ? 'tablet'
        : 'desktop';
    track('view_product', {
      slug: product.slug,
      language,
      device_type: deviceType,
    });
    recordView(productSelectionItem(product));
  }, [product, language, recordView]);
  useEffect(() => {
    if (!lightbox) return;
    const triggerNode = lightboxTrigger.current;
    const focusFrame = window.requestAnimationFrame(() =>
      lightboxDialog.current
        ?.querySelector<HTMLButtonElement>('.video-close')
        ?.focus(),
    );
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false);
      if (event.key === 'ArrowLeft')
        setActive(
          (value) =>
            (value - 1 + product.images.length) % product.images.length,
        );
      if (event.key === 'ArrowRight')
        setActive((value) => (value + 1) % product.images.length);
      if (event.key === 'Tab') {
        const items = [
          ...(lightboxDialog.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled])',
          ) || []),
        ];
        if (!items.length) return;
        const first = items[0];
        const last = items.at(-1)!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      triggerNode?.focus();
    };
  }, [lightbox, product.images.length]);
  const status =
    product.available === true
      ? copy.status.available
      : product.available === false
        ? copy.status.soldOut
        : copy.status.inquire;
  async function share() {
    const data = {
      title: `${product.name} — CUATESFARMZ`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus(language === 'es' ? 'ENLACE COPIADO' : 'LINK COPIED');
        window.setTimeout(() => setShareStatus(''), 2200);
      }
      track('share', { slug: product.slug, language });
    } catch {
      setShareStatus('');
    }
  }
  return (
    <div className={`product-page accent-${product.accent}`}>
      <SiteHeader />
      <main className="detail-layout">
        <section className="detail-gallery" aria-label={copy.product.gallery}>
          <button
            ref={lightboxTrigger}
            className="detail-main"
            onClick={() => setLightbox(true)}
            onTouchStart={(event) => {
              const touch = event.touches[0];
              touchStart.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current;
              const touch = event.changedTouches[0];
              touchStart.current = null;
              if (!start) return;
              const dx = touch.clientX - start.x;
              const dy = touch.clientY - start.y;
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
                setActive((value) =>
                  dx < 0
                    ? (value + 1) % product.images.length
                    : (value - 1 + product.images.length) %
                      product.images.length,
                );
                track('gallery_interaction', { slug: product.slug, language });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft')
                setActive(
                  (active - 1 + product.images.length) % product.images.length,
                );
              if (event.key === 'ArrowRight')
                setActive((active + 1) % product.images.length);
            }}
            style={{ viewTransitionName: `product-${product.slug}` }}
            aria-label={`Open ${product.name} image ${active + 1}`}
          >
            <picture>
              {active === 0 && product.mobileImage && (
                <source
                  media="(max-width: 700px)"
                  srcSet={product.mobileImage}
                />
              )}
              <Image
                key={product.images[active]}
                src={product.images[active]}
                alt={`${product.name} image ${active + 1}`}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 58vw"
              />
            </picture>
          </button>
          <div className="thumb-rail">
            {product.images.map((image, index) => (
              <button
                key={image}
                className={index === active ? 'active' : ''}
                onClick={() => {
                  setActive(index);
                  track('gallery_interaction', {
                    slug: product.slug,
                    language,
                  });
                }}
                aria-label={`View ${product.name} image ${index + 1}`}
              >
                <Image src={image} alt="" fill sizes="110px" />
              </button>
            ))}
          </div>
        </section>
        <aside className="detail-copy">
          <p className="section-kicker">
            {copy.product.details} / {product.slug}
          </p>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description[language]}</p>
          <div className="availability">
            <span>{copy.product.availability}</span>
            <strong>
              <i />
              {status}
            </strong>
          </div>
          <p className="catalog-note">{copy.product.note}</p>
          <div className="detail-actions">
            <CatalogAddButton
              product={product}
              className="detail-cart-button"
            />
            <button
              className={
                selected
                  ? 'button button-red selection-add-button selected'
                  : 'button button-red selection-add-button'
              }
              aria-pressed={selected}
              onClick={() => {
                if (selected) {
                  remove(selectionId);
                  track('selection_remove', { slug: product.slug, language });
                } else {
                  add(selectionItem);
                  track('selection_add', { slug: product.slug, language });
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
                  ? 'button button-outline selected'
                  : 'button button-outline'
              }
              aria-pressed={compared}
              onClick={() => toggleCompare(selectionItem)}
            >
              <Scale aria-hidden="true" />
              {compared ? copy.selection.comparing : copy.selection.addCompare}
            </button>
            <Link
              prefetch={false}
              className="button button-dark"
              href="/flower"
            >
              {copy.actions.backFlower}
            </Link>
            <Link
              prefetch={false}
              className="button button-outline"
              href="/contact"
            >
              {copy.actions.contact}
            </Link>
            <button className="button button-outline" onClick={share}>
              {language === 'es' ? 'Compartir' : 'Share'}
            </button>
          </div>
          <output className="share-status" aria-live="polite">
            {shareStatus}
          </output>
          {product.video && (
            <div className="detail-video">
              <p className="section-kicker">{copy.product.video}</p>
              <VideoModal
                src={product.video}
                poster={product.images[0]}
                label={`${product.name} film`}
                preview
              />
            </div>
          )}
          <nav className="detail-sequence" aria-label="Product sequence">
            {currentIndex > 0 && (
              <Link
                prefetch={false}
                href={`/flower/${catalog[currentIndex - 1].slug}`}
              >
                ← {language === 'es' ? 'Anterior' : 'Previous'}
              </Link>
            )}
            {currentIndex >= 0 && currentIndex < catalog.length - 1 && (
              <Link
                prefetch={false}
                href={`/flower/${catalog[currentIndex + 1].slug}`}
              >
                {language === 'es' ? 'Siguiente' : 'Next'} →
              </Link>
            )}
          </nav>
        </aside>
      </main>
      <section className="section related-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">CUATESFARMZ / FLOWER</p>
            <h2>
              {language === 'es' ? 'También puedes ver' : 'You may also like'}
            </h2>
          </div>
        </div>
        <div className="product-grid">
          {related.map((item, index) => (
            <ProductCard key={item.slug} product={item} index={index} />
          ))}
        </div>
      </section>
      <RecentlyViewed excludeId={selectionId} />
      {lightbox && (
        <dialog
          ref={lightboxDialog}
          open
          className="lightbox"
          aria-modal="true"
          aria-label={`${product.name} gallery`}
        >
          <button className="video-close" onClick={() => setLightbox(false)}>
            {copy.actions.closeGallery} ×
          </button>
          <button
            className="lightbox-prev"
            onClick={() =>
              setActive(
                (active - 1 + product.images.length) % product.images.length,
              )
            }
            aria-label="Previous image"
          >
            ←
          </button>
          <div>
            <Image
              src={product.images[active]}
              alt={`${product.name} enlarged image ${active + 1}`}
              fill
              sizes="100vw"
            />
          </div>
          <button
            className="lightbox-next"
            onClick={() => setActive((active + 1) % product.images.length)}
            aria-label="Next image"
          >
            →
          </button>
        </dialog>
      )}
      <nav className="mobile-product-nav" aria-label="Product shortcuts">
        <Link prefetch={false} href="/flower">
          ← {copy.actions.backFlower}
        </Link>
        <a href="#top">{copy.product.gallery}</a>
        {product.video && (
          <button
            onClick={() =>
              document
                .querySelector<HTMLButtonElement>(
                  '.detail-video .video-trigger',
                )
                ?.click()
            }
          >
            {copy.product.video}
          </button>
        )}
        <Link prefetch={false} href="/contact">
          {copy.actions.contact}
        </Link>
      </nav>
      <MobileCartBar product={product} />
      <SiteFooter />
    </div>
  );
}
