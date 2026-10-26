"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { barcodeErrorKey } from "../../lib/shop/barcodes/client";
import type { BarcodeItem, BarcodePng } from "../../lib/shop/barcodes/contract";
import { useShop } from "./context";
import { Button, Card, Spinner } from "./ui";
export function downloadBarcode(file: BarcodePng) {
  const bytes = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: file.mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ProductBarcodeCard({
  productId,
  item: provided,
  manage = true,
}: {
  productId: string;
  item?: BarcodeItem;
  manage?: boolean;
}) {
  const {
    api,
    shop,
    userId,
    perms,
    t: translate,
    offline,
    setNotice,
  } = useShop();
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(key, key, vars);
  const [open, setOpen] = useState(false),
    [error, setError] = useState<unknown>(null);
  const scope = shop?.id + ":" + userId + ":" + productId,
    current = useRef(scope);
  current.current = scope;
  useEffect(() => {
    setOpen(false);
    setError(null);
  }, [scope]);
  const meta = useQuery({
    queryKey: ["barcodeProduct", shop?.id, productId, userId],
    queryFn: () => api.barcodes.product(shop!.id, productId),
    enabled: !!shop && !!userId && !provided,
    retry: false,
  });
  const item = provided ?? meta.data?.item;
  const png = useQuery({
    queryKey: ["barcodePng", shop?.id, productId, item?.value, userId],
    queryFn: () => api.barcodes.png(shop!.id, productId),
    enabled: open && !!shop && !!userId && !!item?.value && !item.conflict,
    retry: false,
    staleTime: Infinity,
  });
  const copy = async () => {
    const captured = scope;
    try {
      if (item?.value) {
        await navigator.clipboard.writeText(item.value);
        if (current.current === captured) setNotice(t("barcodes.copied"));
      }
    } catch (e) {
      if (current.current === captured) setError(e);
    }
  };
  const problem = error ?? meta.error ?? png.error;
  return (
    <Card className="stack-form">
      <h2 className="shop-section-title">{t("barcodes.title")}</h2>
      {item ? (
        <>
          <p className="break-all font-semibold">
            {item.value ?? t("barcodes.missing")}
          </p>
          {item.value ? (
            <p className="shop-hint">
              {t(item.internal ? "barcodes.internal" : "barcodes.existing")}
            </p>
          ) : null}
          {item.conflict ? (
            <p role="alert" className="text-danger">
              {t("barcodes.error.ambiguous")}
            </p>
          ) : null}
          {item.value ? (
            <div className="flex flex-wrap gap-3">
              <Button tone="ghost" onClick={() => setOpen((v) => !v)}>
                {t(open ? "barcodes.hide" : "barcodes.view")}
              </Button>
              <Button tone="ghost" onClick={() => void copy()}>
                {t("barcodes.copy")}
              </Button>
            </div>
          ) : null}
          {open && png.data ? (
            <>
              <div className="rounded-lg bg-white p-3">
                <img
                  src={"data:image/png;base64," + png.data.base64}
                  alt={t("barcodes.image_label", {
                    name: item.name,
                    value: png.data.value,
                  })}
                  width={png.data.width}
                  height={png.data.height}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    height: "auto",
                    margin: "auto",
                  }}
                />
              </div>
              <p className="shop-hint">{t("barcodes.png_help")}</p>
              <Button tone="ghost" onClick={() => downloadBarcode(png.data!)}>
                {t("barcodes.download")}
              </Button>
            </>
          ) : null}
          {png.isFetching ? <Spinner label={t("barcodes.view")} /> : null}
          {item.aliases.length ? (
            <div>
              <p className="shop-hint">{t("barcodes.aliases")}</p>
              {item.aliases.map((value) => (
                <p key={value} className="break-all">
                  {value}
                </p>
              ))}
            </div>
          ) : null}
          {manage && perms.canEditProducts ? (
            <Button
              tone="ghost"
              href={
                "/shop/products/barcodes?productId=" +
                encodeURIComponent(productId)
              }
            >
              {t(item.value ? "barcodes.manage" : "barcodes.generate")}
            </Button>
          ) : null}
        </>
      ) : meta.isFetching ? (
        <Spinner />
      ) : null}
      {problem ? (
        <div role="alert">
          <p>{t(barcodeErrorKey(problem))}</p>
          <Button
            tone="ghost"
            disabled={offline}
            onClick={() => {
              void meta.refetch();
              if (open) void png.refetch();
              setError(null);
            }}
          >
            {t("barcodes.refresh")}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
