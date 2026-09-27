import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AmbientBackground } from '../../components/AmbientBackground';
import { HomeEffects } from '../../components/HomeEffects';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { SubscriptionFooter, SubscriptionNav } from '../../components/SubscriptionChrome';
import { PricingClient } from '../../pricing/PricingClient';
import { getLocale, isLocale, translatedLocales } from '../../i18n';
import { localizedPageCopy } from '../../content/pageCopy';
import { faqPageSchema, pageMetadata, pricingOfferSchema } from '../../seo';
import { JsonLd } from '../../components/JsonLd';
import { getSubscriptionStrings } from '../../content/subscriptionStrings';

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  const resolved = getLocale(locale);
  const copy = localizedPageCopy(resolved, 'pricing');

  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: `/${locale}/pricing`,
    page: 'pricing',
    locale: resolved,
    keywords: ['Samaan Bol pricing', 'kirana billing app price', 'kirana billing app monthly price'],
  });
}

export default async function LocalizedPricingPage({ params }: LocaleParams) {
  const { locale: paramLocale } = await params;
  if (!isLocale(paramLocale) || paramLocale === 'en') notFound();

  const locale = getLocale(paramLocale);

  return (
    <div className="subscription-shell">
      <JsonLd data={[pricingOfferSchema, faqPageSchema(getSubscriptionStrings(locale).pricing.faq)]} />
      <AmbientBackground />
      <SubscriptionNav locale={locale} page="pricing" />
      <main className="subscription-main">
        <PricingClient locale={locale} />
      </main>
      <SubscriptionFooter locale={locale} page="pricing" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
