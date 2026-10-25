'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { promotionDefaults, type PromotionSettings } from '@/data/promotion';
import {
  LOCAL_PROMOTION_EVENT,
  LOCAL_PROMOTION_KEY,
  readLocalPromotion,
  writeLocalPromotion,
} from '@/lib/local-promotion';

type PromotionContextValue = {
  promotion: PromotionSettings;
  savePromotion: (promotion: PromotionSettings) => void;
};

const PromotionContext = createContext<PromotionContextValue | null>(null);

export function PromotionProvider({ children }: { children: React.ReactNode }) {
  const [promotion, setPromotion] =
    useState<PromotionSettings>(promotionDefaults);
  const refresh = useCallback(() => setPromotion(readLocalPromotion()), []);

  useEffect(() => {
    queueMicrotask(refresh);
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_PROMOTION_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(LOCAL_PROMOTION_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(LOCAL_PROMOTION_EVENT, refresh);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      promotion,
      savePromotion(next: PromotionSettings) {
        writeLocalPromotion(next);
        setPromotion(next);
      },
    }),
    [promotion],
  );

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
}

export function usePromotionStore() {
  const context = useContext(PromotionContext);
  if (!context)
    throw new Error('usePromotionStore must be used inside PromotionProvider');
  return context;
}
