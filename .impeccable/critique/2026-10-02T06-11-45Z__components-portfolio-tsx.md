---
target: homepage
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\vanda\\OneDrive - Bina Nusantara\\Documents\\Portofolio Vanda\\components\\Portfolio.tsx"
target_fingerprint: "sha256:75bb8128ee4e33f2dde7ac563a5d4ce7ffe1a62c1b5c00fd5fed9ddc503b6dab"
target_path: "C:\\Users\\vanda\\OneDrive - Bina Nusantara\\Documents\\Portofolio Vanda\\components\\Portfolio.tsx"
timestamp: 2026-10-02T06-11-45Z
slug: components-portfolio-tsx
---
# Critique: homepage (components/Portfolio.tsx)

Method: dual-agent (A: design review subagent, B: detector subagent)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Active nav, scroll progress, copy toast; unlit About words look disabled |
| 2 | Match System / Real World | 3 | "Live dataset" caption over random data; "Elsewhere/Colophon" too clever for HR |
| 3 | User Control and Freedom | 3 | Native dialog Esc/backdrop/close, focus returns |
| 4 | Consistency and Standards | 3 | Cursor pill uses external icon for in-page modal; "PROJECT" filler for no-KPI cards |
| 5 | Error Prevention | 3 | Copy only when Clipboard API exists; WebGL fail renders nothing |
| 6 | Recognition Rather Than Recall | 3 | Rows show title/summary/stack/KPI; click affordance mostly arrow + hover pill |
| 7 | Flexibility and Efficiency | n/a | Single-page portfolio, no expert workflow |
| 8 | Aesthetic and Minimalist Design | 2 | ~9 concurrent motion effects; marquee duplicates skills grid; About lead competes with h2 |
| 9 | Error Recovery | 3 | Copy failure selects email and explains |
| 10 | Help and Documentation | n/a | No task needs docs |
| Total | | 23/32 | Good (72%) |

## Design Specificity Verdict
~60% authored. Specific: color discipline, Instrument Serif display, editorial "Fig. 01"/Colophon voice, dark Experience, closing green band. Interchangeable: the award-portfolio kit (oversized serif name, marquee, spotlight, magnetic buttons, cursor pill, scroll-lit text, count-ups, giant email, giant initials). The one product-specific idea, the 3D bar chart, is seeded random data captioned "Live dataset" (components/DataScene.tsx:11-20), contradicting "Evidence before adjectives".
Detector: CLI components/ clean; app/ 1 advisory codex-grid-background (app/globals.css:305, spotlight grid, borderline). Browser injection: 17 anti-patterns; 9 low-contrast are false positives (hidden ::before hover fills / gradient underline read as background); oversized-h1 and all-caps-body intentional/weak; real: numbered-section-labels + kicker-above-heading ("01 — About" eyebrows), overused-font (Inter 57%), em-dash-overuse (8). Detector missed the 1.5:1 unlit About words (globals.css:871).

## Priority Issues
- [P1] Hiring-manager path dead-ends: no project has repoUrl/demoUrl in seed, so modal actions never render. Fix: modal always ends with GitHub (profile fallback) + Email me, "no public repo" note; add real URLs. Command: /impeccable harden
- [P1] Hero visual is fabricated data ("Live dataset", random, no axes). Fix: drive bars from real seed numbers (55,500 records with 21% invalid in green, or retail 3 branches x 6 product lines) with labeled hover readout, or recaption honestly. Command: /impeccable shape
- [P1] Mobile first screen lacks contact: header Contact hidden <900px (globals.css:528-530); 340-520px scene sits between name and CTAs. Fix: reorder areas meta/name/intro/scene <768px or cap scene ~220px; compact mobile Contact. Command: /impeccable adapt
- [P2] Scroll-lit About paragraph: unlit #c8d2c8 on #fafffa ~1.5:1; resets on locale change; ID ~15% longer; 3.5rem lead under 6rem h2. Fix: unlit >= #516254 or highlighter sweep; lead ~2.25rem/45ch. Command: /impeccable typeset
- [P2] Leadership invisible until 4th screen; generic motion stack. Fix: hero meta line about HIMTI leadership (user-approved wording); drop spotlight/magnetic/cursor pill; rethink "01 —" kickers; marquee by CATEGORY_ORDER. Command: /impeccable distill

## Persona Red Flags
- Jordan (recruiter first-timer): hero Contact is secondary outline; no CTA names email/LinkedIn; "Open to internships" vs "internships and junior roles".
- Riley: ID mode EN project titles under ID headings; long ID h2 wraps 3-4 lines at 6rem; card titles unclamped; name italic always word index 1 (Sections.tsx:261); featured flag unused.
- Casey: no mobile header contact; CTAs below fold; 3D scene with "drag to rotate" on phone; 6+ swipes to email.
- Recruiter scanning 40 portfolios: no "leader" signal above fold; template look; memorable element carries no info.
- BI lead: good case write-up then no repo/schema/dashboard visual/link out; axis-less chart undermines dataviz trust.

## Minor Observations
Desktop About dead left column; large gaps below Projects, Experience tail, below Contact CTAs; SaaS-like green glow on header Contact; all-2026 year column is noise; contact rows gated by data-reveal (risky); "Elsewhere"->"Tautan" non-parallel; em-dash overuse.

## Questions to Consider
- Why isn't the hero chart your own data (the 21% your pipeline rejected, in green)?
- Who is the word-by-word About effect for?
- What would replace marquee/spotlight/magnetic/cursor pill that only you could show (star schema, a real dashboard)?
