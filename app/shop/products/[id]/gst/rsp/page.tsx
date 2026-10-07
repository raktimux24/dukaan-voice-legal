import {GstRspScreen} from '../../../../../components/shop/screens/gst-rsp';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <GstRspScreen id={id}/>;}
