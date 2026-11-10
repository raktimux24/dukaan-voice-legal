import {storeMetadata} from "../../lib/store-metadata";
import {Storefront} from '../../components/store/storefront';
export default function Page(){return <Storefront/>}

export async function generateMetadata({params}:{params:Promise<{storeId:string}>}){const {storeId}=await params;return storeMetadata(storeId);}
