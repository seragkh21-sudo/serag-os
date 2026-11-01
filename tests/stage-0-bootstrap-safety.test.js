import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('index delegates Supabase loading to the pinned legacy document', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const legacy = fs.readFileSync('legacy.html', 'utf8');
  assert.doesNotMatch(index, /cdn\\.jsdelivr\\.net\\/npm\\/@supabase\\/supabase-js/);
  assert.match(index, /app-bootstrap\\.js/);
  assert.match(legacy, /@supabase\\/supabase-js@2\\.116\\.0/);
});

test('bootstrap keeps required scripts fatal but skips only allowlisted optional enhancements', () => {
  const source = fs.readFileSync('app-bootstrap.js', 'utf8');
  assert.match(source, /optionalScriptPatterns/);
  assert.match(source, /if \\(!isOptional\\) throw scriptError/);
  assert.match(source, /Optional Serag OS enhancement failed to load/);
  assert.match(source, /for \\(const source of pendingScripts\\)/);
  assert.match(source, /script\\.async = false/);
});

test('Sentence Builder dialog defines its own accent token', () => {
  const css = fs.readFileSync('engoplay-quests-v1.css', 'utf8');
  assert.match(css, /\\.eq-quest-dialog\\{--eq-accent:var\\(--ea-accent,#6653cc\\);/);
});
