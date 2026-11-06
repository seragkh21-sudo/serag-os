import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=name=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
const bank=JSON.parse(read('engoplay-advanced-batch-02.json'));
const adapter=read('engoplay-advanced-batch-02-v1.js');
const firstAdapter=read('engoplay-advanced-batch-01-v1.js');
const firstBank=JSON.parse(read('engoplay-advanced-batch-01.json'));
const bootstrap=read('app-bootstrap.js'),engoplay=read('engoplay-v19.js'),practice=read('word-practice-v21.js');

function load(data=bank,ok=true){
 const window={SERAG_SUPPLEMENT_V13:{questions:[{id:'legacy-q'}],lessons:[{id:'legacy-lesson'}]}};
 runInNewContext(adapter,{window,fetch:async()=>({ok,status:ok?200:404,json:async()=>data}),
   console:{warn(){}},Math},{timeout:2000});
 return window.SERAG_ADVANCED_BATCH02_V1_READY.then(status=>({window,status}));
}

test('Batch #02 is valid unique B2-only data with five intact interaction types',()=>{
 assert.equal(bank.items.length,50);
 assert.deepEqual(bank.items.map(x=>x.id),Array.from({length:50},(_,i)=>'ENG-B2-'+String(i+31).padStart(3,'0')));
 assert.equal(new Set(bank.items.map(x=>x.id)).size,50);
 const counts=Object.fromEntries(['multiple_choice','sentence_building','error_correction','vocabulary_matching','paraphrase_transformation']
  .map(type=>[type,bank.items.filter(q=>q.question_type===type).length]));
 assert.deepEqual(counts,{multiple_choice:15,sentence_building:10,error_correction:10,vocabulary_matching:5,paraphrase_transformation:10});
 assert.ok(bank.items.every(q=>/^B2\.[12]$/.test(q.cefr)));
 assert.match(bank.source_verification,/not independently verified/);
 assert.ok(bank.items.every(q=>!q.distractor_explanations&&!q.source_references));
});

test('Batch #02 has specific corrections for ambiguous collocations and meaning preservation',()=>{
 const by=n=>bank.items.find(q=>q.id.endsWith(String(n).padStart(3,'0')));
 assert.ok(!by(32).options.includes('take up'));
 assert.match(by(49).incorrect_sentence,/pay close attention on/);
 assert.match(by(49).correct_sentence,/pay close attention to/);
 assert.match(by(52).prompt,/privacy settings/);
 assert.match(by(55).correct_answer,/without custom code/);
 assert.match(by(77).prompt,/never seen before/);
 for(const n of [63,68])assert.ok(by(n).accepted_sentences.length&&by(n).token_array.includes(','));
});

test('Batch #02 adapts 40 choice/correction and 10 click-to-build exercises with no legacy mutation',async()=>{
 const {window,status}=await load();
 assert.equal(status.status,'ready');
 assert.equal(status.questionCount,50);
 assert.equal(status.questions.length,40);
 assert.equal(status.sentenceBuild.length,10);
 assert.equal(status.correctionCount,10);
 assert.equal(status.topicCount,4);
 assert.equal(window.SERAG_SUPPLEMENT_V13.questions[0].id,'legacy-q');
 assert.equal(window.SERAG_SUPPLEMENT_V13.lessons[0].id,'legacy-lesson');
 assert.equal(window.SERAG_SUPPLEMENT_V13.questions.length,41);
 assert.equal(window.SERAG_SUPPLEMENT_V13.lessons.length,5);
 assert.equal(new Set(status.questions.map(q=>q.topic)).size,4);
 assert.ok(status.questions.every(q=>q.level==='B2'&&q.options.length===4&&q.options.includes(q.answer)));
 assert.ok(status.questions.filter(q=>q.sourceQuestionType==='error_correction').every(q=>q.options.includes(q.incorrectSentence)));
 assert.ok(status.sentenceBuild.every(q=>q.level==='B2'&&q.tokens.length>0&&q.acceptedAnswers.includes(q.answer)));
 assert.equal(new Set([...status.questions,...status.sentenceBuild].map(q=>q.id)).size,50);
});

