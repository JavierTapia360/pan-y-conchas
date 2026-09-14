import { getDb } from '@/db/client';
import { isAdminRequest } from '@/lib/admin-auth';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { readMerchCatalog } from '@/lib/merch-store';
import { merchProductSchema } from '@/lib/validation';
import { z } from 'zod';
import { recordAdminAudit } from '@/lib/admin-audit';

export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  return apiSuccess(
    { products: await readMerchCatalog({ includeInactive: true }) },
    { headers: { 'cache-control': 'no-store' } },
  );
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const parsed = merchProductSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return apiError(
      'INVALID_MERCH_PRODUCT',
      'Review the merchandise fields.',
      400,
      z.treeifyError(parsed.error),
    );
  const item = parsed.data;
  try {
    const now = new Date().toISOString();
    await getDb()
      .prepare(
        'INSERT INTO merch_products (id, slug, name, description_es, description_en, price_cents, inventory, active, images_json, variants_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, name=excluded.name, description_es=excluded.description_es, description_en=excluded.description_en, price_cents=excluded.price_cents, inventory=excluded.inventory, active=excluded.active, images_json=excluded.images_json, variants_json=excluded.variants_json, updated_at=excluded.updated_at',
      )
      .bind(
        item.id,
        item.slug,
        item.name,
        item.descriptionEs,
        item.descriptionEn,
        item.priceCents,
        item.inventory,
        item.active ? 1 : 0,
        JSON.stringify(item.images),
        JSON.stringify(item.variants),
        now,
      )
      .run();
    await recordAdminAudit(request, 'UPDATE', 'merch_product', item.id);
    return apiSuccess({ updatedAt: now });
  } catch {
    return apiError(
      'MERCH_STORAGE_UNAVAILABLE',
      'The merchandise product could not be saved.',
      503,
    );
  }
}
