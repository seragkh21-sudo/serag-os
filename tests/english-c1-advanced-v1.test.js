import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../english-c1-advanced-v1.js', import.meta.url), 'utf8');

test('C1 batch preserves existing lessons and adds topics 26-35 with Q251-350', () => {
  const original = { id: 'existing-lesson', title: 'Do not change' };
  const window = { SERAG_GRAMMAR_V10: [original] };
  runInNewContext(source, { window });
  const data = window.SERAG_C1_ADVANCED_V1;
  assert.ok(data);
  assert.equal(data.topics.length, 10);
  assert.deepEqual(Array.from(data.topics, topic => topic.topic_id), [26,27,28,29,30,31,32,33,34,35]);
  assert.equal(data.lessons.length, 10);
  assert.equal(data.questions.length, 100);
  assert.equal(window.SERAG_GRAMMAR_V10[0], original);
  assert.equal(window.SERAG_GRAMMAR_V10.length, 11);
});

test('C1 question IDs, options, correct answers and Arabic explanations are valid', () => {
  const window = { SERAG_GRAMMAR_V10: [] };
  runInNewContext(source, { window });
  const questions = window.SERAG_C1_ADVANCED_V1.questions;
  const ids = questions.map(question => question.question_id);
  assert.equal(new Set(ids).size, 100);
  assert.deepEqual([...ids].sort((a,b) => a-b), Array.from({length:100},(_,i)=>251+i));
  for (const question of questions) {
    assert.equal(question.options.length, 4, question.id);
    assert.ok(question.options.includes(question.correct_answer), question.id);
    assert.equal(question.answer, question.correct_answer, question.id);
    assert.ok(question.arabic_explanation.trim(), question.id);
    assert.ok(question.prompt && question.explanation, question.id);
  }
});

test('C1 lessons expose original source fields and Academy-compatible fields', () => {
  const window = { SERAG_GRAMMAR_V10: [] };
  runInNewContext(source, { window });
  for (const lesson of window.SERAG_C1_ADVANCED_V1.lessons) {
    for (const key of ['topic_id','topic_name','cefr_level','english_explanation','arabic_explanation','grammar_structure_and_formulas','forms','when_and_how_to_use','common_mistakes','practice_questions','id','level','title','summary','formula','examples','quiz','task']) {
      assert.ok(Object.hasOwn(lesson, key), lesson.id + ' missing ' + key);
    }
  }
});
