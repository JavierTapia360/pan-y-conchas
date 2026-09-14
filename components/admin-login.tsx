/* oxlint-disable nextjs/no-html-link-for-pages */
import Image from 'next/image';
export function AdminLogin() {
  return <main className="admin-login"><Image src="/assets/cuatesfarmz-logo-c.webp" alt="CUATESFARMZ" width={330} height={110} /><p>PRIVATE ADMIN</p><h1>Authorized access only.</h1>{/* Dispatch-owned sign-in must be a top-level browser navigation. */}<a className="button button-red" href="/signin-with-chatgpt?return_to=/admin" target="_top">Sign in securely</a><small>There is no public administrator registration.</small></main>;
}
