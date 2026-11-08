import type {Customer,LedgerEntry} from './types';
import {normalizeIndianMobile} from './phone';
export const customerBalanceKey=(balance:number)=>balance>0?'customers.owes_label':balance<0?'customers.advance_label':'customers.settled';
export function customerInput(name:string,phone:string){const normalized=normalizeIndianMobile(phone);if(!name.trim())return {error:'customers.name'} as const;if(normalized==='invalid')return {error:'customerweb.phone_error'} as const;return {value:{name:name.trim(),phone:normalized}} as const;}
export const customerEditPatch=(customer:Customer,name:string,phone:string)=>{const input=customerInput(name,phone);if(!input.value)return input;return {value:{...(input.value.name!==customer.name?{name:input.value.name}:{}),...((input.value.phone??null)!==(customer.phone??null)?{phone:input.value.phone}: {})}};};
export const customerBillLink=(entry:LedgerEntry)=>entry.saleId?'/shop/sales/'+encodeURIComponent(entry.saleId):null;
export function nextCustomerPage(last:{customers:Customer[];hasMore:boolean},pages:{customers:Customer[]}[]){return last.hasMore&&last.customers.length?pages.reduce((n,p)=>n+p.customers.length,0):undefined;}
