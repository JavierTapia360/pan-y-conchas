'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '@/components/language-provider';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

const STORAGE_KEY = 'age_verified_v1';
const ALTERNATE_STORAGE_KEY = 'gf_age_v1';

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const [refused, setRefused] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const primaryAction = useRef<HTMLButtonElement>(null);
  const { copy, language } = useLanguage();
  const reduceMotion = useReducedMotion();
  useBodyScrollLock(open);
  useEffect(() => {
    let shouldOpen = true;
    try {
      shouldOpen =
        window.localStorage.getItem(STORAGE_KEY) !== 'true' &&
        window.localStorage.getItem(ALTERNATE_STORAGE_KEY) !== 'true';
    } catch {
      /* Keep the gate visible when storage is blocked. */
    }
    queueMicrotask(() => setOpen(shouldOpen));
  }, []);
  useEffect(() => {
    if (!open) return;
    const focusFrame = window.requestAnimationFrame(() =>
      primaryAction.current?.focus(),
    );
    const focusables = () => [
      ...(panel.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href]',
      ) || []),
    ];
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list.at(-1)!;
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
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, refused]);
  return (
    <AnimatePresence>
      {open && (
        <motion.dialog
          open
          className="age-backdrop"
          aria-modal="true"
          aria-labelledby="age-title"
          aria-describedby="age-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={panel}
            className="age-panel"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/assets/cuatesfarmz-logo-c.webp"
              alt="CUATESFARMZ"
              width={390}
              height={130}
              priority
            />
            <p className="eyebrow">{copy.gate.eyebrow}</p>
            {refused ? (
              <>
                <h2 id="age-title">
                  {language === 'es'
                    ? 'Acceso restringido.'
                    : 'Access restricted.'}
                </h2>
                <p id="age-description">
                  {language === 'es'
                    ? 'Este contenido está destinado únicamente a personas mayores de 21 años.'
                    : 'This content is intended only for people age 21 or older.'}
                </p>
                <button
                  ref={primaryAction}
                  className="button button-outline"
                  onClick={() => setRefused(false)}
                >
                  {language === 'es' ? 'Volver' : 'Go back'}
                </button>
              </>
            ) : (
              <>
                <h2 id="age-title">{copy.gate.title}</h2>
                <p id="age-description">{copy.gate.body}</p>
                <div className="age-actions">
                  <button
                    ref={primaryAction}
                    id="age-enter"
                    className="button button-red"
                    onClick={() => {
                      try {
                        window.localStorage.setItem(STORAGE_KEY, 'true');
                        window.localStorage.setItem(
                          ALTERNATE_STORAGE_KEY,
                          'true',
                        );
                      } catch {
                        /* Entry still works for this page view. */
                      }
                      setOpen(false);
                    }}
                  >
                    {copy.gate.enter}
                  </button>
                  <button
                    className="button button-outline"
                    onClick={() => setRefused(true)}
                  >
                    {copy.gate.leave}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}
