import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('index delegates Supabase loading to the pinned legacy document', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const legacy = fs.readFileSync('legacy.html', 'utf8');
  assert.equal(index.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js'), false);
  assert.ok(index.includes('app-bootstrap.js'));
  assert.ok(legacy.includes('@supabase/supabase-js@2.116.0'));
});

test('bootstrap keeps required scripts fatal but skips only allowlisted optional enhancements', () => {
  const source = fs.readFileSync('app-bootstrap.js', 'utf8');
  assert.ok(source.includes('optionalScriptPatterns'));
  assert.ok(source.includes('if (!isOptional) throw scriptError'));
  assert.ok(source.includes('Optional Serag OS enhancement failed to load'));
  assert.ok(source.includes('for (const source of pendingScripts)'));
  assert.ok(source.includes('script.async = false'));
});

test('Sentence Builder dialog defines its own accent token', () => {
  const css = fs.readFileSync('engoplay-quests-v1.css', 'utf8');
  assert.ok(css.includes('.eq-quest-dialog{--eq-accent:var(--ea-accent,#6653cc);'));
});
