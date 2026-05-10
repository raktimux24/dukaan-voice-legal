export type BillingPlan = 'monthly' | 'annual';

export type Shop = {
  id: string;
  name: string;
  role?: string;
};

export type Invoice = {
  id: string;
  date: string;
  amount: number;
  currency?: string;
  status?: string;
  invoiceUrl?: string;
};

export type SubscriptionEntitlement = {
  status: 'legacy_free' | 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'pending_authentication';
  plan?: BillingPlan;
  interval?: BillingPlan;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
  cancelAtPeriodEnd?: boolean;
  invoices?: Invoice[];
};

export type CheckoutResponse = {
  shortUrl: string;
  subscriptionId?: string;
  keyId?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

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
    const message = await response.text().catch(() => '');
    throw new Error(message || `Request failed with status ${response.status}`);
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
};

function normalizeCheckout(response: CheckoutWire): CheckoutResponse {
  return {
    shortUrl: response.shortUrl ?? response.short_url ?? '',
    subscriptionId: response.subscriptionId ?? response.subscription_id,
    keyId: response.keyId ?? response.key_id,
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

export async function verifyPayment(
  payload: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  },
  token: string | null,
) {
  return apiFetch<{ ok: boolean }>('/api/subscriptions/android/verify', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
