'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  MapPin,
  QrCode,
  Scale,
  Share2,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { useSelection } from '@/components/selection-provider';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ProductCard } from '@/components/product-card';
import { RecentlyViewed } from '@/components/recently-viewed';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCatalog } from '@/hooks/use-catalog';
import { siteConfig } from '@/data/site';
import { track } from '@/lib/analytics';
import { EditorialArrow } from '@/components/editorial-arrow';

export function SelectionPage() {
  const { copy, language } = useLanguage();
  const {
    items,
    compareItems,
    region,
    setRegion,
    remove,
    clear,
    toggleCompare,
    isCompared,
  } = useSelection();
  const catalog = useCatalog().filter((product) => !product.hidden);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const flowerCount = items.filter((item) => item.kind === 'flower').length;
  const waxCount = items.filter((item) => item.kind === 'wax').length;
  const recommendations = catalog
    .filter((product) => !items.some((item) => item.slug === product.slug))
    .slice(0, 3);

  const selectionQuery = useMemo(
    () =>
      items
        .map((item) => (item.kind === 'wax' ? 'wax' : item.slug))
        .filter(Boolean)
        .join(','),
    [items],
  );
  const shareUrl =
    typeof window === 'undefined' || !selectionQuery
      ? ''
      : `${window.location.origin}/selection?selection=${encodeURIComponent(selectionQuery)}&lang=${language}`;

  useEffect(() => {
    if (!shareOpen || !shareUrl) return;
    void QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setQrData);
  }, [shareOpen, shareUrl]);

  async function copyShareLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
    track('selection_share', { method: 'copy', language });
  }

  async function nativeShare() {
    if (!navigator.share) return copyShareLink();
    try {
      await navigator.share({
        title: copy.selection.shareTitle,
        text: copy.selection.shareBody,
        url: shareUrl,
      });
      track('selection_share', { method: 'native', language });
    } catch {
      /* The visitor closed the operating-system share sheet. */
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="selection-page">
        <section
          className="selection-flow"
          aria-label={copy.selection.summaryTitle}
        >
          <div className="selection-flow-labels">
            <strong className="complete">
              <Check aria-hidden="true" />
              <span>01</span> {copy.selection.flowOne}
            </strong>
            <strong className={items.length ? 'active' : ''}>
              <span>02</span> {copy.selection.flowTwo}
            </strong>
            <strong>
              <span>03</span> {copy.selection.flowThree}
            </strong>
          </div>
          <Progress value={items.length ? 66 : 33} />
        </section>

        <header>
          <div>
            <p className="section-kicker">CUATESFARMZ / 05</p>
            <h1>{copy.selection.title}</h1>
          </div>
          <div className="selection-page-intro">
            <span>{String(items.length).padStart(2, '0')}</span>
            <p>{copy.selection.description}</p>
          </div>
        </header>

        {items.length === 0 ? (
          <section className="selection-page-empty">
            <ShoppingBag aria-hidden="true" />
            <h2>{copy.selection.empty}</h2>
            <p>{copy.selection.emptyBody}</p>
            <div>
              <Link
                prefetch={false}
                className="button button-dark"
                href="/flower"
              >
                {copy.selection.explore}
              </Link>
              <Link
                prefetch={false}
                className="button button-outline"
                href="/wax"
              >
                {copy.nav.wax}
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="selection-review-layout">
              <div>
                <div className="selection-review-heading">
                  <h2>{copy.selection.flowTwo}</h2>
                  <div>
                    <button
                      className="button button-outline"
                      onClick={() =>
                        document
                          .querySelector<HTMLButtonElement>(
                            '.comparison-tray [data-slot="dialog-trigger"]',
                          )
                          ?.click()
                      }
                      disabled={!compareItems.length}
                    >
                      <Scale aria-hidden="true" />
                      {copy.selection.compareTitle} ({compareItems.length})
                    </button>
                    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                      <DialogTrigger className="button button-dark">
                        <Share2 aria-hidden="true" />
                        {copy.selection.share}
                      </DialogTrigger>
                      <DialogContent className="share-selection-dialog">
                        <DialogHeader>
                          <p className="section-kicker">CUATESFARMZ / SHARE</p>
                          <DialogTitle>{copy.selection.shareTitle}</DialogTitle>
                          <DialogDescription>
                            {copy.selection.shareBody}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="selection-qr">
                          {qrData ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={qrData}
                              alt="QR code for this CUATESFARMZ selection"
                            />
                          ) : (
                            <div
                              className="selection-qr-skeleton"
                              aria-label="Loading QR code"
                            >
                              <QrCode aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <label>
                          {copy.selection.share}
                          <input readOnly value={shareUrl} />
                        </label>
                        <div className="share-selection-actions">
                          <button
                            className="button button-red"
                            onClick={copyShareLink}
                          >
                            {copied ? (
                              <Check aria-hidden="true" />
                            ) : (
                              <Copy aria-hidden="true" />
                            )}
                            {copied
                              ? copy.selection.copied
                              : copy.selection.copyLink}
                          </button>
                          <button
                            className="button button-outline"
                            onClick={nativeShare}
                          >
                            <Share2 aria-hidden="true" />
                            {copy.selection.nativeShare}
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div
                  className="selection-page-grid"
                  aria-label={copy.selection.items}
                >
                  {items.map((item, index) => {
                    const compared = isCompared(item.id);
                    const name =
                      item.kind === 'wax' ? copy.selection.waxName : item.name;
                    return (
                      <article
                        key={item.id}
                        className={`accent-${item.accent || 'gold'}`}
                      >
                        <Link
                          prefetch={false}
                          href={
                            item.kind === 'flower'
                              ? `/flower/${item.slug}`
                              : '/wax'
                          }
                          className="selection-page-image"
                        >
                          <Image
                            src={item.image}
                            alt={`${name} CUATESFARMZ`}
                            fill
                            sizes="(max-width: 700px) 100vw, 30vw"
                          />
                          <span>0{index + 1}</span>
                        </Link>
                        <div className="selection-page-card-copy">
                          <div>
                            <p>
                              {item.kind === 'flower'
                                ? copy.nav.flower
                                : copy.nav.wax}
                            </p>
                            <h3>{name}</h3>
                            <button
                              className={
                                compared
                                  ? 'compare-link active'
                                  : 'compare-link'
                              }
                              aria-pressed={compared}
                              onClick={() => toggleCompare(item)}
                            >
                              <Scale aria-hidden="true" />
                              {compared
                                ? copy.selection.comparing
                                : copy.selection.addCompare}
                            </button>
                          </div>
                          <button
                            aria-label={`${copy.selection.remove} ${name}`}
                            onClick={() => {
                              remove(item.id);
                              track('selection_remove', {
                                slug: item.slug || 'wax',
                                language,
                              });
                            }}
                          >
                            <Trash2 aria-hidden="true" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="selection-summary-card">
                <p className="section-kicker">{copy.selection.summaryTitle}</p>
                <div className="selection-summary-count">
                  <span>{String(items.length).padStart(2, '0')}</span>
                  <strong>{copy.selection.items}</strong>
                </div>
                <dl>
                  <div>
                    <dt>{copy.selection.flowerCount}</dt>
                    <dd>{flowerCount}</dd>
                  </div>
                  <div>
                    <dt>{copy.selection.waxCount}</dt>
                    <dd>{waxCount}</dd>
                  </div>
                  <div>
                    <dt>{copy.selection.compareTitle}</dt>
                    <dd>{compareItems.length}</dd>
                  </div>
                </dl>
                <p>{copy.selection.disclaimer}</p>
                <a className="button button-red" href="#selection-information">
                  {copy.selection.flowThree}
                  <EditorialArrow />
                </a>
                <button className="selection-clear" onClick={clear}>
                  {copy.selection.clear}
                </button>
              </aside>
            </section>

            <section
              className="selection-information"
              id="selection-information"
            >
              <div>
                <p className="section-kicker">
                  03 / {copy.selection.flowThree}
                </p>
                <h2>{copy.selection.regionTitle}</h2>
                <p>{copy.selection.regionBody}</p>
              </div>
              <div>
                <label htmlFor="selection-region">
                  <MapPin aria-hidden="true" />
                  {copy.selection.regionSelect}
                </label>
                <select
                  id="selection-region"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                >
                  <option value="">{copy.selection.regionSelect}</option>
                  {siteConfig.contactStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <p
                  className={region ? 'region-notice visible' : 'region-notice'}
                >
                  <Check aria-hidden="true" />
                  {region
                    ? `${region}: ${copy.selection.regionNotice}`
                    : copy.selection.regionNotice}
                </p>
                <Link
                  prefetch={false}
                  href="/contact"
                  className="button button-red"
                >
                  {copy.selection.contact}
                  <EditorialArrow />
                </Link>
              </div>
            </section>

            {recommendations.length > 0 && (
              <section className="section selection-recommendations">
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">CUATESFARMZ / DISCOVER</p>
                    <h2>{copy.selection.recommendations}</h2>
                  </div>
                </div>
                <div className="product-grid">
                  {recommendations.map((product, index) => (
                    <ProductCard
                      key={product.slug}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        <RecentlyViewed />
      </main>
      <SiteFooter />
    </>
  );
}
