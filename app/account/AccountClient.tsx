'use client';

import { SignIn, UserButton, useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultLocale, type Locale, localizedPath } from '../i18n';
import { getSubscriptionStrings, type SubscriptionStrings } from '../content/subscriptionStrings';
import { getAccountStrings, type AccountStrings } from '../content/accountStrings';
import {
  cancelPlanSwitch,
  cancelSubscription,
  changePlan,
  createCheckout,
  getEntitlement,
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
type RazorpayInstance = { open: () => void };
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
      return { badge: a.statusPendingAuth, lead: a.leadPendingAuth, warning: true };
    case 'expired':
      return { badge: a.statusExpired, lead: a.leadExpired, warning: false };
    case 'canceled':
      return { badge: t.account.statusCanceled, lead: a.leadCanceled, warning: false };
    default:
      return { badge: t.account.statusNone, lead: a.leadNone(ent.trialDays ?? 7), warning: false };
  }
}

function AccountDashboard({ locale }: { locale: Locale }) {
  const t = getSubscriptionStrings(locale);
  const a = getAccountStrings(locale);
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') === 'monthly' ? 'monthly' : 'annual';
  const requestedShopId = searchParams.get('shopId') ?? '';
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

  const selectedShop = useMemo(() => shops.find((shop) => shop.id === selectedShopId), [selectedShopId, shops]);
  const isOwner = !selectedShop?.role || selectedShop.role.toUpperCase() === 'OWNER';

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
        setSelectedShopId((current) => current || response.shops.find((shop) => shop.id === requestedShopId)?.id || response.shops[0]?.id || '');
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
  }, [getToken, requestedShopId, t.account.errorLoadShops]);

  const reloadEntitlement = useCallback(async () => {
    if (!selectedShopId) return;
    const token = await getToken();
    const response = await getEntitlement(selectedShopId, token);
    setEntitlement(response);
    return response;
  }, [getToken, selectedShopId]);

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

  const status = entitlement?.status;
  const mandate = hasMandate(entitlement);
  const isTrial = status === 'trialing';
  const canSubscribe =
    !!entitlement &&
    !entitlement.pendingReason &&
    (status === 'none' ||
      status === 'expired' ||
      status === 'canceled' ||
      status === 'pending_authentication' ||
      (isTrial && !mandate && !entitlement.cancelAtPeriodEnd));
  const canManage = !!entitlement && mandate && (status === 'active' || status === 'past_due' || isTrial);
  const canCancel =
    !!entitlement &&
    !entitlement.cancelAtPeriodEnd &&
    (status === 'active' || status === 'past_due' || isTrial);
  const { badge, lead, warning } = describe(entitlement, t, a);

  function openRazorpayCheckout(opts: { checkout: CheckoutResponse; description: string; onDone: () => void; onSuccess: (args: RazorpayHandlerArgs) => void }) {
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
      handler: onSuccess,
      modal: { ondismiss: onDone },
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
        description: plan === 'annual' ? t.plans.annualDescription : t.plans.monthlyDescription,
        onDone: () => setBusy(''),
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
    } finally {
      setBusy('');
    }
  }

  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? t.account.accountFallback;
  const switchDate = entitlement?.currentPeriodEnd ?? entitlement?.trialEnd ?? null;

  return (
    <section className="subscription-section">
      <h1>{t.account.heading}</h1>
      <p className="subscription-lead">{t.account.leadWithEmail(accountEmail)}</p>

      {error ? <div className="subscription-alert">{error}</div> : null}
      {notice ? <div className="subscription-alert success">{notice}</div> : null}

      <div className="portal-grid subscription-section">
        <aside className="subscription-panel">
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
        </aside>

        <div className="status-panel">
          <div className={warning ? 'status-badge warning' : 'status-badge'}>{badge}</div>
          <h2>{selectedShop?.name ?? t.account.selectShop}</h2>
          {lead ? <p className="muted">{lead}</p> : null}

          {!isOwner && entitlement ? <p className="muted">{a.ownerOnly}</p> : null}

          {/* Scheduled plan switch / payment-method refresh */}
          {entitlement?.pendingReason ? (
            <div className="subscription-panel" style={{ marginTop: '1rem' }}>
              <strong>
                {entitlement.pendingReason === 'plan_switch'
                  ? a.pendingSwitchTitle(planLabel(entitlement.pendingPlan, t), formatDate(entitlement.scheduledSwitchAt, t))
                  : a.pendingPaymentTitle(formatDate(entitlement.scheduledSwitchAt, t))}
              </strong>
              <p className="muted">{a.pendingBody}</p>
              <p className="muted">{a.pendingNeedsAuth}</p>
              {isOwner ? (
                <div className="portal-actions">
                  <button className="subscription-button" type="button" disabled={busy === 'pending-auth'} onClick={resumePendingAuthorisation}>
                    {a.pendingAuthorise}
                  </button>
                  <button className="subscription-button secondary" type="button" disabled={busy === 'cancel-switch'} onClick={dropPendingSwitch}>
                    {a.pendingKeepCurrent}
                  </button>
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
                <button className="subscription-button" type="button" disabled={!selectedShopId || busy === 'checkout'} onClick={startCheckout}>
                  {status === 'pending_authentication'
                    ? a.finishSetup(planCopy[plan].amount)
                    : status === 'canceled' || status === 'expired'
                      ? a.subscribeAgain(planCopy[plan].amount)
                      : t.account.subscribeWithAmount(planCopy[plan].amount)}
                </button>
                {isTrial && canCancel ? (
                  <button className="subscription-button secondary" type="button" disabled={busy === 'cancel'} onClick={cancel}>
                    {a.cancelTrialButton}
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
                  <button className="subscription-button" type="button" disabled={busy === 'switch-plan'} onClick={() => scheduleChange('switch-plan', 'annual')}>
                    {t.account.switchToAnnual(planCopy.annual.amount)}
                  </button>
                ) : null}
                {!entitlement?.pendingReason && !entitlement?.cancelAtPeriodEnd && entitlement?.plan !== 'monthly' ? (
                  <button className="subscription-button" type="button" disabled={busy === 'switch-plan'} onClick={() => scheduleChange('switch-plan', 'monthly')}>
                    {t.account.switchToMonthly(planCopy.monthly.amount)}
                  </button>
                ) : null}
                {!entitlement?.pendingReason && !entitlement?.cancelAtPeriodEnd ? (
                  <button
                    className={status === 'past_due' ? 'subscription-button' : 'subscription-button secondary'}
                    type="button"
                    disabled={busy === 'payment-method'}
                    onClick={() => scheduleChange('payment-method')}
                  >
                    {status === 'past_due' ? a.restorePaymentMethod : t.account.updatePaymentMethod}
                  </button>
                ) : null}
                {canCancel ? (
                  <button className="subscription-button danger" type="button" disabled={busy === 'cancel'} onClick={cancel}>
                    {t.account.cancelSubscription}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          <h3>{t.account.paymentHistory}</h3>
          {entitlement?.invoices?.length ? (
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
                {entitlement.invoices.map((invoice) => (
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
            <p className="muted">{t.account.noInvoices}</p>
          )}

          <div className="portal-actions">
            <UserButton />
            <a className="subscription-button secondary" href="samaan-bol://subscription/return">
              {a.openInApp}
            </a>
            <Link className="subscription-button secondary" href={localizedPath(locale, 'pricing')}>
              {t.account.backToPricing}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AccountClient({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getSubscriptionStrings(locale);
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="subscription-panel">{t.account.loadingSignIn}</div>;
  }

  return (
    <>
      {!isSignedIn ? (
        <section className="subscription-section">
          <h1>{t.account.signedOutHeading}</h1>
          <p className="subscription-lead">{t.account.signedOutLead}</p>
          <div className="subscription-panel sign-in-panel">
            <SignIn routing="hash" />
          </div>
        </section>
      ) : (
        <AccountDashboard locale={locale} />
      )}
    </>
  );
}
