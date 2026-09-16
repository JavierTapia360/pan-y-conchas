'use client';

import Image from 'next/image';
import { Check, Scale, ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '@/components/language-context';
import { useSelection } from '@/components/selection-provider';

export function SelectionToast() {
  const { copy } = useLanguage();
  const { toast, dismissToast, setOpen } = useSelection();

  const message = toast
    ? toast.kind === 'added'
      ? copy.selection.toastAdded
      : toast.kind === 'removed'
        ? copy.selection.toastRemoved
        : toast.kind === 'limit'
          ? copy.selection.compareLimit
          : copy.selection.compareUpdated
    : '';

  return (
    <AnimatePresence>
      {toast && (
        <motion.output
          key={toast.id}
          className="selection-toast"
          aria-live="polite"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.22 }}
        >
          {toast.item ? (
            <div className="selection-toast-image">
              <Image src={toast.item.image} alt="" fill sizes="64px" />
            </div>
          ) : (
            <Scale aria-hidden="true" className="selection-toast-symbol" />
          )}
          <div>
            <p>
              {toast.kind === 'added' ? (
                <Check aria-hidden="true" />
              ) : (
                <ShoppingBag aria-hidden="true" />
              )}
              {message}
            </p>
            {toast.item && <strong>{toast.item.name}</strong>}
          </div>
          {toast.kind === 'added' && (
            <button
              className="selection-toast-view"
              onClick={() => {
                dismissToast();
                setOpen(true);
              }}
            >
              {copy.selection.openShort}
            </button>
          )}
          <button
            className="selection-toast-close"
            onClick={dismissToast}
            aria-label={copy.selection.dismiss}
          >
            <X aria-hidden="true" />
          </button>
        </motion.output>
      )}
    </AnimatePresence>
  );
}
