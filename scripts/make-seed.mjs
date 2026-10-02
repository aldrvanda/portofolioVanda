// Mengubah lib/seed-data.json menjadi scripts/seed.ndjson untuk diimpor ke Sanity:
//   npm run seed:ndjson
//   npx sanity dataset import scripts/seed.ndjson production --replace
import { readFileSync, writeFileSync } from 'node:fs';

const seed = JSON.parse(readFileSync(new URL('../lib/seed-data.json', import.meta.url), 'utf8'));
const docs = [];
const ls = (v) => (v ? { _type: 'localeString', ...v } : undefined);
const lt = (v) => (v ? { _type: 'localeText', ...v } : undefined);

const p = seed.profile;
docs.push({
  _id: 'profile',
  _type: 'profile',
  fullName: p.fullName,
  roleTitle: ls(p.roleTitle),
  tagline: ls(p.tagline),
  about: lt(p.about),
  education: { ...p.education, degree: ls(p.education.degree), major: ls(p.education.major) },
  seoDescription: ls(p.seoDescription),
});

seed.skills.forEach((s) =>
  docs.push({ _id: `skill-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, _type: 'skill', ...s }),
);

seed.projects.forEach((pr) =>
  docs.push({
    _id: `project-${pr.slug}`,
    _type: 'project',
    title: ls(pr.title),
    slug: { _type: 'slug', current: pr.slug },
    year: pr.year,
    keyMetricValue: pr.keyMetricValue,
    keyMetricLabel: ls(pr.keyMetricLabel),
    summary: ls(pr.summary),
    problem: lt(pr.problem),
    solution: lt(pr.solution),
    myRole: lt(pr.myRole),
    impact: lt(pr.impact),
    stack: pr.stack,
    repoUrl: pr.repoUrl,
    demoUrl: pr.demoUrl,
    featured: pr.featured,
    order: pr.order,
    status: 'published',
  }),
);

seed.experiences.forEach((e) =>
  docs.push({
    _id: `experience-${e.id}`,
    _type: 'experience',
    role: ls(e.role),
    organization: e.organization,
    type: e.type,
    startDate: e.startDate,
    endDate: e.endDate,
    highlights: e.highlights.map((h, i) => ({ _key: `h${i}`, ...ls(h) })),
    status: 'published',
  }),
);

seed.contactLinks.forEach((c) => docs.push({ _id: `contact-${c.type}`, _type: 'contactLink', ...c }));

const clean = (o) => JSON.parse(JSON.stringify(o)); // buang field undefined
writeFileSync(new URL('./seed.ndjson', import.meta.url), docs.map((d) => JSON.stringify(clean(d))).join('\n') + '\n');
console.log(`Wrote ${docs.length} documents to scripts/seed.ndjson`);
