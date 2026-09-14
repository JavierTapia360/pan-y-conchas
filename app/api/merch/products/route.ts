import { apiSuccess } from '@/lib/api-response';
import { readMerchCatalog } from '@/lib/merch-store';

export async function GET() {
  return apiSuccess({ products: await readMerchCatalog() }, { headers: { 'cache-control': 'no-store' } });
}
