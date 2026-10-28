"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Card, Chip, Field, Pill } from "../ui";
import { useShop } from "../context";
import { commerceUnit } from "../../../lib/shop/commerce/contract";
import {
  estimateExpired,
  estimateToday,
  type Estimate,
} from "../../../lib/shop/estimates/contract";
import {
  estimateItemsReview,
  estimateCustomerIssue,
} from "../../../lib/shop/estimates/editor";
import type {
  EstimateEditorProps,
  EstimateListProps,
} from "../../../lib/shop/estimates/view";
export type ExitGuard = { current: null | (() => boolean) };
function useText() {
  const { t: translate, prefs } = useShop();
  const t = (k: string, v?: Record<string, string | number>) =>
    translate(k, k, v);
  const language = prefs?.appLanguage ?? "en";
  const locale =
    (
      {
        en: "en-IN",
        hi: "hi-IN",
        hinglish: "en-IN",
        ta: "ta-IN",
        te: "te-IN",
        bn: "bn-IN",
        mr: "mr-IN",
        kn: "kn-IN",
        gu: "gu-IN",
        ml: "ml-IN",
      } as Record<string, string>
    )[language] ?? "en-IN";
  return {
    t,
    locale,
    unit: (v: string) =>
      commerceUnit(v) ? t("commerce.unit." + commerceUnit(v)) : v,
    money: (v: string | number) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "INR",
      }).format(Number(v)),
    date: (v: string) =>
      new Date(v.length === 10 ? v + "T12:00:00+05:30" : v).toLocaleDateString(
        locale,
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        },
      ),
  };
}
export function EstimateEditor({
  draft: d,
  patch,
  options,
  searching,
  search,
  setSearch,
  blocked,
  save,
  cancel,
  guard,
}: EstimateEditorProps & { guard: ExitGuard }) {
  const { t, unit, money } = useText(),
    [step, setStep] = useState(1),
    [picker, setPicker] = useState(false),
    [discard, setDiscard] = useState(false),
    [attempted, setAttempted] = useState(false),
    baseline = useRef(JSON.stringify(d));
  const review = estimateItemsReview(d),
    customerIssue = estimateCustomerIssue(d),
    dirty = JSON.stringify(d) !== baseline.current;
  const requestExit = () => {
    if (step === 2) {
      setStep(1);
      return false;
    }
    if (dirty) {
      setDiscard(true);
      return false;
    }
    cancel();
    return true;
  };
  useEffect(() => {
    guard.current = requestExit;
  });
  useEffect(
    () => () => {
      guard.current = null;
    },
    [],
  );
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    const leave = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a");
      if (
        dirty &&
        a &&
        a.origin === location.origin &&
        a.href !== location.href &&
        !window.confirm(t("estimates.mobile.discard_body"))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", leave, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", leave, true);
    };
  }, [dirty, t]);
  const line = (id: string, v: Partial<(typeof d.lines)[number]>) =>
    patch({ lines: d.lines.map((l) => (l.id === id ? { ...l, ...v } : l)) });
  const field = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    kind: "text" | "decimal" | "tel" | "date" = "text",
  ) => (
    <Field label={label}>
      <input
        className="shop-field"
        type={kind === "decimal" ? "text" : kind}
        inputMode={
          kind === "decimal" ? "decimal" : kind === "tel" ? "tel" : undefined
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={blocked}
      />
    </Field>
  );
  return (
    <>
      <div className="estimate-steps" aria-label={t("estimates.editor")}>
        <button
          type="button"
          aria-current={step === 1 ? "step" : undefined}
          onClick={() => setStep(1)}
        >
          <span>1</span>
          {t("estimates.mobile.items")}
        </button>
        <span aria-hidden>→</span>
        <button
          type="button"
          aria-current={step === 2 ? "step" : undefined}
          disabled={!review.valid}
          onClick={() => setStep(2)}
        >
          <span>2</span>
          {t("estimates.mobile.details")}
        </button>
      </div>
      <div className="estimate-editor-layout">
        <Card className="estimate-main">
          <div className="estimate-section-head">
            <div>
              <h2>
                {t(
                  step === 1
                    ? "estimates.mobile.items"
                    : "estimates.mobile.details",
                )}
              </h2>
              <p className="estimate-muted">
                {t(
                  step === 1
                    ? "estimates.mobile.items_hint"
                    : "estimates.mobile.details_hint",
                )}
              </p>
            </div>
            {step === 1 && (
              <Button
                tone="ghost"
                disabled={blocked || d.lines.length >= 100}
                onClick={() => setPicker(true)}
              >
                ＋ {t("estimates.mobile.add")}
              </Button>
            )}
          </div>
          {step === 1 ? (
            <>
              <div className="estimate-lines">
                {!d.lines.length && (
                  <div className="estimate-empty">
                    <p>{t("estimates.mobile.items_hint")}</p>
                    <Button disabled={blocked} onClick={() => setPicker(true)}>
                      {t("estimates.mobile.add")}
                    </Button>
                  </div>
                )}
                {d.lines.map((l) => (
                  <div className="estimate-line" key={l.id}>
                    <div className="estimate-section-head">
                      <strong>{l.name}</strong>
                      <Button
                        size="sm"
                        tone="quiet"
                        disabled={blocked}
                        onClick={() =>
                          patch({ lines: d.lines.filter((x) => x.id !== l.id) })
                        }
                      >
                        {t("estimates.remove")}
                      </Button>
                    </div>
                    <div className="estimate-line-fields">
                      {field(
                        t("estimates.mobile.quantity") + " · " + unit(l.unit),
                        l.quantity,
                        (quantity) => line(l.id, { quantity }),
                        "decimal",
                      )}
                      {field(
                        t("estimates.mobile.unit_price"),
                        l.price,
                        (price) => line(l.id, { price }),
                        "decimal",
                      )}
                      {field(
                        t("estimates.discount"),
                        l.discount,
                        (discount) => line(l.id, { discount }),
                        "decimal",
                      )}
                    </div>
                    {review.invalid.has(l.id) && (
                      <p className="estimate-error" role="alert">
                        {t("estimates.mobile.invalid_line")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {d.lines.length > 0 && (
                <div className="estimate-discount">
                  {field(
                    t("estimates.bill_discount"),
                    d.billDiscount,
                    (billDiscount) => patch({ billDiscount }),
                    "decimal",
                  )}
                  {!review.billDiscountValid && (
                    <p className="estimate-error" role="alert">
                      {t("estimates.mobile.discount_error")}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="estimate-fields">
              {field(t("estimates.customer"), d.customerName, (customerName) =>
                patch({ customerName, customerId: null }),
              )}
              {field(
                t("estimates.phone"),
                d.customerPhone,
                (customerPhone) => patch({ customerPhone, customerId: null }),
                "tel",
              )}
              {attempted && customerIssue && (
                <p role="alert" className="estimate-error">
                  {t(customerIssue)}
                </p>
              )}
              {field(
                t("estimates.valid_until"),
                d.validUntil,
                (validUntil) => patch({ validUntil }),
                "date",
              )}
              {d.validUntil && (
                <Button
                  tone="quiet"
                  size="sm"
                  onClick={() => patch({ validUntil: "" })}
                >
                  {t("estimates.mobile.clear_date")}
                </Button>
              )}
              {d.validUntil && d.validUntil < estimateToday() && (
                <p className="estimate-error">{t("estimates.error.invalid")}</p>
              )}
              <Field label={t("estimates.note")}>
                <textarea
                  className="shop-field"
                  value={d.note}
                  maxLength={1000}
                  onChange={(e) => patch({ note: e.target.value })}
                  disabled={blocked}
                />
              </Field>
            </div>
          )}
        </Card>
        <aside>
          <Card className="estimate-editor-summary">
            <p className="shop-kicker">{t("estimates.mobile.preview")}</p>
            <h2>{t("estimates.mobile.selected", { count: d.lines.length })}</h2>
            <div className="estimate-total-row">
              <span>{t("estimates.mobile.subtotal")}</span>
              <strong>
                {review.subtotal === null ? "—" : money(review.subtotal)}
              </strong>
            </div>
            <p className="estimate-muted">
              {t("estimates.mobile.subtotal_hint")}
            </p>
            <p className="estimate-muted">{t("estimates.not_invoice")}</p>
            <div className="estimate-editor-actions">
              <Button
                block
                disabled={
                  blocked ||
                  !review.valid ||
                  (step === 2 &&
                    !!d.validUntil &&
                    d.validUntil < estimateToday())
                }
                onClick={() => {
                  if (step === 1) setStep(2);
                  else {
                    setAttempted(true);
                    if (!customerIssue) save();
                  }
                }}
              >
                {t(
                  step === 1 ? "estimates.mobile.next" : "estimates.save_draft",
                )}
              </Button>
              <Button
                block
                tone="ghost"
                disabled={blocked}
                onClick={requestExit}
              >
                {t(
                  step === 2 ? "estimates.mobile.edit_items" : "common.cancel",
                )}
              </Button>
            </div>
          </Card>
        </aside>
      </div>
      {picker && (
        <EstimateDialog
          title={t("estimates.mobile.add")}
          close={() => setPicker(false)}
        >
          <Field label={t("estimates.search")}>
            <input
              autoFocus
              className="shop-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={blocked}
            />
          </Field>
          <div className="estimate-picker" aria-busy={searching}>
            {searching && <p role="status">{t("common.loading")}</p>}
            {options?.products.map((p) => {
              const added = d.lines.some((l) => l.productId === p.id);
              return (
                <button
                  className="estimate-product"
                  key={p.id}
                  disabled={
                    blocked || added || searching || d.lines.length >= 100
                  }
                  onClick={() => {
                    patch({
                      lines: [
                        ...d.lines,
                        {
                          id: crypto.randomUUID(),
                          productId: p.id,
                          name: p.name,
                          unit: p.unit,
                          quantity: "1",
                          price: p.price,
                          discount: "0",
                        },
                      ],
                    });
                    setPicker(false);
                  }}
                >
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {unit(p.unit)} · {money(p.price)}
                    </small>
                  </span>
                  <span>{added ? t("estimates.mobile.added") : "＋"}</span>
                </button>
              );
            })}
            {!searching && options?.products.length === 0 && (
              <p>{t("estimates.mobile.no_products")}</p>
            )}
            {options?.more && (
              <p className="estimate-muted">{t("estimates.more_products")}</p>
            )}
          </div>
        </EstimateDialog>
      )}
      {discard && (
        <EstimateDialog
          title={t("estimates.mobile.discard_title")}
          close={() => setDiscard(false)}
        >
          <p>{t("estimates.mobile.discard_body")}</p>
          <div className="opening-actions">
            <Button tone="ghost" onClick={() => setDiscard(false)}>
              {t("estimates.mobile.keep_editing")}
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setDiscard(false);
                cancel();
              }}
            >
              {t("estimates.mobile.discard")}
            </Button>
          </div>
        </EstimateDialog>
      )}
    </>
  );
}
function EstimateDialog({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const { t } = useText();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="estimate-dialog"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="estimate-dialog-body">
        <div className="estimate-section-head">
          <h2>{title}</h2>
          <Button tone="quiet" onClick={close}>
            {t("common.close")}
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function EstimateList({ items, blocked, open }: EstimateListProps) {
  const { t, money, date } = useText(),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all");
  const filtered = items.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      [p.number, p.draft.customerName]
        .join(" ")
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <>
      <div className="estimate-list-tools">
        <Field label={t("estimates.mobile.search_estimates")}>
          <input
            className="shop-field"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Field>
        <div className="estimate-filters">
          {["all", "draft", "issued", "accepted"].map((s) => (
            <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {t(s === "all" ? "estimates.all" : "estimates.status." + s)}
            </Chip>
          ))}
        </div>
      </div>
      {items.length === 0 ? (
        <Card className="estimate-empty">
          <h2>{t("estimates.mobile.empty_title")}</h2>
          <p className="estimate-muted">{t("estimates.mobile.intro")}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <p>{t("estimates.mobile.no_matches")}</p>
        </Card>
      ) : (
        <div className="estimate-list">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="estimate-list-item shop-surface"
              disabled={blocked}
              onClick={() => open(p.id)}
            >
              <div>
                <strong>
                  {p.draft.customerName || t("estimates.mobile.walk_in")}
                </strong>
                <span className="estimate-muted">
                  {p.number || t("estimates.status.draft")} ·{" "}
                  {date(p.updatedAt)} ·{" "}
                  {t("estimates.mobile.selected", { count: p.lines.length })}
                </span>
              </div>
              <Pill tone={p.status === "draft" ? "neutral" : "saffron"}>
                {t(
                  "estimates.status." +
                    (estimateExpired(p) &&
                    ["issued", "accepted"].includes(p.status)
                      ? "expired"
                      : p.status),
                )}
              </Pill>
              <strong>{money(p.total)}</strong>
              <span aria-hidden>→</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
export function EstimateSummary({
  p,
  blocked,
  recheck,
}: {
  p: Estimate;
  blocked: boolean;
  recheck: () => void;
}) {
  const { t, money, unit, date } = useText();
  return (
    <>
      <Card className="estimate-document">
        <div className="estimate-section-head">
          <div>
            <Pill tone={p.status === "draft" ? "neutral" : "saffron"}>
              {t(
                "estimates.status." +
                  (estimateExpired(p) &&
                  ["issued", "accepted"].includes(p.status)
                    ? "expired"
                    : p.status),
              )}
            </Pill>
            <h2>{p.draft.customerName || t("estimates.mobile.walk_in")}</h2>
            {p.draft.customerPhone && (
              <p className="estimate-muted">{p.draft.customerPhone}</p>
            )}
            {p.draft.validUntil && (
              <p className="estimate-muted">
                {t("estimates.mobile.validity")}: {date(p.draft.validUntil)}
              </p>
            )}
          </div>
          <div className="estimate-amount">
            <span className="estimate-muted">{t("estimates.total")}</span>
            <strong>{money(p.total)}</strong>
          </div>
        </div>
        <p className="estimate-muted">{t("estimates.not_invoice")}</p>
        <div className="estimate-document-lines">
          {p.lines.map((l) => (
            <div key={l.id}>
              <div>
                <strong>{l.name}</strong>
                <p className="estimate-muted">
                  {l.quantity} {unit(l.unit)} × {money(l.price)}
                  {Number(l.discount) > 0
                    ? " · " + t("estimates.discount") + ": " + money(l.discount)
                    : ""}
                </p>
              </div>
              <strong>
                {money(
                  Math.round(Number(l.quantity) * Number(l.price) * 100) / 100 -
                    Number(l.discount),
                )}
              </strong>
            </div>
          ))}
        </div>
        <div className="estimate-totals">
          <div>
            <span>{t("estimates.bill_discount")}</span>
            <span>{money(p.draft.billDiscount)}</span>
          </div>
          <div>
            <span>{t("estimates.tax")}</span>
            <span>{money(p.tax)}</span>
          </div>
          <div>
            <strong>{t("estimates.total")}</strong>
            <strong>{money(p.total)}</strong>
          </div>
        </div>
        {p.draft.note && <p className="estimate-note">{p.draft.note}</p>}
      </Card>
      {(p.supported === false || !!p.taxIssues?.length) && (
        <details
          className="estimate-disclosure estimate-tax"
          open={p.supported === false || undefined}
        >
          <summary>
            {t(
              p.supported === false
                ? "estimates.mobile.tax_issue_title"
                : "estimates.mobile.tax_billing_title",
            )}
          </summary>
          <p className="estimate-muted">
            {t(
              p.supported === false
                ? "estimates.mobile.tax_issue_hint"
                : "estimates.mobile.tax_billing_hint",
            )}
          </p>
          {p.taxIssues?.map((i, n) => (
            <div key={n} className="estimate-tax-line">
              <strong>{i.name || t("estimates.mobile.tax_settings")}</strong>
              <p className="estimate-muted">
                {t("estimates.mobile.tax_" + i.code)}
              </p>
              {i.productId ? (
                <Link
                  className="shop-section-link"
                  href={"/shop/products/" + i.productId}
                >
                  {t("estimates.mobile.review_product")} ↗
                </Link>
              ) : i.code === "settings" ? (
                <Link className="shop-section-link" href="/shop/settings/gst">
                  {t("estimates.mobile.tax_settings")} ↗
                </Link>
              ) : null}
            </div>
          ))}
          {p.status === "draft" && (
            <Button disabled={blocked} tone="ghost" onClick={recheck}>
              {t("estimates.mobile.recheck")}
            </Button>
          )}
        </details>
      )}
      {estimateExpired(p) && p.status === "draft" && (
        <p className="estimate-error" role="alert">
          {t("estimates.error.invalid")}
        </p>
      )}
    </>
  );
}
export function EstimateHistory({ children }: { children: ReactNode }) {
  const { t } = useText();
  return (
    <details className="estimate-disclosure">
      <summary>{t("estimates.mobile.more_actions")}</summary>
      <div className="opening-stack">{children}</div>
    </details>
  );
}
export function EstimateResponse({ children }: { children: ReactNode }) {
  const { t } = useText();
  return (
    <details className="estimate-disclosure">
      <summary>{t("estimates.accept")}</summary>
      <div className="opening-stack">{children}</div>
    </details>
  );
}

export function EstimateShare({
  text,
  number,
  close,
}: {
  text: string;
  number: string;
  close: () => void;
}) {
  const { t } = useText(),
    [status, setStatus] = useState("");
  return (
    <EstimateDialog title={t("estimates.share")} close={close}>
      <p className="estimate-muted">{t("estimates.share_prepared")}</p>
      <pre className="estimate-share-text">{text}</pre>
      <div className="opening-actions">
        <Button
          onClick={() => {
            const url = URL.createObjectURL(
                new Blob([text], { type: "text/plain;charset=utf-8" }),
              ),
              a = document.createElement("a");
            a.href = url;
            a.download = number + ".txt";
            document.body.append(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setStatus("documents.downloaded");
          }}
        >
          {t("estimates.web.download")}
        </Button>
        <Button
          tone="ghost"
          onClick={() =>
            void navigator.clipboard
              .writeText(text)
              .then(() => setStatus("estimates.web.copied"))
              .catch(() => setStatus("estimates.share_cancelled"))
          }
        >
          {t("estimates.web.copy")}
        </Button>
        {typeof navigator.share === "function" && (
          <Button
            tone="ghost"
            onClick={() =>
              void navigator
                .share({ title: number, text })
                .then(() => setStatus("documents.shared"))
                .catch(() => setStatus("estimates.share_cancelled"))
            }
          >
            {t("estimates.web.choose_app")}
          </Button>
        )}
      </div>
      {status && <p role="status">{t(status)}</p>}
    </EstimateDialog>
  );
}
