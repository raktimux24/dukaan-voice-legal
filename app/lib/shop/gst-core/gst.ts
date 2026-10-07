// Pure shared module: imported by both Metro and the Node server. No database or native imports.
export const GST_VERSION = 1;
export type Registration =
  | "unknown"
  | "unregistered"
  | "regular"
  | "composition";
export type TaxCategory = "taxable" | "exempt" | "nil" | "non_gst";
export type PriceMode = "inclusive" | "exclusive";
export interface GstSettings {
  version: string;
  registration: Registration;
  gstin: string;
  legalName: string;
  address: string;
  stateCode: string;
  priceMode: PriceMode;
  effectiveFrom: string;
  structuredAddress?: Buyer["structuredAddress"];
  eInvoiceRequired: boolean;
  reviewed: boolean;
}
export interface ProductTax {
  version: string;
  category: TaxCategory;
  codeType: "hsn" | "sac";
  code: string;
  rate: number;
  reviewed: boolean;
}
export interface Buyer {
  name: string;
  gstin: string;
  address: string;
  stateCode: string;
  structuredAddress?: {address1:string;address2?:string;location:string;pincode:string;reviewed:true};
}
// Shared by native calculation and server persistence; never infer fields from free text.
export function normalizeStructuredBuyerAddress(raw:unknown):NonNullable<Buyer['structuredAddress']>{
 const a=raw as Record<string,unknown>;
 if(!a||typeof a!=='object'||Array.isArray(a)||a.reviewed!==true||
  ['address1','location'].some(k=>typeof a[k]!=='string'||!(a[k] as string).trim()||(a[k] as string).trim().length>100)||
  typeof a.pincode!=='string'||!/^[1-9]\d{5}$/.test(a.pincode)||
  (a.address2!==undefined&&(typeof a.address2!=='string'||!a.address2.trim()||a.address2.trim().length>100)))throw new GstError('invalid_billing_address');
 return {address1:(a.address1 as string).trim(),location:(a.location as string).trim(),pincode:a.pincode,reviewed:true,...(a.address2===undefined?{}:{address2:(a.address2 as string).trim()})};
}
export interface GstContext {
  documentRenderVersion?: "gst_bill_v1" | "gst_bill_v2";
  settings: GstSettings;
  priceMode: PriceMode;
  placeOfSupply: string;
  buyer?: Buyer;
  allocation?: {
    deviceEpoch?:string;
    id: string;
    index: number;
    number: string;
    financialYear: string;
  };
  issuedAt?: string;
}
export interface TaxInput {
  quantity: number;
  price: number;
  listPrice?: number | null;
  discount?: number;
  tax?: ProductTax | null;
}
export interface LineTax {
  // Optional only for retained historical lines; new calculations always record provenance.
  profileVersion?: string | null;
  category: TaxCategory | "unknown";
  codeType: "hsn" | "sac";
  code: string;
  rate: number;
  gross: number;
  discount: number;
  billDiscount: number;
  net: number;
  taxable: number;
  cgst: number;
  sgst: number;
  utgst: number;
  igst: number;
  tax: number;
  total: number;
}
export interface TaxTotals {
  version: number;
  subtotal: number;
  discount: number;
  billDiscount: number;
  total: number;
  net: number;
  taxable: number;
  cgst: number;
  sgst: number;
  utgst: number;
  igst: number;
  tax: number;
  lines: LineTax[];
}
export class GstError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
const fail = (code: string): never => {
  throw new GstError(code);
};
export const STATE_CODES = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
];
export function validGstin(raw: string): boolean {
  if (
    !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(raw) ||
    !STATE_CODES.includes(raw.slice(0, 2))
  )
    return false;
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const n = alphabet.indexOf(raw[i]) * (i % 2 ? 2 : 1);
    sum += Math.floor(n / 36) + (n % 36);
  }
  return alphabet[(36 - (sum % 36)) % 36] === raw[14];
}
/** Calendar effective dates begin at midnight IST; timestamp values require an explicit zone. */
export function gstEffectiveTime(value:string):number {
 if(typeof value!=='string')fail('invalid_effective_date');
 const match=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/.exec(value);
 if(!match)fail('invalid_effective_date');
 const [,y,m,d,h,min,sec,zone]=match!,year=Number(y),month=Number(m),day=Number(d);
 const leap=year%4===0&&(year%100!==0||year%400===0);
 const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
 if(month<1||month>12||day<1||day>days[month-1]||(h!==undefined&&(Number(h)>23||Number(min)>59||Number(sec)>59)))fail('invalid_effective_date');
 if(zone&&zone!=='Z'&&(Number(zone.slice(1,3))>23||Number(zone.slice(4))>59))fail('invalid_effective_date');
 const time=Date.parse(h===undefined?value+'T00:00:00+05:30':value);
 if(!Number.isFinite(time))fail('invalid_effective_date');
 return time;
}
export function validateSettings(s: GstSettings): void {
  if(s.structuredAddress!==undefined){
    const address=normalizeStructuredBuyerAddress(s.structuredAddress);
    if(address.location.length>50)fail("invalid_billing_address");
  }
  if (
    !["unknown", "unregistered", "regular", "composition"].includes(
      s.registration,
    ) ||
    !["inclusive", "exclusive"].includes(s.priceMode)
  )
    fail("invalid_gst_settings");
  if (s.registration === "regular" || s.registration === "composition") {
    if (
      s.reviewed !== true ||
      !validGstin(s.gstin) ||
      !s.legalName.trim() ||
      !s.address.trim() ||
      s.stateCode !== s.gstin.slice(0, 2)
    )
      fail("gst_setup_required");
    gstEffectiveTime(s.effectiveFrom);
  }
  if (s.eInvoiceRequired) fail("e_invoice_not_supported");
}
// Advanced rules must not be discarded by a version-one profile projection.
export function assertSupportedProductTaxRules(value:unknown):void {
  if(value&&typeof value==='object'&&['cess','cessRate','cessPerUnit','cessRule','valuationRule','specialValuation'].some(key=>Object.prototype.hasOwnProperty.call(value,key)))fail('unsupported_product_tax_rule');
}
export function validateProductTax(t: ProductTax): void {
  assertSupportedProductTaxRules(t);
  if (
    !t || t.reviewed !== true || typeof t.code !== "string" ||
    !["taxable", "exempt", "nil", "non_gst"].includes(t.category) ||
    !["hsn", "sac"].includes(t.codeType) ||
    !/^\d{4}(\d{2})?(\d{2})?$/.test(t.code) ||
    (t.codeType === "sac" && t.code.length !== 6) ||
    !Number.isFinite(t.rate) ||
    t.rate < 0 ||
    t.rate > 100 ||
    !/^\d+(?:\.\d{1,2})?$/.test(String(t.rate))
  )
    fail("invalid_product_tax");
  if (
    (t.category === "taxable" && t.rate <= 0) ||
    (t.category !== "taxable" && t.rate !== 0)
  )
    fail("invalid_product_tax");
}
/** Catalog draft validation does not grant issuance eligibility. */
export function validateProductTaxDraft(t:ProductTax):void{
 if(!t||typeof t.reviewed!=='boolean')fail('invalid_product_tax');
 validateProductTax({...t,reviewed:true});
}
export function validateContext(c: GstContext, total: number): void {
  validateCalculationContext(c,total,false);
}
function validateCalculationContext(c:GstContext,total:number,recordedGoodsPurchase:boolean):void {
  validateSettings(c.settings);
  if(c.documentRenderVersion!==undefined&&! ["gst_bill_v1","gst_bill_v2"].includes(c.documentRenderVersion))fail("unsupported_fiscal_render_version");
  if (
    !["inclusive", "exclusive"].includes(c.priceMode) ||
    !STATE_CODES.includes(c.placeOfSupply)
  )
    fail("invalid_tax_context");
  // Release A supports domestic local counter sales only. Cross-state/service rules need reviewed supply profiles.
  if (
    c.placeOfSupply !== c.settings.stateCode &&
    ["regular", "composition"].includes(c.settings.registration) &&
    !recordedGoodsPurchase
  )
    fail("interstate_supply_not_supported");
  if(c.buyer?.structuredAddress!==undefined)normalizeStructuredBuyerAddress(c.buyer.structuredAddress);
  if (c.buyer && ['name','gstin','address','stateCode'].some(k=>typeof c.buyer![k as keyof Buyer]!=='string')) fail('invalid_buyer_gstin');
  if (
    c.buyer?.gstin &&
    (!validGstin(c.buyer.gstin) ||
      !c.buyer.name.trim() ||
      !c.buyer.address.trim() ||
      c.buyer.stateCode !== c.buyer.gstin.slice(0, 2))
  )
    fail("invalid_buyer_gstin");
  if (
    (c.buyer?.gstin || total >= 50000) &&
    (!c.buyer?.name.trim() ||
      !c.buyer.address.trim() ||
      !STATE_CODES.includes(c.buyer.stateCode))
  )
    fail("recipient_details_required");
  if (c.buyer?.gstin && c.buyer.stateCode !== c.placeOfSupply)
    fail("bill_to_ship_to_not_supported");
}
// Convert decimal input into scaled integers using its textual digits, avoiding float multiplication.
function scaled(value: number, digits: number): bigint {
  if (!Number.isFinite(value) || value < 0 || value > 1e9)
    fail("invalid_tax_amount");
  const raw = String(value);
  if (!/^\d+(\.\d+)?$/.test(raw)) fail("invalid_tax_amount");
  const [whole, frac = ""] = raw.split(".");
  if (frac.length > digits) fail("amount_precision_exceeded");
  return (
    BigInt(whole) * 10n ** BigInt(digits) +
    BigInt(frac.padEnd(digits, "0") || "0")
  );
}
const round = (n: bigint, d: bigint) => (n + d / 2n) / d;
const money = (n: bigint) => Number(n) / 100;
function allocate(amount: bigint, weights: bigint[]): bigint[] {
  const sum = weights.reduce((a, b) => a + b, 0n);
  if (!sum) return weights.map(() => 0n);
  const pieces = weights.map((w) => (amount * w) / sum);
  let left = amount - pieces.reduce((a, b) => a + b, 0n);
  const order = weights
    .map((w, i) => ({ i, r: (amount * w) % sum }))
    .sort((a, b) => (a.r === b.r ? a.i - b.i : a.r > b.r ? -1 : 1));
  for (const x of order) {
    if (!left) break;
    pieces[x.i]++;
    left--;
  }
  return pieces;
}
export function calculateTax(items:TaxInput[],discount=0,context?:GstContext|null):TaxTotals {
 return calculateTaxInternal(items,discount,context,false);
}
// Only a recorded domestic goods invoice uses this policy. The purchase
// contract validates direct delivery evidence; this does not permit sale issuance.
export function calculateRecordedGoodsPurchaseTax(items:TaxInput[],discount:number,context:GstContext):TaxTotals {
 if(!["regular","unregistered"].includes(context.settings.registration)||!context.buyer||items.some(item=>item.tax?.codeType!=="hsn"))fail("purchase_supply_not_supported");
 return calculateTaxInternal(items,discount,context,true);
}
function calculateTaxInternal(
  items: TaxInput[],
  discount: number,
  context:GstContext|null|undefined,
  recordedGoodsPurchase:boolean,
): TaxTotals {
  const active =
    !!context &&
    ["regular", "composition"].includes(context.settings.registration);
  if (context) validateSettings(context.settings);
  const regular = context?.settings.registration === "regular";
  const originals = items.map((it) => {
    const qty = scaled(it.quantity, 3);
    if (qty <= 0n) fail("invalid_quantity");
    const price = scaled(it.price, 2),
      list = it.listPrice != null ? scaled(it.listPrice, 2) : price;
    const gross = round((list > price ? list : price) * qty, 1000n);
    const priceOff = round(
      ((list > price ? list : price) - price) * qty,
      1000n,
    );
    const off = priceOff + scaled(it.discount ?? 0, 2);
    if (active && !it.tax) fail("tax_profile_missing");
    if (it.tax) {
      validateProductTax(it.tax);
      if(typeof it.tax.version!=="string"||!it.tax.version.trim()||it.tax.version.length>128)fail("invalid_product_tax");
    }
    return {
      gross,
      off: off > gross ? gross : off,
      after: gross - (off > gross ? gross : off),
    };
  });
  const remaining = originals.reduce((a, x) => a + x.after, 0n),
    requested = scaled(discount, 2),
    bill = requested > remaining ? remaining : requested;
  const allocations = allocate(
    bill,
    originals.map((x) => x.after),
  );
  const lines = items.map((it, i): LineTax => {
    const x = originals[i],
      discounted = x.after - allocations[i],
      rate =
        regular && it.tax?.category === "taxable" ? scaled(it.tax.rate, 2) : 0n;
    const net =
      rate && context?.priceMode === "inclusive"
        ? round(discounted * 10000n, 10000n + rate)
        : discounted;
    const tax = rate
      ? context?.priceMode === "inclusive"
        ? discounted - net
        : round(net * rate, 10000n)
      : 0n;
    const local =
      !context || context.placeOfSupply === context.settings.stateCode;
    const central = local ? tax / 2n : 0n,
      state = local ? tax - central : 0n;
    const ut =
      !!context &&
      ["04", "26", "31", "35", "38"].includes(context.placeOfSupply);
    return {
      profileVersion: it.tax?.version ?? null,
      category: it.tax?.category ?? "unknown",
      codeType: it.tax?.codeType ?? "hsn",
      code: it.tax?.code ?? "",
      rate: regular ? (it.tax?.rate ?? 0) : 0,
      gross: money(x.gross),
      discount: money(x.off),
      billDiscount: money(allocations[i]),
      net: money(net),
      taxable: it.tax?.category === "taxable" ? money(net) : 0,
      cgst: money(central),
      sgst: ut ? 0 : money(state),
      utgst: ut ? money(state) : 0,
      igst: local ? 0 : money(tax),
      tax: money(tax),
      total: money(net + tax),
    };
  });
  const sum = (key: keyof LineTax) =>
    money(lines.reduce((a, x) => a + scaled(x[key] as number, 2), 0n));
  if(recordedGoodsPurchase&&context)validateCalculationContext(context,sum("total"),true);
  return {
    version: GST_VERSION,
    subtotal: sum("gross"),
    discount: money(originals.reduce((a, x) => a + x.off, 0n) + bill),
    billDiscount: money(bill),
    total: sum("total"),
    net: sum("net"),
    taxable: sum("taxable"),
    cgst: sum("cgst"),
    sgst: sum("sgst"),
    utgst: sum("utgst"),
    igst: sum("igst"),
    tax: sum("tax"),
    lines,
  };
}
export function returnTax(
  line: LineTax,
  quantity: number,
  alreadyReturned: number,
  returning: number,
): LineTax {
  const total = scaled(quantity, 3),
    before = scaled(alreadyReturned, 3),
    after = before + scaled(returning, 3);
  if (!total || after > total || after <= before)
    fail("return_quantity_exceeds");
  const out = { ...line };
  for (const key of [
    "gross",
    "discount",
    "billDiscount",
    "net",
    "taxable",
    "cgst",
    "sgst",
    "utgst",
    "igst",
    "tax",
    "total",
  ] as const) {
    const amount = scaled(line[key], 2);
    out[key] = money(
      round(amount * after, total) - round(amount * before, total),
    );
  }
  // Use components as authoritative; extracted total/net share their residuals.
  out.tax = money(
    scaled(out.cgst, 2) +
      scaled(out.sgst, 2) +
      scaled(out.utgst, 2) +
      scaled(out.igst, 2),
  );
  out.net = money(scaled(out.total, 2) - scaled(out.tax, 2));
  if (out.category === "taxable") out.taxable = out.net;
  return out;
}
export function financialYear(date: string | Date): string {
  const d = new Date(new Date(date).getTime() + 330 * 60000);
  if (!Number.isFinite(d.getTime())) fail("invalid_issue_date");
  const y = d.getUTCFullYear() - (d.getUTCMonth() < 3 ? 1 : 0);
  return `${y}-${String(y + 1).slice(-2)}`;
}

