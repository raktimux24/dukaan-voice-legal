import type { Buyer, LineTax } from "./gst-core/gst";
import type {
  PurchaseInput,
  PurchaseSnapshot,
  ItcDecision,
  ItcConditions,
} from "./gst-core/purchase-gst";
export type {
  Buyer,
  ProductTax,
  GstSettings,
  GstContext,
  TaxTotals,
  LineTax,
} from "./gst-core/gst";
export type {
  PurchaseInput,
  PurchaseLineInput,
  ItcDecision,
  ItcConditions,
} from "./gst-core/purchase-gst";
export interface GstSupplier {
  id: string;
  clientId: string;
  identity: Buyer & { inventorySupplierName?: string };
  updatedAt: string;
}
export interface PurchaseInvoice {
  id: string;
  number: string;
  issuedAt: string;
  createdAt: string;
  snapshot: PurchaseSnapshot;
  netAmount: string;
  taxAmount: string;
  grossAmount: string;
  recipientRegistration: string;
}
export interface PurchaseDetail extends PurchaseInvoice {
  settlement: {
    invoiceGross: string;
    creditedGross: string;
    paid: string;
    supplierRefunds: string;
    outstanding: string;
    recoverable: string;
    status: string;
  };
  settlements: {
    id: string;
    kind:
      | "payment"
      | "supplier_refund"
      | "payment_reversal"
      | "supplier_refund_reversal";
    reversesId: string | null;
    amount: string;
    method: string;
    occurredAt: string;
    evidenceReference: string;
    note: string;
  }[];
  items: {
    id: string;
    productId: string;
    name: string;
    unit: string;
    quantity: string;
    netAmount: string;
    taxAmount: string;
    grossAmount: string;
    batchId: string | null;
    costBasis: string;
  }[];
  reviews: {
    id: string;
    sequence: number;
    decision: ItcDecision;
    conditions: ItcConditions;
    note: string;
    evidenceReference: string;
    createdAt: string;
  }[];
  returns: {
    id: string;
    supplierCreditNumber: string;
    issuedAt: string;
    netAmount: string;
    taxAmount: string;
    grossAmount: string;
    evidenceReference: string;
    reason: string;
  }[];
  returnItems: {
    id: string;
    purchaseItemId: string;
    quantity: string;
    removeStock: boolean;
    taxSnapshot: LineTax;
  }[];
  costAdjustments: {
    id: string;
    purchaseItemId: string;
    basis: string;
    inventoryAdjustment: string;
    consumedAdjustment: string;
    totalAdjustment: string;
    newUnitCost: string;
    createdAt: string;
  }[];
  ledger: {
    id: string;
    kind: string;
    amount: string;
    cgst: string;
    sgst: string;
    utgst: string;
    igst: string;
    createdAt: string;
  }[];
}
export interface InputTaxReview {
  clientId: string;
  decision: ItcDecision;
  conditions: ItcConditions;
  note: string;
  evidenceReference: string;
}

