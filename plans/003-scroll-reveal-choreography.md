# 003 — Replace the one-size fade-up with a scroll choreography

- **Status**: TODO
- **Commit**: no git repository (snapshot of 2026-10-02)
- **Severity**: LOW (polish), requested by the owner as "scroll animation terlalu basic"
- **Category**: Cohesion & tokens / Missed opportunities
- **Estimated scope**: 4 files (`app/globals.css`, `components/Sections.tsx`, `components/Projects.tsx`, `components/ExperienceCarousel.tsx`, and `components/Contact.tsx` one attribute), ~120 lines CSS

## Problem

Every scroll reveal on the page is the same move: fade + rise 32px.

```css
/* app/globals.css:320-326 — current */
/* Reveal dipakai hemat (timeline + penutup footer). Tanpa JS, konten tetap terlihat. */
[data-reveal] {
  transition: opacity 700ms var(--ease-out) var(--d, 0ms), transform 700ms var(--ease-out) var(--d, 0ms);
}
.js [data-reveal]:not(.is-in) {
  opacity: 0;
  transform: translateY(var(--rv, 28px));
}
```

Used at: `components/Sections.tsx:16` (section header), `:102` (about lead), `:106` (education), `:126` (toolkit title), `:134` (toolkit groups); `components/Projects.tsx:34` (project rows); `components/ExperienceCarousel.tsx:133` (counter bar), `:165` (track); `components/Contact.tsx:68` (email block).

The hairline rules that structure the page (`border-top: 1px solid` on `.section-header` `app/globals.css:271`, `.cards > li` `:983`, `.toolkit` `:899`) appear fully drawn, so the page's editorial skeleton never "builds". Identical motion everywhere reads as a template, not a choreography.

The JS that toggles `.is-in` (`components/Motion.tsx:8-29`, IntersectionObserver, `rootMargin: '0px 0px -8% 0px'`, `threshold: 0.08`, reveals once) is fine and **stays unchanged**. It selects `[data-reveal]:not(.is-in)`, so valued attributes like `data-reveal="mask"` are picked up automatically.

## Target

