import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const baseSource = readFileSync(new URL('../english-content-v9.js', import.meta.url), 'utf8');
const patchSource = readFileSync(new URL('../english-vocab-v24.js', import.meta.url), 'utf8');

function load() {
  // In a browser, window is the global object. Mirror that relationship in vm:
  // code that reads window.SERAG_ENGLISH_V9 and bare SERAG_ENGLISH_V9 must see
  // the same binding, just as it does in production.
  const context = {};
  context.window = context;
  runInNewContext(baseSource, context);
  const before = context.SERAG_ENGLISH_V9.vocabulary.length;
  runInNewContext(patchSource, context);
  return { window: context, before };
}
const norm = value => String(value ?? '').toLowerCase().normalize('NFKC')
  .replace(/[’‘\x60]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

test('v24 extends the shared English source without replacing existing vocabulary', () => {
  const { window, before } = load();
  const result = window.SERAG_ENGLISH_VOCAB_V24;
  assert.equal(result.version, 24);
  assert.equal(result.applied, true);
  assert.ok(result.additions.length >= 80, `Expected at least 80 accepted items, got ${result.additions.length}`);
  assert.equal(window.SERAG_ENGLISH_V9.vocabulary.length, before + result.additions.length);
  assert.ok(window.SERAG_ENGLISH_V9.vocabulary.some(row => norm(row[0]) === norm('deadline')));
});

test('every new vocabulary row has a complete existing-schema tuple and unique normalized phrase', () => {
  const { window } = load();
  const rows = window.SERAG_ENGLISH_VOCAB_V24.additions;
  const ids = rows.map(row => norm(row[0]));
  assert.equal(new Set(ids).size, ids.length, 'New vocabulary contains duplicate phrases');
  for (const row of rows) {
    assert.equal(row.length, 5);
    assert.ok(row.every(value => typeof value === 'string' && value.trim()));
    assert.ok(row[1].length >= 2, `Missing Arabic meaning for ${row[0]}`);
    assert.ok(row[3].split(/\s+/).length >= 5, `Context sentence too short for ${row[0]}`);
    assert.ok(['Everyday','Work & Office','Marketing & Sales','Design & Motion'].includes(row[2]), `Unexpected category: ${row[2]}`);
    assert.ok(['neutral','natural','formal','technical'].includes(row[4]), `Unexpected register: ${row[4]}`);
  }
  const all = window.SERAG_ENGLISH_V9.vocabulary.map(row => norm(row[0]));
  assert.equal(new Set(all).size, all.length, 'Combined shared vocabulary contains duplicate normalized phrases');
});

test('the patch safely reports not-applied when the base vocabulary has not loaded', () => {
  const window = {};
  runInNewContext(patchSource, { window });
  assert.equal(window.SERAG_ENGLISH_VOCAB_V24.applied, false);
  assert.ok(window.SERAG_ENGLISH_VOCAB_V24.additions.length >= 80);
});
