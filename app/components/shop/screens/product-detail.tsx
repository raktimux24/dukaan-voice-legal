"use client";
import { productPhotoActivity } from "../../../lib/shop/product-images/activity";
import { ProductGallery } from "../product-gallery";

import { ProductBarcodeCard } from "../product-barcode";
import { useGstText as useUiText } from "../gst-ui";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";
import { ProductImage } from "../product-image";
import { HomeNudge } from "../home-nudge";
import {
  ProductStockEditor,
  ProductBatchEditor,
} from "../product-stock-editor";
import {
  productReturn,
  productPairs,
  productExpiry,
} from "../../../lib/shop/products";
import { labeledL1, labeledL2 } from "../../../lib/shop/catalog";
import { useCart } from "../../../lib/shop/cart";
import { formatINR } from "../../../lib/shop/money";
import { useShopDates } from "../use-shop-dates";
import type { StockBatch } from "../../../lib/shop/types";
import { formatQty } from "../../../lib/shop/units";
import { useShop } from "../context";
import { ProductTaxHistory } from "../product-tax-history";
import {
  Button,
  Card,
  Notice,
  PageHeader,
  Pill,
  Spinner,
  isDenied,
} from "../ui";

function logMentionsProduct(
  payload: Record<string, unknown>,
  productId: string,
) {
  if (payload.productId === productId || payload.product_id === productId)
    return true;
  if (!Array.isArray(payload.items)) return false;
  return payload.items.some((item) => {
    if (typeof item === "string") return item === productId;
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    return row.productId === productId || row.product_id === productId;
  });
}

