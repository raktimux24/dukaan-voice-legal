'use client';

import { SignInButton, useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppDownloadLinks } from '../../components/SubscriptionChrome';
import { getEntitlement, type SubscriptionEntitlement } from '../../lib/subscriptions';

type ReturnState = 'checking' | 'success' | 'pending' | 'failed';

export function ReturnClient() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId') ?? '';
  const razorpaySubscriptionId = searchParams.get('razorpay_subscription_id') ?? '';
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<ReturnState>('checking');
  const [entitlement, setEntitlement] = useState<SubscriptionEntitlement>();
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    if (!isLoaded || !isSignedIn) return;
    if (!shopId) {
      setState('failed');
      setMessage('Missing shopId. Open account management to confirm your subscription.');
      return;
    }

    async function poll() {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const token = await getToken();
          const response = await getEntitlement(shopId, token);
          if (!active) return;
          setEntitlement(response);
          if (response.status === 'active' || response.status === 'trialing') {
            setState('success');
            return;
          }
        } catch (err) {
          if (active) setMessage(err instanceof Error ? err.message : 'Unable to confirm subscription.');
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (active) setState('pending');
    }

    poll();
    return () => {
      active = false;
    };
  }, [getToken, isLoaded, isSignedIn, shopId]);

  function openApp() {
    window.location.href = 'samaan-bol://subscription/return';
  }

  return (
    <>
      {!isLoaded ? <div className="subscription-panel">Loading sign-in status...</div> : null}

      {isLoaded && !isSignedIn ? (
        <section className="subscription-section">
          <h1>Sign in to confirm your subscription</h1>
          <p className="subscription-lead">Use the same account you used to start Razorpay checkout.</p>
          <div className="portal-actions">
            <SignInButton mode="modal">
              <button className="subscription-button" type="button">
                Sign in
              </button>
            </SignInButton>
            <Link className="subscription-button secondary" href="/account">
              Open account
            </Link>
          </div>
        </section>
      ) : null}

      {isLoaded && isSignedIn ? (
        <section className="subscription-hero">
          <div>
            {state === 'success' ? <h1>Subscription active</h1> : null}
            {state === 'checking' ? <h1>Setting up your subscription</h1> : null}
            {state === 'pending' ? <h1>Payment is still being confirmed</h1> : null}
            {state === 'failed' ? <h1>We could not confirm this subscription</h1> : null}
            <p className="subscription-lead">
              {state === 'success'
                ? 'Razorpay has confirmed your subscription. Open Samaan-Bol and refresh your shop to unlock Premium.'
                : 'Webhook confirmation can take a short moment after Razorpay redirects back to Samaan-Bol.'}
            </p>
            {message ? <div className="subscription-alert">{message}</div> : null}
            <div className="portal-actions">
              <button className="subscription-button" type="button" onClick={openApp}>
                Open in app
              </button>
              <Link className="subscription-button secondary" href={`/account${shopId ? `?shopId=${shopId}` : ''}`}>
                View account
              </Link>
              {state === 'failed' ? (
                <Link className="subscription-button secondary" href="/pricing">
                  Try again
                </Link>
              ) : null}
            </div>
          </div>
          <aside className="status-panel">
            <span className={state === 'pending' ? 'status-badge warning' : 'status-badge'}>{state}</span>
            <h3>Checkout details</h3>
            <p className="muted">Shop ID: {shopId || 'Not provided'}</p>
            <p className="muted">Razorpay subscription: {razorpaySubscriptionId || 'Waiting for Razorpay'}</p>
            <p className="muted">Current status: {entitlement?.status ?? 'Checking'}</p>
            <AppDownloadLinks />
          </aside>
        </section>
      ) : null}
    </>
  );
}
