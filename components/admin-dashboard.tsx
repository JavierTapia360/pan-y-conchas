'use client';

import Image from 'next/image';
import Link from '@/components/static-link';
import { useEffect, useMemo, useState } from 'react';
import { AdminProductEditor } from '@/components/admin-product-editor';
import { useCatalogStore } from '@/components/catalog-provider';
import {
  adminPresentationOrder,
  productPresentationLabels,
  type Product,
} from '@/data/products';
import { waxPresentationOrder } from '@/data/wax';
import { getCatalogPresentationLabel } from '@/data/catalog-cart';
import { useWaxProduct } from '@/hooks/use-wax-product';
import { mediaLibrary } from '@/lib/media-library';
import {
  LOCAL_ADMIN_EVENT,
  LOCAL_ANALYTICS_KEY,
  LOCAL_MESSAGES_KEY,
  readLocalAnalytics,
  readLocalMessages,
  updateLocalMessageStatus,
  type LocalAnalyticsEntry,
  type LocalMessage,
} from '@/lib/local-admin-store';
import { writeLocalWaxAvailability } from '@/lib/local-wax';

type Tab = 'products' | 'wax' | 'messages' | 'metrics';
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
const tabs: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Catálogo Flower' },
  { id: 'wax', label: 'Wax' },
  { id: 'messages', label: 'Mensajes' },
  { id: 'metrics', label: 'Analytics' },
];
const cloneProduct = (product: Product): Product =>
  JSON.parse(JSON.stringify(product)) as Product;

