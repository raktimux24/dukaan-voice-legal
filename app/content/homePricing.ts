import { localizedPath, type Locale } from '../i18n';
import { planCopy } from '../lib/subscriptions';
import copy from './homePricingCopy.json';
import workflows from './shopWorkflowsLocales.json';

const esc = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const features = (items: string[]) => `<ul class="home-plan-features">${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;

/** A concise decision point; prices share the pricing page's existing source. */
export function homePricingHtml(locale: Locale) {
  const t = copy[locale];
  return `<section class="home-pricing" id="home-plans" aria-labelledby="home-plans-title"><div class="container home-pricing-layout">
    <div class="home-pricing-intro"><p class="section-label">${esc(t.eyebrow)}</p><h2 id="home-plans-title">${esc(t.heading)}</h2><aside class="home-pricing-trial" aria-labelledby="home-trial-title"><h3 id="home-trial-title">${esc(t.trial)}</h3><p>${esc(t.trialEligibility)}</p></aside></div>
    <div class="home-plan-summary">
      <div class="home-plan-columns">
        <article class="home-plan home-plan--free" aria-labelledby="home-free-title"><h3 id="home-free-title">${esc(t.free)}</h3><div class="home-plan-prices"><p class="home-plan-price"><strong>₹0</strong></p></div>${features(t.freeFeatures)}</article>
        <article class="home-plan home-plan--premium" aria-labelledby="home-premium-title"><div class="home-plan-heading"><h3 id="home-premium-title">Premium</h3><span>${esc(t.perShop)}</span></div><div class="home-plan-prices"><p class="home-plan-price"><strong>${esc(planCopy.monthly.price)}</strong><span>${esc(t.month)}</span></p><p class="home-plan-annual">${esc(t.or)} <strong>${esc(planCopy.annual.price)}</strong> ${esc(t.year)}</p></div>${features(t.premiumFeatures)}</article>
      </div>
      <div class="home-pricing-footer"><p>${esc(t.note)}</p><a class="story-text-link" href="${localizedPath(locale, 'pricing')}">${esc(workflows[locale].pricing)} <span aria-hidden="true">→</span></a></div>
    </div>
  </div></section>`;
}
