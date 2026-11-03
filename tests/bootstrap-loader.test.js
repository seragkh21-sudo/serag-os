import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('index uses the replacement bootstrap and legacy loads the pinned Supabase client',()=>{
  const html=fs.readFileSync('index.html','utf8');
  const legacy=fs.readFileSync('legacy.html','utf8');
  assert.equal(html.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js'),false);
  assert.ok(html.includes('app-bootstrap.js?v=66'));
  assert.equal(html.includes('shell-loader.js'),false);
  assert.ok(legacy.includes('@supabase/supabase-js@2.116.0'));
});

test('bootstrap preserves Supabase and executes dependency scripts in order',()=>{
  const source=fs.readFileSync('app-bootstrap.js','utf8');
  assert.equal(source.includes('document.write('),false);
  assert.ok(source.includes('for (const source of pendingScripts)'));
  assert.ok(source.includes('script.async = false'));
  assert.equal(source.includes(`parsed.querySelector('script[src*="supabase-js"]')?.remove()`),false);
});

test('app publishes Supabase client and authenticated user on window',()=>{
  const source=fs.readFileSync('app.js','utf8');
  assert.ok(source.includes('sb=window.sb=window.supabase.createClient'));
  assert.ok(source.includes('var sb = null;'));
  assert.ok(source.includes('var user = null;'));
  assert.ok(source.includes('user=window.user=session?.user||null'));
});

test('bootstrap cache-busts every local asset from one version constant',()=>{
  const source=fs.readFileSync('app-bootstrap.js','utf8');
  assert.ok(source.includes("const V='66'"));
  assert.ok(source.includes('app.js?v=${V}'));
  assert.equal(source.includes('.js?v=64'),false);
  assert.equal(source.includes('.css?v=64'),false);
});
