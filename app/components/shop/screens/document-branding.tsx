"use client";
import {useQuery} from "@tanstack/react-query";
import { useState,useEffect,useRef } from "react";
import Link from "next/link";
import { useShop } from "../context";
import { useBranding } from "../../../lib/shop/documents/workflow";
import { documentErrorKey } from "../../../lib/shop/documents/client";
import { DOCUMENT_LAYOUTS } from "../../../lib/shop/documents/contract";
import { SUPPORTED_LANGUAGES } from "../../../lib/shop/languages";
import { DocumentPreview } from "../document-preview";
import { Button, Card, Field, PageHeader, Spinner, inputClass } from "../ui";
export function DocumentBrandingScreen() {
  const { shop, userId } = useShop();
  return <Editor key={shop?.id + ":" + userId} />;
}
function Editor() {
  const { api, shop, userId, perms, prefs, offline, t: translate } = useShop(),
    t = (k: string, v?: Record<string, string | number>) => translate(k, k, v);
  const w = useBranding(
    api.documents,
    shop?.id + ":" + userId,
    shop?.id ?? "",
    perms.canManageShop,
    prefs?.appLanguage ?? "en",
    () => crypto.randomUUID(),
  );
  const pos=useQuery({queryKey:["pos",shop?.id],queryFn:()=>api.getPosSettings(shop!.id),enabled:!!shop&&perms.canManageShop});
  const [count, setCount] = useState(20);
  const dialog=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(!w.preview)return;const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();w.setPreview(null);}if(event.key==='Tab'){const nodes=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')??[]),first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus();};},[w.preview]);
  const blocked = w.busy || !!w.pending || offline;
  const upload = async (kind: "logo" | "signature", file: File | undefined) => {
    if (!file) return;
    try {
      if (!["image/png", "image/jpeg"].includes(file.type))
        throw Error("document_image_invalid");
      if (file.size > 2_000_000) throw Error("document_image_size");
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await w.upload(kind, base64);
    } catch (e) {
      w.setError(e);
    }
  };
  return (
    <div className="shop-page">
      <PageHeader
        back={{
          href: "/shop/settings/payments",
          label: translate("pos_settings.title", ""),
        }}
        title={t("documents.title")}
        description={t("documents.help")}
      />
      {!perms.canManageShop ? (
        <Card>{t("documents.not_owner")}</Card>
      ) : w.meta.isPending ? (
        <Spinner />
      ) : (
        <>
          {w.error || w.meta.error ? (
            <Card>
              <p role="alert" className="text-danger">
                {t(documentErrorKey(w.error ?? w.meta.error))}
              </p>
            </Card>
          ) : null}
          {!w.meta.data ? (
            <Button onClick={() => void w.reload()}>{t("common.retry")}</Button>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <h2 className="shop-section-title">
                    {t("documents.layout")}
                  </h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {DOCUMENT_LAYOUTS.map((layout) => (
                      <button
                        key={layout}
                        type="button"
                        disabled={blocked}
                        aria-pressed={w.draft.layout === layout}
                        onClick={() => w.edit({ layout })}
                        className={
                          "rounded-xl border p-4 text-left disabled:opacity-40 " +
                          (w.draft.layout === layout
                            ? "border-saffron bg-saffron/10"
                            : "border-line bg-elevated")
                        }
                      >
                        <span
                          className="mb-3 block w-fit rounded border border-current px-2 py-3 text-xs"
                          aria-hidden="true"
                        >
                          {layout === "receipt"
                            ? "80 mm"
                            : layout.toUpperCase()}
                        </span>
                        {t("documents." + layout)}
                      </button>
                    ))}
                  </div>
                  <Field
                    label={t("documents.language")}
                    hint={t("documents.language_help")}
                  >
                    <select
                      disabled={blocked}
                      className={inputClass}
                      value={w.draft.language}
                      onChange={(e) => w.edit({ language: e.target.value })}
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <p className="mt-3 text-sm text-muted">
                    {t("documents.identity_help")}
                  </p>
                </Card>
                <Card>
                  <h2 className="shop-section-title">{t("documents.terms")}</h2>
                  <Field
                    label={t("documents.terms")}
                    hint={t("documents.terms_help")}
                  >
                    <textarea
                      disabled={blocked}
                      maxLength={2000}
                      rows={5}
                      className={inputClass}
                      value={w.draft.terms}
                      onChange={(e) => w.edit({ terms: e.target.value })}
                    />
                  </Field>
                  <label className="mt-4 flex gap-3">
                    <input
                      type="checkbox"
                      disabled={blocked}
                      checked={w.draft.showPayment}
                      onChange={(e) =>
                        w.edit({ showPayment: e.target.checked })
                      }
                    />
                    {t("documents.payment_toggle")}
                  </label>
                  <p className="mt-3 text-sm text-muted">
                    {t("documents.payment_help")}
                  </p>
                  <p className="mt-2 break-all">
                    {pos.data?.upiVpa ??
                      t("documents.payment_missing")}
                  </p>
                  <Link
                    className="mt-3 inline-block text-sm text-saffron underline"
                    href="/shop/settings/payments"
                  >
                    {t("documents.payment_settings")}
                  </Link>
                </Card>
                {(["logo", "signature"] as const).map((kind) => {
                  const id =
                    kind === "logo" ? w.draft.logoId : w.draft.signatureId;
                  return (
                    <Card key={kind}>
                      <h2 className="shop-section-title">
                        {t("documents." + kind)}
                      </h2>
                      {id && w.images[id] ? (
                        <img
                          src={w.images[id]}
                          alt={t("documents." + kind)}
                          className="mt-4 h-24 max-w-full rounded-lg bg-white p-2 object-contain"
                        />
                      ) : null}
                      <Field
                        label={t(
                          "documents." + kind + (id ? "_replace" : "_upload"),
                        )}
                        hint={t("documents.image_help")}
                      >
                        <input
                          type="file"
                          disabled={blocked}
                          accept="image/png,image/jpeg"
                          className="block w-full text-sm"
                          onChange={(e) => {
                            void upload(kind, e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </Field>
                      {id ? (
                        <Button
                          tone="ghost"
                          disabled={blocked}
                          onClick={() =>
                            w.edit(
                              kind === "logo"
                                ? { logoId: null }
                                : { signatureId: null, showSignature: false },
                            )
                          }
                        >
                          {t("documents." + kind + "_remove")}
                        </Button>
                      ) : null}
                      {kind === "logo" ? (
                        <Field label={t("documents.logo_fit")}>
                          <select
                            className={inputClass}
                            disabled={blocked}
                            value={w.draft.logoFit}
                            onChange={(e) =>
                              w.edit({
                                logoFit: e.target.value as "contain" | "cover",
                              })
                            }
                          >
                            <option value="contain">
                              {t("documents.contain")}
                            </option>
                            <option value="cover">
                              {t("documents.cover")}
                            </option>
                          </select>
                        </Field>
                      ) : (
                        <>
                          <label className="mt-4 flex gap-3">
                            <input
                              type="checkbox"
                              checked={w.draft.showSignature}
                              disabled={blocked || !id}
                              onChange={(e) =>
                                w.edit({ showSignature: e.target.checked })
                              }
                            />
                            {t("documents.signature_enable")}
                          </label>
                          <p className="mt-3 text-sm text-muted">
                            {t("documents.signature_help")}
                          </p>
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>
              <Card>
                <h2 className="shop-section-title">
                  {t("documents.preview_title")}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {t("documents.unsaved")}
                </p>
                <Field label={t("documents.sample_size")}>
                  <select
                    className={inputClass}
                    disabled={blocked}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  >
                    {[1, 20, 100].map((n) => (
                      <option key={n} value={n}>
                        {t("documents.sample_" + n)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Button
                  tone="ghost"
                  disabled={blocked}
                  onClick={() => void w.sample(count)}
                >
                  {t("documents.preview")}
                </Button>
              </Card>
              {w.pending && !w.busy ? (
                <p role="status" className="text-warn">
                  {t("documents.uncertain")}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={w.busy || offline}
                  onClick={() => void w.save()}
                >
                  {t(w.busy ? "common.loading" : w.pending ? "documents.check_result" : "documents.save")}
                </Button>
                <Button
                  tone="ghost"
                  disabled={w.busy || offline}
                  onClick={() => void w.reload()}
                >
                  {t("documents.reload")}
                </Button>
              </div>
              {w.saved ? (
                <p role="status" className="text-ok">
                  {t(w.saved)}
                </p>
              ) : null}
              <p className="text-sm text-muted">{t("documents.online_help")}</p>
              {w.preview ? (
                <div
                  role="dialog"
                  ref={dialog} tabIndex={-1}
                  aria-modal="true"
                  aria-label={t("documents.preview_title")}
                  className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-3 sm:p-8"
                >
                  <div className="mx-auto grid max-w-4xl gap-4 rounded-2xl border border-line bg-card p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2>{t("documents.preview_title")}</h2>
                      <Button tone="ghost" onClick={() => w.setPreview(null)}>
                        {t("documents.close")}
                      </Button>
                    </div>
                    <DocumentPreview {...w.preview} />
                  </div>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
