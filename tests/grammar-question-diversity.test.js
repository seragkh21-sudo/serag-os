import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

function academy(){
  const store=new Map();
  const document={querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){}};
  const c={document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setInterval(){},clearInterval(){},Date,Math,console,user:{id:'test-user'},window:{addEventListener(){}}};
  c.window=c;
  vm.createContext(c);
  for(const file of ['english-grammar-v10.js','english-academy-v12.js']){
    vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
  }
  return {api:c.SERAG_ACADEMY_V12,store};
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
  assert.ok(all.length>100,'the practice pool should be substantially larger than one short daily set');
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

test('review ordering prioritizes the oldest previously attempted questions when none are due',()=>{
  const {api,store}=academy();
  store.set('seragAcademyV12:test-user',JSON.stringify({
    goal:'work',mode:8,attempts:[{id:'old',at:100},{id:'new',at:200}],cards:{old:{stage:1,due:Date.now()+86400000},new:{stage:1,due:Date.now()+86400000}},notes:{},sessions:[],scenario:null,practiceTopic:'be-basics',writingDrill:'paragraph',writingChecks:{},level:'B1',levelPart:'grammar',examTheme:'digital'
  }));
  api.homeState();
  const pool=[{id:'new',topic:'a',prompt:'New',answer:'x',options:['x','y']},{id:'old',topic:'b',prompt:'Old',answer:'x',options:['x','y']}];
  assert.equal(api.selectQuestions(pool,'review',2)[0].id,'old');
});