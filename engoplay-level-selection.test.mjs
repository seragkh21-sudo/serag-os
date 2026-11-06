import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=name=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
const academy=source('english-academy-v12.js'),engoplay=source('engoplay-v19.js');
const css=source('english-pathways-v1.css');
const overviewCode=academy.slice(academy.indexOf('function overviewHTML()'),academy.indexOf('function pathHTML('));
const startDailyCode=engoplay.slice(engoplay.indexOf('function startDaily()'),engoplay.indexOf('function startPractice(',engoplay.indexOf('function startDaily()')));

function renderHome(level){
  return new Function('state','session','pathways','due',overviewCode+';return overviewHTML()')({level},null,[],()=>[]);
}
function startFor(level,pilot,available,building=[]){
  let received;
  const win={SERAG_ADVANCED_BATCH01_V1:pilot,SERAG_ENGOPLAY_QUESTS_V1:{getDailyPracticeQuestions:()=>building}};
  new Function('window','a','level','startPractice',startDailyCode+';return startDaily')(
    win,()=>({questions:()=>available}),()=>level,(ids,title,sentences,daily)=>{received={ids,title,sentences,daily}}
  )();
  return received;
}

test('English overview prominently offers B1 B2 C1 C2 with one active selection',()=>{
  for(const level of ['B1','B2','C1','C2']){
    const html=renderHome(level);
    for(const option of ['B1','B2','C1','C2']){
      assert.ok(html.includes('data-ea-level-pick="'+option+'"'),option+' should be visible');
    }
    assert.ok(html.includes('data-ea-level-pick="'+level+'" aria-pressed="true"'));
    assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
    assert.ok(html.indexOf('epath-level-switch')<html.indexOf('class="epath-hero"'));
  }
});

test('daily questions and word-order tasks follow the selected practice level',()=>{
  const pilot={status:'ready',questions:[{id:'p1',level:'B1'},{id:'p2',level:'B2'}],
    sentenceBuild:[{id:'s1',level:'B1'},{id:'s2',level:'B2'}]};
  const existing=['B1','B2','C1','C2','A1'].map(level=>({id:'legacy-'+level,level}));
  const prior=['C1','C2'].map(level=>({id:'sentence-'+level,level}));
  const expected={B1:['p1','s1'],B2:['p2','s2'],C1:['legacy-C1','sentence-C1'],C2:['legacy-C2','sentence-C2']};
  for(const level of ['B1','B2','C1','C2']){
    const outcome=startFor(level,pilot,existing,prior);
    assert.deepEqual(outcome.ids,[expected[level][0]]);
    assert.deepEqual(outcome.sentences.map(x=>x.id),[expected[level][1]]);
    assert.ok(outcome.title.startsWith(level));
    assert.equal(outcome.daily,true);
  }
});

test('old banks stay available when advanced pilot is missing',()=>{
  const old=[{id:'C1-legacy',level:'C1'},{id:'A1-legacy',level:'A1'}];
  const outcome=startFor('C1',{status:'unavailable'},old,[]);
  assert.deepEqual(outcome.ids,['C1-legacy']);
});

test('level persists through the existing profile preference flow',()=>{
  assert.match(academy,/window\.ENGOPLAY\?\.setPracticeLevel\?\.\(state\.level\)/);
  assert.match(engoplay,/setPracticeLevel\(value\)/);
  assert.match(engoplay,/preference\('english_level',value\)/);
  assert.match(academy,/querySelectorAll\('\[data-ea-level-pick\]'\)/);
  assert.match(css,/\.epath-level-options button\[aria-pressed="true"\]/);
  assert.match(css,/@media\(max-width:600px\)\{\.epath \.epath-level-switch/);
});

test('fresh English assets use consistent version',()=>{
  assert.match(source('app-bootstrap.js'),/const V='79'/);
  assert.match(source('index.html'),/app-bootstrap\.js\?v=79/);
  assert.match(source('sw.js'),/serag-os-static-v79/);
  assert.match(source('workspace-preview.html'),/workspace-preview-v18\.js\?v=79/);
});
