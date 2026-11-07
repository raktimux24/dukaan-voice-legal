'use client';

import Link from 'next/link';
import { useState } from 'react';
import { defaultLocale, type Locale, localizedPath } from '../i18n';
import { getSubscriptionStrings } from '../content/subscriptionStrings';
import { getPricingFaq } from '../content/pricingPage';
import pageCopy from '../content/pricingPageCopy.json';
import homeCopy from '../content/homePricingCopy.json';
import offerCorrections from '../content/offerCorrections.json';
import { planCopy, type BillingPlan } from '../lib/subscriptions';

const Arrow = () => <span aria-hidden="true">→</span>;

export function PricingClient({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getSubscriptionStrings(locale);
  const copy = pageCopy[locale];
  const home = homeCopy[locale];
  const [plan, setPlan] = useState<BillingPlan>('monthly');
  const accountHref = `${localizedPath(locale, 'account')}?plan=${plan}`;
  const freeFeatures = [...home.freeFeatures, ...copy.freeExtras];
  const premiumFeatures = [...home.premiumFeatures.slice(1), copy.reports];

  return (
    <>
      <section className="plan-intro" aria-labelledby="pricing-title">
        <div>
          <p className="section-label">{t.nav.pricing}</p>
          <h1 id="pricing-title">{home.heading}</h1>
          <p className="plan-intro-lead">{copy.lead}</p>
        </div>
        <div className="plan-shop-illustration" aria-hidden="true" />
      </section>

      <section className="plan-trial" aria-labelledby="pricing-trial-title">
        <div className="plan-trial-mark" aria-hidden="true">7<span>✦</span></div>
        <div className="plan-trial-copy">
          <h2 id="pricing-trial-title">{home.trial}</h2>
          <p>{home.trialEligibility}</p>
        </div>
        <Link className="plan-text-link" href="/shop">{t.nav.openShop}<Arrow /></Link>
      </section>

      <section className="plan-ledger" aria-label={t.pricing.comparisonHeading}>
        <article className="plan-sheet plan-sheet-free" aria-labelledby="free-title">
          <header><h2 id="free-title">{home.free}</h2><p>{copy.freePurpose}</p></header>
          <div className="plan-amount"><strong>₹0</strong><span>{home.month}</span></div>
          <p className="plan-period-note">{home.perShop}</p>
          <ul className="plan-features">
            {freeFeatures.map((feature, i) => <li className={i === 3 ? 'plan-feature-gst' : undefined} key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}
          </ul>
          <div className="plan-sheet-action">
            <Link className="plan-button plan-button-free" href="/shop">{copy.startFree}<Arrow /></Link>
          </div>
        </article>

        <article className="plan-sheet plan-sheet-premium" aria-labelledby="premium-title">
          <header><div className="plan-name"><h2 id="premium-title">Premium</h2><span>{home.perShop}</span></div><p>{copy.premiumPurpose}</p></header>
          <div className="plan-price-announcement" aria-live="polite" aria-atomic="true">
            <div className="plan-amount"><strong>{planCopy[plan].price}</strong><span>{plan === 'monthly' ? home.month : home.year}</span></div>
            <p className="plan-period-note">{plan === 'monthly' ? copy.billedMonthly : copy.billedYearly}</p>
          </div>
          <div className="plan-interval" role="group" aria-label={t.pricing.billingIntervalLabel}>
            {(['monthly', 'annual'] as BillingPlan[]).map(interval => (
              <button key={interval} type="button" aria-pressed={plan === interval} onClick={() => setPlan(interval)}>
                <span>{interval === 'monthly' ? t.plans.monthlyLabel : t.plans.annualLabel}</span>
                <strong>{planCopy[interval].price}<span>{interval === 'monthly' ? home.month : home.year}</span></strong>
              </button>
            ))}
          </div>
          <p className="plan-savings">{t.plans.annualLabel}: {t.pricing.annualSavings}</p>
          <p className="plan-includes">{home.premiumFeatures[0]}</p>
          <ul className="plan-features">
            {premiumFeatures.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}
          </ul>
          <p className="plan-voice-note">{copy.voiceNote}</p>
          <div className="plan-sheet-action">
            <Link className="plan-button" href={accountHref}>{t.pricing.ctaSubscribe}<Arrow /></Link>
          </div>
        </article>
      </section>

      <section className="plan-gst" aria-labelledby="plan-gst-title">
        <svg className="plan-gst-drawing" aria-hidden="true" viewBox="0 0 100 110" fill="none">
          <path d="M20 10h62v88l-8-5-8 5-8-5-8 5-8-5-8 5-7-5-7 5V10Z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M32 28h22M32 37h38M32 62h16M32 72h16M60 62h10M60 72h10" stroke="currentColor" strokeWidth="1.4" />
          <path d="M30 49h42" stroke="currentColor" strokeDasharray="2 3" />
          <circle cx="76" cy="83" r="16" fill="#ff934b" />
          <path d="m69 83 5 5 9-10" stroke="#17130e" strokeWidth="2" />
        </svg>
        <div><h2 id="plan-gst-title">{copy.gstHeading}</h2><p>{copy.gstBody}</p></div>
      </section>

      <section className="plan-billing" aria-labelledby="plan-billing-title">
        <div><p className="section-label">{t.nav.billing}</p><h2 id="plan-billing-title">{copy.billingHeading}</h2></div>
        <div className="plan-billing-details">
          <p>{copy.management}</p>
          <ul>{t.pricing.trustStrip.map(item => <li key={item}>{item}</li>)}</ul>
          <p className="plan-sign-in-note">{offerCorrections[locale].signIn}</p>
          <div className="plan-billing-links">
            <Link className="plan-text-link" href={localizedPath(locale, 'account')}>{t.nav.account}<Arrow /></Link>
            <a className="plan-text-link" href="samaan-bol://upgrade">{t.pricing.ctaOpenInApp}<Arrow /></a>
          </div>
          <Link className="plan-refund-link" href={localizedPath(locale, 'refund')}>{t.pricing.refundWindow} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="plan-questions" aria-labelledby="plan-questions-title">
        <h2 id="plan-questions-title">{t.pricing.faqHeading}</h2>
        <div className="plan-faq-list">
          {getPricingFaq(locale).map(({ q, a }) => (
            <details key={q}><summary>{q}<span aria-hidden="true" /></summary><p>{a}</p></details>
          ))}
        </div>
      </section>
    </>
  );
}
