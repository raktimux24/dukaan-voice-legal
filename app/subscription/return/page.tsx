import type { Metadata } from 'next';
import { Suspense } from 'react';
import { pageMetadata } from '../../seo';
import { ReturnClient } from './ReturnClient';

export const metadata: Metadata = pageMetadata({
  title: 'Subscription Return — Samaan-Bol',
  description: 'Confirm your Samaan-Bol Razorpay subscription and return to the app.',
  path: '/subscription/return',
  page: 'subscriptionReturn',
  noIndex: true,
  languageAlternates: false,
});

export default function SubscriptionReturnPage() {
  return <Suspense><ReturnClient /></Suspense>;
}
