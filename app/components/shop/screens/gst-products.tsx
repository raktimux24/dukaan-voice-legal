"use client";
import {ProductImageById} from "../product-image";
import { useState, useRef } from "react";
import Link from "next/link";
import { useShop } from "../context";
import { Button, Card, Chip, PageHeader, Notice, Pill } from "../ui";
import { useSearchParams } from "next/navigation";
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
function useTaxConfirmation() {
  const {api,shop,role,userId}=useShop();
  const authorization=useGstQuery(["product-tax-authorizations",role],()=>api.getProductTaxAuthorizations(shop!.id),role==="MANAGER");
  return role==="OWNER"||(role==="MANAGER"&&!authorization.isFetching&&!authorization.error&&!!authorization.data?.managers.find(row=>row.managerId===userId)?.authorization?.authorized);
}
export function GstProductsScreen() {
  const { api, shop, offline, role, userId, t } = useShop(),
    text = useGstText(),
    action = useGstAction();
  const q = useGstQuery(["product-tax-catalog"], () =>
    api.getAllInventory(shop!.id),
  );
  const canConfirm = useTaxConfirmation();
  const [search, setSearch] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [config, setConfig] = useState<ProductTax | null>(null),
    [content, setContent] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    params = useSearchParams(),
    [missingOnly, setMissingOnly] = useState(params.get("filter") === "missing"),
    [applied, setApplied] = useState(0);
  const retained = useRef<{ clientId: string; content: string } | null>(null);
  const rows =
    q.data?.filter((r) =>
      r.product.name.toLowerCase().includes(search.toLowerCase()) &&
      (!missingOnly || !r.product.gstConfig),
    ) ?? [];
  const missingCount = q.data?.filter((r) => !r.product.gstConfig).length ?? 0;
  return (
    <GstAccess>
      <div className="shop-page gst-workspace gst-product-workspace">
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
                disabled={offline || action.busy}
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
                disabled={offline || !canConfirm || action.busy || !confirmed}
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
        <div className="gst-product-columns">
          <div>
            <TextField
              label={text("Search products")}
              value={search}
              onChange={setSearch}
            />
            <div className="gst-product-filters" role="group" aria-label={text("Search products")}>
              <Chip active={!missingOnly} onClick={() => setMissingOnly(false)}>{t("common.all", "All")}</Chip>
              <Chip active={missingOnly} onClick={() => setMissingOnly(true)}>{text("Tax details missing")} · {missingCount}</Chip>
            </div>
            <p className="shop-hint">
              {selected.length}/100 · {text("products selected")}
              {rows.length ? <>
                {" "}·{" "}
                <button type="button" className="shop-section-link gst-select-shown" disabled={action.busy} onClick={() => setSelected([...new Set([...selected, ...rows.map((r) => r.productId)])].slice(0, 100))}>
                  {t("gstweb.select_shown", "Select shown (up to 100)")}
                </button>
              </> : null}
            </p>
            <p className="shop-hint">{t("gstweb.hsn_hint", "HSN is the tax code printed on your supplier’s bill for the same item.")}</p>
            {applied ? <p role="status" className="gst-action-success">{t("gstweb.bulk_saved", "GST saved for {n} products.", { n: applied })}</p> : null}
            <ReadState query={q} empty={!rows.length} emptyText={missingOnly ? t("gstweb.none_missing", "Every product has tax details.") : undefined}>
              {rows.map((row) => (
                <label key={row.productId} className="gst-choice">
                  <input
                    type="checkbox"
                    disabled={action.busy}
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
                    <b className="flex items-center gap-3"><ProductImageById productId={row.productId} name={row.product.name} size={40}/>{row.product.name}</b>
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
          <Card className="gst-product-editor stack-form">
            {!canConfirm ? <p role="status" className="shop-hint">{t("gst.product_confirmation_requires_authorization", "Owner authorization is required to confirm product tax.")}</p> : null}
            <fieldset disabled={offline || action.busy || !canConfirm}><TaxFields value={config} onChange={setConfig} /></fieldset>
            <Button
              disabled={offline || !canConfirm || action.busy || !selected.length || !config?.reviewed}
              onClick={() =>
                void action.run(async () => {
                  validateProductTax(config!);
                  setApplied(0);
                  await api.gst.bulkTax(shop!.id, selected, config!);
                  setApplied(selected.length);
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
  const { api, shop, offline } = useShop(),
    text = useGstText(),
    date = useFiscalDate(),
    action = useGstAction();
  const canConfirm = useTaxConfirmation();
  const q = useProductTaxHistory(id);
  const settings = useGstQuery(["settings"], () =>
    api.getPosSettings(shop!.id),
  );
  const [config, setConfig] = useState<ProductTax | null>(null),
    [effective, setEffective] = useState(""),
    [source, setSource] = useState(""),
    [reason, setReason] = useState(""),
    [cancelReasons, setCancelReasons] = useState<Record<string,string>>({});
  const rows = q.data?.pages.flatMap((p) => p.items) ?? [];
  const effectiveVersion = q.capture?.effectiveVersion === undefined ? q.capture?.currentVersion : q.capture.effectiveVersion;
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
      <div className="shop-page gst-workspace gst-product-workspace">
        <PageHeader
          title={text("Tax profile history")}
          back={{ href: "/shop/products/" + id, label: text("Product") }}
          description={text(
            "Existing invoices keep their original classification and rate.",
          )}
        />
        {action.notice}
        <TaxHistoryRefresh query={q} />
        {retained.current ? <Button disabled={offline || action.busy} onClick={() => void action.run(() => submit(retained.current!.path, retained.current!.input))}>{text("Retry saved request")}</Button> : null}
        <ReadState query={q} empty={!rows.length}>
          <TaxHistoryRows rows={rows} capture={q.capture} action={row => row.scheduled && !row.cancelledAt && row.effectiveAt && Date.parse(row.effectiveAt) > Date.now() ? (
            <div className="grid gap-3"><TextField label={text("Cancellation reason")} value={cancelReasons[row.id] ?? ""} onChange={value=>setCancelReasons(current=>({...current,[row.id]:value}))} /><Button tone="danger" disabled={offline || action.busy || !q.historyFresh || !!retained.current || !cancelReasons[row.id]?.trim()} onClick={() => void action.run(() => submit(
              `/api/shops/${shop!.id}/inventory/products/${id}/tax-schedules/${row.id}/cancel`,
              { requestId: crypto.randomUUID(), reason: cancelReasons[row.id] },
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
            <fieldset className="stack-form" disabled={!canConfirm || offline || !!retained.current || action.busy}>
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
                offline || action.busy || !!retained.current ||
                (!retained.current &&
                  (!canConfirm || !q.historyFresh || !effectiveVersion ||
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
                      expectedVersion: effectiveVersion ?? "",
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
