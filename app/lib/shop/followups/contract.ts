import type {CreditObligation} from '../credit/contract';
export const FOLLOWUP_LANGUAGES=['en','hi','hinglish','ta','te','bn','mr','kn','gu','ml'] as const;
export type FollowupLanguage=typeof FOLLOWUP_LANGUAGES[number];
export type FollowupFilter='due'|'overdue'|'unpaid'|'partial'|'paid'|'all';
export type FollowupChannel='whatsapp'|'sms'|'copy';
export interface FollowupSettings {enabled:boolean;language:FollowupLanguage|null;startHour:number;endHour:number;snoozeUntil:string|null}
export const DEFAULT_FOLLOWUP_SETTINGS:FollowupSettings={enabled:true,language:null,startHour:9,endHour:20,snoozeUntil:null};
export interface FollowupRow {customer:{id:string;name:string;phone:string|null};balance:string;unassigned:string;status:'paid'|'partial'|'unpaid';due:string;overdue:string;unknown:string;nextDue:string|null;eligible:boolean;blocked:string|null;lastAt:string|null;lastKind:string|null;snoozeUntil:string|null;enabled:boolean;taskDay:string|null}
export interface FollowupPreview {templateVersion:1;obligations:Pick<CreditObligation,'key'|'reference'|'kind'|'original'|'remaining'|'status'|'dueDate'>[];id:string;customerId:string;customerName:string;phone:string;shopName:string;amount:string;language:FollowupLanguage;message:string;sourceKeys:string[];dueDate:string|null;paymentLink:string|null;fingerprint:string;createdAt:string;expiresAt:string;channel?:FollowupChannel}
export interface FollowupEvent {previewId:string|null;id:string;kind:string;actor:string;actorName?:string;at:string;note:string;preview:FollowupPreview|null;channel:FollowupChannel|null}
export interface FollowupHistoryPage {items:FollowupEvent[];nextCursor:string|null}
export interface FollowupDetail {row:FollowupRow;obligations:CreditObligation[];settings:FollowupSettings;shopSettings:FollowupSettings;language:FollowupLanguage;history:FollowupEvent[];historyNextCursor:string|null;role:string;preview?:FollowupPreview}
export interface FollowupPage {rows:FollowupRow[];nextCursor:string|null;scanned:number;today:string;shopSettings:FollowupSettings;role:string}
export type FollowupAction=
 |{kind:'settings';target:'shop'|'customer';settings:FollowupSettings;note:string}
 |{kind:'snooze';until:string|null;note:string}
 |{kind:'prepare';sourceKeys:string[];language:FollowupLanguage}
 |{kind:'launch';previewId:string;channel:FollowupChannel}
 |{kind:'outcome';previewId:string;channel:FollowupChannel;outcome:'composer_opened'|'unavailable'|'cancelled'|'merchant_sent'|'copied';note:string}
 |{kind:'contacted';note:string};
export interface FollowupRequest {clientId:string;action:FollowupAction}
export interface FollowupResult {status:'recorded';preview?:FollowupPreview}
export const followupErrorKey=(e:unknown)=>{if((e as any)?.code==='followups_load_unavailable'||(e as any)?.status===408||(e as any)?.status>=500)return 'followups.error.load_unavailable';const code=(e as any)?.code??(e as any)?.message??String(e??'');return 'followups.error.'+(/^followups_(invalid|not_allowed|owner|not_found|stale|settled|allocation|unknown|disabled|snoozed|quiet|cooldown|phone|reason|date|conflict|storage|unavailable)$/.test(code)?code.slice(10):'failed')};
export function followupUri(p:FollowupPreview,channel:FollowupChannel){const phone=p.phone.replace(/^\+91/,'');if(!/^[6-9]\d{9}$/.test(phone))throw Error('followups_phone');return channel==='whatsapp'?`whatsapp://send?phone=91${phone}&text=${encodeURIComponent(p.message)}`:`sms:+91${phone}?body=${encodeURIComponent(p.message)}`}
