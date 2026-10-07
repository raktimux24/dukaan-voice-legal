import type { GstSettings, ProductTax } from './gst';

// Per-unit preview, with the same half-up paise rounding as GST billing.
// Missing registration or tax data must not become an assumed zero rate.
export function productGrossPrice(price: string, tax: ProductTax | null, settings?: GstSettings | null): number | null {
  if (!/^\d+(\.\d{0,2})?$/.test(price) || !settings || settings.registration === 'unknown') return null;
  const [whole,fraction='']=price.split('.');
  const paise=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
  if (settings.registration !== 'regular') return Number(paise)/100;
  if (!tax || !Number.isFinite(tax.rate) || tax.rate < 0 || tax.rate > 100 || !Number.isInteger(tax.rate*100)) return null;
  if (tax.category !== 'taxable' && tax.rate !== 0) return null;
  if (settings.priceMode === 'inclusive' || tax.category !== 'taxable') return Number(paise)/100;
  const rate=BigInt(Math.round(tax.rate*100));
  return Number((paise*(10000n+rate)+5000n)/10000n)/100;
}

export function productPriceBreakdown(price:string,tax:ProductTax|null,settings?:GstSettings|null) {
  const gross=productGrossPrice(price,tax,settings);
  if(gross===null)return null;
  const grossPaise=BigInt(Math.round(gross*100));
  const rate=settings?.registration==='regular' && tax?.category==='taxable' ? BigInt(Math.round(tax.rate*100)) : 0n;
  const netPaise=settings?.priceMode==='exclusive' ? BigInt(Math.round(Number(price)*100)) : (grossPaise*10000n+(10000n+rate)/2n)/(10000n+rate);
  return {net:Number(netPaise)/100,tax:Number(grossPaise-netPaise)/100,gross};
}

// Receiving helper only: stored purchasePrice is the discounted amount paid.
export function discountedBuyingPrice(price:string,discount:string):number|null {
  if(!/^\d+(\.\d{0,2})?$/.test(price) || (discount!==''&&!/^\d+(\.\d{0,2})?$/.test(discount)))return null;
  const percent=Number(discount || 0);
  if(percent<0 || percent>100)return null;
  const paise=BigInt(Math.round(Number(price)*100));
  return Number((paise*(10000n-BigInt(Math.round(percent*100)))+5000n)/10000n)/100;
}
