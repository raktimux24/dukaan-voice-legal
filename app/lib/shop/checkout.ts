/** Payments are validated as decimal rupees, then balanced in integer paise. */
export type TenderMode = 'cash' | 'upi' | 'card' | 'credit' | 'split';
export function checkoutMoney(value: string): number | null {
  const text = value.trim();
  if (!text || text.length > 40 || !/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const paise = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return paise <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(paise) / 100 : null;
}
const paise = (amount:number) => Math.round(amount * 100);
export function checkoutPayment(total:number, mode:TenderMode|null, cash:string, split:{cash:string;upi:string;credit:string;tendered:string}) {
  const amount = (value:string) => value.trim() ? checkoutMoney(value) : 0;
  const parts = [amount(split.cash), amount(split.upi), amount(split.credit)];
  const validSplit = mode !== 'split' || parts.every(v => v !== null);
  const cashPortion = mode === 'cash' ? total : mode === 'split' ? parts[0] ?? 0 : 0;
  const upiPortion = mode === 'upi' ? total : mode === 'split' ? parts[1] ?? 0 : 0;
  const creditPortion = mode === 'credit' ? total : mode === 'split' ? parts[2] ?? 0 : 0;
  const cardPortion = mode === 'card' ? total : 0;
  const rawTendered = mode === 'split' ? split.tendered : cash;
  const tendered = rawTendered.trim() ? checkoutMoney(rawTendered) : cashPortion;
  const validTender = cashPortion <= 0 || tendered !== null;
  const remainder = (paise(total) - paise(cashPortion) - paise(upiPortion) - paise(creditPortion) - paise(cardPortion)) / 100;
  const short = cashPortion > 0 && (tendered === null || paise(tendered) < paise(cashPortion));
  return {cashPortion,upiPortion,creditPortion,cardPortion,tendered:tendered ?? 0,remainder,cashShort:short,valid:validSplit && validTender,change:Math.max(0,(paise(tendered ?? 0)-paise(cashPortion))/100)};
}
export function checkoutDefault(hint:TenderMode|undefined,last:string|null,fallback:TenderMode,cardEnabled:boolean):TenderMode {
  const remembered = ['cash','upi','card','split'].includes(last ?? '') ? last as TenderMode : fallback;
  const next = hint ?? remembered;
  return next === 'card' && !cardEnabled ? 'cash' : next;
}
export function checkoutUpiUri(vpa:string|null|undefined,payee:string,amount:number,ready:boolean):string {
  if (!ready || !vpa || !Number.isFinite(amount) || amount <= 0) return '';
  return `upi://pay?${new URLSearchParams({pa:vpa,pn:payee,am:amount.toFixed(2),cu:'INR'})}`;
}
