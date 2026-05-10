import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AmbientBackground } from '../../components/AmbientBackground';
import { HomeEffects } from '../../components/HomeEffects';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { SubscriptionFooter, SubscriptionNav, supportEmail } from '../../components/SubscriptionChrome';
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
    title: 'Contact Support — Samaan-Bol',
    description: 'Contact Samaan-Bol support for app help, subscription billing, refunds, invoices, and account questions.',
    path: `/${locale}/contact`,
    page: 'contact',
    locale: getLocale(locale),
  });
}

export default async function LocalizedContactPage({ params }: LocaleParams) {
  const { locale: paramLocale } = await params;
  if (!isLocale(paramLocale) || paramLocale === 'en') notFound();

  const locale = getLocale(paramLocale);
  const t = getSubscriptionStrings(locale);
  const businessAddress = '3/1, 1st Main, Mahadevpura, Outer Ring Road, Bangalore-560048';

  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale={locale} page="contact" />
      <main className="subscription-main">
        <section className="subscription-section">
          <h1>{t.contact.heading}</h1>
          <p className="subscription-lead">{t.contact.lead}</p>
          <div className="subscription-panel contact-panel">
            <h3>{t.contact.emailHeading}</h3>
            <p>
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>
            <h3>{t.contact.responseHeading}</h3>
            <p className="muted">{t.contact.responseBody}</p>
            <h3>{t.contact.businessHeading}</h3>
            <p className="muted">{businessAddress}</p>
          </div>
        </section>
      </main>
      <SubscriptionFooter locale={locale} page="contact" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
