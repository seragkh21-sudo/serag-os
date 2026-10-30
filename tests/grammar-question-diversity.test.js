import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

function academy(){
  const store=new Map();
  const document={querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){}};
  const c={document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setInterval(){},clearInterval(){},addEventListener(){},Date,Math,console,user:{id:'test-user'}};
  c.window=c;
  vm.createContext(c);
  for(const file of ['english-content-v9.js','english-grammar-v10.js','english-academy-v12.js']){
    vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
  }
  return {api:c.SERAG_ACADEMY_V12,store,context:c};
}

test('grammar bank expands lesson examples into answerable sentence variants',()=>{
  const {api}=academy();
  const all=api.questions();
  const variants=all.filter(q=>String(q.id).startsWith('example:'));
  assert.ok(variants.length>=10,'expected example-derived variants across grammar lessons');
  for(const q of variants){
    assert.ok(q.sourceExample);
    assert.ok(q.prompt.includes('___'));
    assert.ok(q.options.includes(q.answer));
    assert.equal(q.prompt.replace('___',q.answer),q.sourceExample);
  }
});

test('question bank removes duplicate ids and duplicate prompts within a topic',()=>{
  const {api}=academy();
  const all=api.questions();
  assert.equal(new Set(all.map(q=>q.id)).size,all.length);
  const key=q=>String(q.topic||'')+'|'+String(q.prompt).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()+'|'+String(q.answer).toLowerCase();
  assert.equal(new Set(all.map(key)).size,all.length);
  assert.ok(all.length>api.lessons().length+10,'example variants should materially expand the lesson-only pool');
});

test('daily selection interleaves grammar topics instead of clustering one rule',()=>{
  const {api}=academy();
  api.homeState();
  const pool=Array.from({length:16},(_,i)=>({id:'test:'+i,topic:'topic-'+i,prompt:'Question '+i,answer:'yes',options:['yes','no']}));
  const picked=api.selectQuestions(pool,'daily',8);
  assert.equal(picked.length,8);
  assert.equal(new Set(picked.map(q=>q.id)).size,8);
  assert.equal(new Set(picked.map(q=>q.topic)).size,8);
});

test('overdue grammar reviews come before fresh questions while scheduled questions stay out',()=>{
  const {api,store}=academy();
  const now=Date.now();
  store.set('seragAcademyV12:test-user',JSON.stringify({
    goal:'work',mode:8,attempts:[{id:'overdue',at:now-3*86400000},...Array.from({length:9},(_,i)=>({id:'noise-'+i,at:now-9000+i*500})),{id:'scheduled',at:now-1000}],
    cards:{overdue:{stage:0,due:now-1},scheduled:{stage:2,due:now+86400000}},
    notes:{},sessions:[],scenario:null,practiceTopic:'be-basics',writingDrill:'paragraph',writingChecks:{},level:'B1',levelPart:'grammar',examTheme:'digital'
  }));
  api.homeState();
  const pool=[
    {id:'fresh',topic:'fresh-topic',prompt:'Fresh question',answer:'yes',options:['yes','no']},
    {id:'scheduled',topic:'scheduled-topic',prompt:'Scheduled question',answer:'yes',options:['yes','no']},
    {id:'overdue',topic:'review-topic',prompt:'Overdue question',answer:'yes',options:['yes','no']}
  ];
  assert.deepEqual(Array.from(api.practicePool(pool,now),q=>q.id),['overdue','fresh']);
  assert.deepEqual(Array.from(api.selectQuestions(pool,'daily',3),q=>q.id),['overdue','fresh']);
});

