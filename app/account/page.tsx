import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import { AmbientBackground } from '../components/AmbientBackground';
import { SubscriptionFooter, SubscriptionNav } from '../components/SubscriptionChrome';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { HomeEffects } from '../components/HomeEffects';
import { getSubscriptionStrings } from '../content/subscriptionStrings';
import { pageMetadata } from '../seo';
import { AccountClient } from './AccountClient';

export const metadata: Metadata = pageMetadata({
  title: 'Account — Samaan-Bol',
  description: 'Manage your Samaan-Bol subscription, invoices, cancellation, and Razorpay billing status.',
  path: '/account',
  page: 'account',
  noIndex: true,
  languageAlternates: false,
});

export default function AccountPage() {
  const locale = 'en';
  const t = getSubscriptionStrings(locale);

  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <SubscriptionNav locale={locale} page="account" />
      <main className="subscription-main">
        <Suspense fallback={<div className="subscription-panel">{t.account.loadingAccount}</div>}>
          <AccountClient locale={locale} />
        </Suspense>
      </main>
      <SubscriptionFooter locale={locale} page="account" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
