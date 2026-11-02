import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const uiFiles = [
  'engoplay-v19.js',
  'engoplay-quests-v1.js',
  'word-practice-v21.js',
  'english-learning-v6.js',
  'english-academy-v12.js',
  'english-reading-library-v1.js',
  'english-reading-studio-v2.js',
  'english-grammar-examples-v1.js',
  'english-mistakes-bank-v1.js',
  'english-tatoeba-explorer-v1.js',
  'english-writing-v13.js',
  'english-writing-flow-v1.js',
  'english-grammar-v10.js',
  'english-supplement-v13.js'
];

test('English learning interface copy stays English across active UI modules', () => {
  for (const file of uiFiles) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /[\u0600-\u06FF]/, file + ' contains Arabic UI copy');
  }
});
