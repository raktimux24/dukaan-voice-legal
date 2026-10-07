/** Explicit package declarations: no currency symbols, inferred price or locale coercion. */
export function parseRspPreviewPrices(value:string,optional=false):number[]{
 if(typeof value!=='string'||value.length>1000)throw new Error('invalid_rsp_declared_prices');
 if(!value.trim()){if(optional)return [];throw new Error('invalid_rsp_declared_prices');}
 const parts=value.split(',');
 if(parts.length>50)throw new Error('invalid_rsp_declared_prices');
 return parts.map(part=>{
  const text=part.trim();
  if(!/^\d{1,10}(?:\.\d{1,2})?$/.test(text))throw new Error('invalid_rsp_declared_prices');
  const price=Number(text);if(price<=0||price>1e9)throw new Error('invalid_rsp_declared_prices');return price;
 });
}
