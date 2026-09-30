import { defaultLocale, type Locale, type PageKind, localizedPath, locales } from '../i18n';
import { homeHtml, proofSectionHtml } from './home';
import { productAnswersHtml } from './productAnswers';
import { privacyHtml } from './privacy';
import { termsHtml } from './terms';
import { translatedHtml } from './translated';
import { getSubscriptionStrings } from './subscriptionStrings';
import { appStoreUrl, playStoreUrl } from '../seo';
import { applyBengaluruProofHeading, getLocaleHomeHtml, getLocaleHomeSlots } from './localeHomeSlots';

type ContentPageKind = Extract<PageKind, 'home' | 'privacy' | 'terms'>;

const englishHtml: Record<ContentPageKind, string> = {
  home: homeHtml,
  privacy: privacyHtml,
  terms: termsHtml,
};

export function languageSwitcher(locale: Locale, page: PageKind) {
  const currentLocale = locales.find((item) => item.code === locale) ?? locales[0];
  const homeSlots = getLocaleHomeSlots(locale);
  const languageLabel = homeSlots?.chromeLanguage ?? 'Language';
  const selectLanguage = homeSlots?.ariaSelectLanguage ?? 'Select language';
  const options = locales
    .map((item) => {
      const selected = item.code === locale ? ' aria-current="true"' : '';
      return `<a class="language-option" href="${localizedPath(item.code, page)}"${selected}>
        <span class="language-local-icon" aria-hidden="true">${item.icon}</span>
        <span class="language-option-copy">
          <span class="language-option-native">${item.nativeLabel}</span>
          <span class="language-option-label">${item.label}</span>
        </span>
      </a>`;
    })
    .join('');

  return `<div class="language-switcher" data-language-switcher>
    <button class="language-button" type="button" data-language-button aria-expanded="false" aria-label="${selectLanguage}">
      <span class="language-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M3 12h18"></path>
          <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9"></path>
          <path d="M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9"></path>
        </svg>
      </span>
      <span class="language-switcher-copy">
        <span class="language-switcher-label">${languageLabel}</span>
        <span class="language-current"><span class="language-local-icon" aria-hidden="true">${currentLocale.icon}</span>${currentLocale.nativeLabel}</span>
      </span>
      <span class="language-chevron" aria-hidden="true">
        <svg viewBox="0 0 20 20" focusable="false"><path d="M5.5 7.5 10 12l4.5-4.5"></path></svg>
      </span>
    </button>
    <div class="language-menu" data-language-menu role="group" aria-label="Languages">
      ${options}
    </div>
  </div>`;
}

function localizeLinks(html: string, locale: Locale) {
  const home = localizedPath(locale, 'home');
  const privacy = localizedPath(locale, 'privacy');
  const terms = localizedPath(locale, 'terms');
  const pricing = localizedPath(locale, 'pricing');
  const account = localizedPath(locale, 'account');
  const contact = localizedPath(locale, 'contact');
  const refund = localizedPath(locale, 'refund');

  return html
    .replaceAll('href="/privacy-policy"', `href="${privacy}"`)
    .replaceAll('href="/terms-of-service"', `href="${terms}"`)
    .replaceAll('href="/pricing"', `href="${pricing}"`)
    .replaceAll('href="/account"', `href="${account}"`)
    .replaceAll('href="/contact"', `href="${contact}"`)
    .replaceAll('href="/refund-policy"', `href="${refund}"`)
    .replaceAll('href="/" class="back"', `href="${home}" class="back"`)
    .replaceAll('href="/billing-on-a-laptop"', `href="${localizedPath(locale, 'laptop')}"`)
    .replaceAll('href="/udhaar"', `href="${localizedPath(locale, 'udhaar')}"`);
}

function stripRemovedNavItems(html: string) {
  return html
    .replace(/\s*<li><a href="#how">[^<]*<\/a><\/li>/g, '')
    .replace(/\s*<li><a href="#languages">[^<]*<\/a><\/li>/g, '');
}

