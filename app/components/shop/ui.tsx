'use client';

import Link from 'next/link';
import {useContext, type ReactNode} from 'react';
import { ApiError } from '../../lib/shop/api';
import { useShop,ShopContext } from './context';
import {EN_FALLBACK} from '../../lib/shop/en-fallback';

function useOptionalUiText() {
  const context = useContext(ShopContext);
  return (value: ReactNode): ReactNode => typeof value === 'string' && context
    ? context.t('web.gst.' + value.toLowerCase().replace(/[^a-z0-9]+/g, '_'), value)
    : value;
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function Button({
  children,
  type = 'button',
  onClick,
  disabled,
  tone = 'primary',
  size = 'md',
  block,
  href,
  className,
  title,
  'aria-label': ariaLabel,
  icon,
  shortcut,
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'ghost' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  href?: string;
  className?: string;
  title?: string;
  'aria-label'?: string;
  /** Optional leading icon. Icons always sit before the label. */
  icon?: GlyphName;
  /** Keyboard shortcut announced to assistive tech, e.g. "N". */
  shortcut?: string;
}) {
  const classes = cx(
    'shop-btn',
    tone === 'primary' && 'shop-btn-primary',
    tone === 'ghost' && 'shop-btn-ghost',
    tone === 'quiet' && 'shop-btn-quiet',
    tone === 'danger' && 'shop-btn-danger',
    size === 'sm' && 'is-sm',
    size === 'lg' && 'is-lg',
    block && 'is-block',
    icon && 'has-icon',
    className,
  );
  const body = icon ? <><span className="shop-btn-icon" aria-hidden="true"><Glyph name={icon} /></span>{children}</> : children;
  if (href) return <Link className={classes} href={href} title={title} aria-label={ariaLabel} aria-keyshortcuts={shortcut}>{body}</Link>;
  return (
    <button aria-label={ariaLabel} aria-keyshortcuts={shortcut} className={classes} type={type} onClick={onClick} disabled={disabled} title={title}>
      {body}
    </button>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  back,
}: {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string; onClick?: () => void; disabled?: boolean };
}) {
  const display = useOptionalUiText();
  return (
    <header className="shop-page-head">
      {back?.onClick ? (
        <button type="button" className="shop-back" onClick={back.onClick} disabled={back.disabled}>
          ← {display(back.label)}
        </button>
      ) : back ? (
        <Link href={back.href} className="shop-back">
          ← {display(back.label)}
        </Link>
      ) : null}
      <div className="shop-page-head-text">
        {kicker ? <p className="shop-kicker">{kicker}</p> : null}
        <h1 className="shop-title">{title}</h1>
        {description ? <p className="shop-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="shop-actions">{actions}</div> : null}
    </header>
  );
}

export function SectionHead({
  title,
  sub,
  link,
}: {
  title: string;
  sub?: string;
  link?: { href: string; label: string };
}) {
  const display = useOptionalUiText();
  return (
    <div className="shop-section-head">
      <div>
        <h2 className="shop-section-title">{display(title)}</h2>
        {sub ? <p className="shop-section-sub">{display(sub)}</p> : null}
      </div>
      {link ? <Link href={link.href} className="shop-section-link">{display(link.label)}</Link> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
  localized = false,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  localized?: boolean;
}) {
  const display = useOptionalUiText();
  return (
    <label className={cx('block', className)}>
      <span className="shop-label">{localized ? label : display(label)}</span>
      {children}
      {hint ? <span className="shop-hint block">{localized ? hint : display(hint)}</span> : null}
    </label>
  );
}

export const inputClass = 'shop-field';

export function Card({ children, className, tight, flush, id }: { id?: string; children: ReactNode; className?: string; tight?: boolean; flush?: boolean }) {
  return <section id={id} className={cx('shop-surface shop-card', tight && 'is-tight', flush && 'is-flush', className)}>{children}</section>;
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'ok' | 'warn' | 'danger' | 'saffron' }) {
  return <span className={cx('shop-pill', tone !== 'neutral' && `shop-pill--${tone}`)}>{children}</span>;
}

export function Chip({ active, onClick, children, href }: { active?: boolean; onClick?: () => void; children: ReactNode; href?: string }) {
  const classes = cx('shop-chip', active && 'is-active');
  if (href) return <Link href={href} className={classes} aria-current={active ? 'page' : undefined}>{children}</Link>;
  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="shop-kbd">{children}</kbd>;
}

export type GlyphName =
  | 'search' | 'scan' | 'barcode' | 'mic' | 'alert' | 'store' | 'qr' | 'staff' | 'card' | 'wallet' | 'shield' | 'receipt' | 'clipboard'
  | 'bag' | 'landmark' | 'users' | 'truck' | 'package' | 'download' | 'phone' | 'pin' | 'user' | 'languages'
  | 'plus' | 'speaker' | 'more' | 'close' | 'check' | 'chevron';

export function Glyph({ name }: { name: GlyphName }) {
  const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true as const };
  const paths: Record<GlyphName, ReactNode> = {
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    scan: <><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M3 12h18M8 8v8M12 8v8M16 8v8"/></>,
    barcode: <><path d="M4 5v14M7 5v14M11 5v14M13 5v14M17 5v14M20 5v14"/></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 10v2a6 6 0 0 0 12 0v-2M12 18v3M9 21h6"/></>,
    alert: <><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
    store: <><path d="M3 10 5 4h14l2 6" /><path d="M4 10h16v9H4z" /><path d="M9 19v-5h6v5" /></>,
    qr: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2h-2zM18 14h2v6h-6v-2h4z" /></>,
    staff: <><circle cx="9" cy="8" r="3" /><path d="M3 19a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.2" /><path d="M16 19a4.5 4.5 0 0 1 5-4" /></>,
    card: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h4" /></>,
    wallet: <><path d="M3 8a2 2 0 0 1 2-2h12v12H5a2 2 0 0 1-2-2z" /><path d="M17 8V6a2 2 0 0 0-2-2H5" /><path d="M16 13h4v3h-4a1.5 1.5 0 0 1 0-3z" /></>,
    shield: <><path d="M12 3 5 6v6c0 4.5 3 6.5 7 8 4-1.5 7-3.5 7-8V6z" /><path d="m9 12 2 2 4-4" /></>,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
    clipboard: <><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M9 4.5h6v2H9zM9 11h6M9 15h4" /></>,
    bag: <><path d="M6 8h12l-1 12H7z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    landmark: <><path d="M3 10h18M5 10v8M10 10v8M14 10v8M19 10v8M3 18h18M12 3 3 8h18z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 19a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 6" /><path d="M17 14a5 5 0 0 1 4 5" /></>,
    truck: <><path d="M3 7h11v8H3z" /><path d="M14 10h4l3 3v2h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></>,
    package: <><path d="M3 8 12 4l9 4-9 4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></>,
    download: <><path d="M12 4v10" /><path d="m8 10 4 4 4-4" /><path d="M5 19h14" /></>,
    phone: <><path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M11 18h2" /></>,
    pin: <><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.2" /></>,
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 19a7 7 0 0 1 14 0" /></>,
    languages: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    speaker: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" /></>,
    more: <><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
    check: <><path d="m5 12.5 4.5 4.5L19 7.5" /></>,
    chevron: <><path d="m9 6 6 6-6 6" /></>,
  };
  return <svg {...svg}>{paths[name]}</svg>;
}

