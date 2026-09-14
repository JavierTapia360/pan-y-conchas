'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  adminPresentationOrder,
  hasAvailablePresentation,
  productPresentationLabels,
  type ProductPresentation,
} from '@/data/products';
import type { CatalogProduct } from '@/hooks/use-catalog';
import type { MediaLibraryItem } from '@/lib/media-library';
import { EditorialArrow } from '@/components/editorial-arrow';

export type AdminProduct = CatalogProduct & {
  status?: 'AVAILABLE' | 'SOLD_OUT' | 'HIDDEN';
  isNew?: boolean;
  draftKey?: string;
};

type Props = {
  product: AdminProduct;
  prices: Record<ProductPresentation, string>;
  media: MediaLibraryItem[];
  saving: boolean;
  onPatch: (patch: Partial<AdminProduct>) => void;
  onPrice: (presentation: ProductPresentation, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

const statusLabel = (product: AdminProduct) =>
  product.hidden
    ? 'HIDDEN'
    : hasAvailablePresentation(product.stocks)
      ? 'AVAILABLE'
      : 'SOLD OUT';

export function AdminProductEditor({
  product,
  prices,
  media,
  saving,
  onPatch,
  onPrice,
  onSave,
  onCancel,
}: Props) {
  const images = useMemo(
    () => media.filter((item) => item.kind === 'image'),
    [media],
  );
  const videos = useMemo(
    () =>
      media.filter(
        (item) => item.kind === 'video' && item.product === product.slug,
      ),
    [media, product.slug],
  );
  const selected = new Set(product.images);
  const key = product.draftKey || product.slug;

  function updateStock(presentation: ProductPresentation, next: number) {
    const stock = Number.isFinite(next) ? Math.max(0, Math.trunc(next)) : 0;
    const stocks = { ...product.stocks, [presentation]: stock };
    onPatch({
      stocks,
      available: hasAvailablePresentation(stocks),
      status: product.hidden
        ? 'HIDDEN'
        : hasAvailablePresentation(stocks)
          ? 'AVAILABLE'
          : 'SOLD_OUT',
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= product.images.length) return;
    const next = [...product.images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onPatch({ images: next });
  }

  return (
    <form
      className={`admin-product-editor accent-${product.accent}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      aria-label={`Edit ${product.name || 'new product'}`}
    >
      <header className="admin-editor-head">
        <div>
          <p>{product.isNew ? 'NEW PRODUCT DRAFT' : product.slug}</p>
          <h2>{product.name || 'Untitled product'}</h2>
        </div>
        <strong
          className={`admin-stock-status ${statusLabel(product).toLowerCase().replaceAll(' ', '-')}`}
        >
          {statusLabel(product)}
        </strong>
      </header>

      <div className="admin-editor-grid">
        <section className="admin-editor-fields">
          <h3>Product information</h3>
          <div className="admin-field-grid">
            <label>
              <span>Name</span>
              <input
                required
                value={product.name}
                onChange={(event) => onPatch({ name: event.target.value })}
              />
            </label>
            <label>
              <span>URL slug</span>
              <input
                required
                disabled={!product.isNew}
                value={product.slug}
                onChange={(event) =>
                  onPatch({
                    slug: event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, ''),
                  })
                }
              />
            </label>
            <label>
              <span>Visual accent</span>
              <select
                value={product.accent}
                onChange={(event) =>
                  onPatch({
                    accent: event.target.value as AdminProduct['accent'],
                  })
                }
              >
                <option value="candy">Candy red</option>
                <option value="pink">Donut pink</option>
                <option value="ice">Frosted blue</option>
                <option value="green">MAC green</option>
              </select>
            </label>
            <label>
              <span>General state</span>
              <select
                value={
                  product.hidden
                    ? 'HIDDEN'
                    : statusLabel(product).replace(' ', '_')
                }
                onChange={(event) => {
                  if (event.target.value === 'HIDDEN') {
                    onPatch({ hidden: true, status: 'HIDDEN' });
                  } else if (event.target.value === 'SOLD_OUT') {
                    onPatch({
                      hidden: false,
                      stocks: { halfOz: 0, oz: 0, qp: 0 },
                      available: false,
                      status: 'SOLD_OUT',
                    });
                  } else {
                    onPatch({
                      hidden: false,
                      status: hasAvailablePresentation(product.stocks)
                        ? 'AVAILABLE'
                        : 'SOLD_OUT',
                    });
                  }
                }}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="SOLD_OUT">SOLD OUT</option>
                <option value="HIDDEN">HIDDEN</option>
              </select>
            </label>
          </div>

          <fieldset className="admin-presentation-prices">
            <legend>Prices and stock by presentation</legend>
            <p>
              Blank prices hide only that presentation. Stock never changes when
              a visitor uses the cart.
            </p>
            <div className="admin-variant-editor">
              {adminPresentationOrder.map((presentation) => (
                <article key={presentation}>
                  <div>
                    <strong>{productPresentationLabels[presentation]}</strong>
                    <small
                      className={
                        product.stocks[presentation] > 0
                          ? 'available'
                          : 'sold-out'
                      }
                    >
                      {product.stocks[presentation] > 0
                        ? 'AVAILABLE'
                        : 'SOLD OUT'}
                    </small>
                  </div>
                  <label>
                    <span>Price USD</span>
                    <span className="admin-price-input">
                      <b aria-hidden="true">$</b>
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        step="0.01"
                        inputMode="decimal"
                        value={prices[presentation]}
                        placeholder="Hidden"
                        onChange={(event) =>
                          onPrice(presentation, event.target.value)
                        }
                        aria-label={`${product.name} ${productPresentationLabels[presentation]} price`}
                      />
                    </span>
                  </label>
                  <label>
                    <span>Stock</span>
                    <span className="admin-stepper">
                      <button
                        type="button"
                        disabled={product.stocks[presentation] <= 0}
                        onClick={() =>
                          updateStock(
                            presentation,
                            product.stocks[presentation] - 1,
                          )
                        }
                        aria-label={`Decrease ${productPresentationLabels[presentation]} stock`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        step="1"
                        inputMode="numeric"
                        value={product.stocks[presentation]}
                        onChange={(event) =>
                          updateStock(presentation, Number(event.target.value))
                        }
                        aria-label={`${productPresentationLabels[presentation]} stock`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateStock(
                            presentation,
                            product.stocks[presentation] + 1,
                          )
                        }
                        aria-label={`Increase ${productPresentationLabels[presentation]} stock`}
                      >
                        +
                      </button>
                    </span>
                  </label>
                </article>
              ))}
            </div>
          </fieldset>

          <label className="admin-wide-field">
            <span>Descripción ES</span>
            <textarea
              required
              rows={4}
              value={product.description.es}
              onChange={(event) =>
                onPatch({
                  description: {
                    ...product.description,
                    es: event.target.value,
                  },
                })
              }
            />
          </label>
          <label className="admin-wide-field">
            <span>Description EN</span>
            <textarea
              required
              rows={4}
              value={product.description.en}
              onChange={(event) =>
                onPatch({
                  description: {
                    ...product.description,
                    en: event.target.value,
                  },
                })
              }
            />
          </label>

          <div className="admin-product-flags">
            <span>Visibility</span>
            <label>
              <input
                type="checkbox"
                checked={Boolean(product.featured)}
                onChange={(event) =>
                  onPatch({ featured: event.target.checked })
                }
              />
              Featured on Home
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(product.hidden)}
                onChange={(event) =>
                  onPatch({
                    hidden: event.target.checked,
                    status: event.target.checked
                      ? 'HIDDEN'
                      : hasAvailablePresentation(product.stocks)
                        ? 'AVAILABLE'
                        : 'SOLD_OUT',
                  })
                }
              />
              Hidden from storefront
            </label>
          </div>
        </section>

        <aside className="admin-product-preview">
          <p className="section-kicker">LIVE DRAFT PREVIEW</p>
          <div className="admin-preview-card">
            <div className="admin-preview-image">
              {product.images[0] ? (
                <picture>
                  {product.mobileImage ? (
                    <source
                      media="(max-width: 700px)"
                      srcSet={product.mobileImage}
                    />
                  ) : null}
                  <Image
                    src={product.images[0]}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 360px"
                  />
                </picture>
              ) : (
                <span>SELECT A MAIN IMAGE</span>
              )}
            </div>
            <span>{statusLabel(product)}</span>
            <h3>{product.name || 'Product name'}</h3>
            <p>{product.description.es || 'La descripción aparecerá aquí.'}</p>
            <div>
              {adminPresentationOrder.map((presentation) =>
                prices[presentation] !== '' ? (
                  <small key={presentation}>
                    {productPresentationLabels[presentation]} · $
                    {prices[presentation] || '0'}
                  </small>
                ) : null,
              )}
            </div>
          </div>
          {!product.isNew && !product.hidden ? (
            <Link
              href={`/flower/${product.slug}`}
              target="_blank"
              prefetch={false}
            >
              Open public product <EditorialArrow />
            </Link>
          ) : null}
        </aside>
      </div>

      <section className="admin-media-editor">
        <header>
          <div>
            <p className="section-kicker">PRODUCT MEDIA</p>
            <h3>Gallery order</h3>
          </div>
          <span>{product.images.length} selected</span>
        </header>
        <div className="admin-selected-media">
          {product.images.map((url, index) => (
            <article key={`${url}-${index}`}>
              <div>
                <Image src={url} alt="" fill sizes="160px" />
              </div>
              <b>{index === 0 ? 'MAIN IMAGE' : `GALLERY ${index}`}</b>
              <code>{url.split('/').at(-1)}</code>
              <nav aria-label={`Controls for image ${index + 1}`}>
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      onPatch({
                        images: [
                          url,
                          ...product.images.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        ],
                      })
                    }
                  >
                    Make main
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveImage(index, -1)}
                  aria-label="Move image left"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={index === product.images.length - 1}
                  onClick={() => moveImage(index, 1)}
                  aria-label="Move image right"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onPatch({
                      images: product.images.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                >
                  Remove
                </button>
              </nav>
            </article>
          ))}
        </div>
        <details className="admin-media-picker">
          <summary>Add an image from the library</summary>
          <div>
            {images.map((item) => (
              <button
                type="button"
                key={item.url}
                disabled={selected.has(item.url)}
                onClick={() =>
                  onPatch({ images: [...product.images, item.url] })
                }
                title={item.url}
              >
                <span>
                  <Image src={item.url} alt="" fill sizes="110px" />
                </span>
                <b>{selected.has(item.url) ? 'SELECTED' : 'ADD'}</b>
                <small>
                  {item.product} / {item.role}
                </small>
              </button>
            ))}
          </div>
        </details>
        <div className="admin-media-selects">
          <label>
            <span>Dedicated mobile image</span>
            <select
              value={product.mobileImage || ''}
              onChange={(event) =>
                onPatch({ mobileImage: event.target.value || undefined })
              }
            >
              <option value="">Use main image</option>
              {images.map((item) => (
                <option key={item.url} value={item.url}>
                  {item.product} · {item.role} · {item.url.split('/').at(-1)}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-video-editor">
            <span>Official product video</span>
            {product.video ? (
              <video
                src={product.video}
                poster={product.images[0]}
                controls
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <p>No video selected.</p>
            )}
            <label>
              <span>Replace video</span>
              <select
                value={product.video || ''}
                onChange={(event) =>
                  onPatch({ video: event.target.value || undefined })
                }
              >
                <option value="">No video</option>
                {videos.map((item) => (
                  <option key={item.url} value={item.url}>
                    {item.url.split('/').at(-1)}
                  </option>
                ))}
              </select>
            </label>
            {product.video ? (
              <button
                type="button"
                className="admin-video-remove"
                onClick={() => onPatch({ video: undefined })}
              >
                Remove video
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="admin-editor-actions">
        <p>
          <b>Unsaved draft.</b> Cancel restores the last saved version. Save
          publishes these central catalog values.
        </p>
        <div>
          <button
            className="admin-edit"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button className="admin-save" type="submit" disabled={saving}>
            {saving
              ? 'Saving…'
              : product.isNew
                ? 'Create product'
                : 'Save changes'}
          </button>
        </div>
      </footer>
      <input type="hidden" name="editor-key" value={key} />
    </form>
  );
}
