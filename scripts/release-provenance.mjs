import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
export function contractFingerprint(root) {
  const manifest=readFileSync(`${root}/app/lib/shop/gst-core/manifest.json`);
  const entries=JSON.parse(manifest);
  for(const entry of entries){
    const bytes=readFileSync(`${root}/app/lib/shop/gst-core/${entry.file}`);
    if(createHash('sha256').update(bytes).digest('hex')!==entry.vendoredSha256)throw Error(`GST contract drift: ${entry.file}`);
  }
  return {sha256:createHash('sha256').update(manifest).digest('hex'),count:entries.length};
}
export function gitIdentity(root) {
  const run=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
  return {commit:run('rev-parse','HEAD'),trackedChanges:run('status','--porcelain','--untracked-files=no')!==''};
}
export function releaseProvenance(root,sourceRoot) {
  return {format:'samaan_release_v1',builtAt:new Date().toISOString(),web:gitIdentity(root),gstContracts:contractFingerprint(root),...(sourceRoot?{mobileSource:gitIdentity(sourceRoot)}:{})};
}
