"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../context";
import { Button, Card, EmptyState, Field, Notice, PageHeader, Pill, Skeleton, Spinner } from "../ui";
import { ProductImage } from "../product-image";
import { labeledL1 } from "../../../lib/shop/catalog";
import { formatINR } from "../../../lib/shop/money";
import { formatQty } from "../../../lib/shop/units";
import { inventoryCsv, downloadText } from "../../../lib/shop/csv";
import {
  PRODUCT_FILTERS,
  PRODUCT_SORTS,
  productFilters,
  productListUrl,
  filterProducts,
  matchesProduct,
  productExpiry,
  type ProductFilters,
} from "../../../lib/shop/products";
import { useProductBulk } from "../../../lib/shop/product-bulk/workflow";
import { bulkErrorKey } from "../../../lib/shop/product-bulk/client";
import { useShopDates } from "../use-shop-dates";
export function ProductsScreen() {
  const { shop, userId } = useShop();
  return <ProductsWorkspace key={`${shop?.id}:${userId}`} />;
}
function ProductsWorkspace() {
  const { api, shop, userId, perms, offline, hideCost, prefs, setNotice, t } = useShop(),
    params = useSearchParams(),
    router = useRouter(),
    { formatDay } = useShopDates();
  const [filters, setFilters] = useState(() =>
      productFilters(new URLSearchParams(params.toString())),
    ),
    [selecting, setSelecting] = useState(false),
    [selected, setSelected] = useState<string[]>([]);
  const anchor = useRef<string | null>(null),
    routed = useRef(""),
    restored = useRef(false),
    storageReady = useRef(false);
  const scope = `${shop?.id}:${userId}`,
    returnTo = productListUrl(filters),
    selectionKey = "bulk-selection:" + scope;
  const catalog = useQuery({
    queryKey: ["catalog", shop?.id, hideCost],
    enabled: !!shop,
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
  });
  const bulk = useProductBulk(
    api.productBulk,
    { shopId: shop?.id ?? "", actorId: userId ?? "" },
    perms.canEditProducts,
    () => crypto.randomUUID(),
  );
  const blocked = bulk.busy || !!bulk.pending || offline;
  const rows = useMemo(
    () => filterProducts(catalog.data ?? [], filters),
    [catalog.data, filters],
  );
  const queryClient = useQueryClient();
  const shortfallView =
    filters.filter === "low_stock" || filters.filter === "out_of_stock";
  const buyList = useQuery({
    queryKey: ["buy-list", shop?.id],
    enabled: !!shop && perms.canEditProducts && shortfallView,
    queryFn: () => api.getBuyList(shop!.id),
  });
  // Like the mobile alerts screen: add every shown low/out-of-stock product
  // that is not already pending on the buy list, at its reorder level.
  const shortfall = shortfallView
    ? rows.filter(
        (i) =>
          i.product.trackStock !== false &&
          !(buyList.data ?? []).some(
            (row) => row.productId === i.productId && row.status === "pending",
          ),
      )
    : [];
  const [addingAll, setAddingAll] = useState(false),
    [addAllError, setAddAllError] = useState<string | null>(null);
  const addAllToBuyList = async () => {
    if (!shop || addingAll) return;
    setAddingAll(true);
    setAddAllError(null);
    let added = 0,
      failed = 0;
    for (const i of shortfall) {
      try {
        await api.addBuyListItem(shop.id, {
          itemName: i.product.name,
          quantity: i.product.minStockLevel > 0 ? i.product.minStockLevel : 1,
          unit: i.unit,
          category: i.product.category,
          productId: i.productId,
        });
        added++;
      } catch {
        failed++;
      }
    }
    await queryClient.invalidateQueries({ queryKey: ["buy-list", shop.id] });
    if (added)
      setNotice(
        t("modal.alerts.dialog_added_message", "{{n}} item(s) added to Buy List", { n: added }),
      );
    if (failed)
      setAddAllError(
        t("modal.alerts.toast_buy_list_fail", "Failed to add to buy list"),
      );
    setAddingAll(false);
  };
  const active = (catalog.data ?? []).filter(
    (i) => i.product.isActive !== false,
  );
  const categories = [...new Set(active.map((i) => i.product.category))].sort();
  const filterLabel = (id: string) =>
    t(
      "home.filter_" + id,
      {
        all: "All",
        low_stock: "Low stock",
        out_of_stock: "Out of stock",
        near_expiry: "Near expiry",
        unpriced: "Unpriced",
      }[id] ?? id,
    );
  useEffect(() => {
    try {
      const ids = JSON.parse(sessionStorage.getItem(selectionKey) ?? "[]");
      if (Array.isArray(ids)) {
        setSelected(ids.filter((x) => typeof x === "string"));
        setSelecting(ids.length > 0 && perms.canEditProducts);
      }
    } catch {}
    storageReady.current = true;
  }, [selectionKey, perms.canEditProducts]);
  useEffect(() => {
    if (storageReady.current)
      try {
        sessionStorage.setItem(selectionKey, JSON.stringify(selected));
      } catch {}
  }, [selected, selectionKey]);
  useEffect(() => {
    if (!catalog.data || restored.current) return;
    restored.current = true;
    try {
      const y = Number(
        sessionStorage.getItem("product-scroll:" + scope + ":" + returnTo),
      );
      if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
    } catch {}
  }, [catalog.data, scope, returnTo]);
  useEffect(() => {
    const next = productFilters(new URLSearchParams(params.toString()));
    setFilters((old) =>
      JSON.stringify(old) === JSON.stringify(next) ? old : next,
    );
  }, [params]);
  const change = (patch: Partial<ProductFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    router.replace(productListUrl(next), { scroll: false });
  };
  useEffect(() => {
    if (bulk.job && routed.current !== bulk.job.id) {
      routed.current = bulk.job.id;
      router.push(
        "/shop/products/bulk?" +
          new URLSearchParams({ jobId: bulk.job.id, returnTo }),
      );
    }
  }, [bulk.job?.id, returnTo, router]);
  const selectRow = (id: string, shift = false) => {
    if (blocked) return;
    const a = rows.findIndex((i) => i.productId === anchor.current),
      b = rows.findIndex((i) => i.productId === id),
      ids =
        shift && a >= 0
          ? rows
              .slice(Math.min(a, b), Math.max(a, b) + 1)
              .map((i) => i.productId)
          : [id];
    setSelected((old) =>
      old.includes(id)
        ? old.filter((x) => !ids.includes(x))
        : [...new Set([...old, ...ids])],
    );
    anchor.current = id;
  };
  const remember = () => {
    try {
      sessionStorage.setItem(
        "product-scroll:" + scope + ":" + returnTo,
        String(window.scrollY),
      );
    } catch {}
  };
  if (!shop) return <Spinner />;
  return (
    <div className="shop-page products-workspace">
      <PageHeader
        title={t("products.title", "Products")}
        description={t(
          "productsweb.intro",
          "Know what is on the shelf. Keep every item ready to sell.",
        )}
        actions={
          <>
            {perms.canEditProducts ? (
              <>
                <Button tone="ghost" href="/shop/products/import">
                  {t("imports.title", "Import products")}
                </Button>
                <Button href="/shop/products/new">
                  ＋ {t("modal.add_product.title", "Add product")}
                </Button>
              </>
            ) : null}
          </>
        }
      />
      <section
        className="products-overview"
        aria-label={t("products.title", "Products")}
      >
        {PRODUCT_FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={filters.filter === id}
            className={filters.filter === id ? "is-active" : ""}
            onClick={() => change({ filter: id })}
          >
            <span>{filterLabel(id)}</span>
            <strong>
              {catalog.data
                ? active.filter((i) => matchesProduct(i, id)).length
                : "—"}
            </strong>
          </button>
        ))}
      </section>
      <Card flush className="products-register">
        <div className="products-register-head">
          <div>
            <h2>{t("productsweb.catalogue", "Your catalogue")}</h2>
            <p aria-live="polite">
              {t("productsweb.count", "{{shown}} of {{total}} products", {
                shown: rows.length,
                total: active.length,
              })}
            </p>
          </div>
          <details className="products-tools">
            <summary>
              {t("stockUI.tools", "Product tools")}{" "}
              <span aria-hidden="true">＋</span>
            </summary>
            <div className="shop-actions">
              <Button
                tone="ghost"
                disabled={!catalog.data || catalog.isError}
                onClick={() =>
                  downloadText(
                    `products-${shop.name}.csv`,
                    inventoryCsv(active, hideCost, prefs?.appLanguage),
                  )
                }
              >
                {t("reports.sales.export_csv", "Export CSV")}
              </Button>
              {perms.canEditProducts ? (
                <>
                  <Button
                    tone="ghost"
                    disabled={blocked}
                    onClick={() => setSelecting((v) => !v)}
                  >
                    {t(
                      selecting ? "bulk.finish_selection" : "bulk.select",
                      "Select products",
                    )}
                  </Button>
                  <Button tone="ghost" href="/shop/products/barcodes">
                    {t("barcodes.title", "Product barcodes")}
                  </Button>
                  <Button tone="ghost" href="/shop/products/bulk">
                    {t("bulk.history", "Recent bulk selections")}
                  </Button>
                </>
              ) : null}
            </div>
          </details>
        </div>
        <div className="products-search">
          <Field
            label={t(
              "productsweb.search",
              "Search by name, short code or barcode",
            )}
          >
            <input
              className="shop-field"
              type="search"
              value={filters.q}
              maxLength={200}
              onChange={(e) => change({ q: e.target.value })}
            />
          </Field>
          <Field label={t("modal.add_product.category_label", "Category")}>
            <select
              className="shop-field"
              value={filters.category}
              onChange={(e) => change({ category: e.target.value })}
            >
              <option value="all">
                {t("products.all_categories", "All categories")}
              </option>
              {categories.map((c) => (
                <option value={c} key={c}>
                  {labeledL1(c, (k) => t(k, k))}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("productsweb.sort", "Sort by")}>
            <select
              className="shop-field"
              value={filters.sort}
              onChange={(e) =>
                change({ sort: e.target.value as ProductFilters["sort"] })
              }
            >
              {PRODUCT_SORTS.map((s) => (
                <option value={s} key={s}>
                  {t(
                    "products.sort." + s,
                    {
                      name: "Name",
                      recent: "Recently updated",
                      stock: "Stock priority",
                    }[s],
                  )}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {selecting && perms.canEditProducts ? (
          <div className="products-selection">
            <strong>
              {t("bulk.selected", "Selected: {{count}}", {
                count: selected.length,
              })}
            </strong>
            <div className="shop-actions">
              <Button
                tone="ghost"
                disabled={blocked}
                onClick={() => setSelected([])}
              >
                {t("bulk.clear", "Clear selection")}
              </Button>
              <Button
                tone="ghost"
                disabled={blocked || !rows.length}
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
                    matching: {
                      query: filters.q,
                      filter: filters.filter,
                      ...(filters.category !== "all"
                        ? { category: filters.category }
                        : {}),
                      nativeSearch: true,
                    },
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
              <Button disabled={offline} onClick={() => void bulk.recover()}>
                {t("bulk.recover", "Check result")}
              </Button>
            ) : null}
          </div>
        ) : null}
        {perms.canEditProducts && shortfallView && buyList.data && (shortfall.length || addAllError) ? (
          <div className="products-shortfall" role="status">
            {shortfall.length ? (
              <Button
                disabled={addingAll || offline}
                onClick={() => void addAllToBuyList()}
              >
                {t("modal.alerts.add_to_buy_list", "Add {{n}} item(s) to Buy List", {
                  n: shortfall.length,
                })}
              </Button>
            ) : null}
            {addAllError ? <p role="alert">{addAllError}</p> : null}
          </div>
        ) : null}
        <Notice error={catalog.error} />
        {catalog.isError ? (
          <Button tone="ghost" disabled={catalog.isFetching} onClick={() => void catalog.refetch()}>
            {t("common.retry", "Try again")}
          </Button>
        ) : null}
        {catalog.isPending ? (
          <Skeleton variant="row" count={5} label={t("web.gst.loading_products", "Loading products")} />
        ) : null}
        <div className="products-columns" aria-hidden="true">
          <span>{t("bill.item", "Item")}</span>
          <span>{t("reports.stock.on_hand", "On hand")}</span>
          <span>
            {t("modal.product_detail.detail_selling_price", "Selling price")}
          </span>
        </div>
        <div className="products-list">
          {rows.map((item) => {
            const expiry = productExpiry(item.nearestExpiryDate),
              tracked = item.product.trackStock !== false;
            return (
              <div className="products-entry" key={item.id}>
                {selecting && perms.canEditProducts ? (
                  <input
                    className="products-select"
                    type="checkbox"
                    checked={selected.includes(item.productId)}
                    disabled={blocked}
                    aria-label={item.product.name}
                    onChange={() => {}}
                    onClick={(e) => selectRow(item.productId, e.shiftKey)}
                  />
                ) : null}
                <Link
                  className="products-row"
                  href={`/shop/products/${item.productId}?${new URLSearchParams({ returnTo })}`}
                  onClick={(e) => {
                    if (selecting && perms.canEditProducts) {
                      e.preventDefault();
                      selectRow(item.productId, e.shiftKey);
                    } else remember();
                  }}
                >
                  <div className="products-identity">
                    <ProductImage
                      image={item.product.media?.cover}
                      name={item.product.name}
                      size={52}
                    />
                    <div>
                      <strong>{item.product.name}</strong>
                      <small>
                        {labeledL1(item.product.category, (k) => t(k, k))}
                        {item.product.shortCode
                          ? " · " + item.product.shortCode
                          : ""}
                      </small>
                      {filters.sort === "recent" ? (
                        <small>{formatDay(item.updatedAt)}</small>
                      ) : null}
                    </div>
                  </div>
                  <div className="products-stock">
                    <strong>
                      {tracked
                        ? formatQty(item.quantity, item.unit, {
                            packSize: item.product.packSize,
                            packLabel: item.product.packLabel,
                          })
                        : t("pos.no_stock_tracking", "Not stock-tracked")}
                    </strong>
                    {tracked && item.stockStatus !== "OK" ? (
                      <Pill
                        tone={item.stockStatus === "OUT" ? "danger" : "warn"}
                      >
                        {filterLabel(
                          item.stockStatus === "OUT"
                            ? "out_of_stock"
                            : "low_stock",
                        )}
                      </Pill>
                    ) : null}
                    {tracked && expiry ? (
                      <small
                        className={expiry.expired ? "text-danger" : "text-warn"}
                      >
                        {expiry.expired
                          ? t("productsweb.expired", "Expired")
                          : t("productsweb.expires", "Expires {{date}}", {
                              date: formatDay(item.nearestExpiryDate),
                            })}
                      </small>
                    ) : null}
                  </div>
                  <div className="products-price">
                    <strong>
                      {item.product.sellingPrice == null
                        ? t("home.unpriced", "Unpriced")
                        : formatINR(item.product.sellingPrice)}
                    </strong>
                    {item.product.sellingPrice != null ? (
                      <small>/ {item.unit}</small>
                    ) : null}
                  </div>
                  <span className="products-arrow" aria-hidden="true">
                    ›
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
        {!catalog.isPending && !catalog.isError && !active.length && perms.canEditProducts ? (
          <EmptyState
            icon="package"
            title={t("home.empty_title", "No products yet")}
            body={t("home.empty_subtitle", "Add your first product to start tracking inventory")}
            action={
              <div className="shop-actions">
                <Button href="/shop/products/new">
                  {t("modal.add_product.title", "Add product")}
                </Button>
                <Button tone="ghost" href="/shop/products/import">
                  {t("imports.title", "Import products")}
                </Button>
              </div>
            }
          />
        ) : !catalog.isPending && !catalog.isError && !rows.length ? (
          <EmptyState
            className="products-empty"
            icon="search"
            title={t("products.empty_filtered", "No products in this view.")}
            action={
              <div className="shop-actions">
                <Button
                  tone="ghost"
                  onClick={() =>
                    change({ q: "", filter: "all", category: "all", sort: "name" })
                  }
                >
                  {t("productsweb.reset", "Reset filters")}
                </Button>
                {!active.length && perms.canEditProducts ? (
                  <Button href="/shop/products/new">
                    {t("products.add", "Add product")}
                  </Button>
                ) : null}
              </div>
            }
          />
        ) : null}
      </Card>
    </div>
  );
}
