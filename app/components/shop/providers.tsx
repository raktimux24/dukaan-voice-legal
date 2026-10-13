'use client';
import {BROWSER_PUSH_OWNER,disconnectBrowserPush} from './browser-notifications';
import {assertPushSession,beginPushSession,pushSession,withPushSession} from '../../lib/shop/browser-push-session';

import { AuthenticateWithRedirectCallback, useAuth, useClerk } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {clearOfflineShop,createOfflineShopContext,loadOfflineShop,offlineShopRecord,permitsOfflineShopFallback,saveOfflineShop} from '../../lib/shop/offline-shop-context';
import {premiumAt,premiumDeadline} from '../../lib/shop/offline-premium';
import {syncQueuedSales} from '../../lib/shop/gst-issuance';
import { setFinancialScope } from '../../lib/shop/gst-storage';
import { loadBundledLanguage, translateUi } from '../../lib/shop/translations';
import { bindApi } from '../../lib/shop/api';
import { permissionsFor, parseRole } from '../../lib/shop/permissions';
import type { ShopRecord, UserPreferences } from '../../lib/shop/types';
import { AuthScreen } from './auth-screen';
import { ShopChrome } from './chrome';
import {BillingShell,clearBillingShell} from './billing-shell';
import { ShopContext, type ShopContextValue } from './context';

/** Codes accepted by PATCH /api/preferences. Punjabi and Odia are not in that list. */
const APP_LANGUAGES = new Set(['en', 'hi', 'hinglish', 'bn', 'ta', 'te', 'mr', 'kn', 'gu', 'ml']);

function flattenStrings(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') {
    if (prefix) out[prefix] = value;
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  const record = value as Record<string, unknown>;
  const nested = record.translations && typeof record.translations === 'object' ? record.translations : record;
  for (const [key, child] of Object.entries(nested)) {
    if (key === 'translations') continue;
    const next = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') out[next] = child;
    else if (child && typeof child === 'object') flattenStrings(child, next, out);
  }
  return out;
}

