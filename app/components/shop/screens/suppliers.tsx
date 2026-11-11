"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useShop } from "../context";
import {
  Button,
  Field,
  NoAccess,
  Notice,
  PageHeader,
  Spinner,
  inputClass,
} from "../ui";
import { useGstPages, More } from "../gst-workspace";
import { SupplierEditor } from "../gst-supplier";
import { ProductImageById } from "../product-image";
import { formatINR } from "../../../lib/shop/money";
import { useShopDates } from "../use-shop-dates";
import {
  supplierDirectory,
  supplierComparisons,
  supplierHistoryUrl,
} from "../../../lib/shop/suppliers";
export function SuppliersScreen() {
  const { shop, userId } = useShop();
  return <Directory key={`${shop?.id}:${userId}`} />;
}
function Directory() {
  const { api, shop, userId, perms, offline, t } = useShop(),
    router = useRouter(),
    params = useSearchParams(),
    { formatDay } = useShopDates();
  const [tab, setTab] = useState(
      params.get("tab") === "compare" ? "compare" : "list",
    ),
    [q, setQ] = useState(""),
    [priceQ, setPriceQ] = useState(""),
    [adding, setAdding] = useState(false);
  const allowed = !!shop && perms.canSeeCost;
  // Search the server directory, preserving pagination and explicit receipt-name links.
  const directory = useGstPages(
    ["suppliers", q],
    (cursor) => api.gst.suppliers(shop!.id, q, cursor),
    allowed,
  );
  const list = useQuery({
    queryKey: ["suppliers", shop?.id, userId],
    enabled: allowed,
    queryFn: () => api.getSuppliers(shop!.id),
  });
  const orders = useQuery({
    queryKey: ["supplier-order-counts", shop?.id, userId],
    enabled: allowed,
    queryFn: () => api.purchaseOrders.supplierCounts(shop!.id),
  });
  const compare = useQuery({
    queryKey: ["supplier-compare", shop?.id, userId],
    enabled: allowed && tab === "compare",
    queryFn: () => api.compareSuppliers(shop!.id),
  });
  if (!shop) return <Spinner />;
  if (!perms.canSeeCost)
    return (
      <NoAccess
        what={t(
          "suppliers.no_access_subtitle",
          "Only owners and managers can view purchase costs.",
        )}
      />
    );
  const saved = directory.data?.pages.flatMap((p) => p.items) ?? [],
    receipts = list.data?.suppliers ?? [],
    rows = supplierDirectory(saved, receipts, q),
    compared = supplierComparisons(compare.data?.products ?? [], priceQ);
  const refresh = () => {
    void directory.refetch();
    void list.refetch();
    void orders.refetch();
    if (tab === "compare") void compare.refetch();
  };
  return (
    <div className="shop-page supplier-workspace">
      <PageHeader
        kicker={t("poweb.kicker", "Purchasing")}
        title={t("suppliers.title", "Suppliers")}
        description={t(
          "supplierweb.intro",
          "Your suppliers, purchase records and last paid prices.",
        )}
        actions={
          <>
            <Button tone="ghost" onClick={refresh}>
              {t("common.refresh", "Refresh")}
            </Button>
            {perms.canEditProducts ? (
              <Button disabled={offline || adding} onClick={() => setAdding(true)}>
                {t(
                  "purchase.add_supplier",
                  "Add supplier",
                )}
              </Button>
            ) : null}
          </>
        }
      />
      {adding ? (
        <section className="supplier-editor">
          <h2>{t("directoryUI.business_details", "Business details")}</h2>
          <SupplierEditor
            onCancel={()=>setAdding(false)}
            onSaved={(s) => {
              setAdding(false);
              router.push(
                "/shop/suppliers/records/" + encodeURIComponent(s.id),
              );
            }}
          />
        </section>
      ) : null}
      <div className="buy-heading">
        <div className="buy-tabs">
          {["list", "compare"].map((key) => (
            <button
              key={key}
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
            >
              {t(
                "suppliers.tab." + key,
                key === "list" ? "Suppliers" : "Price compare",
              )}
            </button>
          ))}
        </div>
        {perms.canEditProducts ? (
          <Button tone="quiet" href="/shop/suppliers/import">
            {t("partiesImport.supplier_title", "Import suppliers")} ›
          </Button>
        ) : null}
      </div>
      <Field
        label={t(
          tab === "list" ? "suppliers.search" : "suppliers.search_compare",
          tab === "list" ? "Search suppliers" : "Search products or suppliers",
        )}
      >
        <input
          className={inputClass}
          type="search"
          value={tab === "list" ? q : priceQ}
          onChange={(e) =>
            tab === "list" ? setQ(e.target.value) : setPriceQ(e.target.value)
          }
        />
      </Field>
      {tab === "list" ? (
        <>
          <Notice error={directory.error ?? list.error ?? orders.error} />
          {directory.isLoading || list.isLoading ? <Spinner /> : null}
          <div className="supplier-ledger">
            {rows.saved.map((s) => {
              const receipt = receipts.find(
                (r) => r.name === s.identity.inventorySupplierName,
              );
              return (
                <article className="supplier-row" key={s.id}>
                  <Link
                    className="supplier-person"
                    href={"/shop/suppliers/records/" + encodeURIComponent(s.id)}
                  >
                    <span className="supplier-monogram" aria-hidden="true">
                      {s.identity.name.slice(0, 1)}
                    </span>
                    <div>
                      <h2>{s.identity.name}</h2>
                      <p>
                        {s.identity.gstin ||
                          t("gst.registration.unregistered", "Not registered")}
                      </p>
                      <small>{s.identity.address}</small>
                    </div>
                    <span aria-hidden="true">›</span>
                  </Link>
                  <div className="supplier-row-metrics">
                    <div>
                      <small>
                        {t("directoryUI.receipts", "Inventory receipts")}
                      </small>
                      <strong>
                        {!s.identity.inventorySupplierName || list.isSuccess
                          ? (receipt?.batches ?? 0)
                          : "—"}
                      </strong>
                    </div>
                    <div>
                      <small>{t("po.title", "Purchase orders")}</small>
                      <strong>
                        {orders.isSuccess ? (orders.data[s.id] ?? 0) : "—"}
                      </strong>
                    </div>
                    <div>
                      <small>{t("suppliers.total_spend", "Total spend")}</small>
                      <strong>
                        {receipt ? formatINR(receipt.spend) : "—"}
                      </strong>
                    </div>
                  </div>
                  {receipt ? (
                    <Link
                      className="supplier-history-link"
                      href={supplierHistoryUrl(receipt.name, s.id)}
                    >
                      {t("suppliers.stock_history", "Stock supplier history")}{" "}
                      <span>
                        {t("directoryUI.last_purchase", "Last purchase")} ·{" "}
                        {formatDay(receipt.lastAt)} ›
                      </span>
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
          <More query={directory} />
          {directory.hasNextPage ? (
            <p className="shop-hint">
              {t(
                "supplierweb.more",
                "Load more saved suppliers to complete the directory search.",
              )}
            </p>
          ) : null}
          {rows.history.length ? (
            <section>
              <h2 className="supplier-section-title">
                {t("suppliers.stock_history", "Stock supplier history")}
              </h2>
              <p className="shop-hint">
                {t(
                  "supplierweb.unlinked",
                  "Names recorded on stock receipts. Confirm billing details before recording an invoice.",
                )}
              </p>
              {rows.history.map((row) => (
                <article className="supplier-row" key={row.name}>
                  <Link
                    className="supplier-person"
                    href={supplierHistoryUrl(row.name)}
                  >
                    <span className="supplier-monogram" aria-hidden="true">
                      {row.name.slice(0, 1)}
                    </span>
                    <div>
                      <h2>{row.name}</h2>
                      <p>
                        {t("directoryUI.last_purchase", "Last purchase")} ·{" "}
                        {formatDay(row.lastAt)}
                      </p>
                    </div>
                    <span aria-hidden="true">›</span>
                  </Link>
                  <div className="supplier-row-metrics">
                    <div>
                      <small>{t("suppliers.stat_products", "Products")}</small>
                      <strong>{row.products}</strong>
                    </div>
                    <div>
                      <small>
                        {t("directoryUI.receipts", "Inventory receipts")}
                      </small>
                      <strong>{row.batches}</strong>
                    </div>
                    <div>
                      <small>{t("suppliers.total_spend", "Total spend")}</small>
                      <strong>{formatINR(row.spend)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : null}
          {directory.isSuccess &&
          list.isSuccess &&
          !rows.saved.length &&
          !rows.history.length ? (
            <div className="buy-empty">
              <h2>{t("empty.suppliers_title", "No suppliers yet")}</h2>
              <p>
                {t(
                  "suppliers.empty_subtitle",
                  "Name a supplier when you add a batch and they show up here.",
                )}
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <Notice error={compare.error} />
          {compare.isLoading ? <Spinner /> : null}
          {compare.isSuccess && !compared.length ? (
            <div className="buy-empty">
              <h2>
                {t("suppliers.compare_empty_title", "No prices to compare yet")}
              </h2>
              <p>
                {t(
                  "suppliers.compare_empty_subtitle",
                  "Buy the same product from different suppliers to compare prices.",
                )}
              </p>
            </div>
          ) : null}
          <div className="supplier-comparisons">
            {compared.map((row) => (
              <section key={row.productId} className="supplier-comparison">
                <Link
                  href={"/shop/products/" + encodeURIComponent(row.productId)}
                  className="supplier-product"
                >
                  <ProductImageById
                    productId={row.productId}
                    name={row.name}
                    size={44}
                  />
                  <h2>{row.name}</h2>
                  <span>›</span>
                </Link>
                <p className="shop-hint">
                  {t(
                    row.savingPct >= 5
                      ? "suppliers.save_pct"
                      : "suppliers.spread_pct",
                    row.savingPct >= 5
                      ? "Save {{pct}}%"
                      : "{{pct}}% price spread",
                    { pct: row.savingPct >= 5 ? row.savingPct : row.spreadPct },
                  )}
                </p>
                {row.suppliers.map((s) => (
                  <Link
                    className="supplier-price-row"
                    key={s.name}
                    href={supplierHistoryUrl(s.name)}
                  >
                    <div>
                      <strong>{s.name}</strong>
                      <small>
                        {formatDay(s.at)}
                        {s.name === row.lastUsed
                          ? " · " + t("suppliers.last_used", "Last used")
                          : ""}
                      </small>
                    </div>
                    <div>
                      <strong>
                        {formatINR(s.price)} /{" "}
                        {t("unit_picker." + row.unit, row.unit)}
                      </strong>
                      {s.price === row.suppliers[0]?.price ? (
                        <small className="supplier-saving">
                          {t("stockUI.lowest_price", "Lowest price")}
                        </small>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
