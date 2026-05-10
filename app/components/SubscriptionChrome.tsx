import Link from 'next/link';
import { defaultLocale, type Locale, type PageKind, localizedPath } from '../i18n';
import { getSubscriptionStrings } from '../content/subscriptionStrings';
import { languageSwitcher } from '../content/localized';
import { appStoreUrl } from '../seo';

export const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.samaan.bol';
export const appStoreLinkUrl = 'https://apps.apple.com/in/app/samaan-bol/id6759739444';
export const supportEmail = 'meetslimshady07@gmail.com';

const stencilSvg = (id: string) =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="${id}"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#${id})"/></svg>`;

type ChromeProps = { locale?: Locale; page: PageKind };

export function SubscriptionNav({ locale = defaultLocale, page }: ChromeProps) {
  const t = getSubscriptionStrings(locale);
  const home = localizedPath(locale, 'home');
  const pricingHref = localizedPath(locale, 'pricing');
  const accountHref = localizedPath(locale, 'account');
  const switcherHtml = languageSwitcher(locale, page);

  return (
    <nav id="nav">
      <div className="container">
        <div className="nav-inner">
          <Link href={home} className="logo">
            <div className="logo-mark" dangerouslySetInnerHTML={{ __html: stencilSvg('stencil-sub-nav') }} />
            <div className="logo-text">
              Samaan<span>Bol</span>
            </div>
          </Link>
          <ul className="nav-links">
            <li>
              <a href={`${home}#features`}>{t.nav.features}</a>
            </li>
            <li>
              <a href={`${home}#ai`}>{t.nav.ai}</a>
            </li>
            <li>
              <Link href={pricingHref}>{t.nav.pricing}</Link>
            </li>
            <li>
              <Link href={accountHref}>{t.nav.account}</Link>
            </li>
            <li>
              <a href={appStoreLinkUrl} className="nav-cta">
                {t.nav.download}
              </a>
            </li>
          </ul>
          <span dangerouslySetInnerHTML={{ __html: switcherHtml }} />
          <button type="button" className="mobile-menu-btn" aria-label="Menu">
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}

export function SubscriptionFooter({ locale = defaultLocale, page }: ChromeProps) {
  const t = getSubscriptionStrings(locale);
  const home = localizedPath(locale, 'home');
  const pricingHref = localizedPath(locale, 'pricing');
  const accountHref = localizedPath(locale, 'account');
  const contactHref = localizedPath(locale, 'contact');
  const refundHref = localizedPath(locale, 'refund');
  const privacyHref = localizedPath(locale, 'privacy');
  const termsHref = localizedPath(locale, 'terms');
  void page;

  const homeAnchor = (anchor: string) => `${home}#${anchor}`;

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href={home} className="logo">
              <div className="logo-mark" dangerouslySetInnerHTML={{ __html: stencilSvg('stencil-sub-footer') }} />
              <div className="logo-text">
                Samaan<span>Bol</span>
              </div>
            </Link>
            <p>{t.brand.tagline}</p>
          </div>
          <div className="footer-col">
            <h4>{t.footer.product}</h4>
            <ul>
              <li>
                <a href={homeAnchor('features')}>{t.footer.features}</a>
              </li>
              <li>
                <a href={homeAnchor('ai')}>{t.footer.ai}</a>
              </li>
              <li>
                <Link href={pricingHref}>{t.footer.pricing}</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t.footer.company}</h4>
            <ul>
              <li>
                <a href="#">{t.footer.about}</a>
              </li>
              <li>
                <a href="#">{t.footer.blog}</a>
              </li>
              <li>
                <a href="#">{t.footer.careers}</a>
              </li>
              <li>
                <Link href={contactHref}>{t.footer.contact}</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t.footer.support}</h4>
            <ul>
              <li>
                <Link href={accountHref}>{t.footer.account}</Link>
              </li>
              <li>
                <Link href={refundHref}>{t.footer.refund}</Link>
              </li>
              <li>
                <Link href={privacyHref}>{t.footer.privacy}</Link>
              </li>
              <li>
                <Link href={termsHref}>{t.footer.terms}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t.footer.copyright}</span>
          <span className="made-in-india">Made with ♥ in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}

export function AppDownloadLinks() {
  return (
    <div className="app-download-links">
      <a href={appStoreUrl}>App Store</a>
      <a href={googlePlayUrl}>Google Play</a>
    </div>
  );
}
