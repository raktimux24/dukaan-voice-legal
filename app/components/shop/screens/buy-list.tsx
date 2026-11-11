"use client";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useShop } from "../context";
import { ProductImageById } from "../product-image";
import { HomeNudge } from "../home-nudge";
import { VoiceSheet } from "../voice-sheet";
import {
  Button,
  Field,
  NoAccess,
  Notice,
  PageHeader,
  PremiumLock,
  Spinner,
  inputClass,
  isPremiumError,
} from "../ui";
import { UNITS, formatQty } from "../../../lib/shop/units";
import {
  BUY_FILTERS,
  filterBuyItems,
  buyItemDestination,
  buyQuantity,
  completedBuyItem,
  type BuyFilter,
} from "../../../lib/shop/buy-list";
import { labeledL1 } from "../../../lib/shop/catalog";
export function BuyListScreen() {
  const { shop, userId } = useShop();
  return <BuyWorkspace key={`${shop?.id}:${userId}`} />;
}
function BuyWorkspace() {
  const { api, shop, perms, premium, offline, hideCost, t, setNotice } =
      useShop(),
    qc = useQueryClient();
  const enabled = !!shop && perms.canEditProducts;
  const [section, setSection] = useState("list"),
    [filter, setFilter] = useState<BuyFilter>("pending"),
    [query, setQuery] = useState(""),
    [adding, setAdding] = useState(false),
    [mode, setMode] = useState("inventory"),
    [name, setName] = useState(""),
    [qty, setQty] = useState("1"),
    [unit, setUnit] = useState<string>("kg"),
    [selected, setSelected] = useState(""),
    [search, setSearch] = useState(""),
    [manual, setManual] = useState(""),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [remove, setRemove] = useState<{
      id?: string;
      term?: string;
      name: string;
    } | null>(null);
  const lock = useRef(false);
  const list = useQuery({
    queryKey: ["buy-list", shop?.id],
    enabled,
    queryFn: () => api.getBuyList(shop!.id),
  });
  const catalog = useQuery({
    queryKey: ["catalog", shop?.id, hideCost],
    enabled,
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
  });
  const nudges = useQuery({
    queryKey: ["nudges", shop?.id, "buy_list"],
    enabled: enabled && section === "suggestions",
    queryFn: () => api.getNudges(shop!.id, "buy_list"),
  });
  const demand = useQuery({
    queryKey: ["demandTerms", shop?.id],
    enabled: enabled && section === "suggestions",
    queryFn: () => api.getDemandTerms(shop!.id),
  });
  if (!shop) return <Spinner />;
  if (!perms.canEditProducts)
    return (
      <NoAccess
        what={t("buyweb.access", "The buy list is for owners and managers.")}
      />
    );
  const all = list.data ?? [],
    items = filterBuyItems(all, filter, query),
    products = (catalog.data ?? []).filter(
      (i) => i.product.isActive !== false && i.product.trackStock !== false,
    ),
    product = products.find((i) => i.productId === selected);
  const label = (f: BuyFilter) =>
    t(
      "buy_list.filter_" + f,
      {
        all: "All",
        pending: "Pending",
        stocked: "Stocked",
        ai_suggested: "AI suggested",
      }[f],
    );
  const refresh = async () => {
    await Promise.all(
      ["buy-list", "nudges", "demandTerms"].map((key) =>
        qc.invalidateQueries({ queryKey: [key, shop.id] }),
      ),
    );
  };
  async function run(task: () => Promise<unknown>, done: () => void) {
    if (lock.current || offline) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      api.assertSession();
      await task();
      api.assertSession();
      done();
      await refresh();
    } catch (e) {
      setError(e);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="shop-page buy-workspace">
      <PageHeader
        kicker={t("poweb.kicker", "Purchasing")}
        title={t("buy_list.title", "Buy list")}
        description={t(
          "buyweb.intro",
          "Plan the next restock. Keep orders and arrivals together.",
        )}
        actions={
          <>
            <Button
              tone="ghost"
              disabled={list.isFetching}
              onClick={() => void refresh()}
            >
              {t("common.refresh", "Refresh")}
            </Button>
            <Button
              disabled={offline}
              onClick={() => {
                setError(null);
                setAdding(true);
              }}
            >
              {t("buy_list.add_item", "Add item")} +
            </Button>
          </>
        }
      />
      <Notice error={!adding && !remove ? error : null} />
      {offline ? (
        <p className="shop-notice">
          {t(
            "buyweb.offline",
            "You are offline. Reconnect to update your buy list.",
          )}
        </p>
      ) : null}
      <div className="buy-heading">
        <div className="buy-tabs" aria-label={t("buy_list.title", "Buy list")}>
          {["list", "suggestions"].map((s) => (
            <button
              key={s}
              aria-pressed={section === s}
              onClick={() => setSection(s)}
            >
              {s === "list"
                ? t("buy_list.title", "Buy list")
                : t("stockUI.suggestions", "Suggestions")}
            </button>
          ))}
        </div>
        <Button tone="ghost" href="/shop/purchase-orders">
          {t("po.title", "Purchase orders")} ›
        </Button>
      </div>
      {section === "list" ? (
        <>
          <div className="buy-status">
            {BUY_FILTERS.map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                <strong>{filterBuyItems(all, f).length}</strong>
                <span>{label(f)}</span>
              </button>
            ))}
          </div>
          <div className="buy-search">
            <Field label={t("buyweb.search", "Search your buy list")}>
              <input
                className={inputClass}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
              />
            </Field>
            <p>
              {t(
                "po.buy_list_help",
                "Select buy-list items to order from a supplier. Receive deliveries against the order.",
              )}
            </p>
          </div>
          <Notice error={list.error} />
          {list.isLoading ? (
            <Spinner />
          ) : list.isError ? (
            <Button onClick={() => void list.refetch()}>
              {t("common.retry", "Retry")}
            </Button>
          ) : items.length === 0 ? (
            <div className="buy-empty">
              <span aria-hidden="true">✓</span>
              <h2>
                {t(
                  all.length ? "stockUI.no_items" : "buy_list.empty_title",
                  all.length ? "No items" : "Your buy list is empty",
                )}
              </h2>
              <p>
                {t(
                  all.length ? "buyweb.no_match" : "buyweb.empty",
                  all.length
                    ? "Try another filter or search."
                    : "Add an item from your products, or note something new to buy.",
                )}
              </p>
              <Button onClick={() => setAdding(true)} disabled={offline}>
                {t("buy_list.add_item", "Add item")}
              </Button>
            </div>
          ) : (
            <div className="buy-ledger">
              {items.map((item) => {
                const done = completedBuyItem(item),
                  href = buyItemDestination(item),
                  locked = item.isAiSuggested && !premium;
                return (
                  <article
                    key={item.id}
                    className={`buy-row ${done ? "is-complete" : ""}`}
                  >
                    <div className="buy-item">
                      <ProductImageById
                        productId={item.productId}
                        name={item.itemName}
                        size={48}
                      />
                      <div>
                        <h2>{item.itemName}</h2>
                        <p>
                          {item.category
                            ? labeledL1(item.category, (k) => t(k, k))
                            : t("modal.buy_list_item.tab_new", "New item")}
                        </p>
                        <span className="buy-badge">
                          {done
                            ? t("badge.stocked", "Stocked")
                            : item.purchaseOrderId
                              ? t("recordsUI.linkedOrder", "Linked order")
                              : label("pending")}
                        </span>
                        {item.isAiSuggested ? (
                          <span className="buy-ai">
                            {t("buy_list.badge_ai", "AI suggested")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="buy-quantity">
                      <small>
                        {t(
                          "modal.buy_list_item.quantity_to_buy",
                          "Quantity to buy",
                        )}
                      </small>
                      <strong>
                        {item.quantity == null
                          ? "—"
                          : formatQty(item.quantity, "")}{" "}
                        <span>
                          {item.unit
                            ? t(`unit_picker.${item.unit}`, item.unit)
                            : ""}
                        </span>
                      </strong>
                    </div>
                    <div className="buy-actions">
                      {href && !locked ? (
                        <Button tone="quiet" href={href}>
                          {t(
                            item.purchaseOrderId
                              ? "po.open"
                              : item.productId
                                ? "scanner.tab_stock"
                                : "modal.add_product.title",
                            item.purchaseOrderId
                              ? "Open order"
                              : item.productId
                                ? "Add stock"
                                : "Add product",
                          )}{" "}
                          →
                        </Button>
                      ) : null}
                      {!done && !item.purchaseOrderId && !locked ? (
                        <Button
                          tone="ghost"
                          href={
                            "/shop/purchase-orders?buyListItemId=" +
                            encodeURIComponent(item.id) +
                            "&buyListName=" +
                            encodeURIComponent(item.itemName)
                          }
                        >
                          {t("po.order_item", "Order")}
                        </Button>
                      ) : null}
                      <Button
                        tone="ghost"
                        disabled={offline || busy}
                        aria-label={
                          t("common.delete", "Delete") + " · " + item.itemName
                        }
                        onClick={() => {
                          setError(null);
                          setRemove({ id: item.id, name: item.itemName });
                        }}
                      >
                        {t("common.delete", "Delete")}
                      </Button>
                    </div>
                    {item.notes ||
                    item.aiReason ||
                    item.orderedQuantity != null ? (
                      <details className="buy-row-details">
                        <summary>
                          {t(
                            item.aiReason
                              ? "recordsUI.why"
                              : "modal.product_detail.section_details",
                            item.aiReason ? "Why this suggestion?" : "Details",
                          )}
                        </summary>
                        {item.aiReason ? <p>{item.aiReason}</p> : null}
                        {item.notes !== item.aiReason ? (
                          <p>{item.notes}</p>
                        ) : null}
                        {item.orderedQuantity != null ? (
                          <p>
                            {t("po.quantity", "Order quantity")} ·{" "}
                            {formatQty(item.orderedQuantity, item.unit ?? "")}
                          </p>
                        ) : null}
                      </details>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
          {all.some((i) => i.isAiSuggested && !premium) ||
          isPremiumError(list.error) ? (
            <PremiumLock shopId={shop.id} feature="buy_list_ai" />
          ) : null}
        </>
      ) : (
        <div className="buy-suggestions">
          {!premium ? <PremiumLock shopId={shop.id} feature="buy_list_ai"/> : null}
          <Notice error={nudges.error ?? demand.error} />
          {nudges.isLoading || demand.isLoading ? <Spinner /> : null}
          {[
            ["reorder", "nudge.section.order_soon", "Order soon"],
            ["unstocked", "nudge.section.asked_for", "Customers asked for"],
            ["supplier_price", "nudge.section.supplier", "Supplier prices"],
          ].map(([kind, key, fallback]) => {
            const rows = (nudges.data?.nudges ?? []).filter(
              (n) => n.status === "open" && n.kind === kind,
            );
            return rows.length ? (
              <section key={kind}>
                <h2>{t(key, fallback)}</h2>
                <div className="buy-nudges">
                  {rows.map((n) => (
                    <HomeNudge key={n.id} nudge={n} surface="buy_list" />
                  ))}
                </div>
              </section>
            ) : null;
          })}
          <section className="buy-demand">
            <h2>{t("nudge.section.asked_for", "Customers asked for")}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(
                  () => api.postDemand(shop.id, manual.trim(), "manual"),
                  () => {
                    setManual("");
                    setNotice(t("nudge.demand.noted", "Request noted"));
                  },
                );
              }}
            >
              <Field
                label={t(
                  "nudge.demand.manual_placeholder",
                  "Note a customer request",
                )}
              >
                <input
                  className={inputClass}
                  value={manual}
                  maxLength={200}
                  onChange={(e) => setManual(e.target.value)}
                />
              </Field>
              <Button
                type="submit"
                disabled={busy || offline || manual.trim().length < 2}
              >
                {t("common.add", "Add")}
              </Button>
            </form>
            {(demand.data?.terms ?? []).map((d) => (
              <div className="buy-demand-row" key={d.normalized}>
                <div>
                  <strong>{d.term}</strong>
                  <p>
                    {t(
                      d.people === 1
                        ? "nudge.demand.asked_n_one"
                        : "nudge.demand.asked_n",
                      "{{n}} requests · {{people}} people",
                      { n: d.asks, people: d.people },
                    )}
                  </p>
                </div>
                <Button
                  tone="ghost"
                  href={"/shop/products/new?name=" + encodeURIComponent(d.term)}
                >
                  {t("modal.add_product.title", "Add product")} ›
                </Button>
                <Button
                  tone="ghost"
                  disabled={offline || busy}
                  onClick={() => {
                    setError(null);
                    setRemove({ term: d.normalized, name: d.term });
                  }}
                  aria-label={t("common.remove", "Remove") + " · " + d.term}
                >
                  {t("common.remove", "Remove")}
                </Button>
              </div>
            ))}
          </section>
        </div>
      )}
      {adding ? (
        <VoiceSheet
          title={t("buy_list.add_item", "Add item")}
          closeLabel={t("common.close", "Close")}
          onClose={() => {
            if (!busy) setAdding(false);
          }}
        >
          <form
            className="buy-add"
            onSubmit={(e) => {
              e.preventDefault();
              const quantity = buyQuantity(qty);
              if (quantity == null) return;
              void run(
                () =>
                  api.addBuyListItem(
                    shop.id,
                    mode === "inventory"
                      ? {
                          itemName: product!.product.name,
                          productId: product!.productId,
                          category: product!.product.category,
                          unit: product!.unit,
                          quantity,
                        }
                      : { itemName: name.trim(), unit, quantity },
                  ),
                () => {
                  setAdding(false);
                  setName("");
                  setQty("1");
                  setSelected("");
                  setNotice(
                    t("modal.buy_list_item.toast_added", "{{name}} added", {
                      name:
                        mode === "inventory"
                          ? product!.product.name
                          : name.trim(),
                    }),
                  );
                },
              );
            }}
          >
            <div className="buy-tabs">
              {["inventory", "new"].map((m) => (
                <button
                  type="button"
                  key={m}
                  disabled={busy}
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                >
                  {t(
                    "modal.buy_list_item.tab_" + m,
                    m === "inventory" ? "From products" : "New item",
                  )}
                </button>
              ))}
            </div>
            {mode === "inventory" ? (
              <>
                <Field
                  label={t(
                    "modal.buy_list_item.search_label",
                    "Find a product",
                  )}
                >
                  <input
                    className={inputClass}
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={busy}
                  />
                </Field>
                <Notice error={catalog.error} />
                {catalog.isLoading ? (
                  <Spinner />
                ) : (
                  <div className="buy-picker">
                    {!catalog.isError && !products.some(i=>[i.product.name,i.product.category].some(v=>v.toLocaleLowerCase().includes(search.toLocaleLowerCase()))) ? <p className="p-4 text-muted">{t("modal.buy_list_item.no_products_found", "No products found")}</p> : null}
                    {products
                      .filter((i) =>
                        [i.product.name, i.product.category].some((v) =>
                          v
                            .toLocaleLowerCase()
                            .includes(search.toLocaleLowerCase()),
                        ),
                      )
                      .map((i) => (
                        <button
                          type="button"
                          disabled={busy}
                          key={i.productId}
                          aria-pressed={selected === i.productId}
                          onClick={() => setSelected(i.productId)}
                        >
                          <ProductImageById
                            productId={i.productId}
                            name={i.product.name}
                            size={36}
                          />
                          <span>
                            {i.product.name}
                            <small>
                              {formatQty(i.quantity, i.unit)} ·{" "}
                              {labeledL1(i.product.category, (k) => t(k, k))}
                            </small>
                          </span>
                          <span aria-hidden="true">
                            {selected === i.productId ? "✓" : "+"}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <Field label={t("modal.buy_list_item.name_label", "Item name")}>
                <input
                  className={inputClass}
                  required
                  value={name}
                  maxLength={200}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
                />
              </Field>
            )}
            <div className="buy-add-fields">
              <Field
                label={t(
                  "modal.buy_list_item.quantity_to_buy",
                  "Quantity to buy",
                )}
              >
                <input
                  className={inputClass}
                  inputMode="decimal"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  disabled={busy}
                  aria-invalid={buyQuantity(qty) == null}
                />
                {buyQuantity(qty) == null ? (
                  <small>
                    {t(
                      "buyweb.quantity",
                      "Enter a quantity above zero, with up to 3 decimal places.",
                    )}
                  </small>
                ) : null}
              </Field>
              <Field label={t("modal.buy_list_item.unit_label", "Unit")}>
                <select
                  className={inputClass}
                  value={mode === "inventory" ? (product?.unit ?? "kg") : unit}
                  disabled={mode === "inventory" || busy}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  {Array.from(
                    new Set([...UNITS, ...(product ? [product.unit] : [])]),
                  ).map((u) => (
                    <option key={u} value={u}>
                      {t(`unit_picker.${u}`, u)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Notice error={error} />
            <Button
              type="submit"
              disabled={
                busy ||
                offline ||
                buyQuantity(qty) == null ||
                (mode === "inventory" ? !product : !name.trim())
              }
            >
              {t(
                busy ? "common.loading" : "modal.buy_list_item.button",
                busy ? "Loading…" : "Add to buy list",
              )}
            </Button>
          </form>
        </VoiceSheet>
      ) : null}
      {remove ? (
        <VoiceSheet
          title={t("buy_list.delete_title", "Remove item?")}
          closeLabel={t("common.cancel", "Cancel")}
          onClose={() => {
            if (!busy) setRemove(null);
          }}
        >
          <p>
            {remove.term
              ? t(
                  "nudge.demand.remove_body",
                  "Remove this request from the list?",
                )
              : t(
                  "buy_list.delete_message",
                  "Remove {{name}} from the buy list?",
                  { name: remove.name },
                )}
          </p>
          <strong>{remove.name}</strong>
          <Notice error={error} />
          <div className="shop-actions">
            <Button
              disabled={busy || offline}
              onClick={() =>
                void run(
                  () =>
                    remove.id
                      ? api.deleteBuyListItem(shop.id, remove.id)
                      : api.deleteDemandTerm(shop.id, remove.term!),
                  () => setRemove(null),
                )
              }
            >
              {t("common.remove", "Remove")}
            </Button>
            <Button
              tone="ghost"
              disabled={busy}
              onClick={() => setRemove(null)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
          </div>
        </VoiceSheet>
      ) : null}
    </div>
  );
}
