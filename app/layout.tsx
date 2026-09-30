import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Noto_Sans_Devanagari } from 'next/font/google';
import { headers } from 'next/headers';
import { Analytics } from './components/Analytics';
import { getLocaleMeta, isLocale } from './i18n';
import { defaultDescription, defaultTitle, pageMetadata } from './seo';
import './styles/home.css';
import './styles/legal-base.css';
import './styles/subscription.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const displayFont = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-display' });
const devanagari = Noto_Sans_Devanagari({ subsets: ['devanagari'], display: 'swap', variable: '--font-devanagari', preload: false });

export const metadata: Metadata = pageMetadata({
  title: defaultTitle,
  description: defaultDescription,
  path: '/',
});

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const localeHeader = (await headers()).get('x-locale') ?? 'en';
  const lang = getLocaleMeta(isLocale(localeHeader) ? localeHeader : 'en').hreflang;

  return (
    <html lang={lang} className={`${inter.variable} ${displayFont.variable} ${devanagari.variable}`}>
      <head>
        <meta httpEquiv="content-language" content={lang} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
