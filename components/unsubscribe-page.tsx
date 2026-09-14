'use client';
import { type SyntheticEvent, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
export function UnsubscribePage() {
  const [done, setDone] = useState(false);
  async function submit(event: SyntheticEvent<HTMLFormElement>) { event.preventDefault(); const email = new FormData(event.currentTarget).get('email'); const response = await fetch('/api/newsletter/unsubscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) }); if (response.ok) setDone(true); }
  return <><SiteHeader /><main className="legal-page"><p className="section-kicker">CUATESFARMZ / MAIL</p><h1>Unsubscribe</h1>{done ? <p className="form-success">Email removed / Email eliminado.</p> : <form className="newsletter-form" onSubmit={submit}><div><input name="email" type="email" required placeholder="Email" aria-label="Email" /><button className="button button-red">Confirm</button></div></form>}</main><SiteFooter /></>;
}
