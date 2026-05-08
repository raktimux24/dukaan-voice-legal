export const defaultLocale = 'en';

export const locales = [
  { code: 'en', label: 'English', nativeLabel: 'English', hreflang: 'en-IN', ogLocale: 'en_IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', hreflang: 'hi-IN', ogLocale: 'hi_IN' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', hreflang: 'bn-IN', ogLocale: 'bn_IN' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', hreflang: 'ta-IN', ogLocale: 'ta_IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', hreflang: 'te-IN', ogLocale: 'te_IN' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', hreflang: 'mr-IN', ogLocale: 'mr_IN' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', hreflang: 'kn-IN', ogLocale: 'kn_IN' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', hreflang: 'gu-IN', ogLocale: 'gu_IN' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', hreflang: 'ml-IN', ogLocale: 'ml_IN' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', hreflang: 'pa-IN', ogLocale: 'pa_IN' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', hreflang: 'or-IN', ogLocale: 'or_IN' },
] as const;

export type Locale = (typeof locales)[number]['code'];
export type PageKind = 'home' | 'privacy' | 'terms';

export const translatedLocales = locales.filter((locale) => locale.code !== defaultLocale);

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale.code === value);
}

export function getLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function getLocaleMeta(locale: Locale) {
  return locales.find((item) => item.code === locale) ?? locales[0];
}

export function localizedPath(locale: Locale, page: PageKind) {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;

  if (page === 'privacy') return `${prefix}/privacy-policy` || '/privacy-policy';
  if (page === 'terms') return `${prefix}/terms-of-service` || '/terms-of-service';

  return prefix || '/';
}

export function localizedLanguageAlternates(page: PageKind, absolute = false, absoluteUrl?: (path: string) => string) {
  return locales.reduce<Record<string, string>>(
    (acc, locale) => {
      const path = localizedPath(locale.code, page);
      acc[locale.hreflang] = absolute && absoluteUrl ? absoluteUrl(path) : path;
      return acc;
    },
    {
      'x-default': absolute && absoluteUrl ? absoluteUrl(localizedPath(defaultLocale, page)) : localizedPath(defaultLocale, page),
    },
  );
}
