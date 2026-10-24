import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const norm = value => String(value ?? '').toLowerCase().normalize('NFKC')
  .replace(/[’‘\x60]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

test('production English content scripts are referenced or explicitly exempted', () => {
  const html = read('legacy.html');
  const loader = read('shell-loader.js');
  const refs = new Set([html, loader].flatMap(source =>
    [...source.matchAll(/["']\/?(english-[^/"'?\s]+\.js)/g)].map(match => match[1])
  ));
  const scripts = readdirSync(root).filter(name => /^english-.*\.js$/.test(name));
  const intentional = new Set(['english-vocab-v23.js']);
  const unexplained = scripts.filter(name => !refs.has(name) && !intentional.has(name));
  assert.deepEqual(unexplained, [], `Unreferenced English content scripts: ${unexplained.join(', ')}`);
  for (const name of intentional) {
    assert.ok(scripts.includes(name), `Documented exception missing: ${name}`);
    assert.ok(!refs.has(name), `${name} should remain unloaded until reviewed`);
  }
});

test('V9 plus the V24 patch preserves a unique normalized vocabulary', () => {
  const context = {};
  context.window = context;
  runInNewContext(read('english-content-v9.js'), context);
  const base = context.SERAG_ENGLISH_V9.vocabulary.length;
  runInNewContext(read('english-vocab-v24.js'), context);
  const patch = context.SERAG_ENGLISH_VOCAB_V24;
  assert.equal(patch.applied, true);
  assert.ok(patch.additions.length > 0);
  assert.ok(patch.additions.length > 0);
  assert.equal(context.SERAG_ENGLISH_V9.vocabulary.length, base + patch.additions.length);
  const baseTerms = new Set(context.SERAG_ENGLISH_V9.vocabulary.slice(0, base).map(row => norm(row[0])));
  const newTerms = patch.additions.map(row => norm(row[0]));
  assert.equal(new Set(newTerms).size, newTerms.length, 'V24 additions contain duplicate normalized terms');
  assert.ok(newTerms.every(term => !baseTerms.has(term)), 'V24 adds a term already present in V9');
});

test('read-only inventory script emits a JSON report', () => {
  const output = execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/english-library-inventory.mjs', import.meta.url))], { encoding: 'utf8' });
  const report = JSON.parse(output);
  assert.equal(report.readOnly, true);
  assert.ok(report.vocabulary.v9Rows > 0);
  assert.ok(report.vocabulary.v24AcceptedAdditions > 0);
  assert.ok(report.vocabulary.v23RawRows > 0);
  console.log('English library inventory:', JSON.stringify(report));
});

test('V23 remains inventory-only and does not silently enter the shared vocabulary', () => {
  const context = {};
  context.window = context;
  runInNewContext(read('english-content-v9.js'), context);
  const before = context.SERAG_ENGLISH_V9.vocabulary.length;
  const source = read('english-vocab-v23.js');
  assert.match(source, /var vocabRows\s*=/);
  assert.equal(context.SERAG_ENGLISH_V9.vocabulary.length, before);
});
