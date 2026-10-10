import type { GstContext, GstSettings, ProductTax, TaxTotals, LineTax, Buyer } from './gst-types';
import type { Role } from './permissions';

export type ShopRecord = {
  id: string;
  name: string;
  category: string;
  subtype?: string | null;
  ownerId: string;
  managerInviteCode: string | null;
  helperInviteCode: string | null;
  language?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  createdAt: string;
  role: Role | string;
  isActive?: boolean;
};

export type Member = {
  id: string;
  userId: string;
  shopId: string;
  role: Role;
  user: { id: string; fullName: string; email: string; phoneNumber?: string };
  joinedAt: string;
  lastActiveAt: string;
};

export type Product = {
  gstTaxSnapshot?:import("./gst-core/gst-tax-cache").ProductTaxSnapshot;
  gstRspSnapshot?:import("./gst-core/gst-rsp-cache").ProductRspSnapshot;
  gstConfig?: ProductTax | null;
  id: string;
  shopId: string;
  name: string;
  barcode?: string;
  category: string;
  subcategory?: string | null;
  unit: string;
  minStockLevel: number;
  purchasePrice?: number;
  sellingPrice?: number | null;
  mrp?: number | null;
  shortCode?: string | null;
  isActive?: boolean;
  trackStock?: boolean;
  depletionOrder?: 'expiry' | 'fifo';
  packSize?: number | null;
  packLabel?: string | null;
  batchNumber?: string;
  purchaseDate?: string;
  expiryDate?: string;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  productId: string;
  shopId: string;
  product: Product;
  quantity: number;
  unit: string;
  stockStatus: 'OK' | 'LOW' | 'OUT' | string;
  nearestExpiryDate?: string;
  updatedAt: string;
  updatedBy: string;
  updatedByName: string;
};

export type StockBatch = {
  id: string;
  productId: string;
  shopId: string;
  batchNumber?: string;
  quantity: number;
  initialQuantity?: number | null;
  purchaseItemId?: string | null;
  purchasePrice?: number;
  purchaseDate?: string;
  expiryDate?: string;
  supplier?: string;
  status: 'active' | 'depleted' | string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
};

export type InventoryStats = {
  total: number;
  lowStock: number;
  outOfStock: number;
  nearExpiry: number;
  stockValue: number;
};

export type AdjustmentReason =
  | 'damaged'
  | 'expired'
  | 'theft'
  | 'correction'
  | 'returned_to_supplier'
  | 'personal_use'
  | 'other';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'credit';

export type SaleItemInput = {
  rsp?: {profile: Parameters<typeof import("./gst-core/rsp-profile-contract").calculateRspProfileCommercial>[0];valuation: Parameters<typeof import("./gst-core/rsp-profile-contract").calculateRspProfileCommercial>[1]["valuation"];rounding: Parameters<typeof import("./gst-core/rsp-profile-contract").calculateRspProfileCommercial>[1]["rounding"]};
  gstConfig?: ProductTax | null;
  listPrice?: number | null;
  productId?: string | null;
  name?: string;
  unit?: string;
  quantity: number;
  price?: number;
  discount?: number;
};

export type SalePaymentInput = {
  method: PaymentMethod;
  amount: number;
  tendered?: number;
  reference?: string;
};

export type CreateSalePayload = {
  mixedDiscountReview?:{policy:"commercial_amount_proportional_v1";reviewed:true;evidenceReference:string};
  roundingSnapshot?:import("./gst-core/payable-rounding-snapshot").PayableRoundingSnapshot;
  roundingGrant?:import("./rounding-grant").RetainedRoundingGrant;
  gstContext?: GstContext | null;
  clientId: string;
  soldAt: string;
  items: SaleItemInput[];
  payments: SalePaymentInput[];
  discountAmount?: number;
  customerId?: string | null;
  customer?: { clientId?: string; name: string; phone?: string | null } | null;
  note?: string | null;
  inputMethod?: 'manual' | 'voice' | 'scan';
};

export type SaleItem = {
  rspSnapshot?:ReturnType<typeof import("./gst-core/rsp-profile-contract").calculateRspProfileCommercial>|null;
  netSales?:number|null;
  taxSnapshot?: LineTax | null;
  id: string;
  productId: string | null;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
  costTotal: number | null;
  returnedQuantity: number;
  returnTaxBasis?: {quantity:number;tax:LineTax}|null;
  shortfall?: number;
};

