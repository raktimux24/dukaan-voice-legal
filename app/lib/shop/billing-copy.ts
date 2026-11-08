import type { AccountStrings } from '../../content/accountStrings';
import type { SubscriptionStrings } from '../../content/subscriptionStrings';
import copy from './gst-web-locales.json';
export type BillingTranslate = (key: string, fallback: string, vars?: Record<string, string | number>) => string;
export function billingCopy(language: string, translate?: BillingTranslate) {
  return (key: string, vars?: Record<string,string|number>) => {
    const id = 'billingweb.'+key;
    let value = (copy as Record<string,Record<string,string>>)[language]?.[id] ?? copy.en[id as keyof typeof copy.en] ?? key;
    if (translate) return translate(id, value, vars);
    for (const [k,v] of Object.entries(vars??{})) value = value.replaceAll('{{'+k+'}}',String(v));
    return value;
  };
}
export function billingAccountCopy(base: AccountStrings, b: ReturnType<typeof billingCopy>, t: SubscriptionStrings): AccountStrings {
  return {...base,
    statusTrialAuto: days=>b(days>0?'trial_left':'trial_today',{days}),
    statusTrialMandate: date=>b('trial_renew',{date}),
    statusPendingAuth:b('setup_status'), statusExpired:b('expired_status'),
    statusCancelScheduled:b('cancel_scheduled'),
    leadTrialAuto:date=>b('trial_auto',{date}), leadTrialMandate:(_plan,date)=>b('trial_renew',{date}),
    leadTrialCancelled:date=>b('trial_cancelled',{date}),leadActive:date=>b('renew',{date}),
    leadCancelScheduled:date=>b('access_until',{date}), leadPastDue:b('past_due'), leadPendingAuth:b('no_access'),
    leadExpired:b('expired'),leadCanceled:b('canceled'),leadNone:()=>b('no_access'),leadLegacyFree:b('legacy'),
    subscribeDuringTrialNote:date=>b('subscribe_trial',{date}),subscribeNowNote:b('subscribe_now'),
    subscribeAgain:amount=>t.account.subscribeWithAmount(amount),finishSetup:amount=>t.account.subscribeWithAmount(amount),
    currentPlanShort:label=>b('current_plan')+': '+label,
    switchExplainer:date=>b('switch_info',{date}),switchExplainerNoPeriod:b('switch_no_date'),
    updatePaymentExplainer:b('payment_info'),restorePaymentMethod:t.account.updatePaymentMethod,
    pendingSwitchTitle:(plan,date)=>b('pending_switch',{plan,date}),pendingPaymentTitle:date=>b('payment_switch',{date}),
    pendingBody:b('pending_body'),pendingNeedsAuth:b('pending_auth'),pendingAuthorise:b('authorise'),
    pendingKeepCurrent:b('keep_current'),pendingCancelConfirm:b('pending_confirm'),pendingCancelled:b('cancelled'),
    cancelConfirmActive:date=>b('cancel_confirm',{date}),cancelConfirmTrial:date=>b('cancel_confirm',{date}),
    cancelDoneActive:date=>b('cancel_done',{date}),cancelDoneTrial:date=>b('cancel_done',{date}),
    cancelTrialButton:t.account.cancelSubscription, ownerOnly:b('owner'), signedInAs:(email,role)=>email+' · '+role,
    errorPendingSwitch:b('request_error'),
  };
}
// The public website uses Hindi for Hinglish URLs; the shop has a distinct UI language.
export function hinglishBilling(base: SubscriptionStrings): SubscriptionStrings {
  return {...base,plans:{monthlyLabel:'Monthly',annualLabel:'Annual',monthlyDescription:'Monthly Premium plan',annualDescription:'Annual Premium plan'},
    pricing:{...base.pricing,billingIntervalLabel:'Billing interval'},
    account:{...base.account,heading:'Billing',statusLoading:'Status load ho raha hai…',statusActive:p=>'Premium · '+p,statusPastDue:'Payment fail hua',statusCanceled:'Subscription khatam',statusLegacyFree:'Grandfathered Premium',statusNone:'Paid plan nahi hai',dateUnavailable:'Date available nahi hai',selectShop:'Shop chunein',shopRoleFallback:'Member',errorLoadShops:'Shops load nahi hui',errorLoadEntitlement:'Status load nahi hua',noShops:'Koi shop nahi mili',loadingShops:'Shops load ho rahi hain…',
    switchToAnnual:amount=>'Annual par badlein · '+amount,switchToMonthly:amount=>'Monthly par badlein · '+amount,updatePaymentMethod:'Payment method badlein',cancelSubscription:'Subscription cancel karein',subscribeWithAmount:amount=>'Subscribe karein · '+amount,paymentHistory:'Payment history',invoiceDate:'Date',invoiceAmount:'Amount',invoiceStatus:'Status',invoiceColumn:'Invoice',invoicePaid:'Paid',invoicePending:'Abhi available nahi',invoiceDownload:'Invoice dekhein',noInvoices:'Abhi koi invoice nahi hai'}};
}
