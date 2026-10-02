import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId: projectId || 'not-configured',
  dataset,
  apiVersion,
  // Tanpa CDN supaya konten yang baru di-publish langsung terbaca saat revalidate.
  useCdn: false,
  // Tanpa token: draft tidak pernah terbaca (FR-07.3).
  perspective: 'published',
});
