'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/language-context';
import { CatalogCartDrawer } from '@/components/catalog-cart-drawer';
import { HeaderLanguageSwitcher } from '@/components/header-language-switcher';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { assets } from '@/data/assets';

const announcementCopies = Array.from({ length: 6 });

function AnnouncementTicker({ message }: { message: string }) {
  return (
    <div className="announcement">
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
      <div className="announcement-track" key={message} aria-hidden="true">
        {[0, 1].map((group) => (
          <div className="announcement-group" key={group}>
            {announcementCopies.map((_, index) => (
              <span className="announcement-item" key={index}>
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuPanel = useRef<HTMLDialogElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const menuClose = useRef<HTMLButtonElement>(null);
  const { copy, setLanguage } = useLanguage();
  const pathname = usePathname();
  useBodyScrollLock(menuOpen);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const trigger = menuTrigger.current;
    const focusFrame = window.requestAnimationFrame(() =>
      menuClose.current?.focus(),
    );
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = [
        ...(menuPanel.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href]',
        ) || []),
      ];
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', onKey);
      window.requestAnimationFrame(() => trigger?.focus());
    };
  }, [menuOpen]);
  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);
  const nav = [
    ['/', copy.nav.home],
    ['/flower', copy.nav.flower],
    ['/wax', copy.nav.wax],
    ['/about', copy.nav.about],
    ['/contact', copy.nav.contact],
  ];
  return (
    <>
      <AnnouncementTicker message={copy.announcement} />
      <header className={scrolled ? 'site-header is-scrolled' : 'site-header'}>
        <button
          ref={menuTrigger}
          className="menu-button"
          onClick={() => setMenuOpen(true)}
          aria-label={copy.nav.menu}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
        >
          <span />
          <span />
          <b>MENU</b>
        </button>
        <Link
          prefetch={false}
          href="/"
          className="brand"
          aria-label="CUATESFARMZ home"
        >
          <Image
            src={assets.extras.logo}
            alt="CUATESFARMZ"
            width={1254}
            height={1254}
            priority
          />
        </Link>
        <div className="header-actions">
          <CatalogCartDrawer />
          <HeaderLanguageSwitcher />
          <Link prefetch={false} className="contact-link" href="/contact">
            {copy.nav.contact}
          </Link>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <motion.dialog
            open
            ref={menuPanel}
            id="site-menu"
            aria-modal="true"
            aria-label={copy.nav.menu}
            className="menu-overlay"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="menu-top">
              <Image
                src={assets.extras.logo}
                alt="CUATESFARMZ"
                width={1254}
                height={1254}
              />
              <button
                ref={menuClose}
                onClick={() => setMenuOpen(false)}
                aria-label={copy.nav.close}
              >
                {copy.nav.close} ×
              </button>
            </div>
            <nav aria-label="Primary navigation">
              {nav.map(([href, label], index) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + index * 0.07 }}
                >
                  <Link
                    prefetch={false}
                    href={href}
                    aria-current={
                      pathname === href ||
                      (href !== '/' && pathname.startsWith(href))
                        ? 'page'
                        : undefined
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="menu-bottom">
              <p>{copy.announcement}</p>
              <div className="language-switcher">
                <button onClick={() => setLanguage('es')}>🇲🇽 ES</button>
                <button onClick={() => setLanguage('en')}>🇺🇸 EN</button>
              </div>
            </div>
          </motion.dialog>
        )}
      </AnimatePresence>
    </>
  );
}