function ShopSession({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
  const { signOut } = useClerk();
  useLayoutEffect(()=>{
    const lease=beginPushSession(isSignedIn&&userId?userId:null);
    if(!('serviceWorker' in navigator))return;
    // Clear old ownership promptly; subscription mutations stay serialized below.
    void navigator.serviceWorker.getRegistration('/').then(registration=>{
      assertPushSession(lease);
      let bound:string|null=null;try{bound=localStorage.getItem(BROWSER_PUSH_OWNER);}catch{}
      registration?.active?.postMessage({type:'BIND_PUSH_ACCOUNT',actorId:isSignedIn&&bound===userId?userId:null});
    }).catch(()=>{});
    void withPushSession(lease,async check=>{
      const registration=await navigator.serviceWorker.getRegistration('/');check();
      let bound:string|null=null;try{bound=localStorage.getItem(BROWSER_PUSH_OWNER);}catch{}
      const subscription=await registration?.pushManager.getSubscription();check();
      if(subscription&&bound!==lease.actorId){await subscription.unsubscribe();check();try{localStorage.removeItem(BROWSER_PUSH_OWNER);}catch{}}
    }).catch(()=>{});
    return()=>{
      const clearing=beginPushSession(null);
      void navigator.serviceWorker.getRegistration('/').then(registration=>{try{assertPushSession(clearing);registration?.active?.postMessage({type:'BIND_PUSH_ACCOUNT',actorId:null});}catch{}}).catch(()=>{});
    };
  },[isSignedIn,userId,sessionId]);

  const pathname = usePathname();
  const router = useRouter();
  const queryClient=useQueryClient();
  const [shops, setShops] = useState<ShopRecord[] | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [offline,setOffline]=useState(false);
  const [premiumClock,setPremiumClock]=useState(Date.now);
  const activeShop=useRef<string|null>(null);
  const alive=useRef(true);
  const refreshVersion=useRef(0);
  useLayoutEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  const [catalog, setCatalog] = useState<{ language: string; entries: Record<string, string> }>({ language: 'en', entries: {} });

  const api = useMemo(() => bindApi(async (opts) => getToken(opts),userId&&sessionId?{actorId:userId,sessionId,isSessionCurrent:()=>alive.current,isCurrent:shop=>alive.current&&activeShop.current===shop,onFallback:()=>setOffline(true)}:undefined), [getToken,userId,sessionId]);

  const refreshShops = useCallback(async () => {
    const version=++refreshVersion.current;
    setLoadError(null);
    try {
      const list = await api.getShops();
      if(!alive.current||version!==refreshVersion.current)return;
      let stored:string|null=null;
      try{stored=userId?localStorage.getItem(`samaan-active-shop:${userId}`):null;}catch{/* Cache is optional. */}
      const current=activeShop.current;
      const next =
        (current && list.some((shop) => shop.id === current) ? current : null) ??
        list.find((shop) => shop.id === stored)?.id ??
        list.find((shop) => shop.isActive)?.id ??
        list[0]?.id ??
        null;
      setShops(list);setShopId(next);activeShop.current=next;setOffline(false);
      try{
        if(userId&&sessionId){
          const selected=list.find(row=>row.id===next);
          if(selected){saveOfflineShop(localStorage,createOfflineShopContext(userId,sessionId,selected));localStorage.setItem(`samaan-active-shop:${userId}`,next!);}
          else clearOfflineShop(localStorage,userId);
        }
      }catch{/* Storage denial must not break online routing. */}
    }catch(error){
      if(!alive.current||version!==refreshVersion.current)return;
      let cached=null;
      try{if(userId&&sessionId&&permitsOfflineShopFallback(error))cached=loadOfflineShop(localStorage,userId,sessionId);}catch{/* No usable cache. */}
      if(cached){const restored=offlineShopRecord(cached);setShops([restored]);setShopId(restored.id);activeShop.current=restored.id;setOffline(true);return;}
      // Auth and membership errors never restore stale permissions or routing.
      setShops(null);setShopId(null);activeShop.current=null;setOffline(false);
      if(!permitsOfflineShopFallback(error)){try{if(userId)clearOfflineShop(localStorage,userId);}catch{}}
      setLoadError(error instanceof Error?error.message:'Could not load shops.');
      throw error;
    }
  }, [api, userId,sessionId]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    let cancelled = false;
    setLoadError(null);
    refreshShops().catch((error: unknown) => {
      if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Could not load shops.');
    });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, refreshShops]);

  useEffect(()=>{
    if(!isSignedIn)return;
    const reconnect=()=>{void refreshShops().catch(()=>{});};
    window.addEventListener('online',reconnect);
    return()=>window.removeEventListener('online',reconnect);
  },[isSignedIn,refreshShops]);

  const selectShop = useCallback(
    (nextId: string) => {
      const selected=shops?.find(row=>row.id===nextId);if(!selected)return;
      setShopId(nextId);
      activeShop.current=nextId;
      try{if(userId&&sessionId&&!offline){saveOfflineShop(localStorage,createOfflineShopContext(userId,sessionId,selected));localStorage.setItem(`samaan-active-shop:${userId}`, nextId);}}catch{/* Cache is optional. */}
    },
    [userId,sessionId,shops,offline],
  );

  const shop = shops?.find((item) => item.id === shopId) ?? null;
  useLayoutEffect(() => { setFinancialScope(userId && shop ? { actorId:userId, shopId:shop.id } : null); return () => setFinancialScope(null); }, [userId, shop?.id]);
  useEffect(()=>{
    if(!shop||!userId||offline||navigator.onLine===false)return;
    let canceled=false,running=false;
    const retry=()=>{
      if(canceled||running||navigator.onLine===false)return;
      running=true;
      void syncQueuedSales(api,shop.id,()=>!canceled&&alive.current&&activeShop.current===shop.id).then(count=>{
        if(count&&!canceled)void queryClient.invalidateQueries();
      }).catch(()=>{/* Original bills and their errors remain available in device recovery. */}).finally(()=>{running=false;});
    };
    retry();const timer=window.setInterval(retry,30000);
    return()=>{canceled=true;window.clearInterval(timer);};
  },[api,shop?.id,userId,offline,queryClient]);
  const role = parseRole(shop?.role);
  const perms = permissionsFor(role,offline);

  const entitlementQuery = useQuery({
    queryKey: ['entitlement', userId,shop?.id],
    enabled: !!shop?.id,
    networkMode:'always',
    queryFn: () => api.getEntitlement(shop!.id),
  });

  const prefsQuery = useQuery({
    queryKey: ['preferences', userId],
    enabled: !!userId,
    networkMode:'always',
    queryFn: () => api.getPreferences(),
  });
  const prefs = prefsQuery.data?.preferences ?? null;
  useEffect(()=>{
    let timer:number|undefined;
    const update=()=>{
      const now=Date.now();setPremiumClock(now);
      if(timer!==undefined)window.clearTimeout(timer);
      const deadline=entitlementQuery.data?premiumDeadline(entitlementQuery.data):null;
      if(deadline!==null&&Number.isFinite(deadline)&&deadline>now)
        timer=window.setTimeout(update,Math.min(deadline-now,2147483647));
    };
    update();
    // Reassess expiry after a suspended/background tab wakes up.
    window.addEventListener('focus',update);
    document.addEventListener('visibilitychange',update);
    return()=>{if(timer!==undefined)window.clearTimeout(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);};
  },[entitlementQuery.data]);

  useEffect(() => {
    const language = prefs?.appLanguage ?? 'en';
    let cancelled = false;
    void loadBundledLanguage(language).catch(() => ({})).then(async (bundled) => {
      if (cancelled) return;
      setCatalog({ language, entries: bundled });
      if (language === 'en') return;
      try {
        const fresh = flattenStrings(await api.getTranslations(language));
        if (!cancelled) setCatalog({ language, entries: { ...bundled, ...fresh } });
      } catch { /* Bundled mobile catalogs remain available when the server cannot be reached. */ }
    });
    return () => { cancelled = true; };
  }, [api, prefs?.appLanguage]);

  useEffect(() => {
    if (!shops || pathname.startsWith('/shop/onboarding')) return;
    if (shops.length === 0) router.replace('/shop/onboarding');
  }, [shops, pathname, router]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const onRemoved = () => {
      try{if(userId)clearOfflineShop(localStorage,userId);}catch{}
      setShops(null);setOffline(false);activeShop.current=null;
      setShopId(null);
      void refreshShops().catch(()=>{});
    };
    window.addEventListener('samaan-not-member', onRemoved);
    return () => window.removeEventListener('samaan-not-member', onRemoved);
  }, [refreshShops,userId]);

  const savePrefs = useCallback(
    async (partial: Partial<UserPreferences>) => {
      if (partial.appLanguage && !APP_LANGUAGES.has(partial.appLanguage)) {
        throw new Error('That language is not available for the shop yet.');
      }
      await api.updatePreferences(partial);
      await prefsQuery.refetch();
    },
    [api, prefsQuery],
  );

  const t = useCallback((key: string, fallback: string, vars?: Record<string, string | number>) => {
    const language = prefs?.appLanguage ?? 'en';
    return translateUi(language, catalog.language === language ? catalog.entries : {}, key, fallback, vars);
  }, [catalog, prefs?.appLanguage]);

  const value: ShopContextValue = {
    userId: userId ?? null,
    shops: shops ?? [],
    shop,
    role,
    perms,
    entitlement: entitlementQuery.data ?? null,
    premium: premiumAt(entitlementQuery.data,premiumClock),
    api,
    refreshShops,
    selectShop,
    prefs,
    savePrefs,
    t,
    notice,
    setNotice,
    hideCost: !perms.canSeeCost,
    offline,
  };

  if (pathname === '/shop/sso-callback') {
    return (
      <div className="shop-root auth-wait">
        <AuthenticateWithRedirectCallback />
        <p>{t('web.gst.signing_you_in_', 'Signing you in…')}</p>
      </div>
    );
  }

  if (!isLoaded || (isSignedIn && shops === null && !loadError)) {
    return <div className="shop-root grid min-h-screen place-items-center text-muted">{t('web.gst.loading_your_shop_', 'Loading your shop…')}</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="shop-root">
        <AuthScreen redirectUrl={pathname || '/shop'} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="shop-root grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <p role="alert" className="text-danger">{loadError}</p>
          <button className="mt-4 rounded-lg bg-saffron px-4 py-2 font-semibold text-white" type="button" onClick={() => void refreshShops().catch(()=>{})}>
            {t('common.retry', 'Try again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ShopContext.Provider value={value}>
      <div
        className="shop-root"
        lang={prefs?.appLanguage === 'hinglish' ? 'hi-Latn' : prefs?.appLanguage || 'en'}
        data-text={prefs?.textSize || 'medium'}
        data-contrast={prefs?.highContrastMode ? 'high' : 'normal'}
      >
        <BillingShell enabled={!!userId&&!!sessionId&&!!shop} offline={offline}/><ShopChrome onSignOut={() => {clearBillingShell();try{if(userId)clearOfflineShop(localStorage,userId);}catch{}void Promise.resolve().then(()=>disconnectBrowserPush(api,pushSession(userId!))).catch(()=>{}).finally(()=>signOut({ redirectUrl: '/' }));}}>
          {offline?<div className="shop-surface shop-card mb-4" role="status"><p>{t('shop.offline_notice','Using saved shop context for billing. Connect and refresh to manage the shop or view reports.')}</p><div className="shop-actions mt-3"><button type="button" className="text-saffron" onClick={()=>void refreshShops().catch(()=>{})}>{t('common.retry','Try again')}</button><Link className="text-saffron" href="/shop/settings/gst/recovery">{t('gst.rsp.saved_recovery','View saved requests')}</Link></div></div>:null}
          {children}
        </ShopChrome>
        {notice ? (
          <div className="shop-toast no-print" role="status">
            {t('web.gst.' + notice.toLowerCase().replace(/[^a-z0-9]+/g, '_'), notice)}
          </div>
        ) : null}
      </div>
    </ShopContext.Provider>
  );
}

export function ShopProviders({ children }: { children: ReactNode }) {
  const {userId,sessionId}=useAuth();
  return <ScopedShopProviders key={`${userId??'signed-out'}:${sessionId??'no-session'}`}>{children}</ScopedShopProviders>;
}
function ScopedShopProviders({children}:{children:ReactNode}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: true },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <ShopSession>{children}</ShopSession>
    </QueryClientProvider>
  );
}