export type Sale = {
  requestHash?: string;
  gstIntegrity?: string;
  mixedGstSnapshot?:import("./gst-core/mixed-gst-fiscal").MixedFiscalPayload|null;
  netSales?:number|null;taxTotal?:number|null;
  roundingGrant?:import("./rounding-grant").RetainedRoundingGrant|null;
  roundingEvidence?:import("./gst-core/payable-rounding-evidence").PayableRoundingEvidence|null;
  returnPlanningError?:string|null;
  gstSnapshot?: { invoiceNumber:string;documentType?:string;renderVersion?:string;context:GstContext;totals:TaxTotals } | null;
  id: string;
  shopId: string;
  saleNumber: number;
  clientId: string;
  status: 'completed' | 'voided';
  soldBy: string;
  customerId: string | null;
  customer: { id: string; name: string; phone: string | null; balance: number } | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  costTotal: number | null;
  showCost?: boolean;
  paidTotal: number;
  creditTotal: number;
  paymentStatus: 'paid' | 'partial' | 'credit';
  inputMethod: string;
  note: string | null;
  soldAt: string;
  createdAt: string;
  voidedAt: string | null;
  voidReason: string | null;
  items: SaleItem[];
  payments: { id: string; method: PaymentMethod; kind: string; amount: number; tendered: number | null; changeGiven: number | null; reference: string | null }[];
  returns: {
    id: string;
    items: { saleItemId: string; quantity: number; restock: boolean; reason: string | null }[];
    refundMethod: PaymentMethod | null;
    refundAmount: number;
    reason: string | null;
    createdAt: string;
  }[];
};

export type SaleListRow = {
  invoiceNumber?: string | null;
  id: string;
  saleNumber: number;
  status: 'completed' | 'voided';
  total: number;
  paidTotal: number;
  creditTotal: number;
  paymentStatus: string;
  soldAt: string;
  soldBy: string;
  sellerName: string;
  customerName: string | null;
  itemCount: number;
  firstItem: string | null;
  methods: PaymentMethod[];
  refundAmount: number;
  returnCount: number;
};

export type SalesSummary = {
  bills: number;
  revenue: number;
  grossProfit: number;
  marginPct: number | null;
  discounts: number;
  returns: number;
  byMethod: Record<string, number>;
  cashInDrawer: number;
  premium: boolean;
  limitedToDays: number | null;
  udhaar: { givenInRange: number; collectedInRange: number; outstandingTotal: number } | null;
};

export type Customer = {
  billingPartyId?: string | null;
  billingParty?: {id:string;buyer:Buyer} | null;
  id: string;
  clientId: string | null;
  name: string;
  phone: string | null;
  notes: string | null;
  balance: number;
  lastSaleAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type LedgerEntry = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  saleId: string | null;
  saleNumber: number | null;
  method: string | null;
  note: string | null;
  createdAt: string;
};

export type BuyListItem = {
  id: string;
  shopId: string;
  productId?: string;
  itemName: string;
  quantity?: number;
  unit?: string;
  category?: string;
  status: 'pending' | 'purchased' | 'stocked';
  isAiSuggested: boolean;
  aiReason?: string;
  notes?: string;
  createdAt: string;
};

export type PosSettings = {
  gstSettings?: GstSettings | null;
  gstProtocol?: number;
  gstAvailable?: boolean;
  gstSetupAvailable?: boolean;
  gstPurchasesAvailable?: boolean;
  gstPurchaseRequestClosureAvailable?: boolean;
  gstTaxSchedulingAvailable?: boolean;
  gstRspProfileReviewsAvailable?: boolean;
  gstRspBillingAvailable?: boolean;
  gstPayableRoundingReviewsAvailable?: boolean;
  gstPayableRoundingAvailable?:boolean;
  gstRoundingPolicy?:import("./gst-core/payable-rounding-policy").PayableRoundingPolicy|null;
  shopId: string;
  shopName: string;
  saleCounter: number;
  upiVpa: string | null;
  upiPayeeName: string | null;
  upiQrImage: string | null;
  upiReady: boolean;
  billHeader: string | null;
  billFooter: string | null;
  shopPhone: string | null;
  shopAddress: string | null;
  defaultPaymentMethod: 'cash' | 'upi';
  voidWindowHours: number;
  cardEnabled: boolean;
  updatedAt: string;
};

export type AuditLogEntry = {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  actionType: string;
  inputMethod: string;
  description: string;
  payload: Record<string, unknown>;
  confidence?: number;
  createdAt: string;
};

