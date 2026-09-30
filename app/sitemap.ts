import type { MetadataRoute } from 'next';
import { absoluteUrl } from './seo';
import { localizedLanguageAlternates, localizedPath, locales, type PageKind } from './i18n';

const pages: Array<{ page: PageKind; changeFrequency: 'weekly' | 'monthly'; priority: number }> = [
  { page: 'home', changeFrequency: 'weekly', priority: 1 },
  { page: 'pricing', changeFrequency: 'weekly', priority: 0.8 },
  { page: 'laptop', changeFrequency: 'weekly', priority: 0.8 },
  { page: 'udhaar', changeFrequency: 'weekly', priority: 0.8 },
  { page: 'contact', changeFrequency: 'monthly', priority: 0.4 },
  { page: 'privacy', changeFrequency: 'monthly', priority: 0.3 },
  { page: 'terms', changeFrequency: 'monthly', priority: 0.3 },
];

const englishPages: Array<{ path: string; changeFrequency: 'weekly' | 'monthly'; priority: number }> = [
  { path: '/refund-policy', changeFrequency: 'monthly', priority: 0.4 },
];

// Only dates of substantive, verified content changes; omit unknown dates.
const updatedPages = new Set<PageKind>(['home', 'laptop', 'udhaar']);
const contentUpdated = new Date('2026-10-01T00:00:00+05:30');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/guides/voice-billing-for-kirana'), lastModified: contentUpdated, changeFrequency: 'monthly', priority: 0.7 },
    ...pages.flatMap(({ page, changeFrequency, priority }) =>
      locales.map((locale) => ({
        url: absoluteUrl(localizedPath(locale.code, page)),
        ...(updatedPages.has(page) ? { lastModified: contentUpdated } : {}),
        changeFrequency,
        priority,
        alternates: {
          languages: localizedLanguageAlternates(page, true, absoluteUrl),
        },
      })),
    ),
    ...englishPages.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      changeFrequency,
      priority,
    })),
  ];
}