test('review ordering prioritizes the oldest previously attempted questions when none are due',()=>{
  const {api,store}=academy();
  store.set('seragAcademyV12:test-user',JSON.stringify({
    goal:'work',mode:8,attempts:[{id:'old',at:100},{id:'new',at:200}],cards:{old:{stage:1,due:Date.now()+86400000},new:{stage:1,due:Date.now()+86400000}},notes:{},sessions:[],scenario:null,practiceTopic:'be-basics',writingDrill:'paragraph',writingChecks:{},level:'B1',levelPart:'grammar',examTheme:'digital'
  }));
  api.homeState();
  const pool=[{id:'new',topic:'a',prompt:'New',answer:'x',options:['x','y']},{id:'old',topic:'b',prompt:'Old',answer:'x',options:['x','y']}];
  assert.equal(api.selectQuestions(pool,'review',2)[0].id,'old');
});
test('word-practice grammar fillers skip locally and remotely answered questions until due',()=>{
  const {api,store,context}=academy();
  const now=Date.now(),day=86400000;
  store.set('seragAcademyV12:test-user',JSON.stringify({
    goal:'work',mode:8,
    attempts:[{id:'local-solved',at:now-day/2,correct:true},{id:'due-question',at:now-3*day,correct:false}],
    cards:{
      'local-solved':{stage:1,due:now+day},
      'due-question':{stage:0,due:now-1000}
    },
    notes:{},sessions:[],level:'B1',practiceTopic:'be-basics'
  }));
  api.homeState();
  context.ENGOPLAY={stats:()=>({
    answeredKeys:new Set(['remote-solved']),
    correctKeys:new Set(['remote-solved']),
    answeredToday:new Set(['remote-solved']),
    lastAnsweredAt:new Map([['remote-solved',now-day/2]])
  })};
  vm.runInContext(fs.readFileSync('word-practice-v21.js','utf8'),context,{filename:'word-practice-v21.js'});
  const wp=context.SERAG_WORD_PRACTICE;
  const pool=[
    {id:'local-solved',topic:'a',prompt:'Local solved',answer:'yes',options:['yes','no']},
    {id:'remote-solved',topic:'b',prompt:'Remote solved',answer:'yes',options:['yes','no']},
    {id:'due-question',topic:'c',prompt:'Due review',answer:'yes',options:['yes','no']},
    {id:'fresh-1',topic:'d',prompt:'Fresh one',answer:'yes',options:['yes','no']},
    {id:'fresh-2',topic:'e',prompt:'Fresh two',answer:'yes',options:['yes','no']},
    {id:'fresh-3',topic:'f',prompt:'Fresh three',answer:'yes',options:['yes','no']}
  ];
  const selected=wp.selectGrammarQuestions(pool,3);
  assert.deepEqual(Array.from(selected,q=>q.id).sort(),['fresh-1','fresh-2','fresh-3']);
  assert.ok(!selected.some(q=>['local-solved','remote-solved'].includes(q.id)));
  const actualRound=Array.from(wp.buildRound(wp.items().slice(0,4),pool,4).filter(q=>q.kind==='grammar'),q=>q.grammar.id);
  assert.deepEqual(actualRound.sort(),['due-question','fresh-1','fresh-2'],'recently answered grammar questions stay out while fresh questions remain');
});

test('word-practice only repeats an answered grammar question when its review is due',()=>{
  const {api,store,context}=academy();
  const now=Date.now(),day=86400000;
  store.set('seragAcademyV12:test-user',JSON.stringify({
    goal:'work',mode:8,
    attempts:[{id:'due',at:now-3*day,correct:false},...Array.from({length:9},(_,i)=>({id:'noise-'+i,at:now-9000+i*500,correct:true})),{id:'scheduled',at:now-day/2,correct:true}],
    cards:{scheduled:{stage:1,due:now+day},due:{stage:0,due:now-1}},
    notes:{},sessions:[],level:'B1',practiceTopic:'be-basics'
  }));
  api.homeState();
  context.ENGOPLAY={stats:()=>({answeredKeys:new Set(),correctKeys:new Set(),answeredToday:new Set(),lastAnsweredAt:new Map()})};
  vm.runInContext(fs.readFileSync('word-practice-v21.js','utf8'),context,{filename:'word-practice-v21.js'});
  const selected=context.SERAG_WORD_PRACTICE.selectGrammarQuestions([
    {id:'scheduled',topic:'a',prompt:'Already solved',answer:'yes',options:['yes','no']},
    {id:'due',topic:'b',prompt:'Needs review',answer:'yes',options:['yes','no']}
  ],3);
  assert.deepEqual(Array.from(selected,q=>q.id),['due']);
  const allScheduled=context.SERAG_WORD_PRACTICE.selectGrammarQuestions([
    {id:'scheduled',topic:'a',prompt:'Already solved',answer:'yes',options:['yes','no']}
  ],3);
  assert.equal(allScheduled.length,0,'do not repeat a not-yet-due question just to fill a grammar slot');
});

test('normal practice avoids the last ten answered questions until the eligible bank is exhausted',()=>{
  const {api,store}=academy();
  const now=Date.now();
  const attempts=Array.from({length:10},(_,i)=>({id:'recent-'+i,topic:'recent',correct:true,at:now-i*1000}));
  store.set('seragAcademyV12:test-user',JSON.stringify({
    goal:'work',mode:8,attempts,cards:{},notes:{},sessions:[],scenario:null,
    practiceTopic:'be-basics',writingDrill:'paragraph',writingChecks:{},level:'B1',levelPart:'grammar',examTheme:'digital'
  }));
  api.homeState();
  const rows=[
    ...attempts.map((a,i)=>({id:a.id,topic:'recent',prompt:'Recent '+i,answer:'yes',options:['yes','no']})),
    {id:'fresh-a',topic:'fresh',prompt:'Fresh A',answer:'yes',options:['yes','no']},
    {id:'fresh-b',topic:'fresh',prompt:'Fresh B',answer:'yes',options:['yes','no']}
  ];
  const picked=api.practicePool(rows,now);
  assert.deepEqual(Array.from(picked,q=>q.id),['fresh-a','fresh-b']);
  const exhausted=api.practicePool(rows.slice(0,10),now);
  assert.equal(exhausted.length,10,'cooldown questions are a fallback only when the bank is exhausted');
});
