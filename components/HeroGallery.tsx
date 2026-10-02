'use client';

import { useEffect, useRef, useState } from 'react';
import { Tx, useT } from '@/lib/i18n';
import type { Photo } from '@/lib/types';

/** Foto Sanity diperkecil lewat parameter CDN; file lokal dipakai apa adanya. */
export function sized(url: string, w: number, h?: number) {
  if (!url.includes('cdn.sanity.io')) return url;
  return `${url}?w=${w}${h ? `&h=${h}&fit=crop` : ''}&auto=format`;
}

/**
 * Galeri recap di kanan hero: 4 panel sempit, panel yang disorot/difokus/ditekan melebar.
 * Di belakang setiap foto ada panel warna, jadi foto yang belum diunggah tetap tampil rapi.
 */
export default function HeroGallery({ photos, label }: { photos: Photo[]; label: string }) {
  const { t } = useT();
  const [active, setActive] = useState(0);
  const [missing, setMissing] = useState<Record<number, boolean>>({});
  const root = useRef<HTMLDivElement>(null);
  const items = photos.slice(0, 4);

  // Foto yang gagal dimuat sebelum hydration tidak memicu onError React; cek sekali saat mount.
  useEffect(() => {
    root.current?.querySelectorAll<HTMLImageElement>('.gallery__img').forEach((img, i) => {
      if (img.complete && img.naturalWidth === 0) setMissing((m) => ({ ...m, [i]: true }));
    });
  }, []);
  if (items.length === 0) return null;

  return (
    <div className="gallery" role="group" aria-label={label} ref={root}>
      {items.map((p, i) => (
        <button
          key={p.url + i}
          type="button"
          className={`gallery__item${i === active ? ' is-active' : ''}`}
          style={{ '--i': i } as React.CSSProperties}
          aria-pressed={i === active}
          aria-label={t(p.alt) || `${label} ${i + 1}`}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
          onFocus={() => setActive(i)}
          onClick={() => setActive(i)}
        >
          <img
            className="gallery__img"
            src={sized(p.url, 900)}
            alt=""
            style={p.position ? { objectPosition: p.position } : undefined}
            loading={i < 2 ? 'eager' : 'lazy'}
            decoding="async"
            hidden={missing[i]}
            onError={() => setMissing((m) => ({ ...m, [i]: true }))}
          />
          <span className="gallery__num" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          {p.caption && <Tx v={p.caption} className="gallery__caption" />}
        </button>
      ))}
    </div>
  );
}
