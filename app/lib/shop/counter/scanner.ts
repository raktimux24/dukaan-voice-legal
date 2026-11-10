export type CameraDependencies={stream:()=>Promise<MediaStream>;detector:()=>Promise<{detect:(video:HTMLVideoElement)=>Promise<{rawValue?:string}[]>}>;frame:(fn:()=>void)=>number;cancel:(id:number)=>void};
/** A camera session consumes one code. Closing it also stops a late-arriving stream. */
export function startCounterCamera(video:HTMLVideoElement,onCode:(code:string)=>void,onError:(kind:'camera_blocked'|'camera_failed')=>void,deps:CameraDependencies){
 let stopped=false,consumed=false,stream:MediaStream|undefined,frame:number|undefined;
 const stop=()=>{if(stopped)return;stopped=true;if(frame!==undefined)deps.cancel(frame);stream?.getTracks().forEach(t=>t.stop());video.srcObject=null};
 void(async()=>{const detector=await deps.detector();if(stopped)return;try{stream=await deps.stream()}catch{if(!stopped)onError('camera_blocked');return}if(stopped){stream.getTracks().forEach(t=>t.stop());return}video.srcObject=stream;await video.play();if(stopped)return;
 const tick=async()=>{if(stopped||consumed)return;const codes=await detector.detect(video);if(stopped||consumed)return;const code=codes.find(c=>c.rawValue?.trim())?.rawValue?.trim();if(code){consumed=true;stop();onCode(code);return}frame=deps.frame(()=>void tick().catch(()=>{if(!stopped){stop();onError('camera_failed')}}))};await tick();})().catch(()=>{if(!stopped){stop();onError('camera_failed')}});return stop;
}
/** Each explicit Enter is a scan; queue serializes lookups without dropping intentional repeats. */
export function serialScanner(){let tail=Promise.resolve();return <T>(task:()=>Promise<T>)=>{const next=tail.then(task);tail=next.then(()=>{},()=>{});return next}}
export function scannerCode(value:string){const code=value.trim();return code.length>0&&code.length<=256&&!/[\u0000-\u001f\u007f]/.test(code)?code:null}
