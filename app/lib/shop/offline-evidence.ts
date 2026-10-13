import {permitsOfflineShopFallback} from './offline-shop-context';
import {canonicalJson} from './gst-core/sale-request-canonical';
import {readState,writeState,sha256} from './gst-storage';

export type EvidenceScope={actorId:string;sessionId:string;isCurrent:(shopId:string)=>boolean;isSessionCurrent?:()=>boolean;onFallback?:(shopId:string)=>void};
type Store={read:(key:string)=>Promise<unknown>;write:(key:string,value:unknown)=>Promise<void>};
type Entry={version:1;actorId:string;sessionId:string;shopId:string;kind:string;capturedAt:number;value:unknown;hash:string};
const MAX_AGE=7*86400000;
/** Only complete, validated reads are retained. A cache never substitutes for authorization or an issuance grant. */
export function createOfflineEvidence(scope:EvidenceScope,store:Store={read:readState,write:writeState},now:()=>number=Date.now) {
  const check=(shopId:string)=>{if(!(shopId==='@account'?scope.isSessionCurrent?.():scope.isCurrent(shopId)))throw Error('offline_evidence_scope_changed');};
  const key=(shop:string,kind:string)=>`read-cache:v1:${scope.actorId}:${scope.sessionId}:${shop}:${kind}`;
  const clear=async(shop:string,kind:string)=>{try{await store.write(key(shop,kind),null);}catch{/* Cache invalidation must not mask the originating server error. */}};
  return {
    clear,
    async read<T>(shopId:string,kind:string,load:()=>Promise<T>,validate:(value:unknown)=>value is T,project:(value:T)=>T=value=>value):Promise<T>{
      check(shopId);
      try {
        const value=await load();check(shopId);
        if(!validate(value))throw Error('offline_evidence_invalid');
        try {
          const retained=project(value);
          const entry:Entry={version:1,actorId:scope.actorId,sessionId:scope.sessionId,shopId,kind,capturedAt:now(),value:retained,hash:await sha256(canonicalJson(retained))};
          check(shopId);await store.write(key(shopId,kind),entry);check(shopId);
          const saved=await store.read(key(shopId,kind));check(shopId);
          if(canonicalJson(saved)!==canonicalJson(entry))throw Error('offline_evidence_storage_unverified');
        }catch{await clear(shopId,kind);}
        check(shopId);return value;
      }catch(error){
        check(shopId);
        if(!permitsOfflineShopFallback(error)){await clear(shopId,kind);throw error;}
        try{
          const entry=await store.read(key(shopId,kind)) as Entry|null;check(shopId);
          const at=now();
          if(!entry||entry.version!==1||entry.actorId!==scope.actorId||entry.sessionId!==scope.sessionId||entry.shopId!==shopId||entry.kind!==kind||!Number.isFinite(entry.capturedAt)||entry.capturedAt>at||at-entry.capturedAt>MAX_AGE||!validate(entry.value)||entry.hash!==await sha256(canonicalJson(entry.value)))throw error;
          check(shopId);scope.onFallback?.(shopId);return entry.value;
        }catch{throw error;}
      }
    },
  };
}
