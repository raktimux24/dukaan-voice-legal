import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {releaseProvenance} from './release-provenance.mjs';
export function run(command,args,cwd=process.cwd()) {
  const result=spawnSync(command,args,{cwd,stdio:'inherit',env:process.env});
  if(result.error)throw result.error;
  if(result.status!==0)throw Error(`Release check failed: ${command} ${args.join(' ')}`);
}
run(process.execPath,['scripts/check-gst-core.mjs']);
run('npm',['run','test:gst']);
run('npm',['run','test:translations']);
run(process.execPath,['tests/release-provenance.mjs']);
const evidence=releaseProvenance(process.cwd(),process.env.GST_SOURCE_ROOT);
if(process.env.GST_REQUIRE_CLEAN_RELEASE==='1'&&(evidence.web.trackedChanges||evidence.mobileSource?.trackedChanges))throw Error('Commit tracked source changes before preparing a release.');
writeFileSync('public/release.json',JSON.stringify(evidence,null,2)+'\n');
run('npm',['run','build']);
console.log(`Verified build ${evidence.web.commit}; ${evidence.gstContracts.count} GST contracts ${evidence.gstContracts.sha256}`);
