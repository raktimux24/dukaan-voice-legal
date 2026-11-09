'use client';
import { SignInButton, useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {useUtilityLanguage} from '../../components/shop/utility-language';
import {Glyph} from '../../components/shop/ui';
import '../../shop/shop.css';
import { getCheckoutStatus, type CheckoutConfirmation } from '../../lib/subscriptions';

type State = 'checking' | 'paid' | 'authorized' | 'pending' | 'failed';
export function ReturnClient() {
  const params = useSearchParams();
  const {language,t,select}=useUtilityLanguage();
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
    if (!shopId || !subscriptionId) { setState('failed'); setMessage('utility.missing'); return; }
    let attempts = 0;
    const poll = async () => {
      try {
        const result: CheckoutConfirmation = await getCheckoutStatus(shopId, subscriptionId, await getToken());
        if (!active) return;
        setMessage('');
        if (result.state !== 'pending') { setState(result.state); return; }
      } catch (e) {
        if (!active) return;
        setMessage('utility.error');
      }
      if (!active) return;
      if (++attempts >= 20) { setState('pending'); return; }
      timer = setTimeout(poll, 1500);
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [getToken, isLoaded, isSignedIn, shopId, subscriptionId]);
  const account = `/account?${new URLSearchParams({ shopId, lang:language })}`;
  const returnUrl = `/subscription/return?${new URLSearchParams({ shopId, razorpay_subscription_id: subscriptionId,lang:language })}`;
  return <main className="shop-root utility-root"><div className="shop-page utility-workspace">
    <header className="utility-top"><Link className="logo" href="/">Samaan<span>Bol</span></Link>{select}</header>
    <section className="shop-surface utility-status" aria-live="polite" aria-busy={!isLoaded||isSignedIn&&state==='checking'}>
      <span className="utility-symbol" aria-hidden="true"><Glyph name="shield"/></span>
      <h1 className="shop-title">{!isLoaded?t('common.loading'):!isSignedIn?t('utility.signIn'):t('utility.'+state)}</h1>
      <p className="shop-page-desc">{!isLoaded?'':!isSignedIn?t('utility.signInHelp'):t('utility.'+state+'Help')}</p>
      {message&&isSignedIn?<p role="alert" className="shop-notice">{t(message)}</p>:null}
      {isLoaded?isSignedIn?<div className="shop-actions"><Link className="shop-btn shop-btn-primary" href={account}>{t('utility.billing')}</Link><a className="shop-btn shop-btn-ghost" href={`samaan-bol://subscription/return?${new URLSearchParams({shopId,subscriptionId})}`}>{t('utility.openApp')}</a></div>:<SignInButton mode="modal" forceRedirectUrl={returnUrl}><button className="shop-btn shop-btn-primary">{t('utility.signIn')}</button></SignInButton>:null}
    </section>
  </div></main>;
}