export type UserPreferences = {
  appLanguage: string;
  voiceLanguage: string;
  voiceFeedbackEnabled: boolean;
  highContrastMode: boolean;
  textSize: string;
  defaultUnit: string;
  lowStockNotifications: boolean;
  autoSuggestBuyList: boolean;
  dailyRecapEnabled: boolean;
};

export type Nudge = {
  id: string;
  kind: string;
  severity: string;
  title: string;
  body: string;
  action: { type: string; params?: Record<string, unknown> } | null;
  productId: string | null;
  customerId: string | null;
  status: string;
  evidence?: { anchorProductId?: string; supportPct?: number } | null;
};

export type BriefResponse = {
  today: Nudge | null;
  items: Nudge[];
  history: Nudge[];
  premium: boolean;
};

export type SupplierRow = {
  name: string;
  batches: number;
  products: number;
  spend: number;
  spend30d: number;
  firstAt?: string | null;
  lastAt: string | null;
};

export type SupplierItem = {
  productId: string;
  name: string;
  unit: string;
  sellingPrice: number | null;
  batches: number;
  quantity: number;
  spend: number;
  lastPrice: number;
  minPrice: number;
  maxPrice: number;
  lastAt: string | null;
  alt: { supplier: string; price: number; at: string } | null;
};

export type SupplierBatch = {
  id: string;
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  remaining: number;
  price: number;
  at: string;
  expiryDate: string | null;
  status: string;
};

export type SupplierDetail = {
  name: string;
  summary: { batches: number; products: number; spend: number; firstAt: string | null; lastAt: string | null };
  items: SupplierItem[];
  batches: SupplierBatch[];
};

export type SupplierCompareProduct = {
  productId: string;
  name: string;
  unit: string;
  cheapest: string;
  lastUsed?: string;
  spreadPct: number;
  savingPct: number;
  suppliers: { name: string; price: number; at: string }[];
};

export type SalesReport = {
  period: string;
  premium: boolean;
  limitedToDays: number | null;
  showCost: boolean;
  summary: {
    bills: number;
    voided: number;
    revenue: number;
    discounts: number;
    returns: number;
    cogs: number;
    grossProfit: number;
    marginPct: number | null;
    purchaseCostMovement?: {count: number; inventory: string; consumed: string; total: string; dateBasis: 'recorded'; timezone: 'Asia/Kolkata'} | null;
    collections?: {cash:number;upi:number;card:number};
    udhaar?: {givenInRange:number;collectedInRange:number;outstandingTotal:number} | null;
    avgBill: number;
    itemsSold: number;
    byMethod: Record<string, number>;
    cashInDrawer: number;
    byHour: number[];
    series: { date: string; bills: number; revenue: number; grossProfit: number }[];
  };
  comparison: {
    label: string;
    previous: { revenue: number; bills: number; avgBill: number; itemsSold: number };
    deltaPct: { revenue: number; bills: number; avgBill: number; itemsSold: number };
  } | null;
  byCategory: { category: string; bills: number; units: number; revenue: number; sharePct: number; marginPct: number }[];
  byWeekday: { dow: number; bills: number; revenue: number }[];
  bestHour: number | null;
  basket: { itemsPerBill: number; avgBill: number; discountPctOfGross: number; discountedBills: number } | null;
  returns: { returns: number; returnAmount: number; voids: number; voidAmount: number } | null;
  inputMethods: { method: string; bills: number; revenue: number }[];
  runRate?: {mtdRevenue:number;daysElapsed:number;daysInMonth:number;projected:number;lastMonthRevenue:number;vsLastMonthPct:number|null} | null;
  customers?: {bills:number;billsWithCustomer:number;walkIns:number;uniqueCustomers:number;newCustomers:number;returningCustomers:number;top:{customerId:string;name:string;bills:number;revenue:number;fiscalCorrectionNet?:number;owes:number}[]};
  udhaarAgeing?: {outstanding:number;customers:number;collectionRatePct:number|null;buckets:{bucket:string;customers:number;amount:number}[];stale:{customerId:string;name:string;balance:number;daysSinceCredit:number;daysSincePayment:number|null}[]};
  paymentByDay?: {date:string;cash:number;upi:number;card:number;credit:number}[];
  staff?: {userId:string;name:string;bills:number;revenue:number;avgBill:number;itemsPerBill:number;discounts:number;voids:number;fiscalCorrectionNet?:number}[];
  marginByProduct?: {products:{productId:string|null;name:string;units:number;revenue:number;cogs:number;grossProfit:number;marginPct:number|null;fiscalCorrectionNet?:number}[];overallMarginPct:number|null;lowMarginBestSellers:{name:string;marginPct:number|null}[]};
  boughtTogether?: {a:string;b:string;times:number}[];
};

