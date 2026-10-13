export type ActionType = "add" | "remove" | "sell" | "update" | "query" | "sale" | "sale_void" | "sale_return" | "adjustment" | "member_role_changed" | "member_removed" | "gst_invoice_recovered" | "gst_device_reconciliation_required" | "purchase_settlement_recorded";
export type InputMethod = "voice" | "manual" | "scan";

export interface VoiceEntity {
  product: string;
  quantity: number;
  unit: string;
  action: ActionType;
  confidence: number;
  // "remove" only: why stock went down without a sale
  reason?: string | null;
  batchNumber?: string | null;
  expiryDate?: string | null;
  purchaseDate?: string | null;
  supplier?: string | null;
}

export interface VoiceEntityWithMatch extends VoiceEntity {
  /** what was heard, before the server converted to the product's unit */
  spokenQuantity?: number;
  spokenUnit?: string;
  /** spoken unit has no relation to the product's unit — server will refuse */
  unitMismatch?: boolean;
  matchedProduct?: {
    id: string;
    name: string;
    unit: string;
    minStockLevel: number;
    sellingPrice?: number | null;
    mrp?: number | null;
    trackStock?: boolean;
  };
  inventoryItem?: {
    id: string;
    quantity: number;
    stockStatus: string;
  };
  matchConfidence: number;
}

export type VoicePaymentHint = "cash" | "upi" | "credit";

export interface VoiceSaleContext {
  /** Buyer as spoken, e.g. "Sharma ji" — null if none named */
  customerName: string | null;
  /** Existing customer the spoken name resolved to */
  matchedCustomer: { id: string; name: string; phone: string | null; balance: number; matchConfidence: number } | null;
  paymentHint: VoicePaymentHint | null;
  total: number;
  /** GST must be reviewed; zero is a placeholder, not a payable quote. */
  taxPending?:boolean;
  /** Products spoken as sold that have no selling price yet */
  unpriced: string[];
  promptText: string;
  ttsAudioBase64: string;
  /** Present when the new client opted into ttsAsync and the clip was not ready inline */
  ttsJobId?: string;
}

// POST /voice/process response
export interface VoiceProcessResponse {
  requestId: string;
  transcript: string;
  language: string;
  entities: VoiceEntityWithMatch[];
  overallConfidence: number;
  needsVerification: boolean;
  error?: string;
  /** Machine-readable failure reason (voice_upstream, voice_timeout, …) */
  code?: string;
  /** Present when at least one entity is a "sell": the hand-off to checkout */
  sale?: VoiceSaleContext;
  /** Spoken answer when every entity is a stock query */
  ttsAudioBase64?: string;
  ttsJobId?: string;
  /** Present when entity extraction found nothing but analytics intent matched */
  analyticsResult?: {
    answer: string;
    intent: string;
    confidence: number;
    data?: unknown;
    ttsAudioBase64?: string;
    ttsJobId?: string;
  };
}

// POST /voice/confirm request
export interface VoiceConfirmRequest {
  entities: VoiceEntityWithMatch[];
  transcript: string;
  language: string;
  voiceFeedbackEnabled?: boolean;
  ttsAsync?: boolean;
}

// POST /voice/confirm response
export interface VoiceConfirmResponse {
  success: boolean;
  results: Array<{
    product: string;
    action: string;
    previousQuantity: number;
    newQuantity: number;
    success: boolean;
    error?: string;
  }>;
  ttsAudioBase64: string;
  ttsJobId?: string;
}

export type VoiceState =
  | "idle"
  | "recording"
  | "uploading"
  | "transcribing"
  | "verification"
  | "countdown"
  | "confirming"
  | "success"
  | "failed";

export interface AuditLogEntry {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  actionType: ActionType;
  inputMethod: InputMethod;
  description: string;
  payload: Record<string, unknown>;
  confidence?: number;
  createdAt: string;
}
