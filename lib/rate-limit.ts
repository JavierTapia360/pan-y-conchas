type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const forwarded = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const key = `${scope}:${forwarded}`;
  const now = Date.now();
  const existing = buckets.get(key);
  const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;
  bucket.count += 1;
  buckets.set(key, bucket);
  return { allowed: bucket.count <= limit, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
}
