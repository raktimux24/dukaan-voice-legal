import type { Locale } from '../i18n';
import { planCopy } from '../lib/subscriptions';
import { getSubscriptionStrings } from './subscriptionStrings';
import homeCopy from './homePricingCopy.json';
import pageCopy from './pricingPageCopy.json';

/** Keep the visible answers and FAQ schema in sync on every pricing route. */
export function getPricingFaq(locale: Locale) {
  const home = homeCopy[locale];
  return [
    { q: home.trial, a: home.trialEligibility },
    ...getSubscriptionStrings(locale).pricing.faq,
  ];
}

export function getPricingMetadataCopy(locale: Locale) {
  const home = homeCopy[locale];
  return {
    title: `${getSubscriptionStrings(locale).nav.pricing} — ${home.free} & Premium | Samaan Bol`,
    description: `${pageCopy[locale].gstHeading} Premium: ${planCopy.monthly.price}${home.month} ${home.or} ${planCopy.annual.price}${home.year}. ${home.trial}. ${home.trialEligibility}`,
  };
}
