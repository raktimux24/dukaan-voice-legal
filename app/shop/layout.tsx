import type { Metadata } from 'next';
import { ShopProviders } from '../components/shop/providers';
import './shop.css';
import './styles/fixes-shell.css';
import './styles/fixes-selling.css';
import './styles/fixes-stock.css';
import './styles/fixes-money.css';
import './styles/fixes-settings.css';
import { AuthProvider } from '../components/AuthProvider';

export const metadata: Metadata = {
  title: 'Shop — Samaan Bol',
  robots: { index: false, follow: false },
};

export default function ShopLayout({ children, voice }: { children: React.ReactNode; voice: React.ReactNode }) {
  return <AuthProvider><ShopProviders>{children}{voice}</ShopProviders></AuthProvider>;
}
