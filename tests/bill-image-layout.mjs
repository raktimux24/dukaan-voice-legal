import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {billImageLayout,wrapBillText}=require(process.env.GST_TEST_BUILD+'/share-bill.js');
const segments=text=>[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(part=>part.segment);
const measure=text=>segments(text).length*8;
const unspaced=text=>text.replace(/\s+/g,'');
for(const text of ['A product name that previously disappeared after thirty two characters', 'বাংলা পণ্যের একটি দীর্ঘ নাম এবং সম্পূর্ণ বিবরণ', 'हिंदी में बहुत लंबा उत्पाद विवरण', 'क्‍ष'.repeat(80), 'SKU'.repeat(80)]){
 const wrapped=wrapBillText(text,100,measure);
 assert.equal(unspaced(wrapped.join('')),unspaced(text),'all text survives wrapping');
 assert.ok(wrapped.every(line=>measure(line)<=100));
 assert.deepEqual(segments(wrapped.join('').replace(/\s+/g,'')),segments(unspaced(text)),'grapheme clusters remain intact');
}
assert.deepEqual(wrapBillText('First\n\nLast',100,measure),['First','','Last']);
const bill={shopName:'A long shop name '.repeat(8),address:'Full address '.repeat(20),phone:'9999999999',saleNumber:12,when:'10 October 2026 at 11:59 PM IST',lines:Array.from({length:100},(_,index)=>({name:`${index} — পণ্যের সম্পূর্ণ দীর্ঘ নাম `.repeat(3),detail:'100 pieces × ₹12345.67',amount:'₹1234567.00'})),subtotal:'₹1234567.00',discount:'−₹1.00',total:'₹1234566.00',payments:['Cash received ₹1234567.00; change to return ₹1.00 '.repeat(5)],footer:'Custom multiline footer\n'+'ধন্যবাদ '.repeat(30)};
const layout=billImageLayout(bill,measure);
const textCommands=layout.commands.filter(command=>command.kind==='text');
assert.ok(layout.height>220+100*48,'height grows with wrapped content');
for(const command of textCommands){
 const width=measure(command.text);
 const left=command.align==='center'?command.x-width/2:command.align==='right'?command.x-width:command.x;
 assert.ok(left>=24&&left+width<=396,'text remains within content bounds');
 assert.ok(command.y+29<=layout.height,'last text is not clipped by bitmap height');
}
for(let index=1;index<layout.commands.length;index++){
 // The right column may share a row with the left column; every subsequent section moves down.
 const previous=layout.commands[index-1],current=layout.commands[index];
 if(previous.kind==='rule'&&current.kind==='text')assert.ok(current.y>previous.y);
}
assert.equal(textCommands.filter(c=>c.text==='₹1234567.00').length,101,'every line amount and subtotal survives');
assert.ok(textCommands.some(c=>c.text==='₹1234566.00'));
console.log('Bill images: 100 long multilingual lines, grapheme-safe wrapping, bounded amounts and measured footer height passed.');
