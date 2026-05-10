import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AmbientBackground } from '../../components/AmbientBackground';
import { HomeEffects } from '../../components/HomeEffects';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { SubscriptionFooter, SubscriptionNav } from '../../components/SubscriptionChrome';
import { AccountClient } from '../../account/AccountClient';
import { getSubscriptionStrings } from '../../content/subscriptionStrings';
import { getLocale, isLocale, translatedLocales } from '../../i18n';
import { pageMetadata } from '../../seo';

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  return pageMetadata({
    title: 'Account — Samaan-Bol',
    description: 'Manage your Samaan-Bol subscription, invoices, cancellation, and Razorpay billing status.',
    path: `/${locale}/account`,
    page: 'account',
    locale: getLocale(locale),
    noIndex: true,
  });
}

export default async function LocalizedAccountPage({ params }: LocaleParams) {
  const { locale: paramLocale } = await params;
  if (!isLocale(paramLocale) || paramLocale === 'en') notFound();

  const locale = getLocale(paramLocale);
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
