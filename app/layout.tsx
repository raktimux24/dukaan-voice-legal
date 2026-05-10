import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { pageMetadata } from './seo';
import './styles/home.css';
import './styles/legal-base.css';
import './styles/subscription.css';

export const metadata: Metadata = pageMetadata({
  title: 'Samaan-Bol — Voice Inventory App for Indian Kirana Stores',
  description:
    'Voice-first AI inventory app for Indian kirana and retail shops. Speak in Hindi, English, or regional languages to manage stock, alerts, expiry, and buy lists.',
  path: '/',
});

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#FF6B00',
    colorBackground: '#15151C',
    colorInputBackground: '#1E1E26',
    colorText: '#EAEAE6',
    colorTextSecondary: '#8A8A90',
    colorInputText: '#EAEAE6',
    colorNeutral: '#EAEAE6',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    card: 'shadow-none',
    socialButtonsBlockButton: 'border-color: rgba(255,255,255,0.08)',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
