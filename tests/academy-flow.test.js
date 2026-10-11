import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function app(){
  let interval;const events={},store=new Map(),wordCount={textContent:''};
  const root={innerHTML:'',addEventListener(k,fn){events[k]=fn},querySelector(s){return s==='[data-ea-wordcount]'?wordCount:null},scrollIntoView(){}};
  const document={addEventListener(){},createElement(){return root},querySelector(s){if(s==='.el9-hub')return {prepend(){}};if(s==='#ea12Center')return root.innerHTML?root:null;return null},querySelectorAll(){return []}};
  const c={document,window:{addEventListener(){}},setInterval(fn){interval=fn;return 0},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}};
  vm.createContext(c);for(const f of ['english-grammar-v10.js','english-supplement-v13.js','english-writing-v13.js','english-levels-v14.js','english-review-v10-data.js','english-academy-v12.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
  interval();
  function target(dataset,attrs=[]){return {dataset,value:'',hasAttribute:k=>attrs.includes(k),closest(){return this}}}
  const click=(dataset,attrs=[])=>events.click({target:target(dataset,attrs)});
  const change=(dataset,attrs,value,checked)=>{const t=target(dataset,attrs);t.value=value;t.checked=checked;events.change({target:t})};
  const input=(key,value)=>{const t=target({eaNote:key});t.value=value;events.input({target:t})};
  return {root,click,change,input,wordCount,read:()=>JSON.parse(store.get('seragAcademyV12:guest')),w:c.window};
}

test('question history restores original answers and never counts replay twice',()=>{
  const a=app();a.click({eaStart:'topic'});
  const q=a.w.SERAG_ACADEMY_V12.questions().find(q=>q.topic==='be-basics'&&a.root.innerHTML.includes(q.prompt));assert.ok(q);
  a.click({eaAnswer:q.answer},['data-ea-answer']);assert.equal(a.read().attempts.length,1);
  a.click({},['data-ea-next']);a.click({},['data-ea-prev']);
  assert.ok(a.root.innerHTML.includes(q.prompt));assert.ok(a.root.innerHTML.includes('صحيح ✓'));
  a.click({eaAnswer:q.answer},['data-ea-answer']);assert.equal(a.read().attempts.length,1);
  a.click({},['data-ea-end']);a.click({eaStart:'topic'});
  assert.ok(!a.root.innerHTML.includes(q.prompt),'a solved, not-yet-due question should leave the current queue');
});

test('writing draft, word count and checklist survive selecting another exercise',()=>{
  const a=app();a.click({eaTab:'writing'});a.input('writing:paragraph','A clear brief helps teams.');
  assert.equal(a.wordCount.textContent,5);assert.equal(a.read().notes['writing:paragraph'],'A clear brief helps teams.');
  a.change({eaWritingCheck:'paragraph:0'},['data-ea-writing-check'],'',true);
  a.change({},['data-ea-writing'],'general-letter');a.change({},['data-ea-writing'],'paragraph');
  assert.ok(a.root.innerHTML.includes('A clear brief helps teams.'));assert.equal(a.read().writingChecks['paragraph:0'],true);
});

test('original lessons and writing models have coherent coverage and references',()=>{
  const a=app(),ids=new Set(a.w.SERAG_GRAMMAR_V10.map(x=>x.id));assert.equal(ids.size,60);
  for(const q of a.w.SERAG_SUPPLEMENT_V13.questions){assert.ok(ids.has(q.topic));assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.explanation.length>10)}
  for(const d of a.w.SERAG_WRITING_V13.drills){assert.ok(ids.has(d.topic));if(d.id!=='discussion')assert.ok(a.w.SERAG_WRITING_V13.count(d.model)>=d.min,d.id)}
});

test('question-first home and B1 to C2 paths offer questions for each level',()=>{
 const a=app();assert.ok(a.root.innerHTML.indexOf('مركز الأسئلة')<a.root.innerHTML.indexOf('أقسام English'));
 a.click({eaTab:'levels'});
 for(const level of ['B1','B2','C1','C2']){
  a.click({eaTab:'levels'});a.click({eaLevelPick:level});assert.equal(a.read().level,level);
  assert.ok(a.root.innerHTML.includes('مسار '+level));
  a.click({eaStart:'level'});
  const q=a.w.SERAG_ACADEMY_V12.questions().find(q=>a.root.innerHTML.includes(q.prompt));assert.ok(q,level);
  assert.equal(a.w.SERAG_GRAMMAR_V10.find(g=>g.id===q.topic)?.level,level);
  a.click({},['data-ea-end']);
 }
});
