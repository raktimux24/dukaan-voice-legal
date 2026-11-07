import '../styles/pricing.css';
import { getPricingFaq, getPricingMetadataCopy } from '../content/pricingPage';
import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { JsonLd } from '../components/JsonLd';
import { SubscriptionFooter, SubscriptionNav } from '../components/SubscriptionChrome';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { HomeEffects } from '../components/HomeEffects';
import { faqPageSchema, pageMetadata, pricingOfferSchema } from '../seo';
import { PricingClient } from './PricingClient';

export const metadata: Metadata = pageMetadata({
  ...getPricingMetadataCopy('en'),
  path: '/pricing',
  page: 'pricing',
  keywords: ['Samaan Bol pricing', 'kirana billing app price', 'kirana billing app monthly price'],
});

export default function PricingPage() {
  const locale = 'en';

  return (
    <div className="subscription-shell">
      <JsonLd data={[pricingOfferSchema, faqPageSchema(getPricingFaq(locale))]} />
      <AmbientBackground />
      <SubscriptionNav locale={locale} page="pricing" />
      <main id="main-content" className="subscription-main pricing-page">
        <PricingClient locale={locale} />
      </main>
      <SubscriptionFooter locale={locale} page="pricing" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
