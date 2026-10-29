import {NextRequest,NextResponse} from 'next/server';
async function handle(request:NextRequest,{params}:{params:Promise<{path?:string[]}>}){
 if(process.env.NODE_ENV!=='development')return new NextResponse(null,{status:404});
 const {path=[]}=await params;
 if(path.length>2||path.some(p=>!/^[a-z0-9-]+$/i.test(p)))return new NextResponse(null,{status:404});
 try{
  const response=await fetch('http://127.0.0.1:3002/api/shops/10000000-0000-4000-8000-000000000001/imports'+(path.length?'/'+path.join('/'):'')+request.nextUrl.search,{method:request.method,headers:{'Content-Type':'application/json'},body:request.method==='POST'?await request.text():undefined,cache:'no-store'});
  return new NextResponse(await response.text(),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'import_unavailable'},{status:503});}
}
export const GET=handle;export const POST=handle;
