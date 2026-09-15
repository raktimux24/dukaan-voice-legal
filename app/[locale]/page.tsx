import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomeEffects } from '../components/HomeEffects';
import { JsonLd } from '../components/JsonLd';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { getLocalizedHtml } from '../content/localized';
import { getLocale, getLocaleMeta, isLocale, translatedLocales, type Locale } from '../i18n';
import { getLocaleSeo } from '../content/localeSeo';
import { defaultDescription, defaultTitle, organizationSchema, pageMetadata, softwareApplicationSchemaFor, websiteSchema } from '../seo';

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return translatedLocales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'en') notFound();

  const resolved = getLocale(locale);
  const localeSeo = getLocaleSeo(resolved);

  return pageMetadata({
    title: localeSeo?.title ?? defaultTitle,
    description: localeSeo?.description ?? defaultDescription,
    path: `/${locale}`,
    page: 'home',
    locale: resolved,
  });
}

export default async function LocalizedHomePage({ params }: LocaleParams) {
  const { locale: paramLocale } = await params;
  if (!isLocale(paramLocale) || paramLocale === 'en') notFound();

  const locale = getLocale(paramLocale);
  const localeMeta = getLocaleMeta(locale);

  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema, softwareApplicationSchemaFor(locale)]} />
      <div lang={localeMeta.hreflang} dangerouslySetInnerHTML={{ __html: getLocalizedHtml('home', locale as Locale) }} />
      <HomeEffects />
      <LanguageSelectEffects />
    </>
  );
}
