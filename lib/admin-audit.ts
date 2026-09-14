import { getDb } from '@/db/client';

export async function recordAdminAudit(
  request: Request,
  action: string,
  entityType: string,
  entityId: string,
) {
  const actor =
    request.headers.get('oai-authenticated-user-email')?.toLowerCase() ||
    (new URL(request.url).hostname === 'localhost'
      ? 'local-admin'
      : 'unknown-admin');
  try {
    await getDb()
      .prepare(
        'INSERT INTO admin_audit (id, actor_email, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(
        crypto.randomUUID(),
        actor,
        action,
        entityType,
        entityId,
        new Date().toISOString(),
      )
      .run();
  } catch {
    /* Auditing must not break an otherwise valid admin write during migration rollout. */
  }
}
