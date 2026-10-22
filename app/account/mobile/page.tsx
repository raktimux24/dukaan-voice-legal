import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountClient } from '../AccountClient';

export const metadata: Metadata = {
  title: 'Account management — Samaan Bol',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

// Native companion entry point: no checkout script, purchase navigation,
// marketing chrome or plan-change controls. The ordinary web portal remains
// available to customers who visit the website independently.
export default function MobileAccountPage() {
  return (
    <div className="subscription-shell">
      <main className="subscription-main">
        <Suspense fallback={<p role="status">Loading account…</p>}>
          <AccountClient managementOnly />
        </Suspense>
      </main>
    </div>
  );
}
