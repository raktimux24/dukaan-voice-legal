import { PurchaseDetailScreen } from "../../../components/shop/screens/purchase-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PurchaseDetailScreen id={id} />;
}
