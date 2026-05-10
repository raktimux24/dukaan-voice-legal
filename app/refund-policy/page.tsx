import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { SubscriptionFooter, SubscriptionNav, supportEmail } from '../components/SubscriptionChrome';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { HomeEffects } from '../components/HomeEffects';
import { pageMetadata } from '../seo';

export const metadata: Metadata = pageMetadata({
  title: 'Refund Policy — Samaan-Bol',
  description: 'Read the Samaan-Bol refund policy for Razorpay subscription payments, cancellations, renewal access, and refund timelines.',
  path: '/refund-policy',
  page: 'refund',
  keywords: ['Samaan-Bol refund policy', 'Razorpay subscription refund', 'UPI Autopay cancellation'],
  languageAlternates: false,
});

export default function RefundPolicyPage() {
  const locale = 'en';

  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale={locale} page="refund" />
      <main className="subscription-main">
        <section className="subscription-section">
          <h1>Refund Policy</h1>
          <p className="subscription-lead">Samaan-Bol Premium subscriptions are billed through Razorpay. This policy explains refunds, cancellations, and renewal access.</p>
          <div className="subscription-panel">
            <ul className="policy-list">
              <li>First charges are eligible for a 7-day no-questions refund window.</li>
              <li>After 7 days, subscription charges are not refunded and are not prorated after cancellation.</li>
              <li>When you cancel before the next billing date, Premium access continues until the end of the current paid period.</li>
              <li>Refunds approved through Razorpay usually return to the original payment source in 5-7 business days.</li>
              <li>Subscriptions auto-renew unless canceled before the renewal date.</li>
            </ul>
            <p className="subscription-alert">
              To request a refund, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> with your account email, shop name, payment date, and Razorpay payment or subscription ID if available.
            </p>
          </div>
        </section>
      </main>
      <SubscriptionFooter locale={locale} page="refund" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
