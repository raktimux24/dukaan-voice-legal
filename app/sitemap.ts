import type { MetadataRoute } from 'next';
import { absoluteUrl } from './seo';
import { localizedLanguageAlternates, localizedPath, locales, type PageKind } from './i18n';

const pages: Array<{ page: PageKind; changeFrequency: 'weekly' | 'monthly'; priority: number }> = [
  { page: 'home', changeFrequency: 'weekly', priority: 1 },
  { page: 'pricing', changeFrequency: 'weekly', priority: 0.8 },
  { page: 'contact', changeFrequency: 'monthly', priority: 0.4 },
  { page: 'privacy', changeFrequency: 'monthly', priority: 0.3 },
  { page: 'terms', changeFrequency: 'monthly', priority: 0.3 },
];

const englishPages: Array<{ path: string; changeFrequency: 'weekly' | 'monthly'; priority: number }> = [
  { path: '/refund-policy', changeFrequency: 'monthly', priority: 0.4 },
];

const lastModified = new Date('2026-09-15T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.flatMap(({ page, changeFrequency, priority }) =>
      locales.map((locale) => ({
        url: absoluteUrl(localizedPath(locale.code, page)),
        lastModified,
        changeFrequency,
        priority,
        alternates: {
          languages: localizedLanguageAlternates(page, true, absoluteUrl),
        },
      })),
    ),
    ...englishPages.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency,
      priority,
    })),
  ];
}
