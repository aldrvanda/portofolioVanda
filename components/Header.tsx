'use client';

import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import { S } from '@/lib/strings';
import LanguageToggle from './LanguageToggle';
import { IconArrowRight, IconClose, IconMenu } from './Icons';

type Props = { sections: { projects: boolean; experience: boolean } };

export default function Header({ sections }: Props) {
  const { t } = useT();
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const links = [
    { id: 'top', label: S.nav.home, show: true },
    { id: 'about', label: S.nav.about, show: true },
    { id: 'projects', label: S.nav.projects, show: sections.projects },
    { id: 'experience', label: S.nav.experience, show: sections.experience },
  ].filter((l) => l.show);

  // Header selalu terlihat; border bawah muncul setelah scroll > 8px.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Section aktif untuk NavLink (aria-current).
  useEffect(() => {
    const ids = ['top', 'about', 'projects', 'experience', 'contact'];
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections.projects, sections.experience]);

  /** Scroll ke section lalu pindahkan fokus ke heading-nya (brief §10 Keyboard). */
  const goTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (!section) return;
    if (menuRef.current?.open) menuRef.current.close();
    section.scrollIntoView({ block: 'start' });
    const heading = section.querySelector<HTMLElement>(id === 'top' ? 'h1' : 'h2');
    heading?.focus({ preventScroll: true });
    history.replaceState(null, '', id === 'top' ? window.location.pathname : `#${id}`);
  };

  const openMenu = () => {
    menuRef.current?.showModal();
    setMenuOpen(true);
  };
  const closeMenu = () => menuRef.current?.close();

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="container header__inner">
        <a
          href="#top"
          className="wordmark"
          aria-label={`Aldreine Vanda Kauntu — ${t(S.nav.top)}`}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0 });
            history.replaceState(null, '', window.location.pathname);
          }}
        >
          <span className="wordmark__u">Aldreine</span> Vanda
        </a>

        <nav className="nav" aria-label={t(S.nav.label)}>
          <ul className="nav__list">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className="nav__link"
                  aria-current={active === l.id ? 'true' : undefined}
                  onClick={goTo(l.id)}
                >
                  {t(l.label)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <LanguageToggle />
          <a href="#contact" className="header__contact" onClick={goTo('contact')}>
            {t(S.nav.contact)} <IconArrowRight size={14} />
          </a>
          <button
            ref={menuBtnRef}
            type="button"
            className="icon-btn menu-btn"
            aria-label={t(S.nav.openMenu)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={openMenu}
          >
            <IconMenu />
          </button>
        </div>
      </div>

      <dialog
        id="mobile-menu"
        ref={menuRef}
        className="menu-sheet"
        aria-label={t(S.nav.label)}
        onClose={() => {
          setMenuOpen(false);
          menuBtnRef.current?.focus();
        }}
      >
        <div className="menu-sheet__top">
          <span className="wordmark" aria-hidden="true">
            <span className="wordmark__u">Aldreine</span> Vanda
          </span>
          <button type="button" className="icon-btn" aria-label={t(S.nav.closeMenu)} onClick={closeMenu} autoFocus>
            <IconClose />
          </button>
        </div>
        <ul className="menu-sheet__list">
          {[...links, { id: 'contact', label: S.nav.contact, show: true }].map((l, i) => (
            <li key={l.id} style={{ '--i': i } as React.CSSProperties}>
              <a href={`#${l.id}`} className="menu-sheet__link" onClick={goTo(l.id)}>
                {t(l.label)}
              </a>
            </li>
          ))}
        </ul>
        <LanguageToggle />
      </dialog>
    </header>
  );
}
