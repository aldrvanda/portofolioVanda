import { defineField, defineType } from 'sanity';

/** Teks pendek dua bahasa: en wajib, id opsional (fallback ke en). */
export const localeString = defineType({
  name: 'localeString',
  title: 'Text (EN / ID)',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'id', title: 'Bahasa Indonesia', type: 'string' }),
  ],
});

/** Paragraf dua bahasa. */
export const localeText = defineType({
  name: 'localeText',
  title: 'Paragraph (EN / ID)',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({ name: 'id', title: 'Bahasa Indonesia', type: 'text', rows: 4 }),
  ],
});
