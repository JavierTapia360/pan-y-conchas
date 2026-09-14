import { getDb } from '@/db/client';
export async function GET() {
  let database = 'unavailable';
  try { await getDb().prepare('SELECT 1 AS ok').first(); database = 'reachable'; } catch {}
  return Response.json({ success: true, status: 'alive', database }, { headers: { 'cache-control': 'no-store' } });
}