function summarize(entries: LocalAnalyticsEntry[], key: 'event' | 'path') {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const value = entry[key];
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function AdminDashboard() {
  const { products, saveProduct } = useCatalogStore();
  const waxProduct = useWaxProduct();
  const [tab, setTab] = useState<Tab>('products');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [notice, setNotice] = useState('Datos locales listos.');
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [analytics, setAnalytics] = useState<LocalAnalyticsEntry[]>([]);

  useEffect(() => {
    const refresh = () => {
      setMessages(readLocalMessages());
      setAnalytics(readLocalAnalytics());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_MESSAGES_KEY || event.key === LOCAL_ANALYTICS_KEY)
        refresh();
    };
    refresh();
    window.addEventListener(LOCAL_ADMIN_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(LOCAL_ADMIN_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saveState === 'dirty') event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [saveState]);

  const filteredProducts = products.filter((product) =>
    [product.name, product.slug]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const filteredMessages = messages.filter((message) =>
    [message.name, message.email, message.subject, message.message]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const events = useMemo(() => summarize(analytics, 'event'), [analytics]);
  const paths = useMemo(() => summarize(analytics, 'path'), [analytics]);
  const productViews = useMemo(() => {
    const counts = new Map<string, number>();
    analytics
      .filter((entry) => entry.event === 'view_product')
      .forEach((entry) => {
        const slug = entry.properties.slug || 'unknown';
        counts.set(slug, (counts.get(slug) || 0) + 1);
      });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [analytics]);

  function openEditor(product: Product) {
    setEditing(cloneProduct(product));
    setSaveState('idle');
    setNotice('Editando copia local.');
  }

  async function saveDraft() {
    if (!editing) return;
    const invalidStock = Object.values(editing.stocks).some(
      (stock) => !Number.isInteger(stock) || stock < 0,
    );
    const invalidPrice = Object.values(editing.prices).some(
      (price) => price !== null && (!Number.isInteger(price) || price < 0),
    );
    if (
      !editing.name.trim() ||
      !editing.description.es.trim() ||
      !editing.description.en.trim() ||
      !editing.images.length ||
      invalidStock ||
      invalidPrice
    ) {
      setSaveState('error');
      setNotice('Revisa nombre, descripciones, imágenes, precios y stock.');
      return;
    }
    setSaveState('saving');
    setNotice('Guardando en este navegador…');
    await new Promise<void>((resolve) =>
      window.requestAnimationFrame(() => resolve()),
    );
    try {
      const next: Product = {
        ...editing,
        name: editing.name.trim(),
        description: {
          es: editing.description.es.trim(),
          en: editing.description.en.trim(),
        },
        available: Object.values(editing.stocks).some((stock) => stock > 0),
        updatedAt: new Date().toISOString(),
      };
      saveProduct(next);
      setEditing(cloneProduct(next));
      setSaveState('saved');
      setNotice('Guardado localmente en este navegador.');
    } catch {
      setSaveState('error');
      setNotice('No se pudo guardar. Revisa el almacenamiento del navegador.');
    }
  }

  function setMessageStatus(id: string, status: LocalMessage['status']) {
    try {
      updateLocalMessageStatus(id, status);
      setNotice('Estado del mensaje actualizado localmente.');
    } catch {
      setNotice('No se pudo actualizar el mensaje.');
    }
  }

  function setWaxAvailability(available: boolean) {
    try {
      writeLocalWaxAvailability(available);
      setSaveState('saved');
      setNotice(
        `WAX marcado como ${available ? 'AVAILABLE' : 'SOLD OUT'} en este navegador.`,
      );
    } catch {
      setSaveState('error');
      setNotice('No se pudo guardar la disponibilidad local de WAX.');
    }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <Image
            src="/assets/cuatesfarmz-logo-c.png"
            alt="CUATESFARMZ"
            width={220}
            height={74}
            priority
          />
          <b>ADMIN / LOCAL</b>
        </div>
        <nav aria-label="Secciones del administrador">
          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => {
                setTab(item.id);
                setQuery('');
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <Link prefetch={false} href="/" target="_blank">
          Ver sitio
        </Link>
      </aside>

      <section className="admin-main">
        <header>
          <div>
            <p>CUATESFARMZ / ADMIN LOCAL</p>
            <h1>{tabs.find((item) => item.id === tab)?.label}</h1>
          </div>
          <div className="admin-notice">
            <output
              className={
                saveState === 'dirty' || saveState === 'error' ? 'dirty' : ''
              }
              aria-live="polite"
            >
              {notice}
            </output>
            {tab === 'products' || tab === 'messages' ? (
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar…"
                aria-label="Buscar en esta sección"
              />
            ) : null}
          </div>
        </header>

        <aside className="admin-local-banner">
          <strong>ALMACENAMIENTO LOCAL</strong>
          <p>
            Los cambios se guardan únicamente en este navegador y se reflejan
            inmediatamente en el storefront de este mismo dispositivo. No hay
            backend ni base de datos.
          </p>
        </aside>

        {tab === 'products' ? (
          <section className="admin-products-view">
            <div className="admin-product-list">
              {filteredProducts.map((product) => {
                const status = product.hidden
                  ? 'HIDDEN'
                  : product.available
                    ? 'AVAILABLE'
                    : 'SOLD OUT';
                return (
                  <article key={product.slug}>
                    <div className="admin-product-row">
                      <div className="admin-product-id">
                        <Image
                          src={product.images[0]}
                          alt=""
                          width={84}
                          height={84}
                        />
                        <div>
                          <b>{product.name}</b>
                          <span>{product.slug}</span>
                        </div>
                      </div>
                      <strong
                        className={`admin-stock-status ${status.toLowerCase().replaceAll(' ', '-')}`}
                      >
                        {status}
                      </strong>
                      <div className="admin-row-variants">
                        {adminPresentationOrder.map((presentation) => (
                          <span key={presentation}>
                            <b>{productPresentationLabels[presentation]}</b>{' '}
                            {product.prices[presentation] === null
                              ? '—'
                              : `$${(product.prices[presentation]! / 100).toFixed(0)}`}
                          </span>
                        ))}
                      </div>
                      <button
                        className="admin-edit"
                        type="button"
                        onClick={() => openEditor(product)}
                      >
                        Editar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            {editing ? (
              <AdminProductEditor
                key={editing.slug}
                product={editing}
                media={mediaLibrary}
                saving={saveState === 'saving'}
                onPatch={(patch) => {
                  setEditing((current) =>
                    current ? { ...current, ...patch } : current,
                  );
                  setSaveState('dirty');
                  setNotice('Cambios sin guardar.');
                }}
                onSave={saveDraft}
                onCancel={() => {
                  setEditing(null);
                  setSaveState('idle');
                  setNotice('Edición cancelada.');
                }}
              />
            ) : null}
          </section>
        ) : null}

        {tab === 'wax' ? (
          <section className="admin-wax-view">
            <div className="admin-wax-card">
              <header>
                <div>
                  <p className="section-kicker">PRODUCTO / WAX</p>
                  <h2>Disponibilidad manual</h2>
                </div>
                <strong
                  className={`admin-stock-status ${waxProduct.available ? 'available' : 'sold-out'}`}
                >
                  {waxProduct.available ? 'AVAILABLE' : 'SOLD OUT'}
                </strong>
              </header>
              <p>
                WAX no usa stock numérico. Este estado se guarda únicamente en
                este navegador y actualiza la página, el carrito y el resumen.
              </p>
              <fieldset className="admin-availability-control">
                <legend>Estado</legend>
                <button
                  type="button"
                  className={waxProduct.available ? 'active available' : ''}
                  aria-pressed={waxProduct.available}
                  onClick={() => setWaxAvailability(true)}
                >
                  AVAILABLE
                </button>
                <button
                  type="button"
                  className={!waxProduct.available ? 'active sold-out' : ''}
                  aria-pressed={!waxProduct.available}
                  onClick={() => setWaxAvailability(false)}
                >
                  SOLD OUT
                </button>
              </fieldset>
              <div className="admin-wax-packages">
                {waxPresentationOrder.map((presentation) => (
                  <article key={presentation}>
                    <span>
                      {getCatalogPresentationLabel(presentation, 'es')}
                    </span>
                    <strong>
                      ${(waxProduct.prices[presentation] / 100).toFixed(0)}
                    </strong>
                    <small>
                      $
                      {(waxProduct.perPiecePrices[presentation] / 100).toFixed(
                        0,
                      )}{' '}
                      por pieza
                    </small>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === 'messages' ? (
          <section className="admin-messages">
            {filteredMessages.length ? (
              filteredMessages.map((message) => (
                <article key={message.id}>
                  <header>
                    <div>
                      <span>{message.status}</span>
                      <time dateTime={message.createdAt}>
                        {new Intl.DateTimeFormat('es-MX', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(message.createdAt))}
                      </time>
                    </div>
                    <h2>{message.subject}</h2>
                    <p>
                      {message.name} · {message.email}
                    </p>
                  </header>
                  <p>{message.message}</p>
                  <div>
                    <button
                      onClick={() => setMessageStatus(message.id, 'READ')}
                      disabled={message.status === 'READ'}
                    >
                      Marcar leído
                    </button>
                    <button
                      onClick={() => setMessageStatus(message.id, 'ARCHIVED')}
                      disabled={message.status === 'ARCHIVED'}
                    >
                      Archivar
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-empty">
                <b>NO HAY MENSAJES LOCALES</b>
                <p>
                  Los formularios enviados en este navegador aparecerán aquí.
                </p>
              </div>
            )}
          </section>
        ) : null}

        {tab === 'metrics' ? (
          <section className="admin-analytics">
            <div className="admin-metric-cards">
              <article>
                <span>Visitas</span>
                <strong>
                  {events.find((item) => item.label === 'page_view')?.count ||
                    0}
                </strong>
              </article>
              <article>
                <span>Productos vistos</span>
                <strong>
                  {events.find((item) => item.label === 'view_product')
                    ?.count || 0}
                </strong>
              </article>
              <article>
                <span>Videos reproducidos</span>
                <strong>
                  {events.find((item) => item.label === 'video_play')?.count ||
                    0}
                </strong>
              </article>
              <article>
                <span>Carrito</span>
                <strong>
                  {events.find((item) => item.label === 'add_to_cart')?.count ||
                    0}
                </strong>
              </article>
            </div>
            <div className="admin-metric-lists">
              <div>
                <p className="section-kicker">PRODUCTOS</p>
                <h2>Más vistos</h2>
                {productViews.length ? (
                  productViews.slice(0, 5).map(([slug, count]) => (
                    <article key={slug}>
                      <span>
                        {products.find((product) => product.slug === slug)
                          ?.name || slug}
                      </span>
                      <strong>{count}</strong>
                    </article>
                  ))
                ) : (
                  <p>Sin visualizaciones locales todavía.</p>
                )}
              </div>
              <div>
                <p className="section-kicker">PÁGINAS</p>
                <h2>Principales</h2>
                {paths.length ? (
                  paths.slice(0, 6).map((item) => (
                    <article key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.count}</strong>
                    </article>
                  ))
                ) : (
                  <p>Sin visitas locales todavía.</p>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
