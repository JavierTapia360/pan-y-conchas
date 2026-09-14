import { getDb } from '@/db/client';
import { isAdminRequest } from '@/lib/admin-auth';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  try {
    const db = getDb();
    const [events, paths] = await Promise.all([
      db
        .prepare(
          "SELECT event, COUNT(*) AS count FROM analytics_events WHERE created_at >= datetime('now','-30 days') GROUP BY event ORDER BY count DESC",
        )
        .all(),
      db
        .prepare(
          "SELECT path, COUNT(*) AS count FROM analytics_events WHERE event = 'page_view' AND created_at >= datetime('now','-30 days') GROUP BY path ORDER BY count DESC LIMIT 10",
        )
        .all(),
    ]);
    return apiSuccess(
      { events: events.results, paths: paths.results },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    return apiSuccess({ events: [], paths: [] });
  }
}
