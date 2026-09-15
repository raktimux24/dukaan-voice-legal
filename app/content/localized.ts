import { defaultLocale, type Locale, type PageKind, localizedPath, locales } from '../i18n';
import { homeHtml, proofSectionHtml } from './home';
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
  const languageLabel = getLocaleHomeSlots(locale)?.chromeLanguage ?? 'Language';
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
    <button class="language-button" type="button" data-language-button aria-haspopup="true" aria-expanded="false" aria-label="Select language">
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
    <div class="language-menu" data-language-menu role="menu" aria-label="Languages">
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
    .replaceAll('href="/" class="back"', `href="${home}" class="back"`);
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

  return transformed.replace(
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
