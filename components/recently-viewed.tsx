'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { useSelection } from '@/components/selection-provider';
import { track } from '@/lib/analytics';
import { useCatalog } from '@/hooks/use-catalog';

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { copy, language } = useLanguage();
  const { recentItems, contains, add, remove } = useSelection();
  const catalog = useCatalog();
  const visible = recentItems
    .flatMap((item) => {
      if (item.kind !== 'flower') return [item];
      const product = catalog.find((entry) => entry.slug === item.slug);
      if (!product || product.hidden) return [];
      return [
        {
          ...item,
          name: product.name,
          image: product.images[0],
          accent: product.accent,
        },
      ];
    })
    .filter((item) => item.id !== excludeId)
    .slice(0, 5);

  if (!visible.length) return null;

  return (
    <section className="recently-viewed section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">{copy.selection.recentKicker}</p>
          <h2>{copy.selection.recentTitle}</h2>
        </div>
      </div>
      <div className="recently-viewed-rail">
        {visible.map((item, index) => {
          const selected = contains(item.id);
          const name = item.kind === 'wax' ? copy.selection.waxName : item.name;
          return (
            <article key={item.id}>
              <Link
                prefetch={false}
                href={item.kind === 'flower' ? `/flower/${item.slug}` : '/wax'}
              >
                <span className="recently-viewed-image">
                  <Image
                    src={item.image}
                    alt={`${name} CUATESFARMZ`}
                    fill
                    sizes="(max-width: 700px) 70vw, 280px"
                  />
                  <b>0{index + 1}</b>
                </span>
                <h3>{name}</h3>
              </Link>
              <button
                aria-label={`${selected ? copy.selection.remove : copy.selection.add} ${name}`}
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
                {selected ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Plus aria-hidden="true" />
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
