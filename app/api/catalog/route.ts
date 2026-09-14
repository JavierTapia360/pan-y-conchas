import { readCatalog } from '@/lib/catalog-store';
export async function GET() { return Response.json({ products: await readCatalog() }, { headers: { 'cache-control': 'no-store' } }); }
