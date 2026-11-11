"use client";
import {ProductImageById} from "../product-image";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../context";
import { PageHeader, Card, Button, Field, IllustratedEmpty, Spinner } from "../ui";
import { TabList } from "../settings-tabs";
import { useOpenings } from "../../../lib/shop/openings/workflow";
import { OpeningView, type OpeningUi } from "../../../lib/shop/openings/view";
import {
  financialScope,
  retainedRequests,
} from "../../../lib/shop/gst-storage";
import { recoverReservedSales } from "../../../lib/shop/gst-issuance";
import type { OpeningStorage } from "../../../lib/shop/openings/retained";
const storage: OpeningStorage = {
  getItem: async (key) => window.localStorage.getItem(key),
  setItem: async (key, value) => window.localStorage.setItem(key, value),
  removeItem: async (key) => window.localStorage.removeItem(key),
};
export const openingWebUi: OpeningUi = {
  ProductPhoto:props=><ProductImageById {...props} size={36}/>,
  Tabs: ({items,value,onChange,disabled}) => <TabList className="shop-seg retail-section-tabs" items={items.map(item=>[item.key,item.label] as const)} value={value} disabled={disabled} onChange={onChange}/>,
  Disclosure: ({label,children}) => <details className="retail-details"><summary>{label}</summary><div>{children}</div></details>,
  SavedSetup: ({ status, details, onPress, disabled }) => <button type="button" className="opening-saved" onClick={onPress} disabled={disabled}><span><strong>{status}</strong><small>{details}</small></span><span aria-hidden="true">→</span></button>,
  Steps: ({ labels, current, disabled, onSelect }) => <Card className="opening-stack"><h2 className="shop-section-title">{labels[current]}</h2><nav className="opening-steps" aria-label={labels[current]}>{labels.map((label, index) => <button type="button" key={label} aria-label={label} aria-current={index === current ? 'step' : undefined} disabled={disabled || index === 4} onClick={() => onSelect(index)}><span>{index + 1}</span><small>{label}</small></button>)}</nav></Card>,
  Box: ({ children, card, row }) =>
    card ? (
      <Card className="opening-stack">{children}</Card>
    ) : (
      <div className={row ? "opening-actions" : "opening-stack"}>
        {children}
      </div>
    ),
  Text: ({ children, heading, tone, live }) =>
    heading ? (
      <h2 className="shop-section-title">{children}</h2>
    ) : (
      <p
        role={live ? "status" : undefined}
        className={"opening-text " + (tone ?? "")}
      >
        {children}
      </p>
    ),
  Button: ({ label, onPress, disabled, primary }) => (
    <Button
      tone={primary ? "primary" : "ghost"}
      onClick={onPress}
      disabled={disabled}
    >
      {label}
    </Button>
  ),
  Input: ({ label, value, onChange, disabled, type, multiline }) => (
    <Field label={label}>
      {multiline ? (
        <textarea
          className="shop-field"
          value={
            type === "datetime" && value
              ? new Date(Date.parse(value) + 19800000)
                  .toISOString()
                  .slice(0, 16)
              : value
          }
          disabled={disabled}
          onChange={(e) =>
            onChange(
              type === "datetime" && e.target.value
                ? new Date(e.target.value + ":00+05:30").toISOString()
                : e.target.value,
            )
          }
        />
      ) : (
        <input
          className="shop-field"
          type={
            type === "datetime"
              ? "datetime-local"
              : type === "date"
                ? "date"
                : "text"
          }
          inputMode={type === "decimal" ? "decimal" : undefined}
          value={
            type === "datetime" && value
              ? new Date(Date.parse(value) + 19800000)
                  .toISOString()
                  .slice(0, 16)
              : value
          }
          disabled={disabled}
          onChange={(e) =>
            onChange(
              type === "datetime" && e.target.value
                ? new Date(e.target.value + ":00+05:30").toISOString()
                : e.target.value,
            )
          }
        />
      )}
    </Field>
  ),
  Select: ({ label, value, options, onChange, disabled }) => (
    <Field label={label}>
      <select aria-label={label} className="shop-field" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value || "none"} value={option.value}>{option.label}</option>)}
      </select>
    </Field>
  ),
  Check: ({ label, value, onChange, disabled }) => (
    <label className="opening-check">
      <input
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  ),
  Busy: ({ label }) => <Spinner label={label} />,
  Empty: ({ title, body, actionLabel, onAction }) => (
    <IllustratedEmpty title={title} body={body} action={actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : undefined} />
  ),
};
export const openingWorkspaceUi:OpeningUi={...openingWebUi,
 Section:({title,hint,children})=><section className="opening-section">{title?<h2>{title}</h2>:null}{hint?<p className="shop-hint">{hint}</p>:null}<div className="opening-section-content">{children}</div></section>,
 Notice:({tone,children})=><div className={'opening-banner tone-'+tone}>{children}</div>,
 Badge:({label,tone})=><span className={'opening-badge tone-'+tone}>{label}</span>,
 Stat:({label,value,big,tone})=><div className={'opening-stat tone-'+tone+(big?' is-total':'')}><span>{label}</span><strong className="num">{value}</strong></div>,
 Row:({title,subtitle,description,badge,leading,trailing,onPress,disabled,emphasis})=>{const content=<><div className="opening-row-main">{leading}<div><strong>{title}</strong>{subtitle?<p className="shop-hint">{subtitle}</p>:null}{description?<p className="shop-hint">{description}</p>:null}</div></div>{badge?<span className={'opening-badge tone-'+badge.tone}>{badge.label}</span>:null}{trailing!=='none'&&onPress?<span aria-hidden="true">{trailing==='plus'?'+':trailing==='check'?'✓':'→'}</span>:null}</>;return onPress?<button className={'opening-record'+(emphasis?' is-emphasized':'')} onClick={onPress} disabled={disabled}>{content}</button>:<div className="opening-record">{content}</div>},
 Choice:({options,value,onChange,disabled,cards})=><div className={'opening-options'+(cards?' as-cards':'')} role="group">{options.map(o=><button key={o.value} disabled={disabled} aria-pressed={value===o.value} onClick={()=>onChange(o.value)}><strong>{o.label}</strong>{o.hint?<small>{o.hint}</small>:null}</button>)}</div>,
 Link:({label,onPress,disabled,tone,back})=><Button tone="quiet" onClick={onPress} disabled={disabled} className={tone==='danger'?'text-danger':undefined}>{back?'← ':''}{label}</Button>,
 Footer:({primary,secondary,links})=><footer className="opening-workspace-footer"><div>{secondary}{primary}</div>{links?<div>{links}</div>:null}</footer>
};

