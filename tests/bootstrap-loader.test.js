import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('index loads Supabase in the head and uses the replacement bootstrap',()=>{
  const html=fs.readFileSync('index.html','utf8');
  assert.match(html,/<head>[\s\S]*cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2[\s\S]*<\/head>/);
  assert.match(html,/app-bootstrap\.js/);
  assert.doesNotMatch(html,/shell-loader\.js/);
});

test('bootstrap has no document.write call and executes scripts in order',()=>{
  const source=fs.readFileSync('app-bootstrap.js','utf8');
  assert.doesNotMatch(source,/document\.(?:open|write|close)\s*\(/);
  assert.match(source,/for\s*\(const source of pendingScripts\)/);
  assert.match(source,/script\.async\s*=\s*false/);
});

test('app publishes Supabase client and authenticated user on window',()=>{
  const source=fs.readFileSync('app.js','utf8');
  assert.match(source,/window\.sb\s*=\s*window\.supabase\.createClient/);
  assert.match(source,/window\.user\s*=\s*null/);
});

test('bootstrap cache-busts every local asset from one version constant',()=>{
  const source=fs.readFileSync('app-bootstrap.js','utf8');
  assert.match(source,/const V='57'/);
  assert.doesNotMatch(source,/\/(?:[\w-]+)\.(?:js|css)\?v=\d+/);
});
