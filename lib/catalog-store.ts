import { getDb } from '@/db/client';
import {
  hasAvailablePresentation,
  products as sourceProducts,
  type Product,
  type ProductPrices,
  type ProductStocks,
} from '@/data/products';

export const CATALOG_REVISION = 3;
const emptyStocks: ProductStocks = { halfOz: 0, oz: 0, qp: 0 };
const emptyPrices: ProductPrices = { halfOz: null, oz: null, qp: null };
type ProductRow = {
  slug: string;
  name: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'HIDDEN';
  featured: number;
  accent: Product['accent'];
  description_es: string;
  description_en: string;
  sort_order: number;
  active: number;
};
type MediaRow = {
  product_id: string;
  type: 'HERO' | 'GALLERY' | 'MOBILE' | 'VIDEO';
  url: string;
  sort_order: number;
};
type InventoryRow = {
  product_id: string;
  legacy_stock: number;
  price_half_oz_cents: number | null;
  price_oz_cents: number | null;
  price_qp_cents: number | null;
  prices_configured: number;
  stock_half_oz: number;
  stock_oz: number;
  stock_qp: number;
  stocks_configured: number;
  catalog_revision: number;
  updated_at: string;
};

const legacyStocks = (stock: number): ProductStocks => ({
  halfOz: Math.max(0, stock),
  oz: Math.max(0, stock),
  qp: Math.max(0, stock),
});

function rowStocks(row: InventoryRow | undefined, fallback: ProductStocks) {
  if (!row) return fallback;
  if (!row.stocks_configured) return legacyStocks(row.legacy_stock);
  return {
    halfOz: Math.max(0, row.stock_half_oz),
    oz: Math.max(0, row.stock_oz),
    qp: Math.max(0, row.stock_qp),
  } satisfies ProductStocks;
}

function rowPrices(row: InventoryRow | undefined, fallback: ProductPrices) {
  if (!row || !row.prices_configured || row.catalog_revision < CATALOG_REVISION)
    return fallback;
  return {
    halfOz: row.price_half_oz_cents,
    oz: row.price_oz_cents,
    qp: row.price_qp_cents,
  } satisfies ProductPrices;
}

function validAccent(value: string): Product['accent'] {
  return value === 'pink' || value === 'ice' || value === 'green'
    ? value
    : 'candy';
}

