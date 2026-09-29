import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { HomeEffects } from '../components/HomeEffects';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { LaptopArticle } from '../components/LaptopArticle';
import { SubscriptionFooter, SubscriptionNav } from '../components/SubscriptionChrome';
import { getLaptopCopy } from '../content/laptopPage';
import { pageMetadata } from '../seo';

const copy = getLaptopCopy('en');

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/billing-on-a-laptop',
  page: 'laptop',
  keywords: ['kirana billing on a laptop', 'browser billing for a shop', 'web billing app kirana', 'scan barcode on laptop shop'],
});

export default function LaptopBillingPage() {
  return (
    <div className="subscription-shell">
      <AmbientBackground />
      <SubscriptionNav locale="en" page="laptop" />
      <LaptopArticle locale="en" />
      <SubscriptionFooter locale="en" page="laptop" />
      <HomeEffects />
      <LanguageSelectEffects />
    </div>
  );
}
