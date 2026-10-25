'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import {
  AGE_ALTERNATE_STORAGE_KEY,
  AGE_STORAGE_KEY,
  AGE_VERIFIED_EVENT,
} from '@/components/age-gate';
import { useLanguage } from '@/components/language-context';
import { usePromotionStore } from '@/components/promotion-provider';
import { useCatalog } from '@/hooks/use-catalog';
import { isPromotionComponentsAvailable } from '@/data/catalog-cart';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { shouldShowPromotion } from '@/lib/promotion-visibility';

export const PROMOTION_SESSION_KEY = 'gf_promo_seen_session_v1';

export function PromotionModal() {
  const { language } = useLanguage();
  const { promotion } = usePromotionStore();
  const products = useCatalog();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  useBodyScrollLock(open);

  const componentsAvailable = isPromotionComponentsAvailable(
    promotion,
    products,
  );

  useEffect(() => {
    const evaluate = () => {
      let ageVerified = false;
      let seen = false;
      try {
        ageVerified =
          window.localStorage.getItem(AGE_STORAGE_KEY) === 'true' ||
          window.localStorage.getItem(AGE_ALTERNATE_STORAGE_KEY) === 'true';
        seen = window.sessionStorage.getItem(PROMOTION_SESSION_KEY) === 'true';
      } catch {
        /* The promotion still follows the in-memory session. */
      }
      if (
        shouldShowPromotion({
          ageVerified,
          seen,
          active: promotion.active,
          available: promotion.available && componentsAvailable,
          hidden: promotion.hidden,
        })
      ) {
        try {
          window.sessionStorage.setItem(PROMOTION_SESSION_KEY, 'true');
        } catch {
          /* Session storage is optional. */
        }
        previousFocus.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }
    };
    const frame = window.requestAnimationFrame(evaluate);
    window.addEventListener(AGE_VERIFIED_EVENT, evaluate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(AGE_VERIFIED_EVENT, evaluate);
    };
  }, [
    componentsAvailable,
    promotion.active,
    promotion.available,
    promotion.hidden,
  ]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const focusable = () => [
      ...(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href]',
      ) || []),
    ];
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      previousFocus.current?.focus();
    };
  }, [open]);

  const closeLabel = language === 'es' ? 'CERRAR' : 'CLOSE';
  const viewLabel = language === 'es' ? 'VER PROMOCIÓN' : 'VIEW OFFER';

  return (
    <AnimatePresence>
      {open ? (
        <motion.dialog
          ref={dialogRef}
          open
          className="promotion-dialog"
          aria-modal="true"
          aria-labelledby="promotion-dialog-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="promotion-dialog-panel"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              ref={closeRef}
              type="button"
              className="promotion-dialog-close"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
            >
              <X aria-hidden="true" />
            </button>
            <Image
              src={promotion.image}
              alt={`${promotion.names[language]}: ${promotion.descriptions[language]}`}
              width={1254}
              height={1254}
              priority
            />
            <div className="promotion-dialog-copy">
              <p>
                {language === 'es'
                  ? 'OFERTA POR TIEMPO LIMITADO'
                  : 'LIMITED-TIME OFFER'}
              </p>
              <h2 id="promotion-dialog-title">{promotion.names[language]}</h2>
              <span>{promotion.descriptions[language]}</span>
              <nav>
                <Link
                  className="button button-red"
                  href={`/flower/${promotion.slug}`}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                >
                  {viewLabel}
                </Link>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setOpen(false)}
                >
                  {closeLabel}
                </button>
              </nav>
            </div>
          </motion.div>
        </motion.dialog>
      ) : null}
    </AnimatePresence>
  );
}
