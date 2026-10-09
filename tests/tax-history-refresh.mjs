import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const {taxHistoryBoundary,watchTaxHistoryBoundary}=require(join(process.env.GST_TEST_BUILD,'tax-history-refresh.js'));
assert.equal(taxHistoryBoundary({}),null);
assert.equal(taxHistoryBoundary({capturedAt:'2026-10-10T00:00:00Z',nextEffectiveAt:'2026-10-10T01:00:00Z'}),Date.parse('2026-10-10T01:00:00Z'));
for(const capture of [{nextEffectiveAt:'bad'},{nextEffectiveAt:'2026-10-10T01:00:00Z'},{capturedAt:'2026-10-10T01:00:00Z',nextEffectiveAt:'2026-10-10T01:00:00Z'},{capturedAt:'2026-10-10T02:00:00Z',nextEffectiveAt:'2026-10-10T01:00:00Z'}])assert.throws(()=>taxHistoryBoundary(capture),/invalid_tax_history_capture/);
let now=0, callback, delays=[], fired=0, cleared=[];
const clock={now:()=>now,setTimer:(fn,delay)=>{callback=fn;delays.push(delay);return delays.length},clearTimer:id=>cleared.push(id)};
const stop=watchTaxHistoryBoundary(120001,clock,()=>fired++);
assert.deepEqual(delays,[60000]); now=60000;callback();assert.deepEqual(delays,[60000,60000]);now=120000;callback();assert.equal(delays.at(-1),1);now=120001;callback();callback();assert.equal(fired,1);stop();
const cancel=watchTaxHistoryBoundary(now+5000,clock,()=>fired++);cancel();callback();assert.equal(fired,1);assert.ok(cleared.length);
watchTaxHistoryBoundary(now-1,clock,()=>fired++);assert.equal(fired,2);
// A resumed browser can jump past the boundary; recompute rather than trust the delay.
watchTaxHistoryBoundary(now+600000,clock,()=>fired++);now+=900000;callback();assert.equal(fired,3);
console.log('Tax history: invalid captures, bounded waits, effective-boundary refresh, cancellation and resumed clock passed.');
