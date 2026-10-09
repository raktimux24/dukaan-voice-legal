import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { collectPages } = require(join(process.env.GST_TEST_BUILD, 'pagination.js'));
// A full export must exceed the old activity and buy-list caps.
const offsets=[];
const all=await collectPages(async offset=>{
  offsets.push(offset);
  const count=Math.min(100, 6107-offset);
  return {rows:Array.from({length:count},(_,i)=>({id:String(offset+i)})),hasMore:offset+count<6107};
});
assert.equal(all.length,6107);
assert.equal(offsets.at(-1),6100);
assert.equal(all.at(-1).id,'6106');
// Offset follows returned count, even if the server reduces the requested page size.
const shortOffsets=[];
await collectPages(async offset=>{shortOffsets.push(offset);return {rows:[{id:String(offset)}],hasMore:offset<2};});
assert.deepEqual(shortOffsets,[0,1,2]);
await assert.rejects(collectPages(async()=>({rows:[],hasMore:true})),/pagination_incomplete/);
let calls=0;
await assert.rejects(collectPages(async()=>{calls++;return {rows:[{id:'same'}],hasMore:true};}),/pagination_incomplete/);
assert.equal(calls,2);
await assert.rejects(collectPages(async offset=>{if(offset)throw Error('network');return {rows:[{id:'1'}],hasMore:true};}),/network/);
assert.deepEqual(await collectPages(async()=>({rows:[],hasMore:false})),[]);
console.log('Pagination: large exports, short pages, stalled endpoints and network failure passed.');
const {formatDay,formatTime,formatWhen}=require(join(process.env.GST_TEST_BUILD,'money.js'));
const stamp='2026-10-08T20:00:00Z'; // 9 October, 01:30 IST, regardless of browser timezone.
for(const [lang,locale] of [['en','en-IN'],['hi','hi-IN'],['bn','bn-IN'],['ta','ta-IN'],['te','te-IN'],['mr','mr-IN'],['kn','kn-IN'],['gu','gu-IN'],['ml','ml-IN'],['hinglish','en-IN']]) {
  const expected=options=>new Intl.DateTimeFormat(locale,{...options,timeZone:'Asia/Kolkata'}).format(new Date(stamp));
  assert.equal(formatDay(stamp,lang),expected({dateStyle:'medium'}));
  assert.equal(formatTime(stamp,lang),expected({timeStyle:'short'}));
  assert.equal(formatWhen(stamp,lang),expected({dateStyle:'medium',timeStyle:'short'}));
}
assert.equal(formatDay('bad'),'—');assert.equal(formatWhen(null),'—');
const normal=formatWhen(stamp,'bn');
process.env.TZ='America/Los_Angeles';assert.equal(formatWhen(stamp,'bn'),normal);
process.env.TZ='Asia/Tokyo';assert.equal(formatWhen(stamp,'bn'),normal);
console.log('Dates: ten languages, midnight IST boundary, invalid dates and foreign timezones passed.');
