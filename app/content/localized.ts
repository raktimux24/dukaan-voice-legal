import { defaultLocale, type Locale, type PageKind, localizedPath, locales, webAppHref } from '../i18n';
import { homeHtml, proofSectionHtml } from './home';
import { getShopWorkflowsHtml } from './shopWorkflows';
import { refineHomeSections } from './landingRefinement';
import { completeLandingSections } from './landingCompletion';
import { refineLandingOpening } from './landingOpening';
import offerCorrections from './offerCorrections.json';
import { productAnswers, productAnswersHtml } from './productAnswers';
import { privacyHtml } from './privacy';
import { applyPrivacyDisclosures } from './privacy-disclosure-html';
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
    .replaceAll('href="/#web"', `href="${webAppHref(locale)}"`)
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

  const webAction = locale === 'en' ? `<a href="/shop" class="btn-secondary">Open your shop in a browser</a>` : '';
  const storeActions = `<div class="hero-actions" data-store-placement="hero">
    <a href="${playStoreUrl}" class="btn-primary" data-store-placement="hero" aria-label="Samaan Bol — Google Play">Google Play</a>
    <a href="${appStoreUrl}" class="btn-secondary" data-store-placement="hero" aria-label="Samaan Bol — App Store">App Store</a>
    ${webAction}
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
    .replace(/(<section class="languages-section"[\s\S]*?<p class="section-sub">)[\s\S]*?(<\/p>)/, (_match, before, after) => `${before}${productAnswers(locale)[3].a}${after}`)

    .replace(/<div class="lang-grid reveal">[\s\S]*?<\/div>/, `<div class="lang-grid reveal">${locales.map(item => `<a class="lang-chip" href="${localizedPath(item.code, 'home')}" lang="${item.hreflang}">${item.nativeLabel}</a>`).join('')}</div>`)

    .replace('</nav>', '</nav><main id="main-content">')
    .replace('<footer>', `${productAnswersHtml(locale)}<section class="guide-discovery"><div class="container"><a href="/guides/voice-billing-for-kirana" lang="en">How to use voice billing in your kirana store${locale === 'en' ? '' : ' (English guide)'} →</a></div></section></main><footer>`)
    .replace(/(<section class="web-section"[\s\S]*?<p class="section-sub">)[\s\S]*?(<\/p>)/, (_match, before, after) => `${before}${offerCorrections[locale].laptopAnswer}${after}`)
    .replace(/<h4>/g, '<h2>').replace(/<\/h4>/g, '</h2>');

  acquisitionHtml = acquisitionHtml
    .replace(/<p class="hero-sub">[\s\S]*?<\/p>/, `<p class="hero-sub">${productAnswers(locale)[0].a}</p>`)
    .replace('<section class="features" id="features"', `${getShopWorkflowsHtml(locale)}<section class="features" id="features"`)
    .replaceAll('href="#features"', 'href="#shop-workflows"')
    .replace('<div class="hero-visual">', `<div class="hero-visual"><p class="illustration-note">${offerCorrections[locale].exampleLabel}</p>`)
    .replace(/(<section class="cta-section" id="download"[\s\S]*?<h2 class="section-heading">)[\s\S]*?(<\/h2>)/, (_match, before, after) => `${before}${offerCorrections[locale].sampleSetup}${after}`)
    .replace(/(<section class="cta-section" id="download"[\s\S]*?<p class="section-sub">)[\s\S]*?(<\/p>)/, (_match, before, after) => `${before}${offerCorrections[locale].closing}${after}`);

  if (locale !== 'en') {
    const slots = getLocaleHomeSlots(locale);
    const copy = offerCorrections[locale];
    // Replace the published per-locale fragments, not arbitrary similar wording.
    for (const [original, replacement] of [
      [slots?.how3Body, copy.saleShare],
      [slots?.hisaab4Body, copy.stockCount],
      [slots?.hisaab1Body, copy.cashReview],
      [slots?.cmpWithHeading, copy.saleReview],
      [slots?.cmpWith1, copy.saleReview],
      [slots?.cmpWithout3, copy.paperStock],
    ]) {
      if (original && replacement) acquisitionHtml = acquisitionHtml.replaceAll(original, replacement);
    }
  }

  if (locale === 'en') {
    acquisitionHtml = acquisitionHtml
      .replace('You already said it out loud.<br>The bill should keep up.', 'Make the bill. Track the stock.')
      .replace(/<p class="hero-sub">[\s\S]*?<\/p>/, '<p class="hero-sub">Speak a sale, review the items, and complete the bill. Samaan Bol keeps the sale and tracked stock together across your phone and browser. Use cash or UPI; record udhaar with Premium. Voice needs Premium and internet.</p>');
  }

  if (locale === 'en') {
    acquisitionHtml = acquisitionHtml
      .replace('On the phone, say what they took. On a laptop, search, scan, or weigh it — 250 g or 0.25 kg.', 'Speak the sale or search and scan products. Check the item and quantity before checkout — for example, 250 g or 0.25 kg.')
      .replace('You still tap to take money — a spoken sentence cannot send UPI alone.', 'Review the bill and confirm the payment yourself. Speaking a sale does not collect UPI.')
      .replace("Cash, show the UPI amount on a QR, or put it on that customer's udhaar. Card appears when the shop has turned it on. You still confirm the payment yourself.", "Take cash, show a configured UPI QR, or record udhaar with Premium. Card appears when enabled. Confirm any payment yourself.")
      .replace('Hinglish is how you speak. It is not a chip. Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam, English.', 'Speak Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam or English, including Hindi mixed with English.')
      .replace("Ramesh's rice on his name. Premium, once, plainly.", 'Record a credit sale against the customer and see their outstanding balance with Premium.')
      .replace('Not stock-in unless you are adding stock.', 'Scan a barcode to find a product and add it to the bill.')
      .replace('Ask the day. Cash in the box should match what the bills say.', 'Compare recorded cash sales with the cash you have counted.')
      .replace('You do not count it again on Sunday to know what the bill already took.', 'A completed sale updates tracked stock, giving you a record to check against a physical count.')
      .replace('The sentence you said is the bill', 'A sale you can review')
      .replace('The sentence you said becomes the bill', 'Review the items before completing the sale')
      ;
  }

  if (locale === 'pa' || locale === 'or') {
    const note = locale === 'pa'
      ? 'ਇਹ ਵੈੱਬਸਾਈਟ ਪੰਜਾਬੀ ਵਿੱਚ ਪੜ੍ਹ ਸਕਦੇ ਹੋ। ਐਪ ਵਿੱਚ ਪੰਜਾਬੀ ਵੌਇਸ ਚੋਣ ਅਜੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਹਿੰਦੀ, Hinglish ਜਾਂ ਹੋਰ ਸਮਰਥਿਤ ਭਾਸ਼ਾ ਚੁਣੋ।'
      : 'ଏହି ୱେବସାଇଟ୍ ଓଡ଼ିଆରେ ପଢ଼ିପାରିବେ। ଆପ୍‌ରେ ଓଡ଼ିଆ ଭଏସ୍ ବିକଳ୍ପ ଏବେ ଉପଲବ୍ଧ ନାହିଁ। ହିନ୍ଦୀ, Hinglish କିମ୍ବା ଅନ୍ୟ ସମର୍ଥିତ ଭାଷା ବାଛନ୍ତୁ।';
    acquisitionHtml = acquisitionHtml.replace('<div class="hero-actions"', `<p class="language-support-note">${note}</p><div class="hero-actions"`);
  }
  return refineLandingOpening(completeLandingSections(refineHomeSections(acquisitionHtml, locale), locale), locale).replace(
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
  return adaptLegal(page === 'privacy' ? applyPrivacyDisclosures(source, locale) : source, locale, page);
}
