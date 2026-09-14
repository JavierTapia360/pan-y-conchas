'use client';

import { type SyntheticEvent, useState } from 'react';
import { useLanguage } from '@/components/language-provider';
import { siteConfig } from '@/data/site';
import { track } from '@/lib/analytics';
import { useSelection } from '@/components/selection-provider';
import { EditorialArrow } from '@/components/editorial-arrow';
import { Check } from 'lucide-react';

export function ContactForm() {
  const { copy, language } = useLanguage();
  const { items, region, setRegion } = useSelection();
  const selectionNames = items.map((item) =>
    item.kind === 'wax' ? copy.selection.waxName : item.name,
  );
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
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, language }),
      });
      setState(response.ok ? 'success' : 'error');
      if (response.ok) {
        track('contact_submit', { language });
        form.reset();
      }
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
      {selectionNames.length > 0 && (
        <aside className="contact-selection-context">
          <Check aria-hidden="true" />
          <div>
            <strong>{copy.selection.summaryTitle}</strong>
            <p>{copy.selection.contactContext}</p>
            <span>{selectionNames.join(' · ')}</span>
          </div>
        </aside>
      )}
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
        <input
          id="subject"
          name="subject"
          required
          minLength={2}
          defaultValue={
            selectionNames.length ? copy.selection.contactSubject : ''
          }
        />
      </div>
      <div className="field full">
        <label htmlFor="message">{copy.contact.message}</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={6}
          defaultValue={
            selectionNames.length
              ? `${copy.selection.contactMessage}\n${selectionNames.map((name) => `• ${name}`).join('\n')}`
              : ''
          }
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
        <EditorialArrow />
      </button>
    </form>
  );
}
