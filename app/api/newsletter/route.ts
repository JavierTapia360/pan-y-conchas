import { getDb } from '@/db/client';
import { newsletterSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { emailTemplates, sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const rate = checkRateLimit(request, 'newsletter', 5, 60 * 60 * 1000);
  if (!rate.allowed) return apiError('RATE_LIMITED', 'Too many requests.', 429);
  const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError('CONSENT_AND_VALID_EMAIL_REQUIRED', 'Consent and a valid email are required.', 400);
  const { email, language } = parsed.data;
  try {
    const db = getDb();
    const existing = await db.prepare('SELECT status FROM newsletter WHERE email = ?').bind(email.toLowerCase()).first<{ status: string }>();
    await db.prepare('INSERT INTO newsletter (id, email, language, status, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET language = excluded.language, status = excluded.status')
      .bind(crypto.randomUUID(), email.toLowerCase(), language, 'SUBSCRIBED', new Date().toISOString()).run();
    if (!existing || existing.status !== 'SUBSCRIBED') {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      const template = emailTemplates.newsletterWelcome(language, `${origin}/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}`);
      void sendEmail({ to: email.toLowerCase(), ...template }).catch(() => {});
    }
    return apiSuccess({ subscribed: true, alreadySubscribed: existing?.status === 'SUBSCRIBED' }, { status: existing?.status === 'SUBSCRIBED' ? 200 : 201 });
  } catch {
    return apiError('NEWSLETTER_STORAGE_UNAVAILABLE', 'The subscription could not be stored.', 503);
  }
}
