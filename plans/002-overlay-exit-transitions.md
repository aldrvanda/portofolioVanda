# 002 — Give the project modal, mobile menu, and toast real exit transitions

- **Status**: TODO
- **Commit**: no git repository (snapshot of 2026-10-02)
- **Severity**: MEDIUM
- **Category**: Interruptibility / Missed opportunities (asymmetric enter-without-exit)
- **Estimated scope**: 3 files (`app/globals.css`, `components/Projects.tsx`, `components/Contact.tsx`), ~90 lines

## Problem

All three surfaces animate **in** but vanish in a single frame **out**. The mismatch reads as broken.

1. **Project modal** — entry is a keyframe; close is instant, and the content unmounts immediately because the parent clears state in `onClose`.
   ```css
   /* app/globals.css:1144 — current */
   .modal[open] {
     animation: modal-in 300ms var(--ease-out);
   }
   /* app/globals.css:1846 — current */
   @keyframes modal-in {
     from { opacity: 0; transform: translateY(8px) scale(0.97); }
     to { opacity: 1; transform: none; }
   }
   ```
   ```tsx
   // components/Projects.tsx:120-150 — current (abridged)
   function ProjectModal({ project, links, onClosed }: ModalProps) {
     ...
     <dialog ref={ref} className="modal" aria-labelledby="modal-title" onClose={onClosed} ...>
       {project && (
         <div className="modal__panel"> ... </div>
       )}
   // components/Projects.tsx:267 — parent clears the project on close
   onClosed={() => { setOpen(null); trigger.current?.focus({ preventScroll: true }); }}
   ```
   Even with a CSS exit, `setOpen(null)` empties the dialog before the exit can play.

2. **Mobile menu** — entry keyframe only:
   ```css
   /* app/globals.css:625 — current */
   .menu-sheet[open] {
     display: flex;
     flex-direction: column;
     gap: 40px;
     animation: sheet-in 300ms var(--ease-drawer);
   }
   /* app/globals.css:1856 */
   @keyframes sheet-in {
     from { clip-path: inset(0 0 100% 0); }
     to { clip-path: inset(0 0 0 0); }
   }
   ```

3. **Toast** — enters with `@starting-style`, but React unmounts it after 2 s:
   ```css
   /* app/globals.css:1713 — current */
   .toast {
     ...
     transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out);
     @starting-style { opacity: 0; transform: translateY(8px); }
   }
   ```
   ```tsx
   // components/Contact.tsx:31-38 — current
   const showToast = (next: NonNullable<ToastState>) => {
     setToast(next);
     if (timer.current) clearTimeout(timer.current);
     timer.current = setTimeout(() => {
       setToast(null);
       setCopied(false);
     }, 2000);
   };
   // components/Contact.tsx:113 — rendered only while toast is set
   {toast?.kind === 'success' && (<div className="toast toast--success">…</div>)}
   ```

## Target

Exits mirror entries along the same path and are **faster** than entries (system response snaps):

| Surface | Enter | Exit |
| --- | --- | --- |
| Modal | 300ms `--ease-out`, from `opacity: 0; translateY(8px) scale(0.97)` | 150ms `--ease-out`, back to the same values |
| Modal backdrop | 300ms opacity 0→1 | 150ms opacity →0 |
| Mobile menu | 300ms `--ease-drawer`, `clip-path: inset(0 0 100% 0)` → `inset(0 0 0 0)` | 200ms `--ease-out`, back to `inset(0 0 100% 0)` (folds up) |
| Toast | 200ms `--ease-out` from `opacity: 0; translateY(8px)` (existing) | 150ms `--ease-out` to `opacity: 0; translateY(8px)` (exits the same bottom edge) |

Tokens already in `app/globals.css:45-47` (do not redefine):
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

Native `<dialog>` exit uses discrete transitions of `display` and `overlay`. Browsers without support (older Firefox) simply close instantly — acceptable fallback.

## Repo conventions to follow

- Motion lives in `app/globals.css`; durations are written inline, curves come from the `--ease-*` tokens.
- Exemplar of the transition + `@starting-style` pattern already in the repo: `.toast` at `app/globals.css:1713`.
- Reduced-motion block at the end of `app/globals.css` (`@media (prefers-reduced-motion: reduce)`) forces `transition-property` to color/opacity only with `!important`.

## Steps

