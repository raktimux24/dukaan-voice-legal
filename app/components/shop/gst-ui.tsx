"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useShop } from "./context";
import { useShopDates } from "./use-shop-dates";
import { EN_FALLBACK } from "../../lib/shop/en-fallback";
import { GST_STATES, localizedGstStates } from "../../lib/shop/gst-states";
import {
  type Buyer,
  type ProductTax,
  type GstSettings,
} from "../../lib/shop/gst-core/gst";
import { Field, inputClass, Card, Button } from "./ui";

const englishKeys = new Map<string, string>(
  Object.entries(EN_FALLBACK).map(([key, value]) => [value, key]),
);
export function useGstText() {
  const { t } = useShop();
  return (text: string, vars?: Record<string, string | number>) =>
    t(
      englishKeys.get(text) ??
        `web.gst.${text.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      text,
      vars,
    );
}
export function Section({
  title,
  summary,
  children,
  open = false,
}: {
  title: string;
  summary?: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="gst-section" open={open || undefined}>
      <summary>
        <span>
          {title}
          <small>{summary}</small>
        </span>
        <span aria-hidden="true">⌄</span>
      </summary>
      <div className="gst-section-body">{children}</div>
    </details>
  );
}
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  hint,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className={inputClass}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </Field>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <Field label={label}>
      <select
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </Field>
  );
}
export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="shop-toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
export const emptyBuyer = (): Buyer => ({
  name: "",
  gstin: "",
  address: "",
  stateCode: "",
});
export const emptyTax = (): ProductTax => ({
  version: "",
  category: "taxable",
  codeType: "hsn",
  code: "",
  rate: 0,
  reviewed: false,
});
export const emptySettings = (): GstSettings => ({
  version: "",
  registration: "unknown",
  gstin: "",
  legalName: "",
  address: "",
  stateCode: "",
  priceMode: "inclusive",
  effectiveFrom: new Date().toISOString(),
  eInvoiceRequired: false,
  reviewed: false,
});
const states = GST_STATES.map((state) => [state.code, state.label] as const);
export function StateField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const text = useGstText(),
    { t } = useShop();
  const localized = localizedGstStates((key) =>
    t(
      key,
      GST_STATES.find(
        (state) => key === "gst.state." + state.code,
      )?.label.replace(/ \(.*\)/, "") ?? key,
    ),
  ).map((state) => [state.code, state.label] as const);
  return (
    <SelectField
      label={label ?? text("State")}
      value={value}
      onChange={onChange}
      options={[["", text("Choose state")], ...localized]}
    />
  );
}
export function BuyerFields({
  value,
  onChange,
  includeName = true,
}: {
  value: Buyer;
  onChange: (v: Buyer) => void;
  includeName?: boolean;
}) {
  const text = useGstText();
  const patch = (part: Partial<Buyer>) => onChange({ ...value, ...part });
  return (
    <div className="form-grid is-2">
      {includeName ? (
        <TextField
          label={text("Legal name")}
          value={value.name}
          onChange={(name) => patch({ name })}
          required
        />
      ) : null}
      <TextField
        label={text("GSTIN (leave blank if unregistered)")}
        value={value.gstin}
        onChange={(gstin) =>
          patch({
            gstin: gstin.toUpperCase().trim(),
            stateCode:
              gstin.length >= 2 && /^\d{2}/.test(gstin)
                ? gstin.slice(0, 2)
                : value.stateCode,
          })
        }
      />
      <StateField
        value={value.stateCode}
        onChange={(stateCode) => patch({ stateCode })}
      />
      <TextField
        label={text("Address")}
        value={value.address}
        onChange={(address) => patch({ address })}
      />
      <StructuredBuyerAddress value={value} onChange={onChange} />
    </div>
  );
}
export function TaxFields({
  value,
  onChange,
  required = false,
}: {
  value: ProductTax | null;
  onChange: (v: ProductTax | null) => void;
  required?: boolean;
}) {
  const text = useGstText();
  const tax = value ?? emptyTax();
  const patch = (p: Partial<ProductTax>) =>
    onChange({ ...tax, ...p, reviewed: false });
  return (
    <div className="grid gap-4">
      {!required && <Check
        label={text("Product tax settings")}
        checked={!!value}
        onChange={(v) => onChange(v ? emptyTax() : null)}
      />}
      {value ? (
        <>
          <div className="form-grid is-2">
            <SelectField
              label={text("Tax classification")}
              value={tax.category}
              onChange={(category) =>
                patch({
                  category: category as ProductTax["category"],
                  rate: category === "taxable" ? tax.rate : 0,
                })
              }
              options={(["taxable", "exempt", "nil", "non_gst"] as const).map(
                (v) => [
                  v,
                  text(
                    {
                      taxable: "Taxable",
                      exempt: "Exempt",
                      nil: "Nil-rated",
                      non_gst: "Non-GST",
                    }[v],
                  ),
                ],
              )}
            />
            <SelectField
              label={text("Code type")}
              value={tax.codeType}
              onChange={(codeType) =>
                patch({ codeType: codeType as "hsn" | "sac" })
              }
              options={[
                ["hsn", "HSN"],
                ["sac", "SAC"],
              ]}
            />
            <TextField
              label={text("HSN / SAC code")}
              value={tax.code}
              onChange={(code) => patch({ code })}
            />
            {tax.category === "taxable" ? (
              <TextField
                label={text("GST rate (%)")}
                type="number"
                value={String(tax.rate)}
                onChange={(rate) => patch({ rate: Number(rate) })}
              />
            ) : null}
          </div>
          <Check
            label={text("I have reviewed this classification and rate.")}
            checked={tax.reviewed}
            onChange={(reviewed) => onChange({ ...tax, reviewed })}
          />
        </>
      ) : null}
    </div>
  );
}
export function SettingsFields({
  value,
  onChange,
}: {
  value: GstSettings;
  onChange: (v: GstSettings) => void;
}) {
  const text = useGstText();
  const patch = (part: Partial<GstSettings>) =>
    onChange({ ...value, ...part, reviewed: false });
  const registered = ["regular", "composition"].includes(value.registration);
  return (
    <div className="grid gap-4">
      <SelectField
        label={text("GST setup")}
        value={value.registration}
        onChange={(registration) =>
          patch({ registration: registration as GstSettings["registration"] })
        }
        options={[
          ["unknown", text("Choose registration")],
          ["unregistered", text("Not registered")],
          ["regular", text("Regular GST")],
          ["composition", text("Composition")],
        ]}
      />
      <p className="shop-hint">
        {text(
          value.registration === "regular"
            ? "Collect GST on taxable sales and show it on invoices."
            : value.registration === "composition"
              ? "Issue a bill of supply. GST is not charged separately to customers."
              : "Choose your actual GST registration. You can set this up later in Settings.",
        )}
      </p>
      {registered ? (
        <TextField
          label={text("Registration effective from")}
          type="date"
          value={value.effectiveFrom.slice(0, 10)}
          onChange={(day) => patch({ effectiveFrom: day })}
        />
      ) : null}
      {registered ? (
        <BuyerFields
          value={{
            name: value.legalName,
            gstin: value.gstin,
            address: value.address,
            stateCode: value.stateCode,
            structuredAddress: value.structuredAddress,
          }}
          onChange={(buyer) =>
            patch({
              legalName: buyer.name,
              gstin: buyer.gstin,
              address: buyer.address,
              stateCode: buyer.stateCode,
              structuredAddress: buyer.structuredAddress,
            })
          }
        />
      ) : null}
      {!registered ? (
        <StateField
          value={value.stateCode}
          onChange={(stateCode) => patch({ stateCode })}
        />
      ) : null}
      {value.registration === "regular" ? (
        <>
          <SelectField
            label={text("Price entry mode")}
            value={value.priceMode}
            onChange={(priceMode) =>
              patch({ priceMode: priceMode as "inclusive" | "exclusive" })
            }
            options={[
              ["inclusive", text("GST included")],
              ["exclusive", text("GST added")],
            ]}
          />
          <p className="shop-hint">
            {text(
              value.priceMode === "inclusive"
                ? "The price you enter is the customer’s final price. GST is included in it."
                : "GST is added to the selling price you enter to get the customer’s final price.",
            )}
          </p>
        </>
      ) : null}
      <Check
        label={text("Does your business require government e-invoices?")}
        checked={value.eInvoiceRequired}
        onChange={(eInvoiceRequired) => patch({ eInvoiceRequired })}
      />
      <Check
        label={text(
          "I confirm this shop’s GST registration and billing details.",
        )}
        checked={value.reviewed}
        onChange={(reviewed) => onChange({ ...value, reviewed })}
      />
      <p className="shop-hint">
        {text(
          "Confirm tax details for each product before GST billing. Reports prepare files for filing elsewhere.",
        )}
      </p>
    </div>
  );
}
export function Stats({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="gst-stats">
      {items.map((r) => (
        <Card key={r.label} tight>
          <p className="kpi-label">{r.label}</p>
          <p className="kpi-value is-compact">{r.value}</p>
        </Card>
      ))}
    </div>
  );
}
export function useFiscalDate() {
  return useShopDates().formatWhen;
}

function StructuredBuyerAddress({
  value,
  onChange,
}: {
  value: Buyer;
  onChange: (v: Buyer) => void;
}) {
  const text = useGstText();
  const [draft, setDraft] = useState<{
    address1: string;
    address2?: string;
    location: string;
    pincode: string;
  } | null>(value.structuredAddress ?? null);
  function patch(p: Partial<NonNullable<typeof draft>>) {
    setDraft({ ...draft!, ...p });
    onChange({ ...value, structuredAddress: undefined });
  }
  return (
    <Section
      title={text("Structured billing address")}
      summary={value.structuredAddress?.location}
    >
      {draft ? (
        <>
          <TextField
            label={text("Address line 1")}
            value={draft.address1}
            onChange={(address1) => patch({ address1 })}
          />
          <TextField
            label={text("Address line 2 (optional)")}
            value={draft.address2 ?? ""}
            onChange={(address2) => patch({ address2 })}
          />
          <TextField
            label={text("Locality / city")}
            value={draft.location}
            onChange={(location) => patch({ location })}
          />
          <TextField
            label={text("Six-digit pincode")}
            value={draft.pincode}
            onChange={(pincode) => patch({ pincode })}
          />
          <Check
            label={text("I have reviewed these address details.")}
            checked={!!value.structuredAddress}
            onChange={(reviewed) =>
              onChange({
                ...value,
                structuredAddress: reviewed
                  ? { ...draft, reviewed: true }
                  : undefined,
              })
            }
          />
          <Button
            tone="quiet"
            onClick={() => {
              setDraft(null);
              onChange({ ...value, structuredAddress: undefined });
            }}
          >
            {text("Remove")}
          </Button>
        </>
      ) : (
        <Button
          tone="ghost"
          onClick={() => setDraft({ address1: "", location: "", pincode: "" })}
        >
          {text("Add structured billing address")}
        </Button>
      )}
    </Section>
  );
}

export function FiscalDateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const valid = Number.isFinite(Date.parse(value));
  const local = valid
    ? new Date(Date.parse(value) + 19800000).toISOString().slice(0, 16)
    : "";
  return (
    <TextField
      label={label}
      type="datetime-local"
      value={local}
      hint="IST"
      onChange={(v) =>
        onChange(v ? new Date(v + ":00+05:30").toISOString() : "")
      }
    />
  );
}
