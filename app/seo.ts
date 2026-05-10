import type { Metadata } from 'next';
import { defaultLocale, getLocaleMeta, localizedLanguageAlternates, type Locale, type PageKind } from './i18n';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://samaanbol.space';

export const appStoreUrl = 'https://apps.apple.com/in/app/samaan-bol/id6759739444';

export const seoKeywords = [
  'voice inventory app',
  'voice command inventory',
  'voice based inventory app',
  'hands-free inventory app',
  'inventory app in Hindi',
  'Hindi inventory app',
  'stock management app Hindi',
  'inventory app for kirana store',
  'kirana store inventory app',
  'kirana shop stock app',
  'multilingual inventory app',
  'Indian language inventory app',
  'AI inventory app India',
  'AI stock management app',
  'predictive stock app',
  'festival stock prediction',
  'dukaan ka hisaab app',
  'samaan ka hisaab app',
  'shop register app',
  'shop notebook app',
];

export const defaultDescription =
  'Samaan-Bol is a voice-first AI inventory app for Indian kirana and retail shops. Manage stock by speaking in Hindi, English, and regional Indian languages.';

export const defaultOpenGraphImage = '/opengraph-image';

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString();
}

export function pageMetadata({
  title,
  description = defaultDescription,
  path = '/',
  page = 'home',
  locale = defaultLocale,
  keywords = seoKeywords,
  noIndex = false,
  languageAlternates = true,
}: {
  title: string;
  description?: string;
  path?: string;
  page?: PageKind;
  locale?: Locale;
  keywords?: string[];
  noIndex?: boolean;
  languageAlternates?: boolean;
}): Metadata {
  const localeMeta = getLocaleMeta(locale);

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: path,
      ...(languageAlternates ? { languages: localizedLanguageAlternates(page) } : {}),
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: 'Samaan-Bol',
      locale: localeMeta.ogLocale,
      type: 'website',
      images: [
        {
          url: defaultOpenGraphImage,
          width: 1200,
          height: 630,
          alt: 'Samaan-Bol voice-first AI inventory app for Indian retail',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultOpenGraphImage],
    },
    appleWebApp: {
      title: 'Samaan-Bol',
      capable: true,
      statusBarStyle: 'black-translucent',
    },
  };
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Samaan-Bol',
  url: siteUrl,
  logo: absoluteUrl('/opengraph-image'),
  sameAs: [appStoreUrl],
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': ['SoftwareApplication', 'MobileApplication'],
  name: 'Samaan-Bol',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS',
  url: siteUrl,
  downloadUrl: appStoreUrl,
  installUrl: appStoreUrl,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  description: defaultDescription,
  featureList: [
    'Voice-first inventory management',
    'Hindi and regional Indian language support',
    'Predictive stock alerts',
    'Expiry alerts',
    'Smart buy lists',
    'Team collaboration',
    'Inventory audit trails',
  ],
  audience: {
    '@type': 'Audience',
    audienceType: 'Indian kirana store owners, grocery shops, general stores, and small retailers',
  },
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
  inLanguage: ['en-IN', 'hi-IN', 'bn-IN', 'ta-IN', 'te-IN', 'mr-IN', 'kn-IN', 'gu-IN', 'ml-IN', 'pa-IN', 'or-IN'],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Samaan-Bol',
  url: siteUrl,
  inLanguage: 'en-IN',
  description: defaultDescription,
};
