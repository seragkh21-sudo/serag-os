import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function dailyQuiz(){
  const storage=new Map();
  const context={console,Date,Math,document:{querySelector(){return null},addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setInterval(){return 0},clearInterval(){}};
  context.window=context;
  vm.createContext(context);
  for(const file of ['english-content-v9.js','english-vocab-v24.js','english-learning-v6.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  return context.SERAG_DAILY_QUIZ_V6;
}

test('daily quiz draws multiple question forms from the full vocabulary bank',()=>{
  const api=dailyQuiz(),bank=api.buildQuizBank();
  assert.ok(bank.length>100,'the quiz bank should be substantially larger than the old ten-word loop');
  assert.equal(new Set(bank.map(q=>q.key)).size,bank.length,'question keys must be unique');
  for(const q of bank){assert.ok(q.options.includes(q.correct),q.key);assert.ok(q.options.length>1,q.key)}
  assert.ok(bank.some(q=>q.options.indexOf(q.correct)>0),'correct answers must not always appear first');
});

test('daily quiz skips the ten most recent answers and never repeats within the current run',()=>{
  const api=dailyQuiz(),bank=api.buildQuizBank(),recent=bank.slice(0,10).map(q=>q.key),seen=[];
  for(let i=0;i<20;i++){
    const q=api.selectQuestion(recent,seen);
    assert.ok(q,'a next question should be available');
    assert.ok(!recent.includes(q.key),'a recently answered question must be skipped');
    assert.ok(!seen.includes(q.key),'a question must not repeat within one run');
    seen.push(q.key);
  }
});

test('daily quiz reads the owner-scoped attempt table and sends stable question keys to sync',()=>{
  const source=fs.readFileSync('english-learning-v6.js','utf8');
  const sync=fs.readFileSync('english-attempt-sync-v11.js','utf8');
  assert.match(source,/from\('english_quiz_attempts'\)/);
  assert.match(source,/eq\('user_id',owner\)/);
  assert.match(source,/eq\('source','daily_quiz'\)/);
  assert.match(source,/order\('created_at',\{ascending:false\}\)\.limit\(10\)/);
  assert.match(source,/data-question-key=/);
  assert.match(sync,/question_key:button\.dataset\.questionKey/);
  assert.doesNotMatch(source,/gameIndex=\(gameIndex\+1\)%10/);
});
