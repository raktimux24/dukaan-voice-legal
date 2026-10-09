export interface TaxHistoryCapture {capturedAt?:string;nextEffectiveAt?:string|null}
export function taxHistoryBoundary(capture:TaxHistoryCapture):number|null{
 if(capture.nextEffectiveAt==null)return null;
 const boundary=Date.parse(capture.nextEffectiveAt),recorded=Date.parse(capture.capturedAt??'');
 if(!Number.isFinite(boundary)||!Number.isFinite(recorded)||boundary<=recorded)throw new Error('invalid_tax_history_capture');
 return boundary;
}
export interface BoundaryClock {now():number;setTimer(callback:()=>void,delay:number):unknown;clearTimer(timer:unknown):void}
/** Recompute against the clock in bounded steps; a due boundary fires once. */
export function watchTaxHistoryBoundary(boundary:number,clock:BoundaryClock,onDue:()=>void):()=>void{
 let timer:unknown,closed=false;
 const tick=()=>{
  if(closed)return;
  const remaining=boundary-clock.now();
  if(remaining<=0){closed=true;onDue();}
  else timer=clock.setTimer(tick,Math.min(remaining,60_000));
 };
 tick();
 return()=>{closed=true;if(timer!==undefined)clock.clearTimer(timer);};
}
