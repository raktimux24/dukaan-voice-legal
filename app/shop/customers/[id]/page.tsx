import { CustomerDetailScreen } from '../../../components/shop/screens/customer-detail';

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerDetailScreen customerId={id} />;
}
