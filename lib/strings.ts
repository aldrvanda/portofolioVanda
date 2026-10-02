import type { L, SkillCategory, ExperienceType } from './types';

/** Teks UI statis (FR-17.7). */
export const S = {
  skip: { en: 'Skip to content', id: 'Lewati ke konten' },
  nav: {
    label: { en: 'Primary', id: 'Utama' },
    home: { en: 'Home', id: 'Beranda' },
    about: { en: 'About', id: 'Tentang' },
    projects: { en: 'Projects', id: 'Proyek' },
    experience: { en: 'Experience', id: 'Pengalaman' },
    contact: { en: 'Contact', id: 'Kontak' },
    openMenu: { en: 'Open menu', id: 'Buka menu' },
    closeMenu: { en: 'Close menu', id: 'Tutup menu' },
    top: { en: 'Back to top', id: 'Kembali ke atas' },
    language: { en: 'Language', id: 'Bahasa' },
  },
  hero: {
    viewProjects: { en: 'View projects', id: 'Lihat proyek' },
    downloadCv: { en: 'Download CV', id: 'Unduh CV' },
    scroll: { en: 'Scroll', id: 'Gulir' },
    gallery: { en: 'Photo recap', id: 'Rekap foto' },
  },
  about: {
    heading: { en: 'About Me', id: 'Tentang Saya' },
    education: { en: 'Education', id: 'Pendidikan' },
    now: { en: 'Now', id: 'Saat ini' },
    since: { en: 'Since {date}', id: 'Sejak {date}' },
    /** Frasa yang diberi sorotan di paragraf About (dipisah "|"). */
    highlights: {
      en: 'star schemas|ETL pipelines|Power BI|Tableau|152-member',
      id: 'star schema|pipeline ETL|Power BI|Tableau|152 orang',
    },
    toolkit: { en: 'Toolkit', id: 'Perangkat' },
  },
  projects: {
    heading: { en: 'Projects', id: 'Proyek' },
    title: { en: 'Selected work', id: 'Karya pilihan' },
    readCase: { en: 'Read case', id: 'Baca studi kasus' },
    problem: { en: 'Problem', id: 'Masalah' },
    solution: { en: 'Solution', id: 'Solusi' },
    myRole: { en: 'My role', id: 'Peran saya' },
    impact: { en: 'Impact', id: 'Dampak' },
    stack: { en: 'Stack', id: 'Teknologi' },
    repo: { en: 'View repository', id: 'Lihat repository' },
    demo: { en: 'Live demo', id: 'Demo langsung' },
    close: { en: 'Close', id: 'Tutup' },
    caseStudy: { en: 'Case study', id: 'Studi kasus' },
    photos: { en: 'Project photos', id: 'Foto proyek' },
    noRepo: {
      en: "The code for this project isn't public. I'm happy to walk you through it.",
      id: 'Kode proyek ini tidak publik. Saya bisa menjelaskannya langsung.',
    },
    github: { en: 'GitHub profile', id: 'Profil GitHub' },
    askMe: { en: 'Ask about this project', id: 'Tanya soal proyek ini' },
  },
  experience: {
    heading: { en: 'Experience', id: 'Pengalaman' },
    title: { en: 'Leadership and organization', id: 'Kepemimpinan dan organisasi' },
    present: { en: 'Present', id: 'Sekarang' },
    prev: { en: 'Previous experience', id: 'Pengalaman sebelumnya' },
    next: { en: 'Next experience', id: 'Pengalaman berikutnya' },
    slide: { en: '{n} of {total}', id: '{n} dari {total}' },
    flip: { en: 'Flip photo', id: 'Balik foto' },
  },
  contact: {
    heading: { en: 'Contact', id: 'Kontak' },
    copy: { en: 'Copy email', id: 'Salin email' },
    copied: { en: 'Copied', id: 'Tersalin' },
    copiedToast: { en: 'Email copied', id: 'Email tersalin' },
    copyFailed: {
      en: "Couldn't copy. Select the email above instead.",
      id: 'Gagal menyalin. Silakan seleksi email di atas.',
    },
    emailMe: { en: 'Email me', id: 'Kirim email' },
  },
  footer: {
    label: { en: 'Footer links', id: 'Tautan footer' },
  },
  newTab: { en: '(opens in new tab)', id: '(buka di tab baru)' },
} satisfies Record<string, unknown>;

export const CATEGORY_LABEL: Record<SkillCategory, L> = {
  programming_language: { en: 'Programming languages', id: 'Bahasa pemrograman' },
  data_engineering: { en: 'Data engineering', id: 'Data engineering' },
  data_visualization: { en: 'Data visualization', id: 'Visualisasi data' },
  web_development: { en: 'Web development', id: 'Pengembangan web' },
  design: { en: 'Design', id: 'Desain' },
};

export const CATEGORY_ORDER: SkillCategory[] = [
  'data_engineering',
  'data_visualization',
  'programming_language',
  'web_development',
  'design',
];

export const EXPERIENCE_TYPE_LABEL: Record<ExperienceType, L> = {
  work: { en: 'Work', id: 'Kerja' },
  internship: { en: 'Internship', id: 'Magang' },
  organization: { en: 'Organization', id: 'Organisasi' },
  other: { en: 'Other', id: 'Lainnya' },
};

const MONTHS: Record<'en' | 'id', string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
};

/** "2026-02-01" → "Feb 2026" */
export function formatMonth(iso: string, locale: 'en' | 'id'): string {
  const [y, m] = iso.split('-');
  return `${MONTHS[locale][Number(m) - 1] ?? ''} ${y}`;
}
