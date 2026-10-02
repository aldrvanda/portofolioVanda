import { defineField, defineType } from 'sanity';

export const profile = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    defineField({ name: 'fullName', title: 'Full name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'roleTitle', title: 'Role title', type: 'localeString', validation: (r) => r.required() }),
    defineField({
      name: 'tagline',
      title: 'Tagline (hero)',
      type: 'localeString',
      description: 'Maks. 120 karakter',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'about',
      title: 'About',
      type: 'localeText',
      description: 'Maks. 100 kata',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'object',
      description: 'Ditampilkan di About. IPK sengaja tidak disimpan.',
      validation: (r) => r.required(),
      fields: [
        defineField({ name: 'institution', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'degree', type: 'localeString', validation: (r) => r.required() }),
        defineField({ name: 'major', type: 'localeString', validation: (r) => r.required() }),
        defineField({ name: 'startDate', type: 'date', validation: (r) => r.required() }),
        defineField({ name: 'endDate', type: 'date', description: 'Kosongkan jika masih berjalan' }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Galeri hero (4 foto recap)',
      type: 'array',
      description: 'Tampil di kanan hero; foto melebar saat disorot. Paling pas 4 foto potret.',
      validation: (r) => r.max(4),
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Deskripsi foto', type: 'localeString', validation: (r) => r.required() }),
            defineField({ name: 'caption', title: 'Keterangan singkat', type: 'localeString' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'localeString',
      description: 'Maks. 160 karakter',
      validation: (r) => r.required(),
    }),
  ],
});
