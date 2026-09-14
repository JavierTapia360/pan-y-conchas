import { headers } from 'next/headers';
import { AdminDashboard } from '@/components/admin-dashboard';
import { AdminLogin } from '@/components/admin-login';

export const dynamic = 'force-dynamic';
export default async function Page() {
  const requestHeaders = await headers();
  const email = requestHeaders
    .get('oai-authenticated-user-email')
    ?.toLowerCase();
  const hostname = (
    requestHeaders.get('x-forwarded-host') ||
    requestHeaders.get('host') ||
    ''
  ).split(':')[0];
  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const local =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    process.env.NODE_ENV !== 'production';
  if (!local && (!email || !allowed.includes(email))) return <AdminLogin />;
  return <AdminDashboard />;
}