export function GroupLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="shop-group">
      <p>{title}</p>
      {hint ? <span>{hint}</span> : null}
    </div>
  );
}

export function TaskLink({
  href,
  title,
  hint,
  icon,
  onClick,
}: {
  href?: string;
  title: string;
  hint?: string;
  icon: GlyphName;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="shop-task-icon" aria-hidden="true"><Glyph name={icon} /></span>
      <span className="shop-task-copy"><strong>{title}</strong>{hint ? <small>{hint}</small> : null}</span>
      <span className="shop-task-go" aria-hidden="true">→</span>
    </>
  );
  if (href) return <Link href={href} className="shop-task">{body}</Link>;
  return <button type="button" className="shop-task" onClick={onClick}>{body}</button>;
}

export function StepRail({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="shop-steps" aria-label={labels[current]}>
      {labels.map((label, index) => (
        <li key={label} className={index === current ? 'is-current' : index < current ? 'is-done' : undefined} aria-current={index === current ? 'step' : undefined}>
          <span>{index + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

export function IllustratedEmpty({
  icon = 'package',
  title,
  body,
  action,
}: {
  icon?: GlyphName;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="shop-empty-art">
      <div className="shop-empty-mark" aria-hidden="true">
        <i /><i /><Glyph name={icon} />
      </div>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  const display = useOptionalUiText();
  return (
    <Card>
      <h2 className="font-display text-xl text-ink">{display(title)}</h2>
      <p className="mt-2 text-muted">{display(body)}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

/**
 * Shows an error. By default unknown codes fall back to the GST copy used by
 * the tax screens. Other areas pass `messages` (code -> [key, English]) and a
 * neutral `fallback` so their errors never borrow GST wording. Codes missing
 * from `messages` keep the default behaviour unless a `fallback` is given.
 */
export function Notice({ error, messages, fallback: areaFallback }: { error: unknown; messages?: Record<string, readonly [string, string]>; fallback?: readonly [string, string] }) {
  const context=useContext(ShopContext);
  if (!error) return null;
  const raw=error instanceof Error?error.message:'Something went wrong.';
  const code=error instanceof ApiError?error.code:raw;
  const areaMessage = messages?.[code] ?? (error instanceof ApiError ? messages?.[`status_${error.status}`] : undefined) ?? areaFallback;
  if (areaMessage) {
    const [areaKey, areaText] = areaMessage;
    return <p role="alert" className="shop-notice">{context ? context.t(areaKey, areaText) : areaText}</p>;
  }
  const fallback=(EN_FALLBACK as Record<string,string>)['gst.error.'+code]??(/^[a-z]+(?:_[a-z0-9]+)+$/.test(code)?EN_FALLBACK['gst.error.action_failed']:undefined);
  const key=fallback?((EN_FALLBACK as Record<string,string>)['gst.error.'+code]?'gst.error.'+code:'gst.error.action_failed'):'web.gst.'+raw.toLowerCase().replace(/[^a-z0-9]+/g,'_');
  const message=context?context.t(key,fallback??raw):fallback??raw;
  return (
    <p role="alert" className="shop-notice">
      {message}
    </p>
  );
}

export function isPremiumError(error: unknown): error is ApiError {
  return error instanceof ApiError && (error.status === 402 || error.code === 'premium_required');
}

export function isDenied(error: unknown) {
  return error instanceof ApiError && error.status === 403;
}

export function PremiumLock({ feature }: { shopId?: string; feature?: string }) {
  const { t, entitlementStatus, retryEntitlement } = useShop();
  if (entitlementStatus === 'loading') return <Spinner label={t('common.loading', 'Loading')} />;
  if (entitlementStatus === 'error') return <Card><p role="alert">{t('common.error', 'Something went wrong')}</p><Button onClick={retryEntitlement}>{t('common.retry', 'Try again')}</Button></Card>;
  const title = feature ? t(`subscription.gate.${feature}.title`, 'Premium') : 'Premium';
  const body = feature
    ? t(`subscription.gate.${feature}.body`, 'This needs Premium.')
    : t('subscription.web_only_message', 'Subscriptions are managed on the web.');
  return (
    <Card className="text-center">
      <p className="shop-kicker">{t('subscription.status.active', 'Premium')}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{title}. {body}</p>
      <div className="mt-4">
        <Button href="/shop/settings/subscription">{t('subscription.cta.manage', 'Manage subscription')}</Button>
      </div>
    </Card>
  );
}

export function NoAccess({ what }: { what: string }) {
  const display = useOptionalUiText();
  return (
    <Card>
      <h2 className="font-display text-xl">{display('You do not have access')}</h2>
      <p className="mt-2 text-muted">{display(what)}</p>
    </Card>
  );
}

/**
 * Loading placeholder: a short skeleton bar instead of "Loading…" text, so the
 * layout does not jump. The label stays for screen readers. Built from spans so
 * it is valid anywhere text is. Prefer `Skeleton` with a variant for lists.
 */
export function Spinner({ label = 'Loading' }: { label?: string }) {
  const display = useOptionalUiText();
  return (
    <span className="shop-skeleton is-line shop-spinner" role="status" aria-busy="true">
      <span className="sr-only">{display(label)}…</span>
      <span className="shop-skeleton-block" aria-hidden="true" />
    </span>
  );
}

/** Underline tabs for switching views of one page. Counts show as a small badge. */
export function Tabs<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: ReadonlyArray<{ id: T; label: ReactNode; count?: number | null }>;
  value: T;
  onChange: (id: T) => void;
}) {
  const move = (from: number, step: number) => {
    const next = items[(from + step + items.length) % items.length];
    if (!next) return;
    onChange(next.id);
    if (typeof document !== 'undefined') requestAnimationFrame(() => document.getElementById(`shop-tab-${next.id}`)?.focus());
  };
  return (
    <div className="shop-tabbar" role="tablist" aria-label={label}>
      {items.map((item, index) => (
        <button
          key={item.id}
          id={`shop-tab-${item.id}`}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          tabIndex={value === item.id ? 0 : -1}
          className={cx('shop-tabbar-tab', value === item.id && 'is-active')}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') { event.preventDefault(); move(index, 1); }
            if (event.key === 'ArrowLeft') { event.preventDefault(); move(index, -1); }
          }}
        >
          {item.label}
          {item.count != null ? <span className={cx('shop-tabbar-count', item.count === 0 && 'is-zero')}>{item.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** Two or three mutually exclusive modes (for example Sell / Add stock). Use Tabs for views. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<{ id: T; label: ReactNode }>;
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="shop-seg shop-segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.id} type="button" aria-pressed={value === option.id} className={value === option.id ? 'is-active' : undefined} onClick={() => onChange(option.id)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** One row of headline figures: label above value, optional help line, divider separated. */
export function StatRow({
  items,
  label,
}: {
  label?: string;
  items: ReadonlyArray<{ label: ReactNode; value: ReactNode; help?: ReactNode; tone?: 'ok' | 'warn' | 'danger' | 'saffron'; href?: string }>;
}) {
  return (
    <dl className="shop-statrow" aria-label={label}>
      {items.map((item, index) => {
        const body = (
          <>
            <dt>{item.label}</dt>
            <dd className={cx('num', item.tone && `is-${item.tone}`)}>{item.value}</dd>
            {item.help ? <dd className="shop-statrow-help">{item.help}</dd> : null}
          </>
        );
        return item.href ? (
          <Link key={index} href={item.href} className="shop-statrow-item is-link">{body}</Link>
        ) : (
          <div key={index} className="shop-statrow-item">{body}</div>
        );
      })}
    </dl>
  );
}

/** The one empty state: tinted icon, short title, one line of help, one action. */
export function EmptyState({
  icon = 'package',
  title,
  body,
  action,
  className,
}: {
  icon?: GlyphName;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('shop-emptystate', className)}>
      <span className="shop-emptystate-icon" aria-hidden="true"><Glyph name={icon} /></span>
      <p className="shop-emptystate-title">{title}</p>
      {body ? <p className="shop-emptystate-body">{body}</p> : null}
      {action ? <div className="shop-emptystate-action">{action}</div> : null}
    </div>
  );
}

/** Placeholder shapes that match the final layout, in place of "Loading…" text. */
export function Skeleton({
  variant = 'row',
  count = 1,
  label = 'Loading',
}: {
  variant?: 'line' | 'stat' | 'row' | 'card';
  count?: number;
  label?: string;
}) {
  return (
    <div className={cx('shop-skeleton', `is-${variant}`)} role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: Math.max(1, count) }, (_, index) => <span key={index} className="shop-skeleton-block" aria-hidden="true" />)}
    </div>
  );
}
