import { Suspense } from 'react';
import { SaleDetailScreen } from '../../../components/shop/screens/sale-detail';

export default async function SalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <SaleDetailScreen saleId={id} />
    </Suspense>
  );
}
