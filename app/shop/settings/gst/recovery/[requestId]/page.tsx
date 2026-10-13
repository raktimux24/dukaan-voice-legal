import {LocalFiscalReceiptScreen} from '../../../../../components/shop/screens/local-fiscal-receipt';
export default async function Page({params}:{params:Promise<{requestId:string}>}) {
 const {requestId}=await params;
 return <LocalFiscalReceiptScreen requestId={requestId}/>;
}
