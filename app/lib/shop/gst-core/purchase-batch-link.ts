type Receipt = {initialQuantity?: unknown;quantity: unknown;purchasePrice?: unknown;purchaseItemId?: unknown};
/** Existing receipts must match original quantity, not remaining stock. */
export function eligiblePurchaseReceipts<T extends Receipt>(batches: readonly T[], quantity: number): T[] {
 if(!Number.isFinite(quantity)||quantity<=0)return [];
 return batches.filter(batch=>{
  const original=Number(batch.initialQuantity),remaining=Number(batch.quantity),cost=Number(batch.purchasePrice);
  return !batch.purchaseItemId&&batch.initialQuantity!=null&&original===quantity&&Number.isFinite(remaining)&&remaining>=0&&remaining<=original&&batch.purchasePrice!=null&&batch.purchasePrice!==''&&Number.isFinite(cost)&&cost>=0;
 });
}
