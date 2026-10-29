import {PartyImportScreen} from '../../../components/shop/screens/party-import';
export default async function Page({searchParams}:{searchParams:Promise<{jobId?:string}>}){const {jobId}=await searchParams;return <PartyImportScreen kind="customer" jobId={jobId}/>;}
