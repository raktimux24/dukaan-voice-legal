"use client";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useShop } from "./context";
import {
  BuyerFields,
  emptyBuyer,
  useGstText,
  TextField,
  Section,
} from "./gst-ui";
import { Button, Notice, Card } from "./ui";
import {
  ReadState,
  useGstPages,
  useGstQuery,
  More,
  useGstAction,
} from "./gst-workspace";
import { canonicalJson } from "../../lib/shop/gst-core/sale-request-canonical";
import { validGstin } from "../../lib/shop/gst-core/gst";
import type { Buyer, GstSupplier } from "../../lib/shop/gst-types";
export function SupplierEditor({
  initial,
  onSaved,
  legacyName,
}: {
  initial?: GstSupplier;
  onSaved: (v: GstSupplier) => void;
  legacyName?: string;
}) {
  const { api, shop } = useShop(),
    text = useGstText(),
    action = useGstAction(),
    cache = useQueryClient();
  const [identity, setIdentity] = useState<
    Buyer & { inventorySupplierName?: string }
  >(
    initial?.identity ?? {
      ...emptyBuyer(),
      name: legacyName ?? "",
      ...(legacyName ? { inventorySupplierName: legacyName } : {}),
    },
  );
  const retained = useRef<{ clientId: string; identity: Buyer } | null>(null);
  return (
    <Card>
      <fieldset disabled={action.busy || !!retained.current}>
        <BuyerFields
          value={identity}
          onChange={(v) =>
            setIdentity({
              ...v,
              ...(identity.inventorySupplierName
                ? { inventorySupplierName: identity.inventorySupplierName }
                : {}),
            })
          }
        />
      </fieldset>
      {legacyName ? (
        <p className="shop-hint">
          {text("Linked stock supplier")}: {legacyName}
        </p>
      ) : null}
      {retained.current && action.error ? (
        <p className="shop-hint">
          {text(
            "The original request is saved. Retry confirms that request; edits are disabled until its outcome is known.",
          )}
        </p>
      ) : null}
      {action.notice}
      <Button
        disabled={action.busy}
        onClick={() =>
          void action.run(async () => {
            if (!identity.name.trim())
              throw Error(text("Enter supplier name."));
            if (
              identity.gstin &&
              (!validGstin(identity.gstin) ||
                identity.gstin.slice(0, 2) !== identity.stateCode)
            )
              throw Error(text("GSTIN and supplier state must match."));
            const request = retained.current ?? {
              clientId: crypto.randomUUID(),
              identity: structuredClone(identity),
            };
            retained.current = request;
            let saved: GstSupplier;
            if (initial) {
              try {
                saved = await api.gst.updateSupplier(
                  shop!.id,
                  initial.id,
                  request.identity,
                  initial.updatedAt,
                );
              } catch (error) {
                const recorded = await api.gst.supplier(shop!.id, initial.id);
                if (
                  canonicalJson(recorded.identity) !==
                  canonicalJson(request.identity)
                )
                  throw error;
                saved = recorded;
              }
            } else saved = await api.gst.saveSupplier(shop!.id, request);
            retained.current = null;
            await cache.invalidateQueries({ queryKey: ["gst"] });
            onSaved(saved);
          })
        }
      >
        {text(action.busy ? "Saving supplier" : "Save supplier")}
      </Button>
    </Card>
  );
}
export function SupplierPicker({
  value,
  onChange,
}: {
  value: GstSupplier | null;
  onChange: (row: GstSupplier) => void;
}) {
  const { api, shop, perms } = useShop(),
    text = useGstText();
  const [q, setQ] = useState(""),
    [add, setAdd] = useState(false),
    [legacyName, setLegacyName] = useState<string | undefined>();
  const legacy = useGstQuery(
    ["stock-suppliers", q],
    () => api.getSuppliers(shop!.id, q),
    perms.canSeeCost,
  );
  const list = useGstPages(
    ["suppliers", q],
    (cursor) => api.gst.suppliers(shop!.id, q, cursor),
    perms.canSeeCost,
  );
  const rows = list.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <div className="grid gap-4">
      <TextField
        label={text("Search supplier directory")}
        value={q}
        onChange={setQ}
      />
      <ReadState query={list}>
        <div className="gst-picker">
          {rows.map((row) => (
            <button
              type="button"
              key={row.id}
              aria-pressed={value?.id === row.id}
              onClick={() => onChange(row)}
            >
              <b>{row.identity.name}</b>
              <small>{row.identity.gstin || text("Not registered")}</small>
            </button>
          ))}
          {!rows.length ? (
            <p>{text("No suppliers match this search.")}</p>
          ) : null}
        </div>
      </ReadState>
      <More query={list} />
      <ReadState query={legacy}>
        {legacy.data?.suppliers
          .filter(
            (old) =>
              !rows.some(
                (row) =>
                  row.identity.inventorySupplierName === old.name ||
                  row.identity.name === old.name,
              ),
          )
          .map((old) => (
            <div key={old.name} className="gst-row">
              <span>
                {old.name}
                <small>{text("Existing stock supplier")}</small>
              </span>
              <Button
                tone="quiet"
                onClick={() => {
                  setLegacyName(old.name);
                  setAdd(true);
                }}
              >
                {text("Add billing details")}
              </Button>
            </div>
          ))}
      </ReadState>
      {perms.canSeeCost ? (
        <Button
          tone="ghost"
          onClick={() => {
            setLegacyName(undefined);
            setAdd(!add);
          }}
        >
          {text(add ? "Hide supplier form" : "Add supplier")}
        </Button>
      ) : null}
      {add ? (
        <SupplierEditor
          key={legacyName ?? "new"}
          legacyName={legacyName}
          onSaved={(row) => {
            onChange(row);
            setAdd(false);
            setQ("");
          }}
        />
      ) : null}
    </div>
  );
}
