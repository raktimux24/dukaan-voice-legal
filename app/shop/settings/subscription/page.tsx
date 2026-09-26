import Script from 'next/script';
import { Suspense } from 'react';
import { SubscriptionScreen } from '../../../components/shop/screens/subscription';

export default function SubscriptionPage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Suspense fallback={null}>
        <SubscriptionScreen />
      </Suspense>
    </>
  );
}
