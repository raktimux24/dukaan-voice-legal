import {spawnSync} from 'node:child_process';
import {gitIdentity} from './release-provenance.mjs';
const source=process.env.GST_SOURCE_ROOT;
if(!source)throw Error('GST_SOURCE_ROOT must identify the reviewed mobile/backend checkout.');
for(const root of [process.cwd(),source])if(gitIdentity(root).trackedChanges)throw Error('Commit tracked changes in both reviewed checkouts before a release check.');
function run(file,args,cwd=process.cwd()){
  const result=spawnSync(file,args,{cwd,stdio:'inherit',env:{...process.env,GST_REQUIRE_CLEAN_RELEASE:'1'}});
  if(result.error)throw result.error;
  if(result.status!==0)throw Error(`Release check failed: ${file} ${args.join(' ')}`);
}
run(process.execPath,['scripts/check-gst-core.mjs']);
run(process.execPath,['scripts/sync-gst-core.mjs','--check']);
run(process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--incremental','false'],source);
run(process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--incremental','false'],`${source}/server`);
run('npm',['run','build:verified']);
console.log('Local GST release checks passed. Deployment, physical-device acceptance and store review are separate gates.');
