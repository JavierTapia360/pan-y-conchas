export function isAdminRequest(request: Request) {
  const hostname = new URL(request.url).hostname;
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  )
    return true;
  const email = request.headers
    .get('oai-authenticated-user-email')
    ?.toLowerCase();
  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (
    process.env.NODE_ENV !== 'production' &&
    (!email || email === 'seedy@sites.test')
  )
    return true;
  return Boolean(email && allowed.includes(email));
}
