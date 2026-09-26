import { Suspense } from 'react';
import { ProductsScreen } from '../../components/shop/screens/products';

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <ProductsScreen />
    </Suspense>
  );
}
