'use client';

import { type SyntheticEvent, useState } from 'react';
import { useLanguage } from '@/components/language-context';
import { siteConfig } from '@/data/site';
import { track } from '@/lib/analytics';
import { saveLocalMessage } from '@/lib/local-admin-store';

export function ContactForm() {
  const { copy, language } = useLanguage();
  const [region, setRegion] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'success' | 'error'>(
    'idle',
  );
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setState('busy');
    const data = new FormData(form);
    const value = (name: string) => {
      const entry = data.get(name);
      return typeof entry === 'string' ? entry : '';
    };
    try {
      saveLocalMessage({
        name: value('name'),
        email: value('email'),
        phone: value('phone'),
        state: value('state'),
        subject: value('subject'),
        message: value('message'),
        language,
      });
      setState('success');
      track('contact_submit', { language });
      form.reset();
    } catch {
      setState('error');
    }
  }
  if (state === 'success')
    return (
      <output className="contact-success">
        <span>✓</span>
        <h2>{copy.contact.success}</h2>
      </output>
    );
  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="name">{copy.contact.name}</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          onFocus={() => track('contact_open', { language })}
        />
      </div>
      <div className="field">
        <label htmlFor="email">{copy.contact.email}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="phone">{copy.contact.phone}</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="state">{copy.contact.state}</label>
        <select
          id="state"
          name="state"
          autoComplete="address-level1"
          required
          value={region}
          onChange={(event) => setRegion(event.target.value)}
        >
          <option value="" disabled>
            {copy.contact.select}
          </option>
          {siteConfig.contactStates.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="field full">
        <label htmlFor="subject">{copy.contact.subject}</label>
        <input id="subject" name="subject" required minLength={2} />
      </div>
      <div className="field full">
        <label htmlFor="message">{copy.contact.message}</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={6}
        />
      </div>
      <input
        className="honeypot"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      {state === 'error' && (
        <p className="form-error" role="alert">
          {copy.contact.required}
        </p>
      )}
      <button className="button button-red" disabled={state === 'busy'}>
        {copy.contact.submit}
      </button>
    </form>
  );
}
