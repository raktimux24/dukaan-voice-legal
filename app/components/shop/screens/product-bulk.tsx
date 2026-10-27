"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useProductBulk,
  validBulkDraft,
} from "../../../lib/shop/product-bulk/workflow";
import {
  BULK_PRICE_MODES,
  bulkCounts,
  type BulkChanges,
  type BulkValues,
  type BulkSelection,
} from "../../../lib/shop/product-bulk/contract";
import { bulkErrorKey } from "../../../lib/shop/product-bulk/client";
import { labeledL1, labeledL2 } from "../../../lib/shop/catalog";
import { useShop } from "../context";
import { Button, Card, Field, PageHeader, Spinner, inputClass } from "../ui";
export function ProductBulkScreen() {
  const { api, shop, userId, perms, offline, t: translate } = useShop(),
    params = useSearchParams();
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(key, key, vars);
  const w = useProductBulk(
    api.productBulk,
    { shopId: shop?.id ?? "", actorId: userId ?? "" },
    perms.canEditProducts,
    () => crypto.randomUUID(),
  );
  const [confirmed, setConfirmed] = useState(false),
    [limit, setLimit] = useState(40);
  const initialized = useRef("");
  useEffect(() => {
    setConfirmed(false);
    setLimit(40);
  }, [w.job?.id, w.job?.version]);
  useEffect(() => {
    const scope = shop?.id + ":" + userId+":"+params.toString();
    if (!shop || !userId || !w.meta.isSuccess || initialized.current === scope)
      return;
    initialized.current = scope;
    const id = params.get("jobId");
    if (id) {
      void w.open(id);
      return;
    }
    try {
      const ids = params.get("ids"),
        matching = params.get("matching");
      if (ids) void w.start({ ids: JSON.parse(ids) });
      else if (matching) void w.start({ matching: JSON.parse(matching) });
    } catch {}
  }, [shop?.id, userId, w.meta.isSuccess, params]);
  const job = w.job,
    blocked = w.busy || !!w.pending || offline,
    counts = job ? bulkCounts(job) : { changed: 0, errors: 0 },
    problem = w.error ?? w.meta.error;
  const edit = (partial: Partial<BulkChanges>) => {
    w.setDraft((d) => ({ ...d, ...partial }));
    setConfirmed(false);
  };
  const fieldLabel = (f: string) => t("bulk.field." + f);
  const display = (f: string, v: unknown, category?: string) =>
    v === "__mixed__"
      ? t("bulk.mixed")
      : v === null || v === undefined
        ? t("bulk.none")
        : f === "category"
          ? labeledL1(String(v), (k) => translate(k, k))
          : f === "subcategory"
            ? labeledL2(category ?? "", String(v), (k) => translate(k, k))
            : f === "depletionOrder"
              ? t(v === "fifo" ? "bulk.fifo" : "bulk.expiry")
              : String(v);
  const remove = (f: keyof BulkChanges) => {
    w.setDraft((d) => {
      const next = { ...d };
      delete next[f];
      return next;
    });
    setConfirmed(false);
  };
  const toggle = (f: keyof BulkChanges, checked: boolean) => {
    if (!checked) {
      remove(f);
      return;
    }
    edit(
      f === "category"
        ? { category: { category: "", subcategory: "" } }
        : f === "minStockLevel"
          ? { minStockLevel: 0 }
          : f === "depletionOrder"
            ? { depletionOrder: "expiry" }
            : { [f]: { mode: "set", value: "" } },
    );
  };
  if (!shop) return <Spinner />;
  return (
    <div className="shop-page bulk-editor">
      <PageHeader
        title={t("bulk.title")}
        description={t("bulk.help")}
        back={{
          href: params.get("returnTo")?.startsWith("/shop/products?")
            ? params.get("returnTo")!
            : "/shop/products",
          label: translate("products.title", "Products"),
        }}
      />
      <Card className="stack-form">
        <p className="shop-hint">{t("bulk.protected")}</p>
        <p className="shop-hint">{t("bulk.cart_help")}</p>
        <p className="shop-hint">
          {t("bulk.batch_help", { limit: w.meta.data?.batchSize ?? 500 })}
        </p>
        <Button tone="ghost" href="/shop/products/gst">
          {t("bulk.gst_link")}
        </Button>
      </Card>
      {!perms.canEditProducts ? (
        <Card>
          <p>{t("bulk.error.not_allowed")}</p>
        </Card>
      ) : (
        <>
          {problem ? (
            <Card>
              <div role="alert">{t(bulkErrorKey(problem))}</div>
              <Button
                tone="ghost"
                disabled={w.busy || offline}
                onClick={() =>
                  w.pending
                    ? void w.recover()
                    : job
                      ? void w.open(job.id)
                      : void w.meta.refetch()
                }
              >
                {t(w.pending ? "bulk.recover" : "common.retry")}
              </Button>
            </Card>
          ) : null}
          {w.pending && !w.busy ? (
            <p role="status">{t("bulk.uncertain")}</p>
          ) : null}
          {w.busy || w.meta.isFetching ? (
            <Spinner label={t("bulk.busy")} />
          ) : null}
          {job ? (
            <>
              <Card className="stack-form">
                <h2 className="shop-section-title">
                  {t("bulk.batch", {
                    batch: job.batch,
                    batches: job.batches,
                    total: job.total,
                  })}
                </h2>
                <p>
                  {t("bulk.completed", {
                    done: job.completed.length,
                    batches: job.batches,
                  })}
                </p>
                {job.state === "applied" ? (
                  <div role="status">
                    <h3>{t("bulk.saved")}</h3>
                    {job.completed.map((r) => (
                      <p key={r.batch}>
                        {t("bulk.saved_count", {
                          count: r.changed,
                          batch: r.batch,
                        })}
                      </p>
                    ))}
                  </div>
                ) : null}
                {(
                  [
                    "category",
                    "sellingPrice",
                    "mrp",
                    "minStockLevel",
                    "depletionOrder",
                  ] as const
                ).map((f) => (
                  <section key={f} className="border-t border-white/10 pt-4">
                    <label className="import-confirm">
                      <input
                        type="checkbox"
                        disabled={blocked || !w.next}
                        checked={w.draft[f] !== undefined}
                        onChange={(e) => toggle(f, e.target.checked)}
                      />
                      <span>{t("bulk.change", { field: fieldLabel(f) })}</span>
                    </label>
                    <p className="shop-hint mb-3">
                      {t("bulk.current", { value: display(f, job.summary[f]) })}{" "}
                      ·{" "}
                      {w.draft[f] === undefined
                        ? t("bulk.keep")
                        : fieldLabel(f)}
                    </p>
                    {f === "category" && w.draft.category ? (
                      <div className="form-grid is-2">
                        <Field label={fieldLabel("category")}>
                          <select
                            className={inputClass}
                            disabled={blocked || !w.next}
                            value={w.draft.category.category}
                            onChange={(e) =>
                              edit({
                                category: {
                                  category: e.target.value,
                                  subcategory: "",
                                },
                              })
                            }
                          >
                            <option value="">{t("bulk.choose")}</option>
                            {w.meta.data?.categories.map((c) => (
                              <option key={c.code} value={c.code}>
                                {display("category", c.code)}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label={fieldLabel("subcategory")}>
                          <select
                            className={inputClass}
                            disabled={blocked || !w.next}
                            value={w.draft.category.subcategory}
                            onChange={(e) =>
                              edit({
                                category: {
                                  category: w.draft.category!.category,
                                  subcategory: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="">{t("bulk.choose")}</option>
                            {w.meta.data?.categories
                              .find(
                                (c) => c.code === w.draft.category?.category,
                              )
                              ?.children.map((code) => (
                                <option key={code} value={code}>
                                  {display(
                                    "subcategory",
                                    code,
                                    w.draft.category?.category,
                                  )}
                                </option>
                              ))}
                          </select>
                        </Field>
                      </div>
                    ) : null}
                    {(f === "sellingPrice" || f === "mrp") && w.draft[f] ? (
                      <div className="form-grid is-2">
                        <Field
                          label={t("bulk.operation") + " · " + fieldLabel(f)}
                        >
                          <select
                            className={inputClass}
                            disabled={blocked || !w.next}
                            value={w.draft[f]!.mode}
                            onChange={(e) =>
                              edit({
                                [f]: { ...w.draft[f]!, mode: e.target.value },
                              })
                            }
                          >
                            {BULK_PRICE_MODES.map((mode) => (
                              <option key={mode} value={mode}>
                                {t("bulk.mode." + mode)}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label={t("bulk.value") + " · " + fieldLabel(f)}>
                          <input
                            className={inputClass}
                            inputMode="decimal"
                            disabled={blocked || !w.next}
                            value={w.draft[f]!.value}
                            onChange={(e) =>
                              edit({
                                [f]: { ...w.draft[f]!, value: e.target.value },
                              })
                            }
                          />
                        </Field>
                      </div>
                    ) : null}
                    {f === "minStockLevel" &&
                    w.draft.minStockLevel !== undefined ? (
                      <Field label={fieldLabel(f)}>
                        <input
                          className={inputClass}
                          inputMode="numeric"
                          disabled={blocked || !w.next}
                          value={
                            Number.isNaN(w.draft.minStockLevel)
                              ? ""
                              : String(w.draft.minStockLevel)
                          }
                          onChange={(e) =>
                            edit({
                              minStockLevel:
                                e.target.value === ""
                                  ? NaN
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                    ) : null}
                    {f === "depletionOrder" && w.draft.depletionOrder ? (
                      <Field label={fieldLabel(f)}>
                        <select
                          className={inputClass}
                          disabled={blocked || !w.next}
                          value={w.draft.depletionOrder}
                          onChange={(e) =>
                            edit({
                              depletionOrder: e.target.value as
                                | "fifo"
                                | "expiry",
                            })
                          }
                        >
                          <option value="expiry">{t("bulk.expiry")}</option>
                          <option value="fifo">{t("bulk.fifo")}</option>
                        </select>
                      </Field>
                    ) : null}
                  </section>
                ))}
                <p className="shop-hint">{t("bulk.rounding")}</p>
                <Button
                  disabled={blocked || !w.next || !validBulkDraft(w.draft)}
                  onClick={() => void w.review()}
                >
                  {t(job.state === "applied" ? "bulk.next" : "bulk.preview")}
                </Button>
              </Card>
              {job.rows.length ? (
                <Card className="stack-form">
                  <h2 className="shop-section-title">{t("bulk.review")}</h2>
                  <p>{t("bulk.counts", counts)}</p>
                  {job.rows.slice(0, limit).map((row) => (
                    <div key={row.id} className="border-t border-white/10 py-3">
                      <h3 className="font-semibold">{row.name}</h3>
                      {row.fields.length ? (
                        <dl className="mt-2 space-y-2">
                          {row.fields.map((f) => (
                            <div key={f}>
                              <dt className="shop-hint">{fieldLabel(f)}</dt>
                              <dd className="break-words">
                                {display(f, row.before[f], row.before.category)}{" "}
                                → {display(f, row.after[f], row.after.category)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        <p className="shop-hint">{t("bulk.no_changes")}</p>
                      )}
                      {row.issues.map((issue) => (
                        <p
                          key={issue}
                          className="text-danger mt-2"
                          role="alert"
                        >
                          {t("bulk.error." + issue)}
                        </p>
                      ))}
                    </div>
                  ))}
                  {limit < job.rows.length ? (
                    <Button
                      tone="ghost"
                      onClick={() => setLimit((v) => v + 50)}
                    >
                      {t("bulk.more")}
                    </Button>
                  ) : null}
                  {job.state !== "applied" ? (
                    <>
                      <Button
                        tone="ghost"
                        disabled={blocked || !validBulkDraft(w.draft)}
                        onClick={() => void w.review(true)}
                      >
                        {t("bulk.refresh")}
                      </Button>
                      <p className="shop-hint">{t("bulk.refresh_help")}</p>
                      <label className="import-confirm">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          disabled={
                            blocked ||
                            counts.errors > 0 ||
                            job.state !== "review"
                          }
                          onChange={(e) => setConfirmed(e.target.checked)}
                        />
                        <span>{t("bulk.confirm")}</span>
                      </label>
                      <Button
                        disabled={
                          blocked ||
                          !confirmed ||
                          job.state !== "review" ||
                          counts.errors > 0 ||
                          !counts.changed ||
                          JSON.stringify(w.draft) !==
                            JSON.stringify(job.changes)
                        }
                        onClick={() => void w.apply()}
                      >
                        {t("bulk.apply")}
                      </Button>
                    </>
                  ) : null}
                </Card>
              ) : null}
            </>
          ) : null}
          <Card className="stack-form">
            <h2 className="shop-section-title">{t("bulk.history")}</h2>
            {w.meta.data?.jobs.length ? (
              w.meta.data.jobs.map((j) => (
                <Button
                  key={j.id}
                  tone="ghost"
                  disabled={blocked}
                  onClick={() => void w.open(j.id)}
                >
                  {j.createdAt.slice(0, 10)} · {t("bulk.history_item", j)}
                </Button>
              ))
            ) : (
              <p className="shop-hint">{t("bulk.no_history")}</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
