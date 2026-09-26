'use client';

import { UserButton } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Permissions } from '../../lib/shop/permissions';
import { useShop } from './context';
import { Button, cx } from './ui';

type IconName = 'home' | 'sell' | 'sales' | 'products' | 'buy' | 'suppliers' | 'customers' | 'staff' | 'reports' | 'activity' | 'settings' | 'billing';

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
  }
}

type NavItem = { href: string; label: string; key: string; icon: IconName; show?: (perms: Permissions) => boolean };
type NavGroup = { label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: 'Counter',
    items: [
      { href: '/shop', label: 'Home', key: 'nav.home', icon: 'home' },
      { href: '/shop/sell', label: 'Sell', key: 'nav.sell', icon: 'sell' },
      { href: '/shop/sales', label: 'Sales', key: 'nav.sales', icon: 'sales' },
    ],
  },
  {
    label: 'Stock',
    items: [
      { href: '/shop/products', label: 'Products', key: 'nav.products', icon: 'products' },
      { href: '/shop/buy-list', label: 'Buy list', key: 'nav.buyList', icon: 'buy', show: (p) => p.canEditProducts },
      { href: '/shop/suppliers', label: 'Suppliers', key: 'nav.suppliers', icon: 'suppliers', show: (p) => p.canSeeCost },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/shop/customers', label: 'Customers', key: 'nav.customers', icon: 'customers', show: (p) => p.canManageCustomers },
      { href: '/shop/settings/staff', label: 'Staff', key: 'nav.staff', icon: 'staff', show: (p) => p.canManageStaff },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/shop/reports', label: 'Reports', key: 'nav.reports', icon: 'reports', show: (p) => p.canSeeReports },
      { href: '/shop/activity', label: 'Activity', key: 'nav.activity', icon: 'activity' },
    ],
  },
];

const MOBILE_TABS: NavItem[] = [
  { href: '/shop', label: 'Home', key: 'nav.home', icon: 'home' },
  { href: '/shop/sell', label: 'Sell', key: 'nav.sell', icon: 'sell' },
  { href: '/shop/sales', label: 'Sales', key: 'nav.sales', icon: 'sales' },
  { href: '/shop/products', label: 'Products', key: 'nav.products', icon: 'products' },
  { href: '/shop/settings', label: 'Settings', key: 'nav.settings', icon: 'settings' },
];

function isActive(pathname: string, href: string) {
  if (href === '/shop') return pathname === '/shop';
  if (href === '/shop/settings') {
    return pathname.startsWith('/shop/settings') && !pathname.startsWith('/shop/settings/staff') && !pathname.startsWith('/shop/settings/subscription');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AlertsBell() {
  const pathname = usePathname();
  const { api, shop } = useShop();
  const alerts = useQuery({
    queryKey: ['alerts', shop?.id],
    enabled: !!shop?.id,
    queryFn: () => api.getAlerts(shop!.id),
  });
  const count = alerts.data?.counts.total ?? 0;
  const active = pathname.startsWith('/shop/alerts');
  return (
    <Link href="/shop/alerts" className={cx('shop-bell', active && 'is-active')} aria-current={active ? 'page' : undefined} aria-label={count > 0 ? `${count} notifications` : 'Notifications'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
      {count > 0 ? <span className="shop-bell-count">{count > 99 ? '99+' : count}</span> : null}
    </Link>
  );
}

function todayLabel() {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

export function ShopChrome({ children, onSignOut }: { children: ReactNode; onSignOut: () => void }) {
  const pathname = usePathname();
  const { shop, shops, role, selectShop, t, perms } = useShop();
  const onboarding = pathname.startsWith('/shop/onboarding');
  const showNav = !onboarding && !!shop;
  const wide = pathname === '/shop/sell';

  const renderLink = (item: NavItem) => {
    const active = isActive(pathname, item.href);
    return (
      <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cx('shop-nav-link', active && 'is-active')}>
        <Icon name={item.icon} />
        {t(item.key, item.label)}
      </Link>
    );
  };

  return (
    <div className="shop-shell">
      {showNav ? (
        <aside className="shop-rail no-print">
          <Link href="/shop" className="shop-brand">
            <span className="shop-mark" aria-hidden="true">S</span>
            <span>Samaan<span className="text-saffron">Bol</span></span>
          </Link>

          <div className="shop-rail-shop">
            <span className="shop-rail-shop-name">{shop?.name}</span>
            {role ? <span className="shop-role">{t(`role.${role.toLowerCase()}`, role.toLowerCase())}</span> : null}
            {shops.length > 1 ? (
              <label>
                <span className="sr-only">Switch shop</span>
                <select value={shop?.id ?? ''} onChange={(event) => selectShop(event.target.value)}>
                  {shops.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <nav className="shop-nav" aria-label="Shop">
            {GROUPS.map((group) => {
              const items = group.items.filter((item) => !item.show || item.show(perms));
              if (items.length === 0) return null;
              return (
                <div key={group.label}>
                  <p className="shop-nav-group">{group.label}</p>
                  {items.map(renderLink)}
                </div>
              );
            })}
          </nav>

          <div className="shop-rail-foot">
            {renderLink({ href: '/shop/settings', label: 'Settings', key: 'nav.settings', icon: 'settings' })}
            {perms.canManageShop ? (
              <Link href="/shop/settings/subscription" aria-current={pathname.startsWith('/shop/settings/subscription') ? 'page' : undefined} className={pathname.startsWith('/shop/settings/subscription') ? 'shop-nav-link is-active' : 'shop-nav-link'}>
                <Icon name="billing" />
                Billing
              </Link>
            ) : null}
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
                    <span className="sr-only">Switch shop</span>
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
              <p className="shop-topbar-date">{todayLabel()}</p>
            </>
          )}
          <div className="shop-topbar-actions">
            {showNav ? <AlertsBell /> : null}
            {showNav && !pathname.startsWith('/shop/sell') && perms.canSell ? (
              <Button href="/shop/sell" tone="ghost" size="sm" className="shop-topbar-new">New sale</Button>
            ) : null}
            <UserButton />
            <button type="button" className="text-sm text-muted hover:text-ink" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </header>
        <main className={cx('shop-main', wide && 'is-wide')}>{children}</main>
      </div>

      {showNav ? (
        <nav className="shop-tabs no-print" aria-label="Shop">
          {MOBILE_TABS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cx('shop-tab', active && 'is-active')}>
                <Icon name={item.icon} />
                {t(item.key, item.label)}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
