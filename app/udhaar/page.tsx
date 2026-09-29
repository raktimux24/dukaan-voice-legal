import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { HomeEffects } from '../components/HomeEffects';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { SubscriptionFooter, SubscriptionNav } from '../components/SubscriptionChrome';
import { UdhaarArticle } from '../components/UdhaarArticle';
import { getUdhaarCopy } from '../content/udhaarPage';
import { bilingualLanguageAlternates } from '../i18n';
import { pageMetadata } from '../seo';

const copy = getUdhaarCopy('en');

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/udhaar',
  page: 'udhaar',
  keywords: ['udhaar on the bill', 'udhaar app for kirana', 'record udhaar on bill', 'customer udhaar kirana'],
  languages: bilingualLanguageAlternates('udhaar'),
});

export default function UdhaarPage() {
  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale="en" page="udhaar" />
      <UdhaarArticle locale="en" />
      <SubscriptionFooter locale="en" page="udhaar" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
