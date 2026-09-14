'use client';

import { useEffect } from 'react';

let lockCount = 0;

function updateLockClass() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('gf-scroll-locked', lockCount > 0);
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    updateLockClass();
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      updateLockClass();
    };
  }, [locked]);
}
