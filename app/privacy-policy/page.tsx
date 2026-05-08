import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { getLocalizedHtml } from '../content/localized';
import { LegalEffects } from '../components/LegalEffects';
import { pageMetadata } from '../seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy — Samaan-Bol',
  description: 'Read the Samaan-Bol privacy policy for voice recordings, account data, inventory data, third-party services, storage, and account deletion.',
  path: '/privacy-policy',
  page: 'privacy',
  keywords: ['Samaan-Bol privacy policy', 'voice inventory app privacy', 'inventory app data privacy India'],
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <AmbientBackground />
      <main className="legal-page" lang="en-IN" dangerouslySetInnerHTML={{ __html: getLocalizedHtml('privacy', 'en') }} />
      <LegalEffects />
      <LanguageSelectEffects />
    </>
  );
}
