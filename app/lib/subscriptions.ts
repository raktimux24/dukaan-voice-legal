export type BillingPlan = 'monthly' | 'annual';

export type Shop = {
  id: string;
  name: string;
  role?: string;
  ownerId?: string;
};

export type Invoice = {
  id: string;
  date: string;
  amount: number;
  currency?: string;
  status?: string;
  invoiceUrl?: string;
};

export type EntitlementStatus =
  | 'legacy_free'
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired'
  | 'pending_authentication';

// Mirrors GET /api/subscriptions/entitlement (server/src/lib/entitlement.ts).
export type SubscriptionEntitlement = {
  status: EntitlementStatus;
  plan: BillingPlan | null;
  isPremium: boolean;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  // 'auto' = free trial granted on shop creation, no payment method on file.
  // 'razorpay' = trial backed by a UPI Autopay mandate (charges at trialEnd).
  trialSource: 'auto' | 'razorpay' | null;
  daysLeftInTrial: number;
  trialDays: number;
  cancelAtPeriodEnd: boolean;
  // True when a UPI Autopay mandate backs this shop.
  hasMandate?: boolean;
  // A scheduled plan switch / payment-method refresh waiting to take over.
  pendingPlan: BillingPlan | null;
  pendingReason: 'plan_switch' | 'payment_method' | null;
  scheduledSwitchAt: string | null;
  invoices?: Invoice[];
};

// No payment method on file → the shop can (and must) subscribe on the web.
export function hasMandate(entitlement: SubscriptionEntitlement | undefined): boolean {
  if (!entitlement) return false;
  if (typeof entitlement.hasMandate === 'boolean') return entitlement.hasMandate;
  // Older server: infer from status / trial source.
  if (entitlement.status === 'trialing') return entitlement.trialSource === 'razorpay';
  return entitlement.status === 'active' || entitlement.status === 'past_due';
}

export type CheckoutResponse = {
  shortUrl: string;
  subscriptionId?: string;
  keyId?: string;
  // Set by /change-plan and /update-payment-method: when the new mandate takes over.
  scheduledSwitchAt?: string | null;
};

export type PendingSwitch = {
  subscriptionId: string;
  keyId?: string;
  shortUrl: string | null;
  remoteStatus: string | null;
  needsAuthorisation: boolean;
  plan: BillingPlan | null;
  reason: 'plan_switch' | 'payment_method' | null;
  scheduledSwitchAt: string | null;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

export type ApiError = Error & { code?: string; status?: number };

// Server error codes → sentences. Anything else falls back to the raw body.
const ERROR_MESSAGES: Record<string, string> = {
  shop_already_premium: 'This shop already has Premium.',
  no_active_subscription: 'There is no active subscription to change on this shop.',
  same_plan: 'That is already your current plan.',
  switch_already_scheduled: 'A plan change is already scheduled for this shop. Cancel it first to schedule a different one.',
  no_pending_switch: 'There is no scheduled change on this shop.',
  previous_subscription_cancel_failed: 'We could not close your previous subscription. Please try again in a minute.',
  plan_not_configured: 'Billing is temporarily unavailable. Please try again later.',
  'Insufficient permissions': 'Only the shop owner can change billing.',
};

async function apiFetch<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.');
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let code = '';
    try {
      code = (JSON.parse(text) as { error?: string }).error ?? '';
    } catch {
      // not JSON
    }
    const err = new Error(ERROR_MESSAGES[code] ?? (text || `Request failed with status ${response.status}`)) as ApiError;
    err.code = code || undefined;
    err.status = response.status;
    throw err;
  }

  return response.json() as Promise<T>;
}

export async function getShops(token: string | null) {
  const response = await apiFetch<{ shops?: Shop[] } | Shop[]>('/api/shops', token);
  return { shops: Array.isArray(response) ? response : response.shops ?? [] };
}

export async function getEntitlement(shopId: string, token: string | null) {
  const query = new URLSearchParams({ shopId });
  return apiFetch<SubscriptionEntitlement>(`/api/subscriptions/entitlement?${query}`, token);
}

type CheckoutWire = {
  shortUrl?: string;
  short_url?: string;
  subscriptionId?: string;
  subscription_id?: string;
  keyId?: string;
  key_id?: string;
  scheduledSwitchAt?: string | null;
};

function normalizeCheckout(response: CheckoutWire): CheckoutResponse {
  return {
    shortUrl: response.shortUrl ?? response.short_url ?? '',
    subscriptionId: response.subscriptionId ?? response.subscription_id,
    keyId: response.keyId ?? response.key_id,
    scheduledSwitchAt: response.scheduledSwitchAt ?? null,
  };
}

export async function createCheckout(shopId: string, plan: BillingPlan, token: string | null) {
  const response = await apiFetch<CheckoutWire>('/api/subscriptions/checkout', token, {
    method: 'POST',
    body: JSON.stringify({ shopId, plan }),
  });
  return normalizeCheckout(response);
}

export async function changePlan(shopId: string, plan: BillingPlan, token: string | null) {
  const response = await apiFetch<CheckoutWire>('/api/subscriptions/change-plan', token, {
    method: 'POST',
    body: JSON.stringify({ shopId, plan }),
  });
  return normalizeCheckout(response);
}

export async function updatePaymentMethod(shopId: string, token: string | null) {
  const response = await apiFetch<CheckoutWire>('/api/subscriptions/update-payment-method', token, {
    method: 'POST',
    body: JSON.stringify({ shopId }),
  });
  return normalizeCheckout(response);
}

export async function cancelSubscription(shopId: string, token: string | null) {
  return apiFetch<SubscriptionEntitlement>('/api/subscriptions/cancel', token, {
    method: 'POST',
    body: JSON.stringify({ shopId }),
  });
}

export async function cancelPlanSwitch(shopId: string, token: string | null) {
  return apiFetch<SubscriptionEntitlement>('/api/subscriptions/cancel-plan-switch', token, {
    method: 'POST',
    body: JSON.stringify({ shopId }),
  });
}

export async function getPendingSwitch(shopId: string, token: string | null) {
  const query = new URLSearchParams({ shopId });
  return apiFetch<PendingSwitch>(`/api/subscriptions/pending-switch?${query}`, token);
}

export const planCopy: Record<BillingPlan, { label: string; price: string; suffix: string; amount: string }> = {
  monthly: {
    label: 'Monthly',
    price: '₹499',
    suffix: '/month',
    amount: '₹499/month',
  },
  annual: {
    label: 'Annual',
    price: '₹3,999',
    suffix: '/year',
    amount: '₹3,999/year',
  },
};