test('Batch #01 and #02 can coexist without collisions and preserve existing user practice IDs',async()=>{
 const window={SERAG_SUPPLEMENT_V13:{questions:[{id:'legacy-q'}],lessons:[{id:'legacy-lesson'}]}};
 const context={window,console:{warn(){}},Math};
 context.fetch=async url=>({ok:true,json:async()=>url.includes('batch-01.json')?firstBank:bank});
 runInNewContext(firstAdapter,context,{timeout:2000});
 await window.SERAG_ADVANCED_BATCH01_V1_READY;
 runInNewContext(adapter,context,{timeout:2000});
 await window.SERAG_ADVANCED_BATCH02_V1_READY;
 assert.equal(window.SERAG_ADVANCED_BATCH01_V1.questionCount,30);
 assert.equal(window.SERAG_ADVANCED_BATCH02_V1.questionCount,50);
 assert.equal(window.SERAG_SUPPLEMENT_V13.questions.length,1+24+40);
 assert.equal(new Set(window.SERAG_SUPPLEMENT_V13.questions.map(q=>q.id)).size,1+24+40);
 assert.equal(window.SERAG_SUPPLEMENT_V13.lessons.length,1+3+4);
});

test('invalid bank and failed fetch do not affect existing banks',async()=>{
 const bad=await load({...bank,items:bank.items.slice(1)});
 assert.equal(bad.status.status,'unavailable');
 assert.equal(bad.window.SERAG_SUPPLEMENT_V13.questions.length,1);
 const missing=await load(bank,false);
 assert.equal(missing.status.status,'unavailable');
 assert.equal(missing.window.SERAG_SUPPLEMENT_V13.lessons.length,1);
});

test('boot and level-aware Today’s Practice route both batches into mixed rounds',()=>{
 const old=bootstrap.indexOf('/engoplay-advanced-batch-01-v1.js?v='),next=bootstrap.indexOf('/engoplay-advanced-batch-02-v1.js?v='),academy=bootstrap.indexOf('/english-academy-v12.js?v=');
 assert.ok(old>=0&&next>old&&academy>next);
 assert.match(bootstrap,/SERAG_ADVANCED_BATCH02_V1_READY/);
 assert.match(practice,/q\?\.sourceBatch==='advanced02'/);
 assert.match(engoplay,/SERAG_ADVANCED_BATCH02_V1/);
 assert.match(engoplay,/pilotQuestions\.map/);
 const start=engoplay.slice(engoplay.indexOf('function startDaily()'),engoplay.indexOf('function startPractice(',engoplay.indexOf('function startDaily()')));
 const first={status:'ready',questions:[{id:'01B2',level:'B2'},{id:'01B1',level:'B1'}],sentenceBuild:[{id:'01buildB2',level:'B2'}]};
 const second={status:'ready',questions:[{id:'02B2',level:'B2'},{id:'02B2-2',level:'B2'}],sentenceBuild:[{id:'02buildB2',level:'B2'}]};
 const legacy=[{id:'C1-legacy',level:'C1'},{id:'C2-legacy',level:'C2'}],record={};
 const startFor=level=>{const win={SERAG_ADVANCED_BATCH01_V1:first,SERAG_ADVANCED_BATCH02_V1:second,
  SERAG_ENGOPLAY_QUESTS_V1:{getDailyPracticeQuestions:()=>[]}};
  new Function('window','a','level','startPractice',start+';return startDaily')(win,()=>({questions:()=>legacy}),()=>level,
   (ids,title,sentenceBuild,daily)=>Object.assign(record,{ids,title,sentenceBuild,daily}))();return {...record}};
 const b2=startFor('B2');
 assert.deepEqual(b2.ids,['01B2','02B2','02B2-2']);
 assert.deepEqual(b2.sentenceBuild.map(q=>q.id),['01buildB2','02buildB2']);
 assert.deepEqual(startFor('C1').ids,['C1-legacy']);
 assert.deepEqual(startFor('C2').ids,['C2-legacy']);
 assert.deepEqual(startFor('B1').ids,['01B1']);
});

test('app and preview assets use the bootstrap cache version',()=>{
 const version=bootstrap.match(/const V='(\d+)'/)[1];
 assert.ok(read('index.html').includes('app-bootstrap.js?v='+version));
 assert.ok(read('sw.js').includes('serag-os-static-v'+version));
 assert.ok(read('workspace-preview.html').includes('workspace-preview-v18.js?v='+version));
 assert.ok(read('workspace-preview-content.html').includes('engoplay-advanced-batch-02-v1.js?v='+version));
});
