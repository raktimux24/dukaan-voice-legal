import type { Metadata } from 'next';
import { AmbientBackground } from '../components/AmbientBackground';
import { termsHtml } from '../content/terms';
import { LegalEffects } from '../components/LegalEffects';
import { pageMetadata } from '../seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service — Samaan-Bol',
  description: 'Read the Samaan-Bol terms of service for account registration, voice input, user roles, acceptable use, service availability, and your data.',
  path: '/terms-of-service',
  keywords: ['Samaan-Bol terms of service', 'voice inventory app terms', 'inventory app acceptable use'],
});

export default function TermsOfServicePage() {
  return (
    <>
      <AmbientBackground />
      <main className="legal-page" dangerouslySetInnerHTML={{ __html: termsHtml }} />
      <LegalEffects />
    </>
  );
}
