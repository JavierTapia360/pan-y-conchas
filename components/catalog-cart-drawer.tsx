'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { useCatalogCart } from '@/components/catalog-cart-provider';
import { productPresentationLabels } from '@/data/products';
import { useLanguage } from '@/components/language-context';
import { EditorialArrow } from '@/components/editorial-arrow';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { siteConfig } from '@/data/site';

export function CatalogCartDrawer() {
  const { copy, language } = useLanguage();
  const {
    items,
    products,
    count,
    subtotalCents,
    open,
    setOpen,
    remove,
    setQuantity,
    clear,
  } = useCatalogCart();
  const currency = new Intl.NumberFormat(
    language === 'es' ? 'es-US' : 'en-US',
    {
      style: 'currency',
      currency: 'USD',
    },
  );
  const lines = items.flatMap((item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    return product && item.quantity > 0 ? [{ ...item, product }] : [];
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="catalog-cart-trigger"
        aria-label={copy.cart.open}
      >
        <ShoppingCart aria-hidden="true" />
        <span>{copy.cart.short}</span>
        {count > 0 && <b aria-label={`${count} ${copy.cart.units}`}>{count}</b>}
      </SheetTrigger>
      <SheetContent
        className="catalog-cart-sheet"
        side="right"
        showCloseButton={false}
      >
        <SheetHeader>
          <p className="section-kicker">CUATESFARMZ / CART</p>
          <SheetTitle>{copy.cart.title}</SheetTitle>
          <SheetDescription>{copy.cart.description}</SheetDescription>
          <SheetClose
            className="catalog-cart-close"
            aria-label={copy.cart.close}
          >
            <X aria-hidden="true" />
          </SheetClose>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="catalog-cart-empty">
            <ShoppingBag aria-hidden="true" />
            <h3>{copy.cart.empty}</h3>
            <p>{copy.cart.emptyBody}</p>
          </div>
        ) : (
          <div className="catalog-cart-lines" aria-label={copy.cart.title}>
            {lines.map(({ product, presentation, quantity }) => {
              const stock = product.stocks[presentation];
              return (
                <article key={`${product.slug}:${presentation}`}>
                  <Link
                    prefetch={false}
                    href={`/flower/${product.slug}`}
                    onClick={() => setOpen(false)}
                  >
                    <Image src={product.images[0]} alt="" fill sizes="112px" />
                  </Link>
                  <div>
                    <p>
                      {stock > 0 ? copy.status.available : copy.status.soldOut}
                    </p>
                    <h3>{product.name}</h3>
                    <span className="catalog-cart-presentation">
                      {copy.cart.presentation}:{' '}
                      <b>{productPresentationLabels[presentation]}</b>
                    </span>
                    <strong>
                      {product.prices[presentation] == null
                        ? copy.cart.pricePending
                        : currency.format(product.prices[presentation] / 100)}
                    </strong>
                    <div className="catalog-cart-quantity">
                      <button
                        onClick={() =>
                          setQuantity(product.slug, presentation, quantity - 1)
                        }
                        disabled={quantity <= 0}
                        aria-label={`${copy.cart.decrease} ${product.name}`}
                      >
                        <Minus aria-hidden="true" />
                      </button>
                      <output aria-label={`${copy.cart.quantity}: ${quantity}`}>
                        {quantity}
                      </output>
                      <button
                        onClick={() =>
                          setQuantity(product.slug, presentation, quantity + 1)
                        }
                        disabled={stock <= 0 || quantity >= stock}
                        aria-label={`${copy.cart.increase} ${product.name} ${productPresentationLabels[presentation]}`}
                      >
                        <Plus aria-hidden="true" />
                      </button>
                    </div>
                    {quantity >= stock && (
                      <small>
                        {copy.cart.onlyAvailable.replace(
                          '{stock}',
                          String(stock),
                        )}
                      </small>
                    )}
                  </div>
                  <button
                    className="catalog-cart-remove"
                    onClick={() => remove(product.slug, presentation)}
                    aria-label={`${copy.cart.remove} ${product.name}`}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <SheetFooter>
          {lines.length > 0 && (
            <>
              <div className="catalog-cart-summary">
                <span>{copy.cart.subtotal}</span>
                <strong>{currency.format(subtotalCents / 100)}</strong>
              </div>
              <p className="catalog-cart-boundary">{copy.cart.boundary}</p>
              <AlertDialog>
                <AlertDialogTrigger className="catalog-cart-clear">
                  {copy.cart.clear}
                </AlertDialogTrigger>
                <AlertDialogContent className="catalog-cart-alert">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{copy.cart.clearTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {copy.cart.clearBody}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{copy.cart.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={clear}>
                      {copy.cart.clearConfirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    prefetch={false}
                    className="button button-dark"
                    href="/cart"
                  />
                }
              >
                {copy.cart.viewSummary} <EditorialArrow />
              </SheetClose>
            </>
          )}
          <SheetClose
            nativeButton={false}
            render={
              <Link
                prefetch={false}
                className="button button-red"
                href="/flower"
              />
            }
          >
            {copy.cart.continue} <EditorialArrow />
          </SheetClose>
          <SheetClose
            nativeButton={false}
            render={
              <Link
                prefetch={false}
                className="button button-outline"
                href="/contact"
              />
            }
          >
            {copy.actions.contact} <EditorialArrow />
          </SheetClose>
          <a
            className="button button-outline catalog-cart-telegram"
            href={siteConfig.socials.telegram}
            target="_blank"
            rel="noreferrer"
          >
            {copy.telegram.contact} <EditorialArrow />
          </a>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
