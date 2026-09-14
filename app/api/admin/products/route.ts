import { getDb } from '@/db/client';
import { CATALOG_REVISION, readCatalog } from '@/lib/catalog-store';
import { isAdminRequest } from '@/lib/admin-auth';
import { adminProductSchema } from '@/lib/validation';
import { z } from 'zod';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { recordAdminAudit } from '@/lib/admin-audit';
import { hasAvailablePresentation } from '@/data/products';

export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  return apiSuccess(
    { products: await readCatalog() },
    { headers: { 'cache-control': 'no-store' } },
  );
}
export async function PUT(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const parsed = adminProductSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return apiError(
      'INVALID_PRODUCT',
      'Review the submitted product fields.',
      400,
      z.treeifyError(parsed.error),
    );
  const value = parsed.data;
  const now = new Date().toISOString();
  const available = hasAvailablePresentation(value.stocks);
  const status =
    value.status === 'HIDDEN' ? 'HIDDEN' : available ? 'AVAILABLE' : 'SOLD_OUT';
  try {
    const db = getDb();
    if (value.isNew) {
      const existing = await db
        .prepare('SELECT slug FROM products WHERE slug = ?')
        .bind(value.slug)
        .first<{ slug: string }>();
      if (existing)
        return apiError(
          'PRODUCT_ALREADY_EXISTS',
          'A product with this URL slug already exists.',
          409,
        );
    }
    const statements = [
      db
        .prepare(
          'INSERT INTO products (id, slug, name, category, status, featured, accent, description_es, description_en, sort_order, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name, status=excluded.status, featured=excluded.featured, accent=excluded.accent, description_es=excluded.description_es, description_en=excluded.description_en, sort_order=excluded.sort_order, active=excluded.active, updated_at=excluded.updated_at',
        )
        .bind(
          value.slug,
          value.slug,
          value.name,
          'FLOWER',
          status,
          value.featured ? 1 : 0,
          value.accent,
          value.descriptionEs,
          value.descriptionEn,
          value.sortOrder,
          status === 'HIDDEN' ? 0 : 1,
          now,
          now,
        ),
      db
        .prepare('DELETE FROM product_media WHERE product_id = ?')
        .bind(value.slug),
      db
        .prepare(
          'INSERT INTO product_inventory (product_id, stock, available, price_half_oz_cents, price_oz_cents, price_qp_cents, prices_configured, stock_half_oz, stock_oz, stock_qp, stocks_configured, catalog_revision, updated_at) VALUES (?, 0, ?, ?, ?, ?, 1, ?, ?, ?, 1, ?, ?) ON CONFLICT(product_id) DO UPDATE SET available=excluded.available, price_half_oz_cents=excluded.price_half_oz_cents, price_oz_cents=excluded.price_oz_cents, price_qp_cents=excluded.price_qp_cents, prices_configured=1, stock_half_oz=excluded.stock_half_oz, stock_oz=excluded.stock_oz, stock_qp=excluded.stock_qp, stocks_configured=1, catalog_revision=excluded.catalog_revision, updated_at=excluded.updated_at',
        )
        .bind(
          value.slug,
          available ? 1 : 0,
          value.prices.halfOz,
          value.prices.oz,
          value.prices.qp,
          value.stocks.halfOz,
          value.stocks.oz,
          value.stocks.qp,
          CATALOG_REVISION,
          now,
        ),
      ...value.media.map((url, index) =>
        db
          .prepare(
            'INSERT INTO product_media (id, product_id, type, url, sort_order) VALUES (?, ?, ?, ?, ?)',
          )
          .bind(
            crypto.randomUUID(),
            value.slug,
            index === 0 ? 'HERO' : 'GALLERY',
            url,
            index,
          ),
      ),
      ...(value.mobileImage
        ? [
            db
              .prepare(
                'INSERT INTO product_media (id, product_id, type, url, sort_order) VALUES (?, ?, ?, ?, ?)',
              )
              .bind(
                crypto.randomUUID(),
                value.slug,
                'MOBILE',
                value.mobileImage,
                0,
              ),
          ]
        : []),
      ...(value.video
        ? [
            db
              .prepare(
                'INSERT INTO product_media (id, product_id, type, url, sort_order) VALUES (?, ?, ?, ?, ?)',
              )
              .bind(
                crypto.randomUUID(),
                value.slug,
                'VIDEO',
                value.video,
                value.media.length,
              ),
          ]
        : []),
    ];
    await db.batch(statements);
    await recordAdminAudit(request, 'UPDATE', 'flower_product', value.slug);
    const product = (await readCatalog()).find(
      (item) => item.slug === value.slug,
    );
    return apiSuccess({
      product,
      updatedAt: now,
      stocks: value.stocks,
      available,
      prices: value.prices,
      status,
    });
  } catch {
    return apiError(
      'CATALOG_STORAGE_UNAVAILABLE',
      'The product could not be saved.',
      503,
    );
  }
}
