import type { Metadata } from 'next';
import { defaultLocale, getLocaleMeta, localizedLanguageAlternates, type Locale, type PageKind } from './i18n';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://samaanbol.space';

export const appStoreUrl = 'https://apps.apple.com/in/app/samaan-bol/id6759739444';
export const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.samaan.bol';

export const seoKeywords = [
  'kirana bill',
  'udhaar',
  'UPI QR',
  'evening hisaab',
  'Hindi Hinglish billing',
  'speak the sale',
  'bill share WhatsApp',
  'shop counter billing',
  'kirana billing app',
];

export const defaultDescription =
  'While the customer is still there, you say what they took. The app puts it on a bill. Cash, UPI QR, or udhaar. Stock is not a second notebook. Free on the App Store and Google Play. New shops get 7 days of voice in the app, no card.';

export const defaultTitle = 'Samaan Bol — Voice billing for kirana | Cash, UPI, Udhaar';

export const defaultOpenGraphImage = '/opengraph-image';

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString();
}

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingSiteVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

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

  const verification: Metadata['verification'] = {};
  if (googleSiteVerification) verification.google = googleSiteVerification;
  if (bingSiteVerification) verification.other = { 'msvalidate.01': bingSiteVerification };
  const hasVerification = Object.keys(verification).length > 0;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: path,
      ...(languageAlternates ? { languages: localizedLanguageAlternates(page) } : {}),
    },
    ...(hasVerification ? { verification } : {}),
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
      siteName: 'Samaan Bol',
      locale: localeMeta.ogLocale,
      type: 'website',
      images: [
        {
          url: defaultOpenGraphImage,
          width: 1200,
          height: 630,
          alt: 'kirana counter billing — cash, UPI, udhaar',
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
      title: 'Samaan Bol',
      capable: true,
      statusBarStyle: 'black-translucent',
    },
  };
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Samaan Bol',
  url: siteUrl,
  logo: absoluteUrl('/opengraph-image'),
  sameAs: [appStoreUrl, playStoreUrl],
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': ['SoftwareApplication', 'MobileApplication'],
  name: 'Samaan Bol',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS, Android',
  url: siteUrl,
  downloadUrl: appStoreUrl,
  installUrl: appStoreUrl,
  offers: {
    '@type': 'Offer',
    name: 'Samaan Bol on the App Store',
    price: '0',
    priceCurrency: 'INR',
    url: appStoreUrl,
    availability: 'https://schema.org/InStock',
  },
  description: defaultDescription,
  featureList: [
    'Say what they took',
    'Cash / UPI QR / udhaar',
    'WhatsApp bill',
    "Today's cash and UPI totals",
    'Stock updates with the bill',
    '7-day voice in the app for new shops (no card)',
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
  name: 'Samaan Bol',
  url: siteUrl,
  inLanguage: 'en-IN',
  description: defaultDescription,
};

export const pricingOfferSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Samaan Bol Premium',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS, Android',
  url: absoluteUrl('/pricing'),
  downloadUrl: appStoreUrl,
  offers: [
    {
      '@type': 'Offer',
      name: 'Premium — Monthly',
      price: '499',
      priceCurrency: 'INR',
      url: absoluteUrl('/pricing'),
    },
    {
      '@type': 'Offer',
      name: 'Premium — Annual',
      price: '3999',
      priceCurrency: 'INR',
      url: absoluteUrl('/pricing'),
    },
  ],
};

export function faqPageSchema(faq: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };
}
