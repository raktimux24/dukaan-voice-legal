"use client";
import { useEffect, useRef, useState } from "react";
import { useShop } from "../context";
import { Card, Button, PageHeader, Notice } from "../ui";
import {
  TextField,
  SelectField,
  Check,
  Section,
  Stats,
  useGstText,
} from "../gst-ui";
import {
  GstAccess,
  useGstQuery,
  ReadState,
  useGstAction,
} from "../gst-workspace";
import {
  normalizeRspProductProfile,
  calculateRspProfileCommercial,
  type RspProductProfile,
} from "../../../lib/shop/gst-core/rsp-profile-contract";
import {
  normalizeRspProfileReviewState,
  validRspProfileRequest,
  assertRspProfileReceipt,
  assertRspPreviewReceipt,
} from "../../../lib/shop/gst-core/rsp-profile-request";
import {
  financialScope,
  assertScope,
  readState,
  writeState,
} from "../../../lib/shop/gst-storage";
import { EN_FALLBACK } from "../../../lib/shop/en-fallback";
const descriptions = [
  "pan_masala",
  "unmanufactured_tobacco",
  "cigars_cigarettes",
  "manufactured_tobacco",
  "non_combustion_tobacco",
  "non_combustion_substitutes",
];
const initial = {
  hsn: "",
  description: "",
  source: "",
  goodsEvidence: "",
  rateSource: "",
  from: "",
  until: "",
  cgst: "",
  sgst: "",
  utgst: "",
  igst: "",
  reason: "",
};
type Review = {
  profile: RspProductProfile;
  expectedReviewVersion: string | null;
  reason: string;
};
export function GstRspScreen({ id }: { id: string }) {
  const { api, shop, t, userId } = useShop(),
    text = useGstText(),
    action = useGstAction();
  const label = (key: string) =>
    t(
      "gst.rsp." + key,
      (EN_FALLBACK as Record<string, string>)["gst.rsp." + key] ?? key,
    );
  const settings = useGstQuery(["settings"], () =>
    api.getPosSettings(shop!.id),
  );
  const path = `/api/shops/${shop?.id}/inventory/products/${id}/rsp-profile-review`,
    q = useGstQuery(
      ["rsp-review", id],
      async () => normalizeRspProfileReviewState(await api.gst.get(path), id),
      !!settings.data?.gstRspProfileReviewsAvailable,
    );
  const [draft, setDraft] = useState(initial),
    [reviewed, setReviewed] = useState(false);
  const pending = useRef<Review | null>(null);
  const change = (key: keyof typeof initial, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setReviewed(false);
  };
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState<Error | null>(null);
  useEffect(() => {
    let active = true;
    pending.current = null;
    setRestoring(true);
    setRestoreError(null);
    readState<Review>(`rsp-review:${userId}:${shop?.id}:${id}`)
      .then((input) => {
        if (!active) return;
        if (input) {
          pending.current = input;
          const p = input.profile;
          setDraft({
            ...initial,
            hsn: p.goods.hsn,
            description: p.goods.description,
            source: p.sourceReference,
            goodsEvidence: p.goods.evidenceReference,
            rateSource: p.rates.sourceReference,
            from: p.effectiveFrom.slice(0, 10),
            until: p.effectiveUntil?.slice(0, 10) ?? "",
            cgst: String(p.rates.cgst),
            sgst: String(p.rates.sgst),
            utgst: String(p.rates.utgst),
            igst: String(p.rates.igst),
            reason: input.reason,
          });
          setReviewed(true);
        }
        setRestoring(false);
      })
      .catch((error) => {
        if (active) {
          setRestoreError(error);
          setRestoring(false);
        }
      });
    return () => {
      active = false;
    };
  }, [userId, shop?.id, id]);
  async function save() {
    const active = financialScope(shop!.id),
      key = `rsp-review:${active.actorId}:${active.shopId}:${id}`;
    let input = pending.current ?? (await readState<Review>(key));
    if (!input) {
      if (!reviewed || !q.data) throw Error(label("save_failed"));
      const profile = normalizeRspProductProfile({
        format: "samaan_rsp_product_profile_v1",
        version: crypto.randomUUID(),
        productId: id,
        rule: "cgst_rule_31d_2026",
        effectiveFrom: draft.from + "T00:00:00+05:30",
        ...(draft.until
          ? { effectiveUntil: draft.until + "T00:00:00+05:30" }
          : {}),
        sourceReference: draft.source,
        reviewed: true,
        goods: {
          hsn: draft.hsn,
          description:
            draft.description as RspProductProfile["goods"]["description"],
          reviewed: true,
          evidenceReference: draft.goodsEvidence,
        },
        rates: {
          version: crypto.randomUUID(),
          sourceReference: draft.rateSource,
          reviewed: true,
          cgst: Number(draft.cgst),
          sgst: Number(draft.sgst),
          utgst: Number(draft.utgst),
          igst: Number(draft.igst),
        },
      });
      input = {
        profile,
        expectedReviewVersion: q.data.review?.version ?? null,
        reason: draft.reason,
      };
      if (!validRspProfileRequest(input, id)) throw Error(label("save_failed"));
    }
    pending.current = input;
    await writeState(key, input);
    let response;
    try {
      response = await api.gst.post(path, input);
    } catch (error) {
      const recorded = normalizeRspProfileReviewState(
        await api.gst.get(path),
        id,
      );
      if (recorded.review?.version !== input.profile.version) throw error;
      response = {
        status: "review_only",
        version: recorded.review.version,
        profile: recorded.review.profile,
      };
    }
    assertScope(active);
    assertRspProfileReceipt(input.profile, response);
    await writeState(key, null);
    pending.current = null;
    setReviewed(false);
    await q.refetch();
  }
  return (
    <GstAccess>
      <div className="shop-page">
        <PageHeader
          title={label("title")}
          back={{
            href: "/shop/products/" + id + "/gst",
            label: text("Product"),
          }}
          description={label("notice")}
        />
        <ReadState query={settings}>
          {settings.data?.gstRspProfileReviewsAvailable ? (
            <>
              <ReadState query={q}>
                <Card>
                  <h2>{label("current")}</h2>
                  <p>{q.data?.review?.profile.goods.hsn ?? label("empty")}</p>
                  <p>{q.data?.review?.profile.sourceReference}</p>
                  {q.data?.review ? (
                    <Button
                      tone="ghost"
                      disabled={
                        restoring ||
                        !!restoreError ||
                        action.busy ||
                        !!pending.current
                      }
                      onClick={() => {
                        const p = q.data!.review!.profile;
                        setDraft({
                          ...initial,
                          hsn: p.goods.hsn,
                          description: p.goods.description,
                          source: p.sourceReference,
                          goodsEvidence: p.goods.evidenceReference,
                          rateSource: p.rates.sourceReference,
                          from: p.effectiveFrom.slice(0, 10),
                          until: p.effectiveUntil?.slice(0, 10) ?? "",
                          cgst: String(p.rates.cgst),
                          sgst: String(p.rates.sgst),
                          utgst: String(p.rates.utgst),
                          igst: String(p.rates.igst),
                        });
                        setReviewed(false);
                      }}
                    >
                      {label("use_latest")}
                    </Button>
                  ) : null}
                </Card>
              </ReadState>
              <Card>
                <fieldset
                  disabled={
                    restoring ||
                    !!restoreError ||
                    action.busy ||
                    !!pending.current
                  }
                >
                  <TextField
                    label={label("hsn")}
                    value={draft.hsn}
                    onChange={(v) => change("hsn", v)}
                  />
                  <SelectField
                    label={label("description")}
                    value={draft.description}
                    onChange={(v) => change("description", v)}
                    options={[
                      ["", text("Choose goods")],
                      ...descriptions.map(
                        (d) => [d, label("goods." + d)] as const,
                      ),
                    ]}
                  />
                  {(
                    [
                      "source",
                      "goodsEvidence",
                      "rateSource",
                      "from",
                      "until",
                      "cgst",
                      "sgst",
                      "utgst",
                      "igst",
                      "reason",
                    ] as const
                  ).map((key) => (
                    <TextField
                      key={key}
                      type={
                        key === "from" || key === "until"
                          ? "date"
                          : ["cgst", "sgst", "utgst", "igst"].includes(key)
                            ? "number"
                            : "text"
                      }
                      label={label(key)}
                      value={draft[key]}
                      onChange={(v) => change(key, v)}
                    />
                  ))}
                  <Check
                    label={label("reviewed")}
                    checked={reviewed}
                    onChange={setReviewed}
                  />
                </fieldset>
                <Notice error={restoreError} />
                {action.notice}
                <Button
                  disabled={
                    restoring ||
                    !!restoreError ||
                    action.busy ||
                    !q.data ||
                    (!pending.current && !reviewed)
                  }
                  onClick={() => void action.run(save)}
                >
                  {label(pending.current ? "retry" : "save")}
                </Button>
              </Card>
              {q.data?.review ? (
                <RspPreview id={id} profile={q.data.review.profile} />
              ) : null}
            </>
          ) : (
            <Notice error={Error(label("core_unavailable"))} />
          )}
        </ReadState>
      </div>
    </GstAccess>
  );
}
function RspPreview({
  id,
  profile,
}: {
  id: string;
  profile: RspProductProfile;
}) {
  const { api, shop, t, userId } = useShop(),
    action = useGstAction();
  const l = (k: string) =>
    t(
      "gst.rsp.preview_" + k,
      (EN_FALLBACK as Record<string, string>)["gst.rsp.preview_" + k] ?? k,
    );
  const [draft, setDraft] = useState({
      date: "",
      area: "",
      packageId: "",
      count: "",
      rsp: "",
      increases: "",
      gross: "",
      discount: "0",
      evidence: "",
    }),
    [reviewed, setReviewed] = useState(false),
    [result, setResult] = useState<
      ReturnType<typeof calculateRspProfileCommercial>["calculation"] | null
    >(null);
  const prices = (s: string) =>
    s.trim()
      ? s.split(",").map((v) => {
          if (!/^\d+(\.\d{1,2})?$/.test(v.trim())) throw Error(l("failed"));
          return Number(v);
        })
      : [];
  return (
    <Section title={l("title")}>
      <p>{l("notice")}</p>
      <fieldset disabled={action.busy}>
        {Object.entries(draft).map(([key, value]) => (
          <TextField
            key={key}
            label={l(key === "rsp" ? "declared_prices" : key)}
            value={value}
            type={key === "date" ? "date" : "text"}
            onChange={(value) => {
              setDraft((d) => ({ ...d, [key]: value }));
              setReviewed(false);
              setResult(null);
            }}
          />
        ))}
        <Check
          label={l("reviewed")}
          checked={reviewed}
          onChange={setReviewed}
        />
      </fieldset>
      <Button
        disabled={action.busy || !reviewed}
        onClick={() =>
          void action.run(async () => {
            const active = financialScope(shop!.id);
            const input = {
              valuation: {
                supplyAt: draft.date + "T00:00:00+05:30",
                area: draft.area,
                packageId: draft.packageId,
                packageCount: Number(draft.count),
                packages: [
                  {
                    area: draft.area,
                    packageId: draft.packageId,
                    declaredPrices: prices(draft.rsp),
                    increasedPrices: prices(draft.increases),
                  },
                ],
              },
              grossSaleValue: draft.gross,
              discount: draft.discount,
              rounding: {
                rule: "aggregate_half_up_largest_remainder_v1" as const,
                reviewed: true,
                evidenceReference: draft.evidence,
              },
            };
            const expected = calculateRspProfileCommercial(profile, {
              ...input,
              productId: id,
            });
            const value = await api.gst.post(
              `/api/shops/${shop!.id}/inventory/products/${id}/rsp-preview`,
              input,
            );
            assertScope(active);
            setResult(assertRspPreviewReceipt(expected, value));
          })
        }
      >
        {l("action")}
      </Button>
      {action.notice}
      {result ? (
        <Stats
          items={[
            { label: l("net"), value: "₹" + result.commercial.netSaleValue },
            {
              label: l("deemed"),
              value: "₹" + result.statutory.deemedTaxableValue,
            },
            { label: l("tax"), value: "₹" + result.statutory.tax },
            { label: l("total"), value: "₹" + result.payable },
          ]}
        />
      ) : null}
    </Section>
  );
}
