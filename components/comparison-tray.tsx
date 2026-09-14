'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, X } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { EditorialArrow } from '@/components/editorial-arrow';
import { useSelection } from '@/components/selection-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCatalog } from '@/hooks/use-catalog';

export function ComparisonTray() {
  const { copy } = useLanguage();
  const { compareItems, toggleCompare } = useSelection();
  const catalog = useCatalog();
  const pathname = usePathname();
  const supportsComparison =
    pathname === '/' ||
    pathname === '/selection' ||
    pathname === '/wax' ||
    pathname.startsWith('/flower');

  if (!compareItems.length || !supportsComparison) return null;

  return (
    <Dialog>
      <aside
        className="comparison-tray"
        aria-label={copy.selection.compareTitle}
      >
        <div>
          <Scale aria-hidden="true" />
          <strong>{copy.selection.compareTitle}</strong>
          <span>{compareItems.length}/3</span>
        </div>
        <div className="comparison-tray-items">
          {compareItems.map((item) => (
            <div key={item.id}>
              <span>
                <Image src={item.image} alt="" fill sizes="38px" />
              </span>
              <b>{item.kind === 'wax' ? copy.selection.waxName : item.name}</b>
              <button
                onClick={() => toggleCompare(item)}
                aria-label={`${copy.selection.removeCompare} ${item.name}`}
              >
                <X aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <DialogTrigger className="button button-red">
          {copy.selection.compareCta}
        </DialogTrigger>
      </aside>

      <DialogContent className="comparison-dialog">
        <DialogHeader>
          <p className="section-kicker">CUATESFARMZ / COMPARE</p>
          <DialogTitle>{copy.selection.compareTitle}</DialogTitle>
          <DialogDescription>
            {copy.selection.compareDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="comparison-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">{copy.selection.category}</span>
                </th>
                {compareItems.map((item) => (
                  <th scope="col" key={item.id}>
                    <span className="comparison-image">
                      <Image src={item.image} alt="" fill sizes="190px" />
                    </span>
                    <strong>
                      {item.kind === 'wax' ? copy.selection.waxName : item.name}
                    </strong>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{copy.selection.category}</th>
                {compareItems.map((item) => (
                  <td key={item.id}>
                    {item.kind === 'wax' ? copy.nav.wax : copy.nav.flower}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">{copy.product.availability}</th>
                {compareItems.map((item) => {
                  const product = catalog.find(
                    (entry) => entry.slug === item.slug,
                  );
                  const status =
                    item.kind === 'wax' || product?.available == null
                      ? copy.status.inquire
                      : product.available
                        ? copy.status.available
                        : copy.status.soldOut;
                  return <td key={item.id}>{status}</td>;
                })}
              </tr>
              <tr>
                <th scope="row">{copy.selection.galleryCount}</th>
                {compareItems.map((item) => {
                  const product = catalog.find(
                    (entry) => entry.slug === item.slug,
                  );
                  return (
                    <td key={item.id}>
                      {item.kind === 'wax' ? 3 : product?.images.length || '—'}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <th scope="row">{copy.selection.video}</th>
                {compareItems.map((item) => {
                  const product = catalog.find(
                    (entry) => entry.slug === item.slug,
                  );
                  return (
                    <td key={item.id}>
                      {product?.video ? copy.selection.yes : copy.selection.no}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="comparison-dialog-actions">
          {compareItems.map((item) => (
            <Link
              prefetch={false}
              key={item.id}
              className="text-link"
              href={item.kind === 'flower' ? `/flower/${item.slug}` : '/wax'}
            >
              {copy.actions.view}{' '}
              {item.kind === 'wax' ? copy.nav.wax : item.name}
              <EditorialArrow />
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
