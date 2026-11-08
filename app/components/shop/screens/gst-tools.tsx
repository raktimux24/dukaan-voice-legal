"use client";
import { useEffect, useRef, useState } from "react";
import { useShop } from "../context";
import { Card, Button, PageHeader, Notice, Pill } from "../ui";
import {
  TextField,
  SelectField,
  Check,
  Section,
  useGstText,
  useFiscalDate,
} from "../gst-ui";
import {
  GstAccess,
  useGstQuery,
  useGstPages,
  ReadState,
  More,
  useGstAction,
} from "../gst-workspace";
import {
  normalizeRoundingReviewState,
  assertRoundingReviewReceipt,
  type RoundingReviewRequest,
} from "../../../lib/shop/gst-core/payable-rounding-request";
import {
  createPayableRoundingSnapshot,
  assertPayableRoundingPreview,
} from "../../../lib/shop/gst-core/payable-rounding-snapshot";
import {
  financialScope,
  assertScope,
  readState,
  writeState,
} from "../../../lib/shop/gst-storage";
const base = "/shop/settings/gst";
export function GstProvidersScreen() {
  const { api, shop, t } = useShop(),
    text = useGstText(),
    date = useFiscalDate();
  type Job = {
    id: string;
    provider: string;
    kind: string;
    state: string;
    attempt: number;
    createdAt: string;
    updatedAt: string;
    remoteId: string | null;
    subjectReference?: string;
  };
  const q = useGstPages(["provider-jobs"], (before) =>
    api.gst.get<{ items: Job[]; nextCursor: string | null }>(
      `/api/shops/${shop!.id}/gst-exports/provider-jobs${before ? "?before=" + encodeURIComponent(before) : ""}`,
    ),
  );
  const labels: Record<string, string> = {
    irp_register: "E-invoice registration",
    irp_cancel: "E-invoice cancellation",
    eway_generate: "E-way bill generation",
    eway_cancel: "E-way bill cancellation",
    gstr_submit: "GST return submission",
    queued: "Queued",
    dispatching: "Sending",
    uncertain: "Needs confirmation",
    succeeded: "Completed",
    rejected: "Rejected",
  };
  return (
    <GstAccess>
      <div className="shop-page gst-workspace gst-provider-workspace">
        <PageHeader
          title={text("GST provider status")}
          back={{ href: base, label: text("GST records") }}
          description={text(
            "View recorded provider requests and their latest status. This page does not send or file anything.",
          )}
        />
        <ReadState query={q} empty={!q.data?.pages.some((p) => p.items.length)}>
          {q.data?.pages
            .flatMap((p) => p.items)
            .map((job) => (
              <article key={job.id} className="gst-provider-record">
                <h2>{text(labels[job.kind] ?? "Provider request")}</h2>
                <Pill tone={job.state==='uncertain'?'warn':job.state==='rejected'?'danger':job.state==='succeeded'?'ok':'neutral'}>{text(labels[job.state] ?? 'Needs review')}</Pill><p>{job.subjectReference}</p><p className="shop-hint">{job.provider}</p>{job.state==='uncertain'?<p className="shop-hint">{t('gst.provider.uncertain_help','The recorded outcome needs confirmation before another request.')}</p>:null}
                <p>{date(job.updatedAt)}</p>
                <Section title={text("Support reference")}>
                  <p className="gst-reference">{job.id}</p>
                  <p className="gst-reference">{job.remoteId}</p>
                </Section>
              </article>
            ))}
        </ReadState>
        <More query={q} />
        <Button tone="ghost" onClick={() => void q.refetch()}>
          {text("Refresh report")}
        </Button>
      </div>
    </GstAccess>
  );
}
export function GstRoundingScreen() {
  const { api, shop, userId, role, offline, t } = useShop(),
    text = useGstText(),
    action = useGstAction();
  const path = `/api/shops/${shop?.id}/pos-settings/rounding-review`;
  const settings = useGstQuery(["settings"], () =>
    api.getPosSettings(shop!.id),
  );
  const q = useGstQuery(
    ["rounding-review"],
    async () => normalizeRoundingReviewState(await api.gst.get(path), shop!.id),
    !!settings.data?.gstPayableRoundingReviewsAvailable,
  );
  const [mode, setMode] = useState("none"),
    [effective, setEffective] = useState(new Date(Date.now()+19800000).toISOString().slice(0,10)),
    [until,setUntil]=useState(''),
    [evidence, setEvidence] = useState(""),
    [reason, setReason] = useState(""),
    [checked, setChecked] = useState(false),
    [before, setBefore] = useState("100.50"),
    [preview, setPreview] = useState<string | null>(null);
  useEffect(()=>setPreview(null),[before,q.data?.review?.version]);
  const pending = useRef<RoundingReviewRequest | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState<Error | null>(null);
  useEffect(() => {
    let active = true;
    pending.current = null;
    setRestoring(true);
    setRestoreError(null);
    readState<RoundingReviewRequest>(`rounding-review:${userId}:${shop?.id}`)
      .then((input) => {
        if (!active) return;
        if (input) {
          pending.current = input;
          setMode(input.policy.mode);
          setEffective(new Date(Date.parse(input.policy.effectiveFrom)+19800000).toISOString().slice(0,10));
          setUntil(input.policy.effectiveUntil?new Date(Date.parse(input.policy.effectiveUntil)+19800000).toISOString().slice(0,10):"");
          setEvidence(input.policy.evidenceReference);
          setReason(input.reason);
          setChecked(true);
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
  }, [userId, shop?.id]);
  async function save() {
    if(role!=="OWNER"||offline||!q.isSuccess||q.error)return;
    const active = financialScope(shop!.id),
      key = `rounding-review:${active.actorId}:${active.shopId}`;
    const input = pending.current ??
      (await readState<RoundingReviewRequest>(key)) ?? {
        policy: {
          format: "payable_rounding_policy_v1" as const,
          version: crypto.randomUUID(),
          shopId: shop!.id,
          mode: mode as "none" | "nearest_rupee",
          effectiveFrom: new Date(effective + "T00:00:00+05:30").toISOString(),
          effectiveUntil: until?new Date(until+"T00:00:00+05:30").toISOString():null,
          reviewed: true as const,
          evidenceReference: evidence,
        },
        expectedReviewVersion: q.data?.review?.version ?? null,
        reason,
      };
    pending.current = input;
    await writeState(key, input);
    let value;
    try {
      value = await api.gst.post(path, input);
    } catch (error) {
      const recorded = normalizeRoundingReviewState(
        await api.gst.get(path),
        shop!.id,
      );
      if (recorded.review?.version !== input.policy.version) throw error;
      value = {
        status: "review_only",
        version: recorded.review.version,
        policy: recorded.review.policy,
      };
    }
    assertScope(active);
    assertRoundingReviewReceipt(input.policy, value);
    await writeState(key, null);
    pending.current = null;
    await q.refetch();
  }
  return (
    <GstAccess>
      <div className="shop-page gst-workspace gst-rounding-workspace">
        <PageHeader
          title={text("Payable rounding review")}
          back={{ href: base, label: text("GST records") }}
          description={text(
            "Review and preview a rounding policy. Saving a review does not enable rounded billing.",
          )}
        />
        <Button tone="ghost" disabled={q.isFetching||settings.isFetching||action.busy} onClick={()=>{void settings.refetch();if(settings.data?.gstPayableRoundingReviewsAvailable)void q.refetch()}}>{t('gst.rounding.refresh','Refresh review')}</Button>
        <ReadState query={settings}>
          {settings.data?.gstPayableRoundingReviewsAvailable ? (
            <>
              <ReadState query={q}>
                <Card>
                  <p>
                    {text("Current policy")}:{" "}
                    {text(
                      q.data?.review?.policy.mode === "nearest_rupee"
                        ? "Nearest rupee"
                        : "No rounding",
                    )}
                  </p>
                  <p>{q.data?.review?.policy.evidenceReference}</p>{q.data?.review?<><p className="gst-reference">{q.data.review.version}</p><Button tone="quiet" disabled={role!=='OWNER'||offline||restoring||!!restoreError||action.busy||!!pending.current} onClick={()=>{const p=q.data!.review!.policy;setMode(p.mode);setEffective(new Date(Date.parse(p.effectiveFrom)+19800000).toISOString().slice(0,10));setUntil(p.effectiveUntil?new Date(Date.parse(p.effectiveUntil)+19800000).toISOString().slice(0,10):'');setEvidence(p.evidenceReference);setReason('');setChecked(false)}}>{t('gst.rounding.use_latest','Use retained policy for a new review')}</Button></>:null}
                </Card>
              </ReadState>
              <Card className="gst-rounding-form">
                <fieldset className="form-grid is-2"
                  disabled={
                    role!=='OWNER'||offline||!q.isSuccess||!!q.error||restoring ||
                    !!restoreError ||
                    action.busy ||
                    !!pending.current
                  }
                >
                  <SelectField
                    label={text("Rounding")}
                    value={mode}
                    onChange={v=>{setMode(v);setChecked(false)}}
                    options={[
                      ["none", text("No rounding")],
                      ["nearest_rupee", text("Nearest rupee")],
                    ]}
                  />
                  <TextField
                    label={text("Effective date")}
                    type="date"
                    value={effective}
                    onChange={v=>{setEffective(v);setChecked(false)}}
                  />
                  <TextField label={t('gst.rounding.until','Effective until (optional, exclusive)')} type="date" value={until} onChange={v=>{setUntil(v);setChecked(false)}}/>
                  <TextField
                    label={text("Evidence reference")}
                    value={evidence}
                    onChange={v=>{setEvidence(v);setChecked(false)}}
                  />
                  <TextField
                    label={text("Reason")}
                    value={reason}
                    onChange={v=>{setReason(v);setChecked(false)}}
                  />
                  <Check
                    label={text("I have reviewed this policy.")}
                    checked={checked}
                    onChange={setChecked}
                  />
                </fieldset>
                <Notice error={restoreError} />
                {action.notice}
                <Button
                  disabled={
                    role!=='OWNER'||offline||!q.isSuccess||!!q.error||restoring ||
                    !!restoreError ||
                    action.busy ||
                    (!pending.current &&
                      (!checked ||
                        !evidence.trim() ||
                        !reason.trim() ||
                        !effective || (!!until&&until<=effective)))
                  }
                  onClick={() => void action.run(save)}
                >
                  {text(
                    pending.current
                      ? "Retry saved review"
                      : "Save reviewed policy",
                  )}
                </Button>
              </Card>
              {q.data?.review ? (
                <Card className="gst-rounding-preview">
                  <TextField
                    label={text("Amount before rounding")}
                    type="number"
                    value={before}
                    onChange={setBefore}
                  />
                  <Button
                    disabled={offline||!!pending.current||action.busy || !/^\d+(\.\d{1,2})?$/.test(before)}
                    onClick={() =>
                      void action.run(async () => {
                        const issuedAt = new Date().toISOString(),
                          normalizedBefore = before.includes(".")
                            ? before.padEnd(before.indexOf(".") + 3, "0")
                            : before + ".00",
                          expected = createPayableRoundingSnapshot(
                            shop!.id,
                            issuedAt,
                            normalizedBefore,
                            q.data!.review!.policy,
                          );
                        const response = await api.gst.post(
                          `/api/shops/${shop!.id}/pos-settings/rounding-preview`,
                          {
                            version: q.data!.review!.version,
                            issuedAt,
                            before: normalizedBefore,
                          },
                        );
                        setPreview(
                          assertPayableRoundingPreview(expected, response)
                            .calculation.payable,
                        );
                      })
                    }
                  >
                    {text("Preview")}
                  </Button>
                  {preview ? (
                    <p>
                      {text("Rounded payable")}: ₹{preview}
                    </p>
                  ) : null}
                </Card>
              ) : null}
            </>
          ) : (
            <Notice
              error={Error(
                text("Rounding reviews are unavailable on this server."),
              )}
            />
          )}
        </ReadState>
      </div>
    </GstAccess>
  );
}
