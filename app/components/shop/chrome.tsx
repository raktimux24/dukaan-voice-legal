'use client';

import { UserButton } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { Permissions } from '../../lib/shop/permissions';
import { useShop } from './context';
import { Button, cx } from './ui';
import { VoiceSheet } from './voice-sheet';

type IconName = 'home' | 'sell' | 'sales' | 'products' | 'buy' | 'suppliers' | 'customers' | 'staff' | 'reports' | 'activity' | 'settings' | 'billing'
  | 'estimates' | 'orders' | 'bills' | 'cashbook' | 'store' | 'mic' | 'more';

function Icon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true };
  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>;
    case 'sell':
      return <svg {...common}><path d="M4 7h16l-1.5 9H5.5z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /><path d="M8 20h.01M16 20h.01" /></svg>;
    case 'sales':
      return <svg {...common}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></svg>;
    case 'products':
      return <svg {...common}><path d="M3 8l9-4 9 4-9 4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></svg>;
    case 'buy':
      return <svg {...common}><path d="M5 6h14l-1 12H6z" /><path d="M9 10v-3a3 3 0 0 1 6 0v3" /><path d="m9 14 2 2 4-4" /></svg>;
    case 'suppliers':
      return <svg {...common}><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /></svg>;
    case 'customers':
      return <svg {...common}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 19a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M17 13a6 6 0 0 1 4.5 6" /></svg>;
    case 'staff':
      return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /><path d="M19 4l1 1-1 1" /></svg>;
    case 'reports':
      return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>;
    case 'activity':
      return <svg {...common}><path d="M3 12h4l3-7 4 14 3-7h4" /></svg>;
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>;
    case 'billing':
      return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /><path d="M7 15h3" /></svg>;
    case 'estimates':
      return <svg {...common}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 12h5M10 16h3" /></svg>;
    case 'orders':
      return <svg {...common}><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M9 4.5h6v2H9zM9 11h6M9 15h4" /></svg>;
    case 'bills':
      return <svg {...common}><path d="M5 4h10l4 4v12H5z" /><path d="M15 4v4h4" /><path d="M8.5 13h7M8.5 16.5h4" /><path d="M8.5 9.5h3" /></svg>;
    case 'cashbook':
      return <svg {...common}><path d="M3 8a2 2 0 0 1 2-2h12v12H5a2 2 0 0 1-2-2z" /><path d="M17 8V6a2 2 0 0 0-2-2H5" /><path d="M16 13h4v3h-4a1.5 1.5 0 0 1 0-3z" /></svg>;
    case 'store':
      return <svg {...common}><path d="M3 10 5 4h14l2 6" /><path d="M4 10h16v9H4z" /><path d="M9 19v-5h6v5" /></svg>;
    case 'mic':
      return <svg {...common}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M6 10v2a6 6 0 0 0 12 0v-2M12 18v3M9 21h6" /></svg>;
    case 'more':
      return <svg {...common}><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></svg>;
  }
}

type NavItem = { href: string; label: string; key: string; icon: IconName; show?: (perms: Permissions) => boolean };
type NavGroup = { label: string; items: NavItem[] };

const RAIL_GROUPS: Record<string, Record<string, string>> = {
  hi: { Counter: 'काउंटर', Stock: 'स्टॉक', People: 'लोग', Insights: 'झलक' },
  hinglish: { Counter: 'Counter', Stock: 'Stock', People: 'Log', Insights: 'Hisab' },
  bn: { Counter: 'কাউন্টার', Stock: 'স্টক', People: 'মানুষ', Insights: 'ইনসাইট' },
  ta: { Counter: 'கவுண்டர்', Stock: 'ஸ்டாக்', People: 'நபர்கள்', Insights: 'பார்வை' },
  te: { Counter: 'కౌంటర్', Stock: 'స్టాక్', People: 'వ్యక్తులు', Insights: 'అంతర్దృష్టి' },
  mr: { Counter: 'काउंटर', Stock: 'स्टॉक', People: 'लोक', Insights: 'आढावा' },
  kn: { Counter: 'ಕೌಂಟರ್', Stock: 'ಸ್ಟಾಕ್', People: 'ಜನ', Insights: 'ಒಳನೋಟ' },
  gu: { Counter: 'કાઉન્ટર', Stock: 'સ્ટોક', People: 'લોકો', Insights: 'ઝલક' },
  ml: { Counter: 'കൗണ്ടർ', Stock: 'സ്റ്റോക്ക്', People: 'ആളുകൾ', Insights: 'ഉൾക്കാഴ്ച' },
};

