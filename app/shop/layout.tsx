import type { Metadata } from 'next';
import { ShopProviders } from '../components/shop/providers';
import './shop.css';

export const metadata: Metadata = {
  title: 'Shop — Samaan Bol',
  robots: { index: false, follow: false },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopProviders>{children}</ShopProviders>;
}
