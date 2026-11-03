'use client';
import {useEffect,useRef,useState} from 'react';
import {useShop} from './context';
import {createProductImageEditor,type ImageEditorState} from '../../lib/shop/product-images/editor';
import {createEditorRecovery} from '../../lib/shop/product-images/editor-recovery';
import type {ProductSaveScope} from '../../lib/shop/product-images/save-recovery';
import {prepareProductPhoto} from '../../lib/shop/product-images/prepare';
import {ProductImage} from './product-image';
import {Button} from './ui';
const storageKey='samaan-product-photo-editors-v1';
const journal=createEditorRecovery({get:async()=>localStorage.getItem(storageKey),set:async value=>localStorage.setItem(storageKey,value),clear:async()=>localStorage.removeItem(storageKey)});
const locked=<T,>(work:()=>Promise<T>)=>navigator.locks?.request(storageKey,work)??Promise.reject(Error('product_image_recovery_unavailable'));
export const retainProductPhotoEditors=(scope:ProductSaveScope|null)=>locked(()=>journal.retainScope(scope));

export function useProductImageEditor(product?:string,reset=0,slot=product??'new'){
 const {api,shop,userId,photoSessionId}=useShop(),key=`${userId}/${photoSessionId}/${shop?.id}/${slot}/${reset}`;
 const ref=useRef<{api:typeof api;key:string;editor:ReturnType<typeof createProductImageEditor<Blob>>}|null>(null);
 const [value,setValue]=useState<{api:typeof api;key:string;state:ImageEditorState<Blob>}|null>(null);
 useEffect(()=>{if(!shop||!userId||!photoSessionId)return;let live=true;
  const owner={actor:userId,session:photoSessionId,shop:shop.id},current=()=>{try{api.assertSession();return live;}catch{return false;}};
  const editor=createProductImageEditor<Blob>({uuid:()=>crypto.randomUUID(),current,capabilities:()=>api.productImages.capabilities(shop.id),...(product?{gallery:()=>api.productImages.gallery(shop.id,product)}:{}),draft:id=>api.productImages.draft(shop.id,id),upload:(draft,client,blob,signal)=>api.productImages.upload(shop.id,draft,client,blob,signal),outcome:client=>api.productImages.outcome(shop.id,client),recovery:{load:()=>locked(async()=>{await journal.retainScope(owner);return journal.load(owner,slot,current);}),save:checkpoint=>locked(()=>journal.save(owner,slot,checkpoint,current)),clear:()=>locked(()=>journal.remove(owner,slot,current))}});
  ref.current={api,key,editor};const unsubscribe=editor.subscribe(()=>setValue({api,key,state:editor.getSnapshot()}));setValue({api,key,state:editor.getSnapshot()});void editor.load();
  return()=>{live=false;unsubscribe();editor.dispose();if(ref.current?.editor===editor)ref.current=null;};
 },[api,key]);
 const editor=ref.current?.key===key&&ref.current.api===api?ref.current.editor:null,state=value?.key===key&&value.api===api?value.state:null;
 return {editor,state,dirty:editor?.dirty()??false,busy:!!state?.selectionPending||(state?.items.some(i=>i.status!=='ready')??false),clearRecovery:async()=>{const active=ref.current;if(active?.key!==key||active.api!==api)throw Error('auth_session_changed');await active.editor.clearRecovery();},manifest:async()=>{const active=ref.current;if(active?.key!==key||active.api!==api)throw Error('auth_session_changed');return active.editor.manifest();}};
}
export function ProductImageEditor({media,name,disabled=false,onBusyChange}:{media:ReturnType<typeof useProductImageEditor>;name:string;disabled?:boolean;onBusyChange?:(busy:boolean)=>void}){
 const {t}=useShop(),input=useRef<HTMLInputElement>(null),[preparing,setPreparing]=useState(false),[error,setError]=useState(false),replace=useRef<string|null>(null),{state,editor}=media;
 useEffect(()=>{onBusyChange?.(preparing);return()=>onBusyChange?.(false);},[preparing,onBusyChange]);
 useEffect(()=>{const element=input.current;if(!element||!editor)return;const cancel=()=>void editor.endSelection().catch(()=>setError(true));element.addEventListener('cancel',cancel);return()=>element.removeEventListener('cancel',cancel);},[editor]);
 const section=useRef<HTMLElement>(null),cards=useRef(new Map<string,HTMLDivElement>()),[resetFocus,setResetFocus]=useState(0);
 const focusTarget=(target:HTMLElement|null|undefined)=>{target?.focus({preventScroll:true});target?.scrollIntoView({block:'center',inline:'nearest'});};
 const focusCard=(id:string)=>focusTarget(cards.current.get(id));
 useEffect(()=>{if(resetFocus)focusTarget(section.current?.querySelector<HTMLButtonElement>('.product-photo-choose'));},[resetFocus]);
 const move=(id:string,index:number)=>{focusCard(id);editor?.move(id,index);};
 const remove=(id:string)=>{const index=state?.items.findIndex(item=>item.clientId===id)??-1,next=state?.items[index+1]??state?.items[index-1];if(next)focusCard(next.clientId);else focusTarget(section.current?.querySelector<HTMLButtonElement>('.product-photo-choose'));editor?.remove(id);};
 const text=(key:string)=>t('product_images.'+key,'product_images.'+key);
 const reset=async()=>{if(!editor)return;setPreparing(true);setError(false);try{await editor.reset();}catch{setError(true);}finally{setPreparing(false);setResetFocus(n=>n+1);}};
 const choose=async(id?:string)=>{if(!editor)return;replace.current=id??null;setError(false);try{await editor.beginSelection();if(input.current){input.current.value='';input.current.multiple=!id;input.current.click();}}catch{setError(true);}};
 const add=async(files:File[])=>{if(!editor||disabled||preparing)return;setPreparing(true);setError(false);
  try{await editor.beginSelection();const count=replace.current?1:5-(state?.items.length??0);if(files.length>count)throw Error('product_image_count');for(const file of files){const photo=await prepareProductPhoto(file);if(replace.current){editor.remove(replace.current);replace.current=null;}void editor.add(photo).catch(()=>setError(true));}}
  catch{setError(true);}finally{await editor.endSelection().catch(()=>setError(true));setPreparing(false);}
 };
 return <section ref={section} aria-label={text('title')} className="grid gap-3" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();replace.current=null;void add([...e.dataTransfer.files]);}}>
  <h2 className="shop-section-title">{text('title')}</h2><p className="shop-hint">{text('hint')}</p>
  {state?.restored?<p role="status">{text('draft_restored')}</p>:null}
  {state?.restored&&state.selectionPending?<div><p role="alert">{text('reselect')}</p><Button tone="ghost" disabled={disabled||preparing} onClick={()=>void editor?.endSelection().catch(()=>setError(true))}>{text('remove')}</Button></div>:null}
  {!state?.loaded?<p role="status">{text('loading')}</p>:null}
  {state?.loaded&&(!state.available||state.error)?<p role="status">{state.error==='product_image_recovery_unavailable'?t('opening.error.storage','opening.error.storage'):text('unavailable')}</p>:null}
  <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8}}>{state?.items.map((item,index)=><div key={item.clientId} ref={node=>{if(node)cards.current.set(item.clientId,node);else cards.current.delete(item.clientId);}} tabIndex={-1} role="group" aria-label={`${text('title')} ${index+1}/${state.items.length}`} style={{width:220,flexShrink:0,padding:12,borderRadius:12,border:'1px solid '+(index===0?'#FF6B00':'#555560'),display:'grid',gap:8}}>
   {item.local?<img src={item.local.uri} alt={item.image?.alt||name} width={194} height={150} style={{objectFit:'contain',borderRadius:8}}/>:item.recovered?<p className="shop-hint">{text('restored')}</p>:<ProductImage image={item.image} name={name} size={150} variant="card" decorative={false}/>}
   {item.status==='reselect'?<p role="alert">{text('reselect')}</p>:null}
   {index===0?<span className="shop-hint">{text('cover')}</span>:null}
   {item.status==='uploading'?<span role="status">{text('loading')}</span>:null}
   {item.status==='failed'?<><span role="alert">{text('failed')}</span><Button tone="ghost" disabled={disabled} onClick={()=>void editor?.retry(item.clientId)}>{text('retry')}</Button></>:null}
   {state.available&&state.canEdit?<>
    <input className="shop-field" aria-label={`${text('alt')}, ${index+1}/${state.items.length}`} placeholder={text('alt')} value={item.image?.alt??''} maxLength={240} disabled={disabled||preparing||item.status!=='ready'} onChange={e=>editor?.alt(item.clientId,e.target.value)}/>
    {index>0?<Button tone="ghost" disabled={disabled||preparing} onClick={()=>move(item.clientId,0)}>{text('set_cover')}</Button>:null}
    <div className="flex flex-wrap gap-2"><Button tone="ghost" disabled={disabled||preparing||index===0} onClick={()=>move(item.clientId,index-1)}>{text('previous')}</Button><Button tone="ghost" disabled={disabled||preparing||index===state.items.length-1} onClick={()=>move(item.clientId,index+1)}>{text('next')}</Button></div>
    <Button tone="ghost" disabled={disabled||preparing} onClick={()=>choose(item.clientId)}>{text('replace')}</Button><Button tone="ghost" disabled={disabled||preparing} onClick={()=>remove(item.clientId)}>{text('remove')}</Button>
   </>:null}
  </div>)}</div>
  <input ref={input} hidden type="file" multiple={!replace.current} accept="image/jpeg,image/png,image/webp" onChange={e=>void add([...(e.target.files??[])])}/>
  {state?.available&&state.canEdit?<Button className="product-photo-choose" tone="ghost" disabled={disabled||preparing||state.items.length>=5} onClick={()=>choose()}>{text('library')}</Button>:null}
  {state?.available&&state.canEdit&&media.dirty?<Button tone="ghost" disabled={disabled||preparing||state.items.some(i=>i.status==='uploading')} onClick={()=>void reset()}>{text('reset')}</Button>:null}
  {error?<p role="alert">{text('error')}</p>:null}
 </section>;
}
