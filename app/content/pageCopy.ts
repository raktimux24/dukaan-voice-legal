import type { Locale } from '../i18n';
import { getLocalizedHtml } from './localized';
import { getSubscriptionStrings } from './subscriptionStrings';

function clip(text: string, max = 160) {
  const normalized = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  const cut = normalized.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim();
}

export function localizedPageCopy(locale: Locale, page: 'pricing' | 'contact' | 'privacy' | 'terms') {
  if (page === 'pricing') {
    const pricing = getSubscriptionStrings(locale).pricing;
    return {
      title: `${pricing.heroTitle} — Samaan Bol`,
      description: clip(pricing.heroLead),
    };
  }

  if (page === 'contact') {
    const contact = getSubscriptionStrings(locale).contact;
    return {
      title: `${contact.heading} — Samaan Bol`,
      description: clip(contact.lead),
    };
  }

  const html = getLocalizedHtml(page, locale);
  const heading = html.match(/<h1>([^<]+)<\/h1>/)?.[1]?.trim();
  const paragraph = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((match) => match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .find((text) => text.length > 80);

  return {
    title: `${heading ?? (page === 'privacy' ? 'Privacy Policy' : 'Terms of Service')} — Samaan Bol`,
    description: clip(paragraph ?? ''),
  };
}
