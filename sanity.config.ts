'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { dataset, projectId } from './sanity/env';
import { schemaTypes } from './sanity/schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'Aldreine — Portfolio',
  basePath: '/studio',
  projectId: projectId || 'not-configured',
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
