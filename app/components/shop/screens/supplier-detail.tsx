"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductImageById } from "../product-image";
import { SupplierEditor } from "../gst-supplier";
import { useShop } from "../context";
import { Button, NoAccess, Notice, PageHeader, Spinner } from "../ui";
import { formatINR } from "../../../lib/shop/money";
import { formatQty } from "../../../lib/shop/units";
import { useShopDates } from "../use-shop-dates";
import {
  cheaperSupplierCount,
  supplierHistoryUrl,
} from "../../../lib/shop/suppliers";
export function SupplierDetailScreen({ name }: { name: string }) {
  const { shop, userId } = useShop();
  return <History key={`${shop?.id}:${userId}:${name}`} name={name} />;
}
function History({ name }: { name: string }) {
  const { api, shop, userId, perms, offline, t } = useShop(),
    { formatDay } = useShopDates(),
    params = useSearchParams(),
    router = useRouter();
  const [tab, setTab] = useState("items"),
    [review, setReview] = useState(false);
  // Next route params are already decoded. Literal '%' in a supplier name is valid.
  const detail = useQuery({
    queryKey: ["supplier", shop?.id, userId, name],
    enabled: !!shop && perms.canSeeCost && !!name.trim(),
    queryFn: () => api.getSupplier(shop!.id, name),
  });
  const supplierId = params.get("supplierId");
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
  const data = detail.data,
    count = cheaperSupplierCount(data?.items ?? []);
  return (
    <div className="shop-page supplier-workspace">
      <PageHeader
        back={{
          href: "/shop/suppliers",
          label: t("suppliers.title", "Suppliers"),
        }}
        kicker={t("directoryUI.receipts", "Inventory receipts")}
        title={data?.name || name}
        actions={
          <Button tone="ghost" onClick={() => void detail.refetch()}>
            {t("common.refresh", "Refresh")}
          </Button>
        }
      />
      <Notice error={detail.error} />
      {detail.isLoading ? <Spinner /> : null}
      {data ? (
        <>
          <div className="supplier-summary">
            <div className="supplier-total">
              <small>{t("suppliers.total_spend", "Total spend")}</small>
              <strong>{formatINR(data.summary.spend)}</strong>
              <p>
                {t("supplierweb.recorded", "Based on recorded stock receipts.")}
              </p>
            </div>
            <dl>
              <div>
                <dt>{t("suppliers.stat_products", "Products")}</dt>
                <dd>{data.summary.products}</dd>
              </div>
              <div>
                <dt>{t("directoryUI.receipts", "Inventory receipts")}</dt>
                <dd>{data.summary.batches}</dd>
              </div>
              <div>
                <dt>{t("directoryUI.first_purchase", "First purchase")}</dt>
                <dd>{formatDay(data.summary.firstAt)}</dd>
              </div>
              <div>
                <dt>{t("directoryUI.last_purchase", "Last purchase")}</dt>
                <dd>{formatDay(data.summary.lastAt)}</dd>
              </div>
            </dl>
          </div>
          {count > 0 ? (
            <p className="supplier-saving">
              {t(
                "suppliers.cheaper_elsewhere",
                "{{n}} products have lower recorded prices elsewhere",
                { n: count },
              )}
            </p>
          ) : null}
          <div className="shop-actions">
            {supplierId ? (
              <Button
                href={
                  "/shop/purchases/new?supplierId=" +
                  encodeURIComponent(supplierId)
                }
              >
                {t(
                  "gst.ui.record_invoice_from_this_supplier_4e0675",
                  "Record invoice from this supplier",
                )}
              </Button>
            ) : (
              <Button disabled={offline || review} onClick={() => setReview(true)}>
                {t(
                  "gst.ui.confirm_supplier_details_a42e11",
                  "Confirm supplier details",
                )}
              </Button>
            )}
            {supplierId ? (
              <Button
                tone="ghost"
                href={
                  "/shop/suppliers/records/" + encodeURIComponent(supplierId)
                }
              >
                {t("directoryUI.business_details", "Business details")} ›
              </Button>
            ) : null}
          </div>
          {review ? (
            <SupplierEditor
              legacyName={name}
              onCancel={()=>setReview(false)}
              onSaved={(s) =>
                router.push(
                  "/shop/suppliers/records/" + encodeURIComponent(s.id),
                )
              }
            />
          ) : null}
          <div className="buy-tabs">
            {["items", "batches"].map((k) => (
              <button
                key={k}
                aria-pressed={tab === k}
                onClick={() => setTab(k)}
              >
                {t(
                  "suppliers.detail_tab." + k,
                  k === "items" ? "Products" : "Batches",
                )}
              </button>
            ))}
          </div>
          {tab === "items" ? (
            <div className="supplier-items">
              {!data.items.length ? (
                <p>{t("suppliers.no_items", "No products yet")}</p>
              ) : null}
              {data.items.map((it) => (
                <article className="supplier-item" key={it.productId}>
                  <Link
                    className="supplier-product"
                    href={"/shop/products/" + encodeURIComponent(it.productId)}
                  >
                    <ProductImageById
                      productId={it.productId}
                      name={it.name}
                      size={44}
                    />
                    <div>
                      <h2>
                        {it.name}
                        {it.isActive === false
                          ? " · " + t("suppliers.archived", "Archived")
                          : ""}
                      </h2>
                      <p>
                        {t(
                          "suppliers.item_meta",
                          "{{qty}} · {{batches}} batches · {{last}}",
                          {
                            qty: formatQty(it.quantity, it.unit, {
                              packSize: it.packSize,
                              packLabel: it.packLabel,
                            }),
                            batches: it.batches,
                            last: formatDay(it.lastAt),
                          },
                        )}
                      </p>
                    </div>
                    <div className="supplier-item-price">
                      <strong>
                        {it.lastPrice == null
                          ? "—"
                          : formatINR(it.lastPrice) +
                            " / " +
                            t("unit_picker." + it.unit, it.unit)}
                      </strong>
                      {it.minPrice != null &&
                      it.maxPrice != null &&
                      it.minPrice !== it.maxPrice ? (
                        <small>
                          {formatINR(it.minPrice)}–{formatINR(it.maxPrice)}
                        </small>
                      ) : null}
                    </div>
                  </Link>
                  <p className="shop-hint">
                    {t("suppliers.item_spend", "Spent {{amount}}", {
                      amount: formatINR(it.spend),
                    })}
                    {it.sellingPrice != null &&
                    it.sellingPrice > 0 &&
                    it.lastPrice != null
                      ? " · " +
                        t("suppliers.item_margin", "{{pct}}% margin", {
                          pct: Math.round(
                            ((it.sellingPrice - it.lastPrice) /
                              it.sellingPrice) *
                              100,
                          ),
                        })
                      : ""}
                  </p>
                  {it.alt ? (
                    <Link
                      className="supplier-alternative"
                      href={supplierHistoryUrl(it.alt.supplier)}
                    >
                      {t(
                        it.lastPrice != null && it.alt.price < it.lastPrice
                          ? "suppliers.alt_cheaper"
                          : "suppliers.alt_other",
                        "{{supplier}} · {{price}}/{{unit}}",
                        {
                          supplier: it.alt.supplier,
                          price: formatINR(it.alt.price),
                          unit: it.unit,
                        },
                      )}{" "}
                      ›
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div>
              {!data.batches.length ? (
                <p>{t("suppliers.no_items", "No products yet")}</p>
              ) : null}
              {data.batches.map((b) => (
                <Link
                  className="supplier-batch"
                  href={"/shop/products/" + encodeURIComponent(b.productId)}
                  key={b.id}
                >
                  <ProductImageById
                    productId={b.productId}
                    name={b.name}
                    size={40}
                  />
                  <div>
                    <h2>{b.name}</h2>
                    <p>
                      {formatDay(b.at)} · {formatQty(b.quantity, b.unit)}
                    </p>
                    <p>
                      {t("suppliers.batch_left", "{{qty}} left", {
                        qty: formatQty(b.remaining, b.unit),
                      })}
                      {b.expiryDate
                        ? " · " +
                          t("suppliers.batch_exp", "Expires {{date}}", {
                            date: formatDay(b.expiryDate),
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="supplier-item-price">
                    <strong>
                      {b.price == null
                        ? "—"
                        : formatINR(b.price) +
                          " / " +
                          t("unit_picker." + b.unit, b.unit)}
                    </strong>
                    <small>
                      {b.price == null ? "" : formatINR(b.price * b.quantity)}
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
