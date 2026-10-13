import type {SaleItemInput} from './types';
/** Package declarations stay unchanged when the number of identical packages changes. */
export function cartLineWithQuantity<T extends {quantity:number;rsp?:SaleItemInput['rsp']}>(line:T,quantity:number):T{
 if(!Number.isFinite(quantity)||quantity<=0||line.rsp&&!Number.isSafeInteger(quantity))throw new Error('invalid_rsp_sale_line');
 return {...line,quantity,...(line.rsp?{rsp:{...line.rsp,valuation:{...line.rsp.valuation,packageCount:quantity}}}: {})};
}
