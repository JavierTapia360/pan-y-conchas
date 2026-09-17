'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/language-context';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Language } from '@/lib/language';

const languageMeta = {
  es: { flag: '🇲🇽', code: 'ES' },
  en: { flag: '🇺🇸', code: 'EN' },
} as const;

export function HeaderLanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const openScrollPosition = useRef(0);
  const { copy, language, setLanguage } = useLanguage();
  const active = languageMeta[language];

  useEffect(() => {
    if (!open) return;
    const focusFrame = window.requestAnimationFrame(() => {
      popoverRef.current
        ?.querySelector<HTMLElement>('[aria-checked="true"]')
        ?.focus({ preventScroll: true });
      window.scrollTo(0, openScrollPosition.current);
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [open]);

  const restoreTriggerWithoutScrolling = () => {
    const scrollPosition = openScrollPosition.current;
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus({ preventScroll: true });
      window.scrollTo(0, scrollPosition);
    });
  };

  const selectLanguage = (nextLanguage: Language) => {
    if (nextLanguage !== language) setLanguage(nextLanguage);
    setOpen(false);
    restoreTriggerWithoutScrolling();
  };

  return (
    <>
      <div
        className="language-switcher header-language-desktop"
        aria-label={copy.language.label}
      >
        <button
          type="button"
          className={language === 'es' ? 'active' : ''}
          aria-pressed={language === 'es'}
          onClick={() => selectLanguage('es')}
        >
          <span aria-hidden="true">🇲🇽</span> ES
        </button>
        <button
          type="button"
          className={language === 'en' ? 'active' : ''}
          aria-pressed={language === 'en'}
          onClick={() => selectLanguage('en')}
        >
          <span aria-hidden="true">🇺🇸</span> EN
        </button>
      </div>

      <div className="header-language-mobile">
        <Popover
          open={open}
          onOpenChange={(nextOpen, details) => {
            if (nextOpen) openScrollPosition.current = window.scrollY;
            setOpen(nextOpen);
            if (!nextOpen && details.reason === 'escape-key')
              restoreTriggerWithoutScrolling();
          }}
          modal={false}
        >
          <PopoverTrigger
            ref={triggerRef}
            className="header-language-trigger"
            aria-label={`${copy.language.label}: ${active.code}`}
            aria-haspopup="menu"
          >
            <span aria-hidden="true">{active.flag}</span>
            <b>{active.code}</b>
          </PopoverTrigger>
          <PopoverContent
            ref={popoverRef}
            className="header-language-popover"
            side="bottom"
            align="end"
            sideOffset={7}
            role="menu"
            aria-label={copy.language.select}
            initialFocus={false}
            finalFocus={false}
          >
            <button
              type="button"
              className={language === 'es' ? 'is-active' : ''}
              role="menuitemradio"
              aria-checked={language === 'es'}
              onClick={() => selectLanguage('es')}
            >
              <span>{copy.language.spanish}</span>
              <small>
                <span aria-hidden="true">🇲🇽</span> ES
              </small>
            </button>
            <button
              type="button"
              className={language === 'en' ? 'is-active' : ''}
              role="menuitemradio"
              aria-checked={language === 'en'}
              onClick={() => selectLanguage('en')}
            >
              <span>{copy.language.english}</span>
              <small>
                <span aria-hidden="true">🇺🇸</span> EN
              </small>
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