Five reveal variants, each matched to what the content is. These are marketing-page entrances seen once per visit, so longer durations (800–1100ms) are allowed; all use the strong ease-out token:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1); /* already at app/globals.css:45 */
```

| Variant (`data-reveal=`) | Used on | Motion |
| --- | --- | --- |
| *(empty)* "rise" | education block, experience counter bar | opacity 0→1, `translateY(32px)`→0, 800ms |
| `mask` | about lead paragraph, toolkit title, contact email block | text uncovered top→bottom: `clip-path: inset(-0.5em -0.5em 100% -0.5em)` → `inset(-0.5em)`, plus `translateY(24px)`→0, 1000ms |
| `row` | each project `<li>` | its top hairline draws left→right (`scaleX(0→1)`, 1000ms), then the card content rises 24px + fades, 800ms, +120ms after the line |
| `group` | each toolkit category | the group stays put; each tool name inside rises 10px + fades, 600ms, staggered 40ms (cap 6 items) |
| `slide` | experience track | enters from the right: `translateX(64px)`→0 + fade, 900ms (announces the horizontal axis) |

Plus:
- **Section header rule draws.** `.section-header`'s `border-top` becomes a `::before` hairline that draws left→right, `scaleX(0→1)`, 1100ms, when the header reveals (the title already slides up from its mask at `app/globals.css:273-297`; keep that).
- **Scroll-linked signature: the Experience section expands to full-bleed** as it scrolls into view, using a CSS scroll-driven animation (progressive enhancement; browsers without `animation-timeline` see it static):
  `clip-path: inset(0 4% round 28px)` → `inset(0 0 round 0)`, `animation-timeline: view()`, `animation-range: entry 0% entry 70%`, linear (scroll-linked motion is constant-rate by definition; the scroll itself provides the easing).
- **Reduced motion:** no transforms, no clip-path, no line drawing. Content only fades (the global reduced-motion block already limits `transition-property` to opacity/colour).

## Repo conventions to follow

- All motion CSS lives in `app/globals.css`; staggers are passed as `--d` (and new: `--j`) inline custom properties on the element itself. Exemplar: `components/Sections.tsx:134-136`
  ```tsx
  <div key={g.cat} className="toolkit__group" data-reveal style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
  ```
- Scroll-driven animations are already used for the hero inside `@supports (animation-timeline: scroll())` + `@media (prefers-reduced-motion: no-preference)` near the end of `app/globals.css`. Put the new one in the same block.
- Never drive a child transform via a custom property on a parent; `--d`/`--j` are only **delays**, which is fine.

## Steps

1. **CSS — base variants.** In `app/globals.css`, replace the block quoted in *Problem* (lines 320-326, including its comment) with:
   ```css
   /* Scroll reveal. Varian dipilih lewat nilai data-reveal. Tanpa JS, konten tetap terlihat. */
   [data-reveal] {
     transition: opacity 800ms var(--ease-out) var(--d, 0ms), transform 800ms var(--ease-out) var(--d, 0ms);
   }
   .js [data-reveal]:not(.is-in) {
     opacity: 0;
     transform: translateY(var(--rv, 32px));
   }

   /* mask: teks terbuka dari atas ke bawah */
   [data-reveal='mask'] {
     clip-path: inset(-0.5em);
     transition: clip-path 1000ms var(--ease-out) var(--d, 0ms), transform 1000ms var(--ease-out) var(--d, 0ms);
   }
   .js [data-reveal='mask']:not(.is-in) {
     opacity: 1;
     clip-path: inset(-0.5em -0.5em 100% -0.5em);
     transform: translateY(24px);
   }

   /* slide: masuk dari kanan (carousel) */
   .js [data-reveal='slide']:not(.is-in) {
     transform: translateX(64px);
   }
   [data-reveal='slide'] {
     transition-duration: 900ms;
   }

   /* row & group: wadah diam, isinya yang bergerak */
   .js [data-reveal='row']:not(.is-in),
   .js [data-reveal='group']:not(.is-in) {
     opacity: 1;
     transform: none;
   }
   ```
2. **CSS — section header rule.** Change `.section-header` (line ~267): remove `border-top: 1px solid var(--color-ink);`, add `position: relative;`. Add after it:
   ```css
   .section-header::before {
     content: '';
     position: absolute;
     inset: 0 0 auto;
     height: 1px;
     background: var(--color-ink);
     transform-origin: left;
     transition: transform 1100ms var(--ease-out);
   }
   .js .section-header[data-reveal]:not(.is-in)::before {
     transform: scaleX(0);
   }
   ```
   Replace the dark-section override `.section--dark .section-header { border-top-color: rgba(236, 226, 225, 0.3); }` (line ~1372) with:
   ```css
   .section--dark .section-header::before {
     background: rgba(236, 226, 225, 0.3);
   }
   ```
3. **CSS — project rows.** Change `.cards > li` (line ~983): remove its `border-top`, add `position: relative;`. Add:
   ```css
   .cards > li::before {
     content: '';
     position: absolute;
     inset: 0 0 auto;
     height: 1px;
     background: var(--color-ink);
     transform-origin: left;
     transition: transform 1000ms var(--ease-out) var(--d, 0ms);
   }
   .js .cards > li[data-reveal]:not(.is-in)::before {
     transform: scaleX(0);
   }
   [data-reveal='row'] > .card {
     transition: opacity 800ms var(--ease-out) calc(var(--d, 0ms) + 120ms),
       transform 800ms var(--ease-out) calc(var(--d, 0ms) + 120ms);
   }
   .js [data-reveal='row']:not(.is-in) > .card {
     opacity: 0;
     transform: translateY(24px);
   }
   ```
   Check that `.card` has no other `transition` declaration that this would override; if it does, merge the property lists instead of replacing.
4. **CSS — toolkit stagger.** Add:
   ```css
   [data-reveal='group'] .toolkit__tool {
     transition: opacity 600ms var(--ease-out) calc(var(--d, 0ms) + var(--j, 0) * 40ms),
       transform 600ms var(--ease-out) calc(var(--d, 0ms) + var(--j, 0) * 40ms);
   }
   .js [data-reveal='group']:not(.is-in) .toolkit__tool {
     opacity: 0;
     transform: translateY(10px);
   }
   ```
5. **CSS — scroll-linked Experience expand.** Inside the existing `@supports (animation-timeline: scroll()) { @media (prefers-reduced-motion: no-preference) { … } }` block, add:
   ```css
   .section--dark {
     animation: dark-expand linear both;
     animation-timeline: view();
     animation-range: entry 0% entry 70%;
   }
   ```
   And after the `@keyframes hero-gallery-scroll` rule:
   ```css
   @keyframes dark-expand {
     from {
       clip-path: inset(0 4% round 28px);
     }
     to {
       clip-path: inset(0 0 round 0);
     }
   }
   ```
6. **CSS — reduced motion.** Inside `@media (prefers-reduced-motion: reduce)`, replace the existing
   `.js [data-reveal]:not(.is-in) { opacity: 1; transform: none; }` with:
   ```css
   .js [data-reveal]:not(.is-in),
   .js [data-reveal]:not(.is-in) * {
     transform: none !important;
     clip-path: none !important;
   }
   .js [data-reveal]:not(.is-in)::before {
     transform: none !important;
   }
   ```
   (Opacity is intentionally left animating; the global rule already makes it a 150ms fade.)
7. **Markup — assign variants.**
   - `components/Sections.tsx:102`: `<div data-reveal>` (wraps the about lead) → `<div data-reveal="mask">`.
   - `components/Sections.tsx:126`: `<div data-reveal>` (wraps the toolkit title) → `<div data-reveal="mask">`.
   - `components/Sections.tsx:134`: toolkit group `data-reveal` → `data-reveal="group"`, and give each `<dd className="toolkit__tool">` (map index `k`) `style={{ '--j': Math.min(k, 6) } as React.CSSProperties}`.
   - `components/Projects.tsx:34`: `<li data-reveal …>` → `<li data-reveal="row" …>` (keep the existing `--d` style).
   - `components/ExperienceCarousel.tsx:165`: track `data-reveal` → `data-reveal="slide"`.
   - `components/Contact.tsx:68`: email block `data-reveal` → `data-reveal="mask"` (keep the `--d` style). If plan 001 has already removed `contact__lead`, nothing else in Contact changes.
   Leave `Sections.tsx:16` (header), `:106` (education) and `ExperienceCarousel.tsx:133` (counter bar) as plain `data-reveal`.

## Boundaries

- Do NOT edit `components/Motion.tsx` (the IntersectionObserver stays as is).
- Do NOT touch the hero (`.hero*`, `.gallery*`) or its existing scroll-linked animations.
- Do NOT reveal the Contact link rows (`.contact__rows`). They are key contact links and must never depend on an observer firing.
- Do NOT add dependencies.
- If line numbers or quoted code have drifted, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` passes; `npm run build` succeeds.
- **Feel check** (`npx next start`, Chrome, scroll slowly from top to bottom):
  - Each section header: the hairline draws left→right while the title rises out of its mask; the subtitle follows ~150ms later.
  - About lead and contact email: text uncovers downward, no glyph descenders clipped at the end state (check "g", "y", "@").
  - Projects: for each row the line draws first, then the card content rises; rows stagger ~70ms; a row's content is never visible before its line starts.
  - Toolkit: tool names cascade within each category; the whole grid finishes within ~1s.
  - Experience: the dark panel starts inset with rounded corners and widens to full-bleed as it scrolls in; the slide track glides in from the right.
  - DevTools → Animations at 10%: no element jumps at the end of its transition (clip-path end state must equal the at-rest state).
  - Rendering → `prefers-reduced-motion: reduce`: nothing moves or clips; content just fades in; all hairlines are fully drawn.
  - Disable JavaScript: everything is visible and all lines drawn (the `.js` class gate).
- **Done when**: the five variants are in use as listed and every reveal checks out in the feel check.
