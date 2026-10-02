import { defineField, defineType } from 'sanity';

export const contactLink = defineType({
  name: 'contactLink',
  title: 'Contact link',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      type: 'string',
      options: { list: ['email', 'linkedin', 'github', 'other'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'value',
      type: 'string',
      description: 'Alamat email (untuk type email) atau URL lengkap',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', type: 'number', validation: (r) => r.required() }),
  ],
});
