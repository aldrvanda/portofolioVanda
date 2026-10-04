import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://aldreinevanda.vercel.app', changeFrequency: 'monthly', priority: 1 },
    { url: 'https://aldreinevanda.vercel.app/amazon-sales', changeFrequency: 'yearly', priority: 0.7 },
  ];
}
