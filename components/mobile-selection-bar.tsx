'use client';

import Image from 'next/image';
import { Check, Plus, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import {
  type SelectionItem,
  useSelection,
} from '@/components/selection-provider';
import { track } from '@/lib/analytics';

export function MobileSelectionBar({
  item,
  aboveProductNav = false,
}: {
  item: SelectionItem;
  aboveProductNav?: boolean;
}) {
  const { copy, language } = useLanguage();
  const { items, add, remove, contains, setOpen } = useSelection();
  const selected = contains(item.id);

  return (
    <aside
      className={
        aboveProductNav
          ? 'mobile-selection-bar above-product-nav'
          : 'mobile-selection-bar'
      }
      aria-label={copy.selection.mobileBar}
    >
      <button
        className="mobile-selection-mini"
        onClick={() => setOpen(true)}
        aria-label={copy.selection.open}
      >
        <span>
          <Image src={item.image} alt="" fill sizes="42px" />
        </span>
        <ShoppingBag aria-hidden="true" />
        <b>{items.length}</b>
      </button>
      <div>
        <small>{item.kind === 'flower' ? copy.nav.flower : copy.nav.wax}</small>
        <strong>{item.name}</strong>
      </div>
      <button
        className={selected ? 'selected' : ''}
        aria-pressed={selected}
        onClick={() => {
          if (selected) {
            remove(item.id);
            track('selection_remove', {
              slug: item.slug || 'wax',
              language,
            });
          } else {
            add(item);
            track('selection_add', {
              slug: item.slug || 'wax',
              language,
            });
          }
        }}
      >
        {selected ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
        {selected ? copy.selection.addedShort : copy.selection.addShort}
      </button>
    </aside>
  );
}
