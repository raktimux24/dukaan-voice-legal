'use client';

import { billingActions, billingDate, invoiceHref } from '../lib/shop/billing';
import { billingCopy, billingAccountCopy, hinglishBilling, type BillingTranslate } from '../lib/shop/billing-copy';
import retentionCopy from '../content/retention-locales.json';
import { SignIn, UserButton, useAuth, useClerk, useSignIn, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defaultLocale, type Locale, localizedPath } from '../i18n';
import { getSubscriptionStrings, type SubscriptionStrings } from '../content/subscriptionStrings';
import { getAccountStrings, type AccountStrings } from '../content/accountStrings';
import {
  cancelPlanSwitch,
  cancelSubscription,
  changePlan,
  createCheckout,
  getEntitlement,
  getInvoices,
  verifyCheckout,
  type Invoice,
  getPendingSwitch,
  getShops,
  hasMandate,
  planCopy,
  updatePaymentMethod,
  type BillingPlan,
  type CheckoutResponse,
  type Shop,
  type SubscriptionEntitlement,
} from '../lib/subscriptions';

type RazorpayHandlerArgs = {
  razorpay_payment_id?: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};
type RazorpayFailedResponse = {
  error?: { description?: string; reason?: string; code?: string };
};
type RazorpayOptions = {
  key?: string;
  subscription_id?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler?: (args: RazorpayHandlerArgs) => void;
  modal?: { ondismiss?: () => void };
};
type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailedResponse) => void) => void;
};
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;
declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function planLabel(plan: BillingPlan | null | undefined, t: SubscriptionStrings) {
  return plan === 'annual' ? t.plans.annualLabel : t.plans.monthlyLabel;
}

// One place that decides what the status panel says for every entitlement
// state, so the badge and the lead line can't disagree.
function describe(ent: SubscriptionEntitlement | undefined, t: SubscriptionStrings, a: AccountStrings, date: (value: string | null | undefined) => string, b: ReturnType<typeof billingCopy>) {
  if (!ent) return { badge: t.account.statusLoading, lead: '', warning: false };
  const mandate = hasMandate(ent);
  const trialEnd = date(ent.trialEnd);
  const periodEnd = date(ent.currentPeriodEnd);

  switch (ent.status) {
    case 'legacy_free':
      return { badge: t.account.statusLegacyFree, lead: a.leadLegacyFree, warning: false };
    case 'trialing':
      if (ent.cancelAtPeriodEnd) {
        return { badge: a.statusCancelScheduled, lead: a.leadTrialCancelled(trialEnd), warning: false };
      }
      if (!mandate) {
        return { badge: a.statusTrialAuto(ent.daysLeftInTrial ?? 0), lead: a.leadTrialAuto(trialEnd), warning: false };
      }
      return {
        badge: a.statusTrialMandate(trialEnd),
        lead: a.leadTrialMandate(planLabel(ent.plan, t), trialEnd),
        warning: false,
      };
    case 'active':
      if (ent.cancelAtPeriodEnd) {
        return { badge: a.statusCancelScheduled, lead: a.leadCancelScheduled(periodEnd), warning: false };
      }
      return { badge: t.account.statusActive(planLabel(ent.plan, t)), lead: a.leadActive(periodEnd), warning: false };
    case 'past_due':
      return { badge: t.account.statusPastDue, lead: a.leadPastDue, warning: true };
    case 'pending_authentication':
      if (mandate) return { badge: b('authorized'), lead: b('authorized_body'), warning: false };
      return { badge: a.statusPendingAuth, lead: a.leadPendingAuth, warning: true };
    case 'expired':
      return { badge: a.statusExpired, lead: a.leadExpired, warning: false };
    case 'canceled':
      return { badge: t.account.statusCanceled, lead: a.leadCanceled, warning: false };
    default:
      return { badge: t.account.statusNone, lead: a.leadNone(ent.trialDays ?? 7), warning: false };
  }
}

