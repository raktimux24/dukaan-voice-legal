/** Current settlement read model. Original checkout amounts and issued documents stay immutable. */
export interface SaleCollection {
  status: 'paid' | 'partial' | 'unpaid' | 'settled' | 'review';
  remainingCredit: string | null;
  allocatedCollections: string;
  creditReduced: string;
}

export function saleCollectionStatus(sale: {status: string; creditTotal: number; collection?: SaleCollection | null}) {
  if (sale.status === 'voided') return 'voided' as const;
  // Older/offline responses cannot establish today's balance on a credit bill.
  return sale.collection?.status ?? (sale.creditTotal > 0 ? 'review' as const : 'paid' as const);
}

export function saleCollectionLabel(status: ReturnType<typeof saleCollectionStatus>) {
  return {paid:'bill.paid',partial:'counter.part_paid',unpaid:'counter.unpaid',settled:'collection.settled',review:'collection.review',voided:'sales.status_filter.voided'}[status];
}
