const styles=`@page{size:A4;margin:14mm}body{font:14px DocumentSans,DocumentIndic,Arial,sans-serif;overflow-wrap:anywhere;color:#111;margin:0}h2{font-size:20px}p{line-height:1.5}table{width:100%;border-collapse:collapse;font-size:11px}th,td{padding:8px 5px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{font-weight:700}thead{display:table-header-group}tr{break-inside:avoid}.no-print{display:none}.gst-price-preview{display:grid;gap:8px;margin:20px 0}.gst-price-preview span{display:flex;justify-content:space-between;gap:20px}.gst-row{margin:16px 0}.shop-hint{font-size:11px;color:#444}header{margin-bottom:20px}.receipt-head{text-align:center}.receipt-shop{font-size:20px;font-weight:700}.receipt-meta,.receipt-lines li,.receipt-pay,.receipt-totals>div{display:flex;justify-content:space-between;gap:16px}.receipt-lines,.receipt-pays{list-style:none;padding:0}.receipt-lines li{padding:8px 0;break-inside:avoid}.receipt-qty{font-size:11px;color:#444}.receipt-rule{border-top:1px dashed #999;margin:12px 0}.receipt-totals dd{margin:0}.is-total{font-weight:700;font-size:18px}.receipt-footer{text-align:center}`;
export function documentHtml(element:HTMLElement,title:string,fontCss=''){
 return '<!doctype html><html><head><meta charset="utf-8"><title>'+title.replace(/[<>&"]/g,'')+'</title><style>'+styles+fontCss+'</style></head><body>'+element.outerHTML+'</body></html>';
}
/** Print only the selected retained document; the surrounding workspace never becomes the invoice. */
export async function printDocument(element:HTMLElement,title:string,fontCss='',check:()=>void=()=>{}){
 check();
 const frame=document.createElement('iframe');frame.title=title;frame.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;border:0';
 document.body.appendChild(frame);
 const target=frame.contentDocument,view=frame.contentWindow;
 if(!target||!view){frame.remove();throw Error('counter_print_failed');}
 target.open();target.write(documentHtml(element,title,fontCss));target.close();
 const cleanup=()=>frame.remove();view.addEventListener('afterprint',cleanup,{once:true});
 try{await target.fonts.ready;check();view.focus();view.print()}catch(e){cleanup();throw e}
 // Some browsers do not emit afterprint when their preview is cancelled.
 window.setTimeout(cleanup,120000);
}
