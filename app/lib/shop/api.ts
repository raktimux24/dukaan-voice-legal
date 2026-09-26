import type { Role } from './permissions';
import { parseRole } from './permissions';
import type {
  AuditLogEntry,
  BriefResponse,
  BuyListItem,
  CreateSalePayload,
  Customer,
  InventoryItem,
  InventoryStats,
  LedgerEntry,
  Member,
  Nudge,
  PaymentMethod,
  PosSettings,
  Product,
  Sale,
  SaleListRow,
  SalesReport,
  SalesSummary,
  ShopRecord,
  StockReport,
  SupplierCompareProduct,
  SupplierDetail,
  SupplierRow,
  StockBatch,
  UnifiedAlerts,
  UserPreferences,
} from './types';

export type TokenGetter = (opts?: { skipCache?: boolean }) => Promise<string | null>;

export class ApiError extends Error {
  status: number;
  code: string;
  feature?: string;

  constructor(message: string, status: number, code = '', feature?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.feature = feature;
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  premium_required: 'This shop needs Premium for that.',
  multi_shop: 'Another shop needs Premium.',
  payments_mismatch: 'The payments do not match the bill total. Check the amounts and try again.',
  credit_requires_customer: 'Udhaar needs a customer on the bill.',
  empty_cart: 'The cart is empty.',
  missing_payments: 'Add a payment before charging.',
  missing_client_id: 'This bill could not be identified. Try again.',
  invalid_payment_method: 'That payment method is not available.',
  invalid_payment_amount: 'Enter a valid payment amount.',
  price_required: 'A product on this bill has no price.',
  product_not_found: 'A product on this bill was not found.',
  product_archived: 'A product on this bill is archived.',
  invalid_quantity: 'Enter a quantity greater than zero.',
  sold_at_too_old: 'This bill was started too long ago. Confirm to charge it as a new bill.',
  already_voided: 'This bill is already voided.',
  void_window_passed: 'The void window for this bill has closed.',
  sale_not_found: 'That bill was not found.',
  sale_voided: 'This bill is voided, so it cannot be returned.',
  return_quantity_exceeds: 'That return is more than the quantity still on the bill.',
  sale_item_not_found: 'That line is not on the bill.',
  credit_refund_requires_customer: 'A credit refund needs the customer who was on the bill. Refund cash or UPI instead.',
  invalid_refund_method: 'That refund method is not available.',
  invalid_range: 'That date range is not valid.',
  name_required: 'A name is required.',
  invalid_phone: 'Enter a valid Indian mobile number.',
  invalid_amount: 'Enter an amount greater than zero.',
  customer_not_found: 'That customer was not found.',
  invalid_vpa: 'Enter a UPI ID like name@bank.',
  invalid_default_method: 'The default payment can be cash or UPI.',
  invalid_void_window: 'The void window must be between 1 and 720 hours.',
  image_required: 'Choose a QR image.',
  image_too_large: 'That QR image is too large. The limit is 1.5 MB of encoded data.',
  decode_failed: 'That image could not be read as a UPI QR. You can still type the UPI ID.',
  subscription_cancel_failed: 'The shop is still here because the subscription could not be cancelled. Try again.',
  'Not a member of this shop': 'You are no longer a member of this shop.',
  'Insufficient permissions': 'You do not have access to that.',
  'Invalid invite code': 'That invite code was not found.',
  'Already a member of this shop': 'You are already a member of this shop.',
  'Owner cannot leave — delete the shop instead': 'Owners delete the shop instead of leaving it.',
  "Cannot change the owner's role": 'The owner role cannot be changed.',
  'Cannot remove the shop owner': 'The owner cannot be removed.',
  'Shop name is required': 'Shop name is required.',
  'Shop name cannot be empty': 'Shop name cannot be empty.',
  'That category is not available for this shop': 'That category is not available for this shop.',
  'Product name is required': 'Product name is required.',
  'Category and sub-category are required': 'Category and sub-category are required.',
  'Quantity must be greater than 0': 'Quantity must be greater than zero.',
  'Valid quantity is required': 'Enter a valid quantity.',
  'No fields to update': 'Change something before saving.',
  'Only the shop owner can change billing.': 'Only the shop owner can change billing.',
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

export async function apiSend<T>(path: string, getToken: TokenGetter, init?: RequestInit, attempt = 0): Promise<T> {
  if (!apiBaseUrl) throw new ApiError('NEXT_PUBLIC_API_BASE_URL is not configured.', 0, 'missing_api');
  const token = await getToken(attempt > 0 ? { skipCache: true } : undefined);
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(60_000),
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401 && attempt === 0) return apiSend<T>(path, getToken, init, 1);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let code = '';
    let feature: string | undefined;
    let message = '';
    try {
      const body = JSON.parse(text) as { error?: string; message?: string; feature?: string };
      code = body.error ?? '';
      feature = body.feature;
      message = body.message ?? '';
    } catch {
      message = text;
    }
    if (typeof window !== 'undefined' && (code === 'Not a member of this shop' || message === 'Not a member of this shop')) {
      window.dispatchEvent(new CustomEvent('samaan-not-member'));
    }
    throw new ApiError(ERROR_MESSAGES[code] ?? (message || code || `Request failed with status ${response.status}`), response.status, code, feature);
  }

  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/csv') || contentType.includes('text/plain')) return (await response.text()) as T;
  return response.json() as Promise<T>;
}

