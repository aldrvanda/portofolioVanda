# 004 — Tie the Experience carousel's motion to the swipe itself

- **Status**: TODO
- **Commit**: no git repository (snapshot of 2026-10-02)
- **Severity**: MEDIUM
- **Category**: Interruptibility / Physicality / Gestures
- **Estimated scope**: 2 files (`components/ExperienceCarousel.tsx`, `app/globals.css`), ~80 lines changed

## Problem

The carousel's slide effects are **time-based transitions triggered after the fact**, so they feel detached from the user's finger:

```tsx
// components/ExperienceCarousel.tsx:45-60 — current: active slide flips only when 60% visible
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) setIndex(slides.indexOf(e.target as HTMLElement));
    }
  },
  { root: el, threshold: 0.6 },
);
```

```css
/* app/globals.css — current, driven by .is-active */
.xp__slide { … opacity: 0.4; transition: opacity 400ms var(--ease-out); }   /* ~line 1464 */
.xp__slide.is-active { opacity: 1; }
.xp__photo { … transform: scale(1.06); transition: transform 900ms var(--ease-out); }   /* ~line 1479 */
.xp__slide.is-active .xp__photo { transform: scale(1); }
.xp__body { … transform: translateY(12px); transition: transform 600ms var(--ease-out); }   /* ~line 1505 */
.xp__slide.is-active .xp__body { transform: none; }
.xp__progress span { … transition: transform 400ms var(--ease-out); }   /* ~line 1399 */
```

Consequences:
1. Mid-swipe, nothing responds. Then the 60% threshold flips `.is-active` and a 400–900ms animation plays **after** the finger lifted. The motion lags the gesture instead of following it.
2. The text doesn't "follow the photo": both just fade in place.
3. Mouse-drag release ignores velocity. `up()` (`ExperienceCarousel.tsx:100-113`) always snaps to the *nearest* slide, so a quick flick that moved less than half a slide snaps back. A flick should be enough.
4. The counter digit (`ExperienceCarousel.tsx:135`) swaps instantly while everything else moves.

## Target

