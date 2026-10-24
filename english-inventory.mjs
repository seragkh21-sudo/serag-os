#!/usr/bin/env node
// Read-only inventory of the English library. Writes nothing. Usage:
//   node scripts/english-inventory.mjs          (text report)
//   node scripts/english-inventory.mjs --json   (machine-readable)
import fs from 'node:fs';
import {
  ANY_ENGLISH_JS, KNOWN_UNWIRED, ROTATION_CATEGORIES, checkQuestions, contentFilesInOrder, describe, findRoot,
  grammarStats, loadFiles, questionSources, readRefs, seragGlobals, simulateUnwired, vocabStats,
} from '../tests/helpers/english-harness.mjs';

const root = findRoot();
const refs = readRefs(root);
const contentFiles = contentFilesInOrder(refs);
const { ctx, errors } = loadFiles(root, contentFiles);

const onDisk = fs.readdirSync(root).filter((f) => ANY_ENGLISH_JS.test(f));
const unwired = onDisk.filter((f) => !refs.all.has(f));

const vocab = vocabStats(ctx);
const report = {
  root,
  wiring: {
    loaderScripts: refs.loader.length,
    legacyScripts: refs.legacy.length,
    contentFilesInLoadOrder: contentFiles,
    loadErrors: errors,
    unwiredEnglishFiles: unwired.map((f) => ({ file: f, documented: f in KNOWN_UNWIRED })),
  },
  globals: Object.fromEntries(seragGlobals(ctx).map((k) => [k, describe(ctx[k])])),
  vocabulary: vocab && {
    ...vocab,
    categories: Object.entries(vocab.categories)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, inDailyRotation: ROTATION_CATEGORIES.has(name) })),
  },
  grammar: grammarStats(ctx),
  questions: questionSources(ctx).map(({ source, rows }) => ({ source, ...checkQuestions(rows) })),
  unwiredPatchSimulation: unwired
    .filter((f) => /vocab|library/.test(f))
    .map((f) => simulateUnwired(root, contentFiles, f)),
};

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const p = (s = '') => process.stdout.write(`${s}\n`);
  p('== Wiring ==');
  p(`loader scripts: ${report.wiring.loaderScripts} | legacy scripts: ${report.wiring.legacyScripts}`);
  p(`content files (load order): ${contentFiles.join(', ')}`);
  p(`load errors: ${errors.length ? JSON.stringify(errors) : 'none'}`);
  p(`english-*.js not wired: ${unwired.length ? unwired.map((f) => `${f}${f in KNOWN_UNWIRED ? ' [documented]' : ' [UNDOCUMENTED]'}`).join(', ') : 'none'}`);
  p('\n== SERAG_* globals ==');
  for (const [k, v] of Object.entries(report.globals)) p(`${k}: ${JSON.stringify(v)}`);
  if (vocab) {
    p('\n== Vocabulary (SERAG_ENGLISH_V9.vocabulary after all content files) ==');
    p(`rows: ${vocab.total} | valid: ${vocab.valid} | invalid: ${vocab.invalid} | unique normalised terms: ${vocab.unique}`);
    p(`duplicated terms (${vocab.duplicates.length}): ${vocab.duplicates.map((d) => `${d.term} [${d.categories.join(' | ')}]`).join('; ') || 'none'}`);
    p(`hyphenated terms (${vocab.hyphenated.length}): ${vocab.hyphenated.join(', ') || 'none'}`);
    p('categories:');
    for (const c of report.vocabulary.categories) p(`  ${String(c.count).padStart(4)}  ${c.name}${c.inDailyRotation ? '' : '   <-- not read by daily rotation'}`);
  }
  p('\n== Grammar ==');
  p(JSON.stringify(report.grammar));
  p('\n== Questions ==');
  for (const q of report.questions) p(`${q.source}: ${q.count} | dup ids: ${q.duplicateIds.length} | answer not in options: ${q.answerNotInOptions.length} | dup options: ${q.duplicateOptions.length} | empty explanation: ${q.emptyExplanation}`);
  if (report.unwiredPatchSimulation.length) {
    p('\n== What an unwired patch WOULD add (simulated in a sandbox, nothing is changed) ==');
    for (const s of report.unwiredPatchSimulation) p(JSON.stringify(s, null, 2));
  }
}
