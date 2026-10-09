import type {ShopApi} from './api';
import type {Allocation} from './gst-types';
import {financialYear,allocationNumber,validateSettings,type GstSettings} from './gst-core/gst';
import {assertRoundingSelection} from './gst-core/payable-rounding-request';
import {parseRetainedRoundingGrant,localRoundingGrantIssue,type RetainedRoundingGrant} from './rounding-grant';
import {financialScope,assertScope,readState,writeState,withFinancialLock,type Scope} from './gst-storage';
type GrantState=Allocation & {roundingGrant?:RetainedRoundingGrant;roundingGrantRequest?:{requestId:string;allocationId:string;deviceEpoch:string;policyVersion:string}};
/** Caller holds the actor/shop financial lock. Preparation never advances an invoice number. */
export async function ensureInvoiceAllocation(api:ShopApi,active:Scope,settings:GstSettings) {
      const epochKey = `epoch:${active.actorId}`;
      let deviceEpoch = await readState<string>(epochKey);
      if (!deviceEpoch) {
        deviceEpoch = crypto.randomUUID();
        await writeState(epochKey, deviceEpoch);
      }
      const key = `allocation:${active.actorId}:${active.shopId}`;
      let allocation = await readState<GrantState>(key);
      const now = new Date();
      if (
        !allocation ||
        allocation.issuer !== settings.gstin ||
        allocation.financialYear !== financialYear(now) ||
        !Number.isInteger(allocation.next) || allocation.next < 1 || allocation.next > 100 ||
        allocation.deviceEpoch !== deviceEpoch || !/^[a-f0-9-]{36}$/i.test(allocation.id) ||
        !Number.isInteger(allocation.block) || allocation.block < 1 ||
        !Number.isFinite(Date.parse(allocation.expiresAt)) ||
        Date.parse(allocation.expiresAt) <= Date.now() ||
        allocation.gstVersion !== settings.version
      ) {
        allocation = {
          ...(await api.gst.provision(active.shopId, {
            deviceEpoch,
            gstVersion: settings.version,
          })),
          next: 1,
          gstVersion: settings.version,
        };
        assertScope(active);
        if (
          !/^[a-f0-9-]{36}$/i.test(allocation.id) ||
          allocation.deviceEpoch !== deviceEpoch ||
          allocation.issuer !== settings.gstin ||
          allocation.financialYear !== financialYear(now) ||
          !Number.isInteger(allocation.block) ||
          allocation.block < 1 ||
          !Number.isFinite(Date.parse(allocation.expiresAt)) ||
          Date.parse(allocation.expiresAt) <= now.getTime()
        )
          throw Error("The invoice number reservation could not be verified.");
      }
      assertScope(active);
      await writeState(key,allocation);assertScope(active);
      return {allocation,deviceEpoch};
}
export async function ensureRoundingGrant(api:ShopApi,active:Scope,original:GrantState,deviceEpoch:string,enabled:boolean) {
 const key=`allocation:${active.actorId}:${active.shopId}`;
 let allocation=original;
      let grant:RetainedRoundingGrant|undefined;
      if(enabled){
        const at=new Date().toISOString();
        const selected=assertRoundingSelection(active.shopId,at,await api.gst.roundingSelection(active.shopId,at));assertScope(active);
        if(!selected.selection)throw Error('A reviewed rounding policy is required before billing.');
        const policyVersion=selected.selection.version;
        const expected=(issuedAt:string)=>({shopId:active.shopId,actorId:active.actorId,deviceEpoch,allocationId:allocation!.id,issuer:allocation!.issuer,financialYear:allocation!.financialYear,index:allocation!.next,number:allocationNumber(allocation!,allocation!.next),issuedAt,policyVersion});
        if(allocation.roundingGrant){try{grant=localRoundingGrantIssue(allocation.roundingGrant,expected(new Date().toISOString()));}catch{/* Refresh expired or superseded capability. */}}
        if(!grant){
          const previous=allocation.roundingGrantRequest;
          const request=previous?.policyVersion===policyVersion?previous:{requestId:crypto.randomUUID(),allocationId:allocation.id,deviceEpoch,policyVersion};
          allocation={...allocation,roundingGrantRequest:request};await writeState(key,allocation);assertScope(active);
          const response=parseRetainedRoundingGrant(await api.gst.roundingGrant(active.shopId,{requestId:request.requestId,allocationId:request.allocationId,deviceEpoch:request.deviceEpoch}));assertScope(active);
          localRoundingGrantIssue(response,{...expected(response.signedGrant.grant.validFrom),policyVersion:response.signedGrant.grant.policy.version});
          if(response.signedGrant.grant.policy.version!==policyVersion||Date.parse(response.signedGrant.grant.expiresAt)<=Date.now()){
            allocation={...allocation,roundingGrantRequest:undefined};await writeState(key,allocation);throw Error('Rounding policy changed. Refresh checkout before charging.');
          }
          grant=localRoundingGrantIssue(response,expected(new Date().toISOString()));
          allocation={...allocation,roundingGrant:grant,roundingGrantRequest:undefined};await writeState(key,allocation);assertScope(active);
        }
      }
 return {grant,allocation};
}

/** Warm capabilities while online, so the first offline bill does not require provisioning. */
export async function prepareOfflineInvoices(api:ShopApi,shopId:string) {
 const active=financialScope(shopId);
 return withFinancialLock(active,async()=>{
  const pos=await api.getPosSettings(shopId);assertScope(active);
  const settings=pos.gstSettings;
  if(!pos.gstAvailable||!settings||!['regular','composition'].includes(settings.registration))return null;
  validateSettings(settings);
  const {allocation,deviceEpoch}=await ensureInvoiceAllocation(api,active,settings);
  const {grant}=await ensureRoundingGrant(api,active,allocation,deviceEpoch,pos.gstPayableRoundingAvailable===true);
  assertScope(active);
  return {expiresAt:grant?new Date(Math.min(Date.parse(allocation.expiresAt),Date.parse(grant.signedGrant.grant.expiresAt))).toISOString():allocation.expiresAt};
 });
}
