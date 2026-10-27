"use client";

import { useGstText as useUiText } from "../gst-ui";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useMemo, useState } from "react";
import { labeledL1 } from "../../../lib/shop/catalog";
import { inventoryCsv, downloadText } from "../../../lib/shop/csv";
import { formatINR } from "../../../lib/shop/money";
import type { InventoryItem } from "../../../lib/shop/types";
import { formatQty } from "../../../lib/shop/units";
import { useShop } from "../context";
import { Button, Card, Chip, PageHeader, Pill, Spinner } from "../ui";

import { useProductBulk } from "../../../lib/shop/product-bulk/workflow";
import { bulkErrorKey } from "../../../lib/shop/product-bulk/client";
function productFilterLabel(
  id: string,
  fallback: string,
  t: (key: string, fallback: string) => string,
) {
  if (id === "all") return t("home.filter_all", fallback);
  if (id === "low_stock") return t("home.filter_low_stock", fallback);
  if (id === "out_of_stock") return t("home.filter_out_of_stock", fallback);
  if (id === "near_expiry") return t("home.filter_near_expiry", fallback);
  if (id === "unpriced") return t("home.filter_unpriced", fallback);
  return fallback;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "low_stock", label: "Low stock" },
  { id: "out_of_stock", label: "Out of stock" },
  { id: "near_expiry", label: "Near expiry" },
  { id: "unpriced", label: "Unpriced" },
] as const;

function nearExpiry(item: InventoryItem) {
  if (!item.nearestExpiryDate) return false;
  return (
    new Date(item.nearestExpiryDate).getTime() <=
    Date.now() + 60 * 24 * 60 * 60 * 1000
  );
}

function matches(item: InventoryItem, filter: string) {
  if (item.product.isActive === false) return false;
  if (
    item.product.trackStock === false &&
    ["low_stock", "out_of_stock", "near_expiry"].includes(filter)
  )
    return false;
  if (filter === "low_stock") return item.stockStatus === "LOW";
  if (filter === "out_of_stock") return item.stockStatus === "OUT";
  if (filter === "near_expiry") return nearExpiry(item);
  if (filter === "unpriced") return item.product.sellingPrice == null;
  return true;
}

