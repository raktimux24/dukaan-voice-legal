import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AmbientBackground } from '../../components/AmbientBackground';
import { LanguageSelectEffects } from '../../components/LanguageSelectEffects';
import { LegalEffects } from '../../components/LegalEffects';
import { getLocalizedHtml } from '../../content/localized';
import { getLocale, getLocaleMeta, isLocale, localizedPath, translatedLocales } from '../../i18n';
import { pageMetadata } from '../../seo';

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  const resolvedLocale = getLocale(locale);

  return pageMetadata({
    title: 'Privacy Policy — Samaan-Bol',
    description:
      'Read the Samaan-Bol privacy policy for voice recordings, account data, inventory data, third-party services, storage, and account deletion.',
    path: localizedPath(resolvedLocale, 'privacy'),
    page: 'privacy',
    locale: resolvedLocale,
    keywords: ['Samaan-Bol privacy policy', 'voice inventory app privacy', 'inventory app data privacy India'],
  });
}

export default async function LocalizedPrivacyPolicyPage({ params }: LocaleParams) {
  const { locale: paramLocale } = await params;
  if (!isLocale(paramLocale) || paramLocale === 'en') notFound();

  const locale = getLocale(paramLocale);
  const localeMeta = getLocaleMeta(locale);

  return (
    <>
      <AmbientBackground />
      <main className="legal-page" lang={localeMeta.hreflang} dangerouslySetInnerHTML={{ __html: getLocalizedHtml('privacy', locale) }} />
      <LegalEffects />
      <LanguageSelectEffects />
    </>
  );
}
