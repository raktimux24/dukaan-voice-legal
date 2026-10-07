import { GstSupplierDetailScreen } from "../../../../components/shop/screens/gst-supplier-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GstSupplierDetailScreen id={id} />;
}
