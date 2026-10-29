"use client";
import {useAuth,useUser,useClerk,SignIn} from '@clerk/nextjs';
import {useState,useMemo} from 'react';
import {Card,Field,PageHeader} from '../components/shop/ui';
import {DeletionControl} from '../components/shop/deletion-control';
import {bindApi} from '../lib/shop/api';
import {translateUi} from '../lib/shop/translations';
import {SUPPORTED_LANGUAGES} from '../lib/shop/languages';
import {DELETION_SUPPORT_URL} from '../lib/shop/deletion/workflow';
import {EN_FALLBACK} from '../lib/shop/en-fallback';
import '../shop/shop.css';
export function AccountDeletionPage(){
 const {isLoaded,isSignedIn,user}=useUser(),{getToken}=useAuth();
 const clerk=useClerk();
 const [language,setLanguage]=useState('en');
 const [completed,setCompleted]=useState(false);
 const api=useMemo(()=>bindApi(getToken),[getToken]);
 const t=(key:string)=>translateUi(language,{},key,EN_FALLBACK[key]??key);
 return <main className="shop-root"><div className="shop-page mx-auto max-w-2xl p-5">
 <PageHeader kicker="Samaan Bol" title={t('settings.delete_account')} back={{href:'/',label:t('nav.home')}}/>
 <Field label={t('settings.app_language')}><select className="shop-field" value={language} onChange={e=>setLanguage(e.target.value)}>{SUPPORTED_LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</select></Field>
 <Card className="grid gap-4">
 {completed?<><p role="status">{t('deletion.deleted')}</p><a href="/">{t('nav.home')}</a></>:isLoaded&&isSignedIn&&user?<DeletionControl key={user.id} kind="account" language={language} isCurrent={() => !!user && clerk.user?.id === user.id} t={t} removeRecords={()=>api.deleteAccount()} removeIdentity={()=>user.delete()} onDeleted={()=>setCompleted(true)}/>:
 <><p>{t('settings.delete_account_message')}</p><a href={DELETION_SUPPORT_URL}>{t('deletion.support')} · meetslimshady07@gmail.com</a><a href="/privacy-policy#s6">{t('settings.privacy_policy')}</a>{isLoaded?<SignIn routing="hash" forceRedirectUrl="/delete-account"/>:<p>{t('common.loading')}</p>}</>}
 </Card></div></main>;
}
