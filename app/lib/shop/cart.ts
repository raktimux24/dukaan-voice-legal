'use client';

import { useSyncExternalStore } from 'react';
import { roundPaise } from './money';
import { r3 } from './units';
import type { CreateSalePayload, InventoryItem } from './types';

export type CartLine = {
  key: string;
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  listPrice: number | null;
  discount: number;
  trackStock: boolean;
  available: number | null;
  packSize?: number | null;
  packLabel?: string | null;
};

export type Cart = {
  lines: CartLine[];
  billDiscount: number;
  note: string;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerClientId: string | null;
};

export type PendingSale = {
  clientId: string;
  payload: CreateSalePayload;
  fingerprint: string;
  startedAt: number;
};

const EMPTY_CART: Cart = {
  lines: [],
  billDiscount: 0,
  note: '',
  customerId: null,
  customerName: null,
  customerPhone: null,
  customerClientId: null,
};

const empty = (): Cart => ({
  lines: [],
  billDiscount: 0,
  note: '',
  customerId: null,
  customerName: null,
  customerPhone: null,
  customerClientId: null,
});

type Snapshot<T> = { raw: string | null; value: T };

const cartSnapshots = new Map<string, Snapshot<Cart>>();
const pendingSnapshots = new Map<string, Snapshot<PendingSale | null>>();

