import {GstError} from './gst';
export type RspGoodsDescription='pan_masala'|'unmanufactured_tobacco'|'tobacco_leaves'|'cigars_cigarettes'|'manufactured_tobacco'|'biris'|'non_combustion_tobacco'|'non_combustion_substitutes'|'other';
export interface RspGoodsEvidence {hsn:string;description:RspGoodsDescription;reviewed:boolean;evidenceReference:string}
/** Notification 19/2025-CT and Rule 31D table, not a classification/rate master. */
export function assertRspGoodsCovered(value:RspGoodsEvidence):void{
 if(!value||value.reviewed!==true||typeof value.hsn!=='string'||!/^\d{8}$/.test(value.hsn)||typeof value.evidenceReference!=='string'||!value.evidenceReference.trim())throw new GstError('rsp_goods_review_required');
 const code=value.hsn,description=value.description;
 const covered=code==='21069020'&&description==='pan_masala'
  ||code.startsWith('2401')&&description==='unmanufactured_tobacco'
  ||code.startsWith('2402')&&description==='cigars_cigarettes'
  ||code.startsWith('2403')&&!['24031921','24031929'].includes(code)&&description==='manufactured_tobacco'
  ||code==='24041100'&&description==='non_combustion_tobacco'
  ||code==='24041900'&&description==='non_combustion_substitutes';
 if(!covered)throw new GstError('rsp_goods_not_covered');
}