export interface PurchaseReconciliation {
  period: { from: string; to: string };
  invoice: { net: number; tax: number; gross: number; count: number };
  supplierCredits: { net: number; tax: number; gross: number; count: number };
  periodNet: { net: number; tax: number; gross: number };
  reviewedItc: { opening: number; movement: number; closing: number };
  costMovements: { inventory: number; consumed: number; total: number };
  currentUnreviewed: { count: number; tax: number };
  settlements: {
    openingPayable: string;
    openingRecoverable: string;
    payments: string;
    refunds: string;
    closingPayable: string;
    closingRecoverable: string;
    dateBasis: "document_and_money_effective_date";
  };
  status: "recorded_not_filed";
}
export interface PurchaseSettlementInput {
  clientId: string;
  kind: "payment" | "supplier_refund";
  amount: string;
  method: "cash" | "upi" | "bank" | "card";
  occurredAt: string;
  evidenceReference: string;
  note: string;
}
export interface SettlementReversalInput {
  clientId: string;
  settlementId: string;
  occurredAt: string;
  evidenceReference: string;
  note: string;
}
export interface PurchaseReturnInput {
  clientId: string;
  supplierCreditNumber: string;
  issuedAt: string;
  evidenceReference: string;
  reason: string;
  items: { purchaseItemId: string; quantity: number; removeStock: boolean }[];
}
export interface BillingParty {
  id: string;
  clientId: string;
  buyer: Buyer;
  updatedAt: string;
}
export interface FiscalDocument {
  integrity?: "verified" | "mismatch" | "legacy_unverifiable" | "local_retained";
  id: string;
  shopId: string;
  saleId: string;
  issuer: string;
  financialYear: string;
  number: string;
  type: string;
  issuedAt: string;
  originalNumber?: string | null;
  hash: string;
  hashVersion: string;
  payload: {
    context?: import("./gst-core/gst").GstContext;
    totals?: import("./gst-core/gst").TaxTotals;
    items?: unknown[];
    [key: string]: unknown;
  };
}
export interface GstReadiness {
  ready: boolean;
  issues?: { code: string; count?: number }[];
  [key: string]: unknown;
}
export interface Allocation {
  id: string;
  issuer: string;
  financialYear: string;
  block: number;
  deviceEpoch: string;
  expiresAt: string;
  next: number;
  gstVersion?: string;
}
export interface AllocationRow {
  id: string;
  userId: string;
  deviceEpoch: string;
  issuer: string;
  financialYear: string;
  block: number;
  firstNumber: string;
  lastNumber: string;
  expiresAt: string;
  expired: boolean;
  synchronized: {
    index: number;
    number: string;
    documentId: string;
    saleId: string;
    issuedAt: string;
  }[];
  unconfirmedIndices: number[];
  inconsistentEvidence: number;
}
export interface DeviceRow {
  id: string;
  userId: string;
  actorName: string | null;
  deviceEpoch: string;
  enrolledAt: string;
  lastSeenAt: string;
  revocation: { reason: string; revokedBy: string; createdAt: string } | null;
}
export interface GstReport {
  id: string;
  kind: "sales" | "purchases" | "numbering";
  periodFrom: string;
  periodTo: string;
  formatVersion: string;
  contentHash: string;
  createdAt: string;
  createdBy: string;
  summary?: Record<string, unknown> | null;
}
export interface GstMonitor {
  enabled?: boolean;
  lastSuccessfulRun?: { createdAt: string; scannedDocuments: number } | null;
  counts?: { open: number; resolved: number };
  truncated: boolean;
  issueTruncated?: boolean;
  historyTruncated?: boolean;
  issues: {
    id: string;
    kind: string;
    severity: string;
    status: string;
    lastSeenAt: string;
    details: { count?: number; documentId?: string; month?: string };
    document?: {
      id: string;
      saleId: string;
      number: string;
      type: string;
      issuedAt: string;
    } | null;
  }[];
  runs: {
    id: string;
    status: string;
    createdAt: string;
    scannedDocuments: number;
    issueCount: number;
  }[];
}
export interface GstHealth {
  generatedAt: string;
  integrity: {
    scanned: number;
    truncated: boolean;
    verified: number;
    legacyUnverifiable: number;
    mismatches: {
      id: string;
      saleId?: string;
      number: string;
      issuedAt: string;
    }[];
  };
  evidence: {
    missingInvoices: number;
    missingCreditNotes: number;
    unbalancedSales: number;
  };
  allocations: {
    truncated: boolean;
    blocks: {
      id: string;
      firstNumber: string;
      lastNumber: string;
      synchronizedNumbers: number;
      unconfirmedNumbers: number;
      expired: boolean;
      expiresAt: string;
    }[];
  };
}
export interface TaxHistory {
  currentVersion: string | null;
  nextCursor: string | null;
  items: {
    id: string;
    config: import("./gst-core/gst").ProductTax | null;
    current: boolean;
    valid: boolean;
    recordedAt: string;
    effectiveAt?: string;
    scheduled?: boolean;
    cancelledAt?: string | null;
    confirmation?: {
      actor: string;
      actorName?: string | null;
      ownerName?: string | null;
    };
  }[];
}
export interface GstPeriod {
  month: string;
  state: "open" | "closed";
  sequence: number;
  changedSinceClose: boolean;
  currentSourceFingerprint: string;
  history: { id: string; action: string; createdAt: string; note: string }[];
  currentSummaries?: Record<string, unknown>;
}
export interface TurnoverHistory {
  financialYear: string;
  sequence?: number;
  current?: {
    sequence: number;
    amount: string;
    evidenceReference: string;
    createdAt: string;
  } | null;
  items?: {
    sequence: number;
    amount: string;
    evidenceReference: string;
    createdAt: string;
    actorName?: string;
  }[];
  history?: {
    sequence: number;
    amount: string;
    evidenceReference: string;
    createdAt: string;
  }[];
}
