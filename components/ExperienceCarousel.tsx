'use client';

import { useEffect, useRef, useState } from 'react';
import { Tx, useT } from '@/lib/i18n';
import { EXPERIENCE_TYPE_LABEL, S, formatMonth } from '@/lib/strings';
import type { Experience, Photo } from '@/lib/types';
import { sized } from './HeroGallery';
import { IconArrowRight } from './Icons';
import { SectionHeader } from './Sections';

function PhotoImg({ p }: { p: Photo }) {
  const { t } = useT();
  return (
    <img
      className="xp__photo"
      src={sized(p.url, 1280, 720)}
      alt={t(p.alt)}
      loading="lazy"
      decoding="async"
      draggable={false}
      width={1280}
      height={720}
      style={p.position ? { objectPosition: p.position } : undefined}
    />
  );
}

/**
 * Kartu foto dua sisi: membalik saat di-hover (mouse) dan saat diketuk/Enter (sentuh, keyboard).
 * Klik mouse diabaikan supaya hover dan klik tidak saling membatalkan.
 */
function FlipPhoto({ front, back }: { front: Photo; back: Photo }) {
  const { t } = useT();
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      className={`flip${flipped ? ' is-flipped' : ''}`}
      aria-pressed={flipped}
      aria-label={t(S.experience.flip)}
      onClick={(ev) => {
        const keyboard = ev.detail === 0;
        if (keyboard || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) setFlipped((f) => !f);
      }}
    >
      <span className="flip__inner">
        <span className="flip__face" aria-hidden={flipped}>
          <PhotoImg p={front} />
        </span>
        <span className="flip__face flip__face--back" aria-hidden={!flipped}>
          <PhotoImg p={back} />
        </span>
      </span>
      <span className="flip__hint" aria-hidden="true">
        <IconFlip />
      </span>
    </button>
  );
}

function IconFlip() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function SlidePhoto({ e }: { e: Experience }) {
  if (e.photo?.url && e.photoBack?.url) return <FlipPhoto front={e.photo} back={e.photoBack} />;
  if (e.photo?.url) return <PhotoImg p={e.photo} />;
  // Belum ada foto: bingkai bertahun, supaya slide tetap utuh.
  return (
    <div className="xp__photo xp__photo--empty" aria-hidden="true">
      <span>{e.startDate.slice(0, 4)}</span>
    </div>
  );
}

/**
 * Carousel pengalaman: scroll-snap native (swipe di HP, trackpad, keyboard), plus drag
 * mouse dan tombol panah. Foto dan teks ada di slide yang sama, jadi selalu bergerak bersama.
 */
export default function ExperienceCarousel({ experiences }: { experiences: Experience[] }) {
  const { t, locale } = useT();
  const track = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);
  const total = experiences.length;

  // Slide aktif = slide yang paling banyak terlihat di track.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const slides = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setIndex(slides.indexOf(e.target as HTMLElement));
        }
      },
      { root: el, threshold: 0.6 },
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [total]);

  // Track ber-position: relative, jadi offsetLeft slide relatif terhadap track.
  const leftOf = (el: HTMLElement, slide: HTMLElement) =>
    slide.offsetLeft - (parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0);

  const goTo = (i: number) => {
    const el = track.current;
    const slide = el?.children[Math.min(Math.max(i, 0), total - 1)] as HTMLElement | undefined;
    if (!el || !slide) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: leftOf(el, slide), behavior: reduce ? 'auto' : 'smooth' });
  };

  // Tandai track selama bergerak, supaya hover tidak membalik kartu foto yang lewat di bawah kursor.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let timer = 0;
    const onScroll = () => {
      el.classList.add('is-moving');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => el.classList.remove('is-moving'), 200);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  // Drag dengan mouse (sentuh dan trackpad sudah ditangani scroll native).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
      }
      if (moved) el.scrollLeft = startScroll - dx;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      el.classList.remove('is-dragging');
      // Kembalikan snap ke slide terdekat.
      const slides = Array.from(el.children) as HTMLElement[];
      const nearest = slides.reduce(
        (best, s, i) =>
          Math.abs(leftOf(el, s) - el.scrollLeft) < Math.abs(leftOf(el, slides[best]) - el.scrollLeft) ? i : best,
        0,
      );
      goTo(nearest);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const counter = (n: number) => t(S.experience.slide).replace('{n}', String(n)).replace('{total}', String(total));

  return (
    <section className="section section--dark" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeader id="experience" heading={S.experience.heading} title={S.experience.title} />
        <div className="xp__bar" data-reveal>
          <p className="xp__count" aria-live="polite">
            <span className="xp__count-now">{String(index + 1).padStart(2, '0')}</span>
            <span aria-hidden="true"> / {String(total).padStart(2, '0')}</span>
            <span className="sr-only">{counter(index + 1)}</span>
          </p>
          <span className="xp__progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${(index + 1) / total})` }} />
          </span>
          <div className="xp__nav">
            <button
              type="button"
              className="xp__btn xp__btn--prev"
              aria-label={t(S.experience.prev)}
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              <IconArrowRight />
            </button>
            <button
              type="button"
              className="xp__btn"
              aria-label={t(S.experience.next)}
              disabled={index === total - 1}
              onClick={() => goTo(index + 1)}
            >
              <IconArrowRight />
            </button>
          </div>
        </div>
      </div>

      <ol className="xp__track" ref={track} tabIndex={0} aria-label={t(S.experience.heading)} data-reveal>
        {experiences.map((e, i) => (
          <li
            key={e.id}
            className={`xp__slide${i === index ? ' is-active' : ''}`}
            aria-roledescription="slide"
            aria-label={counter(i + 1)}
          >
            <div className="xp__media">
              <SlidePhoto e={e} />
            </div>
            <div className="xp__body">
              <p className="xp__date">
                {!e.endDate && <span className="xp__live" aria-hidden="true" />}
                <time dateTime={e.startDate}>{formatMonth(e.startDate, locale)}</time> –{' '}
                {e.endDate ? (
                  <time dateTime={e.endDate}>{formatMonth(e.endDate, locale)}</time>
                ) : (
                  t(S.experience.present)
                )}
              </p>
              <Tx v={e.role} as="h3" className="xp__role" />
              <p className="xp__org">
                <span>{e.organization}</span>
                <Tx v={EXPERIENCE_TYPE_LABEL[e.type] ?? EXPERIENCE_TYPE_LABEL.other} className="tag tag--type" />
              </p>
              <ul className="xp__highlights">
                {e.highlights.map((h, k) => (
                  <Tx key={k} v={h} as="li" />
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
