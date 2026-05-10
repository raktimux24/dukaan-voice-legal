import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { SubscriptionFooter, SubscriptionNav } from '../components/SubscriptionChrome';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { HomeEffects } from '../components/HomeEffects';
import { pageMetadata } from '../seo';
import { PricingClient } from './PricingClient';

export const metadata: Metadata = pageMetadata({
  title: 'Pricing — Samaan-Bol Premium',
  description: 'Subscribe to Samaan-Bol Premium for voice AI, predictions, analytics, multi-shop inventory, and secure Razorpay UPI Autopay billing.',
  path: '/pricing',
  page: 'pricing',
  keywords: ['Samaan-Bol pricing', 'voice inventory app pricing', 'Razorpay UPI Autopay subscription'],
});

export default function PricingPage() {
  const locale = 'en';
  return (
    <div className="subscription-shell">
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
