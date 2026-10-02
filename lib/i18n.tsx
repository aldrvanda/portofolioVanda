'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ElementType, type ReactNode } from 'react';
import type { L, Locale } from './types';

type Ctx = { locale: Locale; setLocale: (l: Locale) => void };
const LangContext = createContext<Ctx>({ locale: 'en', setLocale: () => {} });
const STORAGE_KEY = 'lang';
const SECTION_IDS = ['about', 'projects', 'experience', 'contact'];

/** Section yang sedang berada di bawah header, supaya posisi tetap setelah ganti bahasa (FR-17.3). */
function currentSection(): HTMLElement | null {
  if (window.scrollY < 80) return null;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= 96 && r.bottom > 96) return el;
  }
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'id') setLocaleState(saved);
    } catch {
      /* storage diblokir: tetap EN */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    const anchor = currentSection();
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* gagal simpan: bahasa tetap berganti untuk sesi ini */
    }
    if (anchor) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => anchor.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior })),
      );
    }
  }, []);

  return <LangContext.Provider value={{ locale, setLocale }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { locale } = useLang();
  const t = useCallback((l?: L) => (!l ? '' : locale === 'id' && l.id ? l.id : l.en), [locale]);
  const isFallback = useCallback((l?: L) => locale === 'id' && !!l && !l.id, [locale]);
  return { locale, t, isFallback };
}

/** Teks dua bahasa. Jika versi ID kosong, tampil EN dengan lang="en" (FR-17.5). */
export function Tx({
  v,
  as: Tag = 'span',
  className,
  id,
  tabIndex,
}: {
  v?: L;
  as?: ElementType;
  className?: string;
  id?: string;
  tabIndex?: number;
}) {
  const { t, isFallback } = useT();
  return (
    <Tag id={id} className={className} tabIndex={tabIndex} lang={isFallback(v) ? 'en' : undefined}>
      {t(v)}
    </Tag>
  );
}
