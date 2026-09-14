'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Check, ShoppingBag, X } from 'lucide-react';
import { useCatalogCart } from '@/components/catalog-cart-provider';
import { useLanguage } from '@/components/language-provider';
import { productPresentationLabels } from '@/data/products';

export function CatalogCartToast() {
  const { notice, dismissNotice } = useCatalogCart();
  const { copy } = useLanguage();
  return (
    <AnimatePresence>
      {notice && (
        <motion.output
          key={notice.id}
          className="catalog-cart-toast"
          aria-live="polite"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.22 }}
        >
          <span>{notice.kind === 'added' ? <Check /> : <ShoppingBag />}</span>
          <div>
            <strong>
              {notice.name}
              {notice.presentation
                ? ` · ${productPresentationLabels[notice.presentation]}`
                : ''}
            </strong>
            <p>
              {notice.kind === 'added'
                ? copy.cart.added
                : notice.kind === 'sold-out'
                  ? copy.cart.soldOut
                  : notice.kind === 'price'
                    ? copy.cart.pricePending
                    : notice.kind === 'adjusted'
                      ? copy.cart.adjusted.replace(
                          '{stock}',
                          String(notice.stock || 0),
                        )
                      : copy.cart.onlyAvailable.replace(
                          '{stock}',
                          String(notice.stock || 0),
                        )}
            </p>
          </div>
          <button onClick={dismissNotice} aria-label={copy.cart.dismiss}>
            <X aria-hidden="true" />
          </button>
        </motion.output>
      )}
    </AnimatePresence>
  );
}
