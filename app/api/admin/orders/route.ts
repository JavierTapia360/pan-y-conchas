import { getDb } from '@/db/client';
import { isAdminRequest } from '@/lib/admin-auth';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { recordAdminAudit } from '@/lib/admin-audit';
import { z } from 'zod';

export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  try {
    const result = await getDb()
      .prepare(
        'SELECT id, customer_email, status, subtotal_cents, shipping_cents, tax_cents, total_cents, payment_status, created_at FROM orders ORDER BY created_at DESC LIMIT 250',
      )
      .all();
    return apiSuccess({ orders: result.results });
  } catch {
    return apiSuccess({ orders: [] });
  }
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const parsed = z
    .object({
      id: z.string().min(1),
      status: z.enum([
        'PAID',
        'PROCESSING',
        'SHIPPED',
        'COMPLETED',
        'CANCELLED',
      ]),
    })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError(
      'INVALID_ORDER_UPDATE',
      'Choose a valid order status.',
      400,
    );
  try {
    await getDb()
      .prepare('UPDATE orders SET status = ? WHERE id = ?')
      .bind(parsed.data.status, parsed.data.id)
      .run();
    await recordAdminAudit(request, 'STATUS', 'merch_order', parsed.data.id);
    return apiSuccess({ status: parsed.data.status });
  } catch {
    return apiError(
      'STORAGE_UNAVAILABLE',
      'Order status could not be updated.',
      503,
    );
  }
}
