import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AmbientBackground } from '../../components/AmbientBackground';
import { HomeEffects } from '../../components/HomeEffects';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { LaptopArticle } from '../../components/LaptopArticle';
import { SubscriptionFooter, SubscriptionNav } from '../../components/SubscriptionChrome';
import { getLaptopCopy } from '../../content/laptopPage';
import { isLocale, localizedPath, translatedLocales } from '../../i18n';
import { pageMetadata } from '../../seo';

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  const copy = getLaptopCopy(locale);
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: localizedPath(locale, 'laptop'),
    page: 'laptop',
    locale,
    keywords: [copy.h1, 'kirana billing on a laptop'],
  });
}

export default async function LocalizedLaptopBillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale={locale} page="laptop" />
      <LaptopArticle locale={locale} />
      <SubscriptionFooter locale={locale} page="laptop" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
