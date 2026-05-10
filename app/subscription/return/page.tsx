import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AmbientBackground } from '../../components/AmbientBackground';
import { SubscriptionFooter, SubscriptionNav } from '../../components/SubscriptionChrome';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { HomeEffects } from '../../components/HomeEffects';
import { pageMetadata } from '../../seo';
import { ReturnClient } from './ReturnClient';

export const metadata: Metadata = pageMetadata({
  title: 'Subscription Return — Samaan-Bol',
  description: 'Confirm your Samaan-Bol Razorpay subscription and return to the app.',
  path: '/subscription/return',
  page: 'subscriptionReturn',
  noIndex: true,
  languageAlternates: false,
});

export default function SubscriptionReturnPage() {
  const locale = 'en';
  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale={locale} page="subscriptionReturn" />
      <main className="subscription-main">
        <Suspense fallback={<div className="subscription-panel">Confirming subscription...</div>}>
          <ReturnClient />
        </Suspense>
      </main>
      <SubscriptionFooter locale={locale} page="subscriptionReturn" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
