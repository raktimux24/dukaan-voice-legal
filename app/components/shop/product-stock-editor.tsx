"use client";
import { useRef, useState } from "react";
import { useShop } from "./context";
import { Button, Field, Notice } from "./ui";
import { SupplierField } from "./supplier-field";
import { formatQty } from "../../lib/shop/units";
import { receiveValues, stockNumber } from "../../lib/shop/products";
import type {
  AdjustmentReason,
  InventoryItem,
  StockBatch,
} from "../../lib/shop/types";
const REASONS: AdjustmentReason[] = [
  "damaged",
  "expired",
  "theft",
  "correction",
  "returned_to_supplier",
  "personal_use",
  "other",
];
export function ProductStockEditor({
  item,
  mode,
  onDone,
  onSell,
  buyListItemId,
  initialQuantity,
}: {
  item: InventoryItem;
  mode: "adjust" | "batch";
  onDone: () => Promise<void>;
  onSell: (quantity: number) => void;
  buyListItemId?: string | null;
  initialQuantity?: string;
}) {
  const { api, shop, perms, hideCost, offline, t } = useShop();
  const packSize = item.product.packSize ?? null;
  const [quantity, setQuantity] = useState(initialQuantity ?? ""),
    [unitMode, setUnitMode] = useState<"unit" | "pack">(
      packSize && !initialQuantity ? "pack" : "unit",
    );
  const [cost, setCost] = useState(
    packSize && !initialQuantity
      ? ""
      : item.product.purchasePrice == null
        ? ""
        : String(item.product.purchasePrice),
  );
  const [selling, setSelling] = useState(""),
    [batchNumber, setBatchNumber] = useState(""),
    [purchaseDate, setPurchaseDate] = useState(""),
    [expiry, setExpiry] = useState(""),
    [supplier, setSupplier] = useState("");
  const [reason, setReason] = useState(""),
    [note, setNote] = useState(""),
    [absolute, setAbsolute] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [phase, setPhase] = useState<
      "ready" | "followup" | "uncertain" | "complete"
    >("ready");
  const lock = useRef(false),
    progress = useRef({ received: false, priced: false, stocked: false });
  const amount = stockNumber(quantity),
    setAmount = stockNumber(absolute),
    price = selling.trim() ? stockNumber(selling, 2) : null;
  const receive = receiveValues(
    quantity,
    hideCost ? "" : cost,
    packSize,
    unitMode,
    hideCost ? undefined : item.product.purchasePrice,
  );
  const invalidDates = !!(purchaseDate && expiry && purchaseDate > expiry);
  const disabled =
    busy || offline || phase === "uncertain" || phase === "complete";
  const validReceive =
    !!receive && (!selling.trim() || price != null) && !invalidDates;
  const execute = async (kind: "remove" | "set" | "receive") => {
    if (!shop || disabled || lock.current) return;
    if (
      kind === "remove" &&
      (!perms.canAdjustStock ||
        amount == null ||
        amount <= 0 ||
        amount > item.quantity ||
        !reason)
    )
      return;
    if (
      kind === "set" &&
      (!perms.canEditProducts ||
        setAmount == null ||
        setAmount === item.quantity)
    )
      return;
    if (kind === "receive" && (!perms.canEditProducts || !validReceive)) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    let writingStock = false;
    try {
      api.assertSession();
      if (kind === "receive") {
        if (!progress.current.received) {
          writingStock = true;
          await api.addBatch(shop.id, item.productId, {
            ...receive,
            ...(batchNumber.trim() ? { batchNumber: batchNumber.trim() } : {}),
            ...(purchaseDate ? { purchaseDate } : {}),
            ...(expiry ? { expiryDate: expiry } : {}),
            ...(supplier.trim() ? { supplier: supplier.trim() } : {}),
          });
          api.assertSession();
          progress.current.received = true;
          writingStock = false;
          setPhase("followup");
        }
        if (!progress.current.priced) {
          if (selling.trim() && price !== item.product.sellingPrice)
            await api.updateProduct(shop.id, item.productId, {
              sellingPrice: price,
            });
          api.assertSession();
          progress.current.priced = true;
        }
        if (!progress.current.stocked) {
          if (buyListItemId)
            await api.updateBuyList(shop.id, buyListItemId, {
              status: "stocked",
              productId: item.productId,
            });
          api.assertSession();
          progress.current.stocked = true;
        }
      } else {
        writingStock = true;
        if (kind === "remove")
          await api.removeStock(
            shop.id,
            item.productId,
            amount!,
            reason,
            note.trim() || undefined,
          );
        else await api.updateQuantity(shop.id, item.id, setAmount!, hideCost);
        writingStock = false;
      }
      setPhase("complete");
      await onDone();
    } catch (e) {
      setError(e);
      if (writingStock) setPhase("uncertain");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const receiveLocked = phase !== "ready" || disabled;
  return (
    <section
      className="product-editor"
      aria-label={t(
        mode === "batch" ? "scanner.tab_stock" : "adjust.title",
        mode === "batch" ? "Add stock" : "Adjust stock",
      )}
    >
      <h2>
        {t(
          mode === "batch" ? "scanner.tab_stock" : "adjust.title",
          mode === "batch" ? "Add stock" : "Adjust stock",
        )}
      </h2>
      <Notice error={error} />
      {phase === "uncertain" ? (
        <p role="alert">
          {t(
            "productsweb.check_stock",
            "The result is not confirmed. Refresh and check stock and activity before trying another adjustment.",
          )}
        </p>
      ) : null}
      {phase === "followup" ? (
        <p role="status">
          {t(
            "productsweb.received_followup",
            "Stock has been received. Finish the price or buy-list update below; stock will not be added again.",
          )}
        </p>
      ) : null}
      {mode === "batch" ? (
        <>
          <fieldset disabled={receiveLocked}>
            <div className="product-editor-fields">
              {packSize && packSize > 0 ? (
                <Field label={t("productsweb.receive_as", "Receive as")}>
                  <select
                    className="shop-field"
                    value={unitMode}
                    onChange={(e) => {
                      setUnitMode(e.target.value as "unit" | "pack");
                      setCost("");
                    }}
                  >
                    <option value="unit">{item.unit}</option>
                    <option value="pack">
                      {item.product.packLabel ||
                        t("modal.add_product.pack_default_label", "pack")}{" "}
                      · {formatQty(packSize, item.unit)}
                    </option>
                  </select>
                </Field>
              ) : null}
              <Field
                label={
                  t("modal.add_batch.quantity_label", "Quantity") +
                  " · " +
                  (unitMode === "pack"
                    ? item.product.packLabel ||
                      t("modal.add_product.pack_default_label", "pack")
                    : item.unit)
                }
              >
                <input
                  className="shop-field"
                  inputMode="decimal"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Field>
              {!hideCost ? (
                <Field
                  label={
                    t(
                      "modal.add_batch.purchase_price_label",
                      "Purchase price",
                    ) +
                    " / " +
                    (unitMode === "pack"
                      ? item.product.packLabel ||
                        t("modal.add_product.pack_default_label", "pack")
                      : item.unit)
                  }
                >
                  <input
                    className="shop-field"
                    inputMode="decimal"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </Field>
              ) : null}
              <Field
                label={t("modal.add_batch.batch_number_label", "Batch number")}
              >
                <input
                  className="shop-field"
                  value={batchNumber}
                  maxLength={100}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </Field>
              <Field
                label={t(
                  "modal.add_product.purchase_date_label",
                  "Purchase date",
                )}
              >
                <input
                  className="shop-field"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </Field>
              <Field
                label={t("modal.add_product.expiry_date_label", "Expiry date")}
              >
                <input
                  className="shop-field"
                  type="date"
                  min={purchaseDate || undefined}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </Field>
              <SupplierField value={supplier} onChange={setSupplier} />
              <Field
                label={t(
                  "productsweb.new_price",
                  "New selling price (optional)",
                )}
              >
                <input
                  className="shop-field"
                  inputMode="decimal"
                  value={selling}
                  onChange={(e) => setSelling(e.target.value)}
                />
              </Field>
            </div>
          </fieldset>
          {receive ? (
            <p className="product-receive-total">
              {t("productsweb.stock_in", "Stock to receive")}{" "}
              <strong>{formatQty(receive.quantity, item.unit)}</strong>
            </p>
          ) : null}
          <Button
            disabled={disabled || !validReceive}
            onClick={() => void execute("receive")}
          >
            {t(
              phase === "followup"
                ? "productsweb.finish_receiving"
                : "productsweb.confirm_receive",
              phase === "followup"
                ? "Finish remaining updates"
                : "Confirm stock received",
            )}
          </Button>
        </>
      ) : (
        <>
          <p className="shop-hint">
            {t("adjust.in_stock", "{{n}} {{unit}} in stock", {
              n: item.quantity,
              unit: item.unit,
            })}
          </p>
          <div className="product-editor-fields">
            <Field label={t("adjust.remove_qty", "Remove quantity")}>
              <input
                className="shop-field"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={disabled}
              />
            </Field>
            <Field label={t("adjust.reason_label", "Reason")}>
              <select
                className="shop-field"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={disabled}
              >
                <option value="">
                  {t("productsweb.choose_reason", "Choose a reason")}
                </option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {t("adjust.reason." + r, r.replaceAll("_", " "))}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("adjust.note_placeholder", "Note (optional)")}>
              <input
                className="shop-field"
                value={note}
                maxLength={1000}
                onChange={(e) => setNote(e.target.value)}
                disabled={disabled}
              />
            </Field>
          </div>
          <div className="shop-actions">
            <Button
              tone="danger"
              disabled={
                disabled ||
                !perms.canAdjustStock ||
                amount == null ||
                amount <= 0 ||
                amount > item.quantity ||
                !reason
              }
              onClick={() => void execute("remove")}
            >
              {t("adjust.confirm", "Remove {{n}} {{unit}}", {
                n: amount ?? 0,
                unit: item.unit,
              })}
            </Button>
            <Button
              tone="ghost"
              disabled={
                disabled || amount == null || amount <= 0 || !perms.canSell
              }
              onClick={() => onSell(amount!)}
            >
              {t("adjust.sold_instead", "I sold it — make a bill")}
            </Button>
          </div>
          {perms.canEditProducts ? (
            <details className="product-correction">
              <summary>
                {t("productsweb.correct_count", "Correct the on-hand count")}
              </summary>
              <p className="shop-hint">
                {t(
                  "productsweb.count_hint",
                  "Enter the total you counted. This replaces the recorded on-hand quantity.",
                )}
              </p>
              <Field label={t("productsweb.counted", "Counted quantity")}>
                <input
                  className="shop-field"
                  inputMode="decimal"
                  value={absolute}
                  onChange={(e) => setAbsolute(e.target.value)}
                  disabled={disabled}
                />
              </Field>
              <Button
                disabled={
                  disabled || setAmount == null || setAmount === item.quantity
                }
                onClick={() => void execute("set")}
              >
                {t("common.save", "Save")}
              </Button>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}
export function ProductBatchEditor({
  batch,
  onSave,
  disabled,
}: {
  batch: StockBatch;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  disabled: boolean;
}) {
  const { hideCost, t } = useShop();
  const [number, setNumber] = useState(batch.batchNumber ?? ""),
    [supplier, setSupplier] = useState(batch.supplier ?? ""),
    [purchase, setPurchase] = useState(batch.purchaseDate?.slice(0, 10) ?? ""),
    [expiry, setExpiry] = useState(batch.expiryDate?.slice(0, 10) ?? ""),
    [cost, setCost] = useState(
      batch.purchasePrice == null ? "" : String(batch.purchasePrice),
    );
  const body: Record<string, unknown> = {};
  if (number !== (batch.batchNumber ?? "")) body.batchNumber = number;
  if (supplier !== (batch.supplier ?? "")) body.supplier = supplier || null;
  if (purchase !== (batch.purchaseDate?.slice(0, 10) ?? ""))
    body.purchaseDate = purchase || null;
  if (expiry !== (batch.expiryDate?.slice(0, 10) ?? ""))
    body.expiryDate = expiry || null;
  if (
    !hideCost &&
    cost !== (batch.purchasePrice == null ? "" : String(batch.purchasePrice))
  )
    body.purchasePrice = cost.trim() ? stockNumber(cost, 2) : null;
  return (
    <div className="product-editor-fields">
      <Field label={t("modal.add_batch.batch_number_label", "Batch number")}>
        <input
          className="shop-field"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </Field>
      <SupplierField value={supplier} onChange={setSupplier} />
      <Field
        label={t("modal.add_product.purchase_date_label", "Purchase date")}
      >
        <input
          className="shop-field"
          type="date"
          value={purchase}
          onChange={(e) => setPurchase(e.target.value)}
        />
      </Field>
      <Field label={t("modal.add_product.expiry_date_label", "Expiry date")}>
        <input
          className="shop-field"
          type="date"
          value={expiry}
          min={purchase || undefined}
          onChange={(e) => setExpiry(e.target.value)}
        />
      </Field>
      {!hideCost ? (
        <Field
          label={t("modal.add_batch.purchase_price_label", "Purchase price")}
        >
          <input
            className="shop-field"
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </Field>
      ) : null}
      <Button
        disabled={
          disabled ||
          !Object.keys(body).length ||
          !!(cost.trim() && stockNumber(cost, 2) == null) ||
          !!(purchase && expiry && purchase > expiry)
        }
        onClick={() => void onSave(body)}
      >
        {t("productsweb.save_batch", "Save batch details")}
      </Button>
      <p className="shop-hint">
        {t(
          "productsweb.batch_quantity_hint",
          "Use Adjust stock to correct quantities. Batch edits change the details only.",
        )}
      </p>
    </div>
  );
}
