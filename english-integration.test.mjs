import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ANY_ENGLISH_JS, KNOWN_UNWIRED, ROTATION_CATEGORIES, checkQuestions, contentFilesInOrder, findRoot,
  grammarStats, loadFiles, questionSources, readRefs, vocabStats,
} from './helpers/english-harness.mjs';

// Read-only. Hard assertions cover facts verified in production on 2026-10-23.
// "Soft" checks print a diagnostic; set STRICT=1 to turn them into failures.
const STRICT = process.env.STRICT === '1';
function soft(t, ok, message) {
  if (ok) return;
  if (STRICT) assert.fail(message);
  t.diagnostic(message);
}

const root = findRoot();
const refs = readRefs(root);
const contentFiles = contentFilesInOrder(refs);
const { ctx, errors } = loadFiles(root, contentFiles);

test('every script referenced by legacy.html and app-bootstrap.js exists on disk', () => {
  const missing = [...refs.all].filter((f) => !fs.existsSync(path.join(root, f)));
  assert.deepEqual(missing, [], `Referenced but missing: ${missing.join(', ')}`);
});

test('no english-*.js file is deployed without being wired (except documented ones)', () => {
  const onDisk = fs.readdirSync(root).filter((f) => ANY_ENGLISH_JS.test(f));
  const unwired = onDisk.filter((f) => !refs.all.has(f) && !(f in KNOWN_UNWIRED));
  assert.deepEqual(unwired, [], `Add to app-bootstrap.js or document in KNOWN_UNWIRED: ${unwired.join(', ')}`);
});

test('KNOWN_UNWIRED does not rot: listed files still exist and are still unwired', () => {
  for (const [file, reason] of Object.entries(KNOWN_UNWIRED)) {
    assert.ok(reason && reason.length > 10, `${file} needs a reason`);
    assert.ok(fs.existsSync(path.join(root, file)), `${file} no longer exists: remove it from KNOWN_UNWIRED`);
    assert.ok(!refs.all.has(file), `${file} is now wired: remove it from KNOWN_UNWIRED`);
  }
});

test('content files load in production order without throwing', () => {
  assert.ok(contentFiles.length > 0, 'no content files found in app-bootstrap.js');
  assert.deepEqual(errors, []);
});

test('SERAG_ENGLISH_V9.vocabulary rows are 5 non-empty strings', () => {
  const s = vocabStats(ctx);
  assert.ok(s, 'SERAG_ENGLISH_V9.vocabulary is missing');
  assert.equal(s.invalid, 0, `${s.invalid} malformed vocabulary rows`);
});

test('every question source has unique ids and answers that are among the options', (t) => {
  const sources = questionSources(ctx);
  assert.ok(sources.length > 0, 'no question source found');
  for (const { source, rows } of sources) {
    const r = checkQuestions(rows);
    t.diagnostic(`${source}: ${r.count} questions`);
    assert.deepEqual(r.answerNotInOptions, [], `${source}: answer not in options`);
    assert.deepEqual(r.duplicateIds, [], `${source}: duplicate ids`);
  }
});

test('SERAG_PHRASES_V16: each question matches an item id', () => {
  const v16 = ctx.SERAG_PHRASES_V16;
  if (!v16) return;
  const ids = new Set(v16.items.map((i) => i.id));
  assert.equal(ids.size, v16.items.length, 'duplicate item ids in V16');
  const orphan = [...v16.questions].filter((q) => !ids.has(q.id)).map((q) => q.id);
  assert.equal(orphan.length, 0, `questions without a matching item: ${orphan.join(', ')}`);
});

test('[soft] grammar lessons (V10 family) have unique ids and 3-part quizzes', (t) => {
  const g = grammarStats(ctx);
  if (g.v10Lessons == null) return soft(t, false, 'SERAG_GRAMMAR_V10 is not an array');
  soft(t, !g.duplicateIds?.length, `duplicate grammar ids: ${g.duplicateIds?.join(', ')}`);
  soft(t, g.badQuiz === 0, `${g.badQuiz} grammar lessons have a malformed quiz`);
});

test('[soft] vocabulary categories are read by the daily rotation', (t) => {
  const s = vocabStats(ctx);
  const outside = Object.entries(s.categories).filter(([c]) => !ROTATION_CATEGORIES.has(c));
  soft(t, outside.length === 0, `categories never used by «كلمات النهارده»: ${outside.map(([c, n]) => `${c} (${n})`).join(', ')}`);
});

test('[soft] no duplicate normalised vocabulary terms', (t) => {
  const s = vocabStats(ctx);
  soft(t, s.duplicates.length === 0, `${s.duplicates.length} duplicated terms (the engine merges them at runtime): ${s.duplicates.map((d) => d.term).join(', ')}`);
});

test('[soft] terms with hyphens (typed recall does not equate "full time" with "full-time")', (t) => {
  const s = vocabStats(ctx);
  soft(t, s.hyphenated.length === 0, `hyphenated terms: ${s.hyphenated.join(', ')}`);
});
