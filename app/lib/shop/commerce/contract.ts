export const commerceLanguages = [
  "en",
  "hi",
  "hinglish",
  "ta",
  "te",
  "bn",
  "mr",
  "kn",
  "gu",
  "ml",
] as const;
export type StoreConfig = {
  name: string;
  phone: string;
  address: string;
  hours: string;
  policy: string;
  pickup: boolean;
  delivery: boolean;
  cash: boolean;
  upi: boolean;
};
export type OnlineStore = {
  id: string;
  shopId: string;
  version: number;
  published: boolean;
  config: StoreConfig;
  ready: boolean;
  issues: string[];
  url: string;
};
export type OnlineListing = {
  id: string;
  productId: string;
  name: string;
  description: string;
  visible: boolean;
  unit: string;
  price: string;
  available: boolean;
  supported: boolean;
  url: string;
};
export type OrderState =
  | "requested"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "fulfilled"
  | "rejected"
  | "cancelled"
  | "expired";
export type OnlineOrder = {
  id: string;
  shopId: string;
  storeId: string;
  version: number;
  number: string;
  state: OrderState;
  language: string;
  customer: { name: string; phone: string; email: string; address: string };
  store: StoreConfig;
  fulfilment: "pickup" | "delivery";
  lines: {
    listingId: string;
    productId: string;
    name: string;
    unit: string;
    quantity: string;
    price: string;
    tax: unknown;
  }[];
  net: string;
  tax: string;
  total: string;
  quoteHash: string;
  settingsVersion: string;
  registration: string;
  payment: "unpaid" | "staff_confirmed";
  method: "cash" | "upi" | null;
  saleId?: string;
  estimateId?: string;
  expiresAt?: string;
  events: { kind: string; at: string; actor: string; note: string }[];
  createdAt: string;
  updatedAt: string;
};
export type CommerceAction =
  | { kind: "configure"; version: number; config: StoreConfig }
  | { kind: "publish"; version: number; published: boolean; reviewed: boolean }
  | {
      kind: "listing";
      id: string;
      name: string;
      description: string;
      visible: boolean;
    }
  | {
      kind: "order";
      id: string;
      version: number;
      state: OrderState;
      note: string;
    }
  | { kind: "bill"; id: string; version: number };
export type CommerceRequest = { clientId: string; action: CommerceAction };
export type CommerceResult = {
  store?: OnlineStore;
  listing?: OnlineListing;
  order?: OnlineOrder;
  estimateId?: string;
};
export type PublicStore = {
  orderingAvailable?: boolean;
  id: string;
  config: StoreConfig;
  upiVpa: string | null;
  upiPayee: string | null;
  languages: readonly string[];
  items: OnlineListing[];
  more: boolean;
};
export type OrderQuote = Pick<
  OnlineOrder,
  | "lines"
  | "net"
  | "tax"
  | "total"
  | "quoteHash"
  | "settingsVersion"
  | "registration"
>;
export const commerceUrl = (store: string, item?: string) =>
  "https://samaanbol.space/store/" + store + (item ? "/p/" + item : "");
export const commerceUuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
    v,
  );
