"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../context";
import { Button, PageHeader } from "../ui";
import { EN_FALLBACK } from "../../../lib/shop/en-fallback";
import {
  usePurchaseOrders,
  type PoStorage,
} from "../../../lib/shop/purchase-orders/workflow";
import { PurchaseOrdersView } from "../../../lib/shop/purchase-orders/view";

const storage: PoStorage = {
  getItem: async (k) => localStorage.getItem(k),
  setItem: async (k, v) => localStorage.setItem(k, v),
  removeItem: async (k) => localStorage.removeItem(k),
};

export function PurchaseOrdersScreen({
  compose = false,
}: {
  compose?: boolean;
}) {
  const c = useShop();
  const entry = useSearchParams();
  return (
    <Editor
      key={JSON.stringify([
        c.shop?.id,
        c.userId,
        compose,
        entry.get("buyListItemId"),
        entry.get("supplierId"),
      ])}
      compose={compose}
    />
  );
}

function Editor({ compose }: { compose: boolean }) {
  const { api, shop, userId, perms, offline, t: translate } = useShop();
  const router = useRouter();
  const params = useSearchParams();
  const opened = useRef("");
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(key, EN_FALLBACK[key] ?? key, vars);
  const w = usePurchaseOrders(
    api.purchaseOrders,
    shop?.id + ":" + userId,
    shop?.id ?? "",
    !!shop && !!userId && perms.canEditProducts && !offline,
    () => crypto.randomUUID(),
    storage,
  );
  const id = params.get("orderId");
  useEffect(() => {
    if (!id && opened.current) {
      opened.current = "";
      w.setOrder(null);
    }
    if (id && opened.current !== id && w.ready && w.allowed) {
      opened.current = id;
      void w.open(id);
    }
  }, [id, w.ready, w.allowed]);
  const linked = !!params.get("buyListItemId") || !!params.get("supplierId");
  return (
    <div className="shop-page po-page">
      {!w.order ? (
        <PageHeader
          kicker={t("poweb.kicker")}
          description={t("poweb.intro")}
          title={t(compose ? "po.new" : "po.title")}
          back={
            compose
              ? { href: "/shop/purchase-orders", label: t("po.all_orders") }
              : { href: "/shop", label: t("nav.home") }
          }
          actions={
            compose || !w.allowed ? undefined : (
              <Button href="/shop/purchase-orders/new">{t("po.new")}</Button>
            )
          }
        />
      ) : null}
      <PurchaseOrdersView
        w={w}
        t={t}
        uuid={() => crypto.randomUUID()}
        initialBuyListId={params.get("buyListItemId") ?? undefined}
        initialBuyListName={params.get("buyListName") ?? undefined}
        initialSupplierId={params.get("supplierId") ?? undefined}
        openForm={(compose || linked) && !id}
        onCreate={() => router.push("/shop/purchase-orders/new")}
        onShowList={() => router.push("/shop/purchase-orders")}
        onOpen={(id) => {
          opened.current = id;
          if (w.order?.id !== id) void w.open(id);
          router.replace(
            "/shop/purchase-orders?orderId=" + encodeURIComponent(id),
            { scroll: false },
          );
        }}
        share={async (text) => {
          if (navigator.share)
            await navigator.share({ title: t("po.title"), text });
          else {
            const url = URL.createObjectURL(
              new Blob([text], { type: "text/plain;charset=utf-8" }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "purchase-order.txt";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
        }}
        invoice={async (p, receipt) => {
          const source = await api.purchaseOrders.invoice(
            shop!.id,
            p.id,
            receipt,
          );
          if (source.lines.length)
            router.push(
              "/shop/purchases/new?supplierId=" +
                p.supplierId +
                "&poOrderId=" +
                p.id +
                "&poReceiptId=" +
                receipt,
            );
          else if (source.invoiceIds.length)
            router.push("/shop/purchases/" + source.invoiceIds[0]);
          else throw Error("po_invoice_unavailable");
        }}
        newProduct={() => {
          window.open("/shop/products/new?qty=0", "_blank", "noopener");
        }}
      />
    </div>
  );
}
