import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { LanguageSelectEffects } from '../components/LanguageSelectEffects';
import { getLocalizedHtml } from '../content/localized';
import { LegalEffects } from '../components/LegalEffects';
import { pageMetadata } from '../seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service — Samaan-Bol',
  description: 'Read the Samaan-Bol terms of service for account registration, voice input, user roles, acceptable use, service availability, and your data.',
  path: '/terms-of-service',
  page: 'terms',
  keywords: ['Samaan-Bol terms of service', 'voice inventory app terms', 'inventory app acceptable use'],
});

export default function TermsOfServicePage() {
  return (
    <>
      <AmbientBackground />
      <main className="legal-page" lang="en-IN" dangerouslySetInnerHTML={{ __html: getLocalizedHtml('terms', 'en') }} />
      <LegalEffects />
      <LanguageSelectEffects />
    </>
  );
}
