'use client';
import {useState} from 'react';
import {useShop} from './context';
import {imageUuid} from '../../lib/shop/product-images/contract';
import {formatQty} from '../../lib/shop/units';
import {ProductImageById} from './product-image';
/** Current presentation beside history, never inside the captured receipt DOM. */
export function ProductPhotos({rows,title,historical=true}:{rows:{productId?:string|null;name:string;quantity?:number;unit?:string}[];title?:string;historical?:boolean}){
 const {t}=useShop(),[open,setOpen]=useState(false),items=rows.filter(row=>!historical||imageUuid(row.productId));
 if(!items.length)return null;
 return <details className="shop-card no-print" open={open} onToggle={event=>setOpen(event.currentTarget.open)} style={{padding:16,marginBlock:12}}><summary style={{minHeight:44,cursor:'pointer',color:'#FF9A50'}}>{title??t('product_images.current_title','Current product photos')}</summary>{open?<div className="grid gap-3">{historical?<p className="shop-hint">{t('product_images.current_help','These are current photos; packaging may differ from the time of sale.')}</p>:null}{items.map((item,index)=><div key={`${item.productId??'custom'}/${index}`} className="flex items-center gap-3"><ProductImageById productId={item.productId} name={item.name} size={40}/><div><p>{item.name}</p>{item.quantity!=null&&item.unit?<p className="shop-hint">{formatQty(item.quantity,item.unit)}</p>:null}</div></div>)}</div>:null}</details>;
}
