'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-provider';
import { useSelection } from '@/components/selection-provider';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { track } from '@/lib/analytics';
import { productSelectionItem } from '@/components/selection-provider';
import { EditorialArrow } from '@/components/editorial-arrow';
import { useCatalog } from '@/hooks/use-catalog';

export function SelectionDrawer() {
  const { copy, language } = useLanguage();
  const { items, open, setOpen, add, remove, clear } = useSelection();
  const pathname = usePathname();
  const router = useRouter();
  const suggestions = useCatalog()
    .filter(
      (product) =>
        !product.hidden && !items.some((item) => item.slug === product.slug),
    )
    .slice(0, 2);

  useEffect(() => setOpen(false), [pathname, setOpen]);

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) track('selection_open', { language });
      }}
    >
      <SheetTrigger
        className="selection-trigger"
        aria-label={copy.selection.open}
      >
        <ShoppingBag aria-hidden="true" strokeWidth={1.8} />
        <span>{copy.selection.short}</span>
        <b aria-label={`${items.length} ${copy.selection.items}`}>
          {items.length}
        </b>
      </SheetTrigger>
      <SheetContent className="selection-drawer" showCloseButton={false}>
        <SheetHeader className="selection-drawer-header">
          <div>
            <p className="section-kicker">CUATESFARMZ / 05</p>
            <SheetTitle>{copy.selection.title}</SheetTitle>
          </div>
          <SheetClose
            className="selection-close"
            aria-label={copy.selection.close}
          >
            <X aria-hidden="true" />
          </SheetClose>
          <SheetDescription>{copy.selection.description}</SheetDescription>
        </SheetHeader>

        <div className="selection-drawer-body">
          {items.length === 0 ? (
            <div className="selection-drawer-empty">
              <ShoppingBag aria-hidden="true" />
              <h3>{copy.selection.empty}</h3>
              <p>{copy.selection.emptyBody}</p>
              <button
                className="button button-dark"
                onClick={() => {
                  setOpen(false);
                  router.push('/flower');
                }}
              >
                {copy.selection.explore}
              </button>
            </div>
          ) : (
            <div className="selection-drawer-list">
              {items.map((item, index) => (
                <article
                  key={item.id}
                  className={`accent-${item.accent || 'gold'}`}
                >
                  <Link
                    prefetch={false}
                    href={
                      item.kind === 'flower' ? `/flower/${item.slug}` : '/wax'
                    }
                    className="selection-drawer-image"
                  >
                    <Image
                      src={item.image}
                      alt={`${item.kind === 'wax' ? copy.selection.waxName : item.name} CUATESFARMZ`}
                      fill
                      sizes="112px"
                    />
                    <span>0{index + 1}</span>
                  </Link>
                  <div>
                    <p>
                      {item.kind === 'flower' ? copy.nav.flower : copy.nav.wax}
                    </p>
                    <h3>
                      {item.kind === 'wax' ? copy.selection.waxName : item.name}
                    </h3>
                    <button
                      onClick={() => {
                        remove(item.id);
                        track('selection_remove', {
                          slug: item.slug || 'wax',
                          language,
                        });
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                      {copy.selection.remove}
                    </button>
                  </div>
                </article>
              ))}
              {suggestions.length > 0 && (
                <section className="selection-drawer-recommendations">
                  <h3>{copy.selection.recommendations}</h3>
                  <div>
                    {suggestions.map((product) => (
                      <article key={product.slug}>
                        <span>
                          <Image
                            src={product.images[0]}
                            alt=""
                            fill
                            sizes="58px"
                          />
                        </span>
                        <b>{product.name}</b>
                        <button
                          aria-label={`${copy.selection.add} ${product.name}`}
                          onClick={() => {
                            add(productSelectionItem(product));
                            track('selection_add', {
                              slug: product.slug,
                              language,
                            });
                          }}
                        >
                          <Plus aria-hidden="true" />
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="selection-drawer-footer">
            <p>{copy.selection.disclaimer}</p>
            <button
              className="button button-red"
              onClick={() => {
                setOpen(false);
                router.push('/selection');
              }}
            >
              {copy.selection.view}
              <EditorialArrow />
            </button>
            <button className="selection-clear" onClick={clear}>
              {copy.selection.clear}
            </button>
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}
