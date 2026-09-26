import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { JsonLd } from '../components/JsonLd';
import { SubscriptionFooter, SubscriptionNav } from '../components/SubscriptionChrome';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { HomeEffects } from '../components/HomeEffects';
import { getSubscriptionStrings } from '../content/subscriptionStrings';
import { faqPageSchema, pageMetadata, pricingOfferSchema } from '../seo';
import { PricingClient } from './PricingClient';

export const metadata: Metadata = pageMetadata({
  title: 'Pricing — Samaan Bol Premium',
  description:
    'Premium for ₹499/month or ₹3,999/year, on the phone and in the browser. Subscribe here, or from Billing inside the shop. New shops get 7 days of voice in the app, no card.',
  path: '/pricing',
  page: 'pricing',
  keywords: ['Samaan Bol pricing', 'kirana billing pricing', 'Razorpay UPI Autopay'],
});

export default function PricingPage() {
  const locale = 'en';
  const t = getSubscriptionStrings(locale);

  return (
    <div className="subscription-shell">
      <JsonLd data={[pricingOfferSchema, faqPageSchema(t.pricing.faq)]} />
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
