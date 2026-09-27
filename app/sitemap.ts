import type { MetadataRoute } from 'next';
import { absoluteUrl } from './seo';
import { laptopLanguageAlternates, localizedLanguageAlternates, localizedPath, locales, type Locale, type PageKind } from './i18n';

const pages: Array<{ page: PageKind; changeFrequency: 'weekly' | 'monthly'; priority: number }> = [
  { page: 'home', changeFrequency: 'weekly', priority: 1 },
  { page: 'pricing', changeFrequency: 'weekly', priority: 0.8 },
  { page: 'contact', changeFrequency: 'monthly', priority: 0.4 },
  { page: 'privacy', changeFrequency: 'monthly', priority: 0.3 },
  { page: 'terms', changeFrequency: 'monthly', priority: 0.3 },
];

const laptopLocales: Locale[] = ['en', 'hi'];

const englishPages: Array<{ path: string; changeFrequency: 'weekly' | 'monthly'; priority: number }> = [
  { path: '/refund-policy', changeFrequency: 'monthly', priority: 0.4 },
];

const lastModified = new Date('2026-09-15T18:30:00.000Z');

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
    ...laptopLocales.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, 'laptop')),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: laptopLanguageAlternates(true, absoluteUrl),
      },
    })),
    ...englishPages.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency,
      priority,
    })),
  ];
}
