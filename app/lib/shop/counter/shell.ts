/** A registration may be ready while its replacement is still installing. Warm the replacement. */
export async function counterShellWorker(registration:Pick<ServiceWorkerRegistration,'installing'|'waiting'|'active'>,timeout=15000){
 const worker=registration.installing??registration.waiting??registration.active;if(!worker)return null;if(worker.state==='activated')return worker;
 return new Promise<ServiceWorker>((resolve,reject)=>{let timer:ReturnType<typeof setTimeout>;const cleanup=()=>{clearTimeout(timer);worker.removeEventListener('statechange',changed)},changed=()=>{if(worker.state==='activated'){cleanup();resolve(worker)}else if(worker.state==='redundant'){cleanup();reject(Error('counter_shell_unavailable'))}};timer=setTimeout(()=>{cleanup();reject(Error('counter_shell_unavailable'))},timeout);worker.addEventListener('statechange',changed);changed()});
}
