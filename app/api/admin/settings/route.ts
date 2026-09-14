import { getDb } from '@/db/client';
import { isAdminRequest } from '@/lib/admin-auth';
import { z } from 'zod';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { recordAdminAudit } from '@/lib/admin-audit';
const settingKeys = [
  'homeHeadline',
  'homeSubheadline',
  'aboutText',
  'contactText',
  'footerText',
  'announcement',
  'contactEmail',
  'instagram',
  'x',
  'waxHeadline',
  'waxBody',
  'waxHero',
] as const;
const schema = z.object({
  settings: z
    .array(
      z.object({
        key: z.enum(settingKeys),
        valueEs: z.string().max(3000),
        valueEn: z.string().max(3000),
        status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
      }),
    )
    .max(30),
});
export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  try {
    const result = await getDb()
      .prepare(
        'SELECT key, value_es, value_en, status, updated_at FROM site_settings ORDER BY key',
      )
      .all();
    return apiSuccess(
      { settings: result.results },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    return apiSuccess({ settings: [] });
  }
}
export async function PUT(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError(
      'INVALID_SETTINGS',
      'Review the submitted content fields.',
      400,
    );
  try {
    const db = getDb();
    const now = new Date().toISOString();
    await db.batch(
      parsed.data.settings.map((setting) =>
        db
          .prepare(
            'INSERT INTO site_settings (key, value_es, value_en, status, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_es=excluded.value_es, value_en=excluded.value_en, status=excluded.status, updated_at=excluded.updated_at',
          )
          .bind(
            setting.key,
            setting.valueEs,
            setting.valueEn,
            setting.status,
            now,
          ),
      ),
    );
    await recordAdminAudit(
      request,
      'UPDATE',
      'site_settings',
      parsed.data.settings.map((item) => item.key).join(','),
    );
    return apiSuccess({ updatedAt: now });
  } catch {
    return apiError(
      'SETTINGS_STORAGE_UNAVAILABLE',
      'Content could not be saved.',
      503,
    );
  }
}
