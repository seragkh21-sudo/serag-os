import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { findRoot, loadFiles } from './english-harness.mjs';

const root = findRoot();

test('interactive practice highlights a wrong choice and the correct answer without replacing the shared engine', () => {
  const { ctx, errors } = loadFiles(root, ['word-practice-v21.js']);
  assert.deepEqual(errors, [], 'the existing practice engine must load');
  ctx.SERAG_ENGLISH_V9 = {
    vocabulary: [
      ['carry out', 'perform', 'Work & Office', 'We must carry out the review before launch.', 'neutral'],
      ['follow up', 'contact again', 'Work & Office', 'I will follow up with the client tomorrow.', 'neutral'],
      ['set up', 'arrange', 'Work & Office', 'We need to set up the new project today.', 'neutral'],
      ['look into', 'investigate', 'Work & Office', 'The team will look into the issue this afternoon.', 'neutral'],
    ],
  };

  const engine = ctx.SERAG_WORD_PRACTICE;
  engine.start();
  const question = engine.currentQuestion();
  assert.equal(question.kind, 'recognition');
  const wrong = question.options.find((option) => option !== question.answer);
  engine.respond(wrong);

  let markup = engine.html();
  assert.match(markup, /class="wp-option[^"]*is-wrong[^"]*is-selected/);
  assert.match(markup, /class="wp-option[^"]*is-correct/);
  assert.match(markup, /correct option is highlighted/i);
  assert.match(markup, /aria-pressed="true"/);

  engine.respond(question.answer);
  markup = engine.html();
  assert.match(markup, /data-wp-next/);
  assert.match(markup, /class="wp-next-label">Continue<\/span>/);
  assert.match(markup, /class="wp-next-arrow" aria-hidden="true">→<\/span>/);
  assert.match(markup, /class="wp-option[^"]*is-correct/);
  assert.match(markup, /Correct after a hint or retry/i);
  assert.equal(engine.currentQuestion().item.phrase, question.item.phrase, 'answer feedback must not skip to the next question');
  assert.equal(engine.next(), true, 'Continue advances the session');
  assert.notEqual(engine.currentQuestion().item.phrase, question.item.phrase, 'Continue moves to a different question');
});

test('interactive learning styles include mobile, focus-visible and reduced-motion support', () => {
  const css = fs.readFileSync(path.join(root, 'engoplay-quests-v1.css'), 'utf8');
  assert.match(css, /\.wp-option\.is-wrong/);
  assert.match(css, /\.wp-option\.is-correct/);
  assert.match(css, /\.wp-build-workspace/);
  assert.match(css, /\.wp-build-tile/);
  assert.match(css, /\.wp-next-row button\[data-wp-next\] \.wp-next-label/);
  assert.match(css, /Comfort pass: quieter greens/);
  assert.match(css, /box-shadow:0 2px 9px rgba\(111,99,157,.14\)!important/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  const source = fs.readFileSync(path.join(root, 'word-practice-v21.js'), 'utf8');
  assert.match(source, /function patchPracticeNode\(/);
  assert.match(source, /patchPracticeDOM\(host,html\(\)\)/);
});


test('Build the sentence uses tappable word tiles and supports removing a selected tile', () => {
  const { ctx, errors } = loadFiles(root, ['word-practice-v21.js']);
  assert.deepEqual(errors, []);
  ctx.SERAG_ENGLISH_V9 = { vocabulary: [
    ['carry out', 'perform', 'Work & Office', 'We must carry out the review before launch.', 'neutral'],
    ['follow up', 'contact again', 'Work & Office', 'I will follow up with the client tomorrow.', 'neutral'],
    ['set up', 'arrange', 'Work & Office', 'We need to set up the new project today.', 'neutral'],
    ['look into', 'investigate', 'Work & Office', 'The team will look into the issue this afternoon.', 'neutral'],
  ] };
  const examples = [
    { id:'tap-build-1', answer:'We need to review the final design today.', tokens:'We need to review the final design today.'.split(' '), prompt:'Arrange the words.', explanation:'Place the subject before the verb.' },
    { id:'tap-build-2', answer:'The client approved the updated campaign yesterday.', tokens:'The client approved the updated campaign yesterday.'.split(' '), prompt:'Arrange the words.', explanation:'Place the time expression naturally.' },
  ];
  const engine=ctx.SERAG_WORD_PRACTICE;
  engine.startJourney([], 'Today’s practice', examples, true);
  const first=engine.currentQuestion();
  assert.equal(first.kind,'recognition');
  engine.respond(first.answer);
  assert.equal(engine.next(),true);
  const q=engine.currentQuestion();
  assert.equal(q.kind,'build');
  let markup=engine.html();
  assert.match(markup,/data-wp-build-word=/);
  assert.match(markup,/data-wp-build-check/);
  assert.doesNotMatch(markup,/<form data-wp-form>/);
  const used=new Set();
  const order=q.answer.split(/\s+/).map(token=>{
    const index=q.words.findIndex((word,i)=>!used.has(i)&&engine.norm(word)===engine.norm(token));
    assert.notEqual(index,-1);
    used.add(index);
    return index;
  });
  engine.selectBuildWord(order[0]);
  engine.selectBuildWord(order[1]);
  assert.equal(engine.removeBuildWord(1),true);
  engine.selectBuildWord(order[1]);
  for(const index of order.slice(2)) engine.selectBuildWord(index);
  assert.match(engine.html(),/data-wp-build-remove=/);
  assert.equal(engine.checkBuild(),true);
  assert.match(engine.html(),/data-wp-next/);
});

test('daily grammar questions rotate through the full eligible pool', () => {
  const { ctx, errors } = loadFiles(root, ['word-practice-v21.js']);
  assert.deepEqual(errors,[]);
  ctx.SERAG_ENGLISH_V9 = { vocabulary: [
    ['carry out', 'perform', 'Work & Office', 'We must carry out the review before launch.', 'neutral'],
    ['follow up', 'contact again', 'Work & Office', 'I will follow up with the client tomorrow.', 'neutral'],
    ['set up', 'arrange', 'Work & Office', 'We need to set up the new project today.', 'neutral'],
    ['look into', 'investigate', 'Work & Office', 'The team will look into the issue this afternoon.', 'neutral'],
  ] };
  ctx.ENGOPLAY={stats:()=>({answeredToday:[],lastAnsweredAt:{},questionStats:{}})};
  ctx.SERAG_ACADEMY_V12={selectQuestions:(rows,kind,limit)=>rows.slice(0,limit)};
  const grammar=Array.from({length:8},(_,i)=>({id:'rotation-'+i,prompt:'Choose form '+i,answer:'a'+i,options:['a'+i,'b'+i],topic:'topic-'+(i%4)}));
  const engine=ctx.SERAG_WORD_PRACTICE, words=engine.items().slice(0,4);
  const first=engine.buildRound(words,grammar,4,[],true,1).filter(q=>q.kind==='grammar').map(q=>q.grammar.id);
  const second=engine.buildRound(words,grammar,4,[],true,2).filter(q=>q.kind==='grammar').map(q=>q.grammar.id);
  assert.equal(first.length,2);assert.equal(second.length,2);
  assert.notDeepEqual(first,second);
});
