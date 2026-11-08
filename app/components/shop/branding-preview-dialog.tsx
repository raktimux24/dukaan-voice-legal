'use client';
import { useEffect,useRef } from 'react';
import { DocumentPreview } from './document-preview';
import type { DocumentsApi } from '../../lib/shop/documents/client';
import { useShop } from './context';
import { Button } from './ui';
export function BrandingPreviewDialog({preview,close}:{preview:Awaited<ReturnType<DocumentsApi['preview']>>;close:()=>void}) {
 const {t}=useShop(),dialog=useRef<HTMLDivElement>(null),closeRef=useRef(close);closeRef.current=close;
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();return()=>{document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus();};},[]);
 return <div className="branding-preview-dialog" role="dialog" aria-modal="true" aria-label={t('documents.preview_title','Document preview')} ref={dialog} tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}if(e.key==='Tab'){const nodes=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')??[]),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}><div className="branding-preview-sheet"><header><h2>{t('documents.preview_title','Document preview')}</h2><Button tone="ghost" onClick={close}>{t('documents.close','Close preview')}</Button></header><DocumentPreview {...preview}/></div></div>;
}
