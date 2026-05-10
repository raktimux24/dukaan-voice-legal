export const defaultLocale = 'en';

export const locales = [
  { code: 'en', label: 'English', nativeLabel: 'English', icon: 'EN', hreflang: 'en-IN', ogLocale: 'en_IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', icon: 'हि', hreflang: 'hi-IN', ogLocale: 'hi_IN' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', icon: 'বা', hreflang: 'bn-IN', ogLocale: 'bn_IN' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', icon: 'த', hreflang: 'ta-IN', ogLocale: 'ta_IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', icon: 'తె', hreflang: 'te-IN', ogLocale: 'te_IN' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', icon: 'म', hreflang: 'mr-IN', ogLocale: 'mr_IN' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', icon: 'ಕ', hreflang: 'kn-IN', ogLocale: 'kn_IN' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', icon: 'ગુ', hreflang: 'gu-IN', ogLocale: 'gu_IN' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', icon: 'മ', hreflang: 'ml-IN', ogLocale: 'ml_IN' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', icon: 'ਪੰ', hreflang: 'pa-IN', ogLocale: 'pa_IN' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', icon: 'ଓ', hreflang: 'or-IN', ogLocale: 'or_IN' },
] as const;

export type Locale = (typeof locales)[number]['code'];
export type PageKind = 'home' | 'privacy' | 'terms' | 'pricing' | 'refund' | 'contact' | 'account' | 'subscriptionReturn';

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
  if (page === 'pricing') return `${prefix}/pricing` || '/pricing';
  if (page === 'refund') return `${prefix}/refund-policy` || '/refund-policy';
  if (page === 'contact') return `${prefix}/contact` || '/contact';
  if (page === 'account') return `${prefix}/account` || '/account';
  if (page === 'subscriptionReturn') return '/subscription/return';

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
