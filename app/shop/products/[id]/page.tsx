import { Suspense } from 'react';
import { ProductDetailScreen } from '../../../components/shop/screens/product-detail';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <ProductDetailScreen productId={id} />
    </Suspense>
  );
}
