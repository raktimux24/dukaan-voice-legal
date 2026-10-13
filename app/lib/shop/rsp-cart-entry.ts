import {cachedRspProductAt,type ProductRspSnapshot} from './gst-core/gst-rsp-cache';
import {calculateRspProfileCommercial} from './gst-core/rsp-profile-contract';
import {parseRspPreviewPrices} from './gst-core/rsp-preview-prices';
import type {SaleItemInput} from './types';
export interface RspPackageDraft {area:string;packageId:string;prices:string;increases:string;evidence:string;reviewed:boolean}
export function prepareRspCartEntry(line:SaleItemInput,snapshot:ProductRspSnapshot,shop:string,draft:RspPackageDraft,issuedAt:string){
 if(!line.productId||!Number.isSafeInteger(line.quantity)||line.quantity<1||!draft.reviewed||!draft.area.trim()||!draft.packageId.trim()||!draft.evidence.trim()||draft.evidence.length>1000)throw new Error('invalid_rsp_sale_line');
 const profile=cachedRspProductAt(snapshot,shop,line.productId,issuedAt);
 const rsp:NonNullable<SaleItemInput['rsp']>={profile,valuation:{supplyAt:issuedAt,area:draft.area.trim(),packageId:draft.packageId.trim(),packageCount:line.quantity,packages:[{area:draft.area.trim(),packageId:draft.packageId.trim(),declaredPrices:parseRspPreviewPrices(draft.prices),increasedPrices:parseRspPreviewPrices(draft.increases,true)}]},rounding:{rule:'aggregate_half_up_largest_remainder_v1',reviewed:true,evidenceReference:draft.evidence.trim()}};
 const charged=line.price??0,price=line.listPrice!=null&&line.listPrice>charged?line.listPrice:charged,r2=(n:number)=>Math.round(n*100)/100;
 const gross=r2(price*line.quantity),discount=r2(Math.min(gross,r2((price-charged)*line.quantity)+r2(Math.max(0,line.discount??0))));
 const result=calculateRspProfileCommercial(profile,{productId:line.productId,valuation:rsp.valuation,rounding:rsp.rounding,grossSaleValue:gross.toFixed(2),discount:discount.toFixed(2)});
 return {line:{...line,gstConfig:null,rsp},calculation:result.calculation};
}
