'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import Link from '@/components/static-link';
import { useLanguage } from '@/components/language-context';
import { usePromotionStore } from '@/components/promotion-provider';

export function PromotionCarousel() {
  const { language, copy } = useLanguage();
  const { promotions } = usePromotionStore();
  const railRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const visiblePromotions = promotions.filter(
    (promotion) => promotion.active && !promotion.hidden,
  );

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const rail = railRef.current;
      if (!rail) return;
      const slides = Array.from(
        rail.querySelectorAll<HTMLElement>('.home-promotion-slide'),
      );
      const slide = slides[index];
      if (!slide || !slides[0]) return;
      activeIndexRef.current = index;
      rail.scrollTo({
        left: slide.offsetLeft - slides[0].offsetLeft,
        behavior: reduceMotion ? 'auto' : behavior,
      });
    },
    [reduceMotion],
  );

  const pauseTemporarily = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 7000);
  }, []);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const next =
      (activeIndexRef.current + direction + visiblePromotions.length) %
      visiblePromotions.length;
    pauseTemporarily();
    scrollToIndex(next);
  };

  useEffect(() => {
    if (reduceMotion || visiblePromotions.length < 2) return;
    const interval = window.setInterval(() => {
      if (pausedRef.current) return;
      const next = (activeIndexRef.current + 1) % visiblePromotions.length;
      scrollToIndex(next);
    }, 4800);
    return () => window.clearInterval(interval);
  }, [reduceMotion, scrollToIndex, visiblePromotions.length]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    },
    [],
  );

  if (!visiblePromotions.length) return null;

  return (
    <section
      className="home-promotions"
      aria-labelledby="promotions-title"
      aria-roledescription="carousel"
    >
      <header className="home-promotions-header">
        <div>
          <p className="section-kicker">CUATESFARMZ / DROP</p>
          <h2 id="promotions-title">{copy.home.promotionsTitle}</h2>
        </div>
        <nav
          className="home-promotions-controls"
          aria-label={copy.home.promotionsTitle}
        >
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label={copy.home.previousPromotion}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label={copy.home.nextPromotion}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </nav>
      </header>
      <div
        ref={railRef}
        className="home-promotions-rail"
        onScroll={(event) => {
          const rail = event.currentTarget;
          const slides = Array.from(
            rail.querySelectorAll<HTMLElement>('.home-promotion-slide'),
          );
          if (!slides[0]) return;
          const firstOffset = slides[0].offsetLeft;
          activeIndexRef.current = slides.reduce(
            (closest, slide, index) =>
              Math.abs(slide.offsetLeft - firstOffset - rail.scrollLeft) <
              Math.abs(
                slides[closest].offsetLeft - firstOffset - rail.scrollLeft,
              )
                ? index
                : closest,
            0,
          );
        }}
      >
        {visiblePromotions.map((promotion) => (
          <Link
            key={promotion.slug}
            href={`/flower/${promotion.slug}`}
            prefetch={false}
            className="home-promotion-slide"
            aria-label={`${promotion.names[language]} — $${(
              promotion.priceCents / 100
            ).toFixed(2)}`}
            onMouseEnter={() => {
              pausedRef.current = true;
            }}
            onMouseLeave={() => {
              pausedRef.current = false;
            }}
            onFocus={() => {
              pausedRef.current = true;
            }}
            onBlur={() => {
              pausedRef.current = false;
            }}
            onPointerDown={(event) => {
              if (event.pointerType === 'touch') pauseTemporarily();
            }}
          >
            <span className="home-promotion-art">
              <Image
                src={promotion.image}
                alt={`${promotion.names[language]}: ${promotion.descriptions[language]}`}
                fill
                sizes="(max-width: 700px) 88vw, (max-width: 1200px) 58vw, 44vw"
              />
            </span>
            <span className="home-promotion-meta">
              <span>
                <b>{promotion.names[language]}</b>
                <small>{promotion.descriptions[language]}</small>
              </span>
              <strong>${(promotion.priceCents / 100).toFixed(2)}</strong>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
