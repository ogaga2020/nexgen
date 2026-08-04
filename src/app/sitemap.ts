import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: .7 },
    { url: `${base}/training`, lastModified: now, changeFrequency: 'monthly', priority: .8 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: 'weekly', priority: .7 },
    { url: `${base}/register`, lastModified: now, changeFrequency: 'monthly', priority: .6 },
  ];
}
