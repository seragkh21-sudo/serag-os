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
    { id: 'too-long', sentence: Array(30).fill('word').join(' ') },
    { id: 'placeholder', sentence: 'You should ______ in the form before submitting it.' }
  ]);
  const first = Array.from(game.pickDailyExamples(rows, 'user-a', '2026-10-26'));
  const second = Array.from(game.pickDailyExamples(rows, 'user-a', '2026-10-26'));
  const otherUser = Array.from(game.pickDailyExamples(rows, 'user-b', '2026-10-26'));
  assert.equal(first.length, 3);
  assert.equal(new Set(first).size, 3);
  assert.deepEqual(first, second);
  assert.notDeepEqual(first, otherUser);
  assert.ok(first.every(id => id !== 'too-short' && id !== 'too-long' && id !== 'placeholder'));
  assert.equal(game.pickDailyExamples([{ id: 'placeholder', sentence: 'You should ______ in the form before submitting it.' }], 'user-a', '2026-10-26').length, 0);
});

test('daily Sentence Builder avoids recently used examples before reusing the bank', () => {
  const game = loadModule();
  const rows = Array.from({ length: 9 }, (_, i) => ({
    id: 'example-' + i,
    sentence: 'I have used this simple example for practice ' + i + '.'
  }));
  const first = Array.from(game.pickDailyExamples(rows, 'user-a', '2026-10-26'));
  const next = Array.from(game.pickDailyExamples(rows, 'user-a', '2026-10-27', first));
  assert.equal(next.length, 3);
  assert.equal(next.some(id => first.includes(id)), false);
  const smallBank = rows.slice(0, 3);
  assert.equal(game.pickDailyExamples(smallBank, 'user-a', '2026-10-27', first).length, 3,
    'reuse is allowed only when the remaining bank cannot fill a complete challenge');
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
  assert.match(source, /setTimeout\(init, 0\)/);
  assert.match(source, /addEventListener\('click', handleClick, true\)/);
  assert.doesNotMatch(source, /data-eq-open ['"]\s*\+\s*\(!available \? 'disabled'/);
});

test('quest markup integrates into the actual EngoPlay lobby render and is idempotent', () => {
  const game = loadModule();
  const original = '<div class="ep-lobby"><header class="ep-top">top</header><nav class="ep-tabs"><button>tabs</button></nav><div class="ep-play-grid"></div></div>';
  const inserted = game.injectQuestMarkup(original);
  assert.match(inserted, /data-eq-panel/);
  assert.ok(inserted.indexOf('</nav>') < inserted.indexOf('data-eq-panel'));
  assert.ok(inserted.indexOf('data-eq-panel') < inserted.indexOf('<div class="ep-play-grid">'));
  assert.equal(game.injectQuestMarkup(inserted), inserted);
});

test('render hook wraps the real EngoPlay lobby method without changing its public API', () => {
  const context = {
    window: { ENGOPLAY: { owner: 'owner-1', renderLobby() { return '<div class="ep-lobby"><nav class="ep-tabs">tabs</nav><div class="ep-play-grid"></div></div>'; } } },
    document: { readyState: 'loading', addEventListener() {} },
    localStorage: { getItem() { return null; }, setItem() {} },
    Intl, Date, Set, Math, Number, String, Array, Object
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('engoplay-quests-v1.js', 'utf8'), context);
  const game = context.window.SERAG_ENGOPLAY_QUESTS_V1;
  assert.equal(game.attachRenderHook(), true);
  assert.match(context.window.ENGOPLAY.renderLobby(), /data-eq-panel/);
  assert.equal(game.attachRenderHook(), false);
});


test('challenge attempts feed the shared EngoPlay XP and existing synced attempt queue', () => {
  const xpCalls = [], syncCalls = [];
  const context = {
    window: {
      ENGOPLAY: { track: row => xpCalls.push(row) },
      SERAG_ENGLISH_ATTEMPT_SYNC_V11: { trackChallengeAttempt: row => syncCalls.push(row) }
    },
    document: { readyState: 'loading', addEventListener() {} },
    localStorage: { getItem() { return null; }, setItem() {} },
    Intl, Date, Set, Math, Number, String, Array, Object
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('engoplay-quests-v1.js', 'utf8'), context);
  const game = context.window.SERAG_ENGOPLAY_QUESTS_V1;
  const row = { id: 'example-42', sentence: 'I have worked here for years.' };
  const result = game.recordChallengeAttempt(row, 'I worked here for years.', false, {
    owner: 'user:test-owner', state: { daily: { index: 1 } }
  });
  assert.equal(result.trackedXP, true);
  assert.equal(result.syncedAttempt, true);
  assert.equal(xpCalls.length, 1);
  assert.equal(xpCalls[0].id, 'sentence-builder:example-42');
  assert.equal(xpCalls[0].correct, false);
  assert.equal(xpCalls[0].topic, 'sentence-builder');
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].source, 'engoplay_challenge');
  assert.equal(syncCalls[0].is_correct, false);
  assert.equal(syncCalls[0].selected_answer, 'I worked here for years.');
  assert.equal(syncCalls[0].correct_answer, row.sentence);
});

test('challenge keeps an explicit Check action and does not auto-submit on the final tile', () => {
  const source = fs.readFileSync('engoplay-quests-v1.js', 'utf8');
  assert.match(source, /data-eq-check>تحقّق من الجملة/);
  assert.doesNotMatch(source, /daily\.selected\.length === daily\.bank\.length\) evaluateAnswer/);
  assert.match(source, /الإجابة الصحيحة: '\s*\+ row\.sentence/);
  assert.match(source, /رتّب الكلمات، وبعد ما تخلص اضغط/);
  assert.match(source, /window\.ENGOPLAY\.track/);
});