1. **CSS — modal.** In `app/globals.css`, replace the `.modal[open] { animation: … }` rule (line ~1144) and delete `@keyframes modal-in` (line ~1846). Add, directly after the base `.modal { … }` rule:
   ```css
   .modal {
     opacity: 0;
     transform: translateY(8px) scale(0.97);
     transition: opacity 150ms var(--ease-out), transform 150ms var(--ease-out),
       overlay 150ms var(--ease-out) allow-discrete, display 150ms var(--ease-out) allow-discrete;
   }
   .modal[open] {
     opacity: 1;
     transform: none;
     transition-duration: 300ms;
   }
   @starting-style {
     .modal[open] {
       opacity: 0;
       transform: translateY(8px) scale(0.97);
     }
   }
   .modal::backdrop {
     opacity: 0;
     transition: opacity 150ms var(--ease-out), overlay 150ms allow-discrete, display 150ms allow-discrete;
   }
   .modal[open]::backdrop {
     opacity: 1;
     transition-duration: 300ms;
   }
   @starting-style {
     .modal[open]::backdrop {
       opacity: 0;
     }
   }
   ```
   Keep the existing `.modal::backdrop` background/blur declarations (merge, don't duplicate the selector twice with conflicting values).
   Inside `@media (max-width: 767px)` the modal is full-screen, so use `translateY(16px)` with no scale (scaling a full-screen sheet looks wrong). Inside the existing `@media (max-width: 767px)` block add:
   ```css
   .modal { transform: translateY(16px); }
   @starting-style { .modal[open] { transform: translateY(16px); } }
   ```

2. **React — keep modal content during exit.** In `components/Projects.tsx`, `ProjectModal`:
   - Add `const [shown, setShown] = useState<Project | null>(project);` and an effect `useEffect(() => { if (project) setShown(project); }, [project]);`
   - Replace every use of `project` **inside the JSX and the `hasLinks` line** with `shown` (the `useEffect` that calls `showModal()` keeps using `project`). The `{project && (` guard becomes `{shown && (`.
   - Do not clear `shown` on close; the closed dialog is invisible and the next open overwrites it.
   `useState` is already imported at the top of the file.

3. **CSS — mobile menu.** Replace the `animation: sheet-in …` line in `.menu-sheet[open]` and delete `@keyframes sheet-in`. Add after `.menu-sheet { … }`:
   ```css
   .menu-sheet {
     clip-path: inset(0 0 100% 0);
     transition: clip-path 200ms var(--ease-out), overlay 200ms allow-discrete, display 200ms allow-discrete;
   }
   .menu-sheet[open] {
     clip-path: inset(0 0 0 0);
     transition: clip-path 300ms var(--ease-drawer), overlay 300ms allow-discrete, display 300ms allow-discrete;
   }
   @starting-style {
     .menu-sheet[open] {
       clip-path: inset(0 0 100% 0);
     }
   }
   ```
   Keep `display: flex; flex-direction: column; gap: 40px;` on `.menu-sheet[open]`. `components/Header.tsx` needs no change — its navigation closes the menu and scrolls in the same tick, so the fold-up plays over the page.

4. **React + CSS — toast exit.** In `components/Contact.tsx`:
   - Add `const [leaving, setLeaving] = useState(false);`
   - In `showToast`, call `setLeaving(false)` before `setToast(next)`, and change the timeout body to:
     ```ts
     timer.current = setTimeout(() => {
       setLeaving(true);
       timer.current = setTimeout(() => {
         setToast(null);
         setLeaving(false);
         setCopied(false);
       }, 150);
     }, 2000);
     ```
   - Add `data-state={leaving ? 'closed' : 'open'}` to both `<div className="toast …">` elements.
   In `app/globals.css`, after `.toast { … }`:
   ```css
   .toast[data-state='closed'] {
     opacity: 0;
     transform: translateY(8px);
     transition-duration: 150ms;
   }
   ```

5. **Reduced motion.** Inside the existing `@media (prefers-reduced-motion: reduce)` block, after the `*, *::before, *::after { … }` rule, add so the overlays still fade (no movement) and still run their discrete transitions:
   ```css
   .modal,
   .modal::backdrop,
   .menu-sheet {
     transition-property: opacity, overlay, display !important;
     transform: none !important;
     clip-path: none !important;
   }
   ```

## Boundaries

- Do NOT change the dialog open/close logic in `components/Header.tsx`, the focus management in `ProjectModal`, or `onClosed` in the parent.
- Do NOT add dependencies or a motion library.
- Do NOT animate the toast with keyframes — it must stay a transition so a second "Copy email" click retargets smoothly.
- If any quoted code does not match what you find, STOP and report the drift.

## Verification

- **Mechanical**: `npx tsc --noEmit` passes; `npm run build` succeeds.
- **Feel check** (Chrome, `npx next start`):
  - Open a project, press Esc: the panel drops 8px and fades over ~150ms with its content still visible during the fade; backdrop fades with it. Repeat with the × button and a backdrop click.
  - Open the same project twice quickly: the second open plays the full entry, never a half-state.
  - On a ≤767px viewport: modal slides up 16px on open and down on close; mobile menu unfolds from the top on open and folds back up on close (tap a link and the ×).
  - Click "Copy email", wait 2 s: toast slides down 8px and fades. Click "Copy email" twice within 1 s: the toast stays, timer restarts, no flicker.
  - DevTools → Animations panel at 10% speed: exits are visibly shorter than entries; no frame where the modal content is empty while still visible.
  - Rendering panel → emulate `prefers-reduced-motion: reduce`: modal and menu fade only (no slide, no clip), toast fades.
- **Done when**: none of the three surfaces disappears in a single frame in Chrome/Edge/Safari 17.4+.
