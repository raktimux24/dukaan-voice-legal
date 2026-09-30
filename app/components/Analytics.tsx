import Script from 'next/script';
import { StoreClickTracking } from './StoreClickTracking';

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
  if (!measurementId) return null;

  return (
    <>
      <StoreClickTracking />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
