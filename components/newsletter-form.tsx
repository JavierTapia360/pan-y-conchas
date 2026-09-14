'use client';

import { type SyntheticEvent, useState } from 'react';
import { useLanguage } from '@/components/language-provider';
import { track } from '@/lib/analytics';
import { saveLocalSubscriber } from '@/lib/local-admin-store';

export function NewsletterForm() {
  const { copy, language } = useLanguage();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get('consent') !== 'on') return;
    setFailed(false);
    setBusy(true);
    try {
      const email = data.get('email');
      saveLocalSubscriber(typeof email === 'string' ? email : '', language);
      setBusy(false);
      setDone(true);
      track('newsletter_signup', { language });
    } catch {
      setBusy(false);
      setFailed(true);
    }
  }
  if (done) return <output className="form-success">{copy.home.thanks}</output>;
  return (
    <form className="newsletter-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="newsletter-email">
        {copy.home.email}
      </label>
      <div>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder={copy.home.email}
        />
        <button disabled={busy} className="button button-red">
          {copy.home.join}
        </button>
      </div>
      <label>
        <input type="checkbox" name="consent" required />{' '}
        <span>{copy.home.consent}</span>
      </label>
      {failed && (
        <p className="form-error" role="alert">
          {language === 'es'
            ? 'No se pudo guardar. Intenta de nuevo.'
            : 'Could not save. Please try again.'}
        </p>
      )}
    </form>
  );
}
