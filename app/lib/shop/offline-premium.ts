import type {SubscriptionEntitlement} from '../subscriptions';
export type RetainedEntitlement=SubscriptionEntitlement&{offlineValidUntil?:number};
export function premiumDeadline(value:RetainedEntitlement):number|null {
  const dates:number[]=[];
  if(value.offlineValidUntil!==undefined)dates.push(value.offlineValidUntil);
  const end=value.status==='active'?value.currentPeriodEnd:value.status==='trialing'?value.trialEnd:null;
  if(!value.temporaryPremium&&(value.status==='active'||value.status==='trialing'))dates.push(end?Date.parse(end):NaN);
  return dates.length?Math.min(...dates):null;
}
export function premiumAt(value:RetainedEntitlement|null|undefined,now=Date.now()):boolean {
  if(!value?.isPremium)return false;
  const deadline=premiumDeadline(value);
  return deadline===null||Number.isFinite(deadline)&&now<deadline;
}
/** Keep billing access evidence, excluding mandate identifiers and invoice download URLs. */
export function retainEntitlement(value:SubscriptionEntitlement,now=Date.now()):RetainedEntitlement {
  return {status:value.status,plan:value.plan,isPremium:value.isPremium,temporaryPremium:value.temporaryPremium===true,currentPeriodEnd:value.currentPeriodEnd,trialEnd:value.trialEnd,trialSource:value.trialSource,daysLeftInTrial:value.daysLeftInTrial,trialDays:value.trialDays,cancelAtPeriodEnd:value.cancelAtPeriodEnd,pendingPlan:null,pendingReason:null,scheduledSwitchAt:null,offlineValidUntil:now+7*86400000};
}
