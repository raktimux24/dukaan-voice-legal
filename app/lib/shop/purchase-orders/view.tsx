import { useEffect, useState } from "react";
import type { OpeningUi } from "../openings/view";
import {
  poRemaining,
  poUnits,
  poShareText,
  type PoDraft,
  type PoReceiptLine,
  type PurchaseOrder,
} from "./contract";
import type { usePurchaseOrders } from "./workflow";
type T = (key: string, vars?: Record<string, string | number>) => string;
const empty = (): PoDraft => ({
  supplierId: "",
  expectedDate: "",
  notes: "",
  lines: [],
});
export function PurchaseOrdersView({
  w,
  ui,
  t,
  uuid,
  share,
  invoice,
  newSupplier,
  newProduct,
  initialBuyListId,
  initialSupplierId,
  openForm = true,
  onCreate,
  onShowList,
}: {
  w: ReturnType<typeof usePurchaseOrders>;
  ui: OpeningUi;
  t: T;
  uuid: () => string;
  share: (text: string) => Promise<void>;
  invoice: (p: PurchaseOrder, receipt: string) => Promise<void> | void;
  newSupplier: () => void;
  newProduct: () => void;
  initialBuyListId?: string;
  initialSupplierId?: string;
  openForm?: boolean;
  onCreate?: () => void;
  onShowList?: () => void;
}) {
  const { Box, Text, Button, Input, Check, Busy, Select } = ui,
    p = w.order,
    options = w.options.data;
  const [editing, setEditing] = useState(openForm || !!initialSupplierId),
    [d, setDraft] = useState<PoDraft>(() => ({
      ...empty(),
      supplierId: initialSupplierId ?? "",
    })),
    [reviewed, setReviewed] = useState(false),
    [receiving, setReceiving] = useState(false),
    [receipts, setReceipts] = useState<Omit<PoReceiptLine, "batchId">[]>([]),
    [reference, setReference] = useState(""),
    [reason, setReason] = useState(""),
    [closing, setClosing] = useState(false),
    [message, setMessage] = useState(""),
    [initial, setInitial] = useState(false);
  const blocked = w.busy || !!w.pending || !w.ready;
  useEffect(() => {
    setReceiving(false);
    setClosing(false);
    setReviewed(false);
    setReason("");
    setMessage("");
  }, [p?.id, p?.version]);
  const start = (draft?: PoDraft) => {
    setDraft(draft ?? empty());
    setEditing(true);
    setReviewed(false);
    setMessage("");
  };
  useEffect(() => {
    if (!initial && initialBuyListId && options) {
      const b = options.buyList.find((b) => b.id === initialBuyListId);
      if (b) {
        setInitial(true);
        start({
          ...empty(),
          lines: [
            {
              id: uuid(),
              buyListItemId: b.id,
              productId: b.productId ?? undefined,
              name: b.name,
              unit: b.unit ?? "",
              quantity: poUnits(
                Math.max(0, Number(b.quantity ?? 1) - Number(b.committed)),
              ),
              price: "",
            },
          ],
        });
      }
    }
  }, [options, initialBuyListId, initial]);
  const patch = (value: Partial<PoDraft>) => {
    setDraft((old) => ({ ...old, ...value }));
    setReviewed(false);
  };
  const linePatch = (id: string, patch: Partial<PoDraft["lines"][number]>) =>
    patchDraft(d.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const patchDraft = (lines: PoDraft["lines"]) => patch({ lines });
  const unit = (value: string) =>
    t("unit_picker." + value) === "unit_picker." + value
      ? value
      : t("unit_picker." + value);
  if (!w.allowed) return <Text tone="danger">{t("po.online_role")}</Text>;
  return (
    <Box>
      <Text tone="muted">{t("po.intro")}</Text>
      {w.busy || w.list.isPending || w.options.isPending ? (
        <Busy label={t("common.loading")} />
      ) : null}
      {w.error || w.list.error || w.options.error ? (
        <Box card>
          <Text tone="danger" live>
            {t(
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
                ].find(
                  (k) =>
                    "po_" + k ===
                    (w.error ||
                      ((w.list.error ?? w.options.error) as any)?.code),
                ) ?? "failed"),
            )}
          </Text>
          <Button
            label={t("common.retry")}
            onPress={() => {
              void w.list.refetch();
              void w.options.refetch();
            }}
          />
        </Box>
      ) : null}
      {!w.ready&&!w.error ? <Busy label={t("common.loading")}/> : null}
      {w.pending ? (
        <Box card>
          <Text>{t("po.pending")}</Text>
          <Button
            label={t("po.retry_saved")}
            onPress={() => void w.run()}
            disabled={w.busy}
          />
        </Box>
      ) : null}
      {message ? (
        <Text tone="accent" live>
          {message}
        </Text>
      ) : null}
      {editing ? (
        <>
          <Text heading>{t(p ? "po.edit" : "po.new")}</Text>
          <Text heading>{t("po.supplier")}</Text>
          {Select ? (
            <Select
              label={t("po.choose_supplier")}
              value={d.supplierId}
              disabled={blocked || !options}
              onChange={(supplierId) => patch({ supplierId })}
              options={[
                { value: "", label: t("po.choose_supplier") },
                ...(options?.suppliers ?? []).map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
          ) : (
            options?.suppliers.map((s) => (
              <Check
                key={s.id}
                label={s.name}
                value={d.supplierId === s.id}
                onChange={() => patch({ supplierId: s.id })}
                disabled={blocked}
              />
            ))
          )}
          {options && options.suppliers.length === 0 ? (
            <Text tone="muted">{t("po.no_suppliers")}</Text>
          ) : null}
          {d.supplierId ? (
            <Text tone="accent">
              {t("po.supplier_selected", {
                name:
                  options?.suppliers.find((s) => s.id === d.supplierId)?.name ??
                  p?.supplier.name ??
                  "",
              })}
            </Text>
          ) : null}
          <Input
            label={t("po.search")}
            value={w.search}
            onChange={w.setSearch}
            disabled={blocked}
          />
          <Button
            label={t("po.manage_suppliers")}
            onPress={newSupplier}
            disabled={blocked}
          />
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
            onChange={(notes) => patch({ notes })}
            multiline
            disabled={blocked}
          />
          <Text heading>{t("po.from_buy_list")}</Text>
          {options?.buyList.slice(0, 12).map((b) => {
            const selected = d.lines.some((l) => l.buyListItemId === b.id),
              remaining = Math.max(
                0,
                Number(b.quantity ?? 1) - Number(b.committed),
              );
            return (
              <Check
                key={b.id}
                label={`${b.name} · ${t("po.available", { qty: poUnits(remaining) })} ${unit(b.unit ?? "")}`}
                value={selected}
                disabled={blocked || (remaining <= 0 && !selected)}
                onChange={(v) =>
                  patchDraft(
                    v
                      ? [
                          ...d.lines,
                          {
                            id: uuid(),
                            buyListItemId: b.id,
                            productId: b.productId ?? undefined,
                            name: b.name,
                            unit: b.unit ?? "",
                            quantity: poUnits(remaining),
                            price: "",
                          },
                        ]
                      : d.lines.filter((l) => l.buyListItemId !== b.id),
                  )
                }
              />
            );
          })}
          <Text heading>{t("po.add_product")}</Text>
          {options?.products.slice(0, 8).map((product) => (
            <Button
              key={product.id}
              label={"+ " + product.name}
              disabled={blocked || d.lines.length >= 100}
              onPress={() =>
                patchDraft([
                  ...d.lines,
                  {
                    id: uuid(),
                    productId: product.id,
                    name: product.name,
                    unit: product.unit,
                    quantity: "1",
                    price: product.price,
                  },
                ])
              }
            />
          ))}
          {options &&
          (options.more ||
            options.products.length > 8 ||
            options.suppliers.length > 8 ||
            options.buyList.length > 12) ? (
            <Text tone="muted">{t("po.refine_search")}</Text>
          ) : null}
          {d.lines.map((l) => (
            <Box card key={l.id}>
              <Text heading>{l.name}</Text>
              <Text tone="muted">{unit(l.unit)}</Text>
              <Input
                label={t("po.quantity")}
                type="decimal"
                value={l.quantity}
                onChange={(quantity) => linePatch(l.id, { quantity })}
                disabled={blocked}
              />
              {!l.productId&&!options?.buyList.find(b=>b.id===l.buyListItemId)?.unit ? (
                <Input
                  label={t("po.unit")}
                  value={l.unit}
                  onChange={(unit) => linePatch(l.id, { unit })}
                  disabled={blocked}
                />
              ) : null}
              <Input
                label={t("po.estimate")}
                type="decimal"
                value={l.price}
                onChange={(price) => linePatch(l.id, { price })}
                disabled={blocked}
              />
              <Button
                label={t("po.remove")}
                onPress={() => patchDraft(d.lines.filter((x) => x.id !== l.id))}
                disabled={blocked}
              />
            </Box>
          ))}
          <Text tone="muted">{t("po.draft_help")}</Text>
          <Button
            primary
            label={t("po.save_draft")}
            disabled={blocked || !d.supplierId || !d.lines.length}
            onPress={() =>
              void w
                .run(
                  p
                    ? { kind: "save", id: p.id, version: p.version, draft: d }
                    : { kind: "create", draft: d },
                )
                .then((ok) => {
                  if (ok) {
                    setEditing(false);
                    onShowList?.();
                  }
                })
            }
          />
          <Button
            label={t("common.cancel")}
            onPress={() => {
              setEditing(false);
              onShowList?.();
            }}
            disabled={blocked}
          />
        </>
      ) : p ? (
        <>
          <Button
            label={t("po.all_orders")}
            onPress={() => {
              w.setOrder(null);
              setEditing(false);
              onShowList?.();
            }}
            disabled={blocked}
          />
          <Box card>
            <Text heading>{p.number || t("po.status.draft")}</Text>
            <Text>{p.supplier.name}</Text>
            <Text tone="accent">{t("po.status." + p.status)}</Text>
            {p.expectedDate ? (
              <Text>{t("po.expected") + ": " + p.expectedDate}</Text>
            ) : null}
            {p.notes ? <Text>{p.notes}</Text> : null}
          </Box>
          {p.lines.map((l) => (
            <Box card key={l.id}>
              <Text heading>{l.name}</Text>
              <Text>
                {t("po.line_summary", {
                  ordered: l.quantity,
                  received: l.received,
                  remaining: poRemaining(l),
                  unit: unit(l.unit),
                })}
              </Text>
              {Number(l.rejected) > 0 ? (
                <Text tone="muted">
                  {t("po.rejected_total", { qty: l.rejected })}
                </Text>
              ) : null}
              {Number(l.cancelled) > 0 ? (
                <Text tone="muted">
                  {t("po.cancelled_total", { qty: l.cancelled })}
                </Text>
              ) : null}
              {l.price ? (
                <Text>{t("po.estimate") + ": ₹" + l.price}</Text>
              ) : null}
            </Box>
          ))}
          {p.status === "draft" ? (
            <>
              <Button
                label={t("po.edit")}
                onPress={() => start(p)}
                disabled={blocked}
              />
              <Check
                label={t("po.issue_review")}
                value={reviewed}
                onChange={setReviewed}
                disabled={blocked}
              />
              <Button
                primary
                label={t("po.issue")}
                onPress={() =>
                  void w.run({ kind: "issue", id: p.id, version: p.version })
                }
                disabled={blocked || !reviewed}
              />
              <Button
                label={t("po.cancel_draft")}
                onPress={() =>
                  void w.run({ kind: "cancel", id: p.id, version: p.version })
                }
                disabled={blocked}
              />
            </>
          ) : null}
          {p.number ? (
            <Button
              label={t("po.share")}
              disabled={blocked}
              onPress={() =>
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
            />
          ) : null}
          {["issued", "part_received"].includes(p.status) && !receiving ? (
            <Button
              primary
              label={t("po.receive")}
              disabled={blocked}
              onPress={() => {
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
                setReceiving(true);
              }}
            />
          ) : null}
          {receiving ? (
            <Box card>
              <Text heading>{t("po.receive")}</Text>
              <Text tone="muted">{t("po.receipt_help")}</Text>
              <Input
                label={t("po.reference")}
                value={reference}
                onChange={setReference}
                disabled={blocked}
              />
              {receipts.map((r, index) => {
                const l = p.lines.find((l) => l.id === r.lineId)!,
                  update = (patch: Partial<typeof r>) => {
                    setReviewed(false);
                    setReceipts((rows) =>
                      rows.map((x, i) =>
                        i === index ? { ...x, ...patch } : x,
                      ),
                    );
                  };
                return (
                  <Box card key={r.lineId}>
                    <Text heading>{l.name}</Text>
                    <Text>
                      {t("po.remaining", {
                        qty: poRemaining(l),
                        unit: unit(l.unit),
                      })}
                    </Text>
                    {!l.productId ? (
                      <>
                        <Text tone="muted">{t("po.map_help")}</Text>
                        <Input
                          label={t("po.search")}
                          value={w.search}
                          onChange={w.setSearch}
                        />
                        {options?.products
                          .filter((x) => x.unit === l.unit)
                          .map((x) => (
                            <Check
                              key={x.id}
                              label={x.name}
                              value={r.productId === x.id}
                              onChange={() => update({ productId: x.id })}
                              disabled={blocked}
                            />
                          ))}
                        <Button
                          label={t("po.create_product")}
                          onPress={newProduct}
                          disabled={blocked}
                        />
                      </>
                    ) : null}
                    <Input
                      label={t("po.accepted")}
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
                      value={r.expiryDate}
                      type="date"
                      onChange={(expiryDate) => update({ expiryDate })}
                      disabled={blocked}
                    />
                    <Input
                      label={t("po.rejected")}
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
                  </Box>
                );
              })}
              <Check
                label={t("po.receipt_review")}
                value={reviewed}
                onChange={setReviewed}
                disabled={blocked}
              />
              <Button
                primary
                label={t("po.confirm_receipt")}
                disabled={
                  blocked ||
                  !reviewed ||
                  !receipts.some(
                    (r) => Number(r.quantity) > 0 || Number(r.rejected) > 0,
                  )
                }
                onPress={() =>
                  void w
                    .run({
                      kind: "receive",
                      id: p.id,
                      version: p.version,
                      reference,
                      lines: receipts.filter(
                        (r) => Number(r.quantity) > 0 || Number(r.rejected) > 0,
                      ),
                    })
                    .then((ok) => {
                      if (ok) setReceiving(false);
                    })
                }
              />
              <Button
                label={t("common.cancel")}
                onPress={() => setReceiving(false)}
                disabled={blocked}
              />
            </Box>
          ) : null}
          {["issued", "part_received"].includes(p.status) ? (
            <>
              <Button
                label={t("po.close")}
                onPress={() => setClosing(!closing)}
                disabled={blocked}
              />
              {closing ? (
                <Box card>
                  <Text>{t("po.close_help")}</Text>
                  <Input
                    label={t("po.close_reason")}
                    value={reason}
                    onChange={setReason}
                    disabled={blocked}
                  />
                  <Button
                    label={t("po.confirm_close")}
                    disabled={blocked || !reason.trim()}
                    onPress={() =>
                      void w.run({
                        kind: "close",
                        id: p.id,
                        version: p.version,
                        note: reason,
                      })
                    }
                  />
                </Box>
              ) : null}
            </>
          ) : null}
          <Text heading>{t("po.receipt_history")}</Text>
          {p.receipts.map((r) => (
            <Box card key={r.id}>
              <Text>
                {new Date(r.at).toLocaleString(undefined, {
                  timeZone: "Asia/Kolkata",
                })}
              </Text>
              {r.reference ? <Text>{r.reference}</Text> : null}
              {r.lines.map((l) => (
                <Text key={l.lineId}>
                  {p.lines.find((x) => x.id === l.lineId)?.name} ·{" "}
                  {t("po.receipt_summary", {
                    accepted: l.quantity,
                    rejected: l.rejected,
                  })}
                  {l.reason ? " · " + l.reason : ""}
                </Text>
              ))}
              {r.lines.some((l) => l.batchId) ? (
                <Button
                  label={t("po.record_invoice")}
                  onPress={() =>
                    void Promise.resolve(invoice(p, r.id)).catch(() =>
                      setMessage(t("po.invoice_unavailable")),
                    )
                  }
                  disabled={blocked}
                />
              ) : null}
            </Box>
          ))}
          <Text heading>{t("po.history")}</Text>
          {p.events.map((e, i) => (
            <Text key={i} tone="muted">
              {t("po.event." + e.kind)} ·{" "}
              {new Date(e.at).toLocaleString(undefined, {
                timeZone: "Asia/Kolkata",
              })}
              {e.note ? " · " + e.note : ""}
            </Text>
          ))}
        </>
      ) : (
        <>
          {onCreate ? null : (
          <Button
            primary
            label={t("po.new")}
            onPress={() => start()}
            disabled={blocked}
          />
          )}
          {w.list.data?.items.map((p) => (
            <Box card key={p.id}>
              <Text heading>
                {p.number || t("po.status.draft")} · {p.supplier.name}
              </Text>
              <Text>{t("po.status." + p.status)}</Text>
              <Button
                label={t("po.open")}
                onPress={() => void w.open(p.id)}
                disabled={blocked}
              />
            </Box>
          ))}
          {w.list.data?.items.length === 0 ? (
            ui.Empty ? <ui.Empty title={t("po.empty")} actionLabel={t("po.new")} onAction={() => (onCreate ? onCreate() : start())} /> : <Text tone="muted">{t("po.empty")}</Text>
          ) : null}
          <Box row>
            {w.offset > 0 ? (
              <Button
                label={t("po.previous")}
                onPress={() => w.setOffset(w.offset - 30)}
                disabled={blocked}
              />
            ) : null}
            {w.list.data?.more ? (
              <Button
                label={t("po.more")}
                onPress={() => w.setOffset(w.offset + 30)}
                disabled={blocked}
              />
            ) : null}
          </Box>
        </>
      )}
    </Box>
  );
}
