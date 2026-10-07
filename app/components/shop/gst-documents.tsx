"use client";
import { useShop } from "./context";
import { Button, Notice, NoAccess } from "./ui";
import { useGstQuery, ReadState } from "./gst-workspace";
import { Section, useGstText, useFiscalDate } from "./gst-ui";
import { verifyDocument } from "../../lib/shop/gst-document";
import { documentView } from "../../lib/shop/gst-document-view";
import { documentHtml, printDocument } from "../../lib/shop/gst-print";
import { saveFile } from "../../lib/shop/gst-storage";
import { formatINR } from "../../lib/shop/money";
export function GstDocuments({ saleId }: { saleId: string }) {
 const {api,shop,perms}=useShop(),text=useGstText(),date=useFiscalDate();
 const q=useGstQuery(['fiscal-documents',saleId],async()=>{
  const rows=await api.gst.fiscalDocuments(shop!.id,saleId);
  return Promise.all(rows.map(async doc=>{try{await verifyDocument(doc,shop!.id,saleId);return {doc,view:documentView(doc),error:null};}catch(error){return {doc,view:null,error};}}));
 },perms.canSeeReports);
 if(!perms.canSeeReports)return <NoAccess what={text('Ask a shop administrator to open the verified GST document.')}/>;
 const address=(party: {address:string;structuredAddress?:{address1:string;address2?:string;location:string;pincode:string}},version?:string)=>version==='gst_bill_v2'&&party.structuredAddress?[party.structuredAddress.address1,party.structuredAddress.address2,party.structuredAddress.location,party.structuredAddress.pincode].filter(Boolean).join(', '):party.address;
 return <div className="grid gap-4"><ReadState query={q} empty={!q.data?.length}>{q.data?.map(({doc,view,error})=><Section key={doc.id} title={`${text(doc.type.replaceAll('_',' '))} ${doc.number}`} summary={date(doc.issuedAt)} open>
  <Notice error={error}/>{!view?<Button tone="ghost" onClick={()=>saveFile(JSON.stringify(doc,null,2),`samaan-document-${doc.id}.json`,'application/json')}>{text('Download document for support')}</Button>:<article className="gst-document" id={'gst-doc-'+doc.id}>
   <header><p><b>{text(doc.type.replaceAll('_',' '))} {doc.number}</b></p><p>{date(doc.issuedAt)}</p><h2 className="shop-section-title">{view.context.settings.legalName}</h2><p>{address(view.context.settings,view.context.documentRenderVersion)}</p><p>GSTIN {view.context.settings.gstin}</p><p>{text('State / place of supply')}: {view.context.placeOfSupply}</p></header>
   {view.context.buyer?<div className="gst-row"><b>{view.context.buyer.name}</b><span>{view.context.buyer.gstin}</span><p>{address(view.context.buyer,view.context.documentRenderVersion)}</p></div>:null}
   {doc.originalNumber?<p>{text('Original invoice')}: {doc.originalNumber}</p>:null}
   {view.reason?<p>{text('Reason')}: {view.reason}</p>:null}
   <div className="gst-table-wrap"><table className="gst-table"><thead><tr><th>{text('Product')}</th><th>{text('Quantity')}</th><th>{text('HSN / SAC')}</th><th>{text('Before GST')}</th><th>{text('Taxable value')}</th><th>{text('GST')}</th><th>{text('Total')}</th></tr></thead><tbody>{view.lines.map((line,index)=><tr key={index}><td>{line.name}</td><td>{line.quantity} {line.unit}</td><td>{line.classification}<br/>{line.rate}</td><td>{formatINR(line.net)}{line.discount>0?<p>{text('Discount')}: {formatINR(line.discount)}</p>:null}</td><td>{formatINR(line.taxable)}</td><td>{formatINR(line.tax)}{Object.entries(line.components).filter(([,v])=>v>0).map(([k,v])=><p key={k}>{k} {formatINR(v)}</p>)}</td><td>{formatINR(line.total)}</td></tr>)}</tbody></table></div>
   <div className="gst-price-preview"><span>{text('Before GST')}<b>{formatINR(view.net)}</b></span><span>{text('GST reporting taxable value')}<b>{formatINR(view.taxable)}</b></span><span>GST<b>{formatINR(view.tax)}</b></span>{Object.entries(view.components).filter(([,v])=>v>0).map(([k,v])=><span key={k}>{k}<b>{formatINR(v)}</b></span>)}{view.roundOff!==0?<span>{text('Round-off')}<b>{formatINR(view.roundOff)}</b></span>:null}<span>{text('Total')}<b>{formatINR(view.total)}</b></span>{view.creditReduction!==undefined?<span>{text('Unpaid credit reduced')}<b>{formatINR(view.creditReduction)}</b></span>:null}{view.moneyRefund!==undefined?<span>{text('Money refund')}<b>{formatINR(view.moneyRefund)}</b></span>:null}</div>
   {doc.type==='bill_of_supply'?<p>{text('Composition taxable person, not eligible to collect tax on supplies')}</p>:<p>{text('Reverse charge: No (local forward-charge supply)')}</p>}
   <p className="shop-hint">{text('Authorised signatory')} __________________</p><p className="shop-hint">{text('The app does not digitally sign GST documents. Sign a printed copy when required.')}</p>
   <div className="shop-actions no-print"><Button tone="ghost" onClick={()=>{const el=document.getElementById('gst-doc-'+doc.id);if(el)saveFile(documentHtml(el,doc.number),`samaan-${doc.number.replace(/[^a-zA-Z0-9-]/g,'-')}.html`,'text/html');}}>{text('Download bill')}</Button><Button tone="ghost" onClick={()=>{const el=document.getElementById('gst-doc-'+doc.id);if(el)printDocument(el,doc.number);}}>{text('Print / save PDF')}</Button><Button tone="ghost" onClick={()=>saveFile(JSON.stringify(doc,null,2),`samaan-${doc.id}.json`,'application/json')}>{text('Download saved document')}</Button></div>
  </article>}
 </Section>)}</ReadState></div>;
}
