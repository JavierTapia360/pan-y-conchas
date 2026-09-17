'use client';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from '@/components/contact-form';
import { useLanguage } from '@/components/language-context';
import { siteConfig } from '@/data/site';

export function ContactPage() {
  const { copy, language, siteSettings } = useLanguage();
  const contactEmail = siteSettings.contactEmail?.[language];
  return (
    <>
      <SiteHeader />
      <main className="contact-page">
        <header>
          <p className="section-kicker">{copy.contact.kicker}</p>
          <h1>{copy.contact.title}</h1>
          <p>{copy.contact.intro}</p>
          {contactEmail ? (
            <a className="text-link" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          ) : null}
          <a
            className="button button-red contact-telegram-cta"
            href={siteConfig.socials.telegram}
            target="_blank"
            rel="noreferrer"
          >
            {copy.telegram.contact}
          </a>
        </header>
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
