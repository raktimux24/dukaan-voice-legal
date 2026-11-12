import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  openingErrorKey,
  openingProgress,
  type OpeningRow,
  type OpeningSection,
  type OpeningTarget,
} from "./contract";
import { useOpenings } from "./workflow";
type Children = { children?: ReactNode };
type Tone = "neutral" | "accent" | "success" | "warning" | "danger";
export type OpeningUi = {
  stablePaymentInput?: boolean;
  ProductPhoto?: ComponentType<{productId?:string|null;name:string}>;
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
    stableWhileTyping?: boolean;
  }>;
  Check: ComponentType<{
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }>;
  Busy: ComponentType<{ label: string }>;
  Select?: ComponentType<{label:string;value:string;options:{value:string;label:string}[];onChange:(value:string)=>void;disabled?:boolean}>;
  Empty?: ComponentType<{title:string;body?:string;actionLabel?:string;onAction?:()=>void}>;
  Tabs?: ComponentType<{items:{key:string;label:string}[];value:string;onChange:(value:string)=>void;disabled?:boolean}>;
  Steps?: ComponentType<{
    labels: string[];
    current: number;
    disabled?: boolean;
    onSelect: (step: number) => void;
    /** Why the last step (Review) can't be chosen from the step bar. */
    lockedHint?: string;
  }>;
  Disclosure?: ComponentType<Children & {label: string}>;
  SavedSetup?: ComponentType<{
    status: string;
    state?: string;
    details: string;
    recordedAt?: string;
    onPress: () => void;
    disabled?: boolean;
  }>;
  /** Small status pill. */
  Badge?: ComponentType<{ label: string; tone?: Tone }>;
  /** Inline banner for guidance, warnings and results. */
  Notice?: ComponentType<Children & { tone: "info" | "danger" | "success" | "warning" }>;
  /** Titled card that groups related content. */
  Section?: ComponentType<Children & { title?: string; hint?: string }>;
  /** Label and value on one line, for totals. */
  Stat?: ComponentType<{ label: string; value: string; tone?: Tone; big?: boolean }>;
  /** Tappable list row or option card. */
  Row?: ComponentType<{
    title: string;
    subtitle?: string;
    description?: string;
    badge?: { label: string; tone?: Tone };
    icon?: string;
    leading?: ReactNode;
    trailing?: "chevron" | "plus" | "check" | "none";
    emphasis?: boolean;
    onPress?: () => void;
    disabled?: boolean;
  }>;
  /** One-of-many choice, as a segmented control or as option cards. */
  Choice?: ComponentType<{
    options: { value: string; label: string; hint?: string }[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    cards?: boolean;
  }>;
  /** Quiet text action. */
  Link?: ComponentType<{ label: string; onPress: () => void; disabled?: boolean; tone?: "danger"; back?: boolean }>;
  /** Action bar that stays visible while the page scrolls. */
  Footer?: ComponentType<{ primary?: ReactNode; secondary?: ReactNode; links?: ReactNode }>;
};
type Props = {
  w: ReturnType<typeof useOpenings>;
  ui: OpeningUi;
  t: (key: string, vars?: Record<string, string | number>) => string;
  owner: boolean;
  onboarding: boolean;
  finish: () => void;
  returnToSetup?: boolean;
  importRows: (
    kind: "stock" | "customer" | "supplier",
    sessionId: string,
  ) => void;
};
/** Plain fallbacks so a host that only supplies the basic blocks still shows every action. */
type ResolvedUi = Required<
  Pick<OpeningUi, "Badge" | "Notice" | "Section" | "Stat" | "Row" | "Choice" | "Link" | "Footer">
