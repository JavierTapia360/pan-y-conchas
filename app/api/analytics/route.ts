import { z } from 'zod';
import { getDb } from '@/db/client';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  event: z.enum([
    'page_view',
    'language_switch',
    'view_product',
    'gallery_interaction',
    'video_play',
    'video_complete',
    'share',
    'contact_open',
    'contact_submit',
    'newsletter_signup',
    'view_item',
    'add_to_cart',
    'begin_checkout',
    'purchase',
    'selection_add',
    'selection_remove',
    'selection_open',
    'selection_share',
  ]),
  path: z.string().startsWith('/').max(300),
  properties: z.record(z.string(), z.string().max(120)).default({}),
});

export async function POST(request: Request) {
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const rate = checkRateLimit(request, 'analytics', 120, 60 * 1000);
  if (!rate.allowed)
    return apiError('RATE_LIMITED', 'Too many analytics events.', 429);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError(
      'INVALID_ANALYTICS_EVENT',
      'The analytics event was rejected.',
      400,
    );
  const allowed = parsed.data.properties;
  try {
    await getDb()
      .prepare(
        'INSERT INTO analytics_events (id, event, path, slug, language, device_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        crypto.randomUUID(),
        parsed.data.event,
        parsed.data.path,
        allowed.slug || null,
        allowed.language || null,
        allowed.device_type || null,
        new Date().toISOString(),
      )
      .run();
    return apiSuccess({ stored: true }, { status: 201 });
  } catch {
    return apiSuccess({ stored: false });
  }
}
