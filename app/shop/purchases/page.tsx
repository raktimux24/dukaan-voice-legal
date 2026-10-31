import { redirect } from 'next/navigation';
import { PurchasesScreen } from '../../components/shop/screens/purchases';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const params = await searchParams;
  if (params.list !== '1') redirect('/shop/purchases/new');
  return <PurchasesScreen />;
}
