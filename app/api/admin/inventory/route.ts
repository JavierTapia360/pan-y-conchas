import { getDb } from '@/db/client';
import { isAdminRequest } from '@/lib/admin-auth';
import { recordAdminAudit } from '@/lib/admin-audit';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { inventorySchema } from '@/lib/validation';
import { getProduct, hasAvailablePresentation } from '@/data/products';

export async function PATCH(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);

  const parsed = inventorySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return apiError(
      'INVALID_INVENTORY',
      'Prices and stock must be valid non-negative numbers.',
      400,
    );

  const { slug, prices, stocks } = parsed.data;
  if (stocks === undefined && prices === undefined)
    return apiError(
      'INVALID_INVENTORY',
      'Provide presentation stock or prices.',
      400,
    );
  try {
    const db = getDb();
    const current = await db
      .prepare(
        'SELECT stock AS legacy_stock, price_half_oz_cents, price_oz_cents, price_qp_cents, prices_configured, stock_half_oz, stock_oz, stock_qp, stocks_configured FROM product_inventory WHERE product_id = ?',
      )
      .bind(slug)
      .first<{
        legacy_stock: number;
        price_half_oz_cents: number | null;
        price_oz_cents: number | null;
        price_qp_cents: number | null;
        prices_configured: number;
        stock_half_oz: number;
        stock_oz: number;
        stock_qp: number;
        stocks_configured: number;
      }>();
    const fallback = getProduct(slug);
    const nextPrices =
      prices ??
      (current?.prices_configured
        ? {
            halfOz: current.price_half_oz_cents,
            oz: current.price_oz_cents,
            qp: current.price_qp_cents,
          }
        : (fallback?.prices ?? { halfOz: null, oz: null, qp: null }));
    const nextStocks =
      stocks ??
      (current?.stocks_configured
        ? {
            halfOz: current.stock_half_oz,
            oz: current.stock_oz,
            qp: current.stock_qp,
          }
        : current
          ? {
              halfOz: current.legacy_stock,
              oz: current.legacy_stock,
              qp: current.legacy_stock,
            }
          : (fallback?.stocks ?? { halfOz: 0, oz: 0, qp: 0 }));
    const available = hasAvailablePresentation(nextStocks);
    const updatedAt = new Date().toISOString();
    await db
      .prepare(
        'INSERT INTO product_inventory (product_id, stock, available, price_half_oz_cents, price_oz_cents, price_qp_cents, prices_configured, stock_half_oz, stock_oz, stock_qp, stocks_configured, catalog_revision, updated_at) VALUES (?, 0, ?, ?, ?, ?, 1, ?, ?, ?, 1, 2, ?) ON CONFLICT(product_id) DO UPDATE SET available=excluded.available, price_half_oz_cents=excluded.price_half_oz_cents, price_oz_cents=excluded.price_oz_cents, price_qp_cents=excluded.price_qp_cents, prices_configured=1, stock_half_oz=excluded.stock_half_oz, stock_oz=excluded.stock_oz, stock_qp=excluded.stock_qp, stocks_configured=1, catalog_revision=2, updated_at=excluded.updated_at',
      )
      .bind(
        slug,
        available ? 1 : 0,
        nextPrices.halfOz,
        nextPrices.oz,
        nextPrices.qp,
        nextStocks.halfOz,
        nextStocks.oz,
        nextStocks.qp,
        updatedAt,
      )
      .run();
    await recordAdminAudit(request, 'UPDATE', 'product_inventory', slug);
    return apiSuccess({
      slug,
      stocks: nextStocks,
      available,
      prices: nextPrices,
      updatedAt,
    });
  } catch {
    return apiError(
      'INVENTORY_STORAGE_UNAVAILABLE',
      'Inventory could not be updated.',
      503,
    );
  }
}
