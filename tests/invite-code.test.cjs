const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const exports_={};new Function('exports',ts.transpileModule(fs.readFileSync('app/lib/shop/invite-code.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(exports_);
const {parseInviteCode}=exports_;
test('invite codes accept owned links and normalize without joining automatically',()=>{assert.equal(parseInviteCode(' ab12cd '),'AB12CD');assert.equal(parseInviteCode('https://samaanbol.space/join?code=ab12cd'),'AB12CD');assert.equal(parseInviteCode('samaan-bol://join?code=ab12cd'),'AB12CD')});
test('invite codes reject other origins, duplicate codes and malformed values',()=>{for(const input of ['https://evil.example/join?code=AB12CD','https://samaanbol.space.evil.example/join?code=AB12CD','https://samaanbol.space/join?code=AB12CD&code=ZZ1234','javascript:AB12CD','12345','1234567'])assert.equal(parseInviteCode(input),null)});
