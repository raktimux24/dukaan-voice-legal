import { Suspense } from 'react';
import { ProductFormScreen } from '../../../components/shop/screens/product-form';

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <ProductFormScreen />
    </Suspense>
  );
}
