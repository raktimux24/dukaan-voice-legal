import { useEffect, useState } from "react";
import type { OpeningUi } from "../openings/view";
import type { useCommerce } from "./workflow";
import type { OnlineListing, StoreConfig, OrderState } from "./contract";
import { commerceUnit } from "./contract";
export function CommerceView({
  w,
  ui,
  t,
  owner,
  qr,
  openUrl,
  copyLink,
  bill,
  openSale,
  initialProductId,
}: {
  w: ReturnType<typeof useCommerce>;
  ui: OpeningUi;
  t: (k: string, v?: Record<string, string | number>) => string;
  owner: boolean;
  qr: (id: string) => Promise<void>;
  openUrl: (url: string) => Promise<void> | void;
  copyLink?: (url:string) => Promise<void>;
  bill: (estimateId: string) => void;
  openSale?: (saleId: string) => void;
  initialProductId?: string;
}) {
  const { Box, Text, Input, Check, Button, Busy,Tabs,Disclosure,Empty } = ui,
    tr = (k: string, v?: Record<string, string | number>) =>
      t("commerce." + k, v),
    unitLabel = (unit: string) =>
      commerceUnit(unit) ? tr("unit." + commerceUnit(unit)) : unit,
    s = w.store.data?.store,
    p = w.order,
    [tab, setTab] = useState<"setup" | "products" | "orders">(
      initialProductId ? "products" : "setup",
    ),
    [config, setConfig] = useState<StoreConfig | null>(()=>s?.config??null),
    [listing, setListing] = useState<OnlineListing | null>(null),
    [reviewed, setReviewed] = useState(false),
    [preview, setPreview] = useState(false),
    [dirty, setDirty] = useState(false),
    [notice, setNotice] = useState(""),
    [reason, setReason] = useState(""),
    [localBusy, setLocalBusy] = useState(false),[linkCopied,setLinkCopied]=useState(false);
  useEffect(() => {
    if (s) {
      if (!dirty) setConfig(s.config);
      setLinkCopied(false);
      setReviewed(false);
      setPreview(false);
    }
  }, [s?.id,s?.version,dirty]);
  useEffect(() => {
    setReason("");
  }, [p?.id, p?.version]);
  useEffect(() => {
    if (initialProductId && w.store.data?.items) {
      const item = w.store.data.items.find(
        (l) => l.productId === initialProductId,
      );
      if (item) setListing(item);
      else if (w.search !== initialProductId) w.setSearch(initialProductId);
    }
  }, [initialProductId, w.store.data]);
  const editConfig = (value: StoreConfig) => {
    setConfig(value); setDirty(true); setNotice(""); setReviewed(false); setPreview(false); w.setError("");
  };
  const phoneInvalid = !!config?.phone && !/^\+?[0-9 ()-]{10,24}$/.test(config.phone.trim());
  const blocked = w.busy || localBusy || !w.ready || !!w.pending,
    task = async (fn: () => Promise<void>) => {
      setLocalBusy(true);
      try {
        await fn();
      } catch (e: any) {
        w.setError(e.code ?? e.message ?? "commerce_failed");
      } finally {
        setLocalBusy(false);
      }
    },
    error =
      w.error || (w.orderQuery?.isError ? ((w.orderQuery.error as any)?.code ?? "commerce_failed") : "") || (w.store.error as any)?.code || (w.store.isError ? "commerce_failed" : "") || (w.orders.error as any)?.code || (w.orders.isError ? "commerce_failed" : "") || (w.store.isSuccess && !s ? "commerce_failed" : "");
  if (!w.allowed) return <Text tone="danger">{tr("online_role")}</Text>;
  return (
    <Box>
      <Text tone="muted">{tr("intro")}</Text>
      {w.store.data?.orderingAvailable === false ? (
        <Text tone="danger">{tr("error.email_unavailable")}</Text>
      ) : null}
      {tab === "setup" ? <Box row>
        <Button label={tr("nav_products")} onPress={() => { setTab("products"); w.setOrder(null); setListing(null); }} />
        <Button label={tr("nav_orders")} onPress={() => { setTab("orders"); w.setOrder(null); setListing(null); }} />
      </Box> : <Button label={tr("nav_setup")} onPress={() => { setTab("setup"); w.setOrder(null); setListing(null); }} />}
      {w.busy || localBusy || w.store.isPending ? (
        <Busy label={t("common.loading")} />
      ) : null}
      {error ? (
        <Box card>
          <Text tone="danger" live>
            {tr("error." + String(error).replace(/^commerce_/, "")) ===
            "commerce.error." + String(error).replace(/^commerce_/, "")
              ? tr("error.failed")
              : tr("error." + String(error).replace(/^commerce_/, ""))}
          </Text>
          {!w.pending ? <Button label={t("common.retry")} onPress={()=>{w.setError("");void w.refresh()}}/> : null}
        </Box>
      ) : null}
      {notice ? <Text live>{tr(notice)}</Text> : null}
      {w.pending && !w.busy ? (
        <Box card>
          <Text live>{tr("pending")}</Text>
          <Button
            label={tr("retry")}
            disabled={w.busy}
            onPress={() => void w.run()}
          />
          {[
            "commerce_invalid",
            "commerce_not_allowed",
            "commerce_not_found",
            "commerce_setup",
            "commerce_fulfilment",
            "commerce_payment",
            "commerce_review",
            "commerce_stale",
            "commerce_conflict",
            "commerce_product",
            "commerce_quantity",
            "commerce_tax",
            "commerce_amount",
            "commerce_changed",
            "commerce_customer",
            "commerce_state",
            "commerce_reason",
            "commerce_unpaid",
            "commerce_return_required",
            "commerce_in_progress",
            "commerce_stock",
          ].includes(String(error)) ? (
            <Button
              label={tr("dismiss_rejected")}
              disabled={w.busy}
              onPress={() => void w.reset()}
            />
          ) : null}
        </Box>
      ) : null}
      {tab === "setup" && s && config ? (
        <Box>
          <Box card>
            <Text heading>{s.published ? tr("published") : tr("draft")}</Text>
            <Text heading>{s.config.name}</Text>
            <Text tone="muted">{tr("catalogue_link")} · {new URL(s.url).host}</Text>
            {copyLink?<Button label={tr("copy_store_link")} onPress={()=>void task(async()=>{await copyLink(s.url);setLinkCopied(true)})} disabled={localBusy}/>:null}
            {linkCopied?<Text live>{tr("link_copied")}</Text>:null}
            {Disclosure?<Disclosure label={tr("link_details")}><Text>{s.url}</Text></Disclosure>:null}
            <Text tone="muted">{tr("draft_help")}</Text>
          </Box>
          <Box card>
            <Text heading>{tr("group_customers")}</Text>
            {(["name", "phone", "address", "hours", "policy"] as const).map(
              (k) => (
                <Input
                  key={k}
                  label={tr("config_" + k)}
                  value={config[k]}
                  disabled={!owner || blocked}
                  multiline={["address", "hours", "policy"].includes(k)}
                  onChange={(v) => editConfig({ ...config, [k]: v })}
                />
              ),
            )}
            <Text heading>{tr("group_collect")}</Text>
            {(["pickup", "delivery"] as const).map((k) => (
              <Check
                key={k}
                label={tr("config_" + k)}
                value={config[k]}
                disabled={!owner || blocked}
                onChange={(v) => editConfig({ ...config, [k]: v })}
              />
            ))}
            <Text heading>{tr("group_pay")}</Text>
            {(["cash", "upi"] as const).map((k) => (
              <Check
                key={k}
                label={tr("config_" + k)}
                value={config[k]}
                disabled={!owner || blocked}
                onChange={(v) => editConfig({ ...config, [k]: v })}
              />
            ))}
            {phoneInvalid ? <Text tone="danger" live>{tr("error.phone")}</Text> : null}
            <Text tone="muted">{tr("payment_help")}</Text>
            <Text tone="muted">{tr("delivery_help")}</Text>
            {owner ? (
              <Button
                primary
                label={tr("save_setup")}
                disabled={blocked || phoneInvalid}
                onPress={() => {
                  void w.run({ kind: "configure", version: s.version, config }).then(result=>{
                    if (result?.store) {setConfig(result.store.config);setDirty(false);setNotice("setup_saved");}
                  });
                }}
              />
            ) : null}
          </Box>
          <Text heading>{tr("publish_checklist")}</Text>
          {dirty ? <Text live>{tr("unsaved_setup")}</Text> : null}
          {s.issues.map((k) => (
            <Text key={k} tone="danger">
              {tr("issue_" + k)}
            </Text>
          ))}
          {s.issues.includes("listings") ? <Button label={tr("choose_products")} disabled={blocked} onPress={()=>setTab("products")}/> : null}
          <Button
            label={tr("preview")}
            onPress={() => setPreview((v) => !v)}
            disabled={blocked || dirty}
          />
          {preview ? (
            <Box card>
              <Text heading>{s.config.name}</Text>
              <Text>{s.config.address}</Text>
              <Text>{s.config.phone}</Text>
              <Text>{s.config.hours}</Text>
              <Text>{s.config.policy}</Text>
              {w.store.data?.items
                .filter((l) => l.visible)
                .map((l) => (
                  <Box key={l.id} card>
                    <Text heading>{l.name}</Text>
                    <Text>{l.description}</Text>
                    <Text>
                      {tr("price_unit", {
                        price: l.price,
                        unit: unitLabel(l.unit),
                      })}
                    </Text>
                  </Box>
                ))}
              <Text tone="muted">{tr("preview_help")}</Text>
            </Box>
          ) : null}
          {owner ? (
            <Box card>
              <Check
                label={tr("publish_review")}
                value={reviewed}
                disabled={blocked || dirty || !preview}
                onChange={setReviewed}
              />
              {!s.published && !dirty && s.ready && !preview ? <Text tone="muted">{tr("preview_next")}</Text> : null}
              <Button
                primary
                label={s.published ? tr("unpublish") : tr("publish")}
                disabled={blocked || (!s.published && (dirty || !s.ready || !reviewed))}
                onPress={() =>
                  void w.run({
                    kind: "publish",
                    version: s.version,
                    published: !s.published,
                    reviewed,
                  })
                }
              />
            </Box>
          ) : null}
          {s.published ? (
            <Button
              label={tr("open_store")}
              onPress={() => void openUrl(s.url)}
            />
          ) : null}
        </Box>
      ) : null}
      {tab === "products" ? (
        <Box>
          <Input
            label={tr("search_products")}
            value={w.search}
            disabled={blocked}
            onChange={(v) => {
              w.setOffset(0);
              w.setSearch(v);
            }}
          />
          {listing ? (
            <Box card>
              <Text heading>{listing.name}</Text>
              <Text tone="muted">{listing.url}</Text>
              <Input
                label={tr("listing_name")}
                value={listing.name}
                disabled={blocked}
                onChange={(name) => setListing({ ...listing, name })}
              />
              <Input
                label={tr("listing_description")}
                value={listing.description}
                multiline
                disabled={blocked}
                onChange={(description) =>
                  setListing({ ...listing, description })
                }
              />
              <Check
                label={tr("visible")}
                value={listing.visible}
                disabled={blocked || !listing.supported}
                onChange={(visible) => setListing({ ...listing, visible })}
              />
              <Text>
                {tr("price_unit", {
                  price: listing.price,
                  unit: unitLabel(listing.unit),
                })}
              </Text>
              <Text tone="muted">{tr("price_help")}</Text>
              <Box row>
                <Button
                  primary
                  label={tr("save_listing")}
                  disabled={blocked}
                  onPress={() =>
                    void w.run({
                      kind: "listing",
                      id: listing.id,
                      name: listing.name,
                      description: listing.description,
                      visible: listing.visible,
                    })
                  }
                />
                <Button
                  label={tr("download_qr")}
                  disabled={blocked}
                  onPress={() => void task(() => qr(listing.id))}
                />
                <Button
                  label={t("common.close")}
                  onPress={() => setListing(null)}
                />
              </Box>
              <Text tone="muted">{tr("qr_help")}</Text>
            </Box>
          ) : null}
          {w.store.data?.items.map((l) => (
            <Box card key={l.id}>
              <Text heading>{l.name}</Text>
              <Text>
                {l.visible ? tr("listed") : tr("hidden")} ·{" "}
                {tr(l.available ? "available" : "unavailable")}
              </Text>
              <Text>
                {tr("price_unit", {
                  price: l.price,
                  unit: unitLabel(l.unit),
                })}
              </Text>
              {!l.supported ? (
                <Text tone="danger">{tr("unsupported_product")}</Text>
              ) : null}
              <Box row>
                <Button
                  label={tr("edit_listing")}
                  disabled={blocked}
                  onPress={() => setListing(l)}
                />
                <Button
                  label={tr("download_qr")}
                  disabled={blocked}
                  onPress={() => void task(() => qr(l.id))}
                />
              </Box>
            </Box>
          ))}
          {w.store.data?.items.length === 0 ? (
            Empty ? <Empty title={tr("no_products")} /> : <Text>{tr("no_products")}</Text>
          ) : null}
          <Box row>
            {w.offset > 0 ? (
              <Button
                label={tr("previous")}
                onPress={() => w.setOffset(Math.max(0, w.offset - 30))}
              />
            ) : null}
            {w.store.data?.more ? (
              <Button
                label={tr("more")}
                onPress={() => w.setOffset(w.offset + 30)}
              />
            ) : null}
          </Box>
        </Box>
      ) : null}
      {tab === "orders" ? (
        <Box>
          <Button
            label={tr("refresh")}
            disabled={blocked}
            onPress={() => void w.refresh()}
          />
          {p ? (
            <Box card>
              <Text heading>{p.number}</Text>
              <Text>
                {tr("state_" + p.state)} · {tr("payment_" + p.payment)}
              </Text>
              <Text>
                {p.customer.name} · {p.customer.phone}
              </Text>
              <Text>{p.customer.email}</Text>
              <Text>
                {tr("config_" + p.fulfilment)} {p.customer.address}
              </Text>
              {p.lines.map((l) => (
                <Text key={l.listingId}>
                  {l.name} · {l.quantity} {unitLabel(l.unit)} · ₹{l.price}
                </Text>
              ))}
              <Text heading>{tr("total_amount", { amount: p.total })}</Text>
              {p.expiresAt && !p.saleId ? (
                <Text tone="muted">
                  {tr("reservation_until", {
                    at: new Date(p.expiresAt).toLocaleString(),
                  })}
                </Text>
              ) : null}
              {!p.saleId &&
              !["fulfilled", "cancelled", "rejected"].includes(p.state) ? (
                <Input
                  label={tr("reason")}
                  value={reason}
                  onChange={setReason}
                  disabled={blocked}
                />
              ) : null}
              <Box row>
                {(p.state === "requested"
                  ? ["accepted", "rejected"]
                  : p.state === "expired"
                    ? ["accepted"]
                    : p.state === "accepted"
                      ? ["preparing"]
                      : p.state === "preparing"
                        ? ["ready"]
                        : p.state === "ready"
                          ? p.fulfilment === "delivery"
                            ? ["out_for_delivery", "fulfilled"]
                            : ["fulfilled"]
                          : p.state === "out_for_delivery"
                            ? ["fulfilled"]
                            : []
                ).map((state) => (
                  <Button
                    key={state}
                    label={tr("action_" + state)}
                    disabled={
                      blocked ||
                      (state === "fulfilled" && !p.saleId) ||
                      (state === "rejected" && !reason.trim())
                    }
                    onPress={() =>
                      void w.run({
                        kind: "order",
                        id: p.id,
                        version: p.version,
                        state: state as OrderState,
                        note: reason,
                      })
                    }
                  />
                ))}
                {!p.saleId &&
                !["fulfilled", "cancelled", "rejected"].includes(p.state) ? (
                  <Button
                    label={tr("cancel")}
                    disabled={blocked || !reason.trim()}
                    onPress={() =>
                      void w.run({
                        kind: "order",
                        id: p.id,
                        version: p.version,
                        state: "cancelled",
                        note: reason,
                      })
                    }
                  />
                ) : null}
              </Box>
              {["ready", "out_for_delivery"].includes(p.state) && !p.saleId ? (
                <Button
                  primary
                  label={tr("bill_collect")}
                  disabled={blocked}
                  onPress={() =>
                    void w
                      .run({ kind: "bill", id: p.id, version: p.version })
                      .then((r) => {
                        if (r?.estimateId) bill(r.estimateId);
                      })
                  }
                />
              ) : null}
              {!p.saleId ? (
                <Text tone="muted">{tr("bill_help")}</Text>
              ) : openSale ? (
                <Button
                  label={t("estimates.open_bill")}
                  onPress={() => openSale(p.saleId!)}
                />
              ) : null}
              <Button
                label={tr("close_order")}
                onPress={() => w.setOrder(null)}
              />
            </Box>
          ) : null}
          {(["requested"] as const).length && w.orders.data ? (
            [
              ["group_decision", ["requested"]],
              ["group_progress", ["accepted", "preparing", "ready", "out_for_delivery"]],
              ["group_done", ["fulfilled", "rejected", "cancelled", "expired"]],
            ] as const
          ).map(([label, states]) => {
            const items = w.orders.data?.items.filter((o) => (states as readonly string[]).includes(o.state)) ?? [];
            if (!items.length) return null;
            return <Box key={label}>
              <Text heading>{tr(label)}</Text>
              {items.map((o) => (
                <Box key={o.id} card>
                  <Text heading>{o.number} · {o.customer.name}</Text>
                  <Text>{tr("state_" + o.state)} · {tr("payment_" + o.payment)}</Text>
                  <Text>{tr("total_amount", { amount: o.total })}</Text>
                  <Button label={tr("open_order")} disabled={blocked} onPress={() => void w.open(o.id)} />
                </Box>
              ))}
            </Box>;
          }) : null}
          {w.orders.data?.items.length === 0 ? (
            Empty ? <Empty title={tr("no_orders")} /> : <Text>{tr("no_orders")}</Text>
          ) : null}
          <Box row>
            {w.orderOffset > 0 ? (
              <Button
                label={tr("previous")}
                onPress={() =>
                  w.setOrderOffset(Math.max(0, w.orderOffset - 30))
                }
              />
            ) : null}
            {w.orders.data?.more ? (
              <Button
                label={tr("more")}
                onPress={() => w.setOrderOffset(w.orderOffset + 30)}
              />
            ) : null}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
