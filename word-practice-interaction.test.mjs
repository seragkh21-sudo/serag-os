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
