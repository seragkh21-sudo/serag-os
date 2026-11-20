import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const DAY=86400000;
function harness(storage=new Map()){
 let now=Date.UTC(2026,10,20,12);
 class Clock extends Date {constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
 const c={user:{id:'rotation-owner'},Date:Clock,Intl,Math,Map,Set,console,crypto:{randomUUID:()=> 'event'},setTimeout(){},setInterval(){},clearInterval(){},addEventListener(){},document:{readyState:'loading',addEventListener(){},querySelector(){return null},querySelectorAll(){return []},getElementById(){return null}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
 c.window=c;vm.createContext(c);
 const load=file=>vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
 load('english-practice-state-v1.js');
 return {c,storage,load,advance:n=>now+=n*DAY};
}
const rows=n=>Array.from({length:n},(_,i)=>({id:'rotation:'+i,topic:'topic-'+i%8,level:'B2',prompt:'Original question number '+i,answer:'yes',options:['yes','no']}));

test('normal grammar exhausts two full bank rotations across days, reloads and added content',()=>{
 let h=harness();h.load('english-academy-v12.js');h.c.SERAG_ACADEMY_V12.homeState();
 const bank=rows(128),counts=new Map();
 for(let session=0;session<32;session++){
  const picked=h.c.SERAG_ACADEMY_V12.selectQuestions(bank,'daily',8);
  assert.equal(picked.length,8);
  for(const q of picked){const count=counts.get(q.id)||0;assert.equal(count,Math.floor(session/16),'no repeat before every eligible question was used');counts.set(q.id,count+1);h.c.SERAG_PRACTICE_STATE.remember(q)}
  h.advance(2);
  if(session===15){h=harness(h.storage);h.advance(40);h.load('english-academy-v12.js');h.c.SERAG_ACADEMY_V12.homeState()}
 }
 assert.equal(counts.size,128);assert.ok([...counts.values()].every(n=>n===2));
 const added={...rows(129)[128]};bank.push(added);
 assert.deepEqual(Array.from(h.c.SERAG_ACADEMY_V12.selectQuestions(bank,'daily',8),q=>q.id),[added.id],'a new import takes priority over all previously seen questions');
});

test('a week-old due question cannot displace unseen questions, even under another ID',()=>{
 const {c,load}=harness();load('english-academy-v12.js');c.SERAG_ACADEMY_V12.homeState();
 const [old,fresh]=rows(2),alias={...old,id:'another-id',topic:'another-topic'};
 c.ENGOPLAY={stats:()=>({answeredKeys:new Set([old.id]),lastAnsweredAt:new Map([[old.id,c.Date.now()-7*DAY]])})};
 const picked=c.SERAG_ACADEMY_V12.selectQuestions([alias,old,fresh],'daily',8);
 assert.deepEqual(Array.from(picked,q=>q.id),[fresh.id]);
});

test('prompt fingerprints survive a month and another write, without changing cooldown duration',()=>{
 const h=harness(),[old,fresh]=rows(2);h.c.SERAG_PRACTICE_STATE.remember(old);h.advance(30);
 h.c.SERAG_PRACTICE_STATE.remember(fresh);
 const api=h.c.SERAG_PRACTICE_STATE;
 assert.equal(api.recent(old),false);assert.ok(api.last({...old,id:'alias'})>0);
 const reloaded=harness(h.storage).c.SERAG_PRACTICE_STATE;
 assert.ok(reloaded.last({...old,id:'alias'})>0,'reload retains lifetime seen evidence');
});

test('vocabulary uses old cross-device recognition history before choosing a fresh word',()=>{
 const {c,load}=harness();load('word-practice-v21.js');
 c.ENGOPLAY={stats:()=>({lastAnsweredAt:new Map([['recognition:old word',c.Date.now()-30*DAY]])})};
 const words=['old word','new word'].map(phrase=>({id:'vocab:'+phrase,phrase}));
 assert.deepEqual(Array.from(c.SERAG_WORD_PRACTICE.orderPool(words),q=>q.phrase),['new word']);
});

test('sentence-building uses its entire pool before repeating across later days',()=>{
 const h=harness();h.load('word-practice-v21.js');
 const bank=rows(120).map(q=>({...q,tokens:['We','can','practise','sentence',String(q.id)]})),seen=new Set();
 for(let session=0;session<60;session++){
  const picked=h.c.SERAG_WORD_PRACTICE.buildRound([],[],4,bank,true).filter(q=>q.kind==='build');
  assert.equal(picked.length,2);
  for(const q of picked){assert.ok(!seen.has(q.id),'old builders cannot outrank unused builders');seen.add(q.id);h.c.SERAG_PRACTICE_STATE.remember(q)}
  h.advance(2);
 }
 assert.equal(seen.size,bank.length);
 assert.equal(h.c.SERAG_WORD_PRACTICE.buildRound([],[],4,bank,true).filter(q=>q.kind==='build').length,2);
});

test('Today’s Practice receives the full level-specific sentence bank before selection',()=>{
 const {c,load}=harness();
 const examples=Array.from({length:30},(_,i)=>({id:'example-'+i,level:i<20?'B2':'C1',sentence:'We can use this complete sentence for example '+i+'.'}));
 c.SERAG_GRAMMAR_EXAMPLES_V1={getExamples:()=>examples};load('engoplay-quests-v1.js');
 const builds=c.SERAG_ENGOPLAY_QUESTS_V1.getPracticeQuestions('B2');
 assert.equal(builds.length,20);assert.ok(builds.every(q=>q.level==='B2'));
 assert.equal(c.SERAG_ENGOPLAY_QUESTS_V1.getPracticeQuestions('C2').length,0,'do not silently substitute another level');
 let received;c.SERAG_ACADEMY_V12={homeState:()=>({level:'B2'}),questions:()=>[],open(){}};
 c.SERAG_WORD_PRACTICE={startJourney(ids,title,questions){received=questions}};
 load('engoplay-v19.js');c.ENGOPLAY.startDaily();
 assert.equal(received.length,20,'avoid preselecting just two daily examples');
});

for(const failedPage of [false,true])test('remote history is fully paged and a later failure prevents readiness: '+failedPage,async()=>{
 const {c,load}=harness(),calls=[];
 const data={engoplay_activity:Array.from({length:1201},(_,i)=>({question_key:'old-'+String(i).padStart(4,'0'),activity_date:'2026-01-01',learned_at:'2026-01-01T12:00:00Z',correct:true})),engoplay_question_exposures:Array.from({length:2201},(_,i)=>({question_key:'shown-'+i,shown_at:'2026-02-01T12:00:00Z'})),engoplay_word_reviews:[]};
 c.sb={rpc:async()=>({data:[],error:null}),from(table){
  let start=0,end=Infinity;const filters=[],orders=[];
  const q={select(){return q},eq(key,value){filters.push([key,value]);return q},order(key){orders.push(key);return q},range(a,b){start=a;end=b;return q},maybeSingle(){return q},then(resolve,reject){
   calls.push({table,start,end,filters,orders});
   const error=failedPage&&table==='engoplay_activity'&&start===500?{message:'offline'}:null;
   return Promise.resolve({data:table==='profiles'?{username:'tester',display_name:'Tester',avatar_id:'curly',onboarding_completed_at:'2026-01-01'}:(data[table]||[]).slice(start,end+1),error}).then(resolve,reject);
  }};return q;
 }};
 load('engoplay-v19.js');await c.ENGOPLAY.ensureReady();
 assert.equal(c.ENGOPLAY.isReady,!failedPage);
 if(!failedPage){assert.equal(c.ENGOPLAY.stats().answeredKeys.size,1201);assert.ok(c.ENGOPLAY.stats().answeredKeys.has('old-0000'));assert.ok(c.ENGOPLAY.exposureStatus('shown-2200'))}
 for(const call of calls.filter(x=>x.table!=='profiles')){assert.ok(call.filters.some(([k,v])=>k==='user_id'&&v==='rotation-owner'));assert.ok(call.orders.length);assert.ok(call.end-call.start<500)}
});

test('the home quiz includes four-option imported questions and Next uses the shared selector',()=>{
 const {c,load}=harness();load('english-academy-v12.js');c.SERAG_ACADEMY_V12.homeState();c.SERAG_ACADEMY_V12.setLevel('B2');
 const imported={...rows(1)[0],options:['yes','no','maybe','never']};
 c.SERAG_ENGLISH_EXPANSION_V1={questions:[imported]};
 assert.equal(c.SERAG_ACADEMY_V12.homeQuestion()?.id,imported.id,'four-option questions must be available on the home card');
 // Run the actual Next handler: it must not construct a second, narrower pool.
 const source=fs.readFileSync('home-studio-v18.js','utf8'),line=source.split('\n').find(x=>x.includes("if(b.hasAttribute('data-so-next-question'))"));
 const pick={id:'shared-choice'};let called=0,rendered=0;
 const result=new Function('b','academy','renderQuick','quick','quickResult',line+';return {quick,quickResult}')({hasAttribute:()=>true},()=>({homeQuestion(){called++;return pick}}),()=>rendered++,null,{});
 assert.equal(called,1);assert.equal(rendered,1);assert.equal(result.quick,pick);assert.equal(result.quickResult,null);
});

test('legacy daily quiz also prefers unused questions over prompts answered last week',()=>{
 const {c,load}=harness();load('english-content-v9.js');load('english-learning-v6.js');
 const api=c.SERAG_DAILY_QUIZ_V6,bank=api.buildQuizBank(),old=bank[0];
 c.ENGOPLAY={stats:()=>({lastAnsweredAt:new Map([[old.key,c.Date.now()-7*DAY]])})};
 const pick=api.selectQuestion([old.key],[]);
 assert.ok(pick);assert.notEqual(pick.key,old.key);
});

test('a small builder or vocabulary bank never recycles while mixed grammar remains unused',()=>{
 const h=harness();h.load('english-content-v9.js');h.load('english-academy-v12.js');h.load('word-practice-v21.js');
 const grammar=rows(6),builder={...rows(1)[0],id:'builder-old',tokens:['We','can','practise','this','sentence']};
 h.c.SERAG_ENGLISH_EXPANSION_V1={questions:grammar};h.c.SERAG_ACADEMY_V12.homeState();
 for(const word of h.c.SERAG_WORD_PRACTICE.items())h.c.SERAG_PRACTICE_STATE.rememberWord(word);
 h.c.SERAG_PRACTICE_STATE.remember(builder);h.advance(7);
 const wp=h.c.SERAG_WORD_PRACTICE;wp.startJourney(grammar.map(q=>q.id),'Mixed rotation',[builder],true);
 const shown=[];
 while(wp.currentQuestion()){const q=wp.currentQuestion();shown.push(q);wp.reveal();wp.next()}
 assert.equal(shown.length,2,'do not top up a new grammar batch with old words or builders');
 assert.ok(shown.every(q=>q.kind==='grammar'));
});
