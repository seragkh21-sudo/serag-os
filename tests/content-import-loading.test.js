import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {buildSync} from 'esbuild';
const source=buildSync({entryPoints:['import-src/browser.js'],bundle:true,write:false,format:'iife',platform:'browser'}).outputFiles[0].text;
const makeQuestion=(i,owner='a')=>({id:String(i),source_filename:owner+'-private.json',data:{prompt:`Question ${i} for ${owner} ___ here.`,options:['is','are'],answer:'is',level:'B1',topic:'Imported'}});
function app(respond){
 const calls=[],c={user:{id:'a'},document:{querySelector(){return null},querySelectorAll(){return []},addEventListener(){}},setInterval(){},clearInterval(){},addEventListener(){},console};c.window=c;
 c.sb={from(table){let id;return {select(){return this},eq(k,v){id=v;return this},order(){return this},range(start,end){calls.push({table,id,start,end});return respond({table,id,start,end})}}}};
 vm.runInNewContext(source,c);return {c,api:c.SERAG_CONTENT_IMPORTER,calls};
}
test('imported bank pages all owner rows and invalidates the shared array after refresh',async()=>{
 let data=Array.from({length:1001},(_,i)=>makeQuestion(i));
 const {api,calls}=app(({table,start,end})=>Promise.resolve({data:table==='english_imported_questions'?data.slice(start,end+1):[],error:null}));
 assert.equal(await api.ensureReady(),true);assert.equal(api.questions.length,1001);
 assert.deepEqual(calls.filter(c=>c.table==='english_imported_questions').map(c=>c.start),[0,500,1000]);
 const prior=api.questions;data=[...data,makeQuestion(1001)];await api.ensureReady(true);
 assert.equal(api.questions.length,1002);assert.notEqual(api.questions,prior);
});
test('a later history page failure never exposes a partial initial imported bank',async()=>{
 const {api}=app(({table,start})=>Promise.resolve(table==='english_imported_questions'&&start===500?{data:null,error:{message:'offline'}}:{data:table==='english_imported_questions'?Array.from({length:500},(_,i)=>makeQuestion(i)):[],error:null}));
 assert.equal(await api.ensureReady(),false);assert.equal(api.isReady,false);assert.equal(api.questions.length,0);
});
test('account switch hides old questions immediately and discards a pending old-account read',async()=>{
 const pending=[];
 const {api,c}=app(({table,id})=>id==='a'?new Promise(resolve=>pending.push(()=>resolve({data:table==='english_imported_questions'?[makeQuestion(1,'a')]:[],error:null}))):Promise.resolve({data:table==='english_imported_questions'?[makeQuestion(2,'b')]:[],error:null}));
 c.user={id:'b'};assert.equal(api.questions.length,0);
 assert.equal(await api.ensureReady(),true);pending.forEach(resolve=>resolve());await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(api.questions.length,1);assert.match(api.questions[0].prompt,/for b/);
 assert.equal(api.html().includes('a-private.json'),false);
});
test('refresh failure preserves known content but refuses a fresh comparison',async()=>{
 let fail=false;
 const {api}=app(({table})=>Promise.resolve(fail?{error:{message:'offline'}}:{data:table==='english_imported_questions'?[makeQuestion(1)]:[],error:null}));
 await api.ensureReady();const previous=api.questions;fail=true;
 assert.equal(await api.ensureReady(true),false);assert.equal(api.isReady,true);assert.equal(api.questions,previous);
});
