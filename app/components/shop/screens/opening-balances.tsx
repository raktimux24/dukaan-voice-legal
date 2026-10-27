"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../context";
import { PageHeader, Card, Button, Field, Spinner } from "../ui";
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
    <div className="shop-page opening-page">
      <PageHeader
        title={t("opening.title")}
        back={{ href: "/shop/settings", label: t("nav.settings") }}
      />
      {allowed ? (
        <OpeningView
          ui={openingWebUi}
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
