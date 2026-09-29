import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AmbientBackground } from '../../components/AmbientBackground';
import { HomeEffects } from '../../components/HomeEffects';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { SubscriptionFooter, SubscriptionNav } from '../../components/SubscriptionChrome';
import { UdhaarArticle } from '../../components/UdhaarArticle';
import { getUdhaarCopy } from '../../content/udhaarPage';
import { bilingualLanguageAlternates } from '../../i18n';
import { pageMetadata } from '../../seo';

export function generateStaticParams() {
  return [{ locale: 'hi' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'hi') notFound();

  const copy = getUdhaarCopy('hi');
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: '/hi/udhaar',
    page: 'udhaar',
    locale: 'hi',
    keywords: ['बिल पर उधार', 'udhaar on the bill', 'udhaar app for kirana'],
    languages: bilingualLanguageAlternates('udhaar'),
  });
}

export default async function HindiUdhaarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'hi') notFound();

  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale="hi" page="udhaar" />
      <UdhaarArticle locale="hi" />
      <SubscriptionFooter locale="hi" page="udhaar" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
