import { getDb } from '@/db/client';
import { contactSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { apiError, apiSuccess, isSameOriginMutation } from '@/lib/api-response';
import { emailTemplates, escapeHtml, sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return apiError('INVALID_ORIGIN', 'The request origin was rejected.', 403);
  const rate = checkRateLimit(request, 'contact', 5, 15 * 60 * 1000);
  if (!rate.allowed) return apiError('RATE_LIMITED', 'Too many requests.', 429);
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError('INVALID_CONTACT_MESSAGE', 'Please review the submitted fields.', 400);
  const value = parsed.data;
  try {
    await getDb().prepare('INSERT INTO contact_messages (id, name, email, phone, state, subject, message, language, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), value.name, value.email.toLowerCase(), value.phone || null, value.state, value.subject, value.message, value.language, 'NEW', new Date().toISOString()).run();
    const confirmation = emailTemplates.contactReceived(value.language);
    void sendEmail({ to: value.email.toLowerCase(), ...confirmation }).catch(() => {});
    const adminEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
    if (adminEmail) void sendEmail({ to: adminEmail, subject: `Contact: ${value.subject}`, text: `From: ${value.name} <${value.email}>\nState: ${value.state}\n\n${value.message}`, html: `<p><strong>From:</strong> ${escapeHtml(value.name)} &lt;${escapeHtml(value.email)}&gt;</p><p><strong>State:</strong> ${escapeHtml(value.state)}</p><p>${escapeHtml(value.message).replaceAll('\n', '<br>')}</p>`, replyTo: value.email }).catch(() => {});
    return apiSuccess({ stored: true }, { status: 201 });
  } catch {
    return apiError('CONTACT_STORAGE_UNAVAILABLE', 'The message could not be stored.', 503);
  }
}
