'use client';

import { useLang, useT } from '@/lib/i18n';
import { S } from '@/lib/strings';
import type { Locale } from '@/lib/types';

const OPTIONS: { value: Locale; label: string; full: string }[] = [
  { value: 'en', label: 'EN', full: 'English' },
  { value: 'id', label: 'ID', full: 'Bahasa Indonesia' },
];

export default function LanguageToggle() {
  const { locale, setLocale } = useLang();
  const { t } = useT();
  return (
    <div className="lang-toggle" role="group" aria-label={t(S.nav.language)}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          className="lang-toggle__btn"
          aria-pressed={locale === o.value}
          aria-label={o.full}
          lang={o.value}
          onClick={() => locale !== o.value && setLocale(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
