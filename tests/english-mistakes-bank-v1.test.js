import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dataPath = new URL('../data/review/english-mistakes-bank-v1.jsonl', import.meta.url);
const manifestPath = new URL('../data/review/english-mistakes-bank-v1-manifest.json', import.meta.url);
const rows = fs.readFileSync(dataPath, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const source = fs.readFileSync(new URL('../english-mistakes-bank-v1.js', import.meta.url), 'utf8');

function load() {
  const window = {
    SERAG_SUPPLEMENT_V13: { questions: [{ id: 'existing-question' }] },
    SERAG_GRAMMAR_V10: [{ id: 'existing-grammar' }],
    localStorage: { getItem() { return null; }, setItem() {} }
  };
  window.window = window;
  const context = { window, document: { getElementById() { return null; } } };
  vm.runInNewContext(source, context);
  return window;
}

test('mistake correction dataset has 40 valid bilingual rows with stable unique source IDs', () => {
  assert.equal(rows.length, 40);
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
  assert.deepEqual(new Set(rows.map(row => row.cefr)), new Set(['A2','B1','B2']));
  for (const row of rows) {
    assert.match(row.id, /^cem-\d{3}$/);
    assert.ok(row.learner_sentence && row.corrected_sentence && row.explanation);
    assert.ok(row.explanation_ar && row.practice_prompt_ar);
    assert.notEqual(row.learner_sentence, row.corrected_sentence, row.id);
    assert.ok(Array.isArray(row.tags) && row.tags.length, row.id);
  }
});

test('manifest records MIT attribution and clearly flags Arabic as an unreviewed draft', () => {
  assert.equal(manifest.records, rows.length);
  assert.equal(manifest.source.license, 'MIT');
  assert.match(manifest.source.repository, /elispeak-common-english-mistakes/);
  assert.match(manifest.status, /not received independent human review/);
});

test('runtime validates rows and rejects missing translations or duplicate IDs', () => {
  const api = load().SERAG_MISTAKES_BANK_V1;
  assert.equal(api.version, 1);
  assert.equal(api.dataUrl, '/data/review/english-mistakes-bank-v1.jsonl');
  assert.deepEqual(Array.from(api.validateRows(rows)), []);
  const broken = rows.slice(0, 2).map(row => ({ ...row }));
  broken[1].id = broken[0].id;
  broken[1].explanation_ar = '';
  const errors = Array.from(api.validateRows(broken));
  assert.ok(errors.some(message => message.includes('duplicate id')));
  assert.ok(errors.some(message => message.includes('explanation_ar')));
});

test('the new bank remains separate from active grammar question data', () => {
  const window = load();
  const qCount = window.SERAG_SUPPLEMENT_V13.questions.length;
  const gCount = window.SERAG_GRAMMAR_V10.length;
  assert.equal(qCount, 1);
  assert.equal(gCount, 1);
  assert.equal(window.SERAG_MISTAKES_BANK_V1.loadedCount(), 0);
});

test('loader and English navigation provide a route to the correction bank', () => {
  const loader = fs.readFileSync(new URL('../shell-loader.js', import.meta.url), 'utf8');
  const academy = fs.readFileSync(new URL('../english-academy-v12.js', import.meta.url), 'utf8');
  const engoplay = fs.readFileSync(new URL('../engoplay-v19.js', import.meta.url), 'utf8');
  assert.match(loader, /english-mistakes-bank-v1\.css/);
  assert.match(loader, /english-mistakes-bank-v1\.js/);
  assert.match(academy, /\['corrections'/);
  assert.match(academy, /SERAG_MISTAKES_BANK_V1\?\.html\(\)/);
  assert.match(engoplay, /data-ea-tab="corrections"/);
});