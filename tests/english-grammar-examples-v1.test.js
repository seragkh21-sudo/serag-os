import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function load() {
  const window = { addEventListener() {}, localStorage:{getItem(){return null},setItem(){}} };
  window.window = window;
  const context = { window, document:{addEventListener(){},getElementById(){return null}}, setInterval(){return 0} };
  vm.createContext(context);
  for (const path of [
    'english-grammar-v10.js',
    'english-supplement-v13.js',
    'english-writing-v13.js',
    'english-levels-v14.js',
    'english-source-curriculum-v1.js',
    'english-grammar-examples-v1.js'
  ]) vm.runInContext(read(path), context, {filename:path});
  return window;
}

test('grammar example bank aggregates examples from existing Serag rules without mutating them', () => {
  const w = load();
  const api = w.SERAG_GRAMMAR_EXAMPLES_V1;
  assert.equal(api.version, 1);
  const rows = api.getExamples();
  assert.ok(rows.length >= 150, 'expected examples from core, supplementary, advanced and source curriculum lessons');
  assert.ok(api.getLessons().length >= 40);
  assert.equal(new Set(rows.map(row=>row.id)).size, rows.length);
  for (const row of rows) {
    assert.ok(row.lessonId && row.title && row.titleAr && row.sentence && row.summary);
    assert.ok(['A1','A2','B1','B2','C1','C2'].includes(row.level), row.id + ': ' + row.level);
  }
  assert.equal(w.SERAG_GRAMMAR_V10.some(g=>g.id==='articles'), true);
});

test('filters support grammar topic, CEFR level, and free-text query', () => {
  const api=load().SERAG_GRAMMAR_EXAMPLES_V1;
  const all=api.getExamples();
  const articles=api.filter({topic:'articles'});
  assert.ok(articles.length>0);
  assert.ok(articles.every(row=>row.lessonId==='articles'));
  const b1=api.filter({level:'B1'});
  assert.ok(b1.length>0 && b1.every(row=>row.level==='B1'));
  const meeting=api.filter({query:'meeting'});
  assert.ok(meeting.length>0 && meeting.every(row=>[row.sentence,row.title,row.titleAr,row.summary,row.formula,row.mistake,row.tip].join(' ').toLowerCase().includes('meeting')));
  assert.equal(api.getExamples().length,all.length);
});

test('the examples library links the official SCoRE resource without importing its separately licensed corpus', () => {
  const api=load().SERAG_GRAMMAR_EXAMPLES_V1;
  const html=api.html();
  assert.match(html,/https:\/\/score\.ddl-study\.org\/en\//);
  assert.match(html,/CC BY-NC-SA 4\.0/);
  assert.match(html,/seragGrammarExamples/);
  assert.match(html,/class="ege-sentence"/, 'the first examples should render immediately');
  assert.match(html,/id="egeCards">[^<]/);
});

test('loader and navigation expose the examples bank in English and EngoPlay', () => {
  const loader=read('shell-loader.js');
  const index=read('index.html');
  const academy=read('english-academy-v12.js');
  const engoplay=read('engoplay-v19.js');
  assert.match(loader,/english-grammar-examples-v1\.css/);
  assert.match(loader,/english-grammar-examples-v1\.js/);
  assert.match(academy,/\['examples'/);
  assert.match(academy,/SERAG_GRAMMAR_EXAMPLES_V1\?\.html\(\)/);
  assert.match(engoplay,/data-ea-tab="examples"/);
  assert.match(index,/shell-loader\.js\?v=47/);
});