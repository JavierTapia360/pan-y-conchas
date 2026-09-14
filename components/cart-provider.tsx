'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { MerchProduct } from '@/data/merch';
import { assertMerchProduct } from '@/lib/commerce-guard';

export type CartItem = {
  id: string;
  quantity: number;
  variant?: { size?: string; color?: string };
};
export const cartItemKey = (item: Pick<CartItem, 'id' | 'variant'>) =>
  `${item.id}:${item.variant?.size || ''}:${item.variant?.color || ''}`;
const CartContext = createContext<{
  items: CartItem[];
  add: (product: MerchProduct, variant?: CartItem['variant']) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number, maximum?: number) => void;
} | null>(null);
const CART_KEY = 'gf_merch_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(CART_KEY) ||
          localStorage.getItem('gf-merch-cart') ||
          '[]',
      ) as CartItem[];
      queueMicrotask(() => setItems(stored));
    } catch {
      queueMicrotask(() => setItems([]));
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* Cart remains available until the page closes. */
    }
  }, [items]);
  const value = useMemo(
    () => ({
      items,
      add(product: MerchProduct, variant?: CartItem['variant']) {
        assertMerchProduct(product);
        setItems((current) => {
          const key = cartItemKey({ id: product.id, variant });
          const existing = current.find((item) => cartItemKey(item) === key);
          return existing
            ? current.map((item) =>
                cartItemKey(item) === key
                  ? {
                      ...item,
                      quantity: Math.min(product.inventory, item.quantity + 1),
                    }
                  : item,
              )
            : [...current, { id: product.id, quantity: 1, variant }];
        });
      },
      remove(key: string) {
        setItems((current) =>
          current.filter((item) => cartItemKey(item) !== key),
        );
      },
      setQuantity(key: string, quantity: number, maximum = 20) {
        setItems((current) =>
          quantity < 1
            ? current.filter((item) => cartItemKey(item) !== key)
            : current.map((item) =>
                cartItemKey(item) === key
                  ? { ...item, quantity: Math.min(maximum, quantity) }
                  : item,
              ),
        );
      },
    }),
    [items],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used within CartProvider');
  return value;
}
