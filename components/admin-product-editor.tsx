'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Film,
  ImagePlus,
  Minus,
  Plus,
  Smartphone,
  Star,
  Trash2,
} from 'lucide-react';
import { useMemo } from 'react';
import { EditorialArrow } from '@/components/editorial-arrow';
import {
  productPresentationLabels,
  productPresentationOrder,
  type Product,
  type ProductPresentation,
} from '@/data/products';
import type { MediaLibraryItem } from '@/lib/media-library';

type Props = {
  product: Product;
  media: MediaLibraryItem[];
  saving: boolean;
  onPatch: (patch: Partial<Product>) => void;
  onSave: () => void;
  onCancel: () => void;
};

function parsePrice(value: string) {
  if (value.trim() === '') return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round(parsed * 100)
    : null;
}

export function AdminProductEditor({
  product,
  media,
  saving,
  onPatch,
  onSave,
  onCancel,
}: Props) {
  const images = useMemo(
    () =>
      media.filter(
        (item) => item.kind === 'image' && item.product === product.slug,
      ),
    [media, product.slug],
  );
  const videos = useMemo(
    () =>
      media.filter(
        (item) => item.kind === 'video' && item.product === product.slug,
      ),
    [media, product.slug],
  );
  const selected = new Set(product.images);

  function updateStock(presentation: ProductPresentation, value: string) {
    const parsed = Number(value);
    const stock = Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
    onPatch({ stocks: { ...product.stocks, [presentation]: stock } });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= product.images.length) return;
    const next = [...product.images];
    [next[index], next[target]] = [next[target], next[index]];
    onPatch({ images: next });
  }

  return (
    <form
      className={`admin-product-editor accent-${product.accent}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <header className="admin-editor-head">
        <div>
          <p>EDITAR PRODUCTO / {product.slug}</p>
          <h2>{product.name}</h2>
        </div>
        <Link href={`/flower/${product.slug}`} target="_blank" prefetch={false}>
          Ver producto <EditorialArrow />
        </Link>
      </header>

      <section className="admin-editor-section admin-product-basics">
        <div className="admin-section-title">
          <span>A</span>
          <div>
            <p>PRODUCTO</p>
            <h3>Información principal</h3>
          </div>
        </div>
        <div className="admin-basic-grid">
          <label>
            <span>Nombre</span>
            <input
              value={product.name}
              required
              onChange={(event) => onPatch({ name: event.target.value })}
            />
          </label>
          <div className="admin-product-flags">
            <label>
              <input
                type="checkbox"
                checked={product.featured}
                onChange={(event) =>
                  onPatch({ featured: event.target.checked })
                }
              />
              Featured
            </label>
            <label>
              <input
                type="checkbox"
                checked={product.hidden}
                onChange={(event) => onPatch({ hidden: event.target.checked })}
              />
              Hidden
            </label>
          </div>
          <label className="wide">
            <span>Descripción ES</span>
            <textarea
              rows={4}
              required
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
          <label className="wide">
            <span>Description EN</span>
            <textarea
              rows={4}
              required
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
        </div>
      </section>

      <section className="admin-editor-section">
        <div className="admin-section-title">
          <span>B</span>
          <div>
            <p>PRECIO Y STOCK</p>
            <h3>Inventario por presentación</h3>
          </div>
        </div>
        <fieldset className="admin-variant-table">
          <legend className="sr-only">Precio y stock</legend>
          <div className="admin-variant-head" aria-hidden="true">
            <span />
            {productPresentationOrder.map((presentation) => (
              <strong key={presentation}>
                {productPresentationLabels[presentation]}
              </strong>
            ))}
          </div>
          <div className="admin-variant-row">
            <b>Precio</b>
            {productPresentationOrder.map((presentation) => (
              <label
                key={presentation}
                data-presentation={productPresentationLabels[presentation]}
              >
                <span className="sr-only">
                  Precio {productPresentationLabels[presentation]}
                </span>
                <i aria-hidden="true">$</i>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={
                    product.prices[presentation] === null
                      ? ''
                      : product.prices[presentation]! / 100
                  }
                  placeholder="Oculto"
                  onChange={(event) =>
                    onPatch({
                      prices: {
                        ...product.prices,
                        [presentation]: parsePrice(event.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
          <div className="admin-variant-row">
            <b>Stock</b>
            {productPresentationOrder.map((presentation) => (
              <label
                key={presentation}
                data-presentation={productPresentationLabels[presentation]}
              >
                <span className="sr-only">
                  Stock {productPresentationLabels[presentation]}
                </span>
                <div className="admin-stock-control">
                  <button
                    type="button"
                    disabled={product.stocks[presentation] <= 0}
                    aria-label={`Reducir stock ${productPresentationLabels[presentation]}`}
                    onClick={() =>
                      updateStock(
                        presentation,
                        String(product.stocks[presentation] - 1),
                      )
                    }
                  >
                    <Minus aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={product.stocks[presentation]}
                    onChange={(event) =>
                      updateStock(presentation, event.target.value)
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Aumentar stock ${productPresentationLabels[presentation]}`}
                    onClick={() =>
                      updateStock(
                        presentation,
                        String(product.stocks[presentation] + 1),
                      )
                    }
                  >
                    <Plus aria-hidden="true" />
                  </button>
                </div>
                <small
                  className={
                    product.stocks[presentation] > 0 ? 'available' : 'sold-out'
                  }
                >
                  {product.stocks[presentation] > 0 ? 'AVAILABLE' : 'SOLD OUT'}
                </small>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="admin-editor-section admin-media-editor">
        <div className="admin-section-title">
          <span>C</span>
          <div>
            <p>IMÁGENES</p>
            <h3>Galería y medios</h3>
          </div>
        </div>

        <div className="admin-media-summary">
          <span>
            <Star aria-hidden="true" />
            Principal: {product.images[0]?.split('/').at(-1)}
          </span>
          <span>
            <Smartphone aria-hidden="true" />
            Móvil:{' '}
            {(product.mobileImage || product.images[0])?.split('/').at(-1)}
          </span>
          <span>
            <Film aria-hidden="true" />
            Video: {product.video ? 'Asignado' : 'Sin video'}
          </span>
        </div>

        <div className="admin-selected-media">
          {product.images.map((url, index) => (
            <article key={url}>
              <div>
                <Image src={url} alt="" fill sizes="190px" />
                {index === 0 ? <b>MAIN</b> : <span>0{index + 1}</span>}
              </div>
              <p title={url}>{url.split('/').at(-1)}</p>
              <nav aria-label={`Acciones para imagen ${index + 1}`}>
                <button
                  type="button"
                  disabled={index === 0}
                  title="Usar como imagen principal"
                  aria-label="Usar como imagen principal"
                  onClick={() =>
                    onPatch({
                      images: [
                        url,
                        ...product.images.filter((item) => item !== url),
                      ],
                    })
                  }
                >
                  <Star aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={index === 0}
                  title="Mover a la izquierda"
                  aria-label="Mover a la izquierda"
                  onClick={() => moveImage(index, -1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={index === product.images.length - 1}
                  title="Mover a la derecha"
                  aria-label="Mover a la derecha"
                  onClick={() => moveImage(index, 1)}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={product.images.length <= 1}
                  title="Quitar imagen"
                  aria-label="Quitar imagen"
                  onClick={() =>
                    onPatch({
                      images: product.images.filter((item) => item !== url),
                    })
                  }
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </nav>
            </article>
          ))}
        </div>

        <details className="admin-media-picker">
          <summary>
            <ImagePlus aria-hidden="true" /> Añadir imagen
          </summary>
          <div>
            {images.map((item) => (
              <button
                type="button"
                key={item.url}
                disabled={selected.has(item.url)}
                onClick={() =>
                  onPatch({ images: [...product.images, item.url] })
                }
              >
                <span>
                  <Image src={item.url} alt="" fill sizes="130px" />
                </span>
                <b>{selected.has(item.url) ? 'AÑADIDA' : 'AÑADIR'}</b>
              </button>
            ))}
          </div>
        </details>

        <div className="admin-media-selects">
          <label>
            <span>Imagen móvil</span>
            <select
              value={product.mobileImage || ''}
              onChange={(event) =>
                onPatch({ mobileImage: event.target.value || undefined })
              }
            >
              <option value="">Usar imagen principal</option>
              {product.images.map((url) => (
                <option key={url} value={url}>
                  {url.split('/').at(-1)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Video oficial</span>
            <select
              value={product.video || ''}
              onChange={(event) =>
                onPatch({ video: event.target.value || undefined })
              }
            >
              <option value="">Sin video</option>
              {videos.map((item) => (
                <option key={item.url} value={item.url}>
                  {item.url.split('/').at(-1)}
                </option>
              ))}
            </select>
          </label>
          {product.video ? (
            <video
              src={product.video}
              poster={product.images[0]}
              controls
              muted
              playsInline
              preload="metadata"
            />
          ) : null}
        </div>
      </section>

      <footer className="admin-editor-actions">
        <p>
          <b>Guardado local.</b> Este cambio afecta únicamente a este navegador.
        </p>
        <div>
          <button
            className="admin-edit"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button className="admin-save" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </footer>
    </form>
  );
}