export function ProductDetailScreen({ productId }: { productId: string }) {
  const { shop, userId } = useShop();
  return (
    <ProductDetailWorkspace
      key={`${shop?.id}:${userId}:${productId}`}
      productId={productId}
    />
  );
}
function ProductDetailWorkspace({ productId }: { productId: string }) {
  const uiText = useUiText();
  const { formatDay, formatWhen } = useShopDates();
  const { api, shop, perms, hideCost, userId, offline, premium, setNotice, t } =
    useShop();
  const params = useSearchParams();
  const router = useRouter();
  const returnTo = productReturn(params.get("returnTo"));
  const mutationLock = useRef(false);
  const queryClient = useQueryClient();
  const cart = useCart(userId, shop?.id ?? null);
  const catalog = useQuery({
    queryKey: ["catalog", shop?.id, hideCost],
    enabled: !!shop?.id,
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
  });
  const [showAll, setShowAll] = useState(false);
  const item = catalog.data?.find((row) => row.productId === productId);
  const tracksStock = item?.product.trackStock !== false;
  // Keep next-sale costing independent of the history filter.
  const activeBatchQuery = useQuery({
    queryKey: ["batches", shop?.id, productId, false],
    enabled: !!shop?.id && tracksStock,
    queryFn: () => api.getBatches(shop!.id, productId, false),
  });
  const batches = useQuery({
    queryKey: ["batches", shop?.id, productId, showAll || !tracksStock],
    enabled: !!shop?.id,
    queryFn: () => api.getBatches(shop!.id, productId, showAll || !tracksStock),
  });
  const sales = useQuery({
    queryKey: ["product-sales", shop?.id, productId],
    enabled: !!shop?.id && perms.canSeeReports,
    queryFn: () => api.getProductSales(shop!.id, productId, 30),
  });
  const activity = useQuery({
    queryKey: ["audit", shop?.id, "product", productId],
    enabled: !!shop?.id,
    queryFn: () => api.getAudit(shop!.id, "all"),
  });
  const buyList = useQuery({
    queryKey: ["buy-list", shop?.id],
    enabled: !!shop?.id && perms.canEditProducts,
    queryFn: () => api.getBuyList(shop!.id),
  });
  const [panel, setPanel] = useState<"adjust" | "batch" | null>(
    params.get("batch") === "1" ? "batch" : null,
  );
  const nudges = useQuery({
    queryKey: ["nudges", shop?.id, "product"],
    enabled: !!shop && premium && !offline,
    queryFn: () => api.getNudges(shop!.id, "product"),
    retry: false,
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);

  if (!shop) return <Spinner />;
  if (catalog.isPending || (!item && catalog.isFetching))
    return <Spinner label={uiText("Loading product")} />;
  if (!item && catalog.isError)
    return (
      <Card>
        <Notice error={catalog.error} />
        <Button onClick={() => void catalog.refetch()}>
          {t("common.retry", "Retry")}
        </Button>
      </Card>
    );
  if (!item)
    return (
      <Card>
        <p>{uiText("That product was not found.")}</p>
      </Card>
    );

  const product = item.product;
  const onBuyList = (buyList.data ?? []).some(
    (row) => row.productId === productId && row.status === "pending",
  );
  const activeBatches = (activeBatchQuery.data ?? []).filter(
    (batch) => batch.status !== "depleted",
  );
  const nextOutId = tracksStock ? activeBatches[0]?.id : undefined;
  const nextCost =
    tracksStock && (activeBatchQuery.isPending || activeBatchQuery.isError)
      ? null
      : ((tracksStock
          ? activeBatches.find((batch) => batch.purchasePrice != null)
              ?.purchasePrice
          : null) ??
        product.purchasePrice ??
        null);
  const margin =
    product.sellingPrice != null && nextCost != null
      ? product.sellingPrice - nextCost
      : null;
  const costedBatches = tracksStock
    ? activeBatches.filter((batch) => batch.purchasePrice != null)
    : [];
  const costedQuantity = costedBatches.reduce(
    (sum, batch) => sum + batch.quantity,
    0,
  );
  const averageCost =
    costedQuantity > 0
      ? costedBatches.reduce(
          (sum, batch) => sum + batch.quantity * batch.purchasePrice!,
          0,
        ) / costedQuantity
      : null;
  const productLogs = (activity.data?.logs ?? [])
    .filter((log) => logMentionsProduct(log.payload, productId))
    .slice(0, 5);

  const refresh = async () => {
    for (const key of ["audit", "product-sales", "nudges", "history"])
      await queryClient.invalidateQueries({ queryKey: [key, shop.id] });
    await queryClient.invalidateQueries({ queryKey: ["catalog", shop.id] });
    await queryClient.invalidateQueries({
      queryKey: ["batches", shop.id, productId],
    });
    await queryClient.invalidateQueries({ queryKey: ["stats", shop.id] });
    await queryClient.invalidateQueries({ queryKey: ["buy-list", shop.id] });
  };

  const run = async (work: () => Promise<void>) => {
    if (offline || mutationLock.current) return;
    mutationLock.current = true;
    setPending(true);
    setError(null);
    try {
      api.assertSession();
      await work();
      api.assertSession();
      await refresh();
    } catch (caught) {
      setError(caught);
    } finally {
      mutationLock.current = false;
      setPending(false);
    }
  };

  const sell = (quantity = 1) => {
    if (!perms.canSell || product.isActive === false) return;
    if (product.sellingPrice == null) {
      setNotice(
        t(
          perms.canEditProducts
            ? "modal.product_detail.set_price_first"
            : "productsweb.ask_price",
          perms.canEditProducts
            ? "Set a selling price before selling this."
            : "Ask a manager to set the price.",
        ),
      );
      if (perms.canEditProducts)
        router.push(`/shop/products/${productId}/edit`);
      return;
    }
    const result = cart.addProduct(item, quantity);
    if (!result.ok) {
      setNotice(
        result.message === "unpriced"
          ? t(
              "modal.product_detail.set_price_first",
              "Set a selling price first.",
            )
          : result.message === "out_of_stock"
            ? t("pos.out_of_stock_toast", "{{name}} is out of stock", {
                name: product.name,
              })
            : t("productsweb.add_failed", "Could not add this to the bill."),
      );
      return;
    }
    router.push("/shop/sell");
  };

  return (
    <div className="shop-page product-workspace">
      <PageHeader
        back={{ href: returnTo, label: t("products.title", "Products") }}
        kicker={labeledL1(product.category, (key) => t(key, key))}
        title={product.name}
        description={
          [
            product.barcode || null,
            labeledL2(product.category, product.subcategory, (key) =>
              t(key, key),
            ) || null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        actions={
          <>
            <Button
              tone="ghost"
              disabled={catalog.isFetching}
              onClick={() => void refresh()}
            >
              {t("common.refresh", "Refresh")}
            </Button>
            {perms.canEditProducts ? (
              <Button href={`/shop/products/${productId}/edit`} tone="ghost">
                {t("common.edit", "Edit details")}
              </Button>
            ) : null}
            {perms.canSell ? (
              <Button
                disabled={product.isActive === false}
                onClick={() => sell()}
              >
                {t("pos.add_to_cart", "Add to bill")} ＋
              </Button>
            ) : null}
          </>
        }
      />
      <Notice
        error={
          error ??
          (batches.error && !isDenied(batches.error) ? batches.error : null)
        }
      />

      <section className="product-summary">
        <div className="product-summary-photo">
          <ProductGallery
            productId={productId}
            name={product.name}
            media={product.media}
          />
          {!product.media?.cover ? (
            <ProductImage name={product.name} size={120} />
          ) : null}
        </div>
        <div className="product-summary-content">
          <div className="product-status-line">
            <Pill
              tone={
                !tracksStock
                  ? "neutral"
                  : item.stockStatus === "OUT"
                    ? "danger"
                    : item.stockStatus === "LOW"
                      ? "warn"
                      : "ok"
              }
            >
              {!tracksStock
                ? t("pos.no_stock_tracking", "Not stock-tracked")
                : item.stockStatus === "OUT"
                  ? t("home.stat_out_of_stock", "Out of stock")
                  : item.stockStatus === "LOW"
                    ? t("home.stat_low_stock", "Low stock")
                    : t("productsweb.in_stock", "In stock")}
            </Pill>
            {product.shortCode ? <span>{product.shortCode}</span> : null}
            {product.isActive === false ? (
              <Pill>{t("productsweb.archived", "Archived")}</Pill>
            ) : null}
          </div>
          <div className="product-summary-metrics">
            <div>
              <small>{t("reports.stock.on_hand", "On hand")}</small>
              <strong>
                {tracksStock
                  ? formatQty(item.quantity, item.unit, {
                      packSize: product.packSize,
                      packLabel: product.packLabel,
                    })
                  : "—"}
              </strong>
              {tracksStock && (item.reservedQuantity ?? 0) > 0 ? (
                <small>
                  {t("productsweb.reserved", "{{quantity}} reserved", {
                    quantity: formatQty(item.reservedQuantity!, item.unit),
                  })}
                </small>
              ) : null}
            </div>
            <div>
              <small>
                {t(
                  "modal.product_detail.detail_selling_price",
                  "Selling price",
                )}
              </small>
              <strong className={product.sellingPrice == null ? undefined : "product-summary-price"}>
                {product.sellingPrice == null
                  ? t("home.unpriced", "Unpriced")
                  : formatINR(product.sellingPrice)}
              </strong>
              <small>/ {item.unit}</small>
            </div>
            {tracksStock ? (
              <div>
                <small>
                  {t(
                    "modal.product_detail.detail_min_stock",
                    "Low-stock alert",
                  )}
                </small>
                <strong>{formatQty(product.minStockLevel, item.unit)}</strong>
                {item.nearestExpiryDate ? (
                  <small>
                    {t("productsweb.expires", "Expires {{date}}", {
                      date: formatDay(item.nearestExpiryDate),
                    })}
                  </small>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="shop-actions">
            {tracksStock && perms.canEditProducts ? (
              <Button
                tone="ghost"
                disabled={offline}
                onClick={() => setPanel(panel === "batch" ? null : "batch")}
              >
                {t("modal.product_detail.add_batch", "Receive stock")}
              </Button>
            ) : null}
            {tracksStock && perms.canAdjustStock ? (
              <Button
                tone="quiet"
                disabled={offline}
                onClick={() => setPanel(panel === "adjust" ? null : "adjust")}
              >
                {t("adjust.title", "Adjust stock")}
              </Button>
            ) : null}
            {tracksStock && perms.canEditProducts ? (
              <Button
                tone="quiet"
                disabled={pending || offline || onBuyList || !buyList.data}
                onClick={() =>
                  void run(async () => {
                    await api.addBuyListItem(shop.id, {
                      itemName: product.name,
                      quantity:
                        product.minStockLevel > 0 ? product.minStockLevel : 1,
                      unit: item.unit,
                      category: product.category,
                      productId,
                    });
                    setNotice(
                      t(
                        "modal.product_detail.toast_added_buy_list",
                        "{{name}} added to Buy List",
                        { name: product.name },
                      ),
                    );
                  })
                }
              >
                {onBuyList
                  ? t(
                      "modal.product_detail.already_in_buy_list",
                      "Already on buy list",
                    )
                  : t(
                      "modal.product_detail.add_to_buy_list",
                      "Add to buy list",
                    )}
              </Button>
            ) : null}
          </div>
        </div>
      </section>
      {panel &&
      tracksStock &&
      (panel === "batch" ? perms.canEditProducts : perms.canAdjustStock) ? (
        <div className="product-open-panel">
          <Button tone="quiet" onClick={() => setPanel(null)}>
            {t("common.close", "Close")} ×
          </Button>
          <ProductStockEditor
            key={panel}
            item={item}
            mode={panel}
            initialQuantity={params.get("qty") ?? undefined}
            buyListItemId={params.get("buyListItemId")}
            onSell={sell}
            onDone={async () => {
              await refresh();
              setPanel(null);
              if (params.get("buyListItemId")) router.push("/shop/buy-list");
            }}
          />
        </div>
      ) : null}
      {tracksStock || (batches.data?.length ?? 0) > 0 ? (
        <Card flush className="product-batches">
          <div className="card-intro product-batch-head">
            <h2 className="shop-section-title">
              {t("modal.product_detail.section_batches", "Batches")}
            </h2>
            {tracksStock ? (
              <div
                className="shop-seg"
                role="group"
                aria-label={uiText("Batch list")}
              >
                <button
                  type="button"
                  className={!showAll ? "is-active" : undefined}
                  onClick={() => setShowAll(false)}
                >
                  {uiText("Active")}
                </button>
                <button
                  type="button"
                  className={showAll ? "is-active" : undefined}
                  onClick={() => setShowAll(true)}
                >
                  {uiText("All")}
                </button>
              </div>
            ) : null}
          </div>
          {tracksStock ? (
            <p className="product-batch-note">
              {t(
                product.depletionOrder === "fifo"
                  ? "modal.product_detail.depletion_hint_fifo"
                  : "modal.product_detail.depletion_hint_expiry",
                product.depletionOrder === "fifo"
                  ? "Sold oldest first."
                  : "Sold soonest-expiry first.",
              )}
            </p>
          ) : null}
          {batches.isLoading ? (
            <p className="shop-list-empty">{uiText("Loading batches")}</p>
          ) : null}
          {!batches.isLoading && (batches.data?.length ?? 0) === 0 ? (
            <p className="shop-list-empty">
              {t(
                showAll
                  ? "modal.product_detail.no_batches"
                  : "modal.product_detail.no_active_batches",
                showAll
                  ? "No batches yet."
                  : "No active batches. Add one to receive stock.",
              )}
            </p>
          ) : null}
          <div className="batch-list">
            {(batches.data ?? []).map((batch) => (
              <BatchRow
                key={batch.id}
                batch={batch}
                unit={item.unit}
                nextOut={batch.id === nextOutId}
                hideCost={hideCost}
                canEdit={tracksStock && perms.canEditProducts && !offline}
                editing={editing === batch.id}
                pending={pending}
                onEdit={() =>
                  setEditing((current) =>
                    current === batch.id ? null : batch.id,
                  )
                }
                onSave={(body) =>
                  run(() =>
                    api
                      .updateBatch(shop.id, batch.id, body)
                      .then(() => setEditing(null)),
                  )
                }
              />
            ))}
          </div>
        </Card>
      ) : null}

      {perms.canSeeReports &&
      sales.data &&
      (sales.data.units > 0 || sales.data.bills > 0) ? (
        <div className="kpi-grid">
          <div className="kpi">
            <p className="kpi-label">
              {t(
                "modal.product_detail.section_sales",
                "Sales · {{days}} days",
                { days: sales.data.days },
              )}
            </p>
            <p className="kpi-value">
              {formatQty(sales.data.units, item.unit)}
            </p>
          </div>
          <div className="kpi">
            <p className="kpi-label">{uiText("Revenue")}</p>
            <p className="kpi-value">{formatINR(sales.data.revenue)}</p>
          </div>
          {tracksStock ? (
            <div className="kpi">
              <p className="kpi-label">{t('modal.product_detail.sales_cover','Days of stock left')}</p>
              <p className="kpi-value">
                {sales.data.daysOfCover == null || sales.data.bills < 3
                  ? "—"
                  : `≈ ${sales.data.daysOfCover}`}
              </p>
            </div>
          ) : null}
          <div className="kpi">
            <p className="kpi-label">{uiText("Last sold")}</p>
            <p className="kpi-value is-compact">
              {formatWhen(sales.data.lastSoldAt)}
            </p>
          </div>
        </div>
      ) : null}

      {tracksStock && sales.data ? (
        <p className="shop-hint">
          {t(
            sales.data.bills < 3
              ? "mobile.audit.cover_sparse"
              : "mobile.audit.cover_help",
            sales.data.bills < 3
              ? "More sales are needed to estimate stock cover."
              : "Stock cover is an estimate based on recent sales.",
          )}
        </p>
      ) : null}
      {premium && !hideCost
        ? (nudges.data?.nudges ?? [])
            .filter(
              (n) =>
                n.status === "open" &&
                n.productId === productId &&
                [
                  "margin",
                  "supplier_price",
                  "reorder",
                  "expiry_markdown",
                ].includes(n.kind) &&
                (tracksStock || n.kind === "margin"),
            )
            .map((n) => <HomeNudge key={n.id} nudge={n} surface="product" />)
        : null}
      {productPairs(nudges.data?.nudges ?? [], productId, catalog.data ?? [])
        .length ? (
        <section className="product-pairs">
          <h2>{t("modal.product_detail.bought_with", "Often bought with")}</h2>
          <div>
            {productPairs(
              nudges.data?.nudges ?? [],
              productId,
              catalog.data ?? [],
            ).map((n) => {
              const pair = catalog.data!.find(
                (i) => i.productId === n.productId,
              )!;
              return (
                <Link
                  key={n.id}
                  href={`/shop/products/${pair.productId}?${new URLSearchParams({ returnTo })}`}
                >
                  <ProductImage
                    image={pair.product.media?.cover}
                    name={pair.product.name}
                  />
                  <span>
                    <strong>{pair.product.name}</strong>
                    <small>
                      {t(
                        "modal.product_detail.bought_with_n",
                        "{{n}} of {{total}} bills together",
                        {
                          n: n.evidence?.together ?? 0,
                          total: n.evidence?.anchorBills ?? 0,
                        },
                      )}
                    </small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
      <details className="product-disclosure">
        <summary>
          {t("barcodes.title", "Product barcodes")}
          <span aria-hidden="true">＋</span>
        </summary>
        <ProductBarcodeCard productId={productId} />
      </details>
      <details className="product-disclosure">
        <summary>
          {t("productsweb.tax_history", "GST settings & history")}
          <span aria-hidden="true">＋</span>
        </summary>
        <ProductTaxHistory productId={productId} />
      </details>

      <Card>
        <div className="product-batch-head">
          <h2 className="shop-section-title">
            {t("modal.product_detail.section_details", "Details")}
          </h2>
          {perms.canEditProducts ? (
            <Button
              href={`/shop/products/${productId}/edit`}
              tone="quiet"
              size="sm"
            >
              {t("common.edit", "Edit")}
            </Button>
          ) : null}
        </div>
        <dl className="detail-list">
          {!hideCost ? (
            <div>
              <dt>{t("modal.product_detail.detail_last_paid", "Last paid")}</dt>
              <dd>
                {product.purchasePrice == null
                  ? "—"
                  : formatINR(product.purchasePrice)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>
              {t("modal.product_detail.detail_selling_price", "Selling price")}
            </dt>
            <dd>
              {product.sellingPrice == null
                ? "—"
                : formatINR(product.sellingPrice)}
            </dd>
          </div>
          <div>
            <dt>{t("modal.product_detail.detail_mrp", "MRP")}</dt>
            <dd>{product.mrp == null ? "—" : formatINR(product.mrp)}</dd>
          </div>
          {!hideCost ? (
            <div>
              <dt>
                {t("modal.product_detail.detail_margin", "Margin on next sale")}
              </dt>
              <dd>
                {margin == null ||
                product.sellingPrice == null ||
                product.sellingPrice <= 0
                  ? "—"
                  : `${formatINR(margin)} · ${Math.round((margin / product.sellingPrice) * 100)}%${averageCost != null && nextCost != null && Math.abs(averageCost - nextCost) > 0.5 ? " · " + t("modal.product_detail.avg_cost", "avg cost {{amount}}", { amount: formatINR(averageCost) }) : ""}`}
              </dd>
            </div>
          ) : null}
          {product.shortCode ? (
            <div>
              <dt>
                {t("modal.product_detail.detail_short_code", "Short code")}
              </dt>
              <dd>{product.shortCode}</dd>
            </div>
          ) : null}
          {tracksStock ? (
            <div>
              <dt>
                {t("modal.product_detail.detail_min_stock", "Low-stock alert")}
              </dt>
              <dd>
                {product.minStockLevel > 0
                  ? formatQty(product.minStockLevel, item.unit)
                  : "—"}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>{t("modal.product_detail.detail_unit", "Unit")}</dt>
            <dd>{item.unit}</dd>
          </div>
          <div>
            <dt>{t("modal.add_product.category_label", "Category")}</dt>
            <dd>
              {[
                labeledL1(product.category, (key) => t(key, key)),
                labeledL2(product.category, product.subcategory, (key) =>
                  t(key, key),
                ),
              ]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </div>
          <div>
            <dt>{t("modal.product_detail.detail_last_updated", "Updated")}</dt>
            <dd>
              {formatWhen(item.updatedAt)} · {item.updatedByName}
            </dd>
          </div>
        </dl>
        {!hideCost ? (
          <p className="shop-hint">
            {t(
              "gst.margin_estimate",
              "Margin estimates use recorded purchase cost. Saved input-tax reviews can change acquisition costs.",
            )}
          </p>
        ) : null}
      </Card>

      {productLogs.length > 0 ? (
        <Card>
          <h2 className="shop-section-title">
            {t("modal.product_detail.section_activity", "Activity")}
          </h2>
          <div className="detail-list">
            {productLogs.map((log) => (
              <div key={log.id}>
                <dt>
                  {log.actionType === "product_images_updated"
                    ? productPhotoActivity(log.payload, (key, vars) =>
                        t(key, key, vars),
                      )
                    : log.actionType === "product_bulk_edit"
                      ? t(
                          "bulk.activity",
                          "Bulk edited {{name}} · batch {{batch}}",
                          {
                            name: String(log.payload?.productName ?? ""),
                            batch: Number(log.payload?.batch ?? 1),
                          },
                        )
                      : ["barcode_generated", "barcode_replaced"].includes(
                            log.actionType,
                          )
                        ? t(
                            log.actionType === "barcode_generated"
                              ? "barcodes.activity_generated"
                              : "barcodes.activity_replaced",
                            log.description ?? "",
                            {
                              name: String(
                                log.payload?.productName ?? product.name,
                              ),
                            },
                          )
                        : log.description}
                </dt>
                <dd>
                  {log.userName} · {formatWhen(log.createdAt)}
                </dd>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {perms.canEditProducts ? (
        <details className="product-disclosure">
          <summary>
            {t("productsweb.manage", "Manage product")}
            <span aria-hidden="true">＋</span>
          </summary>
          <div className="shop-actions">
            <Button
              href={"/shop/online-store?productId=" + productId}
              tone="ghost"
            >
              {t("commerce.title", "Online store & orders")}
            </Button>
            <Button
              tone="danger"
              disabled={pending || offline}
              onClick={() => {
                if (
                  !window.confirm(
                    t(
                      "modal.product_detail.delete_or_archive_message",
                      "Remove {{name}} from active products? Products with tax, purchase or bill history are archived and their records are kept.",
                      { name: product.name },
                    ),
                  )
                )
                  return;
                void run(async () => {
                  await api.deleteProduct(shop.id, productId);
                  cart.dropProduct(productId);
                  router.push(returnTo);
                });
              }}
            >
              {" "}
              {uiText("Archive")}{" "}
            </Button>
          </div>
        </details>
      ) : null}
    </div>
  );
}

function BatchRow({
  batch,
  unit,
  nextOut,
  hideCost,
  canEdit,
  editing,
  pending,
  onEdit,
  onSave,
}: {
  batch: StockBatch;
  unit: string;
  nextOut: boolean;
  hideCost: boolean;
  canEdit: boolean;
  editing: boolean;
  pending: boolean;
  onEdit: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const uiText = useUiText();
  const { formatDay, formatWhen } = useShopDates();
  const { t } = useShop();
  const depleted = batch.status === "depleted";
  return (
    <article
      className={
        depleted
          ? "batch-row is-depleted"
          : nextOut
            ? "batch-row is-next"
            : "batch-row"
      }
    >
      <div className="batch-row-main">
        <p className="shop-list-title">
          {formatQty(batch.quantity, unit)}
          {batch.initialQuantity != null &&
          batch.initialQuantity > batch.quantity
            ? " · " +
              t("productsweb.initial", "Received {{quantity}}", {
                quantity: formatQty(batch.initialQuantity, unit),
              })
            : ""}
        </p>
        {batch.batchNumber ? (
          <p className="shop-list-meta">#{batch.batchNumber}</p>
        ) : null}
        <p className="shop-list-meta">
          {[
            batch.supplier,
            batch.purchaseDate
              ? t("modal.product_detail.batch_purchased", "Bought {{date}}", {
                  date: formatDay(batch.purchaseDate),
                })
              : null,
            batch.expiryDate
              ? t("modal.product_detail.batch_expires", "Expires {{date}}", {
                  date: formatDay(batch.expiryDate),
                })
              : null,
          ]
            .filter(Boolean)
            .join(" · ") ||
            t("productsweb.no_batch_details", "No supplier or expiry recorded")}
        </p>
        {!hideCost && batch.purchasePrice != null ? (
          <p className="shop-list-meta">
            {formatINR(batch.purchasePrice)} / {unit}
          </p>
        ) : null}
      </div>
      {batch.createdAt ? (
        <p className="product-batch-provenance shop-hint">
          {t("modal.product_detail.batch_added", "Added {{time}}", {
            time: formatWhen(batch.createdAt),
          })}
          {batch.createdByName
            ? " · " +
              t("modal.product_detail.batch_by", "by {{name}}", {
                name: batch.createdByName,
              })
            : ""}
        </p>
      ) : null}
      <div className="batch-row-side">
        {productExpiry(batch.expiryDate ?? undefined)?.expired ? (
          <Pill tone="danger">{t("productsweb.expired", "Expired")}</Pill>
        ) : null}
        {nextOut ? <Pill tone="saffron">{uiText("Next out")}</Pill> : null}
        {depleted ? <Pill>{uiText("Depleted")}</Pill> : null}
        {canEdit ? (
          <Button size="sm" tone="quiet" onClick={onEdit}>
            {t(
              editing ? "common.close" : "common.edit",
              editing ? "Close" : "Edit",
            )}
          </Button>
        ) : null}
      </div>
      {canEdit && editing ? (
        <div className="batch-edit">
          <ProductBatchEditor
            key={batch.id + batch.expiryDate}
            batch={batch}
            disabled={pending}
            onSave={onSave}
          />
        </div>
      ) : null}
    </article>
  );
}
