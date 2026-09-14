import { isAdminRequest } from '@/lib/admin-auth';
import { apiError, apiSuccess } from '@/lib/api-response';
import { mediaLibrary } from '@/lib/media-library';

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return apiError('UNAUTHORIZED', 'Authorized administrators only.', 401);
  return apiSuccess({ media: mediaLibrary }, { headers: { 'cache-control': 'no-store' } });
}
