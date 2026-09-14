import { getDb } from '@/db/client';
import { z } from 'zod';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const parsed = z.object({ email: z.email() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError('INVALID_EMAIL', 'Enter a valid email address.', 400);
  try { await getDb().prepare('UPDATE newsletter SET status = ? WHERE email = ?').bind('UNSUBSCRIBED', parsed.data.email.toLowerCase()).run(); return apiSuccess({ unsubscribed: true }); }
  catch { return apiError('STORAGE_UNAVAILABLE', 'The subscription could not be updated.', 503); }
}
