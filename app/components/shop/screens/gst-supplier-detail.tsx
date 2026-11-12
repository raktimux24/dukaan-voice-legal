"use client";
import type {GstSupplier} from '../../../lib/shop/gst-types';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PartyProfileCard } from "../party-profile";
import { useShop } from "../context";
import { Button, PageHeader, NoAccess, Notice } from "../ui";
import { SupplierEditor } from "../gst-supplier";
import { useGstQuery, ReadState } from "../gst-workspace";
import { supplierHistoryUrl } from "../../../lib/shop/suppliers";
import { formatINR } from "../../../lib/shop/money";
export function GstSupplierDetailScreen({ id }: { id: string }) {
  const { shop, userId } = useShop();
  return <Record key={`${shop?.id}:${userId}:${id}`} id={id} />;
}
function Record({ id }: { id: string }) {
  const { api, shop, userId, perms, offline, t } = useShop();
  const [editing, setEditing] = useState<GstSupplier | null>(null);
  const q = useGstQuery(
    ["supplier", id],
    () => api.gst.supplier(shop!.id, id),
    perms.canSeeCost,
  );
  const orders = useQuery({
    queryKey: ["supplier-order-counts", shop?.id, userId],
    enabled: !!shop && perms.canSeeCost,
    queryFn: () => api.purchaseOrders.supplierCounts(shop!.id),
  });
  const list = useQuery({
    queryKey: ["suppliers", shop?.id, userId],
    enabled:
      !!shop && perms.canSeeCost && !!q.data?.identity.inventorySupplierName,
    queryFn: () => api.getSuppliers(shop!.id),
  });
  if (!perms.canSeeCost)
    return (
      <NoAccess
        what={t(
          "suppliers.no_access_subtitle",
          "Only owners and managers can view purchase costs.",
        )}
      />
    );
  const supplier = q.data,
    identity = supplier?.identity,
    receipt = list.data?.suppliers.find(
      (r) => r.name === identity?.inventorySupplierName,
    );
  return (
    <div className="shop-page supplier-workspace">
      <PageHeader
        title={identity?.name ?? t("suppliers.title", "Suppliers")}
        kicker={t("directoryUI.business_details", "Business details")}
        back={{
          href: "/shop/suppliers",
          label: t("suppliers.title", "Suppliers"),
        }}
        actions={
          supplier && !editing ? (
            <Button disabled={offline} onClick={() => setEditing(supplier)}>
              {t("common.edit", "Edit")}
            </Button>
          ) : null
        }
      />
      <ReadState query={q}>
        {supplier && identity ? (
          <>
            <div className="supplier-identity">
              <span className="supplier-monogram" aria-hidden="true">
                {identity.name.slice(0, 1)}
              </span>
              <div>
                <h2>{identity.name}</h2>
                <p>
                  {identity.gstin ||
                    t("gst.registration.unregistered", "Not registered")}
                </p>
                <p>{identity.address}</p>
                {identity.stateCode ? (
                  <p>
                    {t("gst.state." + identity.stateCode, identity.stateCode)}
                  </p>
                ) : null}
              </div>
            </div>
            <Notice error={orders.error ?? list.error} />
            {orders.isError || list.isError ? (
              <Button
                tone="ghost"
                onClick={() => {
                  if (orders.isError) void orders.refetch();
                  if (list.isError) void list.refetch();
                }}
              >
                {t("common.retry", "Try again")}
              </Button>
            ) : null}
            <div className="supplier-record-metrics">
              <div>
                <small>{t("directoryUI.receipts", "Inventory receipts")}</small>
                <strong>
                  {!identity.inventorySupplierName || list.isSuccess
                    ? (receipt?.batches ?? 0)
                    : "—"}
                </strong>
              </div>
              <div>
                <small>{t("po.title", "Purchase orders")}</small>
                <strong>
                  {orders.isSuccess ? (orders.data[id] ?? 0) : "—"}
                </strong>
              </div>
              <div>
                <small>{t("suppliers.total_spend", "Total spend")}</small>
                <strong>{receipt ? formatINR(receipt.spend) : "—"}</strong>
              </div>
            </div>
            {editing ? (
              <section className="supplier-editor">
                <p className="shop-hint">
                  {t(
                    "gst.ui.updates_apply_to_future_invoices_previously_recorded_suppl_0071c1",
                    "Updates apply to future invoices. Previously recorded supplier details stay unchanged.",
                  )}
                </p>
                <SupplierEditor
                  key={editing.id}
                  initial={editing}
                onCancel={()=>setEditing(null)}
                  onSaved={() => {
                    setEditing(null);
                    void q.refetch();
                  }}
                />
              </section>
            ) : null}
            <div className="supplier-links">
              <Button
                href={
                  "/shop/purchases/new?supplierId=" + encodeURIComponent(id)
                }
              >
                {t(
                  "gst.ui.record_invoice_from_this_supplier_4e0675",
                  "Record invoice from this supplier",
                )}
              </Button>
              <Button
                tone="ghost"
                href={
                  "/shop/purchase-orders?supplierId=" + encodeURIComponent(id)
                }
              >
                {t("po.new", "New purchase order")} ›
              </Button>
              <Button
                tone="ghost"
                href={"/shop/purchases?supplierId=" + encodeURIComponent(id)}
              >
                {t(
                  "gst.ui.view_this_supplier_s_invoices_d417c6",
                  "View this supplier’s invoices",
                )}{" "}
                ›
              </Button>
              {identity.inventorySupplierName ? (
                <Button
                  tone="quiet"
                  href={supplierHistoryUrl(identity.inventorySupplierName, id)}
                >
                  {t("suppliers.stock_history", "Stock supplier history")} ›
                </Button>
              ) : null}
            </div>
            <PartyProfileCard kind="supplier" id={id} />
          </>
        ) : null}
      </ReadState>
    </div>
  );
}
