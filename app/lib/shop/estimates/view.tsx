import { useEffect, useState, type ReactNode } from "react";
import type { OpeningUi } from "../openings/view";
import {
  emptyEstimate,
  estimateExpired,
  estimateText,
  type Estimate,
  type EstimateDraft,
} from "./contract";
import type { useEstimates } from "./workflow";
type T = (key: string, vars?: Record<string, string | number>) => string;
export function EstimatesView({
  w,
  ui,
  t,
  uuid,
  initialDraft,
  share,
  prepare,
  openSale,
  hasCart,
  renderDocument,
}: {
  w: ReturnType<typeof useEstimates>;
  ui: OpeningUi;
  t: T;
  uuid: () => string;
  initialDraft?: EstimateDraft;
  share: (text: string) => Promise<void>;
  prepare: (p: Estimate) => Promise<void>;
  openSale: (id: string) => void;
  hasCart: boolean;
  renderDocument: (
    data: NonNullable<ReturnType<typeof useEstimates>["document"]["data"]>,
  ) => ReactNode;
}) {
  const { Box, Text, Button, Input, Check, Busy } = ui,
    p = w.order,
    [editing, setEditing] = useState(!!initialDraft),
    [d, setDraft] = useState<EstimateDraft>(initialDraft ?? emptyEstimate),
    [review, setReview] = useState(false),
    [replace, setReplace] = useState(false),
    [note, setNote] = useState(""),
    [message, setMessage] = useState("");
  const blocked = w.busy || !!w.pending || !w.ready,
    expired = p ? estimateExpired(p) : false;
  useEffect(() => {
    setReview(false);
    setReplace(false);
    setNote("");
    w.setPreview(false);
  }, [p?.id, p?.version]);
  const patch = (v: Partial<EstimateDraft>) => {
      setDraft((o) => ({ ...o, ...v }));
      setReview(false);
    },
    line = (id: string, v: Partial<EstimateDraft["lines"][number]>) =>
      patch({ lines: d.lines.map((l) => (l.id === id ? { ...l, ...v } : l)) });
  const run = (a: Parameters<typeof w.run>[0]) =>
    w.run(a).then((r) => {
      if (r) setMessage(t("estimates.saved"));
      return r;
    });
  const err = (error: unknown) => {
    const raw =
      (error as any)?.code ?? (error as any)?.message ?? "estimates_failed";
    return t(
      "estimates.error." +
        ([
          "invalid",
          "amount",
          "phone",
          "customer",
          "products",
          "not_allowed",
          "not_found",
          "conflict",
          "stale",
          "state",
          "tax",
          "expired",
          "reason",
          "changed",
          "in_progress",
          "stock",
          "unavailable",
          "storage",
          "checkout_pending",
          "cart_changed",
          "confirmation_pending",
        ].find((k) => "estimates_" + k === raw) ?? "failed"),
    );
  };
  if (!w.allowed) return <Text tone="danger">{t("estimates.online")}</Text>;
  return (
    <Box>
      <Text tone="muted">{t("estimates.intro")}</Text>
      {w.busy || w.list.isPending || w.options.isPending ? (
        <Busy label={t("common.loading")} />
      ) : null}
      {w.error || w.list.error || w.options.error ? (
        <Box card>
          <Text tone="danger" live>
            {err({
              code: w.error || ((w.list.error ?? w.options.error) as any)?.code,
            })}
          </Text>
          <Button
            label={t("common.retry")}
            onPress={() => {
              if (!w.ready) w.reloadStorage();
              void w.list.refetch();
              void w.options.refetch();
            }}
          />
        </Box>
      ) : null}
      {w.pending ? (
        <Box card>
          <Text>{t("estimates.pending")}</Text>
          <Button
            label={t("estimates.retry")}
            disabled={w.busy}
            onPress={() =>
              void w.run().then((r) => {
                if (r) setEditing(false);
              })
            }
          />
        </Box>
      ) : null}
      {message ? <Text live>{message}</Text> : null}
      {editing ? (
        <>
          <Text heading>{t("estimates.editor")}</Text>
          <Text tone="muted">{t("estimates.cart_unchanged")}</Text>
          <Input
            label={t("estimates.customer")}
            value={d.customerName}
            onChange={(customerName) =>
              patch({ customerName, customerId: null })
            }
            disabled={blocked}
          />
          <Input
            label={t("estimates.phone")}
            value={d.customerPhone}
            onChange={(customerPhone) =>
              patch({ customerPhone, customerId: null })
            }
            disabled={blocked}
          />
          <Input
            label={t("estimates.valid_until")}
            value={d.validUntil}
            type="date"
            onChange={(validUntil) => patch({ validUntil })}
            disabled={blocked}
          />
          <Input
            label={t("estimates.note")}
            value={d.note}
            onChange={(note) => patch({ note })}
            multiline
            disabled={blocked}
          />
          <Input
            label={t("estimates.search")}
            value={w.search}
            onChange={w.setSearch}
            disabled={blocked}
          />
          {w.options.data?.products.slice(0, 8).map((x) => (
            <Button
              key={x.id}
              label={"+ " + x.name + " · ₹" + x.price}
              disabled={
                blocked ||
                d.lines.some((l) => l.productId === x.id) ||
                d.lines.length >= 100
              }
              onPress={() =>
                patch({
                  lines: [
                    ...d.lines,
                    {
                      id: uuid(),
                      productId: x.id,
                      name: x.name,
                      unit: x.unit,
                      quantity: "1",
                      price: x.price,
                      discount: "0",
                    },
                  ],
                })
              }
            />
          ))}
          {w.options.data &&
          (w.options.data.more || w.options.data.products.length > 8) ? (
            <Text tone="muted">{t("estimates.more_products")}</Text>
          ) : null}
          {d.lines.map((l) => (
            <Box card key={l.id}>
              <Text heading>{l.name}</Text>
              <Text tone="muted">{l.unit}</Text>
              <Input
                label={t("estimates.quantity")}
                type="decimal"
                value={l.quantity}
                onChange={(quantity) => line(l.id, { quantity })}
                disabled={blocked}
              />
              <Input
                label={t("estimates.price")}
                type="decimal"
                value={l.price}
                onChange={(price) => line(l.id, { price })}
                disabled={blocked}
              />
              <Input
                label={t("estimates.discount")}
                type="decimal"
                value={l.discount}
                onChange={(discount) => line(l.id, { discount })}
                disabled={blocked}
              />
              <Button
                label={t("estimates.remove")}
                onPress={() =>
                  patch({ lines: d.lines.filter((x) => x.id !== l.id) })
                }
                disabled={blocked}
              />
            </Box>
          ))}
          <Input
            label={t("estimates.bill_discount")}
            value={d.billDiscount}
            type="decimal"
            onChange={(billDiscount) => patch({ billDiscount })}
            disabled={blocked}
          />
          <Button
            primary
            label={t("estimates.save_draft")}
            disabled={blocked || !d.lines.length}
            onPress={() =>
              void run(
                p && p.status === "draft"
                  ? { kind: "save", id: p.id, version: p.version, draft: d }
                  : { kind: "create", draft: d },
              ).then((r) => {
                if (r) setEditing(false);
              })
            }
          />
          <Button
            label={t("common.cancel")}
            onPress={() => setEditing(false)}
            disabled={blocked}
          />
        </>
      ) : p ? (
        <>
          <Button
            label={t("estimates.all")}
            onPress={() => w.setOrder(null)}
            disabled={blocked}
          />
          <Box card>
            <Text heading>{p.number || t("estimates.status.draft")}</Text>
            <Text>{p.shopName}</Text>
            {p.draft.customerName ? <Text>{p.draft.customerName}</Text> : null}
            <Text tone="accent">
              {t(
                "estimates.status." +
                  (expired && ["issued", "accepted"].includes(p.status)
                    ? "expired"
                    : p.status),
              )}
            </Text>
            {p.draft.validUntil ? (
              <Text>
                {t("estimates.valid_until") + ": " + p.draft.validUntil}
              </Text>
            ) : null}
            <Text tone="danger">{t("estimates.not_invoice")}</Text>
          </Box>
          {p.lines.map((l) => (
            <Box card key={l.id}>
              <Text heading>{l.name}</Text>
              <Text>{l.quantity + " " + l.unit + " × ₹" + l.price}</Text>
              {Number(l.discount) ? (
                <Text>{t("estimates.discount") + ": ₹" + l.discount}</Text>
              ) : null}
            </Box>
          ))}
          {p.supported === false ? (
            <Text tone="danger">{t("estimates.error.tax")}</Text>
          ) : null}
          <Box card>
            <Text>
              {t("estimates.bill_discount") + ": ₹" + p.draft.billDiscount}
            </Text>
            <Text>{t("estimates.tax") + ": ₹" + p.tax}</Text>
            <Text heading>{t("estimates.total") + ": ₹" + p.total}</Text>
            {p.draft.note ? <Text>{p.draft.note}</Text> : null}
          </Box>
          {p.status === "draft" ? (
            <>
              <Button
                label={t("estimates.edit")}
                onPress={() => {
                  setDraft(p.draft);
                  setEditing(true);
                }}
                disabled={blocked}
              />
              <Check
                label={t("estimates.issue_review")}
                value={review}
                onChange={setReview}
                disabled={blocked}
              />
              <Button
                primary
                label={t("estimates.issue")}
                disabled={blocked || !review}
                onPress={() =>
                  void run({ kind: "issue", id: p.id, version: p.version })
                }
              />
            </>
          ) : null}
          {p.number ? (
            <>
              <Button
                label={t("estimates.share")}
                disabled={blocked}
                onPress={() =>
                  void run({
                    kind: "share",
                    id: p.id,
                    version: p.version,
                  }).then(async (r) => {
                    if (r)
                      try {
                        await share(estimateText(r, t));
                        setMessage(t("estimates.share_prepared"));
                      } catch {
                        setMessage(t("estimates.share_cancelled"));
                      }
                  })
                }
              />
              <Button
                label={t("estimates.document")}
                onPress={() => w.setPreview(!w.preview)}
                disabled={blocked}
              />
            </>
          ) : null}
          {w.preview && w.document.isPending ? (
            <Busy label={t("common.loading")} />
          ) : null}
          {w.preview && w.document.error ? (
            <Text tone="danger">{err(w.document.error)}</Text>
          ) : null}
          {w.preview && w.document.data
            ? renderDocument(w.document.data)
            : null}
          {w.readiness.data?.changes.map((c, i) => (
            <Text
              key={i}
              tone={["price", "name"].includes(c.kind) ? "muted" : "danger"}
            >
              {t("estimates.change." + c.kind, {
                name: c.name,
                agreed: c.agreed ?? "",
                current: c.current ?? "",
              })}
            </Text>
          ))}
          {["issued", "accepted"].includes(p.status) ? (
            <Button
              label={t("estimates.refresh")}
              onPress={() => void w.readiness.refetch()}
              disabled={blocked}
            />
          ) : null}
          {p.status === "issued" && !expired ? (
            <>
              <Input
                label={t("estimates.acceptance")}
                value={note}
                onChange={setNote}
                disabled={blocked}
              />
              <Button
                label={t("estimates.accept")}
                onPress={() =>
                  void run({
                    kind: "accept",
                    id: p.id,
                    version: p.version,
                    note,
                  })
                }
                disabled={blocked || !note.trim()}
              />
              <Button
                label={t("estimates.decline")}
                onPress={() =>
                  void run({ kind: "decline", id: p.id, version: p.version })
                }
                disabled={blocked || !!p.intent}
              />
            </>
          ) : null}
          {p.status === "accepted" && !expired ? (
            <>
              <Text tone="muted">{t("estimates.convert_help")}</Text>
              {p.intent ? (
                <Text tone="muted">{t("estimates.intent_help")}</Text>
              ) : null}
              {hasCart ? (
                <Check
                  label={t("estimates.replace_cart")}
                  value={replace}
                  onChange={setReplace}
                  disabled={blocked}
                />
              ) : null}
              <Button
                primary
                label={t(p.intent ? "estimates.resume" : "estimates.convert")}
                disabled={
                  blocked ||
                  (hasCart && !replace) ||
                  !w.readiness.data ||
                  w.readiness.data.blocked
                }
                onPress={() =>
                  void (async () => {
                    try {
                      const deviceId = await w.device(),
                        r = await run({
                          kind: "reserve",
                          id: p.id,
                          version: p.version,
                          deviceId,
                        });
                      if (r) await prepare(r);
                    } catch (e) {
                      setMessage(err(e));
                    }
                  })()
                }
              />
              {p.intent?.phase === "reserved" ? (
                <>
                  <Input
                    label={t("estimates.release_reason")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  <Button
                    label={t("estimates.release")}
                    disabled={blocked || !note.trim()}
                    onPress={() =>
                      void run({
                        kind: "release",
                        id: p.id,
                        version: p.version,
                        note,
                      })
                    }
                  />
                </>
              ) : null}
            </>
          ) : null}
          {p.status === "converted" && p.saleId ? (
            <Button
              primary
              label={t("estimates.open_bill")}
              onPress={() => openSale(p.saleId!)}
              disabled={blocked}
            />
          ) : null}
          {!["converted", "revised"].includes(p.status) &&
          p.intent?.phase !== "started" ? (
            <>
              <Input
                label={t("estimates.revision_reason")}
                value={note}
                onChange={setNote}
                disabled={blocked}
              />
              <Button
                label={t("estimates.revise")}
                disabled={blocked || !note.trim()}
                onPress={() =>
                  void run({
                    kind: "revise",
                    id: p.id,
                    version: p.version,
                    note,
                  }).then((r) => {
                    if (r) {
                      setDraft(r.draft);
                      setEditing(true);
                    }
                  })
                }
              />
            </>
          ) : null}
          {["draft", "issued", "accepted"].includes(p.status) && !p.intent ? (
            <Button
              label={t("estimates.cancel")}
              onPress={() =>
                void run({ kind: "cancel", id: p.id, version: p.version })
              }
              disabled={blocked}
            />
          ) : null}
          <Text heading>{t("estimates.history")}</Text>
          {p.events.map((e, i) => (
            <Text tone="muted" key={i}>
              {t("estimates.event." + e.kind) +
                " · " +
                new Date(e.at).toLocaleString(undefined, {
                  timeZone: "Asia/Kolkata",
                }) +
                (e.note ? " · " + e.note : "")}
            </Text>
          ))}
        </>
      ) : (
        <>
          <Button
            primary
            label={t("estimates.new")}
            onPress={() => {
              setDraft(emptyEstimate());
              setEditing(true);
            }}
            disabled={blocked}
          />
          {w.list.data?.items.map((p) => (
            <Box card key={p.id}>
              <Text heading>{p.number || t("estimates.status.draft")}</Text>
              <Text>{p.draft.customerName || p.shopName}</Text>
              <Text tone="accent">
                {t(
                  "estimates.status." +
                    (estimateExpired(p) &&
                    ["issued", "accepted"].includes(p.status)
                      ? "expired"
                      : p.status),
                )}
              </Text>
              <Text>{"₹" + p.total}</Text>
              <Button
                label={t("estimates.open")}
                onPress={() => void w.open(p.id)}
                disabled={blocked}
              />
            </Box>
          ))}
          {w.list.data?.items.length === 0 ? (
            <Text>{t("estimates.empty")}</Text>
          ) : null}
          <Box row>
            {w.offset > 0 ? (
              <Button
                label={t("estimates.previous")}
                onPress={() => w.setOffset(w.offset - 30)}
                disabled={blocked}
              />
            ) : null}
            {w.list.data?.more ? (
              <Button
                label={t("estimates.more")}
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
