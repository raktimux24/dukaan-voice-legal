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
  shortfall?: number;
};

export type Sale = {
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
};

export type BriefResponse = {
  today: Nudge | null;
  items: Nudge[];
  history: Nudge[];
  premium: boolean;
};

export type UnifiedAlerts = {
  stock: {
    outOfStock: { productId: string; productName: string; quantity: number; unit: string; minStockLevel: number }[];
    lowStock: { productId: string; productName: string; quantity: number; unit: string; minStockLevel: number }[];
  };
  expiry: { productId: string; productName: string; unit: string; expiryDate: string; daysRemaining: number; quantity: number }[];
  predictions: { id: string; title: string; description: string; severity: string; productId: string | null }[];
  counts: { total: number; stock: number; expiry: number; ai: number };
};
