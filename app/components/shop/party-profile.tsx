'use client';
import {useQuery} from '@tanstack/react-query';
import {useShop} from './context';
import {Card,Button} from './ui';
import {formatINR} from '../../lib/shop/money';
import type {PartyKind} from '../../lib/shop/party-imports/contract';
export function PartyProfileCard({kind,id}:{kind:PartyKind;id:string}){
 const {api,shop,userId,perms,t:translate}=useShop(),client=kind==='customer'?api.customerImports:api.supplierImports;
 const t=(key:string,vars?:Record<string,string|number>)=>translate(key,key,vars);
 const q=useQuery({queryKey:['partyProfile',shop?.id,kind,id,userId],queryFn:()=>client.profile(shop!.id,id),enabled:!!shop&&!!userId&&(kind==='customer'?perms.canManageCustomers:perms.canSeeCost),retry:false});
 if(!(kind==='customer'?perms.canManageCustomers:perms.canSeeCost))return null;
 if(q.isError)return <Button tone="ghost" onClick={()=>void q.refetch()}>{t('partiesImport.profile_retry')}</Button>;
 if(!q.data)return null;const {contact,opening}=q.data;if(!opening&&!contact.email&&!contact.address&&!contact.gstin&&!contact.notes)return null;
 return <Card><h2 className="shop-section-title">{t('partiesImport.profile')}</h2><dl className="import-values">{(['phone','email','gstin','address','stateCode','notes'] as const).map(f=>contact[f]?<div key={f}><dt>{t('partiesImport.field.'+f)}</dt><dd>{contact[f]}</dd></div>:null)}</dl>{opening?<><h3 className="mt-4 font-semibold">{t('partiesImport.'+kind+'_opening')}</h3><p>{t('partiesImport.dated_balance',{amount:formatINR(Number(opening.amount)),date:opening.asOf})}</p><p className="shop-hint" style={{color:'#A0A0A8'}}>{t('partiesImport.recorded',{date:new Date(opening.recordedAt).toLocaleDateString()})}</p><p className="shop-hint mt-3" style={{color:'#A0A0A8'}}>{t('partiesImport.'+kind+'_balance_help')}</p>{opening.canOpenSource?<Button tone="ghost" href={'/shop/'+kind+'s/import?jobId='+opening.importId}>{t('partiesImport.source')}</Button>:null}</>:null}</Card>;
}
