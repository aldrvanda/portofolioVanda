# 001 — Fix the CV download link and remove the Contact tagline/lead

- **Status**: DONE (2026-10-02)
- **Commit**: no git repository (snapshot of 2026-10-02)
- **Severity**: HIGH (CV button is broken in production)
- **Category**: Content / bug fix (non-motion, requested together with the motion plans)
- **Estimated scope**: 3 files, ~15 lines

## Problem

### A. "Download CV" returns 404

```ts
// components/Sections.tsx:11 — current
export const CV_URL = '/public/gallery/CV Aldreine Vanda Kauntu.pdf';
```

The PDF actually lives at `public/CV Aldreine Vanda Kauntu.pdf` (project root `public/`, not `public/gallery/`). Next.js serves the contents of `public/` from the site root, so the URL must **not** contain `/public/`. The correct URL is `/CV Aldreine Vanda Kauntu.pdf`; spaces must be percent-encoded in an `href`.

The link is rendered at `components/Sections.tsx:69`:

```tsx
<a
  href={CV_URL}
  download
  className={`btn ${showProjects ? 'btn-secondary' : 'btn-primary'}`}
  onClick={() => track('contact_click', { target: 'download_cv' })}
>
```

### B. Contact copy the owner asked to delete

```tsx
// components/Contact.tsx (around line 64-65) — current
<SectionHeader id="contact" heading={S.contact.heading} title={S.contact.title} />
<p className="body-lg muted contact__lead" data-reveal>{t(S.contact.lead)}</p>
```

`S.contact.title` = "Put me on the team." and `S.contact.lead` = "Hiring for a Data Analyst or BI role, internship or junior? Send me a note." (`lib/strings.ts`, inside `contact: { … }`). Both must go. `SectionHeader` (`components/Sections.tsx:14`) currently requires `title`.

## Target

- `CV_URL = '/CV%20Aldreine%20Vanda%20Kauntu.pdf'`, and the anchor uses `download="Aldreine-Vanda-Kauntu-CV.pdf"` so the saved file gets a clean name.
- Contact section shows only the heading "Contact" (ID "Kontak"), then the email block. No subtitle, no lead paragraph.
- `SectionHeader` accepts an optional `title`; when absent, the `<p className="section-sub">` is not rendered.

## Repo conventions to follow

- UI strings live in `lib/strings.ts` as `{ en, id }` objects inside the `S` constant.
- `SectionHeader` is the single section-heading component; keep its markup otherwise unchanged.

## Steps

1. `components/Sections.tsx:11` — replace the line with:
   ```ts
   /** PDF CV ada di public/ (disajikan dari root situs). Spasi di-encode. */
   export const CV_URL = '/CV%20Aldreine%20Vanda%20Kauntu.pdf';
   ```
   Delete the older comment line above it (`/** Taruh PDF CV di public/ dengan nama ini. */`).
2. `components/Sections.tsx`, the CV anchor in `Hero` — change `download` to `download="Aldreine-Vanda-Kauntu-CV.pdf"`.
3. `components/Sections.tsx`, `SectionHeader` — change the signature to `{ id: string; heading: L; title?: L }` and render the subtitle only when present:
   ```tsx
   {title && <Tx v={title} as="p" className="section-sub" />}
   ```
4. `components/Contact.tsx` — change the header line to `<SectionHeader id="contact" heading={S.contact.heading} />` and delete the whole `<p className="body-lg muted contact__lead" …>` line.
5. `lib/strings.ts` — inside `contact: { … }` delete the `title: { … }` entry and the multi-line `lead: { … }` entry.
6. `app/globals.css` — delete the now-unused `.contact__lead { … }` rule.

## Boundaries

- Do NOT rename or move the PDF file.
- Do NOT change any other section's header or copy.
- If `public/CV Aldreine Vanda Kauntu.pdf` does not exist, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` passes; `npm run build` succeeds; `grep -rn "S.contact.title\|S.contact.lead\|contact__lead" components app lib` returns nothing.
- **Runtime**: `npx next start`, then `curl -I "http://localhost:3000/CV%20Aldreine%20Vanda%20Kauntu.pdf"` returns `200` with `content-type: application/pdf`. Clicking "Download CV" saves `Aldreine-Vanda-Kauntu-CV.pdf`.
- **Done when**: CV downloads in Chrome and Safari; Contact shows only "Contact" + email block in both EN and ID.