function readRaw(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function cartSnapshot(userId: string | null, shopId: string | null): Cart {
  if (!userId || !shopId) return EMPTY_CART;
  const storageKey = cartKey(userId, shopId);
  const raw = readRaw(storageKey);
  const cached = cartSnapshots.get(storageKey);
  if (cached && cached.raw === raw) return cached.value;
  let value = EMPTY_CART;
  if (raw) {
    try {
      const saved = JSON.parse(raw) as Cart;
      if (saved?.lines) value = { ...empty(), ...saved, lines: saved.lines };
    } catch {
      value = EMPTY_CART;
    }
  }
  cartSnapshots.set(storageKey, { raw, value });
  return value;
}

function pendingSnapshot(userId: string | null, shopId: string | null): PendingSale | null {
  if (!userId || !shopId) return null;
  const storageKey = pendingKey(userId, shopId);
  const raw = readRaw(storageKey);
  const cached = pendingSnapshots.get(storageKey);
  if (cached && cached.raw === raw) return cached.value;
  let value: PendingSale | null = null;
  if (raw) {
    try {
      value = JSON.parse(raw) as PendingSale;
    } catch {
      value = null;
    }
  }
  pendingSnapshots.set(storageKey, { raw, value });
  return value;
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function cartKey(userId: string, shopId: string) {
  return `samaan-cart:${userId}:${shopId}`;
}

function pendingKey(userId: string, shopId: string) {
  return `samaan-pending-sale:${userId}:${shopId}`;
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function readCart(userId: string, shopId: string): Cart {
  const saved = readJson<Cart>(cartKey(userId, shopId));
  if (!saved?.lines) return empty();
  return { ...empty(), ...saved, lines: saved.lines };
}

export function writeCart(userId: string, shopId: string, cart: Cart) {
  localStorage.setItem(cartKey(userId, shopId), JSON.stringify(cart));
  emit();
}

export function readPending(userId: string, shopId: string) {
  return readJson<PendingSale>(pendingKey(userId, shopId));
}

export function writePending(userId: string, shopId: string, pending: PendingSale | null) {
  const key = pendingKey(userId, shopId);
  if (!pending) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(pending));
  emit();
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function lineGross(line: CartLine) {
  const list = line.listPrice != null && line.listPrice > line.price ? line.listPrice : line.price;
  return roundPaise(list * line.quantity);
}

export function lineDiscount(line: CartLine) {
  const list = line.listPrice != null && line.listPrice > line.price ? line.listPrice : line.price;
  const priceGap = roundPaise((list - line.price) * line.quantity);
  return roundPaise(Math.min(lineGross(line), priceGap + Math.max(0, line.discount)));
}

export function computeTotals(cart: Cart) {
  const subtotal = roundPaise(cart.lines.reduce((sum, line) => sum + lineGross(line), 0));
  const lineDiscounts = roundPaise(cart.lines.reduce((sum, line) => sum + lineDiscount(line), 0));
  const billDiscount = roundPaise(Math.min(Math.max(0, cart.billDiscount), Math.max(0, subtotal - lineDiscounts)));
  const discount = roundPaise(lineDiscounts + billDiscount);
  return {
    subtotal,
    lineDiscounts,
    billDiscount,
    discount,
    total: roundPaise(Math.max(0, subtotal - discount)),
    itemCount: cart.lines.length,
  };
}

export function saleFingerprint(payload: Omit<CreateSalePayload, 'clientId'>) {
  return JSON.stringify(payload);
}

export function useCart(userId: string | null, shopId: string | null) {
  const cart = useSyncExternalStore(
    subscribeCart,
    () => cartSnapshot(userId, shopId),
    () => EMPTY_CART,
  );
  const pending = useSyncExternalStore(
    subscribeCart,
    () => pendingSnapshot(userId, shopId),
    () => null,
  );

  const update = (next: Cart) => {
    if (!userId || !shopId) return;
    writeCart(userId, shopId, next);
  };

  return {
    cart,
    pending,
    update,
    addProduct(item: InventoryItem, qty = 1): { ok: boolean; capped: boolean; message?: string } {
      if (!userId || !shopId) return { ok: false, capped: false };
      const current = readCart(userId, shopId);
      const track = item.product.trackStock !== false;
      const available = track ? item.quantity : null;
      if (track && (available ?? 0) <= 0) return { ok: false, capped: false, message: `${item.product.name} is out of stock.` };
      const price = item.product.sellingPrice;
      if (price == null) return { ok: false, capped: false, message: 'unpriced' };
      const existing = current.lines.find((line) => line.productId === item.productId);
      let capped = false;
      let nextQty = r3((existing?.quantity ?? 0) + qty);
      if (track && available != null && nextQty > available) {
        nextQty = r3(available);
        capped = true;
      }
      if (nextQty <= 0) return { ok: false, capped: false, message: `${item.product.name} is out of stock.` };
      const line: CartLine = {
        key: existing?.key ?? crypto.randomUUID(),
        productId: item.productId,
        name: item.product.name,
        unit: item.unit,
        quantity: nextQty,
        price: existing?.price ?? price,
        listPrice: price,
        discount: existing?.discount ?? 0,
        trackStock: track,
        available,
        packSize: item.product.packSize,
        packLabel: item.product.packLabel,
      };
      const lines = existing ? current.lines.map((row) => (row.key === existing.key ? line : row)) : [...current.lines, line];
      update({ ...current, lines });
      return { ok: true, capped, message: capped ? `Only ${available} ${item.unit} of ${item.product.name} can be added.` : undefined };
    },
    setQuantity(lineKey: string, quantity: number) {
      if (!userId || !shopId) return { capped: false };
      const current = readCart(userId, shopId);
      let capped = false;
      const lines = current.lines
        .map((line) => {
          if (line.key !== lineKey) return line;
          let next = r3(quantity);
          if (line.trackStock && line.available != null && next > line.available) {
            next = r3(line.available);
            capped = true;
          }
          return { ...line, quantity: next };
        })
        .filter((line) => line.quantity > 0);
      update({ ...current, lines });
      return { capped };
    },
    setPrice(lineKey: string, price: number) {
      if (!userId || !shopId) return;
      const current = readCart(userId, shopId);
      update({ ...current, lines: current.lines.map((line) => (line.key === lineKey ? { ...line, price } : line)) });
    },
    removeLine(lineKey: string) {
      if (!userId || !shopId) return;
      const current = readCart(userId, shopId);
      update({ ...current, lines: current.lines.filter((line) => line.key !== lineKey) });
    },
    patch(partial: Partial<Cart>) {
      if (!userId || !shopId) return;
      update({ ...readCart(userId, shopId), ...partial });
    },
    clear() {
      if (!userId || !shopId) return;
      writeCart(userId, shopId, empty());
      writePending(userId, shopId, null);
    },
    dropProduct(productId: string) {
      if (!userId || !shopId) return;
      const current = readCart(userId, shopId);
      update({ ...current, lines: current.lines.filter((line) => line.productId !== productId) });
    },
  };
}
