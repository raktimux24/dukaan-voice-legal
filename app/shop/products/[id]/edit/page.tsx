import { Suspense } from 'react';
import { ProductFormScreen } from '../../../../components/shop/screens/product-form';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <ProductFormScreen productId={id} />
    </Suspense>
  );
}
