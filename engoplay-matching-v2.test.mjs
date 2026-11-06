import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const adapterSource = readFileSync(new URL('./engoplay-open-interactions-v1.js', import.meta.url), 'utf8');
const practiceSource = readFileSync(new URL('./word-practice-v21.js', import.meta.url), 'utf8');

const samples = [
  { phrase: 'a win-win', meaning: 'مكسب للطرفين', example: 'The partnership was a win-win because both companies found new customers.' },
  { phrase: 'customer journey', meaning: 'رحلة العميل', example: 'We mapped the customer journey to understand where new customers were leaving.' },
  { phrase: 'sedentary', meaning: 'خامل / قليل الحركة', example: 'A sedentary routine can lead to poor health even when you eat well.' },
  { phrase: 'take a toll on me', meaning: 'يؤثر علي سلبا مع الوقت', example: 'Long hours at work take a toll on me when I do not get enough rest.' }
];

function adapter(){
  const context = { window: {} };
  runInNewContext(adapterSource, context);
  return context.window.SERAG_ENGOPLAY_INTERACTIONS_V1;
}

test('matching columns are shuffled independently with zero vertically aligned answers', () => {
  const matcher = adapter();
  for (let i = 0; i < 40; i++){
    const question = matcher.matching(samples);
    assert.equal(question.kind, 'match');
    assert.equal(question.pairs.length, 4);
    assert.deepEqual(Array.from(question.wordOrder).sort(), [0, 1, 2, 3]);
    assert.deepEqual(Array.from(question.meaningOrder).sort(), [0, 1, 2, 3]);
    question.wordOrder.forEach((id, row) => assert.notEqual(id, question.meaningOrder[row]));
    assert.ok(['context', 'definitions'].includes(question.matchMode));
    question.pairs.forEach(pair => {
      assert.equal(pair.clueLanguage, 'en');
      assert.notEqual(pair.clue, pair.meaning, 'clues should not be direct translations');
    });
  }
});

test('matching supports original contextual challenges when vocabulary has no curated definition', () => {
  const matcher = adapter();
  const words = [
    { phrase: 'consolidate', meaning: 'دمج', example: 'We need to consolidate all the design files before sending the final project.' },
    { phrase: 'delegate', meaning: 'يفوض', example: 'The team leader decided to delegate the smaller tasks to different colleagues.' },
    { phrase: 'prioritize', meaning: 'يرتب الأولويات', example: 'We should prioritize the urgent fixes before working on the next feature.' },
    { phrase: 'coordinate', meaning: 'ينسق', example: 'We need to coordinate our schedules to find a suitable time for the workshop.' }
  ];
  const q = matcher.matching(words);
  assert.equal(q.matchMode, 'context');
  q.pairs.forEach(pair => {
    assert.ok(pair.clue.includes('_____'));
    assert.equal(pair.clue.toLowerCase().includes(pair.phrase.toLowerCase()), false);
  });
});

test('the practice session checks shuffled meaning IDs, keeps retry feedback and completes all pairs', () => {
  const service = adapter();
  const store = new Map();
  const window = {
    SERAG_ENGOPLAY_INTERACTIONS_V1: service,
    SERAG_ENGLISH_V9: { vocabulary: samples.map(s => [s.phrase, s.meaning, 'General', s.example]) },
    ENGOPLAY: { stats: () => ({}), recordPresented: () => {}, track: () => {}, scheduleWord: () => {} },
    addEventListener: () => {}
  };
  const document = {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => []
  };
  const context = {
    window, document, user: { id: 'test-user' },
    localStorage: {
      getItem: key => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => store.set(key, value)
    },
    setInterval: () => 1,
    clearInterval: () => {}
  };
  runInNewContext(practiceSource, context);
  const practice = window.SERAG_WORD_PRACTICE;
  practice.start(null, null, 'Test matching');
  let q = practice.currentQuestion();
  for (let step = 0; step < 15 && q?.kind !== 'match'; step++){
    practice.respond(q.answer);
    assert.equal(practice.next(), true);
    q = practice.currentQuestion();
  }
  assert.equal(q?.kind, 'match');
  assert.match(practice.html(), /data-wp-match-meaning/);
  const firstWord = q.wordOrder[0];
  assert.equal(practice.chooseMatchWord(firstWord), true);
  assert.equal(practice.chooseMatchMeaning(0), false, 'same-row meaning must be wrong');
  assert.match(practice.html(), /Not quite — that clue belongs/);
  for (const wordId of q.wordOrder){
    assert.equal(practice.chooseMatchWord(wordId), true);
    const displayIndex = q.meaningOrder.indexOf(wordId);
    assert.ok(displayIndex >= 0);
    assert.equal(practice.chooseMatchMeaning(displayIndex), true);
  }
  assert.match(practice.html(), /Pairs complete/);
  assert.match(practice.html(), /wp-match-review/);
  assert.match(practice.html(), /data-wp-next/);
  assert.equal(practice.next(), true);
});
