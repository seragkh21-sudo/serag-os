import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function app(){const store=new Map(),events={},c={user:{id:'a'},window:{addEventListener(){}},document:{addEventListener:(name,fn)=>(events[name]??=[]).push(fn),querySelectorAll:()=>[],getElementById:()=>null},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setInterval(){},Date,Math};c.addEventListener=()=>{};c.window=c;vm.createContext(c);for(const f of ['english-content-v9.js','english-phrases-v16.js','engoplay-quests-v1.js','word-practice-v21.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);return {c,api:c.window.SERAG_WORD_PRACTICE,events,store}}
test('every published vocabulary item has one valid blank, a correct full sentence and unique key',()=>{const {c,api}=app(),items=api.items();assert.ok(items.length>150);assert.equal(new Set(items.map(x=>api.norm(x.phrase))).size,items.length);for(const entry of c.window.SERAG_ENGLISH_V9.vocabulary)assert.ok(items.some(x=>api.norm(x.phrase)===api.norm(entry[0])),entry[0]);const fallback=[];for(const item of items){const q=api.question(item);assert.equal(q.before+q.answer+q.after,q.sentence,item.phrase);assert.ok(q.answer);assert.equal(api.check(q,q.answer.toUpperCase()+'!'),true);assert.equal(api.check(q,'unrelated answer'),false);if(q.fallback)fallback.push(item.phrase)}console.log('Coverage:',items.length,'items; explicit notebook fallbacks:',fallback.join(', '));assert.ok(fallback.length<items.length*.1)});
test('hints reveal exactly one additional letter and preserve spaces/punctuation',()=>{const {api}=app();assert.equal(api.hint('catch up',0),'_____ __');assert.equal(api.hint('catch up',1),'c____ __');assert.equal(api.hint('catch up',2),'ca___ __');assert.equal(api.hint("can't",3),"can'_");assert.equal(api.hint('catch up',99),'catch up');assert.equal(api.check({answer:'catch up'},' CATCH   UP. '),true);assert.equal(api.question({phrase:'run late',examples:["I'm running late because of traffic."]}).answer,'running late')});
test('recognition precedes delayed writing; hints/retry/reveal remain distinct and isolated',()=>{const {c,api,events}=app();function click(attr){const b={dataset:{},hasAttribute:k=>k===attr};events.click[0]({target:{closest:()=>b}})}function answer(value){events.input[0]({target:{id:'wpAnswer',value}});events.submit[0]({target:{matches:()=>true},preventDefault(){}})}function recall(){api.start('catch up');answer('catch up');assert.equal(api.progress()['catch up'].last_stage,'recognition');click('data-wp-next');for(let i=0;i<3;i++){click('data-wp-reveal');click('data-wp-next')}assert.ok(api.html().includes('Recall the expression you just learned'))}recall();click('data-wp-hint');answer('catch up');assert.equal(api.progress()['catch up'].independent,0);recall();answer('bad');answer('catch up');assert.equal(api.progress()['catch up'].last_assisted,true);recall();answer('catch up');assert.equal(api.progress()['catch up'].independent,1);recall();click('data-wp-reveal');assert.equal(api.progress()['catch up'].last_correct,false);c.user={id:'b'};assert.equal(Object.keys(api.progress()).length,0)});
test('every recall has at least three intervening questions and recognition has unique choices',()=>{const {api}=app(),round=api.buildRound(api.items().slice(0,4),[{id:'g',answer:'has',options:['has','have'],prompt:'She ___ a book.'}]);for(let i=0;i<round.length;i++){const q=round[i];if(q.kind==='recognition'){assert.equal(new Set(q.options.map(api.norm)).size,q.options.length);assert.ok(q.options.includes(q.answer))}if(q.kind==='recall'){const prior=round.findIndex(x=>x.kind==='recognition'&&x.item.phrase===q.item.phrase);assert.ok(prior>=0);assert.ok(i-prior-1>=3);assert.equal(round[prior].sentence,q.sentence)}}assert.equal(round.filter(x=>x.kind==='grammar').length,1)});

test('application prompts adapt to context and accept natural use of the target expression',()=>{const {api}=app();const work=api.applicationQuestion({phrase:'figure out',group:'Work',meaning:'find a solution'},false);assert.equal(work.kind,'application');assert.match(work.prompt,/work or project situation/);assert.match(work.prompt,/figure out/);assert.equal(api.check(work,'I need to figure out a better way to organize this project.'),true);assert.equal(api.check(work,'I need a better solution for this project.'),false);const supported=api.applicationQuestion({phrase:'assumption',group:'Everyday'},true);assert.match(supported.prompt,/one clear sentence/);assert.equal(api.check(supported,'My assumption was wrong.'),true)});


test('Engoplay recall layout reserves the audio, feedback, answer and next-action slots before answering',()=>{
 const {api,events}=app();
 function click(attr){const b={dataset:{},hasAttribute:k=>k===attr};events.click[0]({target:{closest:()=>b}})}
 function answer(value){events.input[0]({target:{id:'wpAnswer',value}});events.submit[0]({target:{matches:()=>true},preventDefault(){}})}
 api.start('catch up');
 // Move from the initial meaning-cued exposure to the delayed written recall.
 for(let i=0;i<4;i++){click('data-wp-reveal');click('data-wp-next')}
 const before=api.html();
 assert.match(before,/wp-sound-button is-placeholder/);
 assert.match(before,/class="wp-response-area"/);
 assert.match(before,/wp-exposure-placeholder/);
 assert.match(before,/class="wp-next-placeholder"/);
 answer('catch up');
 const after=api.html();
 assert.match(after,/class="wp-sound-button"/);
 assert.doesNotMatch(after,/wp-sound-button is-placeholder/);
 assert.match(after,/class="wp-response-area"/);
 assert.match(after,/class="wp-result-slot"/);
 assert.match(after,/class="wp-exposure"/);
 assert.match(after,/data-wp-next/);
 assert.doesNotMatch(after,/wp-next-placeholder/);
});


test('work English is merged into the shared deck with contextual follow-up prompts',()=>{
 const {c,api}=app();
 const all=api.items();
 const byPhrase=phrase=>all.find(x=>api.norm(x.phrase)===api.norm(phrase));
 for(const phrase of ['assumption','align','stuck','vanish','prejudice','judging','target audience','visual hierarchy','design direction','out of scope','turnaround time','source file']){
  assert.ok(byPhrase(phrase),'missing shared work word: '+phrase);
 }
 const assumption=api.applicationQuestion(byPhrase('assumption'),false);
 assert.match(assumption.prompt,/target audience|premium|brief/i);
 assert.match(assumption.prompt,/assumption/i);
 assert.match(assumption.sentence,/assumption/i);
 assert.equal(assumption.workRelated,true);
 assert.ok(c.window.SERAG_ENGLISH_V9.workPractice.scenarios.length>=15);
 assert.equal(c.window.SERAG_ENGLISH_V9.workPractice.writingPrompts.length,5);
 assert.equal(c.window.SERAG_ENGLISH_V9.speaking.filter(x=>x.prompt&&/design|client|brief|deadline|feedback/i.test(x.prompt)).length>0,true);
});

test('work vocabulary choices prefer meaningful same-category distractors',()=>{
 const {api}=app();
 const creative=api.items().filter(x=>x.group==='Creative Work');
 assert.ok(creative.length>=4);
 const round=api.buildRound(creative.slice(0,4),[],4);
 const item=round.find(q=>q.kind==='recognition');
 const options=item.options.filter(x=>api.norm(x)!==api.norm(item.answer));
 assert.equal(options.length,3);
 for(const option of options){
  const distractor=api.items().find(x=>api.norm(x.phrase)===api.norm(option));
  assert.equal(api.norm(distractor.group),api.norm(item.item.group));
 }
});


test('Today's Practice is a single mixed round with sentence building and no repeated vocabulary recall',()=>{
 const {api}=app();
 const grammar=[
  {id:'g1',answer:'has',options:['has','have'],prompt:'She ___ a book.'},
  {id:'g2',answer:'were',options:['was','were'],prompt:'They ___ ready.'}
 ];
 const sourceRow={id:'lesson--example-1',sentence:'I have been working on this project since Monday.',level:'B1'};
 const build={id:'sentence-builder:'+sourceRow.id,sourceRow,level:'B1',topic:'sentence-builder',prompt:'Arrange the words to form a natural English sentence.',tokens:['Monday.','working','I','since','project','this','have','been','on'],answer:sourceRow.sentence,explanation:'Present perfect continuous'};
 const round=api.buildRound(api.items().slice(0,4),grammar,4,[build],true);
 assert.equal(round.filter(q=>q.kind==='recognition').length,4);
 assert.equal(round.filter(q=>q.kind==='grammar').length,2);
 assert.equal(round.filter(q=>q.kind==='build').length,1);
 assert.equal(round.filter(q=>q.kind==='recall').length,0);
 assert.equal(round.length,7);
 assert.equal(new Set(round.filter(q=>q.kind==='recognition').map(q=>q.item.phrase)).size,4);
 assert.equal(api.check(build,build.answer.toUpperCase()),true);
});
test('daily sentence-builder questions come from the existing grammar examples and save through EngoPlay',()=>{
 const {c}=app(),tracked=[];
 c.ENGOPLAY={owner:'a',stats:()=>({totalXP:0,current:0,answeredToday:new Set()}),track:x=>tracked.push(x)};
 c.SERAG_GRAMMAR_EXAMPLES_V1={getExamples:()=>[
  {id:'b1-a',level:'B1',title:'Present Perfect',sentence:'I have finished the first draft.',summary:'A completed action with a present result.'},
  {id:'b1-b',level:'B1',title:'Past Simple',sentence:'We revised the design yesterday.',summary:'A completed past action.'},
  {id:'b1-c',level:'B1',title:'Relative Clauses',sentence:'The file that you sent is ready.',summary:'A defining relative clause.'},
  {id:'b2-a',level:'B2',title:'Contrast',sentence:'Despite the delay, we finished on time.',summary:'Contrast.'}
 ]};
 const api=c.SERAG_ENGOPLAY_QUESTS_V1,questions=api.getDailyPracticeQuestions('B1',2);
 assert.equal(questions.length,2);
 assert.ok(questions.every(q=>q.id.startsWith('sentence-builder:')&&q.sourceRow&&q.level==='B1'));
 const q=questions[0];
 api.recordPracticeAttempt(q,q.answer,true);
 assert.equal(tracked.length,1);
 assert.equal(tracked[0].id,q.id);
 assert.equal(tracked[0].topic,'sentence-builder');
 assert.equal(tracked[0].correct,true);
});
