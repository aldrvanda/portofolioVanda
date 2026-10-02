# Aldreine Vanda Kauntu — Portfolio

Personal portfolio of a Data Analyst and Computer Science (Database) student at BINUS University.
Bilingual (English / Bahasa Indonesia), with content managed through Sanity.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Sanity](https://www.sanity.io/) as headless CMS (Studio at `/studio`)
- Plain CSS with design tokens (`app/globals.css`)
- Deployed on Vercel, with Vercel Web Analytics

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without Sanity configured, the site uses the local content in `lib/seed-data.json`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID. Leave empty to use local content. |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset, default `production`. |
| `SANITY_REVALIDATE_SECRET` | Secret for the `/api/revalidate` webhook. |

To import the local content into Sanity:

```bash
npm run seed:ndjson
npx sanity dataset import scripts/seed.ndjson production --replace
```

## Project structure

```
app/          Pages, Sanity Studio route, revalidate API, OG image, sitemap
components/   UI sections (Hero, About, Projects, Experience, Contact)
lib/          Types, content loader, local content, UI strings (EN/ID)
sanity/       Schemas, client, GROQ queries
public/       Images, CV, favicon
scripts/      Seed generator for Sanity
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run typecheck` | Type-check with TypeScript |
| `npm run seed:ndjson` | Generate `scripts/seed.ndjson` from local content |
