import type {Cart} from '../cart';
import {readState,writeState} from '../gst-storage';
export type DraftState={state:'saving'|'saved'|'error';at:number|null};
const states=new Map<string,DraftState>(),revisions=new Map<string,string>(),listeners=new Set<()=>void>();
const key=(actor:string,shop:string)=>'counter-draft:v1:'+actor+':'+shop;
const emptyState:DraftState={state:'saving',at:null};
export function draftState(actor:string|null,shop:string|null){return actor&&shop?states.get(key(actor,shop))??emptyState:emptyState}
export function subscribeDraft(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn)}}
function publish(k:string,value:DraftState){states.set(k,value);listeners.forEach(fn=>fn())}
export function validCounterDraft(v:unknown):v is Cart{const c=v as Cart;return !!c&&Array.isArray(c.lines)&&c.lines.length<=500&&typeof c.note==='string'&&Number.isFinite(c.billDiscount)&&c.billDiscount>=0&&c.lines.every(l=>l&&['key','productId','name','unit'].every(k=>typeof (l as any)[k]==='string')&&Number.isFinite(l.quantity)&&l.quantity>0&&Number.isFinite(l.price)&&l.price>=0&&Number.isFinite(l.discount)&&l.discount>=0)}
export async function retainCounterDraft(actor:string,shop:string,cart:Cart){const k=key(actor,shop),revision=crypto.randomUUID();revisions.set(k,revision);publish(k,{state:'saving',at:null});try{if(!validCounterDraft(cart))throw Error('counter_draft_invalid');const row={version:1,actor,shop,revision,at:Date.now(),cart:structuredClone(cart)};await writeState(k,row);const saved=await readState<typeof row>(k);if(revisions.get(k)!==revision)return;if(!saved||saved.revision!==revision||JSON.stringify(saved.cart)!==JSON.stringify(row.cart))throw Error('counter_draft_unverified');publish(k,{state:'saved',at:row.at})}catch{if(revisions.get(k)===revision)publish(k,{state:'error',at:null})}}
export async function restoredCounterDraft(actor:string,shop:string){try{const row=await readState<{version:number;actor:string;shop:string;cart:Cart;at:number}>(key(actor,shop));return row?.version===1&&row.actor===actor&&row.shop===shop&&validCounterDraft(row.cart)?row.cart:null}catch{return null}}
export function failedCounterDraft(actor:string,shop:string){publish(key(actor,shop),{state:'error',at:null})}
