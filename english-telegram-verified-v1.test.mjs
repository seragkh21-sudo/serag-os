import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=path=>readFileSync(new URL('./'+path,import.meta.url),'utf8');
const source=read('english-telegram-verified-v1.js');

function load() {
  const window={SERAG_ENGLISH_EXPANSION_V1:{questions:[]}};
  runInNewContext(source,{window});
  return window;
}

test('reviewed Telegram batch is valid, unique and source-traceable',()=>{
  const window=load(),rows=window.SERAG_ENGLISH_EXPANSION_V1.questions;
  assert.equal(window.SERAG_TELEGRAM_IMPORT_V1.reviewed,104);
  assert.equal(rows.length,104);
  assert.equal(new Set(rows.map(q=>q.id)).size,rows.length);
  for(const q of rows){
    assert.match(q.id,/^telegram:message\\d+$/);
    assert.ok(['B1','B2'].includes(q.level));
    assert.ok(typeof q.prompt==='string'&&q.prompt.length>12);
    assert.ok(Array.isArray(q.options)&&q.options.length>=2);
    assert.ok(q.options.includes(q.answer));
    assert.ok(q.explanation.includes(q.answer));
    assert.ok(q.sourceFile.startsWith('messages')&&q.sourceFile.endsWith('.html'));
    assert.equal(q.sourceMessageId,q.id.slice('telegram:'.length));
    assert.ok(!/[\\u0600-\\u06ff]/u.test(q.prompt));
  }
});

test('Telegram questions are appended idempotently without overwriting existing data',()=>{
  const window=load(),pack=window.SERAG_ENGLISH_EXPANSION_V1;
  runInNewContext(source,{window});
  assert.equal(pack.questions.length,104);
  assert.equal(window.SERAG_TELEGRAM_IMPORT_V1.added,0);
});

test('both English and EngoPlay consume shared Telegram question pool',()=>{
  const loader=read('app-bootstrap.js');
  assert.ok(loader.indexOf('english-telegram-verified-v1.js')>loader.indexOf('english-expansion-v1.js'));
  assert.ok(loader.indexOf('english-telegram-verified-v1.js')<loader.indexOf('english-academy-v12.js'));
  assert.ok(read('workspace-preview-content.html').includes('english-telegram-verified-v1.js'));
  assert.ok(read('english-academy-v12.js').includes('(window.SERAG_ENGLISH_EXPANSION_V1?.questions||[])'));
  assert.ok(read('engoplay-v19.js').includes('a()?.questions()'));
});
