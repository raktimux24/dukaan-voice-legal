import type { Locale } from '../i18n';

// Copy for the account page states introduced with the automatic trial and
// period-end plan switching (Sept 2026). Kept separate from
// subscriptionStrings.ts so new keys don't have to land in all 11 locales at
// once: every locale falls back to English per key until it's translated.
export type AccountStrings = {
  // status badge
  statusTrialAuto: (days: number) => string;
  statusTrialMandate: (date: string) => string;
  statusPendingAuth: string;
  statusExpired: string;
  statusCancelScheduled: string;

  // status panel lead lines
  leadTrialAuto: (date: string) => string;
  leadTrialMandate: (plan: string, date: string) => string;
  leadTrialCancelled: (date: string) => string;
  leadActive: (date: string) => string;
  leadCancelScheduled: (date: string) => string;
  leadPastDue: string;
  leadPendingAuth: string;
  leadExpired: string;
  leadCanceled: string;
  leadNone: (days: number) => string;
  leadLegacyFree: string;

  // subscribe block
  subscribeDuringTrialNote: (date: string) => string;
  subscribeNowNote: string;
  subscribeAgain: (amount: string) => string;
  finishSetup: (amount: string) => string;

  // manage block
  currentPlanShort: (label: string) => string;
  switchExplainer: (date: string) => string;
  switchExplainerNoPeriod: string;
  updatePaymentExplainer: string;
  restorePaymentMethod: string;

  // pending switch card
  pendingSwitchTitle: (plan: string, date: string) => string;
  pendingPaymentTitle: (date: string) => string;
  pendingBody: string;
  pendingNeedsAuth: string;
  pendingAuthorise: string;
  pendingKeepCurrent: string;
  pendingCancelConfirm: string;
  pendingCancelled: string;

  // cancel
  cancelConfirmActive: (date: string) => string;
  cancelConfirmTrial: (date: string) => string;
  cancelDoneActive: (date: string) => string;
  cancelDoneTrial: (date: string) => string;
  cancelTrialButton: string;

  // misc
  ownerOnly: string;
  signedInAs: (email: string, role: string) => string;
  switchAccount: string;
  openInApp: string;
  errorPendingSwitch: string;
};

const en: AccountStrings = {
  statusTrialAuto: (days) => (days <= 0 ? 'Free trial — ends today' : `Free trial — ${days} day${days === 1 ? '' : 's'} left`),
  statusTrialMandate: (date) => `Trial — plan starts ${date}`,
  statusPendingAuth: 'Setup not finished',
  statusExpired: 'Trial ended',
  statusCancelScheduled: 'Cancellation scheduled',

  leadTrialAuto: (date) => `Premium is free until ${date}. No payment method is on file — subscribe below to keep Premium after that. You won't be charged before ${date}.`,
  leadTrialMandate: (plan, date) => `Your ${plan} plan starts automatically on ${date}. Nothing to do.`,
  leadTrialCancelled: (date) => `You cancelled your trial. Premium stays on until ${date} and you won't be charged.`,
  leadActive: (date) => `Renews on ${date}.`,
  leadCancelScheduled: (date) => `Premium stays on until ${date}, then your plan ends. You can subscribe again any time after that.`,
  leadPastDue: 'Your last UPI auto-debit failed, so Premium is paused. Set up a new payment method below to restore it — Razorpay will also keep retrying the existing mandate for a few days.',
  leadPendingAuth: 'You started checkout but the UPI Autopay mandate was not authorised. Start again below — it only takes a minute.',
  leadExpired: 'Your free trial has ended. Your inventory is safe; voice, predictions and analytics are paused until you subscribe.',
  leadCanceled: 'Your subscription has ended. Subscribe again to bring Premium back.',
  leadNone: (days) => `New shops get ${days} days of Premium free. Subscribe to keep it going after that.`,
  leadLegacyFree: 'This shop has Premium for free, for good. Nothing to pay.',

  subscribeDuringTrialNote: (date) => `Your remaining free days carry over — the first charge is on ${date}.`,
  subscribeNowNote: 'You will be charged today and Premium switches on as soon as Razorpay confirms.',
  subscribeAgain: (amount) => `Subscribe again — ${amount}`,
  finishSetup: (amount) => `Finish setup — ${amount}`,

  currentPlanShort: (label) => `Current plan: ${label}.`,
  switchExplainer: (date) => `Switching plans keeps your current plan until ${date}; the new plan starts that day. You'll authorise a new UPI Autopay mandate now — no extra charge until then.`,
  switchExplainerNoPeriod: 'Switching plans requires authorising a new UPI Autopay mandate now; the new plan starts immediately.',
  updatePaymentExplainer: 'UPI Autopay mandates can\'t be edited, so updating your payment method sets up a new mandate that takes over when the current one would next charge.',
  restorePaymentMethod: 'Set up a new payment method',

  pendingSwitchTitle: (plan, date) => `Switching to ${plan} on ${date}`,
  pendingPaymentTitle: (date) => `New payment method takes over on ${date}`,
  pendingBody: 'Your current plan continues until then. We\'ll switch automatically once the new mandate charges.',
  pendingNeedsAuth: 'The new UPI Autopay mandate hasn\'t been authorised yet. Finish it before the switch date or the change is dropped and your current plan simply continues.',
  pendingAuthorise: 'Authorise now',
  pendingKeepCurrent: 'Keep current plan',
  pendingCancelConfirm: 'Cancel the scheduled change? Your current plan continues as-is and nothing is charged for the cancelled change.',
  pendingCancelled: 'Scheduled change cancelled.',

  cancelConfirmActive: (date) => `Cancel your subscription? You keep Premium until ${date}, then it ends. No further charges.`,
  cancelConfirmTrial: (date) => `End your trial? You keep Premium until ${date} and you will never be charged.`,
  cancelDoneActive: (date) => `Cancelled. Premium stays on until ${date}.`,
  cancelDoneTrial: (date) => `Trial cancelled. Premium stays on until ${date}; you won't be charged.`,
  cancelTrialButton: 'Cancel trial',

  ownerOnly: 'Only the shop owner can change billing for this shop.',
  signedInAs: (email, role) => `You're signed in as ${email} (${role}). Sign in with the shop owner's account — the same one as the phone — to subscribe.`,
  switchAccount: 'Switch account',
  openInApp: 'Open in the app',
  errorPendingSwitch: 'Unable to load the scheduled change.',
};

// Per-locale overrides. Add keys here as translations land; anything missing
// falls back to English.
const overrides: Partial<Record<Locale, Partial<AccountStrings>>> = {};

export function getAccountStrings(locale: Locale): AccountStrings {
  return { ...en, ...(overrides[locale] ?? {}) };
}