// Each `show` mirrors the permission the destination page itself checks.
const GROUPS: NavGroup[] = [
  {
    label: 'Counter',
    items: [
      { href: '/shop', label: 'Home', key: 'nav.home', icon: 'home' },
      { href: '/shop/sell', label: 'Sell', key: 'nav.sell', icon: 'sell' },
      { href: '/shop/sales', label: 'Sales', key: 'nav.sales', icon: 'sales' },
      { href: '/shop/estimates', label: 'Estimates', key: 'estimates.mobile.title_short', icon: 'estimates', show: (p) => p.canSell },
      { href: '/shop/online-store', label: 'Online store & orders', key: 'commerce.title', icon: 'store', show: (p) => p.canEditProducts },
    ],
  },
  {
    label: 'Stock',
    items: [
      { href: '/shop/products', label: 'Products', key: 'products.title', icon: 'products' },
      { href: '/shop/buy-list', label: 'Buy list', key: 'nav.buy_list', icon: 'buy', show: (p) => p.canEditProducts },
      { href: '/shop/purchase-orders', label: 'Purchase orders', key: 'po.title', icon: 'orders', show: (p) => p.canEditProducts },
      { href: '/shop/purchases?list=1', label: 'Supplier invoices', key: 'gst.ui.supplier_invoices_30bf2e', icon: 'bills', show: (p) => p.canSeeCost },
      { href: '/shop/suppliers', label: 'Suppliers', key: 'suppliers.title', icon: 'suppliers', show: (p) => p.canSeeCost },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/shop/customers', label: 'Customers', key: 'customers.title', icon: 'customers', show: (p) => p.canManageCustomers },
      { href: '/shop/settings/staff', label: 'Staff', key: 'modal.staff.title', icon: 'staff', show: (p) => p.canManageStaff || p.role === 'MANAGER' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/shop/reports', label: 'Reports', key: 'reports.title', icon: 'reports', show: (p) => p.canSeeReports },
      { href: '/shop/cashbook', label: 'Expenses & cashbook', key: 'cashbook.title', icon: 'cashbook', show: (p) => p.canSeeReports },
      { href: '/shop/activity', label: 'Activity', key: 'nav.activity', icon: 'activity' },
    ],
  },
];

const MOBILE_TABS: NavItem[] = [
  { href: '/shop', label: 'Home', key: 'nav.home', icon: 'home' },
  { href: '/shop/sell', label: 'Sell', key: 'nav.sell', icon: 'sell' },
  { href: '/shop/sales', label: 'Sales', key: 'nav.sales', icon: 'sales' },
  { href: '/shop/products', label: 'Products', key: 'products.title', icon: 'products' },
];

const SETTINGS_ITEM: NavItem = { href: '/shop/settings', label: 'Settings', key: 'nav.settings', icon: 'settings' };
const BILLING_ITEM: NavItem = { href: '/shop/settings/subscription', label: 'Billing', key: 'subscription.section_title', icon: 'billing', show: (p) => p.canManageShop };

function isActive(pathname: string, target: string) {
  const href = target.split('?')[0];
  if (href === '/shop') return pathname === '/shop';
  if (href === '/shop/settings') {
    return pathname.startsWith('/shop/settings') && !pathname.startsWith('/shop/settings/staff') && !pathname.startsWith('/shop/settings/subscription');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Letter shortcuts must never fire while typing, inside a dialog, or from a barcode scanner burst. */
function useShellShortcuts(enabled: boolean, shortcuts: Record<string, string | null>) {
  const router = useRouter();
  const voice = shortcuts.v ?? null;
  const sale = shortcuts.n ?? null;
  useEffect(() => {
    if (!enabled) return;
    let last = 0;
    let timer = 0;
    const onKey = (event: KeyboardEvent) => {
      const burst = event.timeStamp - last < 80;
      last = event.timeStamp;
      if (timer) { window.clearTimeout(timer); timer = 0; }
      if (burst || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;
      const key = event.key.toLowerCase();
      const href = key === 'v' ? voice : key === 'n' ? sale : null;
      if (!href) return;
      // Wait briefly: scanners type the next character within a few ms, which cancels this.
      timer = window.setTimeout(() => { timer = 0; router.push(href); }, 90);
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(timer); };
  }, [enabled, voice, sale, router]);
}

function AlertsBell() {
  const pathname = usePathname();
  const { api, shop, t } = useShop();
  const alerts = useQuery({
    queryKey: ['alerts', shop?.id],
    enabled: !!shop?.id,
    queryFn: () => api.getAlerts(shop!.id),
  });
  const count = alerts.data?.counts.total ?? 0;
  const active = pathname.startsWith('/shop/alerts');
  const label = t('modal.alerts.title', 'Alerts');
  return (
    <Link href="/shop/alerts" className={cx('shop-bell', active && 'is-active')} aria-current={active ? 'page' : undefined} aria-label={count > 0 ? `${count} ${label}` : label} title={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
      {count > 0 ? <span className="shop-bell-count">{count > 99 ? '99+' : count}</span> : null}
    </Link>
  );
}

function todayLabel(language?: string | null) {
  const locale = language && !['en', 'hinglish'].includes(language) ? `${language}-IN` : 'en-IN';
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

export function ShopChrome({ children, onSignOut }: { children: ReactNode; onSignOut: () => void }) {
  const pathname = usePathname();
  const { shop, shops, role, selectShop, t, perms, prefs } = useShop();
  const [moreOpen, setMoreOpen] = useState(false);
  const onboarding = pathname.startsWith('/shop/onboarding');
  const showNav = !onboarding && !!shop;
  const wide = pathname === '/shop/sell';
  const atCounter = pathname === '/shop/sell' || pathname.startsWith('/shop/sell/');
  const canStartSale = showNav && perms.canSell && !atCounter;
  const voiceLabel = t('a11y.voice', 'Voice command');
  const newSaleLabel = t('sale_complete.new_sale', 'New sale');
  // The counter keeps every key for scanning; elsewhere V opens voice and N starts a sale.
  useShellShortcuts(showNav && !atCounter, { v: '/shop/voice', n: canStartSale ? '/shop/sell' : null });
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const visible = (item: NavItem) => !item.show || item.show(perms);
  const groupLabel = (label: string) => RAIL_GROUPS[prefs?.appLanguage ?? '']?.[label] ?? label;
  const renderLink = (item: NavItem) => {
    const active = isActive(pathname, item.href);
    return (
      <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cx('shop-nav-link', active && 'is-active')} onClick={() => setMoreOpen(false)}>
        <Icon name={item.icon} />
        {t(item.key, item.label)}
      </Link>
    );
  };
  const groups = GROUPS.map((group) => ({ ...group, items: group.items.filter(visible) })).filter((group) => group.items.length > 0);
  const moreActive = !MOBILE_TABS.some((item) => isActive(pathname, item.href));

  return (
    <div className="shop-shell">
      <a href="#shop-main" className="shop-skip no-print">{t('homeweb.skip_to_content', 'Skip to content')}</a>
      {showNav ? (
        <aside className="shop-rail no-print">
          <Link href="/shop" className="shop-brand">
            <img src="/logo1.svg" width={32} height={32} className="shop-mark" alt="" />
            <span>Samaan<span className="text-saffron">Bol</span></span>
          </Link>

          <div className="shop-rail-shop">
            {shops.length > 1 ? (
              <label className="shop-rail-switch">
                <span className="sr-only">{t('modal.shop_settings.switch_shop', 'Switch shop')}</span>
                <select value={shop?.id ?? ''} onChange={(event) => selectShop(event.target.value)}>
                  {shops.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            ) : (
              <span className="shop-rail-shop-name">{shop?.name}</span>
            )}
            {role ? <span className="shop-role">{t(`role.${role.toLowerCase()}`, role.toLowerCase())}</span> : null}
          </div>

          <nav className="shop-nav" aria-label={t('homeweb.nav_main', 'Main')}>
            {groups.map((group) => (
              <div key={group.label}>
                <p className="shop-nav-group">{groupLabel(group.label)}</p>
                {group.items.map(renderLink)}
              </div>
            ))}
          </nav>

          <div className="shop-rail-foot">
            {renderLink(SETTINGS_ITEM)}
            {visible(BILLING_ITEM) ? renderLink(BILLING_ITEM) : null}
          </div>
        </aside>
      ) : null}

      <div className="min-w-0">
        <header className="shop-topbar no-print">
          {onboarding ? (
            <Link href="/" className="shop-brand">Samaan<span className="text-saffron">Bol</span></Link>
          ) : (
            <>
              <div className="shop-topbar-shop">
                <strong>{shop?.name ?? 'Shop'}</strong>
                {shops.length > 1 ? (
                  <label className="text-xs text-muted">
                    <span className="sr-only">{t('modal.shop_settings.switch_shop', 'Switch shop')}</span>
                    <select className="bg-transparent text-muted" value={shop?.id ?? ''} onChange={(event) => selectShop(event.target.value)}>
                      {shops.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span className="text-xs text-muted">{role ? t(`role.${role.toLowerCase()}`, role.toLowerCase()) : ''}</span>
                )}
              </div>
              <p className="shop-topbar-date">{todayLabel(prefs?.appLanguage)}</p>
            </>
          )}
          <div className="shop-topbar-actions">
            {/* The counter has its own voice button, which respects a bill that is still being saved. */}
            {showNav && !atCounter ? (
              <Link href="/shop/voice" className="shop-topbar-voice" aria-label={voiceLabel} aria-keyshortcuts="V" title={`${voiceLabel} (V)`}>
                <Icon name="mic" />
              </Link>
            ) : null}
            {showNav ? <AlertsBell /> : null}
            {canStartSale ? (
              <Button href="/shop/sell" icon="plus" shortcut="N" title={`${newSaleLabel} (N)`} className="shop-topbar-new">{newSaleLabel}</Button>
            ) : null}
            <UserButton />
            <button type="button" className="text-sm text-muted hover:text-ink" onClick={onSignOut}>
              {t('settings.sign_out', 'Sign out')}
            </button>
          </div>
        </header>
        <main id="shop-main" tabIndex={-1} className={cx('shop-main', wide && 'is-wide')}>{children}</main>
      </div>

      {showNav ? (
        <nav className="shop-tabs no-print" aria-label={t('homeweb.nav_quick', 'Quick tabs')}>
          {MOBILE_TABS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cx('shop-tab', active && 'is-active')}>
                <Icon name={item.icon} />
                {t(item.key, item.label)}
              </Link>
            );
          })}
          <button type="button" className={cx('shop-tab', moreActive && 'is-active')} aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)}>
            <Icon name="more" />
            {t('homeweb.nav_more', 'More')}
          </button>
        </nav>
      ) : null}
      {showNav && moreOpen ? (
        <VoiceSheet title={t('homeweb.nav_more', 'More')} closeLabel={t('common.close', 'Close')} onClose={() => setMoreOpen(false)}>
          <nav className="shop-more-nav" aria-label={t('homeweb.nav_main', 'Main')}>
            {groups.map((group) => (
              <div key={group.label}>
                <p className="shop-nav-group">{groupLabel(group.label)}</p>
                {group.items.map(renderLink)}
              </div>
            ))}
            <div>
              <p className="shop-nav-group">{t('nav.settings', 'Settings')}</p>
              {renderLink(SETTINGS_ITEM)}
              {visible(BILLING_ITEM) ? renderLink(BILLING_ITEM) : null}
            </div>
          </nav>
        </VoiceSheet>
      ) : null}
    </div>
  );
}
