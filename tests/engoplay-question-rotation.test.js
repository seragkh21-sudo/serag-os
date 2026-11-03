import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../engoplay-question-rotation.js', import.meta.url), 'utf8');
function harness(seedStore = new Map(), statsStore = new Map(), options = {}) {
  const sessionStorage = {
    getItem: key => { if (options.blockSession) throw new Error('blocked'); return seedStore.get(key) ?? null; },
    setItem: (key, value) => { if (options.blockSession) throw new Error('blocked'); seedStore.set(key, String(value)); },
    removeItem: key => { if (options.blockSession) throw new Error('blocked'); seedStore.delete(key); }
  };
  const localStorage = {
    getItem: key => { if (options.blockLocal) throw new Error('blocked'); return statsStore.get(key) ?? null; },
    setItem: (key, value) => { if (options.blockLocal) throw new Error('blocked'); statsStore.set(key, String(value)); },
    removeItem: key => { if (options.blockLocal) throw new Error('blocked'); statsStore.delete(key); }
  };
  const window = { sessionStorage, localStorage, crypto: { getRandomValues: values => { values[0] = Math.floor(Math.random() * 0xffffffff); values[1] = Math.floor(Math.random() * 0xffffffff); return values; } } };
  vm.runInNewContext(source, { window, Date, Math, JSON, Map, Number, String, Array, Object, Uint32Array, isFinite, parseInt });
  return { api: window.EngoRotation, window };
}
function topic(id, count = 16) {
  return { topic_id: id, practice_questions: Array.from({ length: count }, (_, i) => ({ question_id: id * 100 + i + 1, question: 'Question ' + i })) };
}

test('session seed survives reload and a new seed clears the cached selection', () => {
  const seeds = new Map(), stats = new Map();
  const first = harness(seeds, stats), seed = first.api.getSessionSeed();
  const second = harness(seeds, stats);
  assert.equal(second.api.getSessionSeed(), seed);
  const rows = [topic(1), topic(2)];
  assert.deepEqual(Array.from(first.api.pickTopics(rows), x => x.topic_id), Array.from(second.api.pickTopics(rows), x => x.topic_id));
  const next = first.api.newSessionSeed();
  assert.notEqual(next, seed);
  assert.equal(seeds.get('engoplay_session_seed_v1'), next);
  assert.equal(seeds.has('engoplay_session_questions_v1'), false);
});

test('topic question cache returns identical IDs after a simulated refresh', () => {
  const seeds = new Map(), stats = new Map(), rows = [topic(3)];
  const first = harness(seeds, stats);
  const selected = first.api.getSessionQuestions('3', rows);
  const second = harness(seeds, stats);
  const restored = second.api.getSessionQuestions('3', rows);
  assert.equal(selected.length, 10);
  assert.deepEqual(Array.from(restored, q => q.question_id), Array.from(selected, q => q.question_id));
});

test('picker prioritizes unseen questions, then overdue, before future-due questions', () => {
  const seeds = new Map(), stats = new Map(), h = harness(seeds, stats), api = h.api;
  const pool = Array.from({ length: 12 }, (_, i) => ({ question_id: 'q' + i }));
  const statsObj = {};
  statsObj.q0 = { seen: 1, correct: 1, wrong: 0, streak: 1, lastSeen: new Date().toISOString(), nextDue: new Date(Date.now() - 1000).toISOString() };
  statsObj.q1 = { seen: 1, correct: 1, wrong: 0, streak: 1, lastSeen: new Date().toISOString(), nextDue: new Date(Date.now() + 86400000).toISOString() };
  stats.set('engoplay_qstats_v1', JSON.stringify(statsObj));
  const chosen = api.pickQuestions(pool, { count: 10, markSeen: false });
  const ids = new Set(chosen.map(q => q.question_id));
  assert.equal(chosen.length, 10);
  assert.ok(!ids.has('q1'), 'future-due item must be last');
  assert.ok(ids.has('q0'), 'overdue item should be selected');
});

test('correct and incorrect answers schedule the specified retry intervals', () => {
  const seeds = new Map(), stats = new Map(), h = harness(seeds, stats);
  let now = 1_800_000_000_000;
  class Clock extends Date { static now() { return now; } }
  vm.runInNewContext(source, { window: h.window, Date: Clock, Math, JSON, Map, Number, String, Array, Object, Uint32Array, isFinite, parseInt });
  const api = h.window.EngoRotation;
  const first = api.recordAnswer('q1', true);
  assert.equal(Date.parse(first.nextDue) - now, 10 * 60 * 1000);
  now += 1;
  const second = api.recordAnswer('q1', true);
  assert.equal(Date.parse(second.nextDue) - now, 24 * 60 * 60 * 1000);
  now += 1;
  const third = api.recordAnswer('q1', false);
  assert.equal(Date.parse(third.nextDue) - now, 5 * 60 * 1000);
  assert.equal(third.streak, 0);
  assert.equal(third.wrong, 1);
});

test('storage failures are non-fatal and retain an in-memory fallback', () => {
  const h = harness(new Map(), new Map(), { blockSession: true, blockLocal: true });
  assert.ok(h.api.getSessionSeed());
  assert.doesNotThrow(() => h.api.pickQuestions(topic(4), { count: 10 }));
  assert.doesNotThrow(() => h.api.recordAnswer('fallback-q', false));
  assert.equal(h.api.loadStats()['fallback-q'].wrong, 1);
});