function injectMissingNavItems(html: string, locale: Locale) {
  if (html.includes('href="/pricing"') || html.includes(`href="${localizedPath(locale, 'pricing')}"`)) {
    return html;
  }

  const t = getSubscriptionStrings(locale);
  const pricingHref = localizedPath(locale, 'pricing');
  const accountHref = localizedPath(locale, 'account');
  const insert = `<li><a href="${pricingHref}">${t.nav.pricing}</a></li>\n        <li><a href="${accountHref}">${t.nav.account}</a></li>\n        `;

  return html.replace(
    /<li><a href="https:\/\/apps\.apple\.com[^"]*"\s+class="nav-cta"/,
    `${insert}$&`,
  );
}

function activatePlayStoreBadge(html: string) {
  return html
    .replace(
      /<a href="#"( class="store-badge"[^>]*)>/g,
      `<a href="${playStoreUrl}" class="store-badge">`,
    )
    .replace(/ style="position:relative; opacity:0.65; pointer-events:none;"/g, '')
    .replace(
      /<span style="position:absolute; top:-10px; right:-10px;[^>]*>[\s\S]*?<\/span>/g,
      '',
    );
}

function rewriteDeadCompanyLinks(html: string, locale: Locale) {
  const t = getSubscriptionStrings(locale);
  const pricingHref = localizedPath(locale, 'pricing');
  const accountHref = localizedPath(locale, 'account');

  return html.replace(
    /(<div class="footer-col">\s*<h4>[^<]*<\/h4>\s*<ul>\s*)(?:<li><a href="#">[^<]*<\/a><\/li>\s*){3}(<li><a href="[^"]*">[^<]*<\/a><\/li>)/,
    `$1<li><a href="${pricingHref}">${t.footer.pricing}</a></li>\n          <li><a href="${accountHref}">${t.nav.account}</a></li>\n          $2`,
  );
}

function sanitizeTranslatedHome(html: string, locale: Locale) {
  const t = getSubscriptionStrings(locale);
  let out = html
    .replaceAll('चावल 5 किलो जोड़ दो', 'चावल 5 किलो बेचा')
    .replaceAll('Priya General Store', 'Kirana counter')
    .replaceAll('Download Free', t.nav.download)
    .replaceAll('No Play Store.', '')
    .replaceAll('No Play Store', '')
    .replaceAll('Play is not live', '')
    .replace(/<div class="hero-stat-number">50K\s*\+<\/div>/g, '<div class="hero-stat-number">Cash</div>')
    .replace(/href="#download" class="btn-primary"/g, `href="${appStoreUrl}" class="btn-primary"`)
    .replace(/<section class="testimonials">[\s\S]*?<\/section>/, proofSectionHtml);
  out = applyBengaluruProofHeading(out, locale);

  out = activatePlayStoreBadge(out);
  out = rewriteDeadCompanyLinks(out, locale);

  out = out.replace(
    /(<li><a href="#ai">)[^<]*(<\/a><\/li>)/,
    `$1${t.nav.ai}$2`,
  );

  return out;
}

