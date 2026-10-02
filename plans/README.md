# Animation & polish plans

Written by `improve-animations` on 2026-10-02 (no git repository, so plans are stamped with the date).
Every plan is self-contained: exact files, current code, target values, steps, boundaries, and a feel check.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Fix the CV download link and remove the Contact tagline/lead](001-cv-download-and-contact-copy.md) | HIGH | DONE |
| 002 | [Exit transitions for the project modal, mobile menu, and toast](002-overlay-exit-transitions.md) | MEDIUM | TODO |
| 003 | [Scroll reveal choreography](003-scroll-reveal-choreography.md) | LOW | TODO |
| 004 | [Scroll-linked Experience carousel motion](004-carousel-scroll-linked-motion.md) | MEDIUM | TODO |

## Recommended order

1. **001** first. It's a production bug (CV 404) and touches `components/Contact.tsx` + `SectionHeader`, which 003 also touches.
2. **002**. Independent of the others except for `components/Contact.tsx` (toast); do it after 001 to avoid conflicts.
3. **004**. Self-contained in the carousel.
4. **003** last. It edits shared CSS (`.section-header`, `[data-reveal]`, reduced-motion block) and adds `data-reveal` values in files that 001, 002 and 004 also edit, so doing it last avoids rebasing its steps.

## Dependencies

- 003 step 7 (Contact email block) assumes 001 may have already removed `contact__lead`. It works either way.
- 003 step 6 and 002 step 5 both add rules inside `@media (prefers-reduced-motion: reduce)`. Append; don't replace each other's rules.
- 003 step 5 and the existing hero scroll animations share the `@supports (animation-timeline: scroll())` block. Add to it; don't create a second one.

## Run

- With any agent: "Execute `plans/00N-….md` exactly; stop and report on drift."
- Or: `improve-animations execute plans/00N-….md`.
