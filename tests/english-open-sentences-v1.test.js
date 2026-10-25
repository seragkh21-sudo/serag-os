import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../english-open-sentences-v1.js', import.meta.url), 'utf8');
function load() {
  const window = {
    SERAG_GRAMMAR_V10: [{id:'existing-grammar'}],
    SERAG_SUPPLEMENT_V13: {questions:[{id:'existing-question'}]}
  };
  runInNewContext(source, window);
  return window;
}

test('open sentence bank adds original B1/B2 practice to existing English sources', () => {
  const w = load();
  const data = w.SERAG_OPEN_SENTENCES_V1;
  assert.equal(data.version, 1);
  assert.ok(data.questions.length >= 30);
  assert.ok(data.lessons.length >= 3);
  assert.ok(w.SERAG_GRAMMAR_V10.some(x => x.id === 'existing-grammar'));
  assert.ok(w.SERAG_SUPPLEMENT_V13.questions.some(x => x.id === 'existing-question'));
  assert.ok(data.questions.some(x => x.level === 'B1'));
  assert.ok(data.questions.some(x => x.level === 'B2'));
});

test('every question has unique stable id, three distinct options, and an answer among them', () => {
  const data = load().SERAG_OPEN_SENTENCES_V1;
  const ids = data.questions.map(x => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const q of data.questions) {
    assert.ok(q.prompt && q.explanation && q.topic);
    assert.equal(q.options.length, 3);
    assert.equal(new Set(q.options).size, 3, q.id);
    assert.ok(q.options.includes(q.answer), q.id);
  }
});

test('the patch is idempotent and does not duplicate shared question or lesson IDs', () => {
  const w = load();
  const beforeQuestions = w.SERAG_SUPPLEMENT_V13.questions.length;
  const beforeLessons = w.SERAG_GRAMMAR_V10.length;
  runInNewContext(source, w);
  assert.equal(w.SERAG_SUPPLEMENT_V13.questions.length, beforeQuestions);
  assert.equal(w.SERAG_GRAMMAR_V10.length, beforeLessons);
});

test('the module safely no-ops when base English arrays are absent', () => {
  const w = {};
  runInNewContext(source, w);
  assert.ok(w.SERAG_OPEN_SENTENCES_V1.questions.length >= 30);
});
