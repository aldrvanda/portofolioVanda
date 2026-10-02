export type Locale = 'en' | 'id';

/** Teks dua bahasa. `en` wajib, `id` opsional (fallback ke en). */
export type L = { en: string; id?: string };

export type SkillCategory =
  | 'programming_language'
  | 'data_engineering'
  | 'data_visualization'
  | 'web_development'
  | 'design';

/** Foto dari Sanity (URL CDN) atau dari folder public/. */
export type Photo = { url: string; alt?: L; caption?: L; /** CSS object-position, mis. "30% 50%" untuk menggeser crop. */ position?: string };

export type Profile = {
  fullName: string;
  roleTitle: L;
  tagline: L;
  about: L;
  education: {
    institution: string;
    degree: L;
    major: L;
    startDate: string;
    endDate?: string;
  };
  seoDescription: L;
  /** 5 foto recap untuk galeri hero. */
  gallery?: Photo[];
};

export type Skill = { name: string; category: SkillCategory; order?: number };

export type Project = {
  slug: string;
  title: L;
  year?: number;
  keyMetricValue?: string;
  keyMetricLabel?: L;
  summary: L;
  problem: L;
  solution: L;
  myRole: L;
  impact?: L;
  stack: string[];
  repoUrl?: string;
  demoUrl?: string;
  featured?: boolean;
  order: number;
  /** Foto yang berkaitan dengan proyek (dashboard, diagram, kegiatan). */
  images?: Photo[];
};

export type ExperienceType = 'work' | 'internship' | 'organization' | 'other';

export type Experience = {
  id: string;
  role: L;
  organization: string;
  type: ExperienceType;
  startDate: string;
  endDate?: string;
  highlights: L[];
  /** Foto kegiatan dari Sanity (URL CDN) + deskripsi untuk pembaca layar. */
  photo?: Photo | null;
  /** Foto sisi belakang; jika diisi, foto jadi kartu yang bisa dibalik. */
  photoBack?: Photo | null;
};

export type ContactLink = {
  type: 'email' | 'linkedin' | 'github' | 'other';
  label: string;
  value: string;
  order: number;
};

export type Content = {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  contactLinks: ContactLink[];
};
