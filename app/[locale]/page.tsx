import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomeEffects } from '../components/HomeEffects';
import { JsonLd } from '../components/JsonLd';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { getLocalizedHtml } from '../content/localized';
import { getLocale, getLocaleMeta, isLocale, translatedLocales, type Locale } from '../i18n';
import { defaultDescription, defaultTitle, organizationSchema, pageMetadata, softwareApplicationSchema, websiteSchema } from '../seo';

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  return pageMetadata({
    title: defaultTitle,
    description: defaultDescription,
    path: `/${locale}`,
    page: 'home',
    locale: getLocale(locale),
  });
}

export default async function LocalizedHomePage({ params }: LocaleParams) {
  const { locale: paramLocale } = await params;
  if (!isLocale(paramLocale) || paramLocale === 'en') notFound();

  const locale = getLocale(paramLocale);
  const localeMeta = getLocaleMeta(locale);

  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema, softwareApplicationSchema]} />
      <div lang={localeMeta.hreflang} dangerouslySetInnerHTML={{ __html: getLocalizedHtml('home', locale as Locale) }} />
      <HomeEffects />
      <LanguageSelectEffects />
    </>
  );
}
