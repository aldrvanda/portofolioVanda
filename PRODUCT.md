# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- **Recruiters and HR** screening candidates for Data Analyst and BI internships and junior roles. They scan quickly and need to know who Aldreine is, what roles they want, and how to reach them, usually by email or LinkedIn.
- **Technical hiring managers** (data or BI leads) checking technical depth before an interview. They read the case studies (problem, solution, role, impact, stack) and follow repo and demo links.

## Product Purpose

The personal portfolio of Aldreine Vanda Kauntu, a Computer Science (Database) student at Bina Nusantara University who is looking for Data Analyst and BI internships and junior roles. It has two jobs: help a recruiter decide to reach out, and give a hiring manager enough evidence of technical depth to want an interview. Success means a contact via the email copy or mailto button, LinkedIn, or GitHub.

## Positioning

Technical depth combined with leadership. On the technical side, Aldreine works end to end: ETL pipelines, star-schema modelling and data validation, through to Power BI and Tableau dashboards. On the leadership side, they currently lead the HIMTI Education Commission (152 members across 7 regional campuses) and have run events for HIMTI. The portfolio should present both together; a pure dashboard portfolio or a pure organisation CV cannot make this claim.

## Operating Context

- Visitors mostly arrive from a CV, LinkedIn, or a job application link, on desktop or mobile.
- Single-page site: Hero, About (education and skills), Projects (case studies in a dialog), Experience, Contact.
- Deployed on Vercel at `aldreinevanda.vercel.app`. Vercel Web Analytics is on, and a `contact_click` event is tracked.

## Capabilities and Constraints

- **Bilingual EN/ID (required).** Every UI string and every piece of content has an English version (required) and an Indonesian one (optional, falls back to EN). The language toggle is persistent. Future design work must handle both languages and their different text lengths.
- **Content lives in Sanity** (Studio at `/studio`). Profile, projects, experience, skills, and contact links are editable there, so the design has to cope with varying content length and count. When Sanity is not configured, the site falls back to `lib/seed-data.json` (taken from the CV).
- A project only appears when its required fields are filled in. Its KPI is shown only when both the value and the label exist. Projects and Experience hide themselves when they have no entries.
- Stack: Next.js 15 (App Router), React 19, plain CSS with tokens in `app/globals.css`, three.js for the hero scene.

## Brand Commitments

- Name: Aldreine Vanda Kauntu. Title: "Data Analyst · CS Student (Database)".
- Voice: concise, concrete, and evidence-led. Claims are backed by numbers from real work, for example "55,500 healthcare records modeled".

## Evidence on Hand

- Three case studies in `lib/seed-data.json`: Automated Healthcare Analytics Pipeline (55,500 records, 21% invalid data filtered, refresh in about 6 minutes), Retail Sales Intelligence Dashboard ($323K in sales analyzed), and Chillo: Smart Fridge & Food Waste Tracker.
- Experience at HIMTI BINUS: General Manager of Education, Secretary of HIMTI Company Visit 2025 (host: CIMB Niaga), Chairman of HIMTI Workshop 2025 with NVIDIA.
- Education: Bachelor of Computer Science (Database), BINUS, from August 2024.
- Not on hand, so never fabricate: testimonials, employer logos, screenshots or images of the projects, a portrait photo, or metrics outside the CV and seed data.

## Product Principles

1. **Evidence before adjectives.** Every claim points to a project, a number, or a role that actually exists.
2. **Fast for recruiters, deep for engineers.** The first screen answers who, what role, and how to make contact. The detail lives in case studies that open on demand.
3. **Technical and leadership, side by side.** Never let one hide the other.
4. **Two equal languages.** No layout should depend on an English text length or break in Indonesian.
5. **The content owner can edit it.** The design has to work with whatever comes out of Sanity, not just the current seed data.
