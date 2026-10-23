#!/usr/bin/env node
// Read-only inventory for the shared English library. This script never writes files.
import { readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const norm = value => String(value ?? '').toLowerCase().normalize('NFKC')
  .replace(/[’‘\x60]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const countBy = (rows, field) => rows.reduce((out, row) => {
  const key = row[field] || '(missing)';
  out[key] = (out[key] || 0) + 1;
  return out;
}, {});

const baseSource = read('english-content-v9.js');
const patchSource = read('english-vocab-v24.js');
const v23Source = read('english-vocab-v23.js');
const phraseSource = read('english-phrases-v16.js');

// Match browser global semantics: window and the global object are the same object.
const context = {};
context.window = context;
runInNewContext(baseSource, context);
const v9Rows = context.SERAG_ENGLISH_V9.vocabulary.map(row => ({
  term: row[0], category: row[2], register: row[4]
}));
const beforePatch = v9Rows.length;
runInNewContext(patchSource, context);
const patch = context.SERAG_ENGLISH_VOCAB_V24;
const v24Rows = Array.isArray(patch?.additions) ? patch.additions.map(row => ({
  term: row[0], category: row[2], register: row[4]
})) : [];
const rawV24Match = patchSource.match(/const additions\\s*=\\s*(\\[[\\s\\S]*?\\]);/);
if (!rawV24Match) throw new Error('Could not locate the literal additions array in english-vocab-v24.js');
const rawV24Rows = runInNewContext('(' + rawV24Match[1] + ')', Object.create(null))
  .map(row => ({ term: row[0], category: row[2], register: row[4] }));

const v23Match = v23Source.match(/var vocabRows\s*=\s*(\[[\s\S]*?\]);\s*var grammarRows/);
if (!v23Match) throw new Error('Could not locate the literal vocabRows array in english-vocab-v23.js');
const v23Rows = runInNewContext('(' + v23Match[1] + ')', Object.create(null))
  .map(row => ({ term: row[0], category: row[2], register: row[4] }));
const phrases = [...phraseSource.matchAll(/"phrase"\s*:\s*"([^"]+)"/g)].map(match => match[1]);

const known = new Set([...v9Rows, ...v24Rows].map(row => norm(row.term)));
const v23Overlaps = v23Rows.filter(row => known.has(norm(row.term)) || phrases.some(term => norm(term) === norm(row.term)))
  .map(row => row.term);

const html = read('legacy.html');
const loader = read('shell-loader.js');
const refs = new Set([...html, ...loader].flatMap(source =>
  [...source.matchAll(/["']\/?(english-[^/"'?\s]+\.js)/g)].map(match => match[1])
));
const englishFiles = readdirSync(new URL('../', import.meta.url))
  .filter(name => /^english-.*\.js$/.test(name)).sort();
const intentionalUnloaded = {
  'english-vocab-v23.js': 'Reserved legacy patch; do not load until its schema, categories, and overlaps are reviewed.'
};
const unreferenced = englishFiles.filter(name => !refs.has(name));
const report = {
  readOnly: true,
  source: 'repository working tree; no files or databases are changed',
  vocabulary: {
    v9Rows: beforePatch,
    v9UniqueNormalizedTerms: new Set(v9Rows.map(row => norm(row.term))).size,
    v9DuplicateNormalizedRows: v9Rows.length - new Set(v9Rows.map(row => norm(row.term))).size,
    v24RawRows: rawV24Rows.length,
    v24RawDuplicateNormalizedRows: rawV24Rows.length - new Set(rawV24Rows.map(row => norm(row.term))).size,
    v24OverlapWithV9: rawV24Rows.filter(row => new Set(v9Rows.map(item => norm(item.term))).has(norm(row.term))).map(row => row.term),
    v24AcceptedAdditions: v24Rows.length,
    v24CategoryCounts: countBy(v24Rows, 'category'),
    combinedV9V24Rows: context.SERAG_ENGLISH_V9.vocabulary.length,
    combinedUniqueNormalizedTerms: new Set(context.SERAG_ENGLISH_V9.vocabulary.map(row => norm(row[0]))).size,
    v23RawRows: v23Rows.length,
    v23OverlapsWithV9V24V16: v23Overlaps.length,
    v23OverlapTerms: v23Overlaps,
    v16PhraseEntries: phrases.length
  },
  loading: {
    rootEnglishScripts: englishFiles.length,
    referencedEnglishScripts: englishFiles.filter(name => refs.has(name)).length,
    unreferencedEnglishScripts: unreferenced,
    documentedIntentionalExceptions: intentionalUnloaded
  }
};
console.log(JSON.stringify(report, null, 2));
