"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useShop } from "../context";
import { Button, Card, PageHeader, Notice, Pill } from "../ui";
import { TaxHistoryRows, TaxHistoryRefresh, useProductTaxHistory } from "../product-tax-history";
import {
  TaxFields,
  TextField,
  Check,
  Section,
  useGstText,
  useFiscalDate,
  FiscalDateTimeField,
} from "../gst-ui";
import {
  useGstQuery,
  useGstPages,
  useGstAction,
  ReadState,
  More,
  GstAccess,
} from "../gst-workspace";
import {
  saveFile,
  financialScope,
  retainRequest,
  requestStatus,
  assertScope,
} from "../../../lib/shop/gst-storage";
import { validateProductTax } from "../../../lib/shop/gst-core/gst";
import { canonicalJson } from "../../../lib/shop/gst-core/sale-request-canonical";
import type { ProductTax, TaxHistory } from "../../../lib/shop/gst-types";
export function GstProductsScreen() {
  const { api, shop } = useShop(),
    text = useGstText(),
    action = useGstAction();
  const q = useGstQuery(["product-tax-catalog"], () =>
    api.getAllInventory(shop!.id),
  );
  const [search, setSearch] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [config, setConfig] = useState<ProductTax | null>(null),
    [content, setContent] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  const retained = useRef<{ clientId: string; content: string } | null>(null);
  const rows =
    q.data?.filter((r) =>
      r.product.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("Review product GST in bulk")}
          back={{ href: "/shop/products", label: text("Products") }}
          description={text(
            "Choose only products with the same reviewed classification, HSN/SAC and rate. Existing invoices keep their original tax profiles.",
          )}
        />
        {action.notice}
        <Section title={text("Import / export product GST")}>
          <div className="shop-actions">
            {["json", "csv"].map((format) => (
              <Button
                key={format}
                tone="ghost"
                disabled={action.busy}
                onClick={() =>
                  void action.run(async () => {
                    const file = await api.gst.exportTax(shop!.id, format);
                    saveFile(
                      file.content,
                      `samaan-product-tax.${format}`,
                      format === "json" ? "application/json" : "text/csv",
                    );
                  })
                }
              >
                {text(
                  format === "json"
                    ? "Export GST review file"
                    : "Export GST review CSV",
                )}
              </Button>
            ))}
          </div>
          <label className="shop-label">
            {text("Select reviewed JSON / CSV file")}
            <input
              className="shop-field"
              type="file"
              accept=".json,.csv"
              disabled={!!retained.current || action.busy}
              onChange={(e) =>
                void e.target.files?.[0]?.text().then((s) => {
                  setContent(s);
                  setConfirmed(false);
                })
              }
            />
          </label>
          {content ? (
            <>
              <p>
                {text(
                  "Review the file before applying. Keep CSV columns and text prefixes intact. Up to 100 products per import.",
                )}
              </p>
              <Check
                label={text(
                  "I have reviewed the imported classifications and rates.",
                )}
                checked={confirmed}
                onChange={setConfirmed}
              />
              <Button
                disabled={action.busy || !confirmed}
                onClick={() =>
                  void action.run(async () => {
                    const input = retained.current ?? {
                      clientId: crypto.randomUUID(),
                      content,
                    };
                    retained.current = input;
                    await api.gst.importTax(shop!.id, input);
                    retained.current = null;
                    setContent("");
                    setConfirmed(false);
                    await q.refetch();
                  })
                }
              >
                {text(
                  retained.current
                    ? "Retry saved import"
                    : "Apply reviewed file",
                )}
              </Button>
            </>
          ) : null}
        </Section>
        <div className="gst-two-columns">
          <div>
            <TextField
              label={text("Search products")}
              value={search}
              onChange={setSearch}
            />
            <p className="shop-hint">
              {selected.length}/100 · {text("products selected")}
            </p>
            <ReadState query={q}>
              {rows.map((row) => (
                <label key={row.productId} className="gst-choice">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.productId)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, row.productId].slice(0, 100)
                          : selected.filter((id) => id !== row.productId),
                      )
                    }
                  />
                  <span>
                    <b>{row.product.name}</b>
                    <small>
                      {row.product.gstConfig
                        ? `${row.product.gstConfig.codeType.toUpperCase()} ${row.product.gstConfig.code} · ${row.product.gstConfig.rate}%`
                        : text("Tax details missing")}
                    </small>
                  </span>
                  <Link href={"/shop/products/" + row.productId + "/gst"}>
                    {text("History")}
                  </Link>
                </label>
              ))}
            </ReadState>
          </div>
          <Card>
            <TaxFields value={config} onChange={setConfig} />
            <Button
              disabled={action.busy || !selected.length || !config?.reviewed}
              onClick={() =>
                void action.run(async () => {
                  validateProductTax(config!);
                  await api.gst.bulkTax(shop!.id, selected, config!);
                  setSelected([]);
                  await q.refetch();
                })
              }
            >
              {text("Apply to selected products")}
            </Button>
          </Card>
        </div>
      </div>
    </GstAccess>
  );
}
export function GstProductHistoryScreen({ id }: { id: string }) {
  const { api, shop } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    action = useGstAction();
  const q = useProductTaxHistory(id);
  const settings = useGstQuery(["settings"], () =>
    api.getPosSettings(shop!.id),
  );
  const [config, setConfig] = useState<ProductTax | null>(null),
    [effective, setEffective] = useState(""),
    [source, setSource] = useState(""),
    [reason, setReason] = useState(""),
    [cancelReason, setCancelReason] = useState("");
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  const retained = useRef<{
    path: string;
    input: Record<string, unknown>;
  } | null>(null);
  async function submit(path: string, input: Record<string, unknown>) {
    const original = retained.current ?? { path, input };
    retained.current = original;
    const active = financialScope(shop!.id),
      requestId = String(original.input.requestId);
    await retainRequest({
      ...active,
      id: requestId,
      path: original.path,
      payload: original.input,
      createdAt: new Date().toISOString(),
      state: "pending",
    });
    const result = await api.gst.post(original.path, original.input);
    assertScope(active);
    const receipt = result as {
      version?: string;
      effectiveAt?: string;
      config?: ProductTax;
      cancellationId?: string;
    };
    const cancelling = original.path.endsWith("/cancel");
    if (cancelling) {
      const version = original.path.split("/").at(-2);
      if (receipt.version !== version || receipt.cancellationId !== requestId)
        throw Error(text("The saved response could not be verified."));
    } else {
      const expected = {
        ...(original.input.config as ProductTax),
        version: requestId,
      };
      if (
        receipt.version !== requestId ||
        receipt.effectiveAt !==
          new Date(String(original.input.effectiveFrom)).toISOString() ||
        canonicalJson(receipt.config) !== canonicalJson(expected)
      )
        throw Error(text("The saved response could not be verified."));
    }
    await requestStatus(requestId, { state: "confirmed", result });
    retained.current = null;
    await q.refetch();
  }
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={text("Tax profile history")}
          back={{ href: "/shop/products/" + id, label: text("Product") }}
          description={text(
            "Existing invoices keep their original classification and rate.",
          )}
        />
        {action.notice}
        <TaxHistoryRefresh query={q} />
        {retained.current ? <Button disabled={action.busy} onClick={() => void action.run(() => submit(retained.current!.path, retained.current!.input))}>{text("Retry saved request")}</Button> : null}
        <ReadState query={q} empty={!rows.length}>
          <TaxHistoryRows rows={rows} capture={q.capture} action={row => row.scheduled && !row.cancelledAt && row.effectiveAt && Date.parse(row.effectiveAt) > Date.now() ? (
            <div className="grid gap-3"><TextField label={text("Cancellation reason")} value={cancelReason} onChange={setCancelReason} /><Button tone="danger" disabled={action.busy || !q.historyFresh || !!retained.current || !cancelReason.trim()} onClick={() => void action.run(() => submit(
              `/api/shops/${shop!.id}/inventory/products/${id}/tax-schedules/${row.id}/cancel`,
              { requestId: crypto.randomUUID(), reason: cancelReason },
            ))}>{text("Cancel scheduled change")}</Button></div>
          ) : null} />
        </ReadState>
        <More query={q} />
        {settings.data?.gstRspProfileReviewsAvailable &&
        rows.some(
          (r) =>
            (q.capture?.effectiveVersion === undefined ? r.current : r.id === q.capture.effectiveVersion) &&
            r.valid && !r.draft && !r.disabled &&
            r.config?.codeType === "hsn" &&
            /^(21069020|2401\d{4}|2402\d{4}|2403\d{4}|24041100|24041900)$/.test(
              r.config.code,
            ) &&
            !["24031921", "24031929"].includes(r.config.code),
        ) ? (
          <Button href={"/shop/products/" + id + "/gst/rsp"} tone="ghost">
            {text("RSP product review")}
          </Button>
        ) : null}
        {settings.data?.gstTaxSchedulingAvailable ? (
          <Section title={text("Schedule a tax profile change")}>
            <fieldset disabled={!!retained.current || action.busy}>
              <TaxFields value={config} onChange={setConfig} />
              <FiscalDateTimeField
                label={text("Effective")}
                value={effective}
                onChange={setEffective}
              />
              <TextField
                label={text("Source reference")}
                value={source}
                onChange={setSource}
              />
              <TextField
                label={text("Reason")}
                value={reason}
                onChange={setReason}
              />
            </fieldset>
            <Button
              disabled={
                action.busy || !!retained.current ||
                (!retained.current &&
                  (!q.historyFresh ||
                    !config?.reviewed ||
                    !source.trim() ||
                    !reason.trim() ||
                    !Number.isFinite(Date.parse(effective)) || Date.parse(effective) <= Date.now()))
              }
              onClick={() =>
                void action.run(() =>
                  submit(
                    `/api/shops/${shop!.id}/inventory/products/${id}/tax-schedules`,
                    {
                      requestId: crypto.randomUUID(),
                      config,
                      effectiveFrom: effective,
                      expectedVersion: q.capture?.effectiveVersion === undefined ? q.capture?.currentVersion ?? "" : q.capture.effectiveVersion ?? "",
                      sourceReference: source,
                      reason,
                    },
                  ),
                )
              }
            >
              {text("Save scheduled tax change")}
            </Button>
          </Section>
        ) : null}
      </div>
    </GstAccess>
  );
}