export async function readCatalog() {
  try {
    const db = getDb();
    const [productResult, mediaResult, inventoryResult] = await Promise.all([
      db
        .prepare(
          'SELECT slug, name, status, featured, accent, description_es, description_en, sort_order, active FROM products ORDER BY sort_order ASC',
        )
        .all<ProductRow>(),
      db
        .prepare(
          'SELECT product_id, type, url, sort_order FROM product_media ORDER BY product_id ASC, sort_order ASC',
        )
        .all<MediaRow>(),
      db
        .prepare(
          'SELECT product_id, stock AS legacy_stock, price_half_oz_cents, price_oz_cents, price_qp_cents, prices_configured, stock_half_oz, stock_oz, stock_qp, stocks_configured, catalog_revision, updated_at FROM product_inventory',
        )
        .all<InventoryRow>(),
    ]);
    const rows = new Map(productResult.results.map((row) => [row.slug, row]));
    const inventory = new Map(
      inventoryResult.results.map((row) => [row.product_id, row]),
    );
    const now = new Date().toISOString();
    const initializationStatements = sourceProducts.flatMap((source, index) => {
      const row = inventory.get(source.slug);
      const productRow = rows.get(source.slug);
      if ((row?.catalog_revision ?? 0) >= CATALOG_REVISION && productRow)
        return [];
      const stocks = rowStocks(row, source.stocks);
      const available = hasAvailablePresentation(stocks);
      const statements = [];
      if (!productRow) {
        statements.push(
          db
            .prepare(
              'INSERT INTO products (id, slug, name, category, status, featured, accent, description_es, description_en, sort_order, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO NOTHING',
            )
            .bind(
              source.slug,
              source.slug,
              source.name,
              'FLOWER',
              available ? 'AVAILABLE' : 'SOLD_OUT',
              1,
              source.accent,
              source.description.es,
              source.description.en,
              index,
              1,
              now,
              now,
            ),
        );
      } else if (!row || row.catalog_revision < CATALOG_REVISION) {
        statements.push(
          db
            .prepare(
              'UPDATE products SET name = ?, description_es = ?, description_en = ?, updated_at = ? WHERE slug = ?',
            )
            .bind(
              source.name,
              source.description.es,
              source.description.en,
              now,
              source.slug,
            ),
        );
      }
      if (!row || row.catalog_revision < CATALOG_REVISION) {
        statements.push(
          db
            .prepare(
              "DELETE FROM product_media WHERE product_id = ? AND type = 'VIDEO'",
            )
            .bind(source.slug),
        );
        if (source.video)
          statements.push(
            db
              .prepare(
                'INSERT INTO product_media (id, product_id, type, url, sort_order) VALUES (?, ?, ?, ?, ?)',
              )
              .bind(
                crypto.randomUUID(),
                source.slug,
                'VIDEO',
                source.video,
                source.images.length,
              ),
          );
      }
      statements.push(
        db
          .prepare(
            'INSERT INTO product_inventory (product_id, stock, available, price_half_oz_cents, price_oz_cents, price_qp_cents, prices_configured, stock_half_oz, stock_oz, stock_qp, stocks_configured, catalog_revision, updated_at) VALUES (?, 0, ?, ?, ?, ?, 1, ?, ?, ?, 1, ?, ?) ON CONFLICT(product_id) DO UPDATE SET available=excluded.available, price_half_oz_cents=excluded.price_half_oz_cents, price_oz_cents=excluded.price_oz_cents, price_qp_cents=excluded.price_qp_cents, prices_configured=1, stock_half_oz=excluded.stock_half_oz, stock_oz=excluded.stock_oz, stock_qp=excluded.stock_qp, stocks_configured=1, catalog_revision=excluded.catalog_revision, updated_at=excluded.updated_at',
          )
          .bind(
            source.slug,
            available ? 1 : 0,
            source.prices.halfOz,
            source.prices.oz,
            source.prices.qp,
            stocks.halfOz,
            stocks.oz,
            stocks.qp,
            CATALOG_REVISION,
            now,
          ),
      );
      return statements;
    });
    if (initializationStatements.length) {
      await db.batch(initializationStatements);
      return readCatalog();
    }

    const sourceBySlug = new Map(
      sourceProducts.map((product) => [product.slug, product]),
    );
    const databaseProducts = productResult.results.map((row) => {
      const source = sourceBySlug.get(row.slug);
      const inventoryRow = inventory.get(row.slug);
      const productMedia = mediaResult.results.filter(
        (item) => item.product_id === row.slug,
      );
      const hero = productMedia.find((item) => item.type === 'HERO')?.url;
      const gallery = productMedia
        .filter((item) => item.type === 'GALLERY')
        .map((item) => item.url);
      const images = hero
        ? [hero, ...gallery]
        : gallery.length
          ? gallery
          : source
            ? [...source.images]
            : [];
      const mobileImage =
        productMedia.find((item) => item.type === 'MOBILE')?.url ||
        source?.mobileImage ||
        images[0];
      const configuredVideo = productMedia.find(
        (item) => item.type === 'VIDEO',
      )?.url;
      const video =
        configuredVideo ||
        (productMedia.length === 0 ? source?.video : undefined);
      const stocks = rowStocks(inventoryRow, source?.stocks || emptyStocks);
      return {
        slug: row.slug,
        name: row.name,
        stocks,
        available: hasAvailablePresentation(stocks),
        updatedAt: inventoryRow?.updated_at ?? null,
        prices: rowPrices(inventoryRow, source?.prices || emptyPrices),
        accent: validAccent(row.accent),
        images,
        mobileImage,
        video,
        description: { es: row.description_es, en: row.description_en },
        hidden: row.status === 'HIDDEN' || !row.active,
        featured: Boolean(row.featured),
        sortOrder: row.sort_order,
      };
    });
    const missingFallbacks = sourceProducts
      .filter((source) => !rows.has(source.slug))
      .map((source, index) => ({
        ...source,
        mobileImage: source.mobileImage || source.images[0],
        featured: true,
        hidden: false,
        sortOrder: index,
      }));
    return [...databaseProducts, ...missingFallbacks].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  } catch {
    return sourceProducts.map((product, index) => ({
      ...product,
      mobileImage: product.mobileImage || product.images[0],
      featured: true,
      hidden: false,
      sortOrder: index,
    }));
  }
}
