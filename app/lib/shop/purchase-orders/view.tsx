"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useShop } from "../../../components/shop/context";
import { ProductImageById } from "../../../components/shop/product-image";
import { SupplierPicker } from "../../../components/shop/gst-supplier";
import {
  Button,
  Field,
  Spinner,
  IllustratedEmpty,
} from "../../../components/shop/ui";
import type { GstSupplier } from "../gst-types";
import { unitLabel } from "../units";
import {
  poRemaining,
  poUnits,
  poShareText,
  type PoDraft,
  type PoReceiptLine,
  type PurchaseOrder,
} from "./contract";
import {
  availableToOrder,
  estimatedTotal,
  filterOrders,
  orderStatuses,
  receiptIssue,
  suggestedPrice,
  validOrderLine,
} from "./presentation";
import type { usePurchaseOrders } from "./workflow";
type T = (key: string, vars?: Record<string, string | number>) => string;
const empty = (): PoDraft => ({
  supplierId: "",
  expectedDate: "",
  notes: "",
  lines: [],
});
function Input({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <Field localized label={label}>
      {multiline ? (
        <textarea
          className="shop-field"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="shop-field"
          type={type === "decimal" ? "text" : type}
          inputMode={type === "decimal" ? "decimal" : undefined}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}
function Check({
  children,
  value,
  onChange,
  disabled,
}: {
  children: ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="opening-check">
      <input
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}
export function PurchaseOrdersView({
  w,
  t,
  uuid,
  share,
  invoice,
  newProduct,
  initialBuyListId,
  initialBuyListIds,
  initialBuyListName,
  initialSupplierId,
  openForm = false,
  onCreate,
  onShowList,
  onOpen,
}: {
  w: ReturnType<typeof usePurchaseOrders>;
  t: T;
  uuid: () => string;
  share: (text: string) => Promise<void>;
  invoice: (p: PurchaseOrder, receipt: string) => Promise<void> | void;
  newProduct: () => void;
  initialBuyListId?: string;
  /** Several buy-list items handed over at once (S6); each becomes one line. */
  initialBuyListIds?: string[];
  initialBuyListName?: string;
  initialSupplierId?: string;
  openForm?: boolean;
  onCreate: () => void;
  onShowList: () => void;
  onOpen: (id: string) => void;
}) {
  const { api, shop, hideCost, prefs } = useShop();
  // New copy has an English fallback until it is translated; t() returns the key when it has no text.
  const tx = (
    key: string,
    fallback: string,
    vars?: Record<string, string | number>,
  ) => {
    const text = t(key, vars);
    if (text !== key) return text;
    let out = fallback;
    for (const [k, v] of Object.entries(vars ?? {}))
      out = out.replaceAll("{{" + k + "}}", String(v));
    return out;
  };
  const p = w.order,
    options = w.options.data,
    blocked = w.busy || !!w.pending || !w.ready;
  const [editing, setEditing] = useState(openForm),
    [step, setStep] = useState(0),
    [d, setDraft] = useState<PoDraft>(() => ({
      ...empty(),
      supplierId: initialSupplierId ?? "",
    }));
  const [baseOrder, setBaseOrder] = useState<PurchaseOrder | null>(null),
    [supplier, setSupplier] = useState<GstSupplier | null>(null);
  const [tab, setTab] = useState("details"),
    [reviewed, setReviewed] = useState(false),
    [receiving, setReceiving] = useState(false),
    [receipts, setReceipts] = useState<Omit<PoReceiptLine, "batchId">[]>([]);
  const [reference, setReference] = useState(""),
    [reason, setReason] = useState(""),
    [closing, setClosing] = useState(false),
    [cancelling, setCancelling] = useState(false),
    [message, setMessage] = useState(""),
    [received, setReceived] = useState(false);
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [mapping, setMapping] = useState<Record<string, string>>({});
  const savedNavigation = useRef(false);
  const initial = useRef(false),
    top = useRef<HTMLDivElement>(null);
  const catalog = useQuery({
    queryKey: ["catalog", shop?.id, hideCost],
    queryFn: () => api.getAllInventory(shop!.id, hideCost),
    enabled: w.allowed && (editing || receiving),
  });
  const linkedSupplier = useQuery({
    queryKey: ["poSupplier", shop?.id, initialSupplierId],
    queryFn: () => api.gst.supplier(shop!.id, initialSupplierId!),
    enabled: w.allowed && !!initialSupplierId,
  });
  const products = (catalog.data ?? [])
    .filter(
      (i) => i.product.isActive !== false && i.product.trackStock !== false,
    )
    .sort(
      (a, b) =>
        Number(a.quantity > 0) - Number(b.quantity > 0) ||
        a.product.name.localeCompare(b.product.name),
    );
  const productOptions = products.length
    ? products.map((i) => ({
        id: i.productId,
        name: i.product.name,
        unit: i.product.unit,
        price:
          i.product.purchasePrice == null
            ? ""
            : Number(i.product.purchasePrice).toFixed(2),
        quantity: i.quantity,
        low: i.quantity <= (i.product.minStockLevel ?? 0),
      }))
    : (options?.products ?? []).map((i) => ({
        ...i,
        quantity: null as number | null,
        low: false,
      }));
  const unit = (v: string) =>
    unitLabel(v, (k, f) => {
      const x = t(k);
      return x === k ? f : x;
    });
  const locale =
    prefs?.appLanguage === "hinglish"
      ? "en-IN"
      : {
          en: "en-IN",
          hi: "hi-IN",
          bn: "bn-IN",
          ta: "ta-IN",
          te: "te-IN",
          mr: "mr-IN",
          kn: "kn-IN",
          gu: "gu-IN",
          ml: "ml-IN",
        }[prefs?.appLanguage || "en"] || "en-IN";
  const money = (v: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(v);
  const date = (v: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(new Date(v));
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const total = estimatedTotal(d.lines),
    savedTotal = p ? estimatedTotal(p.lines) : null;
  useEffect(() => {
    if (linkedSupplier.data) setSupplier(linkedSupplier.data);
  }, [linkedSupplier.data]);
  useEffect(() => {
    setReceiving(false);
    setClosing(false);
    setCancelling(false);
    setReviewed(false);
    setReason("");
    setMessage("");
  }, [p?.id, p?.version]);
  useEffect(() => {
    setTab("details");
    setReceived(false);
  }, [p?.id]);
  useEffect(() => {
    top.current?.scrollIntoView({ block: "start" });
  }, [step, editing, p?.id]);
  useEffect(() => {
    if (!editing && !receiving) w.setSearch("");
  }, [editing, receiving, w.setSearch]);
  const buyLine = (
    b: NonNullable<typeof options>["buyList"][number],
    supplierId: string,
  ): PoDraft["lines"][number] => ({
    id: uuid(),
    buyListItemId: b.id,
    productId: b.productId ?? undefined,
    name: b.name,
    unit: b.unit ?? "",
    quantity: poUnits(availableToOrder(b)),
    price: suggestedPrice(options, supplierId, b.productId ?? undefined),
  });
  const handoffIds = (
    initialBuyListIds?.length
      ? initialBuyListIds
      : initialBuyListId
        ? [initialBuyListId]
        : []
  ).join(",");
  useEffect(() => {
    if (initial.current || !handoffIds || !options) return;
    const ids = handoffIds.split(",");
    const found = ids.flatMap((id) => {
      const b = options.buyList.find((b) => b.id === id);
      return b ? [b] : [];
    });
    if (!found.length) {
      if (
        ids.length === 1 &&
        initialBuyListName &&
        w.search !== initialBuyListName
      )
        w.setSearch(initialBuyListName);
      return;
    }
    initial.current = true;
    setDraft((old) => ({
      ...old,
      lines: found.slice(0, 100).map((b) => buyLine(b, old.supplierId)),
    }));
  }, [options, handoffIds, initialBuyListName, w.search]);
  // Fill missing costs and replace only a catalog suggestion, never a price the user edited.
  useEffect(() => {
    if (!editing) return;
    setDraft((old) => ({
      ...old,
      lines: old.lines.map((l) => {
        const fallback =
          productOptions.find((x) => x.id === l.productId)?.price ?? "";
        const next = suggestedPrice(
          options,
          old.supplierId,
          l.productId,
          fallback,
        );
        return next &&
          (!l.price ||
            (fallback !== "" && Number(l.price) === Number(fallback)))
          ? { ...l, price: next }
          : l;
      }),
    }));
  }, [editing, d.supplierId, options?.prices, catalog.data]);
  const patch = (value: Partial<PoDraft>) => {
    setDraft((old) => ({ ...old, ...value }));
    setReviewed(false);
  };
  const patchLine = (id: string, value: Partial<PoDraft["lines"][number]>) =>
    patch({
      lines: d.lines.map((l) => (l.id === id ? { ...l, ...value } : l)),
    });
  const supplierName =
    supplier?.id === d.supplierId
      ? supplier.identity.name
      : options?.suppliers.find((s) => s.id === d.supplierId)?.name ||
        baseOrder?.supplier.name ||
        "";
  const beginEdit = () => {
    if (!p) return;
    setBaseOrder(p);
    setDraft({ ...p, lines: p.lines.map((l) => ({ ...l })) });
    setSupplier({ id: p.supplierId, identity: p.supplier } as GstSupplier);
    setStep(0);
    setEditing(true);
  };
  const addProduct = (product: (typeof productOptions)[number]) => {
    patch({
      lines: [
        ...d.lines,
        {
          id: uuid(),
          productId: product.id,
          name: product.name,
          unit: product.unit,
          quantity: "1",
          price: suggestedPrice(
            options,
            d.supplierId,
            product.id,
            product.price,
          ),
        },
      ],
    });
    w.setSearch("");
  };
  useEffect(() => {
    if (savedNavigation.current && !editing && p) {
      savedNavigation.current = false;
      onOpen(p.id);
    }
  }, [editing, p, onOpen]);
  const save = async () => {
    const ok = await w.run(
      baseOrder
        ? {
            kind: "save",
            id: baseOrder.id,
            version: baseOrder.version,
            draft: d,
          }
        : { kind: "create", draft: d },
    );
    if (ok) {
      savedNavigation.current = true;
      setEditing(false);
      setStep(0);
    }
  };
  const beginReceive = () => {
    if (!p) return;
    setReceipts(
      p.lines
        .filter((l) => poRemaining(l) > 0)
        .map((l) => ({
          lineId: l.id,
          productId: l.productId ?? "",
          quantity: "0",
          rejected: "0",
          reason: "",
          cost: l.price,
          batchNumber: "",
          expiryDate: "",
        })),
    );
    setReference("");
    setReviewed(false);
    setReceived(false);
    setReceiving(true);
    setClosing(false);
    setMapping({});
  };
  const err =
    w.error ||
    ((w.list.error ?? w.options.error) as { code?: string } | null)?.code;
  const errorKey =
    "po.error." +
    ([
      "invalid",
      "quantity",
      "supplier",
      "product",
      "buy_list",
      "request_conflict",
      "not_allowed",
      "not_found",
      "stale",
      "state",
      "allocated",
      "remaining",
      "reason",
      "expiry",
      "unavailable",
      "storage",
    ].find((k) => "po_" + k === err) ?? "failed");
  const receiptError = p ? receiptIssue(p, receipts, today) : null;
  const statusPill = (order: PurchaseOrder) => (
    <span className={"po-status po-status--" + order.status}>
      {t("po.status." + order.status)}
    </span>
  );
  const lineIdentity = (id: string | undefined, name: string) => (
    <div className="po-identity">
      <ProductImageById productId={id} name={name} size={42} />
      <strong>{name}</strong>
    </div>
  );
  // S27: buy list first, then products that are low or out, then the rest (capped).
  const searchText = w.search.trim().toLocaleLowerCase();
  const buyRows = (options?.buyList ?? []).filter(
    (b) =>
      !d.lines.some((l) => l.buyListItemId === b.id) && availableToOrder(b) > 0,
  );
  const onBuyList = new Set(buyRows.map((b) => b.productId).filter(Boolean));
  const matching = productOptions.filter(
    (i) =>
      !onBuyList.has(i.id) && i.name.toLocaleLowerCase().includes(searchText),
  );
  const lowRows = searchText ? [] : matching.filter((i) => i.low);
  const restAll = searchText ? matching : matching.filter((i) => !i.low);
  const restCap = searchText ? 50 : 20;
  const hiddenProducts =
    Math.max(0, lowRows.length - 30) + Math.max(0, restAll.length - restCap);
  const pickerSections: [string, string, typeof productOptions][] = [
    ["poweb.section_low", "Low or out of stock", lowRows.slice(0, 30)],
    [
      searchText ? "poweb.section_products" : "poweb.section_other",
      searchText ? "Products" : "Other products",
      restAll.slice(0, restCap),
    ],
  ];
  const rows = w.list.data?.items ?? [],
    shown = filterOrders(rows, status, query);
  // S26: a shop with no orders yet sees only the empty state, not zeroed counters.
  const firstEmpty =
    !w.list.isPending && !w.list.error && !rows.length && w.offset === 0;
  const paged = w.offset > 0 || !!w.list.data?.more;
  const latestReceipt = p?.receipts.length
    ? [...p.receipts].sort((a, b) => b.at.localeCompare(a.at))[0]
    : null;
  const latestAccepted = !!latestReceipt?.lines.some((l) => l.batchId);
  if (!w.allowed) return <p className="shop-notice">{t("po.online_role")}</p>;
  return (
    <div className="po-workspace" ref={top}>
      {w.busy || !w.ready || w.list.isPending ? (
        <Spinner label={t("common.loading")} />
      ) : null}
      {err || w.list.error || w.options.error ? (
        <div className="shop-notice is-error" role="alert">
          <p>{t(errorKey)}</p>
          <Button
            tone="ghost"
            onClick={() => {
              void w.list.refetch();
              void w.options.refetch();
              if (p) void w.open(p.id);
            }}
          >
            {t("common.retry")}
          </Button>
        </div>
      ) : null}
      {w.pending ? (
        <div className="shop-notice" role="status">
          <p>{t("po.pending")}</p>
          <Button
            disabled={w.busy}
            onClick={() =>
              void w.run().then((ok) => {
                if (ok) setEditing(false);
              })
            }
          >
            {t("po.retry_saved")}
          </Button>
        </div>
      ) : null}
      {message ? (
        <p className="shop-notice" role="status">
          {message}
        </p>
      ) : null}
      {editing ? (
        <>
          {baseOrder ? <h1>{t("po.edit")}</h1> : null}
          <nav className="po-steps" aria-label={t("po.new")}>
            {["po.supplier", "poweb.items", "poweb.review"].map((k, i) => (
              <button
                type="button"
                key={k}
                aria-current={step === i ? "step" : undefined}
                disabled={blocked || i > step}
                onClick={() => setStep(i)}
              >
                <span>0{i + 1}</span>
                {t(k)}
              </button>
            ))}
          </nav>
          <div className="po-editor-layout">
            <section className="po-sheet">
              <header className="po-section-head">
                <h2>
                  {t(["po.supplier", "poweb.items", "poweb.review"][step])}
                </h2>
                {supplierName && step > 0 ? <p>{supplierName}</p> : null}
              </header>
              {step === 0 ? (
                <div className="po-stack">
                  <fieldset disabled={blocked}>
                    <SupplierPicker
                      value={supplier}
                      onChange={(s) => {
                        setSupplier(s);
                        patch({ supplierId: s.id });
                        void w.options.refetch();
                      }}
                    />
                  </fieldset>
                  {supplierName ? (
                    <p className="po-selected">
                      {t("po.supplier_selected", { name: supplierName })}
                    </p>
                  ) : null}
                  {linkedSupplier.error ? (
                    <p role="alert">{t("po.error.supplier")}</p>
                  ) : null}
                  <div className="po-fields">
                    <Input
                      label={t("po.expected")}
                      value={d.expectedDate}
                      type="date"
                      onChange={(expectedDate) => patch({ expectedDate })}
                      disabled={blocked}
                    />
                    <Input
                      label={t("po.notes")}
                      value={d.notes}
                      multiline
                      onChange={(notes) => patch({ notes })}
                      disabled={blocked}
                    />
                  </div>
                </div>
              ) : step === 1 ? (
                <div className="po-stack">
                  <Input
                    label={t("poweb.search_items")}
                    value={w.search}
                    onChange={w.setSearch}
                    disabled={blocked}
                  />
                  {catalog.error ? (
                    <div role="alert">
                      <p>{t("poweb.catalog_error")}</p>
                      <Button
                        tone="ghost"
                        onClick={() => void catalog.refetch()}
                      >
                        {t("common.retry")}
                      </Button>
                    </div>
                  ) : null}
                  {buyRows.length > 1 ? (
                    <div className="po-add-all">
                      <Button
                        tone="ghost"
                        disabled={blocked || d.lines.length >= 100}
                        onClick={() => {
                          patch({
                            lines: [
                              ...d.lines,
                              ...buyRows
                                .slice(0, 100 - d.lines.length)
                                .map((b) => buyLine(b, d.supplierId)),
                            ],
                          });
                          w.setSearch("");
                        }}
                      >
                        {tx(
                          "poweb.add_all_buy_list",
                          "Add all {{count}} buy-list items",
                          { count: buyRows.length },
                        )}
                      </Button>
                      <small className="po-muted">
                        {tx(
                          "poweb.add_all_help",
                          "Remove any you don't want from this supplier.",
                        )}
                      </small>
                    </div>
                  ) : null}
                  <div className="po-picker" aria-label={t("po.add_product")}>
                    {buyRows.length ? (
                      <p className="po-picker-head">
                        {tx("poweb.section_buy_list", "On your buy list")}
                      </p>
                    ) : null}
                    {buyRows.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        disabled={blocked || d.lines.length >= 100}
                        onClick={() => {
                          patch({
                            lines: [...d.lines, buyLine(b, d.supplierId)],
                          });
                          w.setSearch("");
                        }}
                      >
                        {lineIdentity(b.productId ?? undefined, b.name)}
                        <small>
                          {t("poweb.buy_list")} ·{" "}
                          {t("po.available", {
                            qty: poUnits(availableToOrder(b)),
                          })}{" "}
                          {unit(b.unit ?? "")}
                        </small>
                        <span aria-hidden="true">+</span>
                      </button>
                    ))}
                    {pickerSections.map(([key, fallback, items]) =>
                      items.length ? (
                        <div className="po-picker-group" key={key}>
                          <p className="po-picker-head">{tx(key, fallback)}</p>
                          {items.map((i) => (
                            <button
                              type="button"
                              key={i.id}
                              disabled={blocked || d.lines.length >= 100}
                              onClick={() => addProduct(i)}
                            >
                              {lineIdentity(i.id, i.name)}
                              <small>
                                {i.quantity == null
                                  ? unit(i.unit)
                                  : t("poweb.on_hand", {
                                      qty: poUnits(i.quantity),
                                      unit: unit(i.unit),
                                    })}
                              </small>
                              <span aria-hidden="true">+</span>
                            </button>
                          ))}
                        </div>
                      ) : null,
                    )}
                  </div>
                  {hiddenProducts > 0 ? (
                    <p className="po-muted" role="status">
                      {searchText
                        ? tx(
                            "poweb.more_matches",
                            "{{count}} more products match. Keep typing to narrow the list.",
                            { count: hiddenProducts },
                          )
                        : tx(
                            "poweb.type_to_search",
                            "Type a name to search {{count}} more products.",
                            { count: hiddenProducts },
                          )}
                    </p>
                  ) : null}
                  {options?.more ? (
                    <p className="po-muted">{t("po.refine_search")}</p>
                  ) : null}
                  <Button tone="ghost" disabled={blocked} onClick={newProduct}>
                    {t("po.create_product")} ↗
                  </Button>
                  <h3>
                    {t("poweb.items")} · {d.lines.length}
                  </h3>
                  {d.lines.map((l) => (
                    <article className="po-edit-line" key={l.id}>
                      {lineIdentity(l.productId, l.name)}
                      <div className="po-fields">
                        <Input
                          label={t("po.quantity") + " · " + unit(l.unit)}
                          type="decimal"
                          value={l.quantity}
                          onChange={(quantity) => patchLine(l.id, { quantity })}
                          disabled={blocked}
                        />
                        <Input
                          label={t("po.estimate")}
                          type="decimal"
                          value={l.price}
                          onChange={(price) => patchLine(l.id, { price })}
                          disabled={blocked}
                        />
                        {!l.productId &&
                        !options?.buyList.find((b) => b.id === l.buyListItemId)
                          ?.unit ? (
                          <Input
                            label={t("po.unit")}
                            value={l.unit}
                            onChange={(unit) => patchLine(l.id, { unit })}
                            disabled={blocked}
                          />
                        ) : null}
                      </div>
                      {l.price &&
                      options?.prices?.some(
                        (x) =>
                          x.supplierId === d.supplierId &&
                          x.productId === l.productId &&
                          Number(x.price) === Number(l.price),
                      ) ? (
                        <small className="po-muted">
                          {t("poweb.last_price")}
                        </small>
                      ) : null}
                      {!validOrderLine(l) ? (
                        <p className="po-validation">
                          {t("po.error.quantity")}
                        </p>
                      ) : null}
                      <Button
                        tone="quiet"
                        disabled={blocked}
                        onClick={() =>
                          patch({ lines: d.lines.filter((x) => x.id !== l.id) })
                        }
                      >
                        {t("po.remove")}
                      </Button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="po-stack">
                  {d.expectedDate ? (
                    <p>
                      {t("poweb.expected")} · {date(d.expectedDate)}
                    </p>
                  ) : null}
                  {d.notes ? <p>{d.notes}</p> : null}
                  {d.lines.map((l) => (
                    <div className="po-review-line" key={l.id}>
                      {lineIdentity(l.productId, l.name)}
                      <p>
                        {l.quantity} {unit(l.unit)}
                      </p>
                      <strong>
                        {l.price
                          ? money(Number(l.quantity) * Number(l.price))
                          : t("poweb.unpriced")}
                      </strong>
                    </div>
                  ))}
                  <div className="po-review-total">
                    <span>{t("poweb.estimate")}</span>
                    <strong>
                      {total == null ? t("poweb.unpriced") : money(total)}
                    </strong>
                  </div>
                  <p className="po-muted">{t("po.draft_help")}</p>
                </div>
              )}
            </section>
            <aside className="po-summary">
              <p className="shop-kicker">{t("poweb.order_summary")}</p>
              <h2>{supplierName || t("poweb.choose_supplier")}</h2>
              <dl>
                <div>
                  <dt>{t("poweb.items")}</dt>
                  <dd>{d.lines.length}</dd>
                </div>
                <div>
                  <dt>{t("poweb.estimate")}</dt>
                  <dd>{total == null ? "—" : money(total)}</dd>
                </div>
              </dl>
              <p>{t("po.not_invoice")}</p>
              <p className="po-muted">{t("poweb.estimate_help")}</p>
            </aside>
          </div>
          <footer className="po-footer">
            <Button
              tone="ghost"
              disabled={blocked}
              onClick={() => {
                if (step) setStep(step - 1);
                else if (baseOrder) setEditing(false);
                else onShowList();
              }}
            >
              {t(step ? "poweb.back" : "common.cancel")}
            </Button>
            <Button
              disabled={
                blocked ||
                (step === 0
                  ? !d.supplierId
                  : !d.lines.length || !d.lines.every(validOrderLine))
              }
              onClick={() => (step < 2 ? setStep(step + 1) : void save())}
            >
              {t(step === 2 ? "po.save_draft" : "poweb.continue")}{" "}
              <span aria-hidden="true">→</span>
            </Button>
          </footer>
        </>
      ) : p ? (
        <>
          <Button
            tone="quiet"
            disabled={blocked}
            onClick={() => {
              w.setOrder(null);
              onShowList();
            }}
          >
            ← {t("po.all_orders")}
          </Button>
          <header className="po-detail-head">
            <div>
              <p className="shop-kicker">{p.number || t("po.status.draft")}</p>
              <h1>{p.supplier.name}</h1>
              {p.expectedDate ? (
                <p>
                  {t("poweb.expected")} · {date(p.expectedDate)}
                </p>
              ) : null}
            </div>
            {statusPill(p)}
          </header>
          <div className="po-detail-metrics">
            <div>
              <span>{t("poweb.items")}</span>
              <strong>{p.lines.length}</strong>
            </div>
            <div>
              <span>{t("poweb.outstanding_items")}</span>
              <strong>
                {p.lines.filter((l) => poRemaining(l) > 0).length}
              </strong>
            </div>
            <div>
              <span>{t("poweb.estimate")}</span>
              <strong>{savedTotal == null ? "—" : money(savedTotal)}</strong>
            </div>
          </div>
          {received && latestReceipt ? (
            <section className="po-received" role="status">
              <h2>{tx("poweb.received_title", "Stock received")}</h2>
              <p>
                {latestAccepted
                  ? tx(
                      "poweb.received_body",
                      "The accepted goods are now in stock. Next, record the supplier's invoice when you have it.",
                    )
                  : tx(
                      "poweb.received_body_rejected",
                      "Nothing was added to stock. Rejected goods are still due from the supplier.",
                    )}
              </p>
              <div className="po-actions">
                {latestAccepted ? (
                  <Button
                    disabled={blocked}
                    onClick={() =>
                      void Promise.resolve(invoice(p, latestReceipt.id)).catch(
                        () => setMessage(t("po.invoice_unavailable")),
                      )
                    }
                  >
                    {t("po.record_invoice")} →
                  </Button>
                ) : null}
                <Button tone="ghost" onClick={() => setReceived(false)}>
                  {latestAccepted
                    ? tx("poweb.later", "Later")
                    : tx("poweb.dismiss", "OK")}
                </Button>
              </div>
            </section>
          ) : null}
          <nav className="po-tabs" aria-label={t("po.open")}>
            {["details", "actions", "history"].map((key) => (
              <button
                type="button"
                key={key}
                aria-pressed={tab === key}
                disabled={w.busy}
                onClick={() => setTab(key)}
              >
                {t("poweb." + key)}
              </button>
            ))}
          </nav>
          {tab === "details" ? (
            <section className="po-sheet">
              <header className="po-section-head">
                <h3>{t("poweb.items")}</h3>
                {["issued", "part_received"].includes(p.status) ? (
                  <Button
                    disabled={blocked}
                    onClick={() => {
                      setTab("actions");
                      beginReceive();
                    }}
                  >
                    {t("po.receive")}
                  </Button>
                ) : null}
                {p.status === "draft" ? (
                  <Button disabled={blocked} onClick={beginEdit}>
                    {t("po.edit")}
                  </Button>
                ) : null}
              </header>
              {p.lines.map((l) => (
                <article className="po-order-line" key={l.id}>
                  {lineIdentity(l.productId, l.name)}
                  <dl>
                    {[
                      ["poweb.ordered", l.quantity],
                      ["poweb.received", l.received],
                      ["poweb.remaining", poUnits(poRemaining(l))],
                    ].map(([key, value]) => (
                      <div key={key}>
                        <dt>{t(key)}</dt>
                        <dd>
                          {value} <small>{unit(l.unit)}</small>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {Number(l.rejected) > 0 ? (
                    <small>{t("po.rejected_total", { qty: l.rejected })}</small>
                  ) : null}
                  {Number(l.cancelled) > 0 ? (
                    <small>
                      {t("po.cancelled_total", { qty: l.cancelled })}
                    </small>
                  ) : null}
                  {l.price ? (
                    <small>
                      {t("po.estimate")} · {money(Number(l.price))}
                    </small>
                  ) : null}
                </article>
              ))}
              {p.notes ? (
                <div className="po-notes">
                  <h3>{t("po.notes")}</h3>
                  <p>{p.notes}</p>
                </div>
              ) : null}
              <p className="po-muted">{t("po.intro")}</p>
            </section>
          ) : tab === "actions" ? (
            <section className="po-sheet po-stack">
              {p.status === "draft" ? (
                <>
                  <h3>{t("po.issue")}</h3>
                  <p className="po-muted">{t("po.draft_help")}</p>
                  <Check
                    value={reviewed}
                    onChange={setReviewed}
                    disabled={blocked}
                  >
                    {t("po.issue_review")}
                  </Check>
                  <div className="po-actions">
                    <Button
                      disabled={blocked || !reviewed}
                      onClick={() =>
                        void w.run({
                          kind: "issue",
                          id: p.id,
                          version: p.version,
                        })
                      }
                    >
                      {t("po.issue")}
                    </Button>
                    <Button tone="ghost" disabled={blocked} onClick={beginEdit}>
                      {t("po.edit")}
                    </Button>
                    <Button
                      tone="quiet"
                      disabled={blocked}
                      onClick={() => setCancelling(!cancelling)}
                    >
                      {t("po.cancel_draft")}
                    </Button>
                  </div>
                  {cancelling ? (
                    <div className="po-confirm">
                      <p>{t("poweb.cancel_help")}</p>
                      <div className="po-actions">
                        <Button
                          tone="danger"
                          disabled={blocked}
                          onClick={() =>
                            void w.run({
                              kind: "cancel",
                              id: p.id,
                              version: p.version,
                            })
                          }
                        >
                          {t("po.cancel_draft")}
                        </Button>
                        <Button
                          tone="ghost"
                          disabled={blocked}
                          onClick={() => setCancelling(false)}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
              {p.number && !receiving ? (
                <div className="po-actions">
                  {["issued", "part_received"].includes(p.status) ? (
                    <Button disabled={blocked} onClick={beginReceive}>
                      {t("po.receive")}
                    </Button>
                  ) : null}
                  <Button
                    tone="ghost"
                    disabled={blocked}
                    onClick={() =>
                      void w
                        .run({ kind: "share", id: p.id, version: p.version })
                        .then(async (ok) => {
                          if (ok) {
                            try {
                              await share(poShareText(p, t));
                              setMessage(t("po.share_help"));
                            } catch {
                              setMessage(t("po.share_cancelled"));
                            }
                          }
                        })
                    }
                  >
                    {t("po.share")}
                  </Button>
                </div>
              ) : null}
              {receiving ? (
                <>
                  <header className="po-section-head">
                    <h3>{t("po.receive")}</h3>
                    <Button
                      tone="quiet"
                      disabled={blocked}
                      onClick={() => setReceiving(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </header>
                  <p className="po-muted">{t("po.receipt_help")}</p>
                  <Input
                    label={t("po.reference")}
                    value={reference}
                    onChange={(v) => {
                      setReference(v);
                      setReviewed(false);
                    }}
                    disabled={blocked}
                  />
                  {receipts.map((r, index) => {
                    const l = p.lines.find((l) => l.id === r.lineId)!;
                    const update = (patch: Partial<typeof r>) => {
                      setReviewed(false);
                      setReceipts((rows) =>
                        rows.map((row, i) =>
                          i === index ? { ...row, ...patch } : row,
                        ),
                      );
                    };
                    return (
                      <article className="po-edit-line" key={r.lineId}>
                        {lineIdentity(r.productId || l.productId, l.name)}
                        <p className="po-selected">
                          {t("po.remaining", {
                            qty: poRemaining(l),
                            unit: unit(l.unit),
                          })}
                        </p>
                        {!l.productId ? (
                          <div className="po-stack">
                            <p>{t("po.map_help")}</p>
                            <Input
                              label={t("poweb.search_items")}
                              value={mapping[r.lineId] ?? ""}
                              onChange={(v) => {
                                setMapping((old) => ({
                                  ...old,
                                  [r.lineId]: v,
                                }));
                                w.setSearch(v);
                              }}
                              disabled={blocked}
                            />
                            <Field localized label={t("po.add_product")}>
                              <select
                                className="shop-field"
                                value={r.productId}
                                onChange={(e) =>
                                  update({ productId: e.target.value })
                                }
                                disabled={blocked}
                              >
                                <option value="">{t("po.add_product")}</option>
                                {productOptions
                                  .filter(
                                    (x) =>
                                      x.unit === l.unit &&
                                      (x.id === r.productId ||
                                        x.name
                                          .toLocaleLowerCase()
                                          .includes(
                                            (
                                              mapping[r.lineId] ?? ""
                                            ).toLocaleLowerCase(),
                                          )),
                                  )
                                  .map((x) => (
                                    <option key={x.id} value={x.id}>
                                      {x.name}
                                    </option>
                                  ))}
                              </select>
                            </Field>
                            <Button
                              tone="ghost"
                              disabled={blocked}
                              onClick={newProduct}
                            >
                              {t("po.create_product")} ↗
                            </Button>
                          </div>
                        ) : null}
                        <div className="po-fields">
                          <Input
                            label={t("po.accepted") + " · " + unit(l.unit)}
                            value={r.quantity}
                            type="decimal"
                            onChange={(quantity) => update({ quantity })}
                            disabled={blocked}
                          />
                          <Input
                            label={t("po.cost")}
                            value={r.cost}
                            type="decimal"
                            onChange={(cost) => update({ cost })}
                            disabled={blocked}
                          />
                          <Input
                            label={t("po.batch")}
                            value={r.batchNumber}
                            onChange={(batchNumber) => update({ batchNumber })}
                            disabled={blocked}
                          />
                          <Input
                            label={t("po.expiry")}
                            type="date"
                            value={r.expiryDate}
                            onChange={(expiryDate) => update({ expiryDate })}
                            disabled={blocked}
                          />
                        </div>
                        <details className="po-disclosure">
                          <summary>{t("poweb.rejections")}</summary>
                          <div className="po-fields">
                            <Input
                              label={t("po.rejected") + " · " + unit(l.unit)}
                              value={r.rejected}
                              type="decimal"
                              onChange={(rejected) => update({ rejected })}
                              disabled={blocked}
                            />
                            <Input
                              label={t("po.reject_reason")}
                              value={r.reason}
                              onChange={(reason) => update({ reason })}
                              disabled={blocked}
                            />
                          </div>
                        </details>
                      </article>
                    );
                  })}
                  <Check
                    value={reviewed}
                    onChange={setReviewed}
                    disabled={blocked}
                  >
                    {t("po.receipt_review")}
                  </Check>
                  {receiptError &&
                  receipts.some(
                    (r) => r.quantity !== "0" || r.rejected !== "0",
                  ) ? (
                    <p className="po-validation" role="status">
                      {t("po.error." + receiptError)}
                    </p>
                  ) : null}
                  <footer className="po-footer">
                    <Button
                      tone="ghost"
                      disabled={blocked}
                      onClick={() => setReceiving(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      disabled={blocked || !reviewed || !!receiptError}
                      onClick={() =>
                        void w
                          .run({
                            kind: "receive",
                            id: p.id,
                            version: p.version,
                            reference,
                            lines: receipts.filter(
                              (r) =>
                                Number(r.quantity) > 0 ||
                                Number(r.rejected) > 0,
                            ),
                          })
                          .then((ok) => {
                            if (ok) {
                              setReceiving(false);
                              setTab("history");
                              setReceived(true);
                            }
                          })
                      }
                    >
                      {t("po.confirm_receipt")}
                    </Button>
                  </footer>
                </>
              ) : null}
              {["issued", "part_received"].includes(p.status) && !receiving ? (
                <details
                  className="po-disclosure"
                  open={closing}
                  onToggle={(e) => setClosing(e.currentTarget.open)}
                >
                  <summary>{t("po.close")}</summary>
                  <div className="po-stack">
                    <p>{t("po.close_help")}</p>
                    <Input
                      label={t("po.close_reason")}
                      value={reason}
                      onChange={setReason}
                      disabled={blocked}
                    />
                    <Button
                      tone="danger"
                      disabled={blocked || !reason.trim()}
                      onClick={() =>
                        void w.run({
                          kind: "close",
                          id: p.id,
                          version: p.version,
                          note: reason,
                        })
                      }
                    >
                      {t("po.confirm_close")}
                    </Button>
                  </div>
                </details>
              ) : null}
              {["received", "closed", "cancelled"].includes(p.status) ? (
                <p className="po-muted">{t("poweb.completed_help")}</p>
              ) : null}
            </section>
          ) : (
            <section className="po-sheet po-stack">
              <h3>
                {t("po.receipt_history")} · {p.receipts.length}
              </h3>
              {!p.receipts.length ? (
                <p className="po-muted">{t("poweb.no_receipts")}</p>
              ) : null}
              {p.receipts.map((r) => (
                <article className="po-receipt" key={r.id}>
                  <header>
                    <strong>{date(r.at)}</strong>
                    {r.reference ? <p>{r.reference}</p> : null}
                  </header>
                  {r.lines.map((l) => (
                    <div key={l.lineId}>
                      <strong>
                        {p.lines.find((x) => x.id === l.lineId)?.name}
                      </strong>
                      <p>
                        {t("po.receipt_summary", {
                          accepted: l.quantity,
                          rejected: l.rejected,
                        })}{" "}
                        {unit(
                          p.lines.find((x) => x.id === l.lineId)?.unit ?? "",
                        )}
                      </p>
                      {l.reason ? <p>{l.reason}</p> : null}
                      {l.batchNumber ? (
                        <p>
                          {t("po.batch")} · {l.batchNumber}
                        </p>
                      ) : null}
                      {l.expiryDate ? (
                        <p>
                          {t("po.expiry")} · {date(l.expiryDate)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                  {r.lines.some((l) => l.batchId) ? (
                    <Button
                      tone="ghost"
                      disabled={blocked}
                      onClick={() =>
                        void Promise.resolve(invoice(p, r.id)).catch(() =>
                          setMessage(t("po.invoice_unavailable")),
                        )
                      }
                    >
                      {t("po.record_invoice")} →
                    </Button>
                  ) : null}
                </article>
              ))}
              <h3>{t("po.history")}</h3>
              <ol className="po-timeline">
                {p.events.map((e, i) => (
                  <li key={i}>
                    <strong>{t("po.event." + e.kind)}</strong>
                    <time dateTime={e.at}>
                      {date(e.at)} ·{" "}
                      {new Intl.DateTimeFormat(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(e.at))}
                    </time>
                    {e.note ? <p>{e.note}</p> : null}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      ) : (
        <>
          {firstEmpty ? null : (
            <>
              <div className="po-overview">
                <div>
                  <p className="shop-kicker">{t("poweb.this_page")}</p>
                  <strong>{rows.length}</strong>
                  <p>{t("po.title")}</p>
                </div>
                <div className="po-status-counts">
                  {orderStatuses.map((s) => (
                    <button
                      type="button"
                      key={s}
                      aria-pressed={status === s}
                      disabled={w.busy}
                      onClick={() => setStatus(status === s ? "all" : s)}
                    >
                      <span className={"po-status po-status--" + s}>
                        {t("po.status." + s)}
                      </span>
                      <strong>
                        {rows.filter((p) => p.status === s).length}
                      </strong>
                    </button>
                  ))}
                </div>
              </div>
              <div className="po-list-tools">
                <Input
                  label={t("poweb.search_orders")}
                  value={query}
                  onChange={setQuery}
                />
                <Field localized label={t("poweb.status")}>
                  <select
                    className="shop-field"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="all">{t("po.all_orders")}</option>
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>
                        {t("po.status." + s)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Button
                  tone="ghost"
                  disabled={blocked}
                  onClick={() => void w.list.refetch()}
                >
                  {t("poweb.refresh")}
                </Button>
              </div>
              {paged ? (
                <p className="po-muted">{t("poweb.page_help")}</p>
              ) : null}
            </>
          )}
          <div className="po-order-list">
            {shown.map((order) => (
              <button
                className="po-list-row"
                type="button"
                key={order.id}
                disabled={blocked}
                onClick={() => onOpen(order.id)}
              >
                <span className="po-list-id">
                  <small>{order.number || t("po.status.draft")}</small>
                  <strong>{order.supplier.name}</strong>
                  <small>
                    {order.lines.length} {t("poweb.items")}
                    {order.expectedDate
                      ? " · " +
                        t("poweb.expected") +
                        " " +
                        date(order.expectedDate)
                      : ""}
                  </small>
                </span>
                {statusPill(order)}
                <span className="po-list-total">
                  {estimatedTotal(order.lines) == null
                    ? "—"
                    : money(estimatedTotal(order.lines)!)}
                  <small>{t("poweb.estimate")}</small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </div>
          {!w.list.isPending && !w.list.error && !shown.length ? (
            <IllustratedEmpty
              title={t(rows.length ? "poweb.no_matches" : "po.empty")}
              action={
                rows.length ? (
                  <Button
                    tone="ghost"
                    onClick={() => {
                      setStatus("all");
                      setQuery("");
                    }}
                  >
                    {t("poweb.clear_filters")}
                  </Button>
                ) : (
                  <Button disabled={blocked} onClick={onCreate}>
                    {t("po.new")}
                  </Button>
                )
              }
            />
          ) : null}
          {paged ? (
            <div className="po-pagination">
              <Button
                tone="ghost"
                disabled={blocked || w.offset === 0}
                onClick={() => w.setOffset(Math.max(0, w.offset - 30))}
              >
                {t("po.previous")}
              </Button>
              <span>{Math.floor(w.offset / 30) + 1}</span>
              <Button
                tone="ghost"
                disabled={blocked || !w.list.data?.more}
                onClick={() => w.setOffset(w.offset + 30)}
              >
                {t("po.more")}
              </Button>
            </div>
          ) : null}
          <details className="po-disclosure">
            <summary>{t("po.not_invoice")}</summary>
            <p>{t("po.intro")}</p>
          </details>
        </>
      )}
    </div>
  );
}
