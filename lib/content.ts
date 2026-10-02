import seed from './seed-data.json';
import type { Content, Experience, L, Project } from './types';
import { isSanityConfigured } from '@/sanity/env';
import { client } from '@/sanity/lib/client';
import { CONTENT_QUERY } from '@/sanity/lib/queries';

const hasEn = (l?: L | null) => !!l && typeof l.en === 'string' && l.en.trim().length > 0;

/** Entri dengan field wajib kosong tidak dirender, dengan warning saat build. */
function validProject(p: Project): boolean {
  const ok =
    !!p.slug && hasEn(p.title) && hasEn(p.summary) && hasEn(p.problem) && hasEn(p.solution) && hasEn(p.myRole);
  if (!ok) console.warn(`[content] project "${p.slug ?? '(no slug)'}" skipped: required field empty`);
  return ok;
}

function validExperience(e: Experience): boolean {
  if (!hasEn(e.role) || !e.organization || !e.startDate) {
    console.warn(`[content] experience "${e.id}" skipped: required field empty`);
    return false;
  }
  if (e.endDate && e.endDate < e.startDate) {
    console.warn(`[content] experience "${e.id}" skipped: endDate is before startDate`);
    return false;
  }
  return true;
}

function clean(raw: Content): Content {
  const projects = (raw.projects ?? [])
    .map((p) => ({
      ...p,
      stack: p.stack ?? [],
      // Label KPI wajib jika value diisi; jika tidak, KPI disembunyikan.
      keyMetricValue: p.keyMetricValue && hasEn(p.keyMetricLabel) ? p.keyMetricValue : undefined,
    }))
    .filter(validProject)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || a.order - b.order);

  const experiences = (raw.experiences ?? [])
    .map((e) => ({ ...e, highlights: (e.highlights ?? []).filter(hasEn).slice(0, 5) }))
    .filter(validExperience)
    .sort(
      (a, b) =>
        b.startDate.localeCompare(a.startDate) ||
        // Mulai di bulan yang sama: yang masih berjalan dulu, lalu yang berakhir paling akhir.
        (b.endDate ?? '9999').localeCompare(a.endDate ?? '9999'),
    );

  if (projects.length === 0) console.warn('[content] 0 published projects: Projects section hidden');
  if (experiences.length === 0) console.warn('[content] 0 published experiences: Experience section hidden');

  return {
    profile: raw.profile,
    skills: raw.skills ?? [],
    projects,
    experiences,
    contactLinks: (raw.contactLinks ?? []).filter((c) => c.value).sort((a, b) => a.order - b.order),
  };
}

export async function getContent(): Promise<Content> {
  if (!isSanityConfigured) {
    // Sanity belum disetel: pakai konten dari CV supaya website tetap bisa launch.
    return clean(seed as unknown as Content);
  }
  // Jika fetch gagal, error dilempar → build gagal dan deploy lama tetap live.
  const data = await client.fetch<Content>(CONTENT_QUERY, {}, { next: { tags: ['content'] } });
  if (!data.profile || !data.profile.fullName) {
    throw new Error('[content] Profile document is missing in Sanity. Create and publish it in /studio.');
  }
  return clean(data);
}
