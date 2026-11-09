"use client";
import {useEffect,useRef,useState} from 'react';
import {loadBundledLanguage,translateUi} from '../../lib/shop/translations';
import {SUPPORTED_LANGUAGES} from '../../lib/shop/languages';
import {EN_FALLBACK} from '../../lib/shop/en-fallback';
import copy from '../../lib/shop/gst-web-locales.json';
export function useUtilityLanguage(){
 const [language,setLanguage]=useState('en'),[dictionary,setDictionary]=useState<Record<string,string>>({});
 const generation=useRef(0);
 useEffect(()=>{const value=new URLSearchParams(window.location.search).get('lang');if(SUPPORTED_LANGUAGES.some(l=>l.code===value))setLanguage(value!);},[]);
 useEffect(()=>{const request=++generation.current;void loadBundledLanguage(language).then(value=>{if(request===generation.current)setDictionary(value)});return()=>{generation.current++}},[language]);
 const t=(key:string)=>translateUi(language,dictionary,key,(copy.en as Record<string,string>)[key]??EN_FALLBACK[key]??key);
 const select=<label className="shop-label utility-language">{t('settings.app_language')}<select className="shop-field" value={language} onChange={e=>{setLanguage(e.target.value);const url=new URL(window.location.href);url.searchParams.set('lang',e.target.value);window.history.replaceState(null,'',url)}}>{SUPPORTED_LANGUAGES.map(l=><option value={l.code} key={l.code}>{l.label}</option>)}</select></label>;
 return {language,t,select};
}
