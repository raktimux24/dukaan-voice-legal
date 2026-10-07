"use client";
import { useState } from "react";
import { useShop } from "../context";
import { Card, Button, PageHeader, NoAccess } from "../ui";
import { SupplierEditor } from "../gst-supplier";
import { useGstQuery, ReadState } from "../gst-workspace";
import { useGstText } from "../gst-ui";
export function GstSupplierDetailScreen({ id }: { id: string }) {
  const { api, shop, perms } = useShop(),
    text = useGstText();
  const [editing, setEditing] = useState(false);
  const q = useGstQuery(
    ["supplier", id],
    () => api.gst.supplier(shop!.id, id),
    perms.canSeeCost,
  );
  if (!perms.canSeeCost)
    return (
      <NoAccess
        what={text(
          "Suppliers show purchase prices, so helpers cannot open them.",
        )}
      />
    );
  const supplier = q.data;
  return (
    <div className="shop-page">
      <PageHeader
        title={supplier?.identity.name ?? text("Supplier")}
        back={{ href: "/shop/suppliers", label: text("Suppliers") }}
      />
      <ReadState query={q}>
        {supplier ? (
          <>
            <Card>
              <h2>{supplier.identity.name}</h2>
              <p>{supplier.identity.gstin || text("Not registered")}</p>
              <p>{supplier.identity.address}</p>
              <Button tone="ghost" onClick={() => setEditing((v) => !v)}>
                {text("Edit supplier")}
              </Button>
              <Button href={"/shop/purchases?supplierId=" + id} tone="ghost">
                {text("Recorded invoices")}
              </Button>
              {supplier.identity.inventorySupplierName ? (
                <Button
                  href={
                    "/shop/suppliers/" +
                    encodeURIComponent(supplier.identity.inventorySupplierName)
                  }
                  tone="quiet"
                >
                  {text("Stock supplier history")}
                </Button>
              ) : null}
            </Card>
            {editing ? (
              <SupplierEditor
                key={supplier.id}
                initial={supplier}
                onSaved={() => {
                  setEditing(false);
                  void q.refetch();
                }}
              />
            ) : null}
          </>
        ) : null}
      </ReadState>
    </div>
  );
}