export function AccountDashboard({
  locale,
  lockedShopId,
  embedded = false,
  managementOnly = false,
  language = locale, translate, onSignOut,
}: {
  locale: Locale;
  lockedShopId?: string;
  embedded?: boolean;
  managementOnly?: boolean;
  language?: string;
  translate?: BillingTranslate;
  onSignOut?: () => Promise<void>;
}) {
  const t = language === 'hinglish' ? hinglishBilling(getSubscriptionStrings(locale)) : getSubscriptionStrings(locale);
  const b = billingCopy(language, translate);
  const a = embedded ? billingAccountCopy(getAccountStrings(locale), b, t) : getAccountStrings(locale);
  const date = (value: string | null | undefined) => billingDate(value, language, t.account.dateUnavailable);
  const refreshLabel = b('refresh');
  const amount = (plan: BillingPlan) => planCopy[plan].price + b(plan === 'annual' ? 'price_year' : 'price_month');
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') === 'monthly' ? 'monthly' : 'annual';
  const requestedShopId = lockedShopId || searchParams.get('shopId') || '';
  const { getToken } = useAuth();
  const { user } = useUser();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [plan, setPlan] = useState<BillingPlan>(initialPlan);
  const [entitlement, setEntitlement] = useState<SubscriptionEntitlement>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceError, setInvoiceError] = useState('');
  const [loadedInvoiceScope, setLoadedInvoiceScope] = useState('');
  const invoiceScope = `${user?.id ?? ''}:${selectedShopId}`;
  const [refreshTick, setRefreshTick] = useState(0);
  const [confirmation, setConfirmation] = useState<'cancel' | 'switch' | null>(null);
  const confirmationDialog = useRef<HTMLDialogElement>(null);
  const confirmationTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const dialog = confirmationDialog.current;
    if (confirmation && dialog && !dialog.open) dialog.showModal();
    else if (!confirmation && dialog?.open) dialog.close();
    return () => { if (dialog?.open) dialog.close(); confirmationTrigger.current?.focus(); };
  }, [confirmation]);
  const alive = useRef(true);
  const operationLock = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const planInitialized = useRef('');
  const activeShop = useRef(selectedShopId);
  activeShop.current = selectedShopId;

  const selectedShop = useMemo(() => shops.find((shop) => shop.id === selectedShopId), [selectedShopId, shops]);
  const isOwner =
    selectedShop?.role?.toUpperCase() === 'OWNER' ||
    (!!user?.id && !!selectedShop?.ownerId && selectedShop.ownerId === user.id);
  const { signOut } = useClerk();
  const roleLabel = selectedShop?.role
    ? translate?.('role.' + selectedShop.role.toLowerCase(), selectedShop.role) ?? selectedShop.role.charAt(0).toUpperCase() + selectedShop.role.slice(1).toLowerCase()
    : t.account.shopRoleFallback;

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const token = await getToken();
        const response = await getShops(token);
        if (!active) return;
        setShops(response.shops);
        setSelectedShopId((current) => {
          if (lockedShopId) return response.shops.some((shop) => shop.id === lockedShopId) ? lockedShopId : '';
          return current || response.shops.find((shop) => shop.id === requestedShopId)?.id || response.shops[0]?.id || '';
        });
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : t.account.errorLoadShops);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [getToken, lockedShopId, requestedShopId, t.account.errorLoadShops, refreshTick]);

  const reloadEntitlement = useCallback(async () => {
    if (!selectedShopId) return;
    const token = await getToken();
    const response = await getEntitlement(selectedShopId, token, isOwner);
    if (!alive.current || activeShop.current !== selectedShopId) return;
    setEntitlement(response);
    if (planInitialized.current !== selectedShopId) {
      setPlan(response.needsAuthorization && response.plan ? response.plan : initialPlan);
      planInitialized.current = selectedShopId;
    }
    return response;
  }, [getToken, selectedShopId, initialPlan, isOwner]);

  useEffect(() => {
    let active = true;
    if (!selectedShopId) return;
    setEntitlement(undefined);
    setNotice('');
    setError('');
    reloadEntitlement().catch((err) => {
      if (active) setError(err instanceof Error ? err.message : t.account.errorLoadEntitlement);
    });
    return () => {
      active = false;
    };
  }, [reloadEntitlement, selectedShopId, t.account.errorLoadEntitlement]);

  useEffect(() => {
    let active = true;
    setInvoices([]);
    setInvoiceError('');
    setLoadedInvoiceScope('');
    if (isOwner && selectedShopId) {
      getToken().then(token => getInvoices(selectedShopId, token)).then(result => {
        if (active) { setInvoices(result.invoices); setLoadedInvoiceScope(invoiceScope); }
      }).catch(() => { if (active) { setInvoiceError(b('history_error')); setLoadedInvoiceScope(invoiceScope); } });
    }
    return () => { active = false; };
  }, [getToken, isOwner, selectedShopId, entitlement?.currentPeriodEnd, invoiceScope, refreshTick]);

  const status = entitlement?.status;
  const mandate = hasMandate(entitlement);
  const isTrial = status === 'trialing';
  const actions = billingActions(error ? undefined : entitlement, isOwner, managementOnly);
  const canSubscribe = actions.subscribe, canManage = actions.manage, canCancel = actions.cancel;
  const temporaryAccessOnly = entitlement?.temporaryPremium && !mandate && entitlement.status !== 'legacy_free' && !(entitlement.status === 'active' && entitlement.currentPeriodEnd && Date.parse(entitlement.currentPeriodEnd) > Date.now());
  const { badge, lead, warning } = describe(entitlement, t, a, date, b);
  const operationScope = useRef('');
  operationScope.current = `${user?.id ?? ''}:${selectedShopId}`;
  const startOperation = () => {
    if (operationLock.current || !isOwner || !selectedShopId) return null;
    operationLock.current = true;
    const scope = operationScope.current;
    return () => alive.current && operationScope.current === scope;
  };
  const finishOperation = () => { operationLock.current = false; if (alive.current) setBusy(''); };
  async function refreshBilling() {
    if (operationLock.current) return;
    operationLock.current = true; setBusy('refresh'); setError('');
    try { await reloadEntitlement(); }
    catch { if (alive.current) setError(b('request_error')); }
    finally { if (alive.current) setRefreshTick(n => n + 1); finishOperation(); }
  }

  // UPI Autopay authorisation uses Razorpay Standard Checkout (subscription_id),
  // not the rzp.io short_url — that hosted page is not enabled on this merchant.
  function openRazorpayCheckout(opts: {
    checkout: CheckoutResponse;
    description: string;
    onDone: () => void;
    onSuccess: (args: RazorpayHandlerArgs) => void;
  }) {
    const { checkout, description, onDone, onSuccess } = opts;
    const checkoutScope = operationScope.current;
    const current = () => alive.current && operationScope.current === checkoutScope;

    if (typeof window === 'undefined' || !window.Razorpay) {
      throw new Error(t.account.errorRazorpayNotLoaded);
    }
    if (!checkout.subscriptionId || !checkout.keyId) {
      throw new Error(t.account.errorCheckoutMissingId);
    }

    let confirming = false;
    const rzp = new window.Razorpay({
      key: checkout.keyId,
      subscription_id: checkout.subscriptionId,
      name: 'Samaan-Bol',
      description,
      prefill: {
        name: user?.fullName ?? undefined,
        email: user?.primaryEmailAddress?.emailAddress ?? undefined,
      },
      theme: { color: '#FF6B00' },
      handler: async (args) => {
        if (!current() || confirming) return;
        confirming = true;
        try {
          if (args.razorpay_subscription_id !== checkout.subscriptionId || !args.razorpay_payment_id) throw new Error('Checkout details did not match. Please refresh your subscription status.');
          const token = await getToken();
          if (!current()) return;
          await verifyCheckout(selectedShopId, checkout.subscriptionId!, args.razorpay_payment_id, args.razorpay_signature, token);
          if (current()) onSuccess(args);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Payment confirmation is pending. Please refresh before retrying.');
          onDone();
        }
      },
      modal: {
        ondismiss: () => { if (current() && !confirming) onDone(); },
      },
    });

    rzp.on('payment.failed', (response) => {
      if (!current()) return;
      setError(response.error?.description || t.account.errorStartCheckout);
      onDone();
    });

    rzp.open();
  }

  function goToReturnPage(razorpaySubscriptionId: string) {
    const query = new URLSearchParams({ shopId: selectedShopId, razorpay_subscription_id: razorpaySubscriptionId });
    window.location.href = `/subscription/return?${query}`;
  }

  async function startCheckout() {
    if (!canSubscribe) return;
    const current = startOperation(); if (!current) return;
    setBusy('checkout');
    setError('');
    try {
      const token = await getToken();
      if (!current()) { finishOperation(); return; }
      const checkout = await createCheckout(selectedShopId, plan, token);
      if (!current()) { finishOperation(); return; }
      openRazorpayCheckout({
        checkout,
        description: (checkout.plan ?? plan) === 'annual' ? t.plans.annualDescription : t.plans.monthlyDescription,
        onDone: () => { finishOperation(); reloadEntitlement().catch(() => {}); },
        onSuccess: (resp) => { if (current()) goToReturnPage(resp.razorpay_subscription_id); },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.errorStartCheckout);
      finishOperation();
    }
  }

  // Plan switch and payment-method refresh both schedule a replacement
  // subscription that takes over at the end of the current period. Whether
  // the user finishes or dismisses Razorpay, the pending card below reflects
  // where things stand — so just reload the entitlement either way.
  async function scheduleChange(kind: 'switch-plan' | 'payment-method', nextPlan?: BillingPlan) {
    if (!canManage) return;
    const current = startOperation(); if (!current) return;
    setBusy(kind);
    setError('');
    setNotice('');
    try {
      const token = await getToken();
      if (!current()) { finishOperation(); return; }
      const result =
        kind === 'switch-plan' && nextPlan
          ? await changePlan(selectedShopId, nextPlan, token)
          : await updatePaymentMethod(selectedShopId, token);
      if (!current()) { finishOperation(); return; }
      const description =
        kind === 'switch-plan'
          ? nextPlan === 'annual'
            ? t.plans.annualDescription
            : t.plans.monthlyDescription
          : t.account.updatePaymentMethod;
      const finish = () => {
        finishOperation();
        reloadEntitlement().catch(() => {});
      };
      openRazorpayCheckout({ checkout: result, description, onDone: finish, onSuccess: finish });
    } catch (err) {
      setError(err instanceof Error ? err.message : kind === 'switch-plan' ? t.account.errorSwitchPlan : t.account.errorPaymentMethod);
      finishOperation();
      reloadEntitlement().catch(() => {});
    }
  }

  async function resumePendingAuthorisation() {
    if (!actions.pending || managementOnly) return;
    const current = startOperation(); if (!current) return;
    setBusy('pending-auth');
    setError('');
    try {
      const token = await getToken();
      if (!current()) { finishOperation(); return; }
      const pending = await getPendingSwitch(selectedShopId, token);
      const finish = () => {
        finishOperation();
        reloadEntitlement().catch(() => {});
      };
      if (!current()) { finishOperation(); return; }
      openRazorpayCheckout({
        checkout: { shortUrl: pending.shortUrl ?? '', subscriptionId: pending.subscriptionId, keyId: pending.keyId },
        description: pending.reason === 'payment_method' ? t.account.updatePaymentMethod : planLabel(pending.plan, t),
        onDone: finish,
        onSuccess: finish,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : a.errorPendingSwitch);
      finishOperation();
    }
  }

  async function dropPendingSwitch() {
    if (!actions.pending || operationLock.current || !selectedShopId) return;
    const current = startOperation(); if (!current) return;
    setBusy('cancel-switch');
    setError('');
    try {
      const token = await getToken();
      if (!current()) { finishOperation(); return; }
      const response = await cancelPlanSwitch(selectedShopId, token);
      if (!current()) return;
      setEntitlement(response);
      setNotice(response.pendingReason ? b('sync_pending') : a.pendingCancelled);
    } catch (err) {
      setError(err instanceof Error ? err.message : a.errorPendingSwitch);
    } finally {
      finishOperation();
    }
  }

  async function cancel() {
    if (!canCancel || operationLock.current || !selectedShopId || !entitlement) return;
    const until = date(isTrial ? entitlement.trialEnd : entitlement.currentPeriodEnd);

    const current = startOperation(); if (!current) return;
    setBusy('cancel');
    setError('');
    try {
      const token = await getToken();
      if (!current()) { finishOperation(); return; }
      const response = await cancelSubscription(selectedShopId, token);
      if (!current()) return;
      setEntitlement(response);
      setNotice(response.cancellationPending ? b('cancel_pending') : isTrial ? a.cancelDoneTrial(until) : a.cancelDoneActive(until));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.errorCancel);
      reloadEntitlement().catch(() => {});
    } finally {
      finishOperation();
    }
  }

  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? t.account.accountFallback;
  const switchDate = entitlement?.currentPeriodEnd ?? entitlement?.trialEnd ?? null;

  return (
    <section className={embedded ? "subscription-section billing-dashboard" : "subscription-section"} aria-busy={!!busy || loading}>
      {confirmation ? <dialog ref={confirmationDialog} className="billing-confirm" aria-labelledby="billing-confirm-title" aria-describedby="billing-confirm-copy" onCancel={() => setConfirmation(null)}>
        <h2 id="billing-confirm-title">{confirmation === 'switch' ? a.pendingKeepCurrent : t.account.cancelSubscription}</h2>
        <p id="billing-confirm-copy">{confirmation === 'switch' ? a.pendingCancelConfirm : (isTrial ? a.cancelConfirmTrial(date(entitlement?.trialEnd)) : a.cancelConfirmActive(date(entitlement?.currentPeriodEnd)))}</p>
        <div className="portal-actions"><button className="subscription-button secondary" type="button" autoFocus onClick={() => setConfirmation(null)}>{b('back')}</button>
        <button className="subscription-button danger" type="button" disabled={!!busy} onClick={() => { const action = confirmation; setConfirmation(null); void (action === 'switch' ? dropPendingSwitch() : cancel()); }}>{confirmation === 'switch' ? a.pendingKeepCurrent : t.account.cancelSubscription}</button></div>
      </dialog> : null}
      {embedded ? null : <h1>{t.account.heading}</h1>}
      {embedded ? null : <p className="subscription-lead">{managementOnly ? accountEmail : t.account.leadWithEmail(accountEmail)}</p>}

      {error ? <div className="subscription-alert" role="alert">{embedded ? b(lockedShopId && !loading && !selectedShopId ? 'no_shop' : 'request_error') : error}</div> : null}
      {notice ? <div className="subscription-alert success" role="status">{notice}</div> : null}

      <div className="billing-refresh"><button className="subscription-button secondary" type="button" disabled={!!busy || loading} onClick={refreshBilling}>{busy === 'refresh' || loading ? b('loading') : refreshLabel}</button></div>
      {lockedShopId && !loading && !selectedShopId && !error ? <p role="alert">{b('no_shop')}</p> : null}
      <div className="portal-grid subscription-section">
        {embedded ? null : <aside className="subscription-panel">
          <h3>{t.account.linkedShops}</h3>
          {loading ? <p className="muted">{t.account.loadingShops}</p> : null}
          {!loading && shops.length === 0 ? <p className="muted">{t.account.noShops}</p> : null}
          <div className="shop-list">
            {shops.map((shop) => (
              <button
                key={shop.id}
                type="button"
                aria-pressed={selectedShopId === shop.id ? 'true' : 'false'}
                onClick={() => setSelectedShopId(shop.id)}
              >
                <strong>{shop.name}</strong>
                <br />
                <span className="muted">{shop.role ?? t.account.shopRoleFallback}</span>
              </button>
            ))}
          </div>
        </aside>}

        <div className="status-panel">
          <div className="billing-overview"><div className="billing-summary">
          <div className="billing-status-heading"><div>
          {embedded ? <p className="billing-eyebrow">{b('current_access')}</p> : null}
          <div className={warning ? 'status-badge warning' : 'status-badge'}>{temporaryAccessOnly ? b('temporary_title') : error && !entitlement ? '—' : badge}</div>
          <h2>{selectedShop?.name ?? t.account.selectShop}</h2>
          </div>{embedded ? <span className="billing-mark" aria-hidden="true">₹</span> : null}</div>
          {entitlement?.temporaryPremium ? <div className="billing-grant" role="note"><strong>{b('temporary_title')}</strong><p>{b('temporary_body')}</p>{mandate ? <p>{b('temporary_existing')}</p> : null}</div> : null}
          {entitlement?.billingSyncPending ? <p role="status">{b('sync_pending')}</p> : null}
          {entitlement?.cancellationPending ? <p role="status">{b('cancel_pending')}</p> : null}
          {lead && !temporaryAccessOnly && !entitlement?.billingSyncPending && !entitlement?.cancellationPending ? <p className="muted">{managementOnly ? a.managementLead : lead}</p> : null}

          </div>
          {entitlement && embedded ? <dl className="billing-facts"><div><dt>{b('current_plan')}</dt><dd>{entitlement.plan ? planLabel(entitlement.plan,t) : '—'}</dd></div><div><dt>{b('payment_method')}</dt><dd>{b(mandate ? 'mandate' : 'no_mandate')}</dd></div></dl> : null}
          </div>
          {!entitlement && !error && (loading || selectedShopId) ? <p role="status">{b('loading')}</p> : null}
          {!isOwner && entitlement ? (
            <div className="subscription-alert" style={{ marginTop: '1rem' }}>
              <p style={{ margin: 0 }}>{a.ownerOnly}</p>
              <p className="muted" style={{ margin: '8px 0 0' }}>
                {managementOnly ? `${accountEmail} · ${roleLabel}` : a.signedInAs(accountEmail, roleLabel)}
              </p>
              {embedded ? null : <div className="portal-actions" style={{ marginTop: '1rem' }}>
                <button className="subscription-button" type="button" onClick={() => void (onSignOut ? onSignOut() : signOut())}>
                  {a.switchAccount}
                </button>
              </div>}
            </div>
          ) : null}

          {/* Scheduled plan switch / payment-method refresh */}
          {entitlement?.pendingReason ? (
            <div className="subscription-panel billing-pending">
              <strong>
                {entitlement.pendingReason === 'plan_switch'
                  ? a.pendingSwitchTitle(planLabel(entitlement.pendingPlan, t), date(entitlement.scheduledSwitchAt))
                  : a.pendingPaymentTitle(date(entitlement.scheduledSwitchAt))}
              </strong>
              {managementOnly ? null : <p className="muted">{a.pendingBody}</p>}
              {managementOnly ? null : <p className="muted">{entitlement.canCancelPendingSwitch ? a.pendingNeedsAuth : b('pending_authorized')}</p>}
              {isOwner ? (
                <div className="portal-actions">
                  {!managementOnly ? <button className="subscription-button" type="button" disabled={!!busy || !actions.pending} onClick={resumePendingAuthorisation}>
                    {a.pendingAuthorise}
                  </button> : null}
                  <button className="subscription-button secondary" type="button" disabled={!!busy || !actions.pending} onClick={(e) => { confirmationTrigger.current = e.currentTarget; setConfirmation('switch'); }}>
                    {a.pendingKeepCurrent}
                  </button>
                  <button className="subscription-button danger" type="button" disabled={!!busy || !canCancel} onClick={(e) => { confirmationTrigger.current = e.currentTarget; setConfirmation('cancel'); }}>{t.account.cancelSubscription}</button>
                </div>
              ) : null}
            </div>
          ) : null}

          {managementOnly && isOwner && canCancel && !entitlement?.pendingReason ? (
            <div className="portal-actions">
              <button className="subscription-button danger" type="button" disabled={!!busy || !canCancel} onClick={(e) => { confirmationTrigger.current = e.currentTarget; setConfirmation('cancel'); }}>{t.account.cancelSubscription}</button>
            </div>
          ) : null}

          <div className="billing-plan-actions">
          {embedded && (canSubscribe || canManage) ? <h3>{b(canSubscribe ? 'choose' : 'manage')}</h3> : null}
          {/* Subscribe (new, expired, canceled, unfinished setup, or auto trial) */}
          {isOwner && canSubscribe ? (
            <>
              <div className="pricing-toggle" role="group" aria-label={t.pricing.billingIntervalLabel} style={{ marginTop: '1rem' }}>
                {(['monthly', 'annual'] as BillingPlan[]).map((item) => (
                  <button key={item} type="button" disabled={!!busy} aria-pressed={plan === item ? 'true' : 'false'} onClick={() => setPlan(item)}>
                    <span>{planLabel(item, t)}</span><strong>{planCopy[item].price}<small>{b(item === 'annual' ? 'price_year' : 'price_month')}</small></strong>
                  </button>
                ))}
              </div>
              <p className="muted">
                {isTrial ? a.subscribeDuringTrialNote(date(entitlement?.trialEnd)) : a.subscribeNowNote}
              </p>
              <div className="portal-actions">
                <button className="subscription-button" type="button" disabled={!selectedShopId || !!busy} onClick={startCheckout}>
                  {status === 'pending_authentication' || entitlement?.needsAuthorization
                    ? a.finishSetup(amount(plan))
                    : status === 'canceled' || status === 'expired'
                      ? a.subscribeAgain(amount(plan))
                      : t.account.subscribeWithAmount(amount(plan))}
                </button>
                {canCancel ? (
                  <button className="subscription-button secondary" type="button" disabled={!!busy} onClick={(e) => { confirmationTrigger.current = e.currentTarget; setConfirmation('cancel'); }}>
                    {isTrial ? a.cancelTrialButton : t.account.cancelSubscription}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          {/* Manage an existing mandate */}
          {isOwner && canManage ? (
            <>
              <p className="muted" style={{ marginTop: '1rem' }}>
                {a.currentPlanShort(planLabel(entitlement?.plan, t))}{' '}
                {switchDate ? a.switchExplainer(date(switchDate)) : a.switchExplainerNoPeriod}
              </p>
              {status === 'past_due' ? null : <p className="muted">{a.updatePaymentExplainer}</p>}
              <div className="portal-actions">
                {!entitlement?.pendingReason && !entitlement?.cancelAtPeriodEnd && entitlement?.plan !== 'annual' ? (
                  <button className="subscription-button" type="button" disabled={!!busy} onClick={() => scheduleChange('switch-plan', 'annual')}>
                    {t.account.switchToAnnual(amount('annual'))}
                  </button>
                ) : null}
                {!entitlement?.pendingReason && !entitlement?.cancelAtPeriodEnd && entitlement?.plan !== 'monthly' ? (
                  <button className="subscription-button" type="button" disabled={!!busy} onClick={() => scheduleChange('switch-plan', 'monthly')}>
                    {t.account.switchToMonthly(amount('monthly'))}
                  </button>
                ) : null}
                {!entitlement?.pendingReason && !entitlement?.cancelAtPeriodEnd ? (
                  <button
                    className={status === 'past_due' ? 'subscription-button' : 'subscription-button secondary'}
                    type="button"
                    disabled={!!busy}
                    onClick={() => scheduleChange('payment-method')}
                  >
                    {status === 'past_due' ? a.restorePaymentMethod : t.account.updatePaymentMethod}
                  </button>
                ) : null}
                {canCancel ? (
                  <button className="subscription-button danger" type="button" disabled={!!busy} onClick={(e) => { confirmationTrigger.current = e.currentTarget; setConfirmation('cancel'); }}>
                    {t.account.cancelSubscription}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          {canCancel && !canManage && !canSubscribe && !entitlement?.pendingReason && !managementOnly ? <div className="portal-actions"><button className="subscription-button danger" type="button" disabled={!!busy} onClick={(e) => { confirmationTrigger.current = e.currentTarget; setConfirmation('cancel'); }}>{t.account.cancelSubscription}</button></div> : null}
          </div>
          {embedded ? <Link className="billing-compare" href={localizedPath(locale, 'pricing')}>{b('compare')} ↗</Link> : null}
          </div>
          <section className="billing-history">
          <header><div><h3>{t.account.paymentHistory}</h3>{embedded ? <p className="muted">{b('history_hint')}</p> : null}</div></header>
          {isOwner && loadedInvoiceScope === invoiceScope && invoiceError ? <p role="alert">{invoiceError}</p> : null}
          {isOwner && loadedInvoiceScope !== invoiceScope ? <p role="status">{b('loading')}</p> : isOwner && loadedInvoiceScope === invoiceScope && invoices.length ? (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>{t.account.invoiceDate}</th>
                  <th>{t.account.invoiceAmount}</th>
                  <th>{t.account.invoiceStatus}</th>
                  <th>{t.account.invoiceColumn}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td data-label={t.account.invoiceDate}>{date(invoice.date)}</td>
                    <td data-label={t.account.invoiceAmount}>
                      {new Intl.NumberFormat(language === 'hinglish' ? 'en-IN' : language + '-IN', {style:'currency', currency: /^[A-Z]{3}$/.test(invoice.currency ?? 'INR') ? invoice.currency ?? 'INR' : 'INR'}).format(invoice.amount)}
                    </td>
                    <td data-label={t.account.invoiceStatus}>{embedded ? b('invoice_' + (['paid','issued','failed','cancelled','expired'].includes(invoice.status ?? '') ? invoice.status : 'unknown')) : invoice.status ?? t.account.invoicePending}</td>
                    <td data-label={t.account.invoiceColumn}>{invoiceHref(invoice.invoiceUrl) && (!managementOnly || invoice.status === 'paid') ? <a href={invoiceHref(invoice.invoiceUrl)} rel="noreferrer">{t.account.invoiceDownload}</a> : t.account.invoicePending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !invoiceError && <p className="muted">{isOwner ? t.account.noInvoices : b('history_owner')}</p>
          )}

          </section>
          <div className="portal-actions billing-footer">
            {embedded ? null : <><UserButton /><a className="subscription-button secondary" href="/delete-account">{retentionCopy[locale].title}</a></>}
            {embedded ? null : <a className="subscription-button secondary" href="samaan-bol://subscription/return">
              {a.openInApp}
            </a>}
            {embedded || managementOnly ? null : (
              <Link className="subscription-button secondary" href={localizedPath(locale, 'pricing')}>
                {t.account.backToPricing}
              </Link>
            )}
          </div>
      </div>
    </section>
  );
}

export function AccountClient({ locale = defaultLocale, managementOnly = false }: { locale?: Locale; managementOnly?: boolean }) {
  const t = getSubscriptionStrings(locale);
  const a = getAccountStrings(locale);
  const searchParams = useSearchParams();
  const ticket = searchParams.get('ticket');
  const { isLoaded, isSignedIn } = useUser();
  const { signIn } = useSignIn();
  const [ticketBusy, setTicketBusy] = useState(!!ticket);

  useEffect(() => {
    if (!ticket) {
      setTicketBusy(false);
      return;
    }
    if (!isLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const ticketResult = await signIn.ticket({ ticket });
        if (cancelled) return;
        if (ticketResult.error) {
          console.error('Clerk ticket sign-in failed', ticketResult.error);
          return;
        }
        const finalizeResult = await signIn.finalize();
        if (cancelled) return;
        if (finalizeResult.error) {
          console.error('Clerk ticket finalize failed', finalizeResult.error);
          return;
        }
        const url = new URL(window.location.href);
        url.searchParams.delete('ticket');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      } catch (err) {
        console.error('Clerk ticket sign-in failed', err);
      } finally {
        if (!cancelled) setTicketBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ticket, isLoaded, signIn]);

  if (!isLoaded || ticketBusy) {
    return <div className="subscription-panel">{t.account.loadingSignIn}</div>;
  }

  return (
    <>
      {!isSignedIn ? (
        <section className="subscription-section">
          <h1>{t.account.signedOutHeading}</h1>
          <p className="subscription-lead">{managementOnly ? a.managementSignIn : t.account.signedOutLead}</p>
          <div className="subscription-panel sign-in-panel">
            <SignIn routing="hash" withSignUp={!managementOnly} appearance={managementOnly ? { elements: { footerAction: { display: 'none' } } } : undefined} forceRedirectUrl={`${managementOnly ? '/account/mobile' : localizedPath(locale, "account")}?${new URLSearchParams([...searchParams.entries()].filter(([key]) => key !== "ticket"))}`} />
          </div>
        </section>
      ) : (
        <AccountDashboard locale={locale} managementOnly={managementOnly} />
      )}
    </>
  );
}
