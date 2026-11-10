"use client";
import {cashMoney} from "../../lib/shop/cashbook/format";
import {Button,Field,inputClass} from './ui';
type Opt = { value: string; label: string };
export type ExpenseFormProps = {
  tr: (key: string) => string;
  categories: Opt[];
  methods: Opt[];
  today: string;
  amount: string;
  setAmount: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  paid: boolean;
  setPaid: (v: boolean) => void;
  method: string;
  setMethod: (v: string) => void;
  payee: string;
  setPayee: (v: string) => void;
  reference: string;
  setReference: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  disabled?: boolean;
  onSubmit: () => void;
};


export function ExpenseForm(p:ExpenseFormProps){const {tr}=p,future=p.date>p.today,valid=/^\d{1,10}(\.\d{1,2})?$/.test(p.amount)&&Number(p.amount)>0;return <form className="cash-expense-form" onSubmit={e=>{e.preventDefault();if(!p.disabled&&valid)p.onSubmit()}}>
<section className="cash-expense-amount"><Field label={tr('amount')}><input autoFocus className={inputClass} inputMode="decimal" value={p.amount} disabled={p.disabled} onChange={e=>p.setAmount(e.target.value.replace(/[^0-9.]/g,''))} placeholder="0"/></Field><div className="opening-actions">{[100,500,1000,5000].map(n=><Button key={n} tone="ghost" disabled={p.disabled} onClick={()=>p.setAmount(String((Number(p.amount)||0)+n))}>+{cashMoney(String(n))}</Button>)}</div></section>
<div className="cash-expense-fields"><Field label={tr('category')}><select className={inputClass} value={p.category} disabled={p.disabled} onChange={e=>p.setCategory(e.target.value)}>{p.categories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></Field><Field label={tr('date')}><input className={inputClass} type="date" value={p.date} disabled={p.disabled} onChange={e=>p.setDate(e.target.value)}/></Field>
<label className="import-confirm"><input type="checkbox" checked={p.paid&&!future} disabled={p.disabled||future} onChange={e=>p.setPaid(e.target.checked)}/>{tr('expense_paid')}</label>{p.paid&&!future?<Field label={tr('method')}><select className={inputClass} value={p.method} disabled={p.disabled} onChange={e=>p.setMethod(e.target.value)}>{p.methods.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></Field>:null}<p className="shop-hint">{tr('expense_paid_help')}</p></div>
<details className="retail-details"><summary>{tr('reference')}</summary><div className="cash-expense-fields"><Field label={tr('payee')}><input className={inputClass} value={p.payee} disabled={p.disabled} onChange={e=>p.setPayee(e.target.value)}/></Field><Field label={tr('reference')}><input className={inputClass} value={p.reference} disabled={p.disabled} onChange={e=>p.setReference(e.target.value)}/></Field><Field label={tr('note')}><textarea className={inputClass} value={p.note} disabled={p.disabled} onChange={e=>p.setNote(e.target.value)}/></Field></div></details>
<Button disabled={p.disabled||!valid} onClick={()=>{if(!p.disabled&&valid)p.onSubmit()}}>{tr('save_expense')}{p.amount?' · '+cashMoney(p.amount):''}</Button></form>}
