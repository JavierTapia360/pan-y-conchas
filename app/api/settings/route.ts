import { getDb } from '@/db/client';
export async function GET() {
  try { const result = await getDb().prepare('SELECT key, value_es, value_en FROM site_settings WHERE status = ?').bind('PUBLISHED').all(); return Response.json({ settings: result.results }); }
  catch { return Response.json({ settings: [] }); }
}
