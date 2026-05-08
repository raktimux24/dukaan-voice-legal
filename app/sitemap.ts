import type { MetadataRoute } from 'next';
import { absoluteUrl } from './seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'en-IN': absoluteUrl('/'),
          'x-default': absoluteUrl('/'),
        },
      },
    },
    {
      url: absoluteUrl('/privacy-policy'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
      alternates: {
        languages: {
          'en-IN': absoluteUrl('/privacy-policy'),
          'x-default': absoluteUrl('/privacy-policy'),
        },
      },
    },
    {
      url: absoluteUrl('/terms-of-service'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
      alternates: {
        languages: {
          'en-IN': absoluteUrl('/terms-of-service'),
          'x-default': absoluteUrl('/terms-of-service'),
        },
      },
    },
  ];
}
