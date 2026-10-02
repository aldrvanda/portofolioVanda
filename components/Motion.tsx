'use client';

import { useEffect, useRef } from 'react';

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Elemen [data-reveal] muncul saat masuk viewport. `deps` memicu pemindaian ulang. */
export function useSiteMotion(deps: unknown[] = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
    if (prefersReduced()) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Garis tipis di atas halaman yang mengikuti progres scroll. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.style.setProperty('--p', String(max > 0 ? window.scrollY / max : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return <div ref={ref} className="progress" aria-hidden="true" />;
}

/** "55,500" / "$323K" → angka berjalan dari 0 saat terlihat. Pembaca layar mendapat nilai akhir. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const out = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const m = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
    const el = ref.current;
    const view = out.current;
    if (!m || !el || !view || prefersReduced()) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = num.includes('.') ? num.split('.')[1].length : 0;
    const fmt = (n: number) =>
      pre +
      n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: num.includes(','),
      }) +
      post;

    let raf = 0;
    // Tulis langsung ke DOM: tidak perlu re-render React di setiap frame.
    view.textContent = fmt(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - t0) / 1200, 1);
          view.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      view.textContent = value;
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" ref={out}>
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
