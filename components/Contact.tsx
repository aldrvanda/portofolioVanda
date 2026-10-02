'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { useT } from '@/lib/i18n';
import { S } from '@/lib/strings';
import type { ContactLink } from '@/lib/types';
import { SectionHeader } from './Sections';
import { IconAlert, IconCheck, IconCopy, IconExternal } from './Icons';

type ToastState = { kind: 'success' | 'error'; text: string } | null;

export default function Contact({ links }: { links: ContactLink[] }) {
  const { t } = useT();
  const email = links.find((l) => l.type === 'email')?.value;
  const others = links.filter((l) => l.type !== 'email');
  const [canCopy, setCanCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailRef = useRef<HTMLParagraphElement>(null);

  // Tombol salin hanya dirender jika Clipboard API tersedia (PRD bagian 8).
  useEffect(() => {
    setCanCopy(!!navigator.clipboard && window.isSecureContext);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const showToast = (next: NonNullable<ToastState>) => {
    setToast(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setToast(null);
      setCopied(false);
    }, 2000);
  };

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      showToast({ kind: 'success', text: t(S.contact.copiedToast) });
      track('contact_click', { target: 'copy_email' });
    } catch {
      // Sorot email supaya bisa disalin manual.
      const el = emailRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      showToast({ kind: 'error', text: t(S.contact.copyFailed) });
    }
  };

  return (
    <section className="section section--contact" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeader id="contact" heading={S.contact.heading} />

        {email && (
          <div className="contact__email-block" data-reveal style={{ '--d': '80ms' } as React.CSSProperties}>
            <p className="contact__email" ref={emailRef}>
              {email}
            </p>
            <div className="contact__actions">
              {canCopy && (
                <button type="button" className={`btn btn-primary${copied ? ' btn--copied' : ''}`} onClick={copy}>
                  {copied ? <IconCheck /> : <IconCopy />}
                  {copied ? t(S.contact.copied) : t(S.contact.copy)}
                </button>
              )}
              <a
                className={`btn ${canCopy ? 'btn-secondary' : 'btn-primary'}`}
                href={`mailto:${email}`}
                onClick={() => track('contact_click', { target: 'mailto' })}
              >
                {t(S.contact.emailMe)}
              </a>
            </div>
          </div>
        )}

        {others.length > 0 && (
          <ul className="contact__rows">
            {others.map((l) => (
              <li key={l.value}>
                <a
                  className="contact-row"
                  href={l.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('contact_click', { target: l.type })}
                >
                  <span className="contact-row__label">{l.label}</span>
                  <span className="contact-row__value mono">{l.value.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <IconExternal />
                  <span className="sr-only"> {t(S.newTab)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="toast-region" role="status" aria-live="polite">
        {toast?.kind === 'success' && (
          <div className="toast toast--success">
            <IconCheck /> {toast.text}
          </div>
        )}
      </div>
      <div className="toast-region toast-region--alert" role="alert">
        {toast?.kind === 'error' && (
          <div className="toast toast--error">
            <IconAlert /> {toast.text}
          </div>
        )}
      </div>
    </section>
  );
}
