'use client';

import { useEffect } from 'react';

const activeLocks = new Set<symbol>();
let savedScrollY = 0;
let lockedLocation = '';

function updateLockClass() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(
    'gf-scroll-locked',
    activeLocks.size > 0,
  );
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const token = Symbol('body-scroll-lock');
    if (activeLocks.size === 0) {
      savedScrollY = window.scrollY;
      lockedLocation = window.location.href;
    }
    activeLocks.add(token);
    updateLockClass();
    const release = () => {
      activeLocks.delete(token);
      updateLockClass();
      if (activeLocks.size === 0 && window.location.href === lockedLocation) {
        window.requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
      }
    };
    window.addEventListener('pagehide', release, { once: true });
    return () => {
      window.removeEventListener('pagehide', release);
      release();
    };
  }, [locked]);
}
