import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Analytics } from './components/Analytics';
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
    colorPrimaryForeground: '#FFFFFF',
    colorBackground: '#15151C',
    colorForeground: '#EAEAE6',
    colorMutedForeground: '#A8A8AE',
    colorInput: '#1E1E26',
    colorInputForeground: '#EAEAE6',
    colorNeutral: '#EAEAE6',
    colorRing: 'rgba(255, 107, 0, 0.42)',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    socialButtonsBlockButton: { color: '#EAEAE6' },
    socialButtonsBlockButtonText: { color: '#EAEAE6' },
    formFieldLabel: { color: '#EAEAE6' },
    dividerText: { color: '#A8A8AE' },
    footerActionText: { color: '#A8A8AE' },
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
        <body>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
