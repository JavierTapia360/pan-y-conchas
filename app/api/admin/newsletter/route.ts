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
        'SELECT id, email, language, status, created_at FROM newsletter ORDER BY created_at DESC LIMIT 500',
      )
      .all();
    return apiSuccess({ subscribers: result.results });
  } catch {
    return apiSuccess({ subscribers: [] });
  }
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(['SUBSCRIBED', 'UNSUBSCRIBED']) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError(
      'INVALID_SUBSCRIBER_UPDATE',
      'Choose a valid subscriber status.',
      400,
    );
  try {
    await getDb()
      .prepare('UPDATE newsletter SET status = ? WHERE id = ?')
      .bind(parsed.data.status, parsed.data.id)
      .run();
    await recordAdminAudit(
      request,
      'STATUS',
      'newsletter_subscriber',
      parsed.data.id,
    );
    return apiSuccess({ status: parsed.data.status });
  } catch {
    return apiError(
      'STORAGE_UNAVAILABLE',
      'Subscriber status could not be updated.',
      503,
    );
  }
}
