import { defaultLocale, type Locale, type PageKind, localizedPath, locales } from '../i18n';
import { homeHtml } from './home';
import { privacyHtml } from './privacy';
import { termsHtml } from './terms';
import { translatedHtml } from './translated';

type ContentPageKind = Extract<PageKind, 'home' | 'privacy' | 'terms'>;

const englishHtml: Record<ContentPageKind, string> = {
  home: homeHtml,
  privacy: privacyHtml,
  terms: termsHtml,
};

const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.samaan.bol';

export function languageSwitcher(locale: Locale, page: PageKind) {
  const currentLocale = locales.find((item) => item.code === locale) ?? locales[0];
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
        <span class="language-switcher-label">Language</span>
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

function activateGooglePlayBadge(html: string) {
  return html
    .replaceAll(
      '<a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">',
      `<a href="${googlePlayUrl}" class="store-badge">`,
    )
    .replace(
      /\n\s*<span style="position:absolute; top:-10px; right:-10px; background:var\(--saffron\); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">[\s\S]*?<\/span>/g,
      '',
    );
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

function stripRemovedNavItems(html: string) {
  return html
    .replace(/\s*<li><a href="#how">[^<]*<\/a><\/li>/g, '')
    .replace(/\s*<li><a href="#languages">[^<]*<\/a><\/li>/g, '');
}

function adaptHome(html: string, locale: Locale) {
  const switcher = languageSwitcher(locale, 'home');

  return stripRemovedNavItems(activateGooglePlayBadge(localizeLinks(html, locale))).replace(
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
  const source = locale === defaultLocale ? englishHtml[page] : translatedHtml[locale]?.[page] ?? englishHtml[page];

  if (page === 'home') return adaptHome(source, locale);
  return adaptLegal(source, locale, page);
}
