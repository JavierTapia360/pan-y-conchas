'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AdminProductEditor,
  type AdminProduct,
} from '@/components/admin-product-editor';
import {
  adminPresentationOrder,
  hasAvailablePresentation,
  productPresentationLabels,
  type ProductPresentation,
} from '@/data/products';
import type { MerchProduct } from '@/data/merch';
import type { MediaLibraryItem } from '@/lib/media-library';
import { EditorialArrow } from '@/components/editorial-arrow';

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message?: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  created_at: string;
};
type Subscriber = {
  id: string;
  email: string;
  language: string;
  status: 'SUBSCRIBED' | 'UNSUBSCRIBED';
  created_at: string;
};
type Order = {
  id: string;
  customer_email: string;
  status: 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  total_cents: number;
  payment_status: string;
  created_at: string;
};
type SettingRow = {
  key: string;
  value_es: string;
  value_en: string;
  status: 'DRAFT' | 'PUBLISHED';
};
type AnalyticsRow = { event?: string; path?: string; count: number };
type Tab =
  | 'catalog'
  | 'wax'
  | 'content'
  | 'media'
  | 'messages'
  | 'newsletter'
  | 'analytics'
  | 'merch'
  | 'orders'
  | 'settings';

const tabs: { id: Tab; label: string }[] = [
  { id: 'catalog', label: 'Flower catalog' },
  { id: 'wax', label: 'Wax' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'messages', label: 'Messages' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'merch', label: 'Merch' },
  { id: 'orders', label: 'Orders' },
  { id: 'settings', label: 'Settings' },
];
const contentKeys = [
  'homeHeadline',
  'homeSubheadline',
  'aboutText',
  'contactText',
  'footerText',
  'announcement',
] as const;
const waxKeys = ['waxHeadline', 'waxBody', 'waxHero'] as const;
const generalKeys = ['contactEmail', 'instagram', 'x'] as const;
const emptyPrices = (): Record<ProductPresentation, string> => ({
  qp: '',
  oz: '',
  halfOz: '',
});
const productKey = (product: AdminProduct) => product.draftKey || product.slug;
const cloneProduct = (product: AdminProduct): AdminProduct =>
  JSON.parse(JSON.stringify(product)) as AdminProduct;

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    return response.ok ? ((await response.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('catalog');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [savedProducts, setSavedProducts] = useState<
    Record<string, AdminProduct>
  >({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [merch, setMerch] = useState<MerchProduct[]>([]);
  const [media, setMedia] = useState<MediaLibraryItem[]>([]);
  const [settings, setSettings] = useState<Record<string, SettingRow>>({});
  const [analytics, setAnalytics] = useState<{
    events: AnalyticsRow[];
    paths: AnalyticsRow[];
  }>({ events: [], paths: [] });
  const [editing, setEditing] = useState<string | null>(null);
  const [editingMerch, setEditingMerch] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState<string | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<
    Record<string, Record<ProductPresentation, string>>
  >({});
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('Loading control room…');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    void Promise.all([
      readJson<{ products: AdminProduct[] }>('/api/admin/products', {
        products: [],
      }),
      readJson<{ messages: Message[] }>('/api/admin/messages', {
        messages: [],
      }),
      readJson<{ subscribers: Subscriber[] }>('/api/admin/newsletter', {
        subscribers: [],
      }),
      readJson<{ orders: Order[] }>('/api/admin/orders', { orders: [] }),
      readJson<{ products: MerchProduct[] }>('/api/admin/merch', {
        products: [],
      }),
      readJson<{ media: MediaLibraryItem[] }>('/api/admin/media', {
        media: [],
      }),
      readJson<{ settings: SettingRow[] }>('/api/admin/settings', {
        settings: [],
      }),
      readJson<{ events: AnalyticsRow[]; paths: AnalyticsRow[] }>(
        '/api/admin/analytics',
        { events: [], paths: [] },
      ),
    ])
      .then(
        ([
          catalogData,
          messageData,
          subscriberData,
          orderData,
          merchData,
          mediaData,
          settingsData,
          analyticsData,
        ]) => {
          const normalized = catalogData.products.map((product) => ({
            ...product,
            status: product.hidden
              ? ('HIDDEN' as const)
              : product.available
                ? ('AVAILABLE' as const)
                : ('SOLD_OUT' as const),
          }));
          setProducts(normalized);
          setSavedProducts(
            Object.fromEntries(
              normalized.map((product) => [
                product.slug,
                cloneProduct(product),
              ]),
            ),
          );
          setPriceDrafts(
            Object.fromEntries(
              normalized.map((product) => [
                product.slug,
                Object.fromEntries(
                  adminPresentationOrder.map((presentation) => [
                    presentation,
                    product.prices[presentation] == null
                      ? ''
                      : (product.prices[presentation]! / 100).toFixed(2),
                  ]),
                ) as Record<ProductPresentation, string>,
              ]),
            ),
          );
          setMessages(messageData.messages);
          setSubscribers(subscriberData.subscribers);
          setOrders(orderData.orders);
          setMerch(merchData.products);
          setMedia(mediaData.media);
          setSettings(
            Object.fromEntries(
              settingsData.settings.map((row) => [row.key, row]),
            ),
          );
          setAnalytics(analyticsData);
          setNotice('Ready.');
        },
      )
      .catch(() => setNotice('Some admin data could not be loaded.'));
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const stats = useMemo(
    () => ({
      total: products.length,
      available: products.filter(
        (item) => !item.hidden && hasAvailablePresentation(item.stocks),
      ).length,
      sold: products.filter(
        (item) => !item.hidden && !hasAvailablePresentation(item.stocks),
      ).length,
      hidden: products.filter((item) => item.hidden).length,
      featured: products.filter((item) => item.featured).length,
    }),
    [products],
  );
  const matches = (values: Array<string | undefined>) =>
    !query ||
    values.some((value) => value?.toLowerCase().includes(query.toLowerCase()));
  const flash = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice('Ready.'), 4200);
  };

  function patchProduct(key: string, patch: Partial<AdminProduct>) {
    setDirty(true);
    setProducts((current) =>
      current.map((item) =>
        productKey(item) === key ? { ...item, ...patch } : item,
      ),
    );
  }
  function patchPrice(
    key: string,
    presentation: ProductPresentation,
    value: string,
  ) {
    setDirty(true);
    setPriceDrafts((current) => ({
      ...current,
      [key]: { ...(current[key] || emptyPrices()), [presentation]: value },
    }));
  }
  function addProductDraft() {
    const draftKey = `draft-${Date.now()}`;
    const starter = media.find((item) => item.kind === 'image')?.url;
    const draft: AdminProduct = {
      draftKey,
      isNew: true,
      slug: '',
      name: '',
      stocks: { qp: 0, oz: 0, halfOz: 0 },
      available: false,
      updatedAt: null,
      prices: { qp: null, oz: null, halfOz: null },
      accent: 'candy',
      images: starter ? [starter] : [],
      description: { es: '', en: '' },
      featured: false,
      hidden: true,
      status: 'HIDDEN',
      sortOrder:
        Math.max(-1, ...products.map((item) => item.sortOrder || 0)) + 1,
    };
    setProducts((current) => [draft, ...current]);
    setPriceDrafts((current) => ({ ...current, [draftKey]: emptyPrices() }));
    setEditing(draftKey);
    setDirty(true);
  }
  function cancelProduct(product: AdminProduct) {
    const key = productKey(product);
    if (product.isNew) {
      setProducts((current) =>
        current.filter((item) => productKey(item) !== key),
      );
      setPriceDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    } else {
      const saved = savedProducts[product.slug];
      if (saved) {
        setProducts((current) =>
          current.map((item) =>
            productKey(item) === key ? cloneProduct(saved) : item,
          ),
        );
        setPriceDrafts((current) => ({
          ...current,
          [key]: Object.fromEntries(
            adminPresentationOrder.map((presentation) => [
              presentation,
              saved.prices[presentation] == null
                ? ''
                : (saved.prices[presentation]! / 100).toFixed(2),
            ]),
          ) as Record<ProductPresentation, string>,
        }));
      }
    }
    setEditing(null);
    setDirty(false);
    flash('Draft changes cancelled.');
  }

  async function saveProduct(product: AdminProduct) {
    const key = productKey(product);
    const prices = Object.fromEntries(
      adminPresentationOrder.map((presentation) => {
        const normalized = (priceDrafts[key]?.[presentation] || '')
          .trim()
          .replace(',', '.');
        return [
          presentation,
          normalized === '' ? null : Math.round(Number(normalized) * 100),
        ];
      }),
    ) as AdminProduct['prices'];
    if (
      !product.slug.trim() ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)
    )
      return flash('Enter a valid, unique URL slug.');
    if (
      !product.name.trim() ||
      !product.description.es.trim() ||
      !product.description.en.trim()
    )
      return flash('Name and both descriptions are required.');
    if (!product.images.length)
      return flash('Select at least one product image.');
    if (
      Object.values(prices).some(
        (price) => price !== null && (!Number.isFinite(price) || price < 0),
      )
    )
      return flash('Enter a valid non-negative USD price or leave it blank.');
    if (
      Object.values(product.stocks).some(
        (stock) =>
          !Number.isFinite(stock) || !Number.isInteger(stock) || stock < 0,
      )
    )
      return flash('Stock must be a whole number of zero or greater.');
    const available = hasAvailablePresentation(product.stocks);
    const status = product.hidden
      ? 'HIDDEN'
      : available
        ? 'AVAILABLE'
        : 'SOLD_OUT';
    setSavingProduct(key);
    setNotice(product.isNew ? 'Creating product…' : 'Saving product changes…');
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug: product.slug,
          name: product.name.trim(),
          status,
          featured: Boolean(product.featured),
          active: !product.hidden,
          sortOrder: product.sortOrder || 0,
          accent: product.accent,
          descriptionEs: product.description.es.trim(),
          descriptionEn: product.description.en.trim(),
          stocks: product.stocks,
          prices,
          media: product.images,
          mobileImage: product.mobileImage || '',
          video: product.video || '',
          isNew: Boolean(product.isNew),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        product?: AdminProduct;
      } | null;
      if (!response.ok || !result?.success)
        throw new Error(
          result?.message || 'The backend did not save this product.',
        );
      const saved: AdminProduct = {
        ...(result.product || product),
        isNew: false,
        draftKey: undefined,
        prices,
        available,
        status,
      };
      setProducts((current) =>
        current.map((item) => (productKey(item) === key ? saved : item)),
      );
      setSavedProducts((current) => ({
        ...current,
        [saved.slug]: cloneProduct(saved),
      }));
      setPriceDrafts((current) => {
        const next = {
          ...current,
          [saved.slug]: { ...(current[key] || emptyPrices()) },
        };
        if (key !== saved.slug) delete next[key];
        return next;
      });
      setEditing(null);
      setDirty(false);
      try {
        window.localStorage.setItem(
          'gf_catalog_refresh_v1',
          new Date().toISOString(),
        );
      } catch {
        /* Storefront polling is the fallback. */
      }
      window.dispatchEvent(new Event('gf-catalog-refresh'));
      flash(
        product.isNew
          ? 'Product created and stored successfully.'
          : 'Changes saved. The storefront will refresh automatically.',
      );
    } catch (error) {
      flash(
        error instanceof Error
          ? error.message
          : 'The product could not be saved.',
      );
    } finally {
      setSavingProduct(null);
    }
  }

  async function saveSettings(
    keys: readonly string[],
    status: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED',
  ) {
    setNotice(status === 'DRAFT' ? 'Saving draft…' : 'Publishing content…');
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        settings: keys.map((key) => ({
          key,
          valueEs: settings[key]?.value_es || '',
          valueEn: settings[key]?.value_en || '',
          status,
        })),
      }),
    });
    if (response.ok) {
      setDirty(false);
      flash(status === 'DRAFT' ? 'Draft saved.' : 'Content published.');
    } else flash('Content could not be saved.');
  }
  function updateSetting(
    key: string,
    locale: 'value_es' | 'value_en',
    value: string,
  ) {
    setDirty(true);
    setSettings((current) => ({
      ...current,
      [key]: {
        key,
        value_es: current[key]?.value_es || '',
        value_en: current[key]?.value_en || '',
        status: current[key]?.status || 'DRAFT',
        [locale]: value,
      },
    }));
  }
  async function updateStatus(endpoint: string, id: string, status: string) {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    flash(response.ok ? 'Status updated.' : 'Status could not be updated.');
    return response.ok;
  }
  function patchMerch(id: string, patch: Partial<MerchProduct>) {
    setDirty(true);
    setMerch((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }
  async function saveMerch(product: MerchProduct) {
    setNotice('Saving merch product…');
    const response = await fetch('/api/admin/merch', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: product.id,
        slug: product.slug,
        name: product.name,
        descriptionEs: product.description.es,
        descriptionEn: product.description.en,
        priceCents: product.priceCents,
        inventory: product.inventory,
        active: product.active,
        images: product.images,
        variants: product.variants,
        productType: 'merch',
      }),
    });
    if (response.ok) {
      setDirty(false);
      flash('Merch product saved.');
    } else flash('Review required merch fields before saving.');
  }
  function addMerchDraft() {
    const id = `draft-${Date.now()}`;
    setMerch((current) => [
      {
        id,
        slug: '',
        name: '',
        description: { es: '', en: '' },
        priceCents: 0,
        inventory: 0,
        active: false,
        images: [],
        variants: [],
        productType: 'merch',
      },
      ...current,
    ]);
    setEditingMerch(id);
    setDirty(true);
  }
  const settingsEditor = (keys: readonly string[], intro: string) => (
    <section className="admin-content">
      <p className="admin-help">{intro}</p>
      {keys.map((key) => (
        <fieldset key={key}>
          <legend>
            {key.replace(/([A-Z])/g, ' $1')}{' '}
            <small>{settings[key]?.status || 'UNSAVED'}</small>
          </legend>
          <label>
            ES
            <textarea
              value={settings[key]?.value_es || ''}
              onChange={(event) =>
                updateSetting(key, 'value_es', event.target.value)
              }
            />
          </label>
          <label>
            EN
            <textarea
              value={settings[key]?.value_en || ''}
              onChange={(event) =>
                updateSetting(key, 'value_en', event.target.value)
              }
            />
          </label>
        </fieldset>
      ))}
      <div className="admin-actions">
        <button
          className="admin-edit"
          type="button"
          onClick={() => saveSettings(keys, 'DRAFT')}
        >
          Save draft
        </button>
        <button
          className="admin-save"
          type="button"
          onClick={() => saveSettings(keys)}
        >
          Publish
        </button>
      </div>
    </section>
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <Image
            src="/assets/cuatesfarmz-logo-c.webp"
            alt="CUATESFARMZ"
            width={220}
            height={74}
          />
          <b>ADMIN / CONTROL ROOM</b>
        </div>
        <nav aria-label="Admin sections">
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
          Preview site <EditorialArrow />
        </Link>
      </aside>
      <section className="admin-main">
        <header>
          <div>
            <p>CUATESFARMZ / CONTROL ROOM</p>
            <h1>{tabs.find((item) => item.id === tab)?.label}</h1>
          </div>
          <div className="admin-notice">
            <output className={dirty ? 'dirty' : ''}>
              {dirty ? 'Unsaved changes' : notice}
            </output>
            {[
              'catalog',
              'messages',
              'newsletter',
              'media',
              'merch',
              'orders',
            ].includes(tab) ? (
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search…"
                aria-label="Search current section"
              />
            ) : null}
          </div>
        </header>

        {tab === 'catalog' && (
          <>
            <div className="admin-stats admin-stats-five">
              <article>
                <span>Products</span>
                <strong>{stats.total}</strong>
              </article>
              <article>
                <span>Available</span>
                <strong>{stats.available}</strong>
              </article>
              <article>
                <span>Sold out</span>
                <strong>{stats.sold}</strong>
              </article>
              <article>
                <span>Hidden</span>
                <strong>{stats.hidden}</strong>
              </article>
              <article>
                <span>Featured</span>
                <strong>{stats.featured}</strong>
              </article>
            </div>
            <section className="admin-catalog-manager">
              <div className="admin-toolbar">
                <div>
                  <p className="section-kicker">CENTRAL CATALOG</p>
                  <h2>Products and presentation inventory</h2>
                </div>
                <button
                  className="admin-save"
                  type="button"
                  onClick={addProductDraft}
                >
                  New product
                </button>
              </div>
              <div className="admin-product-list">
                {products
                  .filter((product) =>
                    matches([product.name, product.slug, product.status]),
                  )
                  .map((product) => {
                    const key = productKey(product);
                    const status = product.hidden
                      ? 'HIDDEN'
                      : hasAvailablePresentation(product.stocks)
                        ? 'AVAILABLE'
                        : 'SOLD OUT';
                    return (
                      <article
                        className={editing === key ? 'editing' : ''}
                        key={key}
                      >
                        <div className="admin-product-row">
                          <div className="admin-product-id">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt=""
                                width={84}
                                height={84}
                              />
                            ) : (
                              <span className="admin-thumb-placeholder">
                                NEW
                              </span>
                            )}
                            <div>
                              <b>{product.name || 'Untitled product'}</b>
                              <span>{product.slug || 'slug pending'}</span>
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
                                {product.stocks[presentation]}
                              </span>
                            ))}
                          </div>
                          <div className="admin-row-flags">
                            {product.featured ? <span>FEATURED</span> : null}
                            {product.hidden ? <span>HIDDEN</span> : null}
                          </div>
                          <button
                            className="admin-edit"
                            type="button"
                            onClick={() =>
                              setEditing(editing === key ? null : key)
                            }
                          >
                            {editing === key ? 'Close editor' : 'Edit'}
                          </button>
                          {!product.isNew && !product.hidden ? (
                            <Link
                              href={`/flower/${product.slug}`}
                              target="_blank"
                              prefetch={false}
                            >
                              View <EditorialArrow />
                            </Link>
                          ) : null}
                        </div>
                        {editing === key ? (
                          <AdminProductEditor
                            product={product}
                            prices={priceDrafts[key] || emptyPrices()}
                            media={media}
                            saving={savingProduct === key}
                            onPatch={(patch) => patchProduct(key, patch)}
                            onPrice={(presentation, value) =>
                              patchPrice(key, presentation, value)
                            }
                            onSave={() => void saveProduct(product)}
                            onCancel={() => cancelProduct(product)}
                          />
                        ) : null}
                      </article>
                    );
                  })}
              </div>
            </section>
          </>
        )}

        {tab === 'wax' &&
          settingsEditor(
            waxKeys,
            'Edit the bilingual Wax story and approved local hero asset path.',
          )}
        {tab === 'content' &&
          settingsEditor(
            contentKeys,
            'Blank fields keep the approved built-in copy. Drafts remain private until published.',
          )}
        {tab === 'settings' &&
          settingsEditor(
            generalKeys,
            'Only verified contact and social details should be published.',
          )}
        {tab === 'media' && (
          <section className="admin-library">
            {media
              .filter((item) => matches([item.product, item.role, item.url]))
              .map((item) => (
                <article key={item.url}>
                  <div>
                    {item.kind === 'image' ? (
                      <Image src={item.url} alt="" fill sizes="240px" />
                    ) : (
                      <span>
                        VIDEO
                        <br />
                        MP4
                      </span>
                    )}
                  </div>
                  <b>{item.product}</b>
                  <small>{item.role}</small>
                  <code>{item.url}</code>
                </article>
              ))}
          </section>
        )}
        {tab === 'analytics' && (
          <section className="admin-analytics">
            <div>
              <p className="section-kicker">LAST 30 DAYS</p>
              <h2>Events</h2>
              {analytics.events.length ? (
                analytics.events.map((item) => (
                  <article key={item.event}>
                    <span>{item.event?.replaceAll('_', ' ')}</span>
                    <strong>{item.count}</strong>
                  </article>
                ))
              ) : (
                <p>No consented events yet.</p>
              )}
            </div>
            <div>
              <p className="section-kicker">PAGE VIEWS</p>
              <h2>Top paths</h2>
              {analytics.paths.length ? (
                analytics.paths.map((item) => (
                  <article key={item.path}>
                    <span>{item.path}</span>
                    <strong>{item.count}</strong>
                  </article>
                ))
              ) : (
                <p>No page views yet.</p>
              )}
            </div>
            <aside>
              Privacy-safe reporting only: no names, emails, street addresses or
              raw IPs are stored.
            </aside>
          </section>
        )}
        {tab === 'messages' && (
          <RecordList empty="No contact messages yet.">
            {messages
              .filter((item) =>
                matches([item.name, item.email, item.subject, item.status]),
              )
              .map((item) => (
                <article key={item.id}>
                  <time>{new Date(item.created_at).toLocaleDateString()}</time>
                  <div>
                    <b>{item.name}</b>
                    <a href={`mailto:${item.email}`}>{item.email}</a>
                    {item.phone ? <span>{item.phone}</span> : null}
                  </div>
                  <div>
                    <b>{item.subject}</b>
                    <p>{item.message}</p>
                  </div>
                  <select
                    value={item.status}
                    onChange={async (event) => {
                      const status = event.target.value as Message['status'];
                      if (
                        await updateStatus(
                          '/api/admin/messages',
                          item.id,
                          status,
                        )
                      )
                        setMessages((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, status } : entry,
                          ),
                        );
                    }}
                  >
                    <option>NEW</option>
                    <option>READ</option>
                    <option>ARCHIVED</option>
                  </select>
                </article>
              ))}
          </RecordList>
        )}
        {tab === 'newsletter' && (
          <RecordList empty="No newsletter subscribers yet.">
            {subscribers
              .filter((item) =>
                matches([item.email, item.language, item.status]),
              )
              .map((item) => (
                <article key={item.id}>
                  <time>{new Date(item.created_at).toLocaleDateString()}</time>
                  <div>
                    <b>{item.email}</b>
                    <span>{item.language.toUpperCase()}</span>
                  </div>
                  <div>
                    <p>Consent-backed site signup</p>
                  </div>
                  <select
                    value={item.status}
                    onChange={async (event) => {
                      const status = event.target.value as Subscriber['status'];
                      if (
                        await updateStatus(
                          '/api/admin/newsletter',
                          item.id,
                          status,
                        )
                      )
                        setSubscribers((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, status } : entry,
                          ),
                        );
                    }}
                  >
                    <option>SUBSCRIBED</option>
                    <option>UNSUBSCRIBED</option>
                  </select>
                </article>
              ))}
          </RecordList>
        )}
        {tab === 'orders' && (
          <RecordList empty="No merch orders yet.">
            {orders
              .filter((item) =>
                matches([
                  item.id,
                  item.customer_email,
                  item.status,
                  item.payment_status,
                ]),
              )
              .map((item) => (
                <article key={item.id}>
                  <time>{new Date(item.created_at).toLocaleDateString()}</time>
                  <div>
                    <b>{item.customer_email}</b>
                    <span>{item.id}</span>
                  </div>
                  <div>
                    <b>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(item.total_cents / 100)}
                    </b>
                    <p>{item.payment_status}</p>
                  </div>
                  <select
                    value={item.status}
                    onChange={async (event) => {
                      const status = event.target.value as Order['status'];
                      if (
                        await updateStatus('/api/admin/orders', item.id, status)
                      )
                        setOrders((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, status } : entry,
                          ),
                        );
                    }}
                  >
                    <option>PAID</option>
                    <option>PROCESSING</option>
                    <option>SHIPPED</option>
                    <option>COMPLETED</option>
                    <option>CANCELLED</option>
                  </select>
                </article>
              ))}
          </RecordList>
        )}
        {tab === 'merch' && (
          <section>
            <div className="admin-toolbar">
              <p>
                Conventional merchandise remains independent from the Flower and
                Wax catalog.
              </p>
              <button
                className="admin-save"
                type="button"
                onClick={addMerchDraft}
              >
                New merch draft
              </button>
            </div>
            <div className="admin-list">
              {merch
                .filter((item) =>
                  matches([
                    item.name,
                    item.slug,
                    item.active ? 'active' : 'draft',
                  ]),
                )
                .map((product) => (
                  <article key={product.id}>
                    <div className="admin-product-row">
                      <div className="admin-product-id">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt=""
                            width={84}
                            height={84}
                          />
                        ) : (
                          <span className="admin-thumb-placeholder">MERCH</span>
                        )}
                        <div>
                          <b>{product.name || 'Untitled draft'}</b>
                          <span>{product.slug || 'slug pending'}</span>
                        </div>
                      </div>
                      <span>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(product.priceCents / 100)}
                      </span>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={product.active}
                          onChange={(event) =>
                            patchMerch(product.id, {
                              active: event.target.checked,
                            })
                          }
                        />
                        Active
                      </label>
                      <button
                        className="admin-edit"
                        type="button"
                        onClick={() =>
                          setEditingMerch(
                            editingMerch === product.id ? null : product.id,
                          )
                        }
                      >
                        {editingMerch === product.id ? 'Close' : 'Edit'}
                      </button>
                      <button
                        className="admin-save"
                        type="button"
                        onClick={() => void saveMerch(product)}
                      >
                        Save
                      </button>
                      <Link prefetch={false} href="/merch" target="_blank">
                        View <EditorialArrow />
                      </Link>
                    </div>
                    {editingMerch === product.id && (
                      <div className="admin-editor">
                        <label>
                          Name
                          <input
                            value={product.name}
                            onChange={(event) =>
                              patchMerch(product.id, {
                                name: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Slug
                          <input
                            value={product.slug}
                            onChange={(event) =>
                              patchMerch(product.id, {
                                slug: event.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, '-'),
                              })
                            }
                          />
                        </label>
                        <label>
                          Price in cents
                          <input
                            type="number"
                            min="0"
                            value={product.priceCents}
                            onChange={(event) =>
                              patchMerch(product.id, {
                                priceCents: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label>
                          Inventory
                          <input
                            type="number"
                            min="0"
                            value={product.inventory}
                            onChange={(event) =>
                              patchMerch(product.id, {
                                inventory: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="wide">
                          Description ES
                          <textarea
                            value={product.description.es}
                            onChange={(event) =>
                              patchMerch(product.id, {
                                description: {
                                  ...product.description,
                                  es: event.target.value,
                                },
                              })
                            }
                          />
                        </label>
                        <label className="wide">
                          Description EN
                          <textarea
                            value={product.description.en}
                            onChange={(event) =>
                              patchMerch(product.id, {
                                description: {
                                  ...product.description,
                                  en: event.target.value,
                                },
                              })
                            }
                          />
                        </label>
                        <label className="wide">
                          Approved image paths, one per line
                          <textarea
                            value={product.images.join('\n')}
                            onChange={(event) =>
                              patchMerch(product.id, {
                                images: event.target.value
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </label>
                        <label className="wide">
                          Variants (one per line: Size | Color)
                          <textarea
                            value={product.variants
                              .map(
                                (item) =>
                                  `${item.size || ''} | ${item.color || ''}`,
                              )
                              .join('\n')}
                            onChange={(event) =>
                              patchMerch(product.id, {
                                variants: event.target.value
                                  .split('\n')
                                  .filter(Boolean)
                                  .map((line) => {
                                    const [size, color] = line
                                      .split('|')
                                      .map((part) => part.trim());
                                    return {
                                      size: size || undefined,
                                      color: color || undefined,
                                    };
                                  }),
                              })
                            }
                          />
                        </label>
                      </div>
                    )}
                  </article>
                ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function RecordList({
  children,
  empty,
}: {
  children: React.ReactNode;
  empty: string;
}) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return (
    <section className="admin-records">
      {count ? children : <p>{empty}</p>}
    </section>
  );
}
