"use client";
import {useEffect,useRef} from "react";
import { useShop } from "../context";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "../ui";
import { openingWebUi } from "./opening-balances";
import { useCommerce } from "../../../lib/shop/commerce/workflow";
import { CommerceView } from "../../../lib/shop/commerce/view";
const storage = {
  getItem: async (k: string) => localStorage.getItem(k),
  setItem: async (k: string, v: string) => localStorage.setItem(k, v),
  removeItem: async (k: string) => localStorage.removeItem(k),
};
export function OnlineStoreScreen() {
  const c = useShop();
  return <Editor key={c.shop?.id + ":" + c.userId} />;
}
function Editor() {
  const active=useRef(true);useEffect(()=>{active.current=true;return()=>{active.current=false}},[]);
  const { api, shop, userId, perms, offline, t: translate, role } = useShop(),
    router = useRouter(),
    params = useSearchParams(),
    t = (key: string, vars?: Record<string, string | number>) =>
      translate(key, key, vars);
  const w = useCommerce(
    api.commerce,
    shop?.id + ":" + userId,
    shop?.id ?? "",
    !!shop && !!userId && perms.canEditProducts && !offline,
    () => crypto.randomUUID(),
    storage,
  );
  return (
    <div className="shop-page retail-workspace">
      <PageHeader
        title={t("commerce.title")}
        back={{ href: "/shop/settings", label: t("nav.settings") }}
      />
      <CommerceView
        w={w}
        ui={openingWebUi}
        t={t}
        owner={role === "OWNER"}
        initialProductId={params.get("productId") ?? undefined}
        openSale={(id)=>router.push("/shop/sales/"+id)}
        bill={(id) => router.push("/shop/estimates?id=" + id)}
        openUrl={(url) => {
          window.open(url, "_blank", "noopener,noreferrer");
        }}
        qr={async (id) => {
          const p = await api.commerce.qr(shop!.id, id);
          if(!active.current)throw Error("commerce_not_allowed");
          const a = document.createElement("a");
          const bytes = Uint8Array.from(atob(p.base64), (c) => c.charCodeAt(0));
          const url = URL.createObjectURL(
            new Blob([bytes], { type: "image/png" }),
          );
          a.href = url;
          a.download = p.filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }}
      />
    </div>
  );
}
