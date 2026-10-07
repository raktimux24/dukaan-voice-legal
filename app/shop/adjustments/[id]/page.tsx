import { GstAdjustmentScreen } from '../../../components/shop/screens/gst-adjustment';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <GstAdjustmentScreen id={id}/>;}
