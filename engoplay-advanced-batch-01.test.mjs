import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const data = JSON.parse(readFileSync(new URL('./engoplay-advanced-batch-01.json', import.meta.url), 'utf8'));
const adapter = readFileSync(new URL('./engoplay-advanced-batch-01-v1.js', import.meta.url), 'utf8');
const bootstrap = readFileSync(new URL('./app-bootstrap.js', import.meta.url), 'utf8');
const practice = readFileSync(new URL('./word-practice-v21.js', import.meta.url), 'utf8');
const engoplay = readFileSync(new URL('./engoplay-v19.js', import.meta.url), 'utf8');

function load(mockData=data, status=200) {
  const initialQuestions=[{id:'existing-q'}];
  const initialLessons=[{id:'existing-lesson'}];
  const window={SERAG_SUPPLEMENT_V13:{questions:initialQuestions,lessons:initialLessons}};
  const fetch=async()=>({ok:status>=200&&status<300,status,json:async()=>mockData});
  runInNewContext(adapter,{window,fetch,console:{warn(){}}},{timeout:1000});
  return window.SERAG_ADVANCED_BATCH01_V1_READY.then(result=>({result,window}));
}

test('source bank contains 30 unique B1+ / B2 questions and no missing types',()=>{
  assert.equal(data.items.length,30);
  assert.equal(new Set(data.items.map(item=>item.id)).size,30);
  assert.deepEqual(data.items.map(item=>item.id),Array.from({length:30},(_,i)=>'ENG-B1P-'+String(i+1).padStart(3,'0')));
  const types=data.items.reduce((map,item)=>(map[item.question_type]=(map[item.question_type]||0)+1,map),{});
  assert.equal(types.sentence_building,6);
  assert.equal(types.error_correction,5);
  assert.equal(Object.entries(types).filter(([type])=>!['sentence_building','error_correction'].includes(type)).reduce((sum,[,n])=>sum+n,0),19);
  assert.ok(data.items.every(item=>/^(B1\+|B2\.)/.test(item.cefr)));
  assert.match(data.source_verification,/not been independently verified/);
});

test('known pedagogical corrections are present',()=>{
  const by=n=>data.items.find(item=>item.id.endsWith(String(n).padStart(3,'0')));
  assert.match(by(15).incorrect_sentence,/follow up to the client/);
  assert.match(by(15).correct_sentence,/follow up with the client/);
  assert.match(by(15).explanation,/follow up about.*acceptable/i);
  assert.match(by(21).correct_answer,/were fully restored by 6:00 AM and remain operational/);
  assert.match(by(24).correct_answer,/by the board/);
  assert.match(by(2).prompt,/yesterday's board meeting/);
  assert.match(by(23).correct_answer,/discontinued/);
});

test('adapter imports all content without touching preexisting bank',async()=>{
  const {result,window}=await load();
  assert.equal(result.status,'ready');
  assert.equal(result.questionCount,30);
  assert.equal(result.questions.length,24);
  assert.equal(result.sentenceBuild.length,6);
  assert.equal(result.correctionCount,5);
  assert.equal(window.SERAG_SUPPLEMENT_V13.questions[0].id,'existing-q');
  assert.equal(window.SERAG_SUPPLEMENT_V13.lessons[0].id,'existing-lesson');
  assert.equal(window.SERAG_SUPPLEMENT_V13.questions.length,25);
  assert.equal(window.SERAG_SUPPLEMENT_V13.lessons.length,4);
  const combined=[...result.questions,...result.sentenceBuild];
  assert.equal(new Set(combined.map(row=>row.id)).size,30);
  for(const row of result.questions){
    assert.equal(row.options.length,4);
    assert.ok(row.options.includes(row.answer));
    assert.ok(['B1','B2'].includes(row.level));
  }
  assert.ok(result.sentenceBuild.every(row=>row.tokens.length>0&&row.acceptedAnswers.includes(row.answer)));
});

test('correction questions remain a distinguishable interactive type',async()=>{
  const {result}=await load();
  const corrections=result.questions.filter(row=>row.sourceQuestionType==='error_correction');
  assert.equal(corrections.length,5);
  for(const row of corrections){
    assert.ok(row.incorrectSentence);
    assert.ok(!row.options.some(option=>option===row.answer&&option===row.incorrectSentence));
    assert.ok(row.options.includes(row.incorrectSentence));
  }
});

test('malformed data and missing source leave the existing banks intact',async()=>{
  const bad={...data,items:data.items.slice(1)};
  const a=await load(bad);
  assert.equal(a.result.status,'unavailable');
  assert.equal(a.window.SERAG_SUPPLEMENT_V13.questions.length,1);
  const b=await load(data,404);
  assert.equal(b.result.status,'unavailable');
  assert.equal(b.window.SERAG_SUPPLEMENT_V13.lessons.length,1);
});

test('boot order and daily practice route the pilot into existing engines',()=>{
  const base=bootstrap.indexOf('/engoplay-grammar-batch-bank-v1.js?v=');
  const advanced=bootstrap.indexOf('/engoplay-advanced-batch-01-v1.js?v=');
  const academy=bootstrap.indexOf('/english-academy-v12.js?v=');
  assert.ok(base>=0&&advanced>base&&academy>advanced);
  assert.match(bootstrap,/SERAG_ADVANCED_BATCH01_V1_READY/);
  assert.match(practice,/q\.sourceQuestionType==='error_correction'\?'correction':'grammar'/);
  assert.match(practice,/q\?\.sourceBatch==='advanced01'/);
  assert.match(practice,/q\.acceptedAnswers\.some/);
  assert.match(engoplay,/advanced\?\.sentenceBuild/);
  assert.match(engoplay,/pilotQuestions\.map/);
});
