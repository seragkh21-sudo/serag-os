import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function harness(storage=new Map()){
 const c={user:{id:'owner-a'},document:{addEventListener(){},querySelector(){return null},querySelectorAll(){return []},getElementById(){return null}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setInterval(){},clearInterval(){},addEventListener(){},Date,Math,Map,Set,console};
 c.window=c;vm.createContext(c);
 const load=file=>vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
 load('english-practice-state-v1.js');
 return {c,storage,load,api:c.SERAG_PRACTICE_STATE};
}
const question={id:'grammar:first',topic:'present',prompt:'She ___ here every day.',answer:'works'};

test('question aliases share cooldown across entry points, reloads and topics',()=>{
 const {api,storage}=harness();api.remember(question);
 const alias={...question,id:'quiz:alternate',topic:'different-topic',prompt:'SHE _____ here every day!'};
 assert.equal(api.recent(alias),true);
 assert.equal(harness(storage).api.recent(alias),true);
 assert.equal(api.recent(alias,Date.now()+86400001),false);
});

test('recency belongs to the account and guest practice never writes an owner history',()=>{
 const {c,api,storage}=harness();api.remember(question);c.user={id:'owner-b'};
 assert.equal(api.recent(question),false);api.remember({...question,id:'b'});
 c.user={id:'owner-a'};assert.equal(api.recent(question),true);
 c.user=null;const before=storage.size;api.remember(question);assert.equal(storage.size,before);
});

test('cross-device prompt exposures prevent aliases without awarding activity',()=>{
 const {c,api}=harness();let writes=0;const canonical=api.key(question);
 c.ENGOPLAY={stats:()=>({lastAnsweredAt:new Map()}),exposureStatus:id=>id===canonical?{shown_at:new Date().toISOString()}:null,track(){writes++}};
 assert.equal(api.recent({...question,id:'another-entry'}),true);assert.equal(writes,0);
});

test('legacy word attempts, including assisted answers, remain in cooldown',()=>{
 const {api,storage}=harness();storage.set('seragSentenceV21:owner-a',JSON.stringify({appointment:{at:new Date().toISOString(),last_assisted:true}}));
 assert.equal(api.recentWord({id:'vocab:appointment',phrase:'appointment'}),true);
});

test('shared word sessions never refill from words exposed moments ago',()=>{
 const {c,load}=harness();load('english-content-v9.js');load('english-expansion-v1.js');load('word-practice-v21.js');
 const wp=c.SERAG_WORD_PRACTICE,first=[];wp.start();
 for(let i=0;i<4;i++){first.push(wp.currentQuestion().item.phrase);wp.reveal();wp.next()}
 wp.start();assert.ok(!first.includes(wp.currentQuestion().item.phrase));
 for(const item of wp.items())c.SERAG_PRACTICE_STATE.rememberWord(item);
 wp.start();assert.equal(wp.currentQuestion(),null);assert.match(wp.html(),/up to date/);
 // Explicitly choosing a target still permits deliberate revision.
 wp.start(first[0]);assert.equal(wp.currentQuestion().item.phrase,first[0]);
});

test('starting a session waits for history and discards an old account request',async()=>{
 const {c,load}=harness();load('english-content-v9.js');load('word-practice-v21.js');
 let release;c.ENGOPLAY={isReady:false,ensureReady:()=>new Promise(resolve=>release=resolve)};
 const pending=c.SERAG_WORD_PRACTICE.start();assert.equal(c.SERAG_WORD_PRACTICE.currentQuestion(),null);
 c.user={id:'owner-b'};c.ENGOPLAY.isReady=true;release();await pending;
 assert.equal(c.SERAG_WORD_PRACTICE.currentQuestion(),null);
 c.SERAG_WORD_PRACTICE.start();assert.ok(c.SERAG_WORD_PRACTICE.currentQuestion());
});

test('the expansion is additive and both engines read its vocabulary and questions',()=>{
 const {c,load}=harness();load('english-content-v9.js');const old=c.SERAG_ENGLISH_V9.vocabulary.length;
 load('english-expansion-v1.js');const expanded=c.SERAG_ENGLISH_V9.vocabulary.length;load('english-expansion-v1.js');
 assert.ok(expanded>old);assert.equal(c.SERAG_ENGLISH_V9.vocabulary.length,expanded);
 load('english-grammar-v10.js');load('english-academy-v12.js');load('word-practice-v21.js');
 const qs=c.SERAG_ACADEMY_V12.questions();assert.equal(qs.filter(q=>q.id.startsWith('expansion-v1:')).length,40);
 for(const q of c.SERAG_ENGLISH_EXPANSION_V1.questions){assert.ok(q.options.includes(q.answer));assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.explanation)}
 for(const [phrase] of c.SERAG_ENGLISH_EXPANSION_V1.vocabulary){const item=c.SERAG_WORD_PRACTICE.items().find(w=>w.phrase===phrase);assert.ok(item,phrase);const q=c.SERAG_WORD_PRACTICE.question(item);assert.equal(q.fallback,false,phrase);assert.equal(q.before+q.answer+q.after,q.sentence)}
 assert.equal(c.SERAG_ACADEMY_V12.questions(),qs,'bank is reused when sources are unchanged');
 assert.equal(c.SERAG_WORD_PRACTICE.items(),c.SERAG_WORD_PRACTICE.items());
 c.SERAG_ENGLISH_EXPANSION_V1.questions.push({id:'test:new',topic:'present-simple',level:'B1',prompt:'We ___ regularly.',answer:'practise',options:['practise','practises']});
 assert.notEqual(c.SERAG_ACADEMY_V12.questions(),qs);
 assert.ok(c.SERAG_ACADEMY_V12.questions().some(q=>q.id==='test:new'));
 c.SERAG_ENGLISH_V9.vocabulary.push(['cache invalidation','تحديث البيانات','Test','This example checks cache invalidation.','']);
 assert.ok(c.SERAG_WORD_PRACTICE.items().some(w=>w.phrase==='cache invalidation'));
});