export async function apiText(path: string, getToken: TokenGetter): Promise<string> {
  if (!apiBaseUrl) throw new ApiError('NEXT_PUBLIC_API_BASE_URL is not configured.', 0, 'missing_api');
  const token = await getToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    signal: AbortSignal.timeout(60_000),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let code = '';
    let feature: string | undefined;
    try {
      const body = JSON.parse(text) as { error?: string; feature?: string };
      code = body.error ?? '';
      feature = body.feature;
    } catch {
      code = text;
    }
    throw new ApiError(ERROR_MESSAGES[code] ?? (code || `Request failed with status ${response.status}`), response.status, code, feature);
  }
  return response.text();
}

type ServerInventoryItem = {
  id: string;
  productId: string;
  shopId: string;
  quantity: number;
  unit: string;
  stockStatus: string;
  nearestExpiryDate: string | null;
  updatedAt: string;
  updatedBy: string | null;
  updatedByName: string;
  product: {
    id: string;
    shopId: string;
    name: string;
    barcode: string | null;
    category: string;
    subcategory?: string | null;
    unit: string;
    minStockLevel: number;
    purchasePrice: number | null;
    sellingPrice: number | null;
    mrp?: number | null;
    shortCode?: string | null;
    isActive?: boolean;
    trackStock?: boolean;
    depletionOrder?: string | null;
    packSize?: number | null;
    packLabel?: string | null;
    batchNumber: string | null;
    purchaseDate: string | null;
    expiryDate: string | null;
    createdAt: string;
  };
};

function mapItem(item: ServerInventoryItem, hideCost: boolean): InventoryItem {
  return {
    id: item.id,
    productId: item.productId,
    shopId: item.shopId,
    quantity: Number(item.quantity),
    unit: item.unit,
    stockStatus: item.stockStatus,
    nearestExpiryDate: item.nearestExpiryDate || undefined,
    updatedAt: item.updatedAt,
    updatedBy: item.updatedBy || '',
    updatedByName: item.updatedByName,
    product: {
      id: item.product.id,
      shopId: item.product.shopId,
      name: item.product.name,
      barcode: item.product.barcode || undefined,
      category: item.product.category,
      subcategory: item.product.subcategory ?? null,
      unit: item.product.unit,
      minStockLevel: item.product.minStockLevel,
      purchasePrice: hideCost ? undefined : (item.product.purchasePrice ?? undefined),
      sellingPrice: item.product.sellingPrice,
      mrp: item.product.mrp,
      shortCode: item.product.shortCode,
      isActive: item.product.isActive,
      trackStock: item.product.trackStock,
      depletionOrder: item.product.depletionOrder === 'fifo' ? 'fifo' : 'expiry',
      packSize: item.product.packSize,
      packLabel: item.product.packLabel,
      batchNumber: item.product.batchNumber || undefined,
      purchaseDate: item.product.purchaseDate || undefined,
      expiryDate: item.product.expiryDate || undefined,
      createdAt: item.product.createdAt,
    },
  };
}

