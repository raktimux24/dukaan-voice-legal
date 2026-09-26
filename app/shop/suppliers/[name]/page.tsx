import { SupplierDetailScreen } from '../../../components/shop/screens/supplier-detail';

export default async function SupplierPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <SupplierDetailScreen name={name} />;
}
