import { getDb } from '@/db/client';
import { isAdminRequest } from '@/lib/admin-auth';
import { z } from 'zod';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { recordAdminAudit } from '@/lib/admin-audit';

export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  try {
    const result = await getDb()
      .prepare(
        'SELECT id, name, email, phone, state, subject, message, status, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 250',
      )
      .all();
    return apiSuccess({ messages: result.results });
  } catch {
    return apiSuccess({ messages: [] });
  }
}
export async function PATCH(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(['NEW', 'READ', 'ARCHIVED']) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError(
      'INVALID_MESSAGE_UPDATE',
      'Choose a valid message status.',
      400,
    );
  try {
    await getDb()
      .prepare('UPDATE contact_messages SET status = ? WHERE id = ?')
      .bind(parsed.data.status, parsed.data.id)
      .run();
    await recordAdminAudit(
      request,
      'STATUS',
      'contact_message',
      parsed.data.id,
    );
    return apiSuccess({ status: parsed.data.status });
  } catch {
    return apiError(
      'STORAGE_UNAVAILABLE',
      'Message status could not be updated.',
      503,
    );
  }
}