- **Scroll-linked, continuous** slide state, computed every frame from `scrollLeft` (works with touch, trackpad, mouse drag, buttons, keyboard, and is interruptible by definition because it has no timeline of its own). For each slide, `d` = signed distance from its snap position in slide widths (0 = snapped, +1 = one slide to the right, −1 = one slide left), clamped to [−1, 1]:
  - slide `opacity = 1 − |d| × 0.6` (so neighbours sit at 0.4, matching today's resting look)
  - photo inner parallax: `transform: translateX(${-d × 5}%) scale(1.12)` (the 1.12 scale leaves 6% slack per side so the 5% shift never shows an edge; `.xp__media` already has `overflow: hidden`)
  - text lags behind the photo: `.xp__body` `transform: translateX(${d × 48}px)` → the text slides in a beat behind its photo and settles exactly at snap
  - progress bar: `scaleX(((scrollLeft / maxScroll) × (total − 1) + 1) / total)` set directly on the bar element, no transition
- Write `style.transform` / `style.opacity` **directly on each element**. Do NOT drive them through CSS custom properties on the track or slide (that recalculates styles for every child).
- **Velocity-aware mouse release** (Emil's dismissal rule): if release velocity `|v| > 0.11 px/ms`, advance one slide in the flick direction from the slide where the drag started; otherwise snap to the nearest.
- **Counter digit** enters with a transition plus `@starting-style`: from `translateY(60%)`, `opacity: 0`, 300ms `--ease-out`, remounted per index via `key`.
- **Reduced motion:** keep the opacity mapping (it's not movement), skip parallax and text offset (leave transforms unset), and progress still updates.

Tokens (already defined, `app/globals.css:45-47`):
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
```

## Repo conventions to follow

- Scroll handlers batch through `requestAnimationFrame`. Exemplar: `ScrollProgress` in `components/Motion.tsx:32-53`:
  ```ts
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  ```
- Reduced motion is detected with `window.matchMedia('(prefers-reduced-motion: reduce)').matches` (same file, `prefersReduced`).
- Slide offsets use the existing helper `leftOf(el, slide)` (`ExperienceCarousel.tsx:63-64`), which already accounts for `scroll-padding-left`.

## Steps

1. **CSS — remove time-based slide states.** In `app/globals.css`:
   - `.xp__slide`: delete `opacity: 0.4;` and `transition: opacity 400ms var(--ease-out);`. Add `will-change: opacity;`.
   - Delete the `.xp__slide.is-active { opacity: 1; }` rule.
   - `.xp__photo`: change `transform: scale(1.06);` to `transform: scale(1.12);`, delete its `transition` line, add `will-change: transform;`.
   - Delete `.xp__slide.is-active .xp__photo { transform: scale(1); }`.
   - `.xp__body`: delete `transform: translateY(12px);` and its `transition` line; add `will-change: transform;`.
   - Delete `.xp__slide.is-active .xp__body { transform: none; }`.
   - `.xp__progress span`: delete the `transition` line, and add `transform: scaleX(0);` as the initial value.
   Keep the `is-active` class in JSX (other CSS or a11y may rely on it). It just no longer animates.
2. **CSS — counter digit.** Change `.xp__count-now` to:
   ```css
   .xp__count-now {
     display: inline-block;
     overflow: hidden;
     vertical-align: bottom;
     color: var(--c-blush);
   }
   .xp__digit {
     display: inline-block;
     transition: transform 300ms var(--ease-out), opacity 300ms var(--ease-out);
     @starting-style {
       transform: translateY(60%);
       opacity: 0;
     }
   }
   ```
3. **JSX — counter.** In `components/ExperienceCarousel.tsx:135`, replace the inner text with a keyed span:
   ```tsx
   <span className="xp__count-now">
     <span key={index} className="xp__digit">
       {String(index + 1).padStart(2, '0')}
     </span>
   </span>
   ```
4. **JSX — progress bar ref.** Add `const bar = useRef<HTMLSpanElement>(null);` next to `track`. Replace line 140 with `<span ref={bar} />` (remove the inline `style`).
5. **JS — scroll-linked frame.** Add this effect after the IntersectionObserver effect (lines 45-60):
   ```tsx
   // Gerak slide mengikuti posisi scroll setiap frame: menempel pada jari, bisa disela kapan saja.
   useEffect(() => {
     const el = track.current;
     if (!el) return;
     const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
     const parts = (Array.from(el.children) as HTMLElement[]).map((s) => ({
       s,
       photo: s.querySelector<HTMLElement>('.xp__photo'),
       body: s.querySelector<HTMLElement>('.xp__body'),
     }));
     let raf = 0;
     const update = () => {
       raf = 0;
       for (const { s, photo, body } of parts) {
         const d = Math.max(-1, Math.min(1, (leftOf(el, s) - el.scrollLeft) / s.offsetWidth));
         s.style.opacity = (1 - Math.abs(d) * 0.6).toFixed(3);
         if (reduce) continue;
         if (photo) photo.style.transform = `translateX(${(-d * 5).toFixed(2)}%) scale(1.12)`;
         if (body) body.style.transform = `translateX(${(d * 48).toFixed(1)}px)`;
       }
       const max = el.scrollWidth - el.clientWidth;
       if (bar.current && total > 0) {
         const p = max > 0 ? el.scrollLeft / max : 0;
         bar.current.style.transform = `scaleX(${((p * (total - 1) + 1) / total).toFixed(4)})`;
       }
     };
     const onScroll = () => {
       if (!raf) raf = requestAnimationFrame(update);
     };
     update();
     el.addEventListener('scroll', onScroll, { passive: true });
     window.addEventListener('resize', onScroll);
     return () => {
       cancelAnimationFrame(raf);
       el.removeEventListener('scroll', onScroll);
       window.removeEventListener('resize', onScroll);
     };
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [total]);
   ```
   `leftOf` is declared later in the component body as a `const` arrow function. Move its declaration (lines 62-64) **above** this new effect so the reference reads top-down. It's only called inside callbacks, so behaviour is identical either way.
6. **JS — velocity-aware release.** In the drag effect (lines 75-125):
   - Add `let startIndex = 0; let lastX = 0; let lastT = 0; let v = 0;`
   - Add a local `nearestIndex()` helper with the existing `reduce` logic from `up()` (lines 106-111) so it can be reused.
   - In `down`: after `startScroll = el.scrollLeft;` add `startIndex = nearestIndex(); lastX = e.clientX; lastT = e.timeStamp; v = 0;`
   - In `move`, after the scroll assignment add:
     ```ts
     const dt = e.timeStamp - lastT;
     if (dt > 0) v = (e.clientX - lastX) / dt; // px per ms, last sample only
     lastX = e.clientX;
     lastT = e.timeStamp;
     ```
   - In `up`, replace the nearest-slide block with:
     ```ts
     // Flick cepat cukup untuk pindah slide, walau jaraknya kurang dari setengah slide.
     const target = Math.abs(v) > 0.11 ? startIndex + (v < 0 ? 1 : -1) : nearestIndex();
     goTo(target);
     ```
     (`goTo` already clamps to `[0, total − 1]`.)

## Boundaries

- Do NOT change the slide markup structure, the scroll-snap CSS on `.xp__track`, the buttons, or the IntersectionObserver that sets `index` (it still drives the counter, button disabled states, and `aria-live`).
- Do NOT replace native scrolling with a JS animation library or springs. Native scroll-snap already gives touch momentum.
- Do NOT add dependencies.
- If quoted code or line numbers have drifted, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` passes; `npm run build` succeeds.
- **Feel check** (`npx next start`):
  - Trackpad/finger: drag slowly. The current slide fades toward 0.4 and the next one brightens **continuously under your finger**, with no delayed animation after release.
  - The photo shifts slightly inside its frame while the text slides a little further and lands last; at rest, both are exactly in place (no residual offset).
  - Progress bar moves with the scroll, not in steps.
  - Mouse: grab and flick quickly ~100px left: it advances one slide. Drag slowly ~30% and release: it snaps back.
  - Counter: the new number slides up into place on each change; tapping "next" repeatedly never leaves a stale digit.
  - Stop a swipe halfway with your finger: everything freezes exactly where it is (interruptible).
  - Real phone (Safari iOS + Chrome Android): 60fps while swiping, no jank. Check the Performance panel; there should be no layout or style recalc for the whole slide list per frame, only composited transforms and opacity.
  - Rendering → `prefers-reduced-motion: reduce`: slides only cross-fade; photos and text don't shift.
- **Done when**: no slide effect plays on a timer after a gesture ends; every visual state is a pure function of scroll position.
