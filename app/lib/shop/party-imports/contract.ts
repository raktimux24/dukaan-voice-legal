import type {ImportSheet,ImportTemplate} from '../imports/contract';
export type {ImportSheet,ImportTemplate};
export const PARTY_IMPORT_VERSION=1;
export const PARTY_FIELDS=['name','phone','email','gstin','address','stateCode','notes','openingBalance'] as const;
export type PartyField=typeof PARTY_FIELDS[number];
export type PartyKind='customer'|'supplier';
export type PartyData={name:string;phone?:string;email?:string;gstin?:string;address?:string;stateCode?:string;notes?:string;openingBalance?:string};
export type PartyOptions={sheet:number;mapping:Partial<Record<PartyField,number>>;mode:'create'|'update';asOf:string;skipRows:number[]};
export type PartyRow={row:number;name:string;action:'create'|'update'|'skip';issues:{code:string;field?:PartyField}[];warnings:{code:string}[];party?:PartyData;before?:PartyData;targetId?:string;targetHash?:string;outcome?:{partyId:string;action:'create'|'update'}};
export type PartyJob={id:string;kind:PartyKind;filename:string;createdAt:string;version:number;state:'uploaded'|'review'|'applying'|'applied';sourceHash:string;sheets:ImportSheet[];options?:PartyOptions;rows:PartyRow[];completedRequests:string[];total:number;applied:number};
export type PartyMetadata={available:boolean;version:number;jobs:Pick<PartyJob,'id'|'filename'|'state'|'createdAt'|'total'|'applied'>[]};
export type PartyProfile={partyId:string;kind:PartyKind;contact:PartyData;opening:null|{amount:string;asOf:string;importId:string;recordedAt:string;canOpenSource:boolean}};
export function partyCounts(rows:PartyRow[]){return {create:rows.filter(r=>r.action==='create'&&!r.issues.length).length,update:rows.filter(r=>r.action==='update'&&!r.issues.length).length,skip:rows.filter(r=>r.action==='skip').length,errors:rows.filter(r=>r.action!=='skip'&&r.issues.length>0).length};}
export function inferPartyMapping(headers:string[]):PartyOptions['mapping']{
 const aliases:Record<string,PartyField>={customername:'name',suppliername:'name',partyname:'name',mobile:'phone',phonenumber:'phone',mobilenumber:'phone',emailaddress:'email',gstnumber:'gstin',state:'stateCode',balance:'openingBalance',openingdues:'openingBalance',openingdebt:'openingBalance'};
 const mapping:PartyOptions['mapping']={};headers.forEach((h,i)=>{const key=h.replace(/[\s_-]/g,'').toLowerCase(),f=PARTY_FIELDS.find(f=>f.toLowerCase()===key)??aliases[key];if(f&&mapping[f]===undefined)mapping[f]=i;});return mapping;
}
