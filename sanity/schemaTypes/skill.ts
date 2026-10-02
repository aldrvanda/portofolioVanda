import { defineField, defineType } from 'sanity';

export const skill = defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      type: 'string',
      validation: (r) => r.required(),
      options: {
        list: [
          { title: 'Programming languages', value: 'programming_language' },
          { title: 'Data engineering', value: 'data_engineering' },
          { title: 'Data visualization', value: 'data_visualization' },
          { title: 'Web development', value: 'web_development' },
          { title: 'Design', value: 'design' },
        ],
      },
    }),
    defineField({ name: 'order', type: 'number' }),
  ],
  preview: { select: { title: 'name', subtitle: 'category' } },
});
