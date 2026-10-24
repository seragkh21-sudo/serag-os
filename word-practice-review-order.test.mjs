import test from 'node:test';
import assert from 'node:assert/strict';
import { findRoot, loadFiles, norm } from './helpers/english-harness.mjs';

// Behaviour under test: in the Words / EngoPlay journey, reviews that are DUE come first
// (most overdue first), then fresh words, then practised-but-unscheduled, then words scheduled for later.
// Read-only: loads word-practice-v21.js into an isolated vm sandbox with stubbed browser APIs.
const root = findRoot();
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 24, 12, 0, 0);

function boot() {
  const { ctx, errors } = loadFiles(root, ['word-practice-v21.js']);
  assert.deepEqual(errors, [], 'word-practice-v21.js must load in the sandbox');
  return ctx;
}
const word = (phrase) => ({ phrase, id: `vocab:${norm(phrase)}`, meaning: `meaning of ${phrase}`, group: 'Test', examples: [`I like ${phrase} a lot.`] });
const ids = (list) => Array.from(list, (w) => w.phrase);

test('orderPool: due first (most overdue first), then fresh, then practised, then scheduled for later', () => {
  const wp = boot().SERAG_WORD_PRACTICE;
  assert.equal(typeof wp.orderPool, 'function', 'orderPool must be exported');
  const list = ['fresh a', 'due new', 'due old', 'practised', 'later'].map(word);
  const reviews = {
    'vocab:due new': { due_at: new Date(NOW - 1 * DAY).toISOString() },
    'vocab:due old': { due_at: new Date(NOW - 5 * DAY).toISOString() },
    'vocab:later': { due_at: new Date(NOW + 3 * DAY).toISOString() },
  };
  for (let i = 0; i < 25; i += 1) {
    const out = ids(wp.orderPool(list, (id) => reviews[id] || null, { practised: { attempts: 1 } }, NOW));
    assert.deepEqual(out, ['due old', 'due new', 'fresh a', 'practised', 'later']);
  }
});

test('orderPool: a due review outranks fresh words even when hundreds of fresh words exist', () => {
  const wp = boot().SERAG_WORD_PRACTICE;
  const fresh = Array.from({ length: 300 }, (_, i) => word(`fresh ${i}`));
  const due = ['due 1', 'due 2', 'due 3'].map(word);
  const reviews = Object.fromEntries(due.map((w, i) => [w.id, { due_at: new Date(NOW - (i + 1) * DAY).toISOString() }]));
  for (let i = 0; i < 20; i += 1) {
    const out = ids(wp.orderPool([...fresh, ...due], (id) => reviews[id] || null, {}, NOW));
    assert.deepEqual(out.slice(0, 3), ['due 3', 'due 2', 'due 1']);
  }
});

test('orderPool: missing or invalid due_at falls back to local-state tiers without throwing', () => {
  const wp = boot().SERAG_WORD_PRACTICE;
  const list = ['broken', 'seen', 'fresh'].map(word);
  const status = (id) => (id === 'vocab:broken' ? { due_at: 'not a date' } : null);
  const out = ids(wp.orderPool(list, status, { seen: { attempts: 1 } }, NOW));
  assert.deepEqual(out.slice().sort(), ['broken', 'fresh', 'seen']);
  assert.ok(out.indexOf('fresh') < out.indexOf('seen'), 'fresh stays before practised');
});

test('orderPool: does not mutate its input and works without a status function', () => {
  const wp = boot().SERAG_WORD_PRACTICE;
  const list = ['a', 'b', 'c'].map(word);
  const before = ids(list);
  const out = wp.orderPool(list);
  assert.deepEqual(ids(list), before);
  assert.equal(out.length, 3);
});

test('end-to-end: start() opens the journey with the most overdue practised word, not a fresh one', () => {
  const ctx = boot();
  // 60 fresh words + 2 words practised earlier that are now due. Meanings are unique so the first card identifies the pick.
  const rows = Array.from({ length: 60 }, (_, i) => [`fresh phrase ${i}`, `FRESH-MEANING-${i}`, 'Everyday', `We say fresh phrase ${i} often.`, 'neutral']);
  rows.push(['old due phrase', 'OLD-DUE-MEANING', 'Everyday', 'We say old due phrase often.', 'neutral']);
  rows.push(['new due phrase', 'NEW-DUE-MEANING', 'Everyday', 'We say new due phrase often.', 'neutral']);
  ctx.SERAG_ENGLISH_V9 = { vocabulary: rows };
  ctx.localStorage.setItem('seragSentenceV21:null', JSON.stringify({
    'old due phrase': { attempts: 1, independent: 1 },
    'new due phrase': { attempts: 1, independent: 1 },
  }));
  ctx.ENGOPLAY = {
    reviewStatus: (id) => {
      if (id === 'vocab:old due phrase') return { due_at: new Date(Date.now() - 5 * DAY).toISOString() };
      if (id === 'vocab:new due phrase') return { due_at: new Date(Date.now() - 1 * DAY).toISOString() };
      return null;
    },
  };
  ctx.SERAG_WORD_PRACTICE.start();
  const firstCard = ctx.SERAG_WORD_PRACTICE.html();
  assert.match(firstCard, /OLD-DUE-MEANING/, 'the first card should be the most overdue review');
  assert.doesNotMatch(firstCard, /FRESH-MEANING/, 'a fresh word must not displace a due review');
});

test('regression: choosing a specific word still puts it first, even when reviews are due', () => {
  const ctx = boot();
  const rows = Array.from({ length: 20 }, (_, i) => [`plain phrase ${i}`, `PLAIN-MEANING-${i}`, 'Everyday', `We say plain phrase ${i} often.`, 'neutral']);
  rows.push(['due phrase', 'DUE-MEANING', 'Everyday', 'We say due phrase often.', 'neutral']);
  ctx.SERAG_ENGLISH_V9 = { vocabulary: rows };
  ctx.ENGOPLAY = { reviewStatus: (id) => (id === 'vocab:due phrase' ? { due_at: new Date(Date.now() - 2 * DAY).toISOString() } : null) };
  ctx.SERAG_WORD_PRACTICE.start('plain phrase 7');
  assert.match(ctx.SERAG_WORD_PRACTICE.html(), /PLAIN-MEANING-7/);
});
