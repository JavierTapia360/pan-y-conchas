'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { waxProduct } from '@/data/wax';
import {
  LOCAL_WAX_EVENT,
  LOCAL_WAX_KEY,
  readLocalWaxSettings,
} from '@/lib/local-wax';

export function useWaxProduct() {
  const [available, setAvailable] = useState(waxProduct.available);
  const refresh = useCallback(
    () => setAvailable(readLocalWaxSettings().available),
    [],
  );

  useEffect(() => {
    queueMicrotask(refresh);
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_WAX_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(LOCAL_WAX_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(LOCAL_WAX_EVENT, refresh);
    };
  }, [refresh]);

  return useMemo(() => ({ ...waxProduct, available }), [available]);
}
