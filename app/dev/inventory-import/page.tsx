import {notFound} from 'next/navigation';
import {ImportDevelopmentPreview} from './preview';
import '../../shop/shop.css';
export const metadata={title:'Local inventory import — Samaan Bol',robots:{index:false,follow:false}};
export default function ImportPreviewPage(){if(process.env.NODE_ENV!=='development')notFound();return <ImportDevelopmentPreview/>;}