export function OpeningBalancesScreen() {
  const c = useShop();
  return <Editor key={c.shop?.id + ":" + c.userId} />;
}
function Editor() {
  const { api, shop, userId, perms, role, t: translate, offline } = useShop(),
    params = useSearchParams(),
    router = useRouter(),
    onboarding = params.get("onboarding") === "1";
  const t = (key: string, vars?: Record<string, string | number>) =>
      translate(key, key, vars),
    allowed = !!shop && !!userId && perms.canEditProducts && !offline;
  const w = useOpenings(
    api.openings,
    { shopId: shop?.id ?? "", actorId: userId ?? "" },
    allowed,
    () => crypto.randomUUID(),
    storage,
    async () => {
      const scope = financialScope(shop!.id);
      if (scope.actorId !== userId) throw Error("opening_scope");
      await recoverReservedSales(scope, true);
      const requests = await retainedRequests(scope);
      return requests.filter((r) => r.state === "pending").length;
    },
    async () => navigator.onLine && !offline,
  );
  const opened = useRef(""),
    id = params.get("sessionId"),
    importId = params.get("importId"),
    kind = params.get("kind");
  useEffect(() => {
    const key = id + ":" + importId;
    if (id && w.metadata.isSuccess && opened.current !== key) {
      opened.current = key;
      if (importId && ["stock", "customer", "supplier"].includes(kind ?? ""))
        void w.attach(id, kind as "stock" | "customer" | "supplier", importId);
      else void w.open(id);
    }
  }, [id, importId, kind, w.metadata.isSuccess]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [w.view, w.draft.step]);
  return (
    <div className="shop-page opening-page opening-workspace">
      <PageHeader
        title={t("opening.title")}
        back={{ href: "/shop/settings?section=data", label: t("nav.settings"), disabled: w.busy || !!w.pending, onClick: () => {
          if (w.busy || w.pending) return;
          const leave = () => router.push(onboarding ? '/shop' : '/shop/settings?section=data');
          if (w.view === 'edit' && w.session) void w.saveAndLeave(leave);
          else leave();
        } }}
      />
      {allowed ? (
        <OpeningView
          ui={openingWorkspaceUi}
          w={w}
          t={t}
          owner={role === "OWNER"}
          onboarding={onboarding}
          finish={() => router.push("/shop")}
          importRows={(kind, id) =>
            router.push(
              "/shop/" +
                (kind === "stock" ? "products" : kind + "s") +
                "/import?openingSessionId=" +
                id +
                (onboarding ? "&onboarding=1" : ""),
            )
          }
        />
      ) : (
        <Card>{t("opening.error.not_allowed")}</Card>
      )}
    </div>
  );
}
