import { getDb } from '@/db/client';
import { merchProducts as sourceProducts, type MerchProduct } from '@/data/merch';

type MerchRow = {
  id: string;
  slug: string;
  name: string;
  description_es: string;
  description_en: string;
  price_cents: number;
  inventory: number;
  active: number;
  images_json: string;
  variants_json: string;
  updated_at: string;
};

function parseArray<T>(value: string): T[] {
  try { const parsed = JSON.parse(value) as unknown; return Array.isArray(parsed) ? parsed as T[] : []; }
  catch { return []; }
}

export async function readMerchCatalog(options: { includeInactive?: boolean } = {}): Promise<MerchProduct[]> {
  try {
    const result = await getDb().prepare('SELECT id, slug, name, description_es, description_en, price_cents, inventory, active, images_json, variants_json, updated_at FROM merch_products ORDER BY updated_at DESC').all<MerchRow>();
    return result.results
      .map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: { es: row.description_es, en: row.description_en },
        priceCents: row.price_cents,
        inventory: row.inventory,
        active: Boolean(row.active),
        images: parseArray<string>(row.images_json),
        variants: parseArray<MerchProduct['variants'][number]>(row.variants_json),
        productType: 'merch' as const,
      }))
      .filter((item) => options.includeInactive || item.active);
  } catch {
    return sourceProducts.filter((item) => options.includeInactive || item.active);
  }
}
