import { defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title.en' }, validation: (r) => r.required() }),
    defineField({ name: 'year', type: 'number' }),
    defineField({
      name: 'keyMetricValue',
      title: 'Key metric — value',
      type: 'string',
      description: 'Angka besar di kartu, mis. "55,500". Maks. 10 karakter. Kosongkan jika tidak ada.',
      validation: (r) => r.max(10),
    }),
    defineField({
      name: 'keyMetricLabel',
      title: 'Key metric — label',
      type: 'localeString',
      description: 'Wajib jika value diisi, mis. "healthcare records modeled"',
    }),
    defineField({
      name: 'summary',
      type: 'localeString',
      description: 'Satu kalimat, maks. 140 karakter',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'problem', type: 'localeText', validation: (r) => r.required() }),
    defineField({ name: 'solution', type: 'localeText', validation: (r) => r.required() }),
    defineField({ name: 'myRole', title: 'My role', type: 'localeText', validation: (r) => r.required() }),
    defineField({ name: 'impact', type: 'localeText' }),
    defineField({
      name: 'images',
      title: 'Foto proyek',
      type: 'array',
      description: 'Screenshot dashboard, diagram, atau foto kegiatan. Tampil di bagian atas studi kasus.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Deskripsi foto', type: 'localeString', validation: (r) => r.required() }),
          ],
        },
      ],
    }),
    defineField({
      name: 'stack',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      validation: (r) => r.min(1),
    }),
    defineField({ name: 'repoUrl', title: 'Repository URL', type: 'url' }),
    defineField({ name: 'demoUrl', title: 'Demo URL', type: 'url' }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', type: 'number', validation: (r) => r.required() }),
    defineField({
      name: 'status',
      type: 'string',
      initialValue: 'draft',
      options: { list: ['draft', 'published'], layout: 'radio' },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'title.en', subtitle: 'status' } },
});
