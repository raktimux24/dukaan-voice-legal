'use client';

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

function formatDate(value: string | null | undefined, t: SubscriptionStrings) {
  if (!value) return t.account.dateUnavailable;
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function planLabel(plan: BillingPlan | null | undefined, t: SubscriptionStrings) {
  return plan === 'annual' ? t.plans.annualLabel : t.plans.monthlyLabel;
}

// One place that decides what the status panel says for every entitlement
// state, so the badge and the lead line can't disagree.
function describe(ent: SubscriptionEntitlement | undefined, t: SubscriptionStrings, a: AccountStrings) {
  if (!ent) return { badge: t.account.statusLoading, lead: '', warning: false };
  const mandate = hasMandate(ent);
  const trialEnd = formatDate(ent.trialEnd, t);
  const periodEnd = formatDate(ent.currentPeriodEnd, t);

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
      if (mandate) return { badge: 'Payment method authorised', lead: 'Waiting for the first subscription charge. You can manage or cancel the mandate below.', warning: false };
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
}: {
  locale: Locale;
  lockedShopId?: string;
  embedded?: boolean;
}) {
  const t = getSubscriptionStrings(locale);
  const a = getAccountStrings(locale);
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
  const planInitialized = useRef('');
  const activeShop = useRef(selectedShopId);
  activeShop.current = selectedShopId;

  const selectedShop = useMemo(() => shops.find((shop) => shop.id === selectedShopId), [selectedShopId, shops]);
  const isOwner =
    selectedShop?.role?.toUpperCase() === 'OWNER' ||
    (!!user?.id && !!selectedShop?.ownerId && selectedShop.ownerId === user.id);
  const { signOut } = useClerk();
  const roleLabel = selectedShop?.role
    ? selectedShop.role.charAt(0).toUpperCase() + selectedShop.role.slice(1).toLowerCase()
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
          if (lockedShopId && response.shops.some((shop) => shop.id === lockedShopId)) return lockedShopId;
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
  }, [getToken, lockedShopId, requestedShopId, t.account.errorLoadShops]);

  const reloadEntitlement = useCallback(async () => {
    if (!selectedShopId) return;
    const token = await getToken();
    const response = await getEntitlement(selectedShopId, token, isOwner);
    if (activeShop.current !== selectedShopId) return;
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
    if (isOwner && selectedShopId) {
      getToken().then(token => getInvoices(selectedShopId, token)).then(result => {
        if (active) setInvoices(result.invoices);
      }).catch(() => { if (active) setInvoiceError('Payment history could not be loaded. Please refresh to retry.'); });
    }
    return () => { active = false; };
  }, [getToken, isOwner, selectedShopId, entitlement?.currentPeriodEnd]);

  const status = entitlement?.status;
  const mandate = hasMandate(entitlement);
  const isTrial = status === 'trialing';
  const canSubscribe =
    !!entitlement &&
    !entitlement.pendingReason && !entitlement.cancellationPending && !entitlement.billingSyncPending &&
    (status === 'none' ||
      status === 'expired' ||
      status === 'canceled' ||
      (status === 'pending_authentication' && !mandate) ||
      (isTrial && !mandate));
  const canManage = !!entitlement && mandate && !entitlement.cancellationPending && !entitlement.billingSyncPending && (status === 'active' || status === 'past_due' || status === 'pending_authentication' || isTrial);
  const canCancel =
    !!entitlement &&
    !entitlement.cancelAtPeriodEnd && !entitlement.cancellationPending &&
    (status === 'active' || status === 'past_due' || status === 'pending_authentication' || isTrial);
  const { badge, lead, warning } = describe(entitlement, t, a);

  // UPI Autopay authorisation uses Razorpay Standard Checkout (subscription_id),
  // not the rzp.io short_url — that hosted page is not enabled on this merchant.
  function openRazorpayCheckout(opts: {
    checkout: CheckoutResponse;
    description: string;
    onDone: () => void;
    onSuccess: (args: RazorpayHandlerArgs) => void;
  }) {
    const { checkout, description, onDone, onSuccess } = opts;

    if (typeof window === 'undefined' || !window.Razorpay) {
      throw new Error(t.account.errorRazorpayNotLoaded);
    }
    if (!checkout.subscriptionId || !checkout.keyId) {
      throw new Error(t.account.errorCheckoutMissingId);
    }

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
        try {
          if (args.razorpay_subscription_id !== checkout.subscriptionId || !args.razorpay_payment_id) throw new Error('Checkout details did not match. Please refresh your subscription status.');
          await verifyCheckout(selectedShopId, checkout.subscriptionId!, args.razorpay_payment_id, args.razorpay_signature, await getToken());
          onSuccess(args);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Payment confirmation is pending. Please refresh before retrying.');
          onDone();
        }
      },
      modal: {
        ondismiss: onDone,
      },
    });

    rzp.on('payment.failed', (response) => {
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
    if (!selectedShopId) return;
    setBusy('checkout');
    setError('');
    try {
      const token = await getToken();
      const checkout = await createCheckout(selectedShopId, plan, token);
      openRazorpayCheckout({
        checkout,
        description: (checkout.plan ?? plan) === 'annual' ? t.plans.annualDescription : t.plans.monthlyDescription,
        onDone: () => { setBusy(''); reloadEntitlement().catch(() => {}); },
        onSuccess: (resp) => goToReturnPage(resp.razorpay_subscription_id),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.errorStartCheckout);
      setBusy('');
    }
  }

  // Plan switch and payment-method refresh both schedule a replacement
  // subscription that takes over at the end of the current period. Whether
  // the user finishes or dismisses Razorpay, the pending card below reflects
  // where things stand — so just reload the entitlement either way.
  async function scheduleChange(kind: 'switch-plan' | 'payment-method', nextPlan?: BillingPlan) {
    if (!selectedShopId) return;
    setBusy(kind);
    setError('');
    setNotice('');
    try {
      const token = await getToken();
      const result =
        kind === 'switch-plan' && nextPlan
          ? await changePlan(selectedShopId, nextPlan, token)
          : await updatePaymentMethod(selectedShopId, token);
      const description =
        kind === 'switch-plan'
          ? nextPlan === 'annual'
            ? t.plans.annualDescription
            : t.plans.monthlyDescription
          : t.account.updatePaymentMethod;
      const finish = () => {
        setBusy('');
        reloadEntitlement().catch(() => {});
      };
      openRazorpayCheckout({ checkout: result, description, onDone: finish, onSuccess: finish });
    } catch (err) {
      setError(err instanceof Error ? err.message : kind === 'switch-plan' ? t.account.errorSwitchPlan : t.account.errorPaymentMethod);
      setBusy('');
      reloadEntitlement().catch(() => {});
    }
  }

  async function resumePendingAuthorisation() {
    if (!selectedShopId) return;
    setBusy('pending-auth');
    setError('');
    try {
      const token = await getToken();
      const pending = await getPendingSwitch(selectedShopId, token);
      const finish = () => {
        setBusy('');
        reloadEntitlement().catch(() => {});
      };
      openRazorpayCheckout({
        checkout: { shortUrl: pending.shortUrl ?? '', subscriptionId: pending.subscriptionId, keyId: pending.keyId },
        description: pending.reason === 'payment_method' ? t.account.updatePaymentMethod : planLabel(pending.plan, t),
        onDone: finish,
        onSuccess: finish,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : a.errorPendingSwitch);
      setBusy('');
    }
  }

  async function dropPendingSwitch() {
    if (!selectedShopId || !window.confirm(a.pendingCancelConfirm)) return;
    setBusy('cancel-switch');
    setError('');
    try {
      const token = await getToken();
      const response = await cancelPlanSwitch(selectedShopId, token);
      setEntitlement(response);
      setNotice(a.pendingCancelled);
    } catch (err) {
      setError(err instanceof Error ? err.message : a.errorPendingSwitch);
    } finally {
      setBusy('');
    }
  }

  async function cancel() {
    if (!selectedShopId || !entitlement) return;
    const until = formatDate(isTrial ? entitlement.trialEnd : entitlement.currentPeriodEnd, t);
    if (!window.confirm(isTrial ? a.cancelConfirmTrial(until) : a.cancelConfirmActive(until))) return;
    setBusy('cancel');
    setError('');
    try {
      const token = await getToken();
      const response = await cancelSubscription(selectedShopId, token);
      setEntitlement(response);
      setNotice(isTrial ? a.cancelDoneTrial(until) : a.cancelDoneActive(until));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.errorCancel);
      reloadEntitlement().catch(() => {});
    } finally {
      setBusy('');
    }
  }

  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? t.account.accountFallback;
  const switchDate = entitlement?.currentPeriodEnd ?? entitlement?.trialEnd ?? null;

  return (
    <section className="subscription-section">
      {embedded ? null : <h1>{t.account.heading}</h1>}
      {embedded ? null : <p className="subscription-lead">{t.account.leadWithEmail(accountEmail)}</p>}

      {error ? <div className="subscription-alert">{error}</div> : null}
      {notice ? <div className="subscription-alert success">{notice}</div> : null}

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
          <div className={warning ? 'status-badge warning' : 'status-badge'}>{badge}</div>
          <h2>{selectedShop?.name ?? t.account.selectShop}</h2>
          {entitlement?.billingSyncPending ? <p role="status">Billing updates are temporarily unavailable. This is your last recorded status. Refresh before making a new change.</p> : null}
          {entitlement?.cancellationPending ? <p role="status">Cancellation is still being confirmed. We will retry automatically; do not set up another subscription.</p> : null}
          {lead && !entitlement?.billingSyncPending && !entitlement?.cancellationPending ? <p className="muted">{lead}</p> : null}

          {!isOwner && entitlement ? (
            <div className="subscription-alert" style={{ marginTop: '1rem' }}>
              <p style={{ margin: 0 }}>{a.ownerOnly}</p>
              <p className="muted" style={{ margin: '8px 0 0' }}>
                {a.signedInAs(accountEmail, roleLabel)}
              </p>
              <div className="portal-actions" style={{ marginTop: '1rem' }}>
                <button className="subscription-button" type="button" onClick={() => void signOut()}>
                  {a.switchAccount}
                </button>
              </div>
            </div>
          ) : null}

          {/* Scheduled plan switch / payment-method refresh */}
          {entitlement?.pendingReason ? (
            <div className="subscription-panel" style={{ marginTop: '1rem' }}>
              <strong>
                {entitlement.pendingReason === 'plan_switch'
                  ? a.pendingSwitchTitle(planLabel(entitlement.pendingPlan, t), formatDate(entitlement.scheduledSwitchAt, t))
                  : a.pendingPaymentTitle(formatDate(entitlement.scheduledSwitchAt, t))}
              </strong>
              <p className="muted">{a.pendingBody}</p>
              <p className="muted">{entitlement.canCancelPendingSwitch ? a.pendingNeedsAuth : "The replacement is authorised. To stop future billing, cancel the subscription below."}</p>
              {isOwner ? (
                <div className="portal-actions">
                  <button className="subscription-button" type="button" disabled={!!busy || !!entitlement.billingSyncPending || !entitlement.canCancelPendingSwitch} onClick={resumePendingAuthorisation}>
                    {a.pendingAuthorise}
                  </button>
                  <button className="subscription-button secondary" type="button" disabled={!!busy || !!entitlement.billingSyncPending || !entitlement.canCancelPendingSwitch} onClick={dropPendingSwitch}>
                    {a.pendingKeepCurrent}
                  </button>
                  <button className="subscription-button danger" type="button" disabled={!!busy} onClick={cancel}>{t.account.cancelSubscription}</button>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Subscribe (new, expired, canceled, unfinished setup, or auto trial) */}
          {isOwner && canSubscribe ? (
            <>
              <div className="pricing-toggle" role="group" aria-label={t.pricing.billingIntervalLabel} style={{ marginTop: '1rem' }}>
                {(['monthly', 'annual'] as BillingPlan[]).map((item) => (
                  <button key={item} type="button" aria-pressed={plan === item ? 'true' : 'false'} onClick={() => setPlan(item)}>
                    {planLabel(item, t)}
                  </button>
                ))}
              </div>
              <p className="muted">
                {isTrial ? a.subscribeDuringTrialNote(formatDate(entitlement?.trialEnd, t)) : a.subscribeNowNote}
              </p>
              <div className="portal-actions">
                <button className="subscription-button" type="button" disabled={!selectedShopId || !!busy} onClick={startCheckout}>
                  {status === 'pending_authentication' || entitlement?.needsAuthorization
                    ? a.finishSetup(planCopy[plan].amount)
                    : status === 'canceled' || status === 'expired'
                      ? a.subscribeAgain(planCopy[plan].amount)
                      : t.account.subscribeWithAmount(planCopy[plan].amount)}
                </button>
                {canCancel ? (
                  <button className="subscription-button secondary" type="button" disabled={!!busy} onClick={cancel}>
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
                {switchDate ? a.switchExplainer(formatDate(switchDate, t)) : a.switchExplainerNoPeriod}
              </p>
              {status === 'past_due' ? null : <p className="muted">{a.updatePaymentExplainer}</p>}
              <div className="portal-actions">
                {!entitlement?.pendingReason && !entitlement?.cancelAtPeriodEnd && entitlement?.plan !== 'annual' ? (
                  <button className="subscription-button" type="button" disabled={!!busy} onClick={() => scheduleChange('switch-plan', 'annual')}>
                    {t.account.switchToAnnual(planCopy.annual.amount)}
                  </button>
                ) : null}
                {!entitlement?.pendingReason && !entitlement?.cancelAtPeriodEnd && entitlement?.plan !== 'monthly' ? (
                  <button className="subscription-button" type="button" disabled={!!busy} onClick={() => scheduleChange('switch-plan', 'monthly')}>
                    {t.account.switchToMonthly(planCopy.monthly.amount)}
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
                  <button className="subscription-button danger" type="button" disabled={!!busy} onClick={cancel}>
                    {t.account.cancelSubscription}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          <h3>{t.account.paymentHistory}</h3>
          {invoiceError ? <p role="alert">{invoiceError}</p> : null}
          {invoices.length ? (
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
                    <td>{formatDate(invoice.date, t)}</td>
                    <td>
                      {(invoice.currency ?? 'INR') === 'INR' ? '₹' : invoice.currency} {invoice.amount}
                    </td>
                    <td>{invoice.status ?? t.account.invoicePaid}</td>
                    <td>{invoice.invoiceUrl ? <a href={invoice.invoiceUrl}>{t.account.invoiceDownload}</a> : t.account.invoicePending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !invoiceError && <p className="muted">{isOwner ? t.account.noInvoices : 'Payment history is available to the shop owner.'}</p>
          )}

          <div className="portal-actions">
            {embedded ? null : <UserButton />}
            <a className="subscription-button secondary" href="samaan-bol://subscription/return">
              {a.openInApp}
            </a>
            {embedded ? null : (
              <Link className="subscription-button secondary" href={localizedPath(locale, 'pricing')}>
                {t.account.backToPricing}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AccountClient({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getSubscriptionStrings(locale);
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
          <p className="subscription-lead">{t.account.signedOutLead}</p>
          <div className="subscription-panel sign-in-panel">
            <SignIn routing="hash" forceRedirectUrl={`${localizedPath(locale, "account")}?${new URLSearchParams([...searchParams.entries()].filter(([key]) => key !== "ticket"))}`} />
          </div>
        </section>
      ) : (
        <AccountDashboard locale={locale} />
      )}
    </>
  );
}
