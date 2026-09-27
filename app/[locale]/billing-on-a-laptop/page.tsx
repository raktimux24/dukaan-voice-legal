import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AmbientBackground } from '../../components/AmbientBackground';
import { HomeEffects } from '../../components/HomeEffects';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { LaptopArticle } from '../../components/LaptopArticle';
import { SubscriptionFooter, SubscriptionNav } from '../../components/SubscriptionChrome';
import { getLaptopCopy } from '../../content/laptopPage';
import { laptopLanguageAlternates } from '../../i18n';
import { pageMetadata } from '../../seo';

export function generateStaticParams() {
  return [{ locale: 'hi' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'hi') notFound();

  const copy = getLaptopCopy('hi');
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: '/hi/billing-on-a-laptop',
    page: 'laptop',
    locale: 'hi',
    keywords: ['लैपटॉप पर किराना बिलिंग', 'kirana billing on a laptop', 'browser billing for a shop'],
    languages: laptopLanguageAlternates(),
  });
}

export default async function HindiLaptopBillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'hi') notFound();

  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale="hi" page="laptop" />
      <LaptopArticle locale="hi" />
      <SubscriptionFooter locale="hi" page="laptop" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
