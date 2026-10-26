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
  assert.match(loader, /const V=['"]43['"]/);
  assert.match(loader, /english-reading-library-v1\.js/);
  assert.match(entry, /shell-loader\\.js\\?v=48/);
  assert.match(preview, /english-reading-library-v1\.css\?v=43/);
  assert.match(preview, /english-reading-library-v1\.js\?v=43/);
});

test('article library supports owner-scoped CRUD, search, reading status and notes', () => {
  const source = read('english-reading-library-v1.js');
  const styles = read('english-reading-library-v1.css');
  assert.match(source, /from\(TABLE\)\.select\('\*'\)\.eq\('user_id', id\)/);
  assert.match(source, /from\(TABLE\)\.insert/);
  assert.match(source, /from\(TABLE\)\.update/);
  assert.match(source, /from\(TABLE\)\.delete/);
  assert.match(source, /data-erl-filter="favorites"/);
  assert.match(source, /data-erl-save-notes/);
  assert.match(source, /data-erl-complete/);
  assert.match(source, /safeUrl/);
  assert.match(source, /textContent/);
  assert.match(source, /addEventListener\('submit',[\s\S]*erlEditorForm[\s\S]*saveArticle\(event\)/);
  assert.match(styles, /\.erl-library-card\[hidden\]\{display:none!important;pointer-events:none!important\}/);
});

test('active English Academy mounts the article list inside the selected Reading panel', () => {
  const source = read('english-reading-library-v1.js');
  const mount = source.slice(source.indexOf('  function mount() {'), source.indexOf('  function boot() {'));
  assert.match(mount, /const academyRoot = \$\('#ea12Center'\)/);
  assert.match(mount, /const intro = \$\('\.erl-reading-intro', academyRoot\)/);
  assert.match(mount, /intro\.insertAdjacentHTML\('afterend', libraryHTML\(\)\)/);
  assert.match(mount, /if \(card && !academyRoot\.contains\(card\)\) \{[\s\S]*?card\.remove\(\)/);
  assert.match(mount, /return;[\s\S]*?const article = \$\('#el9Article'\)/);
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

test('article cards show a clear action to open the reading view', () => {
  const source = read('english-reading-library-v1.js');
  const styles = read('english-reading-library-v1.css');
  assert.match(source, /data-erl-open=/);
  assert.match(source, /erl-open-cta/);
  assert.match(source, /افتح المقال واقرأه/);
  assert.match(source, /if \(open\) \{ openReader\(open\.dataset\.erlOpen\); return; \}/);
  assert.match(styles, /\.erl-open-cta\{/);
});
