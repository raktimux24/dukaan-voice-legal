import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {contractFingerprint} from '../scripts/release-provenance.mjs';
const root=mkdtempSync(join(tmpdir(),'gst-provenance-'));
try {
  const folder=join(root,'app/lib/shop/gst-core');mkdirSync(folder,{recursive:true});
  const source='reviewed fiscal contract';
  const manifest=JSON.stringify([{file:'contract.ts',vendoredSha256:createHash('sha256').update(source).digest('hex')}]);
  writeFileSync(join(folder,'contract.ts'),source);writeFileSync(join(folder,'manifest.json'),manifest);
  assert.equal(contractFingerprint(root).count,1);
  assert.equal(contractFingerprint(root).sha256,createHash('sha256').update(manifest).digest('hex'));
  writeFileSync(join(folder,'contract.ts'),'changed without review');
  assert.throws(()=>contractFingerprint(root),/GST contract drift/);
  console.log('Release provenance rejects changed contracts and identifies the exact reviewed manifest.');
}finally{rmSync(root,{recursive:true,force:true});}
