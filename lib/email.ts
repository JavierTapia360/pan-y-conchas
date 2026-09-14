type EmailMessage = { to: string; subject: string; html: string; text: string; replyTo?: string };

export function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function frame(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f4;font-family:Arial,sans-serif;color:#050505"><div style="max-width:620px;margin:auto;background:#fff;padding:40px"><div style="height:6px;background:#ef1818;margin-bottom:28px"></div><p style="font-size:12px;font-weight:800;letter-spacing:.14em">CUATESFARMZ</p><h1 style="font-size:34px;line-height:1.05;margin:18px 0">${title}</h1><p style="font-size:16px;line-height:1.65">${body}</p></div></body></html>`;
}

export const emailTemplates = {
  contactReceived(language: 'es' | 'en'): Pick<EmailMessage, 'subject' | 'html' | 'text'> {
    const es = language === 'es';
    const subject = es ? 'Recibimos tu mensaje — CUATESFARMZ' : 'We received your message — CUATESFARMZ';
    const text = es ? 'Gracias por contactar a CUATESFARMZ. Tu mensaje general fue recibido.' : 'Thanks for contacting CUATESFARMZ. Your general message was received.';
    return { subject, text, html: frame(subject, text) };
  },
  newsletterWelcome(language: 'es' | 'en', unsubscribeUrl: string): Pick<EmailMessage, 'subject' | 'html' | 'text'> {
    const es = language === 'es';
    const subject = es ? 'Ya estás en la lista — CUATESFARMZ' : 'You’re on the list — CUATESFARMZ';
    const base = es ? 'Recibirás novedades generales de cultura y disponibilidad.' : 'You’ll receive general culture and availability updates.';
    const unsubscribe = es ? `Cancelar suscripción: ${unsubscribeUrl}` : `Unsubscribe: ${unsubscribeUrl}`;
    return { subject, text: `${base}\n\n${unsubscribe}`, html: frame(subject, `${base}<br><br><a href="${escapeHtml(unsubscribeUrl)}" style="color:#ef1818">${es ? 'Cancelar suscripción' : 'Unsubscribe'}</a>`) };
  },
};

export async function sendEmail(message: EmailMessage) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) return { sent: false, reason: 'EMAIL_NOT_CONFIGURED' as const };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html, text: message.text, reply_to: message.replyTo }),
  });
  return response.ok ? { sent: true as const } : { sent: false as const, reason: 'EMAIL_PROVIDER_ERROR' as const };
}