function adaptHome(html: string, locale: Locale) {
  const switcher = languageSwitcher(locale, 'home');
  const transformed = injectMissingNavItems(
    stripRemovedNavItems(sanitizeTranslatedHome(localizeLinks(html, locale), locale)),
    locale,
  );

  const storeActions = `<div class="hero-actions" data-store-placement="hero">
    <a href="${playStoreUrl}" class="btn-primary" data-store-placement="hero" aria-label="Samaan Bol — Google Play">Google Play</a>
    <a href="${appStoreUrl}" class="btn-secondary" data-store-placement="hero" aria-label="Samaan Bol — App Store">App Store</a>
  </div>`;
  // Customer quote approval is not documented in this repository. Keep the
  // source intact, but omit attributed testimonials until they are verified.
  let acquisitionHtml = transformed
    .replace(/<section class="testimonials">[\s\S]*?<\/section>/, '')
    .replace(/<div class="hero-actions">[\s\S]*?<\/div>/, storeActions)
    .replace(/<canvas[^>]*id="bgCanvas"[^>]*><\/canvas>/, '')
    .replace(/<span class="hero-rotate-word">(?:Punjabi|Odia)<\/span>/g, '')
    .replaceAll('10 Indian languages + English', '8 Indian languages + English')
    .replaceAll('Malayalam, Punjabi, Odia, English.', 'Malayalam, English.')
    .replace(/(<section class="languages-section"[\s\S]*?<p class="section-sub">)[\s\S]*?(<\/p>)/, (_match, before, after) => `${before}${getLocaleHomeSlots(locale)?.f2Body ?? 'Voice: Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam and English, including Hinglish. Read this website in your preferred language below. The browser shop is currently in English.'}${after}`)

    .replace(/<div class="lang-grid reveal">[\s\S]*?<\/div>/, `<div class="lang-grid reveal">${locales.map(item => `<a class="lang-chip" href="${localizedPath(item.code, 'home')}" lang="${item.hreflang}">${item.nativeLabel}</a>`).join('')}</div>`)

    .replace('</nav>', '</nav><main id="main-content">')
    .replace('<footer>', `${productAnswersHtml(locale)}<section class="guide-discovery"><div class="container"><a href="/guides/voice-billing-for-kirana" lang="en">How to use voice billing in your kirana store${locale === 'en' ? '' : ' (English guide)'} →</a></div></section></main><footer>`)
    .replace(/<h4>/g, '<h2>').replace(/<\/h4>/g, '</h2>');

  if (locale === 'en') {
    acquisitionHtml = acquisitionHtml
      .replace('You already said it out loud.<br>The bill should keep up.', 'Voice billing for your kirana.')
      .replace(/<p class="hero-sub">[\s\S]*?<\/p>/, '<p class="hero-sub">Samaan Bol turns a spoken sale into a bill on your phone. Review the items, choose cash, UPI or udhaar, and share the bill. Stock updates with the sale. Speak in 8 Indian languages or English, including Hinglish. Use the same shop on a laptop.</p>');
  }

  if (locale === 'pa' || locale === 'or') {
    const note = locale === 'pa'
      ? 'ਇਹ ਵੈੱਬਸਾਈਟ ਪੰਜਾਬੀ ਵਿੱਚ ਪੜ੍ਹ ਸਕਦੇ ਹੋ। ਐਪ ਵਿੱਚ ਪੰਜਾਬੀ ਵੌਇਸ ਚੋਣ ਅਜੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਹਿੰਦੀ, Hinglish ਜਾਂ ਹੋਰ ਸਮਰਥਿਤ ਭਾਸ਼ਾ ਚੁਣੋ।'
      : 'ଏହି ୱେବସାଇଟ୍ ଓଡ଼ିଆରେ ପଢ଼ିପାରିବେ। ଆପ୍‌ରେ ଓଡ଼ିଆ ଭଏସ୍ ବିକଳ୍ପ ଏବେ ଉପଲବ୍ଧ ନାହିଁ। ହିନ୍ଦୀ, Hinglish କିମ୍ବା ଅନ୍ୟ ସମର୍ଥିତ ଭାଷା ବାଛନ୍ତୁ।';
    acquisitionHtml = acquisitionHtml.replace('<div class="hero-actions"', `<p class="language-support-note">${note}</p><div class="hero-actions"`);
  }
  return acquisitionHtml.replace(
    '</ul>\n      <button class="mobile-menu-btn"',
    `</ul>\n      ${switcher}\n      <button class="mobile-menu-btn"`,
  );
}

function adaptLegal(html: string, locale: Locale, page: PageKind) {
  const switcher = languageSwitcher(locale, page);

  return localizeLinks(html, locale).replace(
    /<a href="([^"]+)" class="back">([\s\S]*?)<\/a>/,
    `<div class="legal-topbar"><a href="$1" class="back">$2</a>${switcher}</div>`,
  );
}

export function getLocalizedHtml(page: ContentPageKind, locale: Locale) {
  if (page === 'home') return adaptHome(getLocaleHomeHtml(locale), locale);

  const source = locale === defaultLocale ? englishHtml[page] : translatedHtml[locale]?.[page] ?? englishHtml[page];
  return adaptLegal(source, locale, page);
}
