'use client';
import {useState} from 'react';
import {useShop} from './context';
import {Card,Field,Button,Notice,inputClass} from './ui';
import {useGstText} from './gst-ui';
import {useCart,type CartLine} from '../../lib/shop/cart';
import {prepareRspCartEntry,type RspPackageDraft} from '../../lib/shop/rsp-cart-entry';
import {formatINR} from '../../lib/shop/money';
export function RspCheckoutControls({available,regular}:{available:boolean;regular:boolean}){
 const {shop,userId}=useShop(),cart=useCart(userId,shop?.id??null);
 return <>{cart.cart.lines.filter(line=>line.rsp||line.gstRspSnapshot?.profiles.length).map(line=><RspLine key={line.key} line={line} available={available&&regular} apply={updated=>cart.patch({lines:cart.cart.lines.map(row=>row.key===line.key?{...row,...updated}:row)})}/>)}</>;
}
function RspLine({line,available,apply}:{line:CartLine;available:boolean;apply:(line:CartLine)=>void}){
 const {shop}=useShop(),text=useGstText();
 const [draft,setDraft]=useState<RspPackageDraft>({area:line.rsp?.valuation.area??'',packageId:line.rsp?.valuation.packageId??'',prices:line.rsp?.valuation.packages[0]?.declaredPrices.join(', ')??'',increases:line.rsp?.valuation.packages[0]?.increasedPrices?.join(', ')??'',evidence:line.rsp?.rounding.evidenceReference??'',reviewed:false});
 const [error,setError]=useState<unknown>(null),[result,setResult]=useState<ReturnType<typeof prepareRspCartEntry>['calculation']|null>(null);
 const patch=(key:keyof RspPackageDraft,value:string|boolean)=>setDraft(p=>({...p,[key]:value,...key!=='reviewed'?{reviewed:false}:{}}));
 const run=()=>{try{if(!shop||!line.gstRspSnapshot)throw Error('Refresh the catalog before reviewing this package.');const prepared=prepareRspCartEntry(line,line.gstRspSnapshot,shop.id,draft,new Date().toISOString());apply({...line,...prepared.line,productId:line.productId,name:line.name,unit:line.unit,price:line.price,discount:line.discount});setResult(prepared.calculation);setError(null);}catch(e){setError(e);}};
 return <Card className="grid gap-4"><div><h3 className="shop-section-title">{line.name} · {text('RSP package details')}</h3><p className="text-sm text-muted">{text('For products taxed using their declared retail price. The selling price and the statutory tax base are shown separately.')}</p></div><Notice error={error}/>{!available?<p className="text-danger">{text('RSP billing is unavailable for this shop. Remove this product or contact support.')}</p>:<><div className="form-grid is-2">{([['area','Sale area'],['packageId','Package reference'],['prices','Declared retail prices'],['increases','Increased retail prices (optional)'],['evidence','Review reference']] as const).map(([key,label])=><Field key={key} label={text(label)}><input className={inputClass} value={draft[key]} onChange={e=>patch(key,e.target.value)} placeholder={key==='prices'?text('Separate prices with commas'):undefined}/></Field>)}</div><label className="flex gap-3"><input type="checkbox" checked={draft.reviewed} onChange={e=>patch('reviewed',e.target.checked)}/>{text('I have checked these package prices and the review reference.')}</label><Button onClick={run}>{text('Review and apply package details')}</Button>{result?<div className="grid gap-2 text-sm"><p>{text('Selling value')} <strong>{formatINR(Number(result.commercial.netSaleValue))}</strong></p><p>{text('Statutory tax base')} <strong>{formatINR(Number(result.statutory.deemedTaxableValue))}</strong></p><p>{text('GST')} <strong>{formatINR(Number(result.statutory.tax))}</strong></p><p>{text('Payable')} <strong>{formatINR(Number(result.payable))}</strong></p></div>:null}</>}</Card>;
}