export function ProductsScreen() {
  const uiText = useUiText();
  const { api, shop, userId, perms, offline, hideCost, prefs, t } = useShop();
  const params = useSearchParams();
  const filter = params.get("filter") ?? "all";
  const [q, setQ] = useState(params.get("q") ?? "");
  const router = useRouter(),
    [selecting, setSelecting] = useState(false),
    [selected, setSelected] = useState<string[]>([]),
    anchor = useRef<string | null>(null),
    routed = useRef("");
  const bulk = useProductBulk(
    api.productBulk,
    { shopId: shop?.id ?? "", actorId: userId ?? "" },
    perms.canEditProducts,
    () => crypto.randomUUID(),
  );
  useEffect(() => {
    try {const saved=JSON.parse(sessionStorage.getItem('bulk-selection:'+shop?.id+':'+userId)??'[]');setSelected(Array.isArray(saved)?saved.filter(id=>typeof id==='string'):[]);setSelecting(Array.isArray(saved)&&saved.length>0);}catch{setSelected([]);setSelecting(false);}
    anchor.current = null;
    routed.current = "";
  }, [shop?.id, userId]);
  const returnTo =
    "/shop/products?" + new URLSearchParams({ filter, q }).toString();
  useEffect(() => {
    if (bulk.job && routed.current !== bulk.job.id) {
      routed.current = bulk.job.id;
      try{sessionStorage.setItem('bulk-selection:'+shop?.id+':'+userId,JSON.stringify(selected));}catch{}
      router.push(
        "/shop/products/bulk?" +
          new URLSearchParams({ jobId: bulk.job.id, returnTo }).toString(),
      );
    }
  }, [bulk.job?.id]);
  const blocked = bulk.busy || !!bulk.pending || offline;
  const selectRow = (id: string, shift = false) => {
    if(blocked)return;
    const a = rows.findIndex((i) => i.productId === anchor.current),
      b = rows.findIndex((i) => i.productId === id),
      range =
        shift && a >= 0
          ? rows
              .slice(Math.min(a, b), Math.max(a, b) + 1)
              .map((i) => i.productId)
          : [id];
    setSelected((old) =>
      old.includes(id)
        ? old.filter((x) => !range.includes(x))
        : [...new Set([...old, ...range])],
    );
    anchor.current = id;
  };
  const catalog = useQuery({
    queryKey: ["catalog", shop?.id, hideCost],
    enabled: !!shop?.id,
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
  });
  const rows = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (catalog.data ?? []).filter(
      (item) =>
        matches(item, filter) &&
        (!text ||
          item.product.name.toLowerCase().includes(text) ||
          item.product.barcode?.toLowerCase().includes(text) ||
          item.product.barcodeAliases?.some((code) =>
            code.toLowerCase().includes(text),
          )),
    );
  }, [catalog.data, filter, q]);

  if (!shop) return <Spinner label={uiText("Loading products")} />;

  return (
    <div className="shop-page">
      <PageHeader
        kicker={t("reports.stock.on_hand", "Stock")}
        title={t("products.title", "Products")}
        description={
          catalog.data
            ? `${rows.length} of ${catalog.data.filter((item) => item.product.isActive !== false).length} products`
            : undefined
        }
        actions={
          <>
            <Button
              tone="ghost"
              onClick={() =>
                downloadText(
                  `products-${shop.name}.csv`,
                  inventoryCsv(
                    catalog.data ?? [],
                    hideCost,
                    prefs?.appLanguage,
                  ),
                )
              }
            >
              {t("reports.sales.export_csv", "Export CSV")}
            </Button>
            {perms.canEditProducts ? (
              <Button tone="ghost" onClick={() => setSelecting((v) => !v)}>
                {t(
                  selecting ? "bulk.finish_selection" : "bulk.select",
                  "Select products",
                )}
              </Button>
            ) : null}
            {perms.canEditProducts ? (
              <Button tone="ghost" href="/shop/products/barcodes">
                {t("barcodes.title", "Product barcodes")}
              </Button>
            ) : null}
            {perms.canEditProducts ? (
              <Button tone="ghost" href="/shop/products/import">
                {t("imports.title", "Import products")}
              </Button>
            ) : null}
            {perms.canEditProducts ? (
              <Button href="/shop/products/new">
                {t("products.add", "Add product")}
              </Button>
            ) : null}
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="pos-chips">
          {FILTERS.filter(
            (item) => item.id !== "unpriced" || perms.canEditProducts,
          ).map((item) => (
            <Chip
              key={item.id}
              active={filter === item.id}
              href={
                item.id === "all"
                  ? "/shop/products"
                  : `/shop/products?filter=${item.id}`
              }
            >
              {productFilterLabel(item.id, item.label, t)}
            </Chip>
          ))}
        </div>
        <input
          className="shop-field sm:ml-auto sm:max-w-xs"
          placeholder={t("products.search", "Filter by name or barcode")}
          maxLength={200}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          aria-label={t("products.search", "Filter products")}
        />
      </div>
      {selecting ? (
        <Card className="stack-form">
          <p>
            {t("bulk.selected", "Selected: {{count}}", {
              count: selected.length,
            })}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button tone="ghost" disabled={blocked} onClick={()=>{setSelected([]);try{sessionStorage.removeItem('bulk-selection:'+shop?.id+':'+userId);}catch{}}}>{t('bulk.clear','Clear selection')}</Button>
            <Button
              tone="ghost"
              disabled={blocked}
              onClick={() =>
                setSelected((old) => [
                  ...new Set([...old, ...rows.map((i) => i.productId)]),
                ])
              }
            >
              {t("bulk.select_page", "Select this view")}
            </Button>
            <Button
              tone="ghost"
              disabled={blocked || !rows.length}
              onClick={() =>
                void bulk.start({
                  matching: { query: q, filter: filter as "all" },
                })
              }
            >
              {t("bulk.select_matching", "Select all matching")}
            </Button>
            <Button
              disabled={blocked || !selected.length}
              onClick={() => void bulk.start({ ids: selected })}
            >
              {t("bulk.edit_selected", "Edit {{count}} selected products", {
                count: selected.length,
              })}
            </Button>
          </div>
          {bulk.error ? (
            <p role="alert">
              {t(bulkErrorKey(bulk.error), bulkErrorKey(bulk.error))}
            </p>
          ) : null}
          {bulk.pending && !bulk.busy ? (
            <Button onClick={() => void bulk.recover()}>
              {t("bulk.recover", "Check result")}
            </Button>
          ) : null}
        </Card>
      ) : null}
      {catalog.isLoading ? (
        <Spinner label={uiText("Loading products")} />
      ) : null}
      <Card flush>
        <div className="shop-list">
          {rows.map((item) => (
            <div key={item.id} className="flex items-center">
              {selecting ? (
                <input
                  type="checkbox"
                  className="ml-4 h-5 w-5 shrink-0 accent-orange-500"
                  aria-label={item.product.name}
                  checked={selected.includes(item.productId)}
                  disabled={blocked}
                  onChange={() => {}}
                  onClick={(e) => selectRow(item.productId, e.shiftKey)}
                />
              ) : null}
              <Link
                onClick={(e) => {
                  if (selecting) {
                    e.preventDefault();
                    selectRow(item.productId, e.shiftKey);
                  }
                }}
                style={{ flex: 1, minWidth: 0 }}
                href={`/shop/products/${item.productId}`}
                className="shop-list-row"
              >
                <div className="shop-list-main">
                  <p className="shop-list-title">{item.product.name}</p>
                  <p className="shop-list-meta">
                    {labeledL1(item.product.category, (key) => t(key, key))} ·{" "}
                    {item.product.trackStock === false
                      ? t("pos.no_stock_tracking", "Not stock-tracked")
                      : `${formatQty(item.quantity, item.unit)} ${t("reports.stock.on_hand", "on hand")}`}
                  </p>
                </div>
                <div className="shop-list-right flex items-center gap-4">
                  <p className="num">
                    {item.product.sellingPrice == null ? (
                      <span className="text-muted">
                        {t("home.filter_unpriced", "Unpriced")}
                      </span>
                    ) : (
                      formatINR(item.product.sellingPrice)
                    )}
                  </p>
                  {item.product.trackStock !== false ? (
                    <Pill
                      tone={
                        item.stockStatus === "OUT"
                          ? "danger"
                          : item.stockStatus === "LOW"
                            ? "warn"
                            : "ok"
                      }
                    >
                      {item.stockStatus === "OUT"
                        ? t("home.stat_out_of_stock", "Out")
                        : item.stockStatus === "LOW"
                          ? t("home.stat_low_stock", "Low")
                          : t("reports.stock.on_hand", "In stock")}
                    </Pill>
                  ) : null}
                </div>
              </Link>
            </div>
          ))}
          {!catalog.isLoading && rows.length === 0 ? (
            <p className="shop-list-empty">
              {t("products.empty_filtered", "No products in this view.")}
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
