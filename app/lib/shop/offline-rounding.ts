import {assertRoundingSelection,roundingSelectionCurrent,type RoundingSelection} from './gst-core/payable-rounding-request';
/** Reuse a server selection only inside its observed effective interval.
 * This remains preview evidence; issuance independently requires a scoped grant. */
export function retainedRoundingSelection(shopId:string,issuedAt:string,value:unknown):RoundingSelection {
  const retained=value as RoundingSelection;
  const original=assertRoundingSelection(shopId,retained?.issuedAt,value);
  const at=Date.parse(issuedAt);
  if(!roundingSelectionCurrent(original,at))throw Error('rounding_selection_expired');
  return assertRoundingSelection(shopId,issuedAt,{...original,issuedAt});
}
