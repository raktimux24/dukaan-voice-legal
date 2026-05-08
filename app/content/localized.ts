import { defaultLocale, type Locale, type PageKind, localizedPath, locales } from '../i18n';
import { homeHtml } from './home';
import { privacyHtml } from './privacy';
import { termsHtml } from './terms';
import { translatedHtml } from './translated';

const englishHtml: Record<PageKind, string> = {
  home: homeHtml,
  privacy: privacyHtml,
  terms: termsHtml,
};

function languageSwitcher(locale: Locale, page: PageKind) {
  const options = locales
    .map((item) => {
      const selected = item.code === locale ? ' selected' : '';
      return `<option value="${localizedPath(item.code, page)}"${selected}>${item.nativeLabel}</option>`;
    })
    .join('');

  return `<label class="language-switcher" aria-label="Select language">
    <span class="language-switcher-label">Language</span>
    <select class="language-select" data-language-select>${options}</select>
  </label>`;
}

function localizeLinks(html: string, locale: Locale) {
  const home = localizedPath(locale, 'home');
  const privacy = localizedPath(locale, 'privacy');
  const terms = localizedPath(locale, 'terms');

  return html
    .replaceAll('href="/privacy-policy"', `href="${privacy}"`)
    .replaceAll('href="/terms-of-service"', `href="${terms}"`)
    .replaceAll('href="/" class="back"', `href="${home}" class="back"`);
}

function adaptHome(html: string, locale: Locale) {
  const switcher = languageSwitcher(locale, 'home');

  return localizeLinks(html, locale).replace(
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

export function getLocalizedHtml(page: PageKind, locale: Locale) {
  const source = locale === defaultLocale ? englishHtml[page] : translatedHtml[locale]?.[page] ?? englishHtml[page];

  if (page === 'home') return adaptHome(source, locale);
  return adaptLegal(source, locale, page);
}
