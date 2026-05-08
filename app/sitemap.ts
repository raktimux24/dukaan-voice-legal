import type { MetadataRoute } from 'next';
import { absoluteUrl } from './seo';
import { localizedLanguageAlternates, localizedPath, locales, type PageKind } from './i18n';

const pages: Array<{ page: PageKind; changeFrequency: 'weekly' | 'monthly'; priority: number }> = [
  { page: 'home', changeFrequency: 'weekly', priority: 1 },
  { page: 'privacy', changeFrequency: 'monthly', priority: 0.3 },
  { page: 'terms', changeFrequency: 'monthly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return pages.flatMap(({ page, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: absoluteUrl(localizedPath(locale.code, page)),
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: localizedLanguageAlternates(page, true, absoluteUrl),
      },
    })),
  );
}
