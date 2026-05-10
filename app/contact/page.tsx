import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { SubscriptionFooter, SubscriptionNav, supportEmail } from '../components/SubscriptionChrome';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { HomeEffects } from '../components/HomeEffects';
import { getSubscriptionStrings } from '../content/subscriptionStrings';
import { pageMetadata } from '../seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Support — Samaan-Bol',
  description: 'Contact Samaan-Bol support for app help, subscription billing, refunds, invoices, and account questions.',
  path: '/contact',
  page: 'contact',
  keywords: ['Samaan-Bol contact', 'Samaan-Bol support', 'voice inventory app support'],
});

export default function ContactPage() {
  const locale = 'en';
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
