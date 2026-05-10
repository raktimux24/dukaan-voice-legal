'use client';

import { SignIn, UserButton, useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { defaultLocale, type Locale, localizedPath } from '../i18n';
import { getSubscriptionStrings, type SubscriptionStrings } from '../content/subscriptionStrings';
import {
  cancelSubscription,
  changePlan,
  createCheckout,
  getEntitlement,
  getShops,
  planCopy,
  updatePaymentMethod,
  verifyPayment,
  type BillingPlan,
  type CheckoutResponse,
  type Shop,
  type SubscriptionEntitlement,
} from '../lib/subscriptions';

type RazorpayHandlerArgs = {
  razorpay_payment_id: string;
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

function formatDate(value: string | undefined, t: SubscriptionStrings) {
  if (!value) return t.account.dateUnavailable;
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function statusLabel(entitlement: SubscriptionEntitlement | undefined, t: SubscriptionStrings) {
  if (!entitlement) return t.account.statusLoading;
  if (entitlement.status === 'active') return t.account.statusActive(entitlement.interval ?? entitlement.plan ?? 'active');
  if (entitlement.status === 'trialing') return t.account.statusTrialEnds(formatDate(entitlement.trialEndsAt, t));
  if (entitlement.status === 'past_due') return t.account.statusPastDue;
  if (entitlement.status === 'canceled') return t.account.statusCanceled;
  if (entitlement.status === 'legacy_free') return t.account.statusLegacyFree;
  return t.account.statusNone;
}

function planLabel(plan: BillingPlan, t: SubscriptionStrings) {
  return plan === 'monthly' ? t.plans.monthlyLabel : t.plans.annualLabel;
}

function AccountDashboard({ locale }: { locale: Locale }) {
  const t = getSubscriptionStrings(locale);
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

  const selectedShop = useMemo(() => shops.find((shop) => shop.id === selectedShopId), [selectedShopId, shops]);

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

  useEffect(() => {
    let active = true;
    if (!selectedShopId) return;

    async function loadEntitlement() {
      setError('');
      try {
        const token = await getToken();
        const response = await getEntitlement(selectedShopId, token);
        if (active) setEntitlement(response);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : t.account.errorLoadEntitlement);
      }
    }

    loadEntitlement();
    return () => {
      active = false;
    };
  }, [getToken, selectedShopId, t.account.errorLoadEntitlement]);

  const isActiveOrTrialing = entitlement?.status === 'active' || entitlement?.status === 'trialing';
  const currentPlan = (entitlement?.plan ?? entitlement?.interval) as BillingPlan | undefined;

  function openRazorpayCheckout(opts: { checkout: CheckoutResponse; description: string; onDone: () => void }) {
    const { checkout, description, onDone } = opts;

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
      handler: async (resp) => {
        try {
          const token = await getToken();
          await verifyPayment(resp, token);
        } catch {
          // Best-effort; webhook is canonical.
        }
        window.location.href = `/subscription/return?razorpay_subscription_id=${resp.razorpay_subscription_id}`;
      },
      modal: { ondismiss: onDone },
    });

    rzp.open();
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
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.errorStartCheckout);
      setBusy('');
    }
  }

  async function switchPlan(nextPlan: BillingPlan) {
    if (!selectedShopId) return;
    setBusy('switch-plan');
    setError('');
    try {
      const token = await getToken();
      const result = await changePlan(selectedShopId, nextPlan, token);
      openRazorpayCheckout({
        checkout: result,
        description: nextPlan === 'annual' ? t.plans.annualDescription : t.plans.monthlyDescription,
        onDone: () => setBusy(''),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.errorSwitchPlan);
      setBusy('');
    }
  }

  async function refreshPaymentMethod() {
    if (!selectedShopId) return;
    setBusy('payment-method');
    setError('');
    try {
      const token = await getToken();
      const result = await updatePaymentMethod(selectedShopId, token);
      openRazorpayCheckout({
        checkout: result,
        description: t.account.updatePaymentMethod,
        onDone: () => setBusy(''),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.errorPaymentMethod);
      setBusy('');
    }
  }

  async function cancel() {
    if (!selectedShopId) return;
    setBusy('cancel');
    setError('');
    try {
      const token = await getToken();
      const response = await cancelSubscription(selectedShopId, token);
      setEntitlement(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.account.errorCancel);
    } finally {
      setBusy('');
    }
  }

  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? t.account.accountFallback;

  return (
    <section className="subscription-section">
      <h1>{t.account.heading}</h1>
      <p className="subscription-lead">{t.account.leadWithEmail(accountEmail)}</p>

      {error ? <div className="subscription-alert">{error}</div> : null}

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
          <div className={entitlement?.status === 'past_due' ? 'status-badge warning' : 'status-badge'}>{statusLabel(entitlement, t)}</div>
          <h2>{selectedShop?.name ?? t.account.selectShop}</h2>
          <p className="muted">
            {entitlement?.status === 'active' || entitlement?.status === 'trialing'
              ? t.account.renewsOn(formatDate(entitlement.currentPeriodEnd ?? entitlement.trialEndsAt, t))
              : t.account.chooseIntervalPrompt}
          </p>

          {isActiveOrTrialing ? (
            <>
              <p className="muted" style={{ marginTop: '1rem' }}>
                {t.account.currentPlan(planLabel(currentPlan ?? 'monthly', t))}
              </p>
              <div className="portal-actions">
                {currentPlan && currentPlan !== 'annual' ? (
                  <button
                    className="subscription-button"
                    type="button"
                    disabled={busy === 'switch-plan'}
                    onClick={() => switchPlan('annual')}
                  >
                    {t.account.switchToAnnual(planCopy.annual.amount)}
                  </button>
                ) : null}
                {currentPlan && currentPlan !== 'monthly' ? (
                  <button
                    className="subscription-button"
                    type="button"
                    disabled={busy === 'switch-plan'}
                    onClick={() => switchPlan('monthly')}
                  >
                    {t.account.switchToMonthly(planCopy.monthly.amount)}
                  </button>
                ) : null}
                <button
                  className="subscription-button secondary"
                  type="button"
                  disabled={busy === 'payment-method'}
                  onClick={refreshPaymentMethod}
                >
                  {t.account.updatePaymentMethod}
                </button>
                <button
                  className="subscription-button danger"
                  type="button"
                  disabled={busy === 'cancel'}
                  onClick={cancel}
                >
                  {t.account.cancelSubscription}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pricing-toggle" role="group" aria-label={t.pricing.billingIntervalLabel}>
                {(['monthly', 'annual'] as BillingPlan[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={plan === item ? 'true' : 'false'}
                    onClick={() => setPlan(item)}
                  >
                    {planLabel(item, t)}
                  </button>
                ))}
              </div>
              <div className="portal-actions">
                <button
                  className="subscription-button"
                  type="button"
                  disabled={!selectedShopId || busy === 'checkout'}
                  onClick={startCheckout}
                >
                  {t.account.subscribeWithAmount(planCopy[plan].amount)}
                </button>
              </div>
            </>
          )}

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
          <div className="subscription-panel">
            <SignIn routing="hash" />
          </div>
        </section>
      ) : (
        <AccountDashboard locale={locale} />
      )}
    </>
  );
}
