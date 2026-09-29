import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AmbientBackground } from '../../components/AmbientBackground';
import { HomeEffects } from '../../components/HomeEffects';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { SubscriptionFooter, SubscriptionNav } from '../../components/SubscriptionChrome';
import { UdhaarArticle } from '../../components/UdhaarArticle';
import { getUdhaarCopy } from '../../content/udhaarPage';
import { isLocale, localizedPath, translatedLocales } from '../../i18n';
import { pageMetadata } from '../../seo';

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  const copy = getUdhaarCopy(locale);
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: localizedPath(locale, 'udhaar'),
    page: 'udhaar',
    locale,
    keywords: [copy.h1, 'udhaar on the bill'],
  });
}

export default async function LocalizedUdhaarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale={locale} page="udhaar" />
      <UdhaarArticle locale={locale} />
      <SubscriptionFooter locale={locale} page="udhaar" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
