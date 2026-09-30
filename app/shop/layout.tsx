import type { Metadata } from 'next';
import { ShopProviders } from '../components/shop/providers';
import './shop.css';
import { AuthProvider } from '../components/AuthProvider';

export const metadata: Metadata = {
  title: 'Shop — Samaan Bol',
  robots: { index: false, follow: false },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><ShopProviders>{children}</ShopProviders></AuthProvider>;
}
