import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const DAY=86400000;
function app(store=new Map()){
 const c={user:{id:'a'},Intl,Date,Math,document:{addEventListener(){},getElementById(){return null},querySelectorAll(){return []}},
  localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setInterval(){},addEventListener(){}};
 c.window=c;c.ENGOPLAY={isReady:true,track(){}};vm.createContext(c);
 const load=file=>vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
 load('english-skill-evidence-v1.js');return {c,store,api:c.SERAG_SKILL_EVIDENCE,load};
}
const sample=(key,extra={})=>({skill:'recall',key,correct:true,...extra});

test('consistent evidence requires different items and multiple days; XP is irrelevant',()=>{
 const {api,c}=app(),now=Date.now();
 for(let i=0;i<10;i++)api.record(sample('same'),now);
 assert.equal(api.model(now).skills.find(s=>s.id==='recall').total,1);
 for(let i=0;i<3;i++)api.record(sample('word-'+i),now);
 c.ENGOPLAY.stats=()=>({totalXP:999999});
 assert.equal(api.model(now).skills.find(s=>s.id==='recall').status,'Practising');
 api.record(sample('word-0'),now+DAY);
 assert.equal(api.model(now+DAY).skills.find(s=>s.id==='recall').status,'Consistent practice');
 assert.equal(api.model(now+16*DAY).skills.find(s=>s.id==='recall').status,'Needs review');
});

test('first failed/assisted check cannot be repaired by repeated same-day clicks',()=>{
 const {api}=app(),now=Date.now();
 api.record(sample('word',{correct:false}),now);
 assert.equal(api.record(sample('WORD!'),now+1000),false);
 api.record(sample('other',{assisted:true}),now);
 const s=api.model(now+1000).skills.find(s=>s.id==='recall');
 assert.equal(s.total,2);assert.equal(s.independent,0);assert.equal(s.status,'Needs review');
});

test('skills and grammar topics are separate; expression checks cannot establish proficiency',()=>{
 const {api}=app(),now=Date.now();
 api.record({skill:'recognition',key:'word',correct:true},now);
 assert.equal(api.model(now).skills.find(s=>s.id==='recall').total,0);
 api.record({skill:'grammar',key:'She ___ here.|works',topic:'present',correct:true},now);
 assert.equal(api.record({skill:'grammar',key:'SHE _____ here!|works',topic:'alias',correct:true},now),false);
 assert.equal(api.model(now).topics.length,1);
 for(let i=0;i<7;i++)api.record({skill:'expression',key:'sentence-'+i,correct:true},now+(i%2)*DAY);
 assert.equal(api.model(now+DAY).skills.find(s=>s.id==='expression').status,'Practising');
});

test('local evidence survives reload, is isolated by account and waits for history readiness',()=>{
 const {api,c,store}=app();api.record(sample('private expression'));
 assert.equal(app(store).api.model().skills.find(s=>s.id==='recall').total,1);
 assert.equal([...store.values()].join('').includes('private expression'),false);
 c.user={id:'b'};assert.equal(api.model().skills.find(s=>s.id==='recall').total,0);
 c.ENGOPLAY.isReady=false;assert.equal(api.model().ready,false);
 c.user=null;assert.equal(api.record(sample('guest')),false);assert.equal(api.model().ready,false);
});

test('bounded evidence excludes stale/future/corrupt rows and exposes failed persistence',()=>{
 const {api,c,store}=app(),now=Date.now();
 api.record(sample('old'),now-91*DAY);api.record(sample('future'),now+DAY);
 assert.equal(api.model(now).skills.find(s=>s.id==='recall').total,0);
 store.set('seragSkillEvidenceV1:a','bad json');assert.equal(api.model(now).saveFailed,true);
 c.localStorage.setItem=()=>{throw Error('quota')};
 assert.equal(api.record(sample('new'),now),false);assert.equal(api.model(now).saveFailed,true);
});

test('word engine distinguishes recognition, recall, hints and wrong-answer retries',()=>{
 const {api,c,load}=app();
 for(const file of ['english-content-v9.js','english-phrases-v16.js','word-practice-v21.js'])load(file);
 const words=c.SERAG_WORD_PRACTICE;words.start('catch up');words.respond(words.currentQuestion().answer);
 assert.equal(api.model().skills.find(s=>s.id==='recognition').independent,1);
 assert.equal(api.model().skills.find(s=>s.id==='recall').total,0);
 words.next();for(let i=0;i<3;i++){words.reveal();words.next()}
 assert.equal(words.currentQuestion().kind,'recall');words.showHint();words.respond(words.currentQuestion().answer);
 assert.equal(api.model().skills.find(s=>s.id==='recall').independent,0);
 assert.equal(api.model().skills.find(s=>s.id==='recall').total,1);
 words.start('run late');words.respond('wrong');words.respond(words.currentQuestion().answer);
 const rows=JSON.parse(c.localStorage.getItem('seragSkillEvidenceV1:a'));
 assert.ok(rows.some(r=>r.skill==='recognition'&&!r.correct));
});

test('retention is bounded and source answer text is not retained',()=>{
 const {api,store}=app(),now=Date.now();
 store.set('seragSkillEvidenceV1:a',JSON.stringify(Array.from({length:2005},(_,i)=>({skill:'grammar',key:i.toString(16),topic:'past',at:now-i,correct:true,assisted:false}))));
 api.record({skill:'grammar',key:'A private source sentence|answer',topic:'past',correct:true},now);
 const stored=store.get('seragSkillEvidenceV1:a');
 assert.equal(JSON.parse(stored).length,2000);assert.equal(stored.includes('private'),false);
});

test('legacy practice is reported as history without invented rich evidence',()=>{
 const {api,c}=app();
 c.SERAG_ACADEMY_V12={homeState:()=>({attempts:[{correct:true},{correct:true}]}),lessons:()=>[]};
 c.SERAG_WORD_PRACTICE={progress:()=>({word:{independent:9}})};
 assert.equal(api.model().legacy,2);assert.equal(api.model().previousRecalls,9);
 assert.ok(api.model().skills.every(s=>s.total===0));
 assert.match(api.html(),/not relabelled as independent skill evidence/);
 assert.match(api.html(),/data-ese-recall/);
});