> & { Details: ComponentType<Children & { label: string }> };
function resolveUi(ui: OpeningUi): ResolvedUi {
  const { Box, Text, Button } = ui;
  return {
    Badge: ui.Badge ?? (({ label }: { label: string }) => <Text tone="muted">{label}</Text>),
    Notice:
      ui.Notice ??
      (({ tone, children }: Children & { tone: string }) => (
        <Box card>
          {tone === "danger" ? <Text live tone="danger">{children}</Text> : <Text tone={tone === "success" ? "accent" : "muted"}>{children}</Text>}
        </Box>
      )),
    Section:
      ui.Section ??
      (({ title, hint, children }: Children & { title?: string; hint?: string }) => (
        <Box card>
          {title ? <Text heading>{title}</Text> : null}
          {hint ? <Text tone="muted">{hint}</Text> : null}
          {children}
        </Box>
      )),
    Stat: ui.Stat ?? (({ label, value }: { label: string; value: string }) => <Text>{label} · {value}</Text>),
    Row:
      ui.Row ??
      (({ title, subtitle, badge, onPress, disabled, description }: { title: string; subtitle?: string; description?: string; badge?: { label: string }; onPress?: () => void; disabled?: boolean }) =>
        onPress ? (
          <Button
            label={[title, badge?.label, subtitle].filter(Boolean).join(" · ") + " →"}
            onPress={onPress}
            disabled={disabled}
          />
        ) : (
          <Box>
            <Text>{title}</Text>
            {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
            {description ? <Text tone="muted">{description}</Text> : null}
          </Box>
        )),
    Choice:
      ui.Choice ??
      (({ options, value, onChange, disabled }: { options: { value: string; label: string; hint?: string }[]; value: string; onChange: (v: string) => void; disabled?: boolean }) => (
        <Box row>
          {options.map((o) => (
            <Button
              key={o.value}
              label={(o.value === value ? "✓ " : "") + o.label}
              primary={o.value === value}
              disabled={disabled}
              onPress={() => onChange(o.value)}
            />
          ))}
        </Box>
      )),
    Link:
      ui.Link ??
      (({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) => (
        <Button label={label} onPress={onPress} disabled={disabled} />
      )),
    Footer:
      ui.Footer ??
      (({ primary, secondary, links }: { primary?: ReactNode; secondary?: ReactNode; links?: ReactNode }) => (
        <Box card>
          {primary}
          {secondary}
          {links}
        </Box>
      )),
    Details:
      ui.Disclosure ??
      (({ children }: Children & { label: string }) => <Box>{children}</Box>),
  } as ResolvedUi;
}
/** The same workflow and accessible form content on native and web. */
export function OpeningView({
  w,
  ui,
  t,
  owner,
  onboarding,
  finish,
  returnToSetup = false,
  importRows,
}: Props) {
  const { Box, Text, Button, Input, Check, Busy, Steps, SavedSetup, Tabs, ProductPhoto } = ui,
    { Badge, Notice, Section, Stat, Row, Choice, Link, Footer, Details } = useMemo(() => resolveUi(ui), [ui]),
    s = w.session,
    d = w.draft;
  const blocked = w.busy || !!w.pending,
    [work, setWork] = useState(false),
    [overlap, setOverlap] = useState(false),
    [devices, setDevices] = useState<string[]>([]),
    [limit, setLimit] = useState(20);
  const amount = useRef("");
  const amountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [payment, setPayment] = useState<OpeningTarget | null>(null),
    [hasAmount, setHasAmount] = useState(false),
    [amountValue, setAmountValue] = useState(""),
    [reference, setReference] = useState(""),
    [note, setNote] = useState(""),
    [method, setMethod] = useState<"cash" | "upi" | "bank" | "card">("cash"),
    [date, setDate] = useState(() => new Date().toISOString());
  useEffect(() => () => {
    if (amountTimer.current) clearTimeout(amountTimer.current);
  }, []);
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
  /** Step names carry a "2 · " prefix for plain lists; the progress bar already shows the position. */
  const stepName = (step: number) =>
    t("opening.step." + step).replace(/^\s*\d+\s*·\s*/, "");
  // O1: new copy keeps an English fallback until translated (t returns the key when it has no text).
  const reviewLockedHint = () => {
    const text = t("openingweb.review_locked", { action: t("opening.review") });
    return text !== "openingweb.review_locked"
      ? text
      : "Review opens when you tap “" + t("opening.review") + "” on step 4.";
  };
  const stateTone = (state: string): Tone =>
    state === "complete" ? "success" : state === "draft" ? "neutral" : "accent";
  const nav = (view: typeof w.view) => {
    if (!blocked) {
      w.setView(view);
      w.setSearch("");
      w.setOffset(0);
    }
  };
  const sectionForStep = (step: number): OpeningSection =>
    step === 1 ? "stock" : step === 2 ? "customer" : "cash";
  const goStep = (step: number) => {
    patch({ step });
    w.setSection(sectionForStep(step));
    w.setSearch("");
    w.setOffset(0);
    setLimit(20);
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
  const lnk = (
    key: string,
    onPress: () => void,
    disabled = false,
    opts: { tone?: "danger"; back?: boolean } = {},
  ) => (
    <Link
      label={t(key)}
      onPress={onPress}
      disabled={blocked || disabled}
      {...opts}
    />
  );
  const pagination = (
    offset: number,
    set: (n: number) => void,
    more?: boolean,
    size = 30,
  ) =>
    offset > 0 || more ? (
      <Box row>
        {lnk("common.back", () => set(Math.max(0, offset - size)), offset === 0, { back: true })}
        {lnk("imports.more", () => set(offset + size), !more)}
      </Box>
    ) : null;
  const importButton = (kind: "stock" | "customer" | "supplier") => (
    <Row
      icon="import"
      title={t(kind === "stock" ? "imports.title" : "partiesImport." + kind + "_title")}
      onPress={() => void w.importRows(kind, (id) => importRows(kind, id))}
      disabled={blocked || !!s?.outcomes.length}
    />
  );
  const savedSetups = (
    <Section title={t("opening.saved_setups")}>
      {w.metadata.data?.sessions.map((session) =>
        SavedSetup ? (
          <SavedSetup
            key={session.id}
            status={t("opening.state." + session.state)}
            state={session.state}
            details={session.updatedAt.slice(0, 10)}
            recordedAt={session.updatedAt}
            disabled={blocked}
            onPress={() => void w.open(session.id)}
          />
        ) : (
          <Row
            key={session.id}
            title={session.updatedAt.slice(0, 10)}
            badge={{ label: t("opening.state." + session.state), tone: stateTone(session.state) }}
            disabled={blocked}
            onPress={() => void w.open(session.id)}
          />
        ),
      )}
      {!w.metadata.data?.sessions.length ? (
        <Text tone="muted">{t("opening.no_saved")}</Text>
      ) : null}
    </Section>
  );
  const selectedRows = (section: OpeningSection) =>
    d[section].slice(0, limit).map((row) => {
      const locked = blocked || done(row.id);
      return (
        <Section key={row.id}>
          <Box row>
            {section === "stock" && ProductPhoto ? (
              <ProductPhoto productId={row.targetId} name={row.name} />
            ) : null}
            <Box>
              <Text heading>
                {row.name || sectionName(section)}
                {row.unit ? " · " + unitName(row.unit) : ""}
              </Text>
              {done(row.id) ? (
                <Badge label={t("opening.state.complete")} tone="success" />
              ) : null}
            </Box>
          </Box>
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
                disabled={locked}
                onChange={(quantity) => update(section, row.id, { quantity })}
              />
              <Input
                label={t("opening.cost")}
                value={row.unitCost}
                type="decimal"
                disabled={locked}
                onChange={(unitCost) => update(section, row.id, { unitCost })}
              />
              <Text tone="muted">{t("opening.cost_help")}</Text>
              <Details label={t("mobile.opening.details")}>
                <Input
                  label={t("imports.field.batchNumber")}
                  value={row.batchNumber}
                  disabled={locked}
                  onChange={(batchNumber) =>
                    update(section, row.id, { batchNumber })
                  }
                />
                <Input
                  label={t("imports.field.expiryDate")}
                  value={row.expiry}
                  type="date"
                  clearLabel={t("common.remove")}
                  disabled={locked}
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
                disabled={locked}
                onChange={(amount) => update(section, row.id, { amount })}
              />
              {section !== "cash" ? (
                <>
                  <Choice
                    value={row.direction}
                    disabled={locked}
                    onChange={(direction) =>
                      update(section, row.id, {
                        direction: direction as OpeningRow["direction"],
                      })
                    }
                    options={(["party_owes", "shop_owes"] as const).map((direction) => ({
                      value: direction,
                      label: t("opening.direction." + section + "." + direction),
                    }))}
                  />
                  <Input
                    label={t("opening.due")}
                    value={row.dueDate}
                    type="date"
                    clearLabel={t("common.remove")}
                    disabled={locked}
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
              <Notice tone="warning">
                <Text>{t("opening.correction_help")}</Text>
              </Notice>
              <Input
                label={t("opening.reason")}
                value={row.reason}
                disabled={locked}
                onChange={(reason) => update(section, row.id, { reason })}
              />
            </>
          ) : null}
          {!s?.outcomes.length
            ? lnk(
                "opening.remove",
                () => patch({ [section]: d[section].filter((r) => r.id !== row.id) }),
                false,
                { tone: "danger" },
              )
            : null}
        </Section>
      );
    });
  const moreRows = (section: OpeningSection) =>
    limit < d[section].length ? lnk("imports.more", () => setLimit((n) => n + 20)) : null;
  const targetPicker = (section: "stock" | "customer" | "supplier") => (
    <Section title={t("opening.add") + " · " + sectionName(section)}>
      <Input
        label={t("opening.search")}
        value={w.search}
        disabled={blocked}
        onChange={w.setSearch}
      />
      {w.targets.isPending ? <Busy label={t("opening.loading")} /> : null}
      {w.targets.data?.items.map((target) => {
        const added = d[section].some((r) => r.targetId === target.id);
        return (
          <Row
            key={target.id}
            title={target.name}
            subtitle={
              (target.quantity ?? target.balance ?? "0") +
              (target.unit ? " " + unitName(target.unit) : "")
            }
            badge={
              target.opening
                ? { label: t("opening.existing"), tone: "warning" }
                : undefined
            }
            leading={
              section === "stock" && ProductPhoto ? (
                <ProductPhoto productId={target.id} name={target.name} />
              ) : undefined
            }
            trailing={added ? "check" : "plus"}
            disabled={
              blocked ||
              !!s?.outcomes.length ||
              added ||
              d[section].length >= 500
            }
            onPress={() => w.selectTarget(target, section)}
          />
        );
      })}
      {!w.targets.isPending && !w.targets.data?.items.length ? (
        <Text tone="muted">{t("opening.no_results")}</Text>
      ) : null}
      {pagination(w.offset, w.setOffset, w.targets.data?.more)}
      {importButton(section)}
    </Section>
  );
  const hubTab = w.view === "history" ? "history" : w.view === "suppliers" ? "suppliers" : "hub";
  const openTab = (key: string) => {
    if (key === "suppliers") w.setSection("supplier");
    nav(key as typeof w.view);
  };
  const tabItems = [
    { key: "hub", label: t("opening.hub") },
    { key: "history", label: t("opening.history") },
    { key: "suppliers", label: t("opening.supplier_dues") },
  ];
  const tabsBar = Tabs ? (
    <Tabs items={tabItems} value={hubTab} onChange={openTab} disabled={blocked} />
  ) : (
    <Box row>
      {tabItems
        .filter((i) => i.key !== hubTab)
        .map((i) => (
          <Button key={i.key} label={i.label} onPress={() => openTab(i.key)} disabled={blocked} />
        ))}
    </Box>
  );
  const startCards = (
    w.metadata.data?.setup === "complete"
      ? (["current", "cutover"] as const)
      : (["cutover", "current"] as const)
  ).map((mode, index) => (
    <Row
      key={mode}
      icon={mode === "cutover" ? "fresh" : "reconcile"}
      title={t("opening." + mode)}
      description={t("opening." + mode + "_help")}
      emphasis={index === 0}
      disabled={blocked}
      onPress={() => void w.start(mode, onboarding ? "onboarding" : "settings")}
    />
  ));
  const startSection = (
    <Section
      title={t(onboarding ? "opening.onboarding" : "opening.start")}
    >
      {startCards}
    </Section>
  );
  const hasSetups = !!w.metadata.data?.sessions.length;
  return (
    <Box>
      {err ? (
        <Notice tone="danger">
          <Text live tone="danger">
            {t(openingErrorKey(err))}
          </Text>
          {lnk("imports.refresh", () => {
            if (s) void w.open(s.id);
            else void w.metadata.refetch();
          })}
        </Notice>
      ) : null}
      {w.message ? (
        <Notice tone="success">
          <Text live>{t(w.message)}</Text>
        </Notice>
      ) : null}
      {w.busy || w.metadata.isPending ? (
        <Busy label={t("opening.loading")} />
      ) : null}
      {w.pending && !w.busy ? (
        <Notice tone="warning">
          <Text heading>{t("opening.pending_title")}</Text>
          <Text>{t("opening.pending_help")}</Text>
          <Button
            label={t("opening.resolve")}
            disabled={w.busy}
            primary
            onPress={() => void w.resolve()}
          />
        </Notice>
      ) : null}
      {!w.metadata.data ? null : (
        <>
          {w.view === "hub" || w.view === "history" || w.view === "suppliers" ? (
            <>
              {w.view === "hub" ? (
                <Notice tone="info">
                  <Text tone="muted">{t("opening.help")}</Text>
                </Notice>
              ) : null}
              {tabsBar}
            </>
          ) : w.view === "review" ? (
            lnk("opening.hub", () => nav("hub"), false, { back: true })
          ) : null}
          {w.view === "hub" ? (
            <>
              {hasSetups ? savedSetups : null}
              {startSection}
              {!hasSetups ? savedSetups : null}
              {onboarding ? (
                <>
                  <Text tone="muted">{t("opening.optional")}</Text>
                  <Footer
                    primary={btn(returnToSetup ? "setup.backSetup" : "opening.finish", finish, true)}
                    links={lnk("opening.skip", () => void w.skip(returnToSetup ? finish : undefined))}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {s && w.view === "edit" ? (
            <>
              {Steps ? (
                <Steps
                  labels={[0, 1, 2, 3, 4].map(stepName)}
                  current={d.step}
                  disabled={blocked}
                  onSelect={goStep}
                  lockedHint={d.step < 4 ? reviewLockedHint() : undefined}
                />
              ) : (
                <Box row>
                  {[0, 1, 2, 3, 4].map((step) => (
                    <Button
                      key={step}
                      label={(d.step === step ? "● " : "") + t("opening.step." + step)}
                      disabled={blocked || step === 4}
                      primary={d.step === step}
                      onPress={() => goStep(step)}
                    />
                  ))}
                </Box>
              )}
              {d.step === 0 ? (
                <>
                  <Section>
                    <Choice
                      cards
                      value={d.mode}
                      disabled={blocked || !!s.outcomes.length}
                      onChange={(mode) => patch({ mode: mode as typeof d.mode })}
                      options={(["cutover", "current"] as const).map((mode) => ({
                        value: mode,
                        label: t("opening." + mode),
                        hint: t("opening." + mode + "_help"),
                      }))}
                    />
                  </Section>
                  <Section>
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
                  </Section>
                </>
              ) : null}
              {d.step === 1 ? (
                <>
                  <Notice tone="info">
                    <Text tone="muted">{t("opening.stock_help")}</Text>
                  </Notice>
                  {selectedRows("stock")}
                  {moreRows("stock")}
                  {targetPicker("stock")}
                </>
              ) : null}
              {d.step === 2 ? (
                <>
                  <Choice
                    value={w.section}
                    disabled={blocked}
                    onChange={(kind) => {
                      w.setSection(kind as OpeningSection);
                      w.setSearch("");
                      w.setOffset(0);
                      setLimit(20);
                    }}
                    options={(["customer", "supplier"] as const).map((kind) => ({
                      value: kind,
                      label: sectionName(kind),
                    }))}
                  />
                  {w.section === "customer" &&
                  !w.metadata.data.customerAvailable ? (
                    <Notice tone="warning">
                      <Text>{t("opening.error.premium")}</Text>
                    </Notice>
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
                  <Notice tone="info">
                    <Text tone="muted">{t("opening.cash_help")}</Text>
                  </Notice>
                  {!d.cash.length ? (
                    <Row
                      icon="cash"
                      title={t("opening.add_cash")}
                      trailing="plus"
                      disabled={blocked}
                      onPress={() => void w.addCash()}
                    />
                  ) : null}
                  {selectedRows("cash")}
                </>
              ) : null}
              <Footer
                secondary={
                  d.step > 0
                    ? btn("common.back", () => {
                        const step = d.step - 1;
                        patch({ step });
                        w.setSection(sectionForStep(step));
                      })
                    : undefined
                }
                primary={
                  d.step < 3
                    ? btn(
                        "opening.next",
                        () => {
                          const step = d.step + 1;
                          patch({ step });
                          w.setSection(sectionForStep(step));
                        },
                        true,
                      )
                    : btn("opening.review", () => void w.review(), true)
                }
                links={
                  <>
                    {lnk("opening.save", () => void w.saveDraft())}
                    {lnk("opening.hub", () => void w.saveAndLeave(() => nav("hub")))}
                  </>
                }
              />
            </>
          ) : null}
          {s && w.view === "review" ? (
            <>
              <Section title={t("opening.step.4").replace(/^\s*\d+\s*·\s*/, "")}>
                <Stat label={t("opening.source")} value={d.reference || "—"} />
                <Stat
                  label={t("opening.as_of")}
                  value={
                    s.review
                      ? new Date(s.review.effectiveAt).toLocaleString(undefined, {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }) + " IST"
                      : "—"
                  }
                />
                {openingProgress(s).map((p) => (
                  <Stat
                    key={p.section}
                    label={sectionName(p.section)}
                    value={t("opening.state." + p.state) + " · " + p.done + "/" + p.total}
                    tone={stateTone(p.state)}
                  />
                ))}
              </Section>
              {s.review ? (
                <>
                  {s.review.issues.length ? (
                    <Notice tone="danger">
                      {s.review.issues.map((issue) => (
                        <Text key={issue} tone="danger">
                          {t("opening.issue." + issue)}
                        </Text>
                      ))}
                    </Notice>
                  ) : null}
                  <Section hint={t("opening.total_help")}>
                    {Object.entries(s.review.totals).map(([key, value]) => (
                      <Stat
                        key={key}
                        label={t("opening.total." + key)}
                        value={String(value ?? "—")}
                        big={["receivable", "payable", "cash"].includes(key)}
                      />
                    ))}
                  </Section>
                  {s.review.rows.slice(0, limit).map((row) => {
                    const change = Number(row.delta);
                    return (
                      <Section key={row.id}>
                        <Box row>
                          {row.section === "stock" && ProductPhoto ? (
                            <ProductPhoto productId={row.targetId} name={row.name} />
                          ) : null}
                          <Box>
                            <Text heading>{row.name || sectionName(row.section)}</Text>
                            <Badge label={sectionName(row.section)} />
                          </Box>
                        </Box>
                        <Stat
                          label={row.before + " → " + row.after + (row.unit ? " " + unitName(row.unit) : "")}
                          value={(change > 0 ? "+" : "") + row.delta}
                          tone={change > 0 ? "success" : change < 0 ? "warning" : "neutral"}
                          big
                        />
                        {row.issues.map((issue) => (
                          <Notice tone="danger" key={issue}>
                            <Text tone="danger">{t("opening.issue." + issue)}</Text>
                          </Notice>
                        ))}
                        {row.warnings.map((issue) => (
                          <Text tone="muted" key={issue}>
                            {t("opening.issue." + issue)}
                          </Text>
                        ))}
                      </Section>
                    );
                  })}
                  {limit < s.review.rows.length ? lnk("imports.more", () => setLimit((n) => n + 20)) : null}
                  {s.state === "complete" ? (
                    <>
                      <Notice tone="success">
                        <Text heading>{t("opening.done")}</Text>
                      </Notice>
                      <Footer
                        primary={btn(returnToSetup ? "setup.backSetup" : "opening.finish", finish, true)}
                        links={lnk("opening.history", () => nav("history"))}
                      />
                    </>
                  ) : (
                    <>
                      {!owner ? (
                        <Notice tone="info">
                          <Text tone="muted">{t("opening.owner_help")}</Text>
                        </Notice>
                      ) : (
                        <Section hint={t("opening.confirm_help")}>
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
                        </Section>
                      )}
                      <Footer
                        secondary={btn("opening.edit", w.edit)}
                        primary={
                          !owner
                            ? btn("opening.review", () => void w.review(), true)
                            : s.confirmedHash === s.review.hash
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
                                )
                        }
                        links={owner ? lnk("opening.review", () => void w.review()) : undefined}
                      />
                    </>
                  )}
                </>
              ) : null}
            </>
          ) : null}
          {w.view === "history" ? (
            <>
              {w.history.isPending ? (
                <Busy label={t("opening.loading")} />
              ) : null}
              {w.history.data?.items.map(({ entry }) => (
                <Section key={entry.id}>
                  <Box>
                    <Badge
                      label={t("opening.entry." + entry.type)}
                      tone={entry.type === "opening" ? "accent" : entry.type === "settlement" ? "success" : "warning"}
                    />
                    <Text heading>{entry.name || sectionName(entry.section)}</Text>
                    <Text tone="muted">
                      {sectionName(entry.section)} · {t("opening.as_of")} {entry.asOf}
                    </Text>
                  </Box>
                  <Stat
                    label={entry.before + " → " + entry.after + (entry.unit ? " " + unitName(entry.unit) : "")}
                    value={(Number(entry.delta) > 0 ? "+" : "") + entry.delta}
                    tone={Number(entry.delta) > 0 ? "success" : Number(entry.delta) < 0 ? "warning" : "neutral"}
                    big
                  />
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
                </Section>
              ))}
              {!w.history.isPending && !w.history.data?.items.length ? (
                <Section>
                  <Text tone="muted">{t("opening.no_history")}</Text>
                </Section>
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
              <Notice tone="info">
                <Text tone="muted">{t("opening.supplier_help")}</Text>
              </Notice>
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
                .map((target) => {
                  const owed = Number(target.balance ?? 0) >= 0;
                  return (
                    <Section key={target.id}>
                      <Text heading>{target.name}</Text>
                      <Stat
                        label={t(owed ? "opening.total.payable" : "opening.total.supplierCredit")}
                        value={Math.abs(Number(target.balance ?? 0)).toFixed(2)}
                        tone={owed ? "warning" : "success"}
                        big
                      />
                      {target.opening &&
                      Number(target.balance) !== 0 &&
                      owner ? (
                        btn(
                          Number(target.balance) > 0
                            ? "opening.pay_supplier"
                            : "opening.receive_supplier",
                          () => {
                            setPayment(target);
                            amount.current = "";
                            if (amountTimer.current) clearTimeout(amountTimer.current);
                            setHasAmount(false);
                            setAmountValue("");
                            setReference("");
                            setNote("");
                            setDate(new Date().toISOString());
                          },
                          payment?.id === target.id,
                        )
                      ) : null}
                    </Section>
                  );
                })}
              {pagination(w.offset, w.setOffset, w.targets.data?.more)}
              {payment ? (
                <Section key={payment.id} title={payment.name}>
                  <Input
                    label={t("opening.amount")}
                    value={ui.stablePaymentInput ? "" : amountValue}
                    type="decimal"
                    stableWhileTyping={ui.stablePaymentInput}
                    onChange={(value) => {
                      amount.current = value;
                      if (ui.stablePaymentInput) {
                        if (amountTimer.current) clearTimeout(amountTimer.current);
                        amountTimer.current = setTimeout(() => setHasAmount(!!amount.current.trim()), 300);
                      } else {
                        setHasAmount(!!value.trim());
                        setAmountValue(value);
                      }
                    }}
                    disabled={blocked}
                  />
                  <Input
                    label={t("opening.payment_date") + " · IST"}
                    value={date}
                    type="datetime"
                    onChange={setDate}
                    disabled={blocked}
                  />
                  <Choice
                    value={method}
                    disabled={blocked}
                    onChange={(m) => setMethod(m as typeof method)}
                    options={(["cash", "upi", "bank", "card"] as const).map((m) => ({
                      value: m,
                      label: t(m === "bank" ? "purchase.method_bank" : "pos.method." + m),
                    }))}
                  />
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
                </Section>
              ) : null}
              {payment ? (
                <Footer
                  secondary={btn("common.cancel", () => setPayment(null))}
                  primary={btn(
                    "opening.record_payment",
                    () => {
                      if (!amount.current.trim()) return;
                      void w.settle({
                        sessionId: payment.opening!.sessionId ?? payment.opening!.ref.replace(/^legacy:/, ""),
                        targetId: payment.id,
                        expectedHash: payment.hash!,
                        amount: amount.current,
                        method,
                        occurredAt: date,
                        reference,
                        note,
                      });
                    },
                    true,
                    !hasAmount || !reference.trim(),
                  )}
                />
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Box>
  );
}
