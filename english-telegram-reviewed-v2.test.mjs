import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=name=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
const code=read('english-telegram-reviewed-v2.js');
const original=read('english-expansion-v1.js');
const first=read('english-telegram-verified-v1.js');
function runFirstAndSecond(){
 const window={};
 runInNewContext(original,{window});
 runInNewContext(first,{window});
 const before=window.SERAG_ENGLISH_EXPANSION_V1.questions.length;
 runInNewContext(code,{window});
 return {window,before};
}
test('reviewed Telegram v2 inserts 250 source-traceable B1/B2 questions without overwrites',()=>{
 const {window,before}=runFirstAndSecond(),stats=window.SERAG_TELEGRAM_IMPORT_V2;
 assert.equal(stats.reviewed,250);
 assert.equal(stats.added,250);
 assert.equal(stats.removedUnreliable,13);
 assert.equal(before,144);
 const rows=window.SERAG_ENGLISH_EXPANSION_V1.questions.filter(q=>q.id.startsWith('telegram-v2:'));
 assert.equal(rows.length,250);
 assert.equal(rows.filter(q=>q.level==='B1').length,100);
 assert.equal(rows.filter(q=>q.level==='B2').length,150);
 const ids=new Set(),questions=new Set();
 for(const q of rows){
   assert.match(q.id,/^telegram-v2:message\d+$/);
   assert.match(q.sourceFile,/^messages(?:\d+)?\.html$/);
   assert.equal(q.sourceMessageId,q.id.substring('telegram-v2:'.length));
   assert.equal(q.source,'telegram-english-courses');
   assert.ok(q.sourcePrompt&&q.sourceDate);
   assert.ok(q.prompt&&q.prompt.length>=13);
   assert.ok(Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=5);
   assert.ok(q.options.includes(q.answer));
   assert.ok(!q.options.some(s=>/\d+ votes|chosen vote/i.test(s)));
   assert.ok(!/كوكب المعرفة|Knowledge Planet/i.test(q.prompt));
   assert.ok(!ids.has(q.id));ids.add(q.id);
   const key=q.prompt.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
   assert.ok(!questions.has(key));questions.add(key);
 }
});
test('v2 drops 13 ambiguous or A1/A2 items from v1 and stays idempotent',()=>{
 const {window,before}=runFirstAndSecond(),pack=window.SERAG_ENGLISH_EXPANSION_V1;
 assert.equal(pack.questions.length,before-13+250);
 const removed='3039 8727 16960 16955 8620 11396 3359 16855 15582 15866 17084 9660 12495'.split(' ').map(x=>'telegram:message'+x);
 for(const id of removed)assert.ok(!pack.questions.some(q=>q.id===id));
 runInNewContext(code,{window});
 assert.equal(pack.questions.length,before-13+250);
 assert.equal(window.SERAG_TELEGRAM_IMPORT_V2.added,0);
 assert.equal(window.SERAG_TELEGRAM_IMPORT_V2.removedUnreliable,0);
});
test('English Academy and EngoPlay load the shared bank after both Telegram modules',()=>{
 const loader=read('app-bootstrap.js'),preview=read('workspace-preview-content.html');
 for(const src of [loader,preview]){
  assert.ok(src.indexOf('english-expansion-v1.js')<src.indexOf('english-telegram-verified-v1.js'));
  assert.ok(src.indexOf('english-telegram-verified-v1.js')<src.indexOf('english-telegram-reviewed-v2.js'));
  assert.ok(src.indexOf('english-telegram-reviewed-v2.js')<src.indexOf('english-academy-v12.js'));
 }
 assert.ok(read('english-academy-v12.js').includes('(window.SERAG_ENGLISH_EXPANSION_V1?.questions||[])'));
 assert.ok(read('engoplay-v19.js').includes('a()?.questions()'));
});
