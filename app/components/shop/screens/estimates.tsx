"use client";
import {
  useEffect,
  useRef,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../context";
import { PageHeader, Button } from "../ui";
import { openingWebUi } from "./opening-balances";
import { DocumentPreview } from "../document-preview";
import {
  useEstimates,
  type EstimateStorage,
} from "../../../lib/shop/estimates/workflow";
import {
  EstimatesView,
  type EstimateControls,
} from "../../../lib/shop/estimates/view";
import { estimateExpired } from "../../../lib/shop/estimates/contract";
import {
  draftFromCart,
  cartFromEstimate,
} from "../../../lib/shop/estimates/handoff";
import { useCart, readCart, readPending } from "../../../lib/shop/cart";
import {
  financialScope,
  retainedRequests,
} from "../../../lib/shop/gst-storage";
import {
  EstimateEditor,
  EstimateList,
  EstimateSummary,
  EstimateHistory,
  EstimateResponse,
  EstimateShare,
} from "./estimate-workspace";
import "./estimates.css";
const storage: EstimateStorage = {
  getItem: async (k) => localStorage.getItem(k),
  setItem: async (k, v) => localStorage.setItem(k, v),
  removeItem: async (k) => localStorage.removeItem(k),
};
export function EstimatesScreen() {
  const c = useShop();
  return <Editor key={c.shop?.id + ":" + c.userId} />;
}
function Editor() {
  const { api, shop, userId, perms, offline, t: translate } = useShop(),
    router = useRouter(),
    params = useSearchParams(),
    opened = useRef(""),
    controls = useRef<EstimateControls | null>(null),
    guard = useRef<null | (() => boolean)>(null),
    t = (key: string, vars?: Record<string, string | number>) =>
      translate(key, key, vars),
    cart = useCart(userId, shop?.id ?? null);
  const origin = useRef(
    params.get("from") === "sell" || params.get("fromCart") === "1"
      ? "sell"
      : "sales",
  ).current;
  const listPath = "/shop/estimates" + (origin === "sell" ? "?from=sell" : "");
  const detailPath = (id: string) =>
    listPath + (origin === "sell" ? "&" : "?") + "id=" + id;
  const initial = useMemo(() => {
    if (params.get("fromCart") !== "1" || !cart.cart.lines.length) return {};
    try {
      return { draft: draftFromCart(cart.cart, () => crypto.randomUUID()) };
    } catch {
      return { error: true };
    }
  }, []);
  const [editing, setEditing] = useState(!!initial.draft),
    [shareText, setShareText] = useState("");
  const w = useEstimates(
      api.estimates,
      shop?.id + ":" + userId,
      shop?.id ?? "",
      !!shop && !!userId && perms.canSell && !offline,
      () => crypto.randomUUID(),
      storage,
    ),
    id = params.get("id"),
    p = w.order,
    blocked = w.busy || !!w.pending || !w.ready;
  useEffect(() => {
    if (id && opened.current !== id && w.ready) {
      opened.current = id;
      void w.open(id);
    } else if (!id && opened.current) {
      opened.current = "";
      controls.current?.cancelEdit();
      w.clearError();
      w.setOrder(null);
    }
  }, [id, w.ready]);
  useEffect(() => {
    if (p?.id) {
      opened.current = p.id;
      router.replace(detailPath(p.id), { scroll: false });
    }
  }, [p?.id]);
  const back = () => {
    if (blocked) return;
    if (editing) {
      guard.current?.();
      return;
    }
    if (p || id) {
      opened.current = "";
      w.clearError();
      w.setOrder(null);
      router.replace(listPath, { scroll: false });
    } else router.push("/shop/" + origin);
  };
  const ui = {
    ...openingWebUi,
    Button: ({
      label,
      onPress,
      disabled,
      primary,
    }: ComponentProps<typeof openingWebUi.Button>) => (
      <Button
        tone={primary ? "primary" : "ghost"}
        onClick={onPress}
        disabled={
          disabled ||
          (label === t("estimates.issue") && !!p && estimateExpired(p))
        }
      >
        {label}
      </Button>
    ),
  };
  return (
    <div className="shop-page retail-workspace estimates-page">
      <button
        type="button"
        className="shop-back estimate-back"
        disabled={blocked}
        onClick={back}
      >
        ←{" "}
        {t(
          editing ? "common.back" : p || id ? "estimates.all" : "nav." + origin,
        )}
      </button>
      <PageHeader
        title={
          editing
            ? t(
                p?.status === "draft"
                  ? "estimates.mobile.edit_title"
                  : "estimates.new",
              )
            : p
              ? p.number || t("estimates.mobile.draft_title")
              : t("estimates.mobile.title_short")
        }
        description={!editing && !p ? t("estimates.mobile.intro") : undefined}
        actions={
          !editing && w.allowed && (!p || p.status === "draft") ? (
            <Button
              tone={p ? "ghost" : "primary"}
              disabled={blocked}
              onClick={() =>
                p ? controls.current?.edit() : controls.current?.create()
              }
            >
              {t(p ? "estimates.edit" : "estimates.new")}
            </Button>
          ) : undefined
        }
      />
      {initial.error ? (
        <p role="alert">{t("estimates.unsupported")}</p>
      ) : (
        <EstimatesView
          w={w}
          ui={ui}
          t={t}
          uuid={() => crypto.randomUUID()}
          initialDraft={initial.draft}
          hasCart={!!cart.cart.lines.length}
          controls={controls}
          onEditingChange={setEditing}
          hideIntro
          hideBackButton
          hideDraftEdit
          renderEditor={(props) => (
            <EstimateEditor
              {...props}
              guard={guard}
              cancel={() => {
                props.cancel();
                if (params.get("fromCart"))
                  router.replace(listPath, { scroll: false });
              }}
            />
          )}
          renderList={(props) =>
            w.list.isPending ? null : (
              <EstimateList
                {...props}
                open={(id) => {
                  opened.current = id;
                  router.push(detailPath(id), { scroll: false });
                  props.open(id);
                }}
              />
            )
          }
          renderSummary={(p) => (
            <EstimateSummary
              p={p}
              blocked={blocked}
              recheck={() =>
                void w.run({
                  kind: "save",
                  id: p.id,
                  version: p.version,
                  draft: p.draft,
                })
              }
            />
          )}
          Secondary={EstimateHistory}
          Response={EstimateResponse}
          renderError={({ message, retry, canRetry }) => (
            <div className="estimate-alert" role="alert">
              <p>{message}</p>
              {canRetry && (
                <Button tone="ghost" onClick={retry}>
                  {t("common.retry")}
                </Button>
              )}
            </div>
          )}
          share={async (text) => {
            setShareText(text);
          }}
          prepare={async (p) => {
            const current = readCart(userId!, shop!.id);
            if (
              current.estimateSource &&
              current.estimateSource.intentId !== p.intent?.source.intentId
            )
              throw Error("estimates_in_progress");
            if (
              current.estimateSource?.intentId === p.intent?.source.intentId
            ) {
              router.push("/shop/sell/checkout");
              return;
            }
            if (
              readPending(userId!, shop!.id) ||
              (await retainedRequests(financialScope(shop!.id))).some(
                (r) => r.state === "pending" && r.path.endsWith("/sales"),
              )
            )
              throw Error("estimates_checkout_pending");
            const data = await api.getAllInventory(shop!.id, true, true);
            if (
              JSON.stringify(readCart(userId!, shop!.id)) !==
              JSON.stringify(current)
            )
              throw Error("estimates_cart_changed");
            cart.update(cartFromEstimate(p, data) as any);
            router.push("/shop/sell/checkout");
          }}
          openSale={(id) => router.push("/shop/sales/" + id)}
          renderDocument={(data) => <DocumentPreview {...data} />}
        />
      )}{" "}
      {shareText && (
        <EstimateShare
          text={shareText}
          number={p?.number ?? "estimate"}
          close={() => setShareText("")}
        />
      )}
    </div>
  );
}
