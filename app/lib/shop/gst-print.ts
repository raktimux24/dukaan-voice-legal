const styles=`@page{size:A4;margin:14mm}body{font:14px Inter,Arial,sans-serif;color:#111;margin:0}h2{font-size:20px}p{line-height:1.5}table{width:100%;border-collapse:collapse;font-size:11px}th,td{padding:8px 5px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{font-weight:700}thead{display:table-header-group}tr{break-inside:avoid}.no-print{display:none}.gst-price-preview{display:grid;gap:8px;margin:20px 0}.gst-price-preview span{display:flex;justify-content:space-between;gap:20px}.gst-row{margin:16px 0}.shop-hint{font-size:11px;color:#444}header{margin-bottom:20px}`;
export function documentHtml(element:HTMLElement,title:string){
 return '<!doctype html><html><head><meta charset="utf-8"><title>'+title.replace(/[<>&"]/g,'')+'</title><style>'+styles+'</style></head><body>'+element.outerHTML+'</body></html>';
}
/** Print only the selected retained document; the surrounding workspace never becomes the invoice. */
export function printDocument(element:HTMLElement,title:string){
 const frame=document.createElement('iframe');frame.title=title;frame.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;border:0';
 document.body.appendChild(frame);
 const target=frame.contentDocument,view=frame.contentWindow;
 if(!target||!view){frame.remove();throw Error('Could not open the print preview.');}
 target.open();target.write(documentHtml(element,title));target.close();
 const cleanup=()=>frame.remove();view.addEventListener('afterprint',cleanup,{once:true});
 void target.fonts.ready.then(()=>{view.focus();view.print();});
 // Some browsers do not emit afterprint when their preview is cancelled.
 window.setTimeout(cleanup,120000);
}
