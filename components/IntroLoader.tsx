'use client';

import { useEffect, useRef, useState } from 'react';

const MIN_MS = 1100; // cukup lama untuk membaca nama
const MAX_MS = 3500; // jangan pernah menahan pengunjung lebih lama dari ini
const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const pageLoaded = () =>
  document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }));

/**
 * Layar pembuka: nama tampil di tengah, lalu setelah halaman (font + gambar) termuat
 * nama yang sama bergeser ke posisinya di hero (FLIP), sementara latar memudar.
 * Hanya tampil sekali per sesi; kelas `intro` di <html> dipasang oleh skrip di layout
 * sebelum render pertama, jadi tidak ada kedipan hero.
 */
export default function IntroLoader({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const words = name.split(/\s+/);

  useEffect(() => {
    const html = document.documentElement;
    const overlay = root.current;
    const from = nameRef.current;
    if (!html.classList.contains('intro') || !overlay || !from) {
      setDone(true);
      return;
    }

    let cancelled = false;
    const finish = () => {
      // intro-done: nama di hero sudah di tempatnya, animasi masuknya tidak boleh diputar ulang.
      html.classList.add('intro-done');
      html.classList.remove('intro', 'intro-run');
      try {
        sessionStorage.setItem('intro-seen', '1');
      } catch {
        /* storage diblokir: intro tampil lagi di kunjungan berikutnya, tidak masalah */
      }
      setDone(true);
    };

    (async () => {
      await Promise.race([Promise.all([document.fonts.ready, pageLoaded(), wait(MIN_MS)]), wait(MAX_MS)]);
      if (cancelled) return;

      const target = document.getElementById('hero-name');
      const a = from.getBoundingClientRect();
      const b = target?.getBoundingClientRect();
      html.classList.add('intro-run'); // animasi masuk hero lainnya mulai berjalan

      // Jika halaman sudah tergulir atau hero tidak ada, cukup pudarkan layar pembuka.
      if (!b || window.scrollY > 4) {
        await overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' })
          .finished;
        if (!cancelled) finish();
        return;
      }

      const dx = b.left - a.left;
      const dy = b.top - a.top;
      const move = from.animate([{ transform: 'translate(0, 0)' }, { transform: `translate(${dx}px, ${dy}px)` }], {
        duration: 1000,
        easing: EASE_IN_OUT,
        fill: 'forwards',
      });
      overlay.querySelector<HTMLElement>('.loader__bg')?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 700,
        delay: 250,
        easing: 'ease-out',
        fill: 'forwards',
      });
      await move.finished;
      if (!cancelled) finish();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (done) return null;
  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="loader__bg" />
      <div className="container loader__stage">
        <div className="display loader__name" ref={nameRef}>
          {words.map((w, i) => (
            <span key={i} className="line">
              <span className={i === 1 ? 'line__in italic' : 'line__in'} style={{ '--i': i } as React.CSSProperties}>
                {w}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
