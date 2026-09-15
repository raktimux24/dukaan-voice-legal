import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AmbientBackground } from '../../components/AmbientBackground';
import { HomeEffects } from '../../components/HomeEffects';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { SubscriptionFooter, SubscriptionNav } from '../../components/SubscriptionChrome';
import { PricingClient } from '../../pricing/PricingClient';
import { getLocale, isLocale, translatedLocales } from '../../i18n';
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

  return pageMetadata({
    title: 'Pricing — Samaan Bol Premium',
    description:
      'Premium for ₹499/month or ₹3,999/year. New shops get 7 days of voice in the app, no card. The 7-day refund is separate — it starts from the first charge.',
    path: `/${locale}/pricing`,
    page: 'pricing',
    locale: getLocale(locale),
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
