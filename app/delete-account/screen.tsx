"use client";
import {useAuth,useUser,useClerk,SignIn} from '@clerk/nextjs';
import {useState,useMemo} from 'react';
import {Card,PageHeader} from '../components/shop/ui';
import {DeletionControl} from '../components/shop/deletion-control';
import {bindApi} from '../lib/shop/api';
import {DELETION_SUPPORT_URL} from '../lib/shop/deletion/workflow';
import {useUtilityLanguage} from '../components/shop/utility-language';
import '../shop/shop.css';
export function AccountDeletionPage(){
 const {isLoaded,isSignedIn,user}=useUser(),{getToken}=useAuth();
 const clerk=useClerk();
 const {language,t,select}=useUtilityLanguage();
 const [completed,setCompleted]=useState(false);
 const api=useMemo(()=>bindApi(getToken),[getToken]);
 return <main className="shop-root utility-root"><div className="shop-page utility-workspace">
 <PageHeader kicker="Samaan Bol" title={t('settings.delete_account')} back={{href:'/',label:t('nav.home')}}/>
 {select}
 <Card className="grid gap-4 utility-status">
 {completed?<><p role="status">{t('deletion.deleted')}</p><a href="/">{t('nav.home')}</a></>:isLoaded&&isSignedIn&&user?<DeletionControl key={user.id} kind="account" language={language} isCurrent={() => !!user && clerk.user?.id === user.id} t={t} removeRecords={()=>api.deleteAccount()} removeIdentity={()=>user.delete()} onDeleted={()=>setCompleted(true)}/>:
 <><p>{t('settings.delete_account_message')}</p><a href={DELETION_SUPPORT_URL}>{t('deletion.support')} · samaan-bol@outlook.com</a><a href="/privacy-policy#s6">{t('settings.privacy_policy')}</a>{isLoaded?<SignIn routing="hash" forceRedirectUrl="/delete-account"/>:<p>{t('common.loading')}</p>}</>}
 </Card></div></main>;
}