function queryString(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

export function bindApi(getToken: TokenGetter) {
  const send = <T>(path: string, init?: RequestInit) => apiSend<T>(path, getToken, init);

  return {
    getShops: async () => {
      const res = await send<{ shops: ShopRecord[] }>('/api/shops');
      return res.shops ?? [];
    },
    createShop: (input: { name: string; category: string; subtype?: string; phone: string; address: string; city: string; language?: string }) =>
      send<{ shop: ShopRecord }>('/api/shops', { method: 'POST', body: JSON.stringify(input) }),
    getShop: (shopId: string) => send<{ shop: ShopRecord; role: string }>(`/api/shops/${shopId}`),
    updateShop: (shopId: string, input: Record<string, unknown>) =>
      send<{ shop: ShopRecord }>(`/api/shops/${shopId}`, { method: 'PATCH', body: JSON.stringify(input) }),
    joinShop: (inviteCode: string) =>
      send<{ shop: ShopRecord; role: string; memberCount: number }>('/api/shops/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
    regenerateInvite: (shopId: string, role?: 'MANAGER' | 'HELPER') =>
      send<{ managerInviteCode: string | null; helperInviteCode: string | null }>(`/api/shops/${shopId}/invite`, {
        method: 'POST',
        body: JSON.stringify(role ? { role } : {}),
      }),
    getMembers: async (shopId: string) => {
      const res = await send<{ members: Member[] }>(`/api/shops/${shopId}/members`);
      return (res.members ?? []).map((member) => ({ ...member, role: parseRole(member.role) ?? ('HELPER' as Role) }));
    },
    updateMemberRole: (shopId: string, memberId: string, role: 'MANAGER' | 'HELPER') =>
      send(`/api/shops/${shopId}/members/${memberId}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    removeMember: (shopId: string, memberId: string) => send(`/api/shops/${shopId}/members/${memberId}`, { method: 'DELETE' }),
    deleteShop: (shopId: string) => send(`/api/shops/${shopId}`, { method: 'DELETE' }),
    leaveShop: (shopId: string) => send(`/api/shops/${shopId}/leave`, { method: 'POST', body: JSON.stringify({}) }),

    getInventoryPage: async (shopId: string, offset = 0, limit = 100, hideCost = false) => {
      const res = await send<{ items: ServerInventoryItem[]; total: number; hasMore: boolean }>(
        `/api/shops/${shopId}/inventory${queryString({ limit, offset })}`,
      );
      return { items: (res.items ?? []).map((item) => mapItem(item, hideCost)), total: res.total, hasMore: res.hasMore };
    },
    getAllInventory: async (shopId: string, hideCost = false) => {
      const all: InventoryItem[] = [];
      let offset = 0;
      let hasMore = true;
      let guard = 0;
      while (hasMore && guard < 50) {
        const page = await send<{ items: ServerInventoryItem[]; total: number; hasMore: boolean }>(
          `/api/shops/${shopId}/inventory${queryString({ limit: 100, offset })}`,
        );
        all.push(...(page.items ?? []).map((item) => mapItem(item, hideCost)));
        hasMore = page.hasMore;
        offset += 100;
        guard += 1;
      }
      return all;
    },
    getInventoryStats: async (shopId: string) => {
      const stats = await send<InventoryStats>(`/api/shops/${shopId}/inventory/stats`);
      return { ...stats, stockValue: Number(stats.stockValue ?? 0), total: Number(stats.total ?? 0), lowStock: Number(stats.lowStock ?? 0), outOfStock: Number(stats.outOfStock ?? 0), nearExpiry: Number(stats.nearExpiry ?? 0) };
    },
    lookupBarcode: async (shopId: string, barcode: string, hideCost = false) => {
      const res = await send<{ found: boolean; item?: ServerInventoryItem }>(
        `/api/shops/${shopId}/inventory/products/by-barcode/${encodeURIComponent(barcode)}`,
      );
      return { found: res.found, item: res.item ? mapItem(res.item, hideCost) : undefined };
    },
    addProduct: (shopId: string, input: Record<string, unknown>) =>
      send<{ product: Product; inventoryItem: InventoryItem }>(`/api/shops/${shopId}/inventory/products`, { method: 'POST', body: JSON.stringify(input) }),
    updateProduct: (shopId: string, productId: string, input: Record<string, unknown>) =>
      send<{ product: Product }>(`/api/shops/${shopId}/inventory/products/${productId}`, { method: 'PATCH', body: JSON.stringify(input) }),
    deleteProduct: (shopId: string, productId: string) => send(`/api/shops/${shopId}/inventory/products/${productId}`, { method: 'DELETE' }),
    updateQuantity: async (shopId: string, itemId: string, quantity: number, hideCost = false) => {
      const res = await send<{ item: ServerInventoryItem }>(`/api/shops/${shopId}/inventory/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
      return mapItem(res.item, hideCost);
    },
    getBatches: async (shopId: string, productId: string, includeDepleted = false) => {
      const res = await send<{ batches: StockBatch[] }>(
        `/api/shops/${shopId}/inventory/products/${productId}/batches${includeDepleted ? '?includeDepleted=true' : ''}`,
      );
      return res.batches ?? [];
    },
    addBatch: (shopId: string, productId: string, input: Record<string, unknown>) =>
      send<{ batch: StockBatch }>(`/api/shops/${shopId}/inventory/products/${productId}/batches`, { method: 'POST', body: JSON.stringify(input) }),
    updateBatch: (shopId: string, batchId: string, input: Record<string, unknown>) =>
      send<{ batch: StockBatch }>(`/api/shops/${shopId}/inventory/batches/${batchId}`, { method: 'PATCH', body: JSON.stringify(input) }),
    removeStock: (shopId: string, productId: string, quantity: number, reason: string, note?: string) =>
      send<{ totalDepleted: number; newQuantity: number }>(`/api/shops/${shopId}/inventory/products/${productId}/remove`, {
        method: 'POST',
        body: JSON.stringify({ quantity, reason, note }),
      }),

    createSale: (shopId: string, payload: CreateSalePayload) =>
      send<{ sale: Sale; deduplicated: boolean }>(`/api/shops/${shopId}/sales`, { method: 'POST', body: JSON.stringify(payload) }),
    getSales: (shopId: string, params: Record<string, string | number | undefined>) =>
      send<{ sales: SaleListRow[]; total: number; hasMore: boolean; limitedToDays: number | null }>(`/api/shops/${shopId}/sales${queryString(params)}`),
    getSale: (shopId: string, saleId: string) => send<Sale>(`/api/shops/${shopId}/sales/${saleId}`),
    getProductSales: (shopId: string, productId: string, days = 30) =>
      send<{ days: number; units: number; revenue: number; bills: number; lastSoldAt: string | null; daysOfCover: number | null }>(
        `/api/shops/${shopId}/sales/products/${productId}/summary?days=${days}`,
      ),
    getSalesSummary: (shopId: string, params: Record<string, string | undefined>) =>
      send<SalesSummary>(`/api/shops/${shopId}/sales/summary${queryString(params)}`),
    getTopProducts: (shopId: string, params: Record<string, string | number | undefined>) =>
      send<{ products: { productId: string | null; name: string; unit: string; quantity: number; revenue: number; bills: number; grossProfit?: number; marginPct?: number | null }[]; limitedToDays: number | null }>(
        `/api/shops/${shopId}/sales/top-products${queryString(params)}`,
      ),
    voidSale: (shopId: string, saleId: string, reason?: string) =>
      send<Sale>(`/api/shops/${shopId}/sales/${saleId}/void`, { method: 'POST', body: JSON.stringify({ reason }) }),
    returnSale: (
      shopId: string,
      saleId: string,
      body: { items: { saleItemId: string; quantity: number; restock?: boolean; reason?: string | null }[]; refundMethod?: PaymentMethod | null; reason?: string | null },
    ) => send<Sale>(`/api/shops/${shopId}/sales/${saleId}/returns`, { method: 'POST', body: JSON.stringify(body) }),
    salesCsv: (shopId: string, params: Record<string, string | undefined>) => apiText(`/api/shops/${shopId}/sales/export.csv${queryString(params)}`, getToken),

    getCustomers: (shopId: string, params: Record<string, string | number | undefined> = {}) =>
      send<{ customers: Customer[]; total: number; hasMore: boolean }>(`/api/shops/${shopId}/customers${queryString(params)}`),
    getCustomerSummary: (shopId: string) =>
      send<{ outstandingTotal: number; debtorCount: number; customerCount: number; top: Customer[] }>(`/api/shops/${shopId}/customers/summary`),
    createCustomer: (shopId: string, body: { name: string; phone?: string | null; notes?: string | null; clientId?: string }) =>
      send<{ customer: Customer; deduplicated: boolean }>(`/api/shops/${shopId}/customers`, { method: 'POST', body: JSON.stringify(body) }),
    getCustomer: (shopId: string, customerId: string) =>
      send<{ customer: Customer; ledger: LedgerEntry[] }>(`/api/shops/${shopId}/customers/${customerId}`),
    updateCustomer: (shopId: string, customerId: string, body: Record<string, unknown>) =>
      send<{ customer: Customer }>(`/api/shops/${shopId}/customers/${customerId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    recordPayment: (shopId: string, customerId: string, body: { amount: number; method: 'cash' | 'upi' | 'card'; note?: string }) =>
      send<{ customer: Customer; entry: LedgerEntry }>(`/api/shops/${shopId}/customers/${customerId}/payments`, { method: 'POST', body: JSON.stringify(body) }),

    getBuyList: async (shopId: string) => {
      const all: BuyListItem[] = [];
      let offset = 0;
      let hasMore = true;
      while (hasMore && offset < 2000) {
        const page = await send<{ items: BuyListItem[]; hasMore: boolean }>(`/api/shops/${shopId}/buy-list${queryString({ limit: 100, offset })}`);
        all.push(...(page.items ?? []));
        hasMore = page.hasMore;
        offset += 100;
      }
      return all;
    },
    addBuyListItem: (shopId: string, input: Record<string, unknown>) =>
      send<{ item: BuyListItem }>(`/api/shops/${shopId}/buy-list`, { method: 'POST', body: JSON.stringify(input) }),
    updateBuyList: (shopId: string, itemId: string, body: { status: BuyListItem['status']; productId?: string }) =>
      send<{ item: BuyListItem }>(`/api/shops/${shopId}/buy-list/${itemId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteBuyListItem: (shopId: string, itemId: string) => send(`/api/shops/${shopId}/buy-list/${itemId}`, { method: 'DELETE' }),

    getSuppliers: (shopId: string, q?: string) =>
      send<{ suppliers: SupplierRow[] }>(`/api/shops/${shopId}/suppliers${queryString({ q })}`),
    getSupplier: (shopId: string, name: string) => send<SupplierDetail>(`/api/shops/${shopId}/suppliers/${encodeURIComponent(name)}`),
    compareSuppliers: (shopId: string) =>
      send<{ products: SupplierCompareProduct[] }>(`/api/shops/${shopId}/suppliers/compare`),

    getSalesReport: (shopId: string, period: string) => send<SalesReport>(`/api/shops/${shopId}/reports/sales?period=${period}`),
    getStockReport: (shopId: string, period: string) => send<StockReport>(`/api/shops/${shopId}/reports/stock?period=${period}`),
    stockCsv: (shopId: string, period: string) => apiText(`/api/shops/${shopId}/reports/stock/movement.csv?period=${period}`, getToken),
    ask: (shopId: string, question: string, language?: string) =>
      send<{ answer: string; intent: string | null }>(`/api/shops/${shopId}/analytics/ask`, {
        method: 'POST',
        body: JSON.stringify({ question, language, voiceFeedbackEnabled: false, ttsAsync: false }),
      }),

    search: (shopId: string, q: string) =>
      send<{
        sales: { id: string; saleNumber: number; total: number; status: string; soldAt: string; customerName: string | null }[];
        customers: { id: string; name: string; phone: string | null; balance: number }[];
        suppliers: { name: string; products: number; lastAt: string | null }[];
      }>(`/api/shops/${shopId}/search${queryString({ q })}`),

    getPosSettings: (shopId: string) => send<PosSettings>(`/api/shops/${shopId}/pos-settings`),
    updatePosSettings: (shopId: string, body: Record<string, unknown>) =>
      send<PosSettings>(`/api/shops/${shopId}/pos-settings`, { method: 'PUT', body: JSON.stringify(body) }),
    uploadUpiQr: (shopId: string, imageBase64: string) =>
      send<PosSettings & { decoded?: { found: boolean; isUpi: boolean; vpa: string | null } }>(`/api/shops/${shopId}/pos-settings/upi-qr`, {
        method: 'POST',
        body: JSON.stringify({ imageBase64 }),
      }),

    getAudit: (shopId: string, filter: string, offset = 0) =>
      send<{ logs: AuditLogEntry[]; total: number; hasMore: boolean; limitedToDays?: number | null }>(
        `/api/shops/${shopId}/audit-log${queryString({ filter, limit: 50, offset })}`,
      ),
    getAllAudit: async (shopId: string) => {
      const all: AuditLogEntry[] = [];
      let offset = 0;
      let hasMore = true;
      while (hasMore && offset < 5000) {
        const page = await send<{ logs: AuditLogEntry[]; hasMore: boolean }>(`/api/shops/${shopId}/audit-log${queryString({ filter: 'all', limit: 100, offset })}`);
        all.push(...(page.logs ?? []));
        hasMore = page.hasMore;
        offset += 100;
      }
      return all;
    },

    getPreferences: () => send<{ preferences: UserPreferences | null }>('/api/preferences'),
    updatePreferences: (body: Partial<UserPreferences>) =>
      send<{ preferences: UserPreferences }>('/api/preferences', { method: 'PATCH', body: JSON.stringify(body) }),
    getTranslations: async (lang: string) => {
      const res = await send<unknown>(`/api/translations/${encodeURIComponent(lang)}`);
      return res;
    },

    getNudges: (shopId: string, surface: 'home' | 'checkout' | 'product' = 'home') =>
      send<{ nudges: Nudge[]; premium: boolean }>(`/api/shops/${shopId}/nudges?surface=${surface}`),
    getBrief: (shopId: string) => send<BriefResponse>(`/api/shops/${shopId}/nudges/brief`),
    nudgeEvent: (shopId: string, id: string, event: 'shown' | 'tapped' | 'dismissed') =>
      send(`/api/shops/${shopId}/nudges/${id}/event`, { method: 'POST', body: JSON.stringify({ event, surface: 'home' }) }),
    actNudge: (shopId: string, id: string, body: Record<string, unknown> = {}) =>
      send(`/api/shops/${shopId}/nudges/${id}/act`, { method: 'POST', body: JSON.stringify(body) }),
    postDemand: (shopId: string, term: string) =>
      send(`/api/shops/${shopId}/nudges/demand`, { method: 'POST', body: JSON.stringify({ term, source: 'search' }) }),

    getAlerts: (shopId: string) => send<UnifiedAlerts>(`/api/shops/${shopId}/predictions/alerts`),
    getPredictions: (shopId: string) => send<{ predictions: { id: string; title: string; description: string; severity: string }[] }>(`/api/shops/${shopId}/predictions`),
    dismissPrediction: (shopId: string, id: string) => send(`/api/shops/${shopId}/predictions/${id}/dismiss`, { method: 'PATCH' }),
    generatePredictions: (shopId: string) => send(`/api/shops/${shopId}/predictions/generate`, { method: 'POST', body: JSON.stringify({}) }),
    getHistory: (shopId: string, days = 30) => send<{ stats: { date: string; totalProducts: number; lowStockCount: number; outOfStockCount: number }[] }>(`/api/shops/${shopId}/history/stats?days=${days}`),

    getEntitlement: (shopId: string) => send<import('../subscriptions').SubscriptionEntitlement>(`/api/subscriptions/entitlement?shopId=${encodeURIComponent(shopId)}`),
    deleteAccount: () => send('/api/account', { method: 'DELETE' }),
  };
}

export type ShopApi = ReturnType<typeof bindApi>;
