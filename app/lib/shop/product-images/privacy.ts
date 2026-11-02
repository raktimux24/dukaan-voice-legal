/** Temporary image leases must never enter request logs or telemetry metadata. */
export function redactProductImageAccess(value:string):string{
 return value.replace(/(\/media\/private\/[^\s?"'<>]+)\?[^\s"'<>]*/g,'$1?[redacted]');
}
/** Clone JSON-style event metadata, preserving cycles and special non-JSON objects. */
export function scrubProductImageAccess<T>(value:T):T{
 const seen=new WeakMap<object,unknown>();
 const scrub=(v:unknown):unknown=>{
  if(typeof v==='string')return redactProductImageAccess(v);
  if(!v||typeof v!=='object')return v;
  if(seen.has(v))return seen.get(v);
  if(!Array.isArray(v)&&![Object.prototype,null].includes(Object.getPrototypeOf(v)))return v;
  const copy:any=Array.isArray(v)?[]:{};seen.set(v,copy);
  for(const [key,item]of Object.entries(v))Object.defineProperty(copy,key,{enumerable:true,configurable:true,writable:true,value:scrub(item)});
  return copy;
 };
 return scrub(value) as T;
}
