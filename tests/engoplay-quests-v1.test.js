import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadModule() {
  const context = {
    window: {},
    document: { readyState: 'loading', addEventListener() {} },
    localStorage: { getItem() { return null; }, setItem() {} },
    Intl,
    Date,
    Set,
    Math,
    Number,
    String,
    Array,
    Object
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('engoplay-quests-v1.js', 'utf8'), context);
  return context.window.SERAG_ENGOPLAY_QUESTS_V1;
}

test('sentence builder tokenization preserves punctuation and handles whitespace', () => {
  const game = loadModule();
  assert.deepEqual(Array.from(game.tokensFromSentence('  I have worked here for years.  ')), ['I', 'have', 'worked', 'here', 'for', 'years.']);
  assert.equal(game.normalizeSentence('  I   HAVE worked here for years. '), 'i have worked here for years');
  assert.equal(game.normalizeSentence('She is ready!'), 'she is ready');
});

test('daily examples are deterministic, unique and limited to useful sentence lengths', () => {
  const game = loadModule();
  const rows = Array.from({ length: 9 }, (_, i) => ({
    id: 'example-' + i,
    sentence: 'I have used this simple example for practice ' + i + '.'
  })).concat([
    { id: 'too-short', sentence: 'Hello world.' },
    { id: 'too-long', sentence: Array(30).fill('word').join(' ') }
  ]);
  const first = Array.from(game.pickDailyExamples(rows, 'user-a', '2026-10-26'));
  const second = Array.from(game.pickDailyExamples(rows, 'user-a', '2026-10-26'));
  const otherUser = Array.from(game.pickDailyExamples(rows, 'user-b', '2026-10-26'));
  assert.equal(first.length, 3);
  assert.equal(new Set(first).size, 3);
  assert.deepEqual(first, second);
  assert.notDeepEqual(first, otherUser);
  assert.ok(first.every(id => id !== 'too-short' && id !== 'too-long'));
});

test('challenge streak counts consecutive completed challenge dates without fabricating today', () => {
  const game = loadModule();
  assert.equal(game.streakForDates(['2026-10-23', '2026-10-24', '2026-10-25'], '2026-10-26'), 3);
  assert.equal(game.streakForDates(['2026-10-24', '2026-10-25', '2026-10-26'], '2026-10-26'), 3);
  assert.equal(game.streakForDates(['2026-10-23', '2026-10-25'], '2026-10-26'), 1);
  assert.equal(game.streakForDates([], '2026-10-26'), 0);
});

test('challenge rewards encourage first-try answers without punishing retries', () => {
  const game = loadModule();
  assert.equal(game.rewardPoints(0, false), 10);
  assert.equal(game.rewardPoints(0, true), 7);
  assert.equal(game.rewardPoints(1, false), 7);
  assert.equal(game.rewardPoints(4, false), 5);
});

test('quest module is additive and does not overwrite the existing EngoPlay API', () => {
  const source = fs.readFileSync('engoplay-quests-v1.js', 'utf8');
  assert.match(source, /SERAG_ENGOPLAY_QUESTS_V1/);
  assert.match(source, /SERAG_GRAMMAR_EXAMPLES_V1/);
  assert.match(source, /SpeechSynthesisUtterance/);
  assert.doesNotMatch(source, /window\.ENGOPLAY\s*=/);
});
