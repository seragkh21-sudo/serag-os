import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

function load(authenticated = true) {
  const store = new Map();
  const window = { user: authenticated ? { id: 'test-owner' } : null, addEventListener() {} };
  const context = {
    window,
    document: { addEventListener() {} },
    localStorage: {
      getItem(key) { return store.has(key) ? store.get(key) : null; },
      setItem(key, value) { store.set(key, String(value)); }
    },
    setTimeout() {},
    Date, Math, String, Array, Object
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('english-attempt-sync-v11.js', 'utf8'), context);
  return { api: window.SERAG_ENGLISH_ATTEMPT_SYNC_V11, store };
}

test('EngoPlay challenge attempts use the existing offline-safe attempt queue', () => {
  const { api, store } = load();
  const row = api.trackChallengeAttempt({
    attempt_session: 'sentence-builder:2026-10-30:user:test-owner',
    attempt_order: 2,
    question_number: 2,
    section: 'EngoPlay · Sentence Builder',
    question_type: 'sentence_arrange',
    prompt: 'I have worked here for years.',
    selected_answer: 'I worked here for years.',
    correct_answer: 'I have worked here for years.',
    is_correct: false,
    explanation: 'Present perfect describes a situation continuing to now.',
    metadata: { question_key: 'sentence-builder:example-42' }
  });
  assert.equal(row.source, 'engoplay_challenge');
  assert.equal(row.is_correct, false);
  assert.equal(row.metadata.question_key, 'sentence-builder:example-42');
  const pending = JSON.parse(store.get('seragEnglishPendingAttemptsV11'));
  assert.equal(pending.length, 1);
  assert.equal(pending[0].rows.length, 1);
  assert.equal(pending[0].rows[0].prompt, 'I have worked here for years.');
  assert.equal(pending[0].rows[0].selected_answer, 'I worked here for years.');
});

test('challenge events receive unique client IDs so retry attempts are not overwritten', () => {
  const { api, store } = load();
  const payload = { attempt_session: 'same-session', selected_answer: 'wrong', is_correct: false };
  const first = api.trackChallengeAttempt(payload);
  const second = api.trackChallengeAttempt(payload);
  assert.notEqual(first.client_event_id, second.client_event_id);
  const pending = JSON.parse(store.get('seragEnglishPendingAttemptsV11'));
  assert.equal(pending.length, 2);
});


test('anonymous challenge answers are not queued for a later account', () => {
  const { api, store } = load(false);
  assert.equal(api.trackChallengeAttempt({ selected_answer: 'answer' }), null);
  assert.equal(store.has('seragEnglishPendingAttemptsV11'), false);
});
