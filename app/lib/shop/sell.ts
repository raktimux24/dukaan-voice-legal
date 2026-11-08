import { computeTotals, type Cart } from './cart';
import { assertCartTaxSnapshots } from './gst-core/gst-tax-cache';
import type { GstContext } from './gst-core/gst';
import type { InventoryItem, PosSettings } from './types';

export function searchSellCatalog(items: InventoryItem[], value: string, category = 'all') {
  const query = value.toLowerCase().replace(/\s+/g, ' ').trim();
  return items.filter(item => item.product.isActive !== false && (category === 'all' || item.product.category === category))
    .map(item => {
      const name = item.product.name.toLowerCase().replace(/\s+/g, ' ').trim();
      const code = item.product.shortCode?.toLowerCase();
      const barcodes = [item.product.barcode, ...(item.product.barcodeAliases ?? [])].filter((code): code is string => !!code);
      const score = !query ? 1 : code === query || barcodes.includes(value.trim()) ? 100
        : name.startsWith(query) ? 80 : name.split(' ').some(word => word.startsWith(query)) ? 60
        : name.includes(query) ? 40 : code?.startsWith(query) ? 30
        : barcodes.some(code => code.toLowerCase().includes(query)) ? 20 : 0;
      return { item, score };
    }).filter(row => row.score > 0)
    .sort((a, b) => query ? b.score - a.score || a.item.product.name.localeCompare(b.item.product.name) : 0)
    .map(row => row.item);
}

export function sellAmount(value: string) {
  if (!value.trim() || !/^\d+(?:\.\d{0,2})?$/.test(value.trim())) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function sellBillPreview(cart: Cart, settings: PosSettings | undefined, shopId: string, now = new Date().toISOString()) {
  const basic = computeTotals(cart);
  if (!settings) return { totals: basic, reviewTax: cart.lines.length > 0, context: null };
  const gst = settings.gstSettings;
  const context: GstContext | null = gst && ['regular', 'composition'].includes(gst.registration)
    ? { settings: gst, priceMode: cart.gstPriceMode ?? gst.priceMode, placeOfSupply: gst.stateCode, ...(cart.buyer ? { buyer: cart.buyer } : {}) } : null;
  try {
    if (context && cart.lines.length) {
      if (!settings.gstAvailable) throw Error('GST unavailable');
      if (gst?.registration === 'regular') {
        assertCartTaxSnapshots({ gstTaxSnapshotsRequired: true, lines: cart.lines }, shopId, now);
        if (cart.lines.some(line => !line.rsp && line.gstRspSnapshot?.profiles.length)) throw Error('Review package details');
      }
    }
    return { totals: computeTotals(cart, context), reviewTax: false, context };
  } catch {
    // Never present an untaxed fallback as the payable amount. Checkout performs
    // the authoritative refresh, package review, rounding and issuance checks.
    return { totals: basic, reviewTax: true, context };
  }
}

export function sellStockShortfalls(cart: Cart, items: InventoryItem[]) {
  return cart.lines.filter(line => {
    const current = items.find(item => item.productId === line.productId);
    const available = current ? current.quantity : line.available;
    return line.trackStock && available != null && line.quantity > available;
  });
}
