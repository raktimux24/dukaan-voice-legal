"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useShop } from "./context";
import { ProductImageById } from "./product-image";
import { homeBillProductId } from "../../lib/shop/home";
import type { SaleListRow } from "../../lib/shop/types";

export function HomeBillImage({ sale }: { sale: SaleListRow }) {
  const { api, shop, offline } = useShop();
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "128px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // The list response has a name snapshot, but no product identity. Reuse the
  // detail cache, loading only visible bills rather than guessing from today's
  // catalogue (which may have renamed or duplicate products).
  const detail = useQuery({
    queryKey: ["sale", shop?.id, sale.id],
    queryFn: () => api.getSale(shop!.id, sale.id),
    enabled: visible && !!shop && !!sale.firstItem && !offline,
    staleTime: 60_000,
    retry: false,
  });
  const bill = detail.data;
  const productId =
    bill?.shopId === shop?.id && bill?.id === sale.id
      ? homeBillProductId(bill.items, sale.firstItem)
      : null;

  return (
    <span ref={ref} className="home-bill-image">
      <ProductImageById productId={productId} name={sale.firstItem ?? ""} size={48} />
    </span>
  );
}
