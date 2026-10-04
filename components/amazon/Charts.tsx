'use client';

import { useId, useState } from 'react';

/** Palet kategorikal 3 seri, divalidasi (CVD & kontras) terhadap surface #f6f0ef. */
export const SERIES = ['#0077b6', '#c8622a', '#8e4585'];

/** Locale angka mengikuti bahasa halaman (en: 1,234.5 · id: 1.234,5). Diset oleh laporan saat render. */
let numLocale = 'en-US';
export const setNumLocale = (locale: 'en' | 'id') => {
  numLocale = locale === 'id' ? 'id-ID' : 'en-US';
};

export const fmt = (n: number, d = 0) => n.toLocaleString(numLocale, { maximumFractionDigits: d, minimumFractionDigits: d });
export const compact = (n: number) =>
  n >= 1e6 ? `${fmt(n / 1e6, 1)}M` : n >= 1e3 ? `${fmt(n / 1e3, n >= 1e4 ? 0 : 1)}K` : fmt(n);

/** Batas atas sumbu yang bulat (1–10 × 10^n). */
function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * p >= v) ?? 10;
  return step * p;
}

export type BarRow = { key: string; label: string; value: number; display?: string; note?: string; highlight?: boolean };

/** Bar horizontal satu seri. Nilai di ujung bar, detail di tooltip (title + baris aria). */
export function BarList({ rows, max, caption }: { rows: BarRow[]; max?: number; caption: string }) {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  return (
    <figure className="bars" aria-label={caption}>
      <ul className="bars__list">
        {rows.map((r) => (
          <li key={r.key} className={`bars__row${r.highlight ? ' is-hl' : ''}`} title={r.note}>
            <span className="bars__label">{r.label}</span>
            <span className="bars__track">
              <span className="bars__fill" style={{ width: `${Math.max(0.6, (r.value / top) * 100)}%` }} />
            </span>
            <span className="bars__value">{r.display ?? fmt(r.value)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

type Tip = { x: number; y: number; title: string; lines: string[] } | null;

function Tooltip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div className="tip" style={{ left: `${tip.x}%`, top: `${tip.y}%` }} role="status">
      <strong>{tip.title}</strong>
      {tip.lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

/** Kolom vertikal satu seri (distribusi). */
export function Columns({
  data,
  caption,
  xLabel,
  tipTitle,
  tipLine,
}: {
  data: { label: string; value: number }[];
  caption: string;
  xLabel?: (d: { label: string }, i: number) => string | null;
  tipTitle: (d: { label: string; value: number }) => string;
  tipLine: (d: { label: string; value: number }) => string;
}) {
  const [tip, setTip] = useState<Tip>(null);
  const W = 640, H = 240, P = { l: 44, r: 8, t: 12, b: 28 };
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const band = iw / data.length;
  const bw = Math.min(24, band - 2);
  const ticks = [0, 0.5, 1].map((f) => f * max);
  return (
    <figure className="chart" aria-label={caption}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption} onMouseLeave={() => setTip(null)}>
        {ticks.map((t) => {
          const y = P.t + ih - (t / max) * ih;
          return (
            <g key={t}>
              <line x1={P.l} x2={W - P.r} y1={y} y2={y} className="grid" />
              <text x={P.l - 8} y={y + 4} className="axis" textAnchor="end">
                {compact(t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * ih;
          const x = P.l + i * band + (band - bw) / 2;
          const y = P.t + ih - h;
          const lab = xLabel ? xLabel(d, i) : d.label;
          return (
            <g key={d.label}>
              <path d={roundedTop(x, y, bw, h)} className="mark" />
              <rect
                x={P.l + i * band}
                y={P.t}
                width={band}
                height={ih}
                fill="transparent"
                onMouseEnter={() =>
                  setTip({ x: ((x + bw / 2) / W) * 100, y: (y / H) * 100, title: tipTitle(d), lines: [tipLine(d)] })
                }
              />
              {lab && (
                <text x={x + bw / 2} y={H - 8} className="axis" textAnchor="middle">
                  {lab}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
    </figure>
  );
}

/** Kolom berkelompok: beberapa seri per kelompok, legenda di atas. */
export function GroupedColumns({
  groups,
  series,
  caption,
}: {
  groups: { label: string; values: number[] }[];
  series: string[];
  caption: string;
}) {
  const [tip, setTip] = useState<Tip>(null);
  const W = 640, H = 260, P = { l: 48, r: 8, t: 12, b: 28 };
  const max = niceMax(Math.max(...groups.flatMap((g) => g.values)));
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const band = iw / groups.length;
  const bw = 24, gap = 2;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  return (
    <figure className="chart" aria-label={caption}>
      <Legend series={series} />
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption} onMouseLeave={() => setTip(null)}>
        {ticks.map((t) => {
          const y = P.t + ih - (t / max) * ih;
          return (
            <g key={t}>
              <line x1={P.l} x2={W - P.r} y1={y} y2={y} className="grid" />
              <text x={P.l - 8} y={y + 4} className="axis" textAnchor="end">
                {compact(t)}
              </text>
            </g>
          );
        })}
        {groups.map((g, gi) => {
          const total = series.length * bw + (series.length - 1) * gap;
          const x0 = P.l + gi * band + (band - total) / 2;
          return (
            <g key={g.label}>
              {g.values.map((v, si) => {
                const h = (v / max) * ih;
                const x = x0 + si * (bw + gap);
                const y = P.t + ih - h;
                return (
                  <path
                    key={si}
                    d={roundedTop(x, y, bw, h)}
                    fill={SERIES[si]}
                    onMouseEnter={() =>
                      setTip({ x: ((x + bw / 2) / W) * 100, y: (y / H) * 100, title: `${series[si]} · ${g.label}`, lines: [fmt(v)] })
                    }
                  />
                );
              })}
              <text x={P.l + gi * band + band / 2} y={H - 8} className="axis" textAnchor="middle">
                {g.label}
              </text>
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
    </figure>
  );
}

export function Legend({ series }: { series: string[] }) {
  return (
    <ul className="legend">
      {series.map((s, i) => (
        <li key={s}>
          <span className="legend__key" style={{ background: SERIES[i] }} aria-hidden="true" />
          {s}
        </li>
      ))}
    </ul>
  );
}

/** Garis satu seri dengan crosshair + tooltip. */
export function LineChart({
  points,
  caption,
  tipTitle,
  tipLine,
}: {
  points: { label: string; value: number }[];
  caption: string;
  tipTitle: (p: { label: string; value: number }) => string;
  tipLine: (p: { label: string; value: number }) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId();
  const W = 640, H = 240, P = { l: 48, r: 16, t: 14, b: 28 };
  const max = niceMax(Math.max(...points.map((p) => p.value)));
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const xs = (i: number) => P.l + (i / (points.length - 1)) * iw;
  const ys = (v: number) => P.t + ih - (v / max) * ih;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(p.value)}`).join('');
  const area = `${path}L${xs(points.length - 1)},${P.t + ih}L${xs(0)},${P.t + ih}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const hp = hover === null ? null : points[hover];
  return (
    <figure className="chart" aria-label={caption}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={caption}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - box.left) / box.width) * W;
          const i = Math.round(((x - P.l) / iw) * (points.length - 1));
          setHover(Math.max(0, Math.min(points.length - 1, i)));
        }}
      >
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={SERIES[0]} stopOpacity="0.14" />
            <stop offset="1" stopColor={SERIES[0]} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={ys(t)} y2={ys(t)} className="grid" />
            <text x={P.l - 8} y={ys(t) + 4} className="axis" textAnchor="end">
              {compact(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % 2 === 0 ? (
            <text key={p.label} x={xs(i)} y={H - 8} className="axis" textAnchor="middle">
              {p.label}
            </text>
          ) : null,
        )}
        <path d={area} fill={`url(#${gid})`} />
        <path d={path} fill="none" stroke={SERIES[0]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hp && hover !== null && (
          <g>
            <line x1={xs(hover)} x2={xs(hover)} y1={P.t} y2={P.t + ih} className="crosshair" />
            <circle cx={xs(hover)} cy={ys(hp.value)} r="5" fill={SERIES[0]} stroke="#f6f0ef" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hp && hover !== null && (
        <Tooltip tip={{ x: (xs(hover) / W) * 100, y: (ys(hp.value) / H) * 100, title: tipTitle(hp), lines: [tipLine(hp)] }} />
      )}
    </figure>
  );
}

/** Heatmap sekuensial satu hue (terang → gelap). */
export function Heatmap({
  cols,
  rows,
  caption,
  tip,
}: {
  cols: string[];
  rows: { label: string; values: (number | null)[] }[];
  caption: string;
  tip: (row: string, col: string, v: number) => string;
}) {
  const all = rows.flatMap((r) => r.values).filter((v): v is number => v !== null);
  const lo = Math.min(...all), hi = Math.max(...all);
  return (
    <div className="heat-wrap">
      <table className="heat" aria-label={caption}>
        <thead>
          <tr>
            <th scope="col" />
            {cols.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {r.values.map((v, i) => {
                if (v === null) return <td key={i} className="heat__empty" aria-label="—" />;
                const f = (v - lo) / (hi - lo);
                return (
                  <td
                    key={i}
                    title={tip(r.label, cols[i], v)}
                    style={{ background: `color-mix(in oklab, #0077b6 ${Math.round(8 + f * 82)}%, #f6f0ef)`, color: f > 0.5 ? '#fff' : 'var(--c-ink)' }}
                  >
                    {fmt(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function roundedTop(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, h, w / 2);
  if (h <= 0) return '';
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
