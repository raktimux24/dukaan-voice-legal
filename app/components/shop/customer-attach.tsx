"use client";

import { ReadState, useGstQuery, useGstAction } from "./gst-workspace";
import { useQuery } from "@tanstack/react-query";
import { BuyerFields, emptyBuyer, useGstText } from "./gst-ui";
import { useState } from "react";
import { useCart } from "../../lib/shop/cart";
import { formatINR } from "../../lib/shop/money";
import { normalizeIndianMobile } from "../../lib/shop/phone";
import { useShop } from "./context";
import { Button, Field, inputClass } from "./ui";

export function CustomerAttach({ gst = false }: { gst?: boolean }) {
  const text = useGstText();
  const { api, shop, userId, premium, perms, t } = useShop();
  const cartApi = useCart(userId, shop?.id ?? null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const customers = useQuery({
    queryKey: ["customer-search", shop?.id, q],
    enabled:
      !!shop?.id && premium && perms.canManageCustomers && q.trim().length > 1,
    queryFn: () => api.getCustomers(shop!.id, { q: q.trim(), limit: 8 }),
  });

  const parties = useGstQuery(
    ["billing-parties", q],
    () => api.gst.parties(shop!.id, q),
    gst,
  );
  const action = useGstAction();
  if (!shop || !userId) return null;
  const cart = cartApi.cart;
  const attached = !!(cart.customerId || cart.customerName);

  const clear = () => {
    cartApi.patch({
      customerId: null,
      customerName: null,
      customerPhone: null,
      customerClientId: null,
      buyer: undefined,
    });
  };

  const saveNew = () => {
    const normalized = phone.trim() ? normalizeIndianMobile(phone) : null;
    if (normalized === "invalid") {
      setPhoneError("Enter a valid Indian mobile number.");
      return;
    }
    if (!name.trim()) return;
    cartApi.patch({
      customerId: null,
      buyer: cart.buyer ? { ...cart.buyer, name: name.trim() } : undefined,
      customerName: name.trim(),
      customerPhone: normalized,
      customerClientId: cart.customerClientId ?? crypto.randomUUID(),
    });
    setOpen(false);
    setPhoneError(null);
  };

  return (
    <div className="customer-attach">
      {attached ? (
        <div className="shop-toggle">
          <span>
            {cart.customerName}
            {cart.customerPhone ? (
              <span className="text-muted"> · {cart.customerPhone}</span>
            ) : null}
          </span>
          <button
            type="button"
            className="text-sm text-saffron"
            onClick={clear}
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="customer-add"
          onClick={() => setOpen((value) => !value)}
        >
          {t("checkout.add_customer", "Add customer")}
        </button>
      )}
      {open && !attached ? (
        <div className="stack-form">
          {gst || (premium && perms.canManageCustomers) ? (
            <>
              <Field label={t("checkout.pick_customer", "Find a customer")}>
                <input
                  className={inputClass}
                  placeholder={t("customers.search", "Name or phone")}
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                />
              </Field>
              {(customers.data?.customers ?? []).length > 0 ? (
                <div className="shop-list">
                  {customers.data?.customers
                    .filter(
                      (customer) =>
                        !parties.data?.some(
                          (p) =>
                            p.clientId === customer.id ||
                            p.clientId === customer.clientId,
                        ),
                    )
                    .map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        className="shop-list-row"
                        onClick={() => {
                          cartApi.patch({
                            customerId: customer.id,
                            buyer: parties.data?.find(
                              (p) =>
                                p.clientId === customer.id ||
                                p.clientId === customer.clientId,
                            )?.buyer,
                            customerName: customer.name,
                            customerPhone: customer.phone,
                            customerClientId: null,
                          });
                          setOpen(false);
                        }}
                      >
                        <span className="shop-list-main">
                          <span className="shop-list-title">
                            {customer.name}
                          </span>
                          {customer.phone ? (
                            <span className="shop-list-meta">
                              {customer.phone}
                            </span>
                          ) : null}
                        </span>
                        <span className="num text-sm text-muted">
                          {formatINR(customer.balance)}
                        </span>
                      </button>
                    ))}
                </div>
              ) : null}
            </>
          ) : null}
          {gst ? (
            <ReadState query={parties}>
              <div className="shop-list">
                {parties.data?.map((p) => {
                  const customer = customers.data?.customers.find(
                    (c) => c.id === p.clientId || c.clientId === p.clientId,
                  );
                  return (
                    <button
                      type="button"
                      className="shop-list-row"
                      key={p.id}
                      onClick={() => {
                        cartApi.patch({
                          customerId: customer?.id ?? null,
                          customerName: p.buyer.name,
                          customerPhone: customer?.phone ?? null,
                          customerClientId: customer ? null : p.clientId,
                          buyer: p.buyer,
                        });
                        setOpen(false);
                      }}
                    >
                      <span className="shop-list-main">
                        <b>{p.buyer.name}</b>
                        <small>{p.buyer.gstin || text("Not registered")}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </ReadState>
          ) : null}
          <div className="form-grid is-2">
            <Field label={t("customers.add_title", "New customer")}>
              <input
                className={inputClass}
                placeholder={t("customers.name", "Name")}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field label={t("checkout.phone_optional", "Phone")}>
              <input
                className={inputClass}
                inputMode="tel"
                placeholder="10-digit mobile"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </Field>
          </div>
          {phoneError ? (
            <p className="text-sm text-danger">{phoneError}</p>
          ) : null}
          <Button type="button" disabled={!name.trim()} onClick={saveNew}>
            Use this customer
          </Button>
        </div>
      ) : null}
      {gst ? (
        <details className="gst-section">
          <summary>{text("GST buyer details (optional)")}</summary>
          <div className="gst-section-body">
            <BuyerFields
              key={cart.customerId ?? cart.customerClientId ?? "walk-in"}
              value={
                cart.buyer ?? { ...emptyBuyer(), name: cart.customerName ?? "" }
              }
              onChange={(buyer) =>
                cartApi.patch({
                  buyer,
                  customerName: buyer.name || cart.customerName,
                })
              }
            />
            <p className="shop-hint">
              {text(
                "These details belong to the customer selected above and appear on the GST bill.",
              )}
            </p>
            {action.notice}
            {perms.canManageCustomers ? (
              <Button
                disabled={
                  action.busy ||
                  !cart.buyer?.name.trim() ||
                  !cart.buyer?.address.trim() ||
                  !cart.buyer?.stateCode
                }
                tone="ghost"
                onClick={() =>
                  void action.run(async () => {
                    const clientId =
                      cart.customerId ??
                      cart.customerClientId ??
                      crypto.randomUUID();
                    cartApi.patch({
                      customerClientId: cart.customerId ? null : clientId,
                    });
                    const existing = parties.data?.find(
                      (p) => p.clientId === clientId,
                    );
                    if (existing)
                      await api.gst.updateParty(
                        shop.id,
                        existing.id,
                        cart.buyer!,
                      );
                    else
                      await api.gst.saveParty(shop.id, clientId, cart.buyer!);
                  })
                }
              >
                {text("Save customer billing details")}
              </Button>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}
