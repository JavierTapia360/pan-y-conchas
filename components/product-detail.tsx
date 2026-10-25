'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import type { Product } from '@/data/products';
import { useLanguage } from '@/components/language-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useCatalog } from '@/hooks/use-catalog';
import { track } from '@/lib/analytics';
import { CatalogAddButton } from '@/components/catalog-add-button';
import { MobileCartBar } from '@/components/mobile-cart-bar';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

export function ProductDetail({
  product: sourceProduct,
}: {
  product: Product;
}) {
  const liveCatalog = useCatalog();
  const liveProduct = liveCatalog.find(
    (item) => item.slug === sourceProduct.slug,
  );
  const product =
    liveProduct && !liveProduct.hidden ? liveProduct : sourceProduct;
  const { copy, language } = useLanguage();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const lightboxDialog = useRef<HTMLDialogElement>(null);
  const lightboxTrigger = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  useBodyScrollLock(lightbox);
  const mediaLength = product.images.length + (product.video ? 1 : 0);
  const activeIndex = active < mediaLength ? active : 0;
  const videoIndex = product.video ? product.images.length : -1;
  const videoActive = activeIndex === videoIndex;

  useEffect(() => {
    if (liveProduct?.hidden) window.location.replace('/flower');
  }, [liveProduct?.hidden]);

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
  }, [product.slug, language]);

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
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', onKey);
      triggerNode?.focus();
    };
  }, [lightbox, product.images.length]);

  useEffect(() => {
    if (!videoActive) {
      videoRef.current?.pause();
    }
  }, [videoActive]);

  useEffect(() => () => videoRef.current?.pause(), []);

  const status = product.available
    ? copy.status.available
    : copy.status.soldOut;

  function moveGallery(direction: -1 | 1) {
    setActive((value) => (value + direction + mediaLength) % mediaLength);
    track('gallery_interaction', { slug: product.slug, language });
  }

  function moveLightbox(direction: -1 | 1) {
    setActive(
      (value) =>
        (value + direction + product.images.length) % product.images.length,
    );
    track('gallery_interaction', { slug: product.slug, language });
  }

  return (
    <div className={`product-page accent-${product.accent}`}>
      <SiteHeader />
      <main className="detail-layout">
        <section className="detail-gallery" aria-label={copy.product.gallery}>
          <div
            className={`detail-main ${videoActive ? 'detail-main-video' : ''}`}
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
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
                moveGallery(dx < 0 ? 1 : -1);
            }}
            style={{ viewTransitionName: `product-${product.slug}` }}
          >
            {videoActive && product.video ? (
              <>
                <video
                  ref={videoRef}
                  key={product.video}
                  src={product.video}
                  poster={product.videoPoster || product.images[0]}
                  controls
                  playsInline
                  preload="metadata"
                  onLoadStart={() => setVideoState('loading')}
                  onCanPlay={() => setVideoState('ready')}
                  onError={() => setVideoState('error')}
                  onPlay={() =>
                    track('video_play', { slug: product.slug, language })
                  }
                  aria-label={`${product.name} ${copy.product.videoItem}`}
                >
                  <track
                    kind="captions"
                    src="/assets/video-captions.vtt"
                    srcLang={language}
                    label={language === 'es' ? 'Sin diálogo' : 'No dialogue'}
                    default
                  />
                </video>
                {videoState === 'loading' ? (
                  <span className="gallery-video-status">
                    {copy.product.videoLoading}
                  </span>
                ) : null}
                {videoState === 'error' ? (
                  <span className="gallery-video-error" role="alert">
                    {copy.actions.videoUnavailable}
                  </span>
                ) : null}
              </>
            ) : (
              <button
                ref={lightboxTrigger}
                type="button"
                className="detail-image-open"
                onClick={() => setLightbox(true)}
                aria-label={`${copy.product.gallery}: ${product.name}, ${activeIndex + 1}/${mediaLength}`}
              >
                <Image
                  key={product.images[activeIndex]}
                  src={product.images[activeIndex]}
                  alt={`${product.name} image ${activeIndex + 1}`}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 900px) 100vw, 58vw"
                />
              </button>
            )}
          </div>
          <div className="thumb-rail">
            {product.images.map((image, index) => (
              <button
                key={image}
                className={index === activeIndex ? 'active' : ''}
                onClick={() => {
                  setActive(index);
                  track('gallery_interaction', {
                    slug: product.slug,
                    language,
                  });
                }}
                aria-label={`${copy.product.gallery}: ${product.name}, ${index + 1}`}
              >
                <Image src={image} alt="" fill sizes="110px" />
              </button>
            ))}
            {product.video ? (
              <button
                className={`detail-video-thumb ${videoActive ? 'active' : ''}`}
                onClick={() => {
                  setActive(videoIndex);
                  track('gallery_interaction', {
                    slug: product.slug,
                    language,
                  });
                }}
                aria-label={`${copy.product.videoItem}: ${product.name}`}
              >
                <Image
                  src={product.videoPoster || product.images[0]}
                  alt=""
                  fill
                  sizes="110px"
                />
                <span>
                  <Play aria-hidden="true" />
                </span>
              </button>
            ) : null}
          </div>
        </section>

        <aside className="detail-copy">
          <Link className="detail-back-link" href="/flower" prefetch={false}>
            {copy.actions.backFlower}
          </Link>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description[language]}</p>
          {product.attributes[language].length > 0 && (
            <ul
              className="product-attributes"
              aria-label={copy.product.attributes}
            >
              {product.attributes[language].map((attribute) => (
                <li key={attribute}>{attribute}</li>
              ))}
            </ul>
          )}
          <div className="availability">
            <span>{copy.product.availability}</span>
            <strong>
              <i />
              {status}
            </strong>
          </div>
          <CatalogAddButton product={product} className="detail-cart-button" />
        </aside>
      </main>

      {lightbox && (
        <dialog
          ref={lightboxDialog}
          open
          className="lightbox"
          aria-modal="true"
          aria-label={`${product.name} gallery`}
        >
          <button
            className="video-close"
            onClick={() => setLightbox(false)}
            aria-label={copy.actions.closeGallery}
          >
            <X aria-hidden="true" />
          </button>
          <button
            className="lightbox-prev"
            onClick={() => moveLightbox(-1)}
            aria-label="Previous image"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div>
            <Image
              src={product.images[activeIndex]}
              alt={`${product.name} enlarged image ${activeIndex + 1}`}
              fill
              sizes="100vw"
            />
          </div>
          <button
            className="lightbox-next"
            onClick={() => moveLightbox(1)}
            aria-label="Next image"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </dialog>
      )}
      <MobileCartBar product={product} />
      <SiteFooter />
    </div>
  );
}