test('EngoPlay cannot report ready before remote history arrives or when it fails',async()=>{
 for(const failed of [false,true]){
  const {c,load}=harness();let release;const exposureWrites=[];
  const history=new Promise(resolve=>release=resolve);
  c.document.readyState='loading';c.Intl=Intl;c.crypto={randomUUID:()=> 'event-id'};
  c.sb={rpc:async()=>({data:[],error:null}),from(table){
   let patch;
   const q={select(){return q},eq(){return q},order(){return q},limit(){return q},maybeSingle(){return q},upsert(rows){patch=rows;if(table==='engoplay_question_exposures')exposureWrites.push(rows);return q},
    then(resolve,reject){
     const value=patch?Promise.resolve({data:[],error:null}):table==='engoplay_activity'?history:Promise.resolve({data:table==='profiles'?{username:'tester',display_name:'Tester',avatar_id:'curly',onboarding_completed_at:'2026-01-01'}:[],error:null});
     return value.then(resolve,reject);
    }};return q;
  }};
  load('engoplay-v19.js');
  const ready=c.ENGOPLAY.ensureReady();assert.equal(c.ENGOPLAY.isReady,false);
  release(failed?{data:null,error:{message:'offline'}}:{data:[{question_key:'solved',activity_date:'2026-11-07',learned_at:new Date().toISOString(),correct:true}],error:null});
  await ready;assert.equal(c.ENGOPLAY.isReady,!failed);
  if(!failed){
   assert.ok(c.ENGOPLAY.stats().answeredKeys.has('solved'));
   c.ENGOPLAY.recordPresented(['marker-a','marker-b','marker-c']);
   for(let i=0;i<15;i++)await Promise.resolve();
   assert.equal(exposureWrites.length,1);assert.equal(exposureWrites[0].length,3);
  }
 }
});
