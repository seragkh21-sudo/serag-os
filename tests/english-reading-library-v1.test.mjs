import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

test('reading library is wired into the English reading section and the active shell', () => {
  const academy = read('english-academy-v12.js');
  const loader = read('shell-loader.js');
  const entry = read('index.html');
  const preview = read('workspace-preview-content.html');
  assert.match(academy, /SERAG_READING_LIBRARY_V1\?\.summaryHTML/);
  assert.match(loader, /english-reading-library-v1\.css/);
  assert.match(loader, /english-reading-library-v1\.js/);
  assert.match(entry, /shell-loader\.js\?v=40/);
  assert.match(preview, /english-reading-library-v1\.js/);
});

test('article library supports owner-scoped CRUD, search, reading status and notes', () => {
  const source = read('english-reading-library-v1.js');
  assert.match(source, /from\(TABLE\)\.select\('\*'\)\.eq\('user_id', id\)/);
  assert.match(source, /from\(TABLE\)\.insert/);
  assert.match(source, /from\(TABLE\)\.update/);
  assert.match(source, /from\(TABLE\)\.delete/);
  assert.match(source, /data-erl-filter="favorites"/);
  assert.match(source, /data-erl-save-notes/);
  assert.match(source, /data-erl-complete/);
  assert.match(source, /safeUrl/);
  assert.match(source, /textContent/);
});

test('article table is private and validates content, ownership, status and progress', () => {
  const sql = read('db/english-reading-articles-v1.sql');
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /to authenticated/i);
  assert.match(sql, /\(select auth\.uid\(\)\) = user_id/i);
  assert.match(sql, /grant select, insert, update, delete on public\.english_reading_articles to authenticated/i);
  assert.match(sql, /check \(reading_progress between 0 and 100\)/i);
  assert.match(sql, /check \(status in \('unread','reading','completed'\)\)/i);
  assert.match(sql, /references auth\.users\(id\) on delete cascade/i);
});
