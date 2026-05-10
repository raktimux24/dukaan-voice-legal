'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { defaultLocale, type Locale, localizedPath } from '../i18n';
import { getSubscriptionStrings } from '../content/subscriptionStrings';
import { planCopy, type BillingPlan } from '../lib/subscriptions';

export function PricingClient({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getSubscriptionStrings(locale);
  const [plan, setPlan] = useState<BillingPlan>('monthly');
  const active = planCopy[plan];
  const accountHref = useMemo(() => `${localizedPath(locale, 'account')}?plan=${plan}`, [locale, plan]);

  return (
    <>
      <section className="subscription-hero">
        <div>
          <h1>{t.pricing.heroTitle}</h1>
          <p className="subscription-lead">{t.pricing.heroLead}</p>
          <div className="subscription-actions">
            <Link className="subscription-button" href={accountHref}>
              {t.pricing.ctaSubscribe}
            </Link>
            <a className="subscription-button secondary" href="samaan-bol://upgrade">
              {t.pricing.ctaOpenInApp}
            </a>
          </div>
        </div>

        <aside className="pricing-card" aria-label={t.pricing.planSelectorLabel}>
          <div className="pricing-toggle" role="group" aria-label={t.pricing.billingIntervalLabel}>
            {(['monthly', 'annual'] as BillingPlan[]).map((item) => (
              <button key={item} type="button" aria-pressed={plan === item ? 'true' : 'false'} onClick={() => setPlan(item)}>
                {item === 'monthly' ? t.plans.monthlyLabel : t.plans.annualLabel}
              </button>
            ))}
          </div>
          <p className="muted">{t.pricing.selectedPlan}</p>
          <div className="price-line">
            <strong>{active.price}</strong>
            <span>{active.suffix}</span>
          </div>
          {plan === 'annual' ? <p className="muted">{t.pricing.annualSavings}</p> : <p className="muted">{t.pricing.monthlyFlexible}</p>}
          <Link className="subscription-button" href={accountHref}>
            {t.pricing.subscribeWithAmount(active.amount)}
          </Link>
          <ul className="feature-list">
            <li>{t.pricing.refundWindow}</li>
            <li>{t.pricing.razorpaySecure}</li>
            <li>{t.pricing.gstInvoice}</li>
          </ul>
        </aside>
      </section>

      <section className="subscription-section">
        <h2>{t.pricing.comparisonHeading}</h2>
        <div className="comparison-grid">
          <div className="subscription-panel">
            <h3>{t.pricing.freeHeading}</h3>
            <ul className="feature-list">
              {t.pricing.freeFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="subscription-panel">
            <h3>{t.pricing.premiumHeading}</h3>
            <ul className="feature-list">
              {t.pricing.premiumFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="subscription-section">
        <h2>{t.pricing.secureBillingHeading}</h2>
        <div className="trust-strip">
          {t.pricing.trustStrip.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </section>

      <section className="subscription-section">
        <h2>{t.pricing.faqHeading}</h2>
        <div className="faq-list">
          {t.pricing.faq.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
