import type { Locale } from '../i18n';
import { appStoreUrl, playStoreUrl } from '../seo';
import { getLocaleHomeSlots } from './localeHomeSlots';
import copy from './landingOpeningCopy.json';
import offer from './offerCorrections.json';
import workflows from './shopWorkflowsLocales.json';

const esc = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const mic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>';

/** A localized, explicitly illustrative sale, with no pretend product controls. */
export function refineLandingOpening(html: string, locale: Locale) {
  const t = copy[locale];
  const seeHow = getLocaleHomeSlots(locale)?.ctaSeeHow ?? 'See how a sale works';
  return html.replace(/<section class="hero">[\s\S]*?<\/section>/, original => {
    const languageNote = original.match(/<p class="language-support-note">[\s\S]*?<\/p>/)?.[0] ?? '';
    return `<section class="hero hero-counter" aria-labelledby="hero-title"><div class="container">
      <div class="counter-hero-grid">
        <div class="counter-hero-copy">
          <p class="section-label">${esc(t.eyebrow)}</p>
          <h1 id="hero-title"><span>${esc(t.headline[0])}</span><span>${esc(t.headline[1])}</span></h1>
          <p class="counter-hero-intro">${esc(t.intro)}</p>
          <p class="counter-hero-conditions">${esc(t.conditions)}</p>${languageNote}
          <div class="counter-hero-actions"><a href="/shop" class="btn-primary">${esc(workflows[locale].open)} <span aria-hidden="true">→</span></a><a href="#how" class="story-text-link">${esc(seeHow)} <span aria-hidden="true">↗</span></a></div>
          <div class="counter-app-links" data-store-placement="hero"><span>${esc(t.appLabel)}</span><div><a href="${playStoreUrl}" data-store-placement="hero" aria-label="Samaan Bol — Google Play">Google Play <span aria-hidden="true">↗</span></a><a href="${appStoreUrl}" data-store-placement="hero" aria-label="Samaan Bol — App Store">App Store <span aria-hidden="true">↗</span></a></div></div>
        </div>
        <figure class="counter-hero-scene">
          <div class="counter-spoken"><span class="counter-voice-mark">${mic}</span><div><span class="counter-scene-label">${esc(t.phone)}</span><p lang="hi-IN">“चावल 5 किलो बेचा”</p></div></div>
          <div class="counter-illustration"><img src="/illustrations/kirana-hero.webp" width="1536" height="1024" alt="" fetchpriority="high" decoding="async"/>
            <div class="counter-sample-bill"><p class="counter-bill-heading">${esc(t.review)}</p><div class="counter-bill-item"><div><strong>${esc(t.rice)}</strong><small>5 kg × ₹50</small></div></div><div class="counter-bill-total"><span>${esc(t.total)}</span><strong>₹250</strong></div><p class="counter-bill-note">${esc(t.payment)}</p></div>
          </div>
          <figcaption>${esc(offer[locale].exampleLabel)}</figcaption>
        </figure>
      </div>
    </div></section>`;
  });
}
