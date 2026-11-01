import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('index uses the replacement bootstrap and legacy loads the pinned Supabase client',()=>{
  const html=fs.readFileSync('index.html','utf8');
  const legacy=fs.readFileSync('legacy.html','utf8');
  assert.doesNotMatch(html,/cdn\\.jsdelivr\\.net\\/npm\\/@supabase\\/supabase-js/);
  assert.match(html,/app-bootstrap\\.js/);
  assert.doesNotMatch(html,/shell-loader\\.js/);
  assert.match(legacy,/@supabase\\/supabase-js@2\\.116\\.0/);
});
test('bootstrap preserves Supabase and executes dependency scripts in order',()=>{
  const source=fs.readFileSync('app-bootstrap.js','utf8');
  assert.doesNotMatch(source,/document\.(?:open|write|close)\s*\(/);
  assert.match(source,/for\s*\(const source of pendingScripts\)/);
  assert.match(source,/script\.async\s*=\s*false/);
  assert.doesNotMatch(source,/parsed\.querySelector[^\n]*supabase-js[^\n]*remove/);
});

test('app publishes Supabase client and authenticated user on window',()=>{
  const source=fs.readFileSync('app.js','utf8');
  assert.match(source,/sb=window\.sb=window\.supabase\.createClient/);
  assert.match(source,/var sb = null;[\s\S]*var user = null;/);
  assert.match(source,/user=window\.user=session\?\.user\|\|null/);
});

test('bootstrap cache-busts every local asset from one version constant',()=>{
  const source=fs.readFileSync('app-bootstrap.js','utf8');
  assert.match(source,/const V='60'/);
  assert.match(source,/app\.js\?v=\$\{V\}/);
  assert.doesNotMatch(source,/\/(?:[\w-]+)\.(?:js|css)\?v=\d+/);
});