/** Exact residual for physical returns after value-only credits. Quantities remain
 * physical; credits consume money/tax but no units. Caller provides verified history. */
export function remainingReturnTax(
 line:LineTax,quantity:number,alreadyReturned:number,
 priorReturns:{quantity:number;tax:LineTax}[],valueCredits:LineTax[],priceMode:PriceMode,
):LineTax {
 if(!['inclusive','exclusive'].includes(priceMode)||!Array.isArray(priorReturns)||!Array.isArray(valueCredits))fail('return_adjustment_history_invalid');
 const totalQty=scaled(quantity,3),returnedQty=scaled(alreadyReturned,3);
 if(!totalQty||returnedQty>totalQty||priorReturns.reduce((sum,row)=>sum+scaled(row.quantity,3),0n)!==returnedQty)fail('return_adjustment_history_invalid');
 const components=['discount','billDiscount','net','taxable','cgst','sgst','utgst','igst','tax','total'] as const;
 const retained=[line,...priorReturns.map(row=>row.tax),...valueCredits];
 for(const evidence of retained){
  if(!evidence||['profileVersion','category','codeType','code','rate'].some(key=>evidence[key as keyof LineTax]!==line[key as keyof LineTax]))fail('return_adjustment_history_invalid');
  const tax=scaled(evidence.tax,2),net=scaled(evidence.net,2),total=scaled(evidence.total,2);
  if(net+tax!==total||scaled(evidence.cgst,2)+scaled(evidence.sgst,2)+scaled(evidence.utgst,2)+scaled(evidence.igst,2)!==tax||scaled(evidence.taxable,2)!==(line.category==='taxable'?net:0n))fail('return_adjustment_history_invalid');
 }
 const remaining={...line};
 for(const key of components){
  const amount=scaled(line[key],2)-priorReturns.reduce((sum,row)=>sum+scaled(row.tax[key],2),0n)-valueCredits.reduce((sum,row)=>sum+scaled(row[key],2),0n);
  if(amount<0n)fail('return_adjustment_exceeds_original');
  remaining[key]=money(amount);
 }
 // Credits may use a different price-entry mode from the original invoice.
 // Reconstruct gross in the original mode; do not subtract unlike gross bases.
 remaining.gross=money(scaled(priceMode==='inclusive'?remaining.total:remaining.net,2)+scaled(remaining.discount,2)+scaled(remaining.billDiscount,2));
 if(totalQty===returnedQty&&scaled(remaining.total,2)>0n)fail('return_adjustment_history_invalid');
 return remaining;
}

