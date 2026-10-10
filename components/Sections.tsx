'use client';

import { track } from '@vercel/analytics';
import { Tx, useT } from '@/lib/i18n';
import { CATEGORY_LABEL, CATEGORY_ORDER, S, formatMonth } from '@/lib/strings';
import type { ContactLink, Experience, L, Profile, Skill } from '@/lib/types';
import HeroGallery from './HeroGallery';
import { IconArrowDown, IconArrowRight, IconArrowUp, IconDownload } from './Icons';

/** Taruh PDF CV di public/ dengan nama ini. */
export const CV_URL = '/CVAldreineVandaKauntu.pdf';

/** Judul section yang jelas ("About Me", "Experience") dengan satu kalimat pendukung. */
export function SectionHeader({ id, heading, title }: { id: string; heading: L; title?: L }) {
  return (
    <header className="section-header" data-reveal>
      <span className="section-title-mask">
        <Tx v={heading} as="h2" className="h2 section-title" id={`${id}-title`} tabIndex={-1} />
      </span>
      {title && <Tx v={title} as="p" className="section-sub" />}
    </header>
  );
}

const jumpTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ block: 'start' });
  el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
};

export function Hero({ profile, showProjects }: { profile: Profile; showProjects: boolean }) {
  const { t } = useT();
  const words = profile.fullName.split(/\s+/);
  return (
    <section className="hero" id="top" aria-labelledby="hero-name">
      <div className="container hero__grid">
        <div className="hero__meta">
          <Tx v={profile.roleTitle} className="eyebrow" />
        </div>

        <h1 className="display hero__name" id="hero-name" tabIndex={-1}>
          <span className="sr-only">{profile.fullName}</span>
          {words.map((w, i) => (
            <span key={i} className="line" aria-hidden="true">
              <span className={i === 1 ? 'line__in italic' : 'line__in'} style={{ '--i': i } as React.CSSProperties}>
                {w}
              </span>
            </span>
          ))}
        </h1>

        {profile.gallery && profile.gallery.length > 0 && (
          <div className="hero__gallery">
            <HeroGallery photos={profile.gallery} label={t(S.hero.gallery)} />
          </div>
        )}

        <div className="hero__intro">
          <Tx v={profile.tagline} as="p" className="body-lg hero__tagline" />
          <div className="hero__ctas">
            {showProjects && (
              <a href="#projects" className="btn btn-primary" onClick={jumpTo('projects')}>
                {t(S.hero.viewProjects)} <IconArrowRight />
              </a>
            )}
            <a
              href={CV_URL}
              download="Aldreine-Vanda-Kauntu-CV.pdf"
              className={`btn ${showProjects ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => track('contact_click', { target: 'download_cv' })}
            >
              <IconDownload /> {t(S.hero.downloadCv)}
            </a>
          </div>
        </div>
      </div>
      <a href="#about" className="hero__scroll eyebrow" onClick={jumpTo('about')}>
        {t(S.hero.scroll)} <IconArrowDown />
      </a>
    </section>
  );
}

/** Bungkus frasa kunci dengan <mark> agar bisa disorot saat paragraf muncul. */
function highlight(text: string, terms: string[]) {
  const list = terms.filter(Boolean).sort((x, y) => y.length - x.length);
  if (list.length === 0) return text;
  const re = new RegExp(`(${list.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  let k = 0;
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="hl" style={{ '--k': k++ } as React.CSSProperties}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

type AboutProps = { profile: Profile; skills: Skill[]; experiences: Experience[] };

export function About({ profile, skills, experiences }: AboutProps) {
  const { t, locale, isFallback } = useT();
  const edu = profile.education;
  const current = experiences.find((e) => !e.endDate);
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: skills.filter((s) => s.category === cat).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeader id="about" heading={S.about.heading} title={profile.roleTitle} />
        <div className="about__grid">
          <div className="about__main" data-reveal>
            <p className="about__lead" lang={isFallback(profile.about) ? 'en' : undefined}>
              {highlight(t(profile.about), t(S.about.highlights).split('|'))}
            </p>
          </div>

          <div className="about__side">
            {current && (
              <div className="fact fact--now" data-reveal style={{ '--d': '80ms' } as React.CSSProperties}>
                <Tx v={S.about.now} as="h3" className="label" />
                <Tx v={current.role} as="p" className="fact__title" />
                <p className="fact__meta">{current.organization}</p>
                <p className="mono muted">
                  {t(S.about.since).replace('{date}', formatMonth(current.startDate, locale))}
                </p>
              </div>
            )}
            {edu && (
              <div className="fact" data-reveal style={{ '--d': '160ms' } as React.CSSProperties}>
                <Tx v={S.about.education} as="h3" className="label" />
                <p className="fact__title">{edu.institution}</p>
                <p className="fact__meta">
                  <Tx v={edu.degree} />, <Tx v={edu.major} />
                </p>
                <p className="mono muted">
                  <time dateTime={edu.startDate}>{formatMonth(edu.startDate, locale)}</time> –{' '}
                  {edu.endDate ? (
                    <time dateTime={edu.endDate}>{formatMonth(edu.endDate, locale)}</time>
                  ) : (
                    t(S.experience.present)
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {groups.length > 0 && (
          <div className="toolkit">
            <div data-reveal>
              <Tx v={S.about.toolkit} as="h3" className="toolkit__title" />
            </div>
            <dl className="toolkit__grid">
              {groups.map((g, i) => (
                <div
                  key={g.cat}
                  className="toolkit__group"
                  data-reveal
                  style={{ '--d': `${i * 70}ms` } as React.CSSProperties}
                >
                  <Tx v={CATEGORY_LABEL[g.cat]} as="dt" className="toolkit__cat" />
                  {g.items.map((s) => (
                    <dd key={s.name} className="toolkit__tool">
                      {s.name}
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

/** Footer satu baris: hak cipta, tautan profil, kembali ke atas. */
export function Footer({ name, links }: { name: string; links: ContactLink[] }) {
  const { t } = useT();
  const profiles = links.filter((l) => l.type !== 'email');

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copy">{name}</p>
        <nav className="footer__nav" aria-label={t(S.footer.label)}>
          {profiles.map((l) => (
            <a key={l.value} className="footer__link" href={l.value} target="_blank" rel="noopener noreferrer">
              {l.label}
              <span className="sr-only"> {t(S.newTab)}</span>
            </a>
          ))}
          <a
            href="#top"
            className="footer__link"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0 });
              document.querySelector<HTMLElement>('.wordmark')?.focus({ preventScroll: true });
            }}
          >
            {t(S.nav.top)} <IconArrowUp />
          </a>
        </nav>
      </div>
    </footer>
  );
}
