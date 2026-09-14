import { z } from 'zod';
import { assertMerchProduct } from '@/lib/commerce-guard';
import { apiError, isSameOriginMutation } from '@/lib/api-response';
import { readMerchCatalog } from '@/lib/merch-store';
import { checkRateLimit } from '@/lib/rate-limit';
const schema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().int().min(1).max(20),
        variant: z
          .object({
            size: z.string().max(40).optional(),
            color: z.string().max(40).optional(),
          })
          .optional(),
      }),
    )
    .min(1)
    .max(30),
  email: z.email(),
  provider: z.enum(['stripe', 'paypal']),
  shipping: z.object({
    name: z.string().min(2).max(100),
    line1: z.string().min(3).max(160),
    line2: z.string().max(160).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    postalCode: z.string().min(3).max(20),
    country: z.string().length(2),
  }),
});
export async function POST(request: Request) {
  if (!isSameOriginMutation(request))
    return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  if (!checkRateLimit(request, 'checkout', 10, 60_000).allowed)
    return apiError('RATE_LIMITED', 'Try again in a minute.', 429);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError('INVALID_CHECKOUT', 'Invalid merch checkout request.', 400);
  const merchProducts = await readMerchCatalog();
  for (const item of parsed.data.items) {
    const product = merchProducts.find(
      (entry) => entry.id === item.id && entry.active,
    );
    if (!product)
      return apiError(
        'MERCH_PRODUCT_NOT_FOUND',
        'Only active merchandise can enter checkout.',
        400,
      );
    assertMerchProduct(product);
    if (product.inventory < item.quantity)
      return apiError(
        'INSUFFICIENT_INVENTORY',
        'Requested merch inventory is unavailable.',
        409,
      );
  }
  return apiError(
    'SANDBOX_NOT_CONFIGURED',
    'Approved merch inventory and sandbox credentials are required.',
    503,
  );
}