export interface StockOnHand {
  products: number;
  units: number;
  costValue: number | null;
  retailValue: number | null;
  potentialMargin: number | null;
  byStatus: Record<"OK" | "LOW" | "OUT", { products: number; costValue: number | null }>;
}
export interface CategoryValue {
  category: string;
  products: number;
  units: number;
  costValue: number | null;
  retailValue: number | null;
  lowStock: number;
  outOfStock: number;
}
export interface MovementDay {
  date: string;
  unitsIn: number;
  unitsSold: number;
  unitsAdjusted: number;
}
export interface ProductMovement {
  productId: string;
  name: string;
  unit: string;
  category: string;
  opening: number;
  unitsIn: number;
  unitsSold: number;
  unitsAdjusted: number;
  closing: number;
  sellThroughPct: number | null;
  daysOfCover: number | null;
}
export interface CategoryMovement {
  category: string;
  unitsIn: number;
  unitsSold: number;
  unitsAdjusted: number;
  revenue: number;
  cogs: number | null;
}
export interface ShrinkageRow {
  reason: string;
  events: number;
  units: number;
  costValue: number | null;
}
export interface SlowItem {
  productId: string;
  name: string;
  unit: string;
  onHand: number;
  costValue: number | null;
  lastSoldAt: string | null;
  daysSinceSale: number | null;
}
export interface FastItem {
  productId: string;
  name: string;
  unit: string;
  onHand: number;
  avgDailySold: number;
  daysOfCover: number;
}
export interface AgeBucket {
  bucket: "0-30" | "31-60" | "61-90" | "90+";
  batches: number;
  units: number;
  costValue: number | null;
}
export interface ExpiryBucket {
  batches: number;
  units: number;
  costValue: number | null;
}
export interface ExpiryExposure {
  within7: ExpiryBucket;
  within30: ExpiryBucket;
  within60: ExpiryBucket;
  items: { productId: string; name: string; unit: string; batchNumber: string | null; expiryDate: string; daysRemaining: number; units: number; costValue: number | null }[];
}
export interface SupplierPurchases {
  supplier: string;
  batches: number;
  units: number;
  costValue: number | null;
  products: number;
  lastAt: string;
}
export interface StockReport {
  range: { from: string; to: string };
  premium: boolean;
  showCost: boolean;
  limitedToDays: number | null;
  onHand: StockOnHand;
  byCategory: CategoryValue[];
  movementByDay: MovementDay[];
  expiry: ExpiryExposure;
  byProduct?: ProductMovement[];
  movementByCategory?: CategoryMovement[];
  shrinkage?: { rows: ShrinkageRow[]; totalUnits: number; totalCost: number | null; pctOfCogs: number | null };
  slowStock?: { items: SlowItem[]; valueTiedUp: number | null; thresholdDays: number };
  fastMovers?: FastItem[];
  ageing?: AgeBucket[];
  turnover?: { cogs: number; avgStockValue: number; turns: number | null; daysOfInventory: number | null } | null;
  suppliers?: SupplierPurchases[];
}

export type UnifiedAlerts = {
  stock: {
    outOfStock: { productId: string; productName: string; quantity: number; unit: string; minStockLevel: number }[];
    lowStock: { productId: string; productName: string; quantity: number; unit: string; minStockLevel: number }[];
  };
  expiry: { productId: string; productName: string; unit: string; expiryDate: string; daysRemaining: number; quantity: number }[];
  predictions: { id: string; title: string; description: string; severity: string; productId: string | null }[];
  counts: { total: number; stock: number; expiry: number; ai: number };
};

export type ProductTaxAuthorization = { id: string; shopId: string; memberId: string; managerId: string; ownerId: string; authorized: boolean; createdAt: string };
export type ProductTaxAuthorizationEntry = { managerId: string; memberId: string; authorization: ProductTaxAuthorization | null };
export type SaleReturnListRow = {
  id: string; saleId: string; saleNumber: number; invoiceNumber?: string | null; createdAt: string;
  refundAmount: number; refundMethod: PaymentMethod | null; reason: string | null; createdByName: string | null;
  itemCount: number; firstItem: string | null; customerName: string | null;
  settlement?: {creditReduction: string; moneyRefund: string} | null;
};
export type ReturnsListSummary = { count: number; amount: number; byMethod: Record<string, number> };

export type SpokenAnswer = {answer:string;intent:string|null;transcript?:string;ttsAudioBase64?:string;ttsJobId?:string};
