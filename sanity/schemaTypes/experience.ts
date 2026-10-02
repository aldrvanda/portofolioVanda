import { defineField, defineType } from 'sanity';

export const experience = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({ name: 'role', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'organization', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'type',
      type: 'string',
      initialValue: 'organization',
      options: { list: ['work', 'internship', 'organization', 'other'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'startDate', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'endDate', type: 'date', description: 'Kosongkan = "Present"' }),
    defineField({
      name: 'highlights',
      type: 'array',
      of: [{ type: 'localeString' }],
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: 'photo',
      title: 'Foto',
      type: 'image',
      description: 'Foto kegiatan, rasio 16:9 paling pas. Tanpa foto, kartu menampilkan bingkai tahun.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Deskripsi foto (EN / ID)',
          type: 'localeString',
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: 'photoBack',
      title: 'Foto belakang (opsional)',
      type: 'image',
      description: 'Jika diisi, foto di atas jadi kartu yang bisa dibalik (hover atau ketuk) untuk menampilkan foto ini.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Deskripsi foto (EN / ID)',
          type: 'localeString',
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: 'status',
      type: 'string',
      initialValue: 'draft',
      options: { list: ['draft', 'published'], layout: 'radio' },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'role.en', subtitle: 'organization' } },
});
