'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/language-context';

export function Faq() {
  const { copy } = useLanguage();
  const [open, setOpen] = useState(0);
  return (
    <section className="faq-section">
      <div>
        <p className="section-kicker">{copy.faq.kicker}</p>
        <h2>{copy.faq.title}</h2>
      </div>
      <div className="faq-list">
        {copy.faq.items.map((item, index) => (
          <div
            className={open === index ? 'faq-item open' : 'faq-item'}
            key={item.q}
          >
            <button
              aria-expanded={open === index}
              onClick={() => setOpen(open === index ? -1 : index)}
            >
              <span>{item.q}</span>
              <b aria-hidden="true">{open === index ? '−' : '+'}</b>
            </button>
            <div className="faq-answer">
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
