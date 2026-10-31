import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  openingErrorKey,
  openingProgress,
  OPENING_SECTIONS,
  openingToday,
  type OpeningRow,
  type OpeningSection,
  type OpeningTarget,
} from "./contract";
import { useOpenings } from "./workflow";
type Children = { children?: ReactNode };
export type OpeningUi = {
  Box: ComponentType<Children & { card?: boolean; row?: boolean }>;
  Text: ComponentType<
    Children & {
      heading?: boolean;
      tone?: "muted" | "danger" | "accent";
      live?: boolean;
    }
  >;
  Button: ComponentType<{
    label: string;
    onPress: () => void;
    disabled?: boolean;
    primary?: boolean;
  }>;
  Input: ComponentType<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    type?: "text" | "decimal" | "date" | "datetime";
    multiline?: boolean;
    clearLabel?: string;
    clearable?: boolean;
  }>;
  Check: ComponentType<{
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }>;
  Busy: ComponentType<{ label: string }>;
  Tabs?: ComponentType<{items:{key:string;label:string}[];value:string;onChange:(value:string)=>void;disabled?:boolean}>;
  Steps?: ComponentType<{
    labels: string[];
    current: number;
    disabled?: boolean;
    onSelect: (step: number) => void;
  }>;
  Disclosure?: ComponentType<Children & {label: string}>;
  SavedSetup?: ComponentType<{
    status: string;
    details: string;
    recordedAt?: string;
    onPress: () => void;
    disabled?: boolean;
  }>;
  Empty?: ComponentType<{ title: string; body?: string; actionLabel?: string; onAction?: () => void }>;
};
type Props = {
  w: ReturnType<typeof useOpenings>;
  ui: OpeningUi;
  t: (key: string, vars?: Record<string, string | number>) => string;
  owner: boolean;
  onboarding: boolean;
  finish: () => void;
  importRows: (
    kind: "stock" | "customer" | "supplier",
    sessionId: string,
  ) => void;
};
/** The same workflow and accessible form content on native and web. */
export function OpeningView({
  w,
  ui,
  t,
  owner,
  onboarding,
  finish,
  importRows,
}: Props) {
  const { Box, Text, Button, Input, Check, Busy, Steps, SavedSetup, Disclosure } = ui,
    s = w.session,
    d = w.draft;
  const blocked = w.busy || !!w.pending,
    [work, setWork] = useState(false),
    [overlap, setOverlap] = useState(false),
    [devices, setDevices] = useState<string[]>([]),
    [limit, setLimit] = useState(20);
  const [payment, setPayment] = useState<OpeningTarget | null>(null),
    [amount, setAmount] = useState(""),
    [reference, setReference] = useState(""),
    [note, setNote] = useState(""),
    [method, setMethod] = useState<"cash" | "upi" | "bank" | "card">("cash"),
    [date, setDate] = useState(() => new Date().toISOString());
  useEffect(() => {
    setWork(false);
    setOverlap(false);
    setDevices([]);
    setLimit(20);
  }, [s?.review?.hash]);
  useEffect(() => {
    setPayment(null);
  }, [w.view, s?.id]);
  useEffect(() => {
    if (w.message === "opening.payment_saved") setPayment(null);
  }, [w.message]);
  const patch = (value: Partial<typeof d>) => {
    if (!blocked) w.setDraft((old) => ({ ...old, ...value }));
  };
  const update = (
    section: OpeningSection,
    id: string,
    patch: Partial<OpeningRow>,
  ) => {
    if (!blocked)
      w.setDraft((old) => ({
        ...old,
        [section]: old[section].map((r) =>
          r.id === id ? { ...r, ...patch } : r,
        ),
      }));
  };
  const done = (id: string) => s?.outcomes.some((o) => o.rowId === id) ?? false;
  const err =
    w.error ??
    w.metadata.error ??
    (w.view === "history" ? w.history.error : w.targets.error);
  useEffect(() => {
    if (d.step === 1) w.setSection("stock");
    else if (d.step === 2 && !["customer", "supplier"].includes(w.section))
      w.setSection(
        w.metadata.data?.customerAvailable ? "customer" : "supplier",
      );
    else if (d.step === 3) w.setSection("cash");
  }, [d.step, s?.id, w.metadata.data?.customerAvailable]);
  const unitName = (unit: string) =>
    ["piece", "packet", "dozen", "crate"].includes(unit)
      ? t("imports.unit." + unit)
      : unit;
  const sectionName = (section: OpeningSection) =>
    t("opening.section." + section);
  const nav = (view: typeof w.view) => {
    if (!blocked) {
      w.setView(view);
      w.setSearch("");
      w.setOffset(0);
    }
  };
  const btn = (
    key: string,
    onPress: () => void,
    primary = false,
    disabled = false,
  ) => (
    <Button
      label={t(key)}
      onPress={onPress}
      primary={primary}
      disabled={blocked || disabled}
    />
  );
  const pagination = (
    offset: number,
    set: (n: number) => void,
    more?: boolean,
    size = 30,
  ) => (
    <Box row>
      {btn(
        "common.back",
        () => set(Math.max(0, offset - size)),
        false,
        offset === 0,
      )}
      {btn("imports.more", () => set(offset + size), false, !more)}
    </Box>
  );
  const importButton = (kind: "stock" | "customer" | "supplier") =>
    btn(
      kind === "stock" ? "imports.title" : "partiesImport." + kind + "_title",
      () => void w.importRows(kind, (id) => importRows(kind, id)),
      false,
      !!s?.outcomes.length,
    );
  const savedSetups = (
    <Box card>
      <Text heading>{t("opening.saved_setups")}</Text>
      {w.metadata.data?.sessions.map((session) =>
        SavedSetup ? (
          <SavedSetup
            key={session.id}
            status={t("opening.state." + session.state)}
            details={session.updatedAt.slice(0, 10)}
            recordedAt={session.updatedAt}
            disabled={blocked}
            onPress={() => void w.open(session.id)}
          />
        ) : (
          <Button
            key={session.id}
            label={
              t("opening.state." + session.state) +
              " · " +
              session.updatedAt.slice(0, 10) +
              " →"
            }
            disabled={blocked}
            onPress={() => void w.open(session.id)}
          />
        ),
      )}
      {!w.metadata.data?.sessions.length ? (
        <Text tone="muted">{t("opening.no_saved")}</Text>
      ) : null}
    </Box>
  );
  const selectedRows = (section: OpeningSection) =>
    d[section].slice(0, limit).map((row) => (
      <Box card key={row.id}>
        <Text heading>
          {row.name || sectionName(section)}
          {row.unit ? " · " + unitName(row.unit) : ""}
        </Text>
        {done(row.id) ? (
          <Text tone="accent">{t("opening.state.complete")}</Text>
        ) : null}
        {row.source ? (
          <Text tone="muted">
            {t("opening.source")} · {row.source.filename} · {t("imports.row")}{" "}
            {row.source.sourceRow}
          </Text>
        ) : null}
        {section === "stock" ? (
          <>
            <Input
              label={
                t("opening.count") +
                (row.unit ? " · " + unitName(row.unit) : "")
              }
              value={row.quantity}
              type="decimal"
              disabled={blocked || done(row.id)}
              onChange={(quantity) => update(section, row.id, { quantity })}
            />
            <Input
              label={t("opening.cost")}
              value={row.unitCost}
              type="decimal"
              disabled={blocked || done(row.id)}
              onChange={(unitCost) => update(section, row.id, { unitCost })}
            />
            <Text tone="muted">{t("opening.cost_help")}</Text>
            <Details label={t("mobile.opening.details")}>
            <Input
              label={t("imports.field.batchNumber")}
              value={row.batchNumber}
              disabled={blocked || done(row.id)}
              onChange={(batchNumber) =>
                update(section, row.id, { batchNumber })
              }
            />
            <Input
              label={t("imports.field.expiryDate")}
              value={row.expiry}
              type="date"
              clearLabel={t("common.remove")}
              disabled={blocked || done(row.id)}
              onChange={(expiry) => update(section, row.id, { expiry })}
            />
            </Details>
          </>
        ) : (
          <>
            <Input
              label={t("opening.amount")}
              type="decimal"
              value={row.amount}
              disabled={blocked || done(row.id)}
              onChange={(amount) => update(section, row.id, { amount })}
            />
            {section !== "cash" ? (
              <>
                <Box row>
                  {(["party_owes", "shop_owes"] as const).map((direction) => (
                    <Button
                      key={direction}
                      label={
                        (row.direction === direction ? "✓ " : "") +
                        t("opening.direction." + section + "." + direction)
                      }
                      disabled={blocked || done(row.id)}
                      onPress={() => update(section, row.id, { direction })}
                    />
                  ))}
                </Box>
                <Input
                  label={t("opening.due")}
                  value={row.dueDate}
                  type="date"
                  clearLabel={t("common.remove")}
                  disabled={blocked || done(row.id)}
                  onChange={(dueDate) => update(section, row.id, { dueDate })}
                />
              </>
            ) : null}
          </>
        )}
        {!done(row.id) ? (
          <Check
            label={t("opening.entry.correction")}
            value={row.correction}
            disabled={blocked}
            onChange={(correction) => {
              update(section, row.id, { correction });
              if (correction) patch({ mode: "current" });
            }}
          />
        ) : null}
        {row.correction ? (
          <>
            <Text tone="accent">{t("opening.correction_help")}</Text>
            <Input
              label={t("opening.reason")}
              value={row.reason}
              disabled={blocked || done(row.id)}
              onChange={(reason) => update(section, row.id, { reason })}
            />
          </>
        ) : null}
        {!s?.outcomes.length
          ? btn("opening.remove", () =>
              patch({ [section]: d[section].filter((r) => r.id !== row.id) }),
            )
          : null}
      </Box>
    ));
  const moreRows = (section: OpeningSection) =>
    limit < d[section].length
      ? btn("imports.more", () => setLimit((n) => n + 20))
      : null;
  const targetPicker = (section: "stock" | "customer" | "supplier") => (
    <Box card>
      <Text heading>
        {t("opening.add")} · {sectionName(section)}
      </Text>
      <Input
        label={t("opening.search")}
        value={w.search}
        disabled={blocked}
        onChange={w.setSearch}
      />
      {w.targets.isPending ? <Busy label={t("opening.loading")} /> : null}
      {w.targets.data?.items.map((target) => (
        <Button
          key={target.id}
          label={
            target.name +
            " · " +
            (target.quantity ?? target.balance ?? "0") +
            (target.unit ? " " + unitName(target.unit) : "") +
            (target.opening ? " · " + t("opening.existing") : "") +
            " →"
          }
          disabled={
            blocked ||
            !!s?.outcomes.length ||
            d[section].some((r) => r.targetId === target.id) ||
            d[section].length >= 500
          }
          onPress={() => w.selectTarget(target, section)}
        />
      ))}
      {!w.targets.isPending && !w.targets.data?.items.length ? (
        <Text tone="muted">{t("opening.no_results")}</Text>
      ) : null}
      {pagination(w.offset, w.setOffset, w.targets.data?.more)}
      {importButton(section)}
    </Box>
  );
  const Details = Disclosure ?? (({children}: Children & {label: string}) => <Box>{children}</Box>);
  return (
    <Box>
      {w.view === "hub" ? <Text tone="muted">{t("opening.help")}</Text> : null}
      {err ? (
        <Box card>
          <Text live tone="danger">
            {t(openingErrorKey(err))}
          </Text>
          {btn("imports.refresh", () => {
            if (s) void w.open(s.id);
            else void w.metadata.refetch();
          })}
        </Box>
      ) : null}
      {w.message ? (
        <Text live tone="accent">
          {t(w.message)}
        </Text>
      ) : null}
      {w.busy || w.metadata.isPending ? (
        <Busy label={t("opening.loading")} />
      ) : null}
      {w.pending && !w.busy ? (
        <Box card>
          <Text heading>{t("opening.pending_title")}</Text>
          <Text>{t("opening.pending_help")}</Text>
          <Button
            label={t("opening.resolve")}
            disabled={w.busy}
            primary
            onPress={() => void w.resolve()}
          />
        </Box>
      ) : null}
      {!w.metadata.data ? null : (
        <>
          {w.view !== "edit" && w.view !== "hub" ? (
            <Box row>
              {btn("opening.hub", () => nav("hub"))}
              {w.view !== "review" && w.view !== "history"
                ? btn("opening.history", () => nav("history"))
                : null}
              {w.view !== "review" && w.view !== "suppliers"
                ? btn("opening.supplier_dues", () => {
                    w.setSection("supplier");
                    nav("suppliers");
                  })
                : null}
            </Box>
          ) : null}
          {w.view === "hub" ? (
            <>
              {w.metadata.data.sessions.length ? savedSetups : null}
              {(w.metadata.data.setup === "complete" ? ["current","cutover"] as const : ["cutover","current"] as const).map((mode,index) => (
                <Box card key={mode}>
                  <Text heading>{t(mode === "cutover" ? onboarding ? "opening.onboarding" : "opening.start" : "mobile.audit.balance_review")}</Text>
                  <Text tone="muted">{t("opening."+mode+"_help")}</Text>
                  {btn("opening."+mode,() => void w.start(mode,onboarding?"onboarding":"settings"),index===0)}
                </Box>
              ))}
              {!w.metadata.data.sessions.length ? savedSetups : null}
              <Box row>
                {btn("opening.history", () => nav("history"))}
                {btn("opening.supplier_dues", () => {
                  w.setSection("supplier");
                  nav("suppliers");
                })}
              </Box>
              {onboarding ? (
                <Box card>
                  <Text>{t("opening.optional")}</Text>
                  {btn("opening.skip", () => void w.skip())}
                  {btn("opening.finish", finish)}
                </Box>
              ) : null}
            </>
          ) : null}
          {s && w.view === "edit" ? (
            <>
              {Steps ? (
                <Steps
                  labels={[0, 1, 2, 3, 4].map((step) =>
                    t("opening.step." + step),
                  )}
                  current={d.step}
                  disabled={blocked}
                  onSelect={(step) => {
                    patch({ step });
                    w.setSection(
                      step === 1 ? "stock" : step === 2 ? "customer" : "cash",
                    );
                    w.setSearch("");
                    w.setOffset(0);
                    setLimit(20);
                  }}
                />
              ) : (
                <Box row>
                  {[0, 1, 2, 3, 4].map((step) => (
                    <Button
                      key={step}
                      label={
                        (d.step === step ? "● " : "") +
                        t("opening.step." + step)
                      }
                      disabled={blocked || step === 4}
                      primary={d.step === step}
                      onPress={() => {
                        patch({ step });
                        w.setSection(
                          step === 1
                            ? "stock"
                            : step === 2
                              ? "customer"
                              : "cash",
                        );
                        w.setSearch("");
                        w.setOffset(0);
                        setLimit(20);
                      }}
                    />
                  ))}
                </Box>
              )}
              {d.step === 0 ? (
                <Box card>
                  {!Steps ? <Text heading>{t("opening.step.0")}</Text> : null}
                  <Box row>
                    {(["cutover", "current"] as const).map((mode) => (
                      <Button
                        key={mode}
                        label={
                          (mode === d.mode ? "✓ " : "") + t("opening." + mode)
                        }
                        disabled={blocked || !!s.outcomes.length}
                        primary={mode === d.mode}
                        onPress={() => patch({ mode })}
                      />
                    ))}
                  </Box>
                  <Text tone="muted">{t("opening." + d.mode + "_help")}</Text>
                  {d.mode === "cutover" ? (
                    <Input
                      label={t("opening.as_of")}
                      value={d.asOf}
                      type="date"
                      disabled={blocked || !!s.outcomes.length}
                      onChange={(asOf) => patch({ asOf })}
                    />
                  ) : null}
                  <Input
                    label={t("opening.reference")}
                    value={d.reference}
                    disabled={blocked || !!s.outcomes.length}
                    onChange={(reference) => patch({ reference })}
                  />
                  <Input
                    label={t("opening.note")}
                    value={d.note}
                    multiline
                    disabled={blocked || !!s.outcomes.length}
                    onChange={(note) => patch({ note })}
                  />
                </Box>
              ) : null}
              {d.step === 1 ? (
                <>
                  <Text>{t("opening.stock_help")}</Text>
                  {selectedRows("stock")}
                  {moreRows("stock")}
                  {targetPicker("stock")}
                </>
              ) : null}
              {d.step === 2 ? (
                <>
                  <Box row>
                    {(["customer", "supplier"] as const).map((kind) => (
                      <Button
                        key={kind}
                        label={sectionName(kind)}
                        primary={w.section === kind}
                        disabled={blocked}
                        onPress={() => {
                          w.setSection(kind);
                          w.setSearch("");
                          w.setOffset(0);
                          setLimit(20);
                        }}
                      />
                    ))}
                  </Box>
                  {w.section === "customer" &&
                  !w.metadata.data.customerAvailable ? (
                    <Text>{t("opening.error.premium")}</Text>
                  ) : w.section === "customer" || w.section === "supplier" ? (
                    <>
                      {selectedRows(w.section)}
                      {moreRows(w.section)}
                      {targetPicker(w.section)}
                    </>
                  ) : null}
                </>
              ) : null}
              {d.step === 3 ? (
                <>
                  <Text>{t("opening.cash_help")}</Text>
                  {!d.cash.length
                    ? btn("opening.add_cash", () => void w.addCash())
                    : null}
                  {selectedRows("cash")}
                </>
              ) : null}
              <Box card>
                <Box row>
                  {btn("opening.save", () => void w.saveDraft())}
                  {d.step > 0
                    ? btn("common.back", () => {
                        const step = d.step - 1;
                        patch({ step });
                        w.setSection(
                          step === 1
                            ? "stock"
                            : step === 2
                              ? "customer"
                              : "cash",
                        );
                      })
                    : null}
                  {d.step < 3
                    ? btn(
                        "opening.next",
                        () => {
                          const step = d.step + 1;
                          patch({ step });
                          w.setSection(
                            step === 1
                              ? "stock"
                              : step === 2
                                ? "customer"
                                : "cash",
                          );
                        },
                        true,
                      )
                    : btn("opening.review", () => void w.review(), true)}
                </Box>
                {btn(
                  "opening.hub",
                  () => void w.saveAndLeave(() => nav("hub")),
                )}
              </Box>
            </>
          ) : null}
          {s && w.view === "review" ? (
            <>
              <Box card>
                <Text heading>{t("opening.step.4")}</Text>
                <Text>
                  {t("opening.source")} · {d.reference}
                </Text>
                <Text>
                  {t("opening.as_of")} ·{" "}
                  {s.review
                    ? new Date(s.review.effectiveAt).toLocaleString(undefined, {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      }) + " IST"
                    : "—"}
                </Text>
                {openingProgress(s).map((p) => (
                  <Text key={p.section}>
                    {sectionName(p.section)} · {t("opening.state." + p.state)} ·{" "}
                    {p.done}/{p.total}
                  </Text>
                ))}
              </Box>
              {s.review ? (
                <>
                  {s.review.issues.map((issue) => (
                    <Text key={issue} tone="danger">
                      {t("opening.issue." + issue)}
                    </Text>
                  ))}
                  <Box card>
                    <Text tone="muted">{t("opening.total_help")}</Text>
                    {Object.entries(s.review.totals).map(([key, value]) => (
                      <Text key={key}>
                        {t("opening.total." + key)} · {value ?? "—"}
                      </Text>
                    ))}
                  </Box>
                  {s.review.rows.slice(0, limit).map((row) => (
                    <Box card key={row.id}>
                      <Text heading>
                        {row.name || sectionName(row.section)}
                      </Text>
                      <Text>
                        {sectionName(row.section)} · {row.before} → {row.after}
                        {row.unit ? " " + unitName(row.unit) : ""}
                      </Text>
                      <Text tone="muted">
                        {t("opening.change")} · {row.delta}
                      </Text>
                      {row.issues.map((issue) => (
                        <Text tone="danger" key={issue}>
                          {t("opening.issue." + issue)}
                        </Text>
                      ))}
                      {row.warnings.map((issue) => (
                        <Text tone="muted" key={issue}>
                          {t("opening.issue." + issue)}
                        </Text>
                      ))}
                    </Box>
                  ))}
                  {limit < s.review.rows.length
                    ? btn("imports.more", () => setLimit((n) => n + 20))
                    : null}
                  {s.state === "complete" ? (
                    <Box card>
                      <Text heading>{t("opening.done")}</Text>
                      {btn("opening.finish", finish, true)}
                      {btn("opening.history", () => nav("history"))}
                    </Box>
                  ) : (
                    <Box card>
                      {!owner ? (
                        <Text>{t("opening.owner_help")}</Text>
                      ) : (
                        <>
                          <Text>{t("opening.confirm_help")}</Text>
                          <Check
                            label={t("opening.work_check")}
                            value={work}
                            disabled={blocked}
                            onChange={setWork}
                          />
                          <Check
                            label={t("opening.overlap_check")}
                            value={overlap}
                            disabled={blocked}
                            onChange={setOverlap}
                          />
                          {d.stock.length
                            ? s.review.devices.map((device) => (
                                <Check
                                  key={device.id}
                                  label={
                                    (device.name || t("opening.counter")) +
                                    " · " +
                                    device.id.slice(0, 8) +
                                    " · " +
                                    device.lastSeenAt.slice(0, 10)
                                  }
                                  value={devices.includes(device.id)}
                                  disabled={blocked}
                                  onChange={(checked) =>
                                    setDevices((old) =>
                                      checked
                                        ? [...old, device.id]
                                        : old.filter((id) => id !== device.id),
                                    )
                                  }
                                />
                              ))
                            : null}
                          {s.confirmedHash === s.review.hash
                            ? btn("opening.resume", () => void w.resume(), true)
                            : btn(
                                "opening.confirm",
                                () =>
                                  void w.confirm({
                                    workResolved: work,
                                    overlapReviewed: overlap,
                                    deviceIds: devices,
                                  }),
                                true,
                                !work ||
                                  !overlap ||
                                  !!s.review.issues.length ||
                                  s.review.rows.some(
                                    (r) => r.issues.length > 0,
                                  ) ||
                                  (!!d.stock.length &&
                                    s.review.devices.some(
                                      (device) => !devices.includes(device.id),
                                    )),
                              )}
                        </>
                      )}
                      {btn("opening.edit", w.edit)}
                      {btn("opening.review", () => void w.review())}
                    </Box>
                  )}
                </>
              ) : null}
            </>
          ) : null}
          {w.view === "history" ? (
            <>
              <Text heading>{t("opening.history")}</Text>
              {w.history.isPending ? (
                <Busy label={t("opening.loading")} />
              ) : null}
              {w.history.data?.items.map(({ entry }) => (
                <Box card key={entry.id}>
                  <Text heading>
                    {entry.name || sectionName(entry.section)}
                  </Text>
                  <Text>
                    {t("opening.entry." + entry.type)} ·{" "}
                    {sectionName(entry.section)} · {entry.before} →{" "}
                    {entry.after}
                    {entry.unit ? " " + unitName(entry.unit) : ""}
                  </Text>
                  <Text tone="muted">{t("opening.as_of")} · {entry.asOf}</Text>
                  <Details label={t("mobile.opening.details")}>
                  <Text tone="muted">{t("opening.recorded")} · {entry.recordedAt.slice(0, 10)}</Text>
                  <Text>
                    {t("opening.source")} · {entry.reference} ·{" "}
                    {entry.id.slice(0, 8)}
                  </Text>
                  {entry.reason ? (
                    <Text>
                      {t("opening.reason")} · {entry.reason}
                    </Text>
                  ) : null}
                  {entry.source ? (
                    <Text tone="muted">
                      {entry.source.filename} · {t("imports.row")}{" "}
                      {entry.source.sourceRow}
                    </Text>
                  ) : null}
                  {entry.dueDate ? (
                    <Text>
                      {t("opening.due")} · {entry.dueDate}
                    </Text>
                  ) : null}
                  {entry.unitCost !== null ? (
                    <Text>
                      {t("opening.cost")} · {entry.unitCost}
                    </Text>
                  ) : null}
                  </Details>
                  {entry.type === "opening" || entry.type === "correction"
                    ? btn(
                        "opening.correct",
                        () =>
                          void w.correct(
                            entry,
                            onboarding ? "onboarding" : "settings",
                          ),
                      )
                    : null}
                </Box>
              ))}
              {!w.history.isPending && !w.history.data?.items.length ? (
                <Text tone="muted">{t("opening.no_history")}</Text>
              ) : null}
              {pagination(
                w.historyOffset,
                w.setHistoryOffset,
                w.history.data?.more,
                50,
              )}
            </>
          ) : null}
          {w.view === "suppliers" ? (
            <>
              <Text heading>{t("opening.supplier_dues")}</Text>
              <Text>{t("opening.supplier_help")}</Text>
              <Input
                label={t("opening.search")}
                value={w.search}
                onChange={w.setSearch}
                disabled={blocked}
              />
              {w.targets.isPending ? (
                <Busy label={t("opening.loading")} />
              ) : null}
              {w.targets.data?.items
                .filter((target) => target.opening)
                .map((target) => (
                  <Box card key={target.id}>
                    <Text heading>{target.name}</Text>
                    <Text>
                      {t(
                        Number(target.balance ?? 0) >= 0
                          ? "opening.total.payable"
                          : "opening.total.supplierCredit",
                      )}{" "}
                      · {Math.abs(Number(target.balance ?? 0)).toFixed(2)}
                    </Text>
                    {target.opening?.sessionId &&
                    Number(target.balance) !== 0 &&
                    owner ? (
                      btn(
                        Number(target.balance) > 0
                          ? "opening.pay_supplier"
                          : "opening.receive_supplier",
                        () => {
                          setPayment(target);
                          setAmount("");
                          setReference("");
                          setNote("");
                          setDate(new Date().toISOString());
                        },
                      )
                    ) : !target.opening?.sessionId ? (
                      <Text>{t("opening.legacy_help")}</Text>
                    ) : null}
                  </Box>
                ))}
              {pagination(w.offset, w.setOffset, w.targets.data?.more)}
              {payment ? (
                <Box card>
                  <Text heading>{payment.name}</Text>
                  <Input
                    label={t("opening.amount")}
                    value={amount}
                    type="decimal"
                    onChange={setAmount}
                    disabled={blocked}
                  />
                  <Input
                    label={t("opening.payment_date") + " · IST"}
                    value={date}
                    type="datetime"
                    onChange={setDate}
                    disabled={blocked}
                  />
                  <Box row>
                    {(["cash", "upi", "bank", "card"] as const).map((m) => (
                      <Button
                        key={m}
                        label={
                          (method === m ? "✓ " : "") +
                          t(
                            m === "bank"
                              ? "purchase.method_bank"
                              : "pos.method." + m,
                          )
                        }
                        disabled={blocked}
                        onPress={() => setMethod(m)}
                      />
                    ))}
                  </Box>
                  <Input
                    label={t("opening.reference")}
                    value={reference}
                    onChange={setReference}
                    disabled={blocked}
                  />
                  <Input
                    label={t("opening.note")}
                    value={note}
                    onChange={setNote}
                    disabled={blocked}
                  />
                  {btn(
                    "opening.record_payment",
                    () =>
                      void w.settle({
                        sessionId: payment.opening!.sessionId!,
                        targetId: payment.id,
                        expectedHash: payment.hash!,
                        amount,
                        method,
                        occurredAt: date,
                        reference,
                        note,
                      }),
                    true,
                    !amount || !reference.trim(),
                  )}
                  {btn("common.cancel", () => setPayment(null))}
                </Box>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Box>
  );
}
