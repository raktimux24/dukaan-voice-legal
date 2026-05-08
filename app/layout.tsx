import type { Metadata } from 'next';
import { pageMetadata } from './seo';
import './styles/home.css';
import './styles/legal-base.css';

export const metadata: Metadata = pageMetadata({
  title: 'Samaan-Bol — Voice Inventory App for Indian Kirana Stores',
  description:
    'Voice-first AI inventory app for Indian kirana and retail shops. Speak in Hindi, English, or regional languages to manage stock, alerts, expiry, and buy lists.',
  path: '/',
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
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
  );
}
