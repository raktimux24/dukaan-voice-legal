'use client';
import { SignInButton, useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppDownloadLinks } from '../../components/SubscriptionChrome';
import { getCheckoutStatus, type CheckoutConfirmation } from '../../lib/subscriptions';

type State = 'checking' | 'paid' | 'authorized' | 'pending' | 'failed';
export function ReturnClient() {
  const params = useSearchParams();
  const shopId = params.get('shopId') ?? '';
  const subscriptionId = params.get('razorpay_subscription_id') ?? '';
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<State>('checking');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    if (!isLoaded || !isSignedIn) return;
    setState('checking'); setMessage('');
    if (!shopId || !subscriptionId) { setState('failed'); setMessage('Checkout details are missing. Open your account to check subscription status.'); return; }
    let attempts = 0;
    const poll = async () => {
      try {
        const result: CheckoutConfirmation = await getCheckoutStatus(shopId, subscriptionId, await getToken());
        if (!active) return;
        setMessage('');
        if (result.state !== 'pending') { setState(result.state); return; }
      } catch (e) {
        if (!active) return;
        setMessage(e instanceof Error ? e.message : 'Unable to confirm checkout.');
      }
      if (!active) return;
      if (++attempts >= 20) { setState('pending'); return; }
      timer = setTimeout(poll, 1500);
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [getToken, isLoaded, isSignedIn, shopId, subscriptionId]);
  const account = `/account?${new URLSearchParams({ shopId })}`;
  const returnUrl = `/subscription/return?${new URLSearchParams({ shopId, razorpay_subscription_id: subscriptionId })}`;
  const title = { checking: 'Checking your subscription', paid: 'Payment confirmed', authorized: 'Payment method authorised', pending: 'Confirmation is still pending', failed: 'Subscription setup is not complete' }[state];
  const description = { checking: 'We are checking this checkout with Razorpay.', paid: 'Razorpay has confirmed a paid billing cycle. Your subscription status is updated.', authorized: 'Razorpay has authorised your payment method. This does not mean a subscription charge has completed. Your account shows your current access and billing dates.', pending: 'We have not confirmed authorization yet. Check your account before trying another payment.', failed: 'Open your account to review the status and available recovery options.' }[state];
  if (!isLoaded) return <div className="subscription-panel">Loading sign-in status…</div>;
  if (!isSignedIn) return <section className="subscription-section"><h1>Sign in to confirm your subscription</h1><p>Use the account that started checkout.</p><SignInButton mode="modal" forceRedirectUrl={returnUrl}><button className="subscription-button">Sign in</button></SignInButton></section>;
  return <section className="subscription-hero"><div><h1>{title}</h1><p className="subscription-lead">{description}</p>{message ? <div role="alert" className="subscription-alert">{message}</div> : null}<div className="portal-actions"><a className="subscription-button" href={`samaan-bol://subscription/return?${new URLSearchParams({ shopId, subscriptionId })}`}>Open in app</a><Link className="subscription-button secondary" href={account}>View account</Link></div></div><aside className="status-panel"><span className="status-badge">{state}</span><h3>Your subscription</h3><p>Manage billing and payment history from your account.</p><AppDownloadLinks /></aside></section>;
}
