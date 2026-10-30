import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const js = fs.readFileSync('english-reading-studio-v2.js', 'utf8');
const css = fs.readFileSync('english-reading-studio-v2.css', 'utf8');
const loader = fs.readFileSync('app-bootstrap.js', 'utf8');
const academy = fs.readFileSync('english-academy-v12.js', 'utf8');

test('Reading Studio v2 JavaScript parses before deployment', () => {
  assert.doesNotThrow(() => new vm.Script(js, { filename: 'english-reading-studio-v2.js' }));
});

test('Reading Studio v2 is wired into the actual English reading route', () => {
  assert.match(loader, /english-reading-studio-v2\.css\?v=\$\{V\}/);
  assert.match(loader, /english-reading-studio-v2\.js\?v=\$\{V\}/);
  assert.match(academy, /SERAG_READING_STUDIO_V2\?\.summaryHTML\(\)/);
  assert.match(loader, /const V='60';/);
});

test('Reading Studio keeps the existing private article table and user-scoped writes', () => {
  assert.match(js, /english_reading_articles/);
  assert.match(js, /\.eq\('user_id',owner\)/);
  assert.match(js, /\.eq\('user_id',id\)/);
  assert.match(js, /SERAG_READING_STUDIO_V2/);
  assert.match(js, /data-ers-open/);
  assert.match(js, /data-ers-act="highlight"/);
  assert.match(js, /data-ers-word-deck/);
});

test('reader interactions and responsive controls are present in the new stylesheet', () => {
  for (const selector of ['.ers-studio', '.ers-reader', '.ers-pill', '.ers-card-sheet', '.ers-settings', '.ers-drawer', '.ers-crop', '.ers-body']) {
    assert.ok(css.includes(selector), 'missing CSS selector ' + selector);
  }
  assert.match(css, /@media\(max-width:720px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /body\.ers-active #erlLibraryCard/);
});


test('dictionary lookup is wired after Reading Studio and does not alter database schema', () => {
  const loader = fs.readFileSync('app-bootstrap.js', 'utf8');
  const studio = fs.readFileSync('english-reading-studio-v2.js', 'utf8');
  const dictionary = fs.readFileSync('english-dictionary-v1.js', 'utf8');
  const css = fs.readFileSync('english-dictionary-v1.css', 'utf8');
  assert.ok(loader.includes('english-dictionary-v1.css?v=${V}'));
  assert.ok(loader.indexOf('english-reading-studio-v2.js') < loader.indexOf('english-dictionary-v1.js'));
  assert.ok(studio.includes('data-ers-act="dictionary"'));
  assert.ok(studio.includes('SERAG_DICTIONARY_V1?.open(selectedText,selectedContext)'));
  assert.ok(dictionary.includes('/api/dictionary?word='));
  assert.match(fs.readFileSync('api/dictionary.js', 'utf8'), /const BASE/);
  assert.match(dictionary, /AbortController/);
  assert.match(dictionary, /sessionStorage/);
  assert.match(dictionary, /english_words/);
  assert.ok(css.includes('.ed-dialog'));
  assert.doesNotMatch(fs.readFileSync('vercel.json', 'utf8'), /dictionaryapi/);
});
