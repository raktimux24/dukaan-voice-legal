"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BarcodeRequest } from "../../../lib/shop/barcodes/contract";
import { useBarcodes } from "../../../lib/shop/barcodes/workflow";
import { barcodeErrorKey } from "../../../lib/shop/barcodes/client";
import { useShop } from "../context";
import { ProductBarcodeCard } from "../product-barcode";
import { Button, Card, Field, PageHeader, Spinner, inputClass } from "../ui";
export function ProductBarcodesScreen() {
  const { api, shop, userId, perms, offline, t: translate } = useShop(),
    params = useSearchParams(),
    productId = params.get("productId");
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(key, key, vars);
  const w = useBarcodes(
    api.barcodes,
    { shopId: shop?.id ?? "", actorId: userId ?? "" },
    perms.canEditProducts,
  );
  const [review, setReview] = useState<BarcodeRequest | null>(null);
  const reviewPanel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (review) {
      reviewPanel.current?.focus();
      reviewPanel.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [review]);
  const [search, setSearch] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [limit, setLimit] = useState(40),
    [replace, setReplace] = useState(false),
    [value, setValue] = useState(""),
    [reason, setReason] = useState("");
  useEffect(() => {
    setReview(null);
    setSelected([]);
    setSearch("");
    setReplace(false);
    setValue("");
    setReason("");
  }, [shop?.id, userId, productId]);
  const items = w.metadata.data?.items ?? [],
    single = items.find((i) => i.id === productId),
    filtered = items.filter(
      (i) =>
        i.active &&
        (!productId || i.id === productId) &&
        (!search ||
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.value?.toLowerCase().includes(search.toLowerCase())),
    ),
    visible = filtered.slice(0, limit),
    blocked = w.busy || !!w.pending || offline || !!review;
  const ids = selected.filter((id) =>
    items.some((i) => i.id === id && i.active && !i.value),
  );
  useEffect(() => {
    if (productId && single && !single.value) setSelected([productId]);
  }, [productId, single?.value]);
  const generate = () =>
    setReview({
      clientId: crypto.randomUUID(),
      kind: "generate",
      productIds: ids,
    });
  const replaceCode = () => {
    if (single?.value)
      setReview({
        clientId: crypto.randomUUID(),
        kind: "replace",
        productId: single.id,
        expectedBarcode: single.value,
        value,
        reason,
      });
  };
  const problem = w.error ?? w.metadata.error;
  if (!shop) return <Spinner />;
  return (
    <div className="shop-page">
      <PageHeader
        title={t("barcodes.title")}
        description={t("barcodes.help")}
        back={{
          href: productId ? "/shop/products/" + productId : "/shop/products",
          label: translate("products.title", "Products"),
        }}
      />
      <Card>
        <p className="shop-hint">{t("barcodes.internal_help")}</p>
        <p className="shop-hint mt-3">{t("barcodes.online_help")}</p>
      </Card>
      {!perms.canEditProducts ? (
        <Card>
          <p>{t("barcodes.error.not_allowed")}</p>
        </Card>
      ) : (
        <>
          {review ? (
            <div
              ref={reviewPanel}
              role="alertdialog"
              aria-label={t(
                review.kind === "generate"
                  ? "barcodes.generate"
                  : "barcodes.replace",
              )}
              tabIndex={-1}
            >
              <Card className="stack-form">
                <h2 className="shop-section-title">
                  {t(
                    review.kind === "generate"
                      ? "barcodes.generate"
                      : "barcodes.replace",
                  )}
                </h2>
                <p>
                  {review.kind === "generate"
                    ? t("barcodes.generate_confirm", {
                        count: review.productIds.length,
                      })
                    : t("barcodes.replace_confirm", {
                        name: single?.name ?? "",
                      })}
                </p>
                {review.kind === "replace" ? (
                  <p className="break-all font-semibold">{review.value}</p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button
                    tone="ghost"
                    disabled={w.busy}
                    onClick={() => setReview(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    disabled={w.busy || offline}
                    onClick={() => {
                      const input = review;
                      setReview(null);
                      void w.apply(input);
                    }}
                  >
                    {t(
                      review.kind === "generate"
                        ? "barcodes.generate"
                        : "barcodes.replace_save",
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}
          {problem ? (
            <Card>
              <div role="alert">
                <p>{t(barcodeErrorKey(problem))}</p>
              </div>
              <Button
                tone="ghost"
                disabled={w.busy || offline}
                onClick={() => {
                  if (w.pending) void w.recover();
                  else void w.refresh();
                }}
              >
                {t(w.pending ? "barcodes.check_result" : "barcodes.refresh")}
              </Button>
            </Card>
          ) : null}
          {w.pending && !w.busy ? (
            <p role="status">{t("barcodes.uncertain")}</p>
          ) : null}
          {w.outcome ? (
            <Card>
              <h2 role="status" className="shop-section-title">
                {t("barcodes.saved")}
              </h2>
              <p>
                {t("barcodes.result", {
                  generated: w.outcome.generated,
                  preserved: w.outcome.preserved,
                  replaced: w.outcome.replaced,
                })}
              </p>
            </Card>
          ) : null}
          {w.metadata.isFetching || w.busy ? (
            <Spinner label={t(w.busy ? "barcodes.busy" : "common.loading")} />
          ) : null}
          {w.metadata.data?.conflicts.length && !productId ? (
            <Card>
              <h2 className="shop-section-title">{t("barcodes.conflicts")}</h2>
              <p className="shop-hint">{t("barcodes.conflict_help")}</p>
              {w.metadata.data.conflicts.map((c) => (
                <div key={c.value} className="mt-3">
                  <p className="break-all">
                    {t("barcodes.shared_code", {
                      value: c.value,
                      count: c.products.length,
                    })}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {c.products.map((p) => (
                      <Button
                        key={p.id}
                        tone="ghost"
                        href={"/shop/products/barcodes?productId=" + p.id}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          ) : null}
          <Card className="stack-form">
            {!productId ? (
              <>
                <Field label={t("barcodes.search")}>
                  <input
                    className={inputClass}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setLimit(40);
                    }}
                  />
                </Field>
                <Button
                  tone="ghost"
                  disabled={blocked}
                  onClick={() =>
                    setSelected(
                      [
                        ...new Set([
                          ...selected,
                          ...visible.filter((i) => !i.value).map((i) => i.id),
                        ]),
                      ].slice(0, w.metadata.data?.limit ?? 100),
                    )
                  }
                >
                  {t("barcodes.select_missing")}
                </Button>
              </>
            ) : null}
            <p aria-live="polite">
              {t("barcodes.selection", {
                count: ids.length,
                limit: w.metadata.data?.limit ?? 100,
              })}
            </p>
            <div className="flex flex-wrap gap-3">
              {ids.length ? (
                <Button
                  tone="ghost"
                  disabled={blocked}
                  onClick={() => setSelected([])}
                >
                  {t("barcodes.clear_selection")}
                </Button>
              ) : null}
              <Button disabled={blocked || !ids.length} onClick={generate}>
                {t(w.busy ? "barcodes.busy" : "barcodes.generate_selected", {
                  count: ids.length,
                })}
              </Button>
            </div>
          </Card>
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            {visible.map((item) => (
              <section key={item.id} className="min-w-0">
                <h2 className="shop-section-title mb-3">{item.name}</h2>
                {!item.value ? (
                  <label className="import-confirm">
                    <input
                      type="checkbox"
                      checked={ids.includes(item.id)}
                      disabled={blocked}
                      aria-label={t("barcodes.select_product", {
                        name: item.name,
                      })}
                      onChange={() =>
                        setSelected((v) =>
                          v.includes(item.id)
                            ? v.filter((id) => id !== item.id)
                            : v.length < (w.metadata.data?.limit ?? 100)
                              ? [...v, item.id]
                              : v,
                        )
                      }
                    />
                    <span>{t("barcodes.missing")}</span>
                  </label>
                ) : null}
                <ProductBarcodeCard
                  productId={item.id}
                  item={item}
                  manage={!productId}
                />
              </section>
            ))}
          </div>
          {!visible.length && !w.metadata.isFetching ? (
            <p>{t("barcodes.empty")}</p>
          ) : null}
          {visible.length < filtered.length ? (
            <Button tone="ghost" onClick={() => setLimit((v) => v + 40)}>
              {t("barcodes.more")}
            </Button>
          ) : null}
          {single?.value ? (
            <Card className="stack-form">
              <Button
                tone="ghost"
                disabled={blocked}
                onClick={() => setReplace((v) => !v)}
              >
                {t("barcodes.replace")}
              </Button>
              {replace ? (
                <>
                  <p className="shop-hint">
                    {t(
                      single.conflict
                        ? "barcodes.conflict_help"
                        : "barcodes.replace_help",
                    )}
                  </p>
                  <Field label={t("barcodes.new_code")}>
                    <input
                      className={inputClass}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      disabled={blocked}
                      maxLength={100}
                    />
                  </Field>
                  <Field label={t("barcodes.reason")}>
                    <textarea
                      className={inputClass}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={blocked}
                      maxLength={500}
                    />
                  </Field>
                  <Button
                    disabled={
                      blocked ||
                      !value.trim() ||
                      value === single.value ||
                      reason.trim().length < 5
                    }
                    onClick={replaceCode}
                  >
                    {t("barcodes.replace_save")}
                  </Button>
                </>
              ) : null}
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