// Shared final number formatting; both offline reservation and server validation
// must reject an unrepresentable identifier before it can become issued evidence.
export function allocationNumber(a:{financialYear:string;block:number},index:number):string {
 if(!Number.isSafeInteger(a.block)||a.block<1||!Number.isInteger(index)||index<1||index>100||!/^\d{4}-\d{2}$/.test(a.financialYear)||a.financialYear.slice(5)!==String((Number(a.financialYear.slice(0,4))+1)%100).padStart(2,'0'))throw new GstError('invalid_invoice_allocation');
 const number=`${a.financialYear.slice(2,4)}-${a.block.toString(36).toUpperCase()}-${String(index).padStart(3,'0')}`;
 if(number.length>16)throw new GstError('invoice_number_exhausted');
 return number;
}

/** New sale issuance only; never reinterpret historical documents on readback. */
export function assertSupportedSaleTaxRequest(raw:unknown,acceptedSettings?:GstSettings):void{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('invalid_tax_context');
 const request=raw as Record<string,unknown>;
 const advanced=['supplyType','supplyContext','reverseCharge','cess','cessRate','cessPerUnit','cessRule','valuationRule','specialValuation','export','exportType','sez','delivery','deliveryState','billTo','shipTo','dispatchFrom','shippingAddress','eInvoice','eWayBill'];
 if(advanced.some(key=>Object.hasOwn(request,key)))fail('unsupported_sale_tax_context');
 const check=(value:unknown,allowed:string[])=>{
  if(!value||typeof value!=='object'||Array.isArray(value))fail('invalid_tax_context');
  if(Object.keys(value as object).some(key=>!allowed.includes(key)))fail('unsupported_sale_tax_context');
 };
 const context=request.gstContext;
 if(context===undefined||context===null)return;
 check(context,['documentRenderVersion','settings','priceMode','placeOfSupply','buyer','allocation','issuedAt']);
 const c=context as Record<string,unknown>;
 if(c.settings!==undefined){
  // Flat legacy address metadata requires the exact retained settings value.
  const accepted=acceptedSettings as unknown as Record<string,unknown>|undefined;
  const claimed=c.settings as Record<string,unknown>;
  const retained=['address1','address2','location','pincode'].filter(key=>accepted&&claimed&&accepted.version===claimed.version&&Object.hasOwn(accepted,key)&&Object.hasOwn(claimed,key)&&typeof accepted[key]==='string'&&claimed[key]===accepted[key]);
  check(c.settings,['version','registration','gstin','legalName','address','stateCode','priceMode','effectiveFrom','structuredAddress','eInvoiceRequired','reviewed',...retained]);
 }
 if(c.buyer!==undefined&&c.buyer!==null)check(c.buyer,['name','gstin','address','stateCode','structuredAddress']);
}
