import type {QueryClient} from '@tanstack/react-query';
import type {DocumentContextView} from './contract';
/** Publish a confirmed profile before checkout can reuse a cached settings read. */
export async function publishBrandingPos(cache:QueryClient,shopId:string,scope:string,context:DocumentContextView|null,isCurrent:()=>boolean){
  const parts=scope.split(':'),actor=parts[1],keys=[['pos',shopId],['posSettings',shopId,actor,...parts.length>2?[Number(parts[2])]:[]]];
  await Promise.all(keys.map(queryKey=>cache.cancelQueries({queryKey})));
  if(!isCurrent())return false;
  for(const queryKey of keys){cache.setQueriesData<Record<string,unknown>>({queryKey},previous=>previous?{...previous,documentBranding:context,documentBrandingAvailable:true}:previous);void cache.invalidateQueries({queryKey});}
  return true;
}
