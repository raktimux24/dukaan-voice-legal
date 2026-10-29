'use client';
import {useMemo,useState} from 'react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {InventoryImportPanel} from '../../components/shop/screens/inventory-import';
import {bindInventoryImports,type ImportSend} from '../../lib/shop/imports/client';
import retail from '../../lib/shop/retail-locales.json';
import {EN_FALLBACK} from '../../lib/shop/en-fallback';
import gst from '../../lib/shop/gst-locales.json';
import {SUPPORTED_LANGUAGES} from '../../lib/shop/languages';

const names:Record<string,string>=Object.fromEntries(SUPPORTED_LANGUAGES.map(l=>[l.code,l.label]));
const send:ImportSend=async(path,init)=>{const res=await fetch('/api/dev-inventory-import'+path.split('/imports')[1],{...init,headers:{'Content-Type':'application/json'}});const data=await res.json();if(!res.ok)throw Object.assign(Error(data.error),{code:data.error});return data;};
const api=bindInventoryImports(send);
export function ImportDevelopmentPreview(){
 const [qc]=useState(()=>new QueryClient()),[language,setLanguage]=useState('en');
 const t=useMemo(()=>{const dict={...EN_FALLBACK,...(gst as Record<string,Record<string,string>>)[language],...(retail as Record<string,Record<string,string>>)[language]};return (key:string,vars?:Record<string,string|number>)=>{let text=dict[key]??key;for(const [k,v] of Object.entries(vars??{}))text=text.replaceAll('{{'+k+'}}',String(v));return text;};},[language]);
 return <QueryClientProvider client={qc}><main className="shop-root" style={{padding:'24px',maxWidth:'1100px',margin:'0 auto'}}><div role="status" className="import-notice" style={{marginBottom:24}}>{t('imports.preview_notice')}</div><label className="shop-label">{t('settings.app_language')}<select className="shop-field" value={language} onChange={e=>setLanguage(e.target.value)}>{Object.entries(names).map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label><InventoryImportPanel api={api} shopId="10000000-0000-4000-8000-000000000001" actorId="owner" language={language} t={t} backHref="/dev/inventory-import" sampleFile={{filename:'sample-inventory.csv',base64:btoa('name,barcode,category,subcategory,unit,sellingPrice,mrp,purchasePrice,initialStock,minStockLevel\nSample Rice,000012345678,staples,rice,kg,65,80,50,20,5\nSample Flour,000012345679,staples,atta-flours,kg,45,60,35,10,3\nDuplicate code,000012345678,staples,rice,kg,50,70,40,0,5')}}/></main></QueryClientProvider>;
}
