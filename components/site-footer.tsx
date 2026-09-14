'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { siteConfig } from '@/data/site';

export function SiteFooter() {
  const { copy, language, setLanguage, siteSettings } = useLanguage();
  const instagram =
    siteSettings.instagram?.[language] || siteConfig.socials.instagram;
  const x = siteSettings.x?.[language];
  const contactEmail = siteSettings.contactEmail?.[language];
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Image
          src="/assets/cuatesfarmz-logo-c.webp"
          alt="CUATESFARMZ"
          width={420}
          height={140}
        />
        <p>
          {siteConfig.legalNotice.en}
          <br />
          {siteConfig.legalNotice.es}
        </p>
      </div>
      <div className="footer-grid">
        <div>
          <b>{copy.footer.catalog}</b>
          <Link prefetch={false} href="/flower">
            Flower
          </Link>
          <Link prefetch={false} href="/wax">
            Wax
          </Link>
          <Link prefetch={false} href="/merch">
            Merch
          </Link>
        </div>
        <div>
          <b>{copy.footer.help}</b>
          <Link prefetch={false} href="/faq">
            {copy.footer.faq}
          </Link>
          <Link prefetch={false} href="/contact">
            {copy.nav.contact}
          </Link>
          <Link prefetch={false} href="/21-plus">
            {copy.footer.policy}
          </Link>
        </div>
        <div>
          <b>{copy.footer.language}</b>
          <button onClick={() => setLanguage('es')}>🇲🇽 ES</button>
          <button onClick={() => setLanguage('en')}>🇺🇸 EN</button>
        </div>
        <div>
          <b>{copy.footer.social}</b>
          {instagram ? (
            <a href={instagram} rel="noreferrer">
              Instagram
            </a>
          ) : null}
          {x ? (
            <a href={x} rel="noreferrer">
              X
            </a>
          ) : null}
          {contactEmail ? (
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          ) : null}
          {!instagram && !x && !contactEmail ? (
            <span>{copy.footer.socialPending}</span>
          ) : null}
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} CUATESFARMZ. {copy.footer.rights}
        </p>
        <div>
          <Link prefetch={false} href="/privacy">
            {copy.footer.privacy}
          </Link>
          <Link prefetch={false} href="/terms">
            {copy.footer.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
