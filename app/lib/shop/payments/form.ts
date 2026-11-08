import type { PosSettings } from '../types';
import { normalizeIndianMobile } from '../phone';
export const MAX_QR_ENCODED = 1_500_000;
export const validVpa = (value: string) => !value.trim() || /^[a-z0-9._-]{2,}@[a-z0-9.-]{2,}$/i.test(value.trim());
export function paymentDraft(s: PosSettings) {
  return { upiVpa: s.upiVpa ?? '', upiPayeeName: s.upiPayeeName ?? '', shopPhone: s.shopPhone ?? '', shopAddress: s.shopAddress ?? '', billHeader: s.billHeader ?? '', billFooter: s.billFooter ?? '', defaultPaymentMethod: s.defaultPaymentMethod, voidWindowHours: String(s.voidWindowHours), cardEnabled: s.cardEnabled };
}
export type PaymentDraft = ReturnType<typeof paymentDraft>;
export function paymentChanges(current: PosSettings, draft: PaymentDraft) {
  const phone = normalizeIndianMobile(draft.shopPhone), hours = Number(draft.voidWindowHours);
  if (!validVpa(draft.upiVpa)) return { error: 'vpa' as const, patch: {} };
  if (phone === 'invalid') return { error: 'phone' as const, patch: {} };
  if (!Number.isInteger(hours) || hours < 1 || hours > 720) return { error: 'hours' as const, patch: {} };
  const next = { ...draft, upiVpa: draft.upiVpa.trim().toLowerCase() || null, upiPayeeName: draft.upiPayeeName.trim() || null, shopPhone: phone, shopAddress: draft.shopAddress.trim() || null, billHeader: draft.billHeader.trim() || null, billFooter: draft.billFooter.trim() || null, voidWindowHours: hours };
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(next) as (keyof typeof next)[]) if (next[key] !== current[key]) patch[key] = next[key];
  return { error: undefined, patch };
}
export const activeGstProfile = (registration?: string) => registration === 'regular' || registration === 'composition';
