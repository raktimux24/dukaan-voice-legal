import { hasMandate, type SubscriptionEntitlement } from '../subscriptions';

export function billingActions(ent: SubscriptionEntitlement | undefined, owner: boolean, managementOnly = false) {
  const mandate = hasMandate(ent);
  const settled = !!ent && !ent.cancellationPending && !ent.billingSyncPending;
  const pending = !!ent?.pendingReason;
  const status = ent?.status;
  const renewable = ['active', 'past_due', 'pending_authentication', 'trialing'].includes(status ?? '');
  return {
    mandate,
    subscribe: owner && settled && !managementOnly && !pending && !ent?.temporaryPremium &&
      (['none', 'expired', 'canceled'].includes(status ?? '') || ((status === 'trialing' || status === 'pending_authentication') && !mandate)),
    manage: owner && settled && !managementOnly && mandate && renewable && !pending && !ent?.cancelAtPeriodEnd,
    cancel: owner && !!ent && !ent.cancellationPending && !ent.cancelAtPeriodEnd && status !== 'legacy_free' &&
      (mandate || !!ent.needsAuthorization || pending),
    pending: owner && settled && pending && !!ent?.canCancelPendingSwitch,
  };
}
export function billingDate(value: string | null | undefined, language: string, unavailable: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return unavailable;
  const locale = language === 'hinglish' ? 'en-IN' : language + '-IN';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}
export function invoiceHref(value?: string) {
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : undefined; } catch { return undefined; }
}
