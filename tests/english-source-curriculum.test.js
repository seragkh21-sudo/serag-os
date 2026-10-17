import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../english-source-curriculum-v1.js', import.meta.url), 'utf8');

function loadFixture() {
  const window = {
    SERAG_GRAMMAR_V10: [{ id: 'existing-lesson', title: 'Existing lesson' }],
    SERAG_SUPPLEMENT_V13: { questions: [{ id: 'existing-question' }] },
    SERAG_WRITING_V13: { drills: [{ id: 'existing-drill' }] }
  };
  runInNewContext(source, { window });
  return window;
}

test('source curriculum adds original lessons, questions, and writing drills without replacing existing data', () => {
  const window = loadFixture();
  const data = window.SERAG_SOURCE_CURRICULUM_V1;
  assert.ok(data);
  assert.ok(data.lessons.length >= 6);
  assert.ok(data.questions.length >= 4);
  assert.ok(data.drills.length >= 5);
  assert.equal(window.SERAG_GRAMMAR_V10[0].id, 'existing-lesson');
  assert.equal(window.SERAG_SUPPLEMENT_V13.questions[0].id, 'existing-question');
  assert.equal(window.SERAG_WRITING_V13.drills[0].id, 'existing-drill');
  assert.equal(window.SERAG_GRAMMAR_V10.length, 1 + data.lessons.length);
  assert.equal(window.SERAG_SUPPLEMENT_V13.questions.length, 1 + data.questions.length);
  assert.equal(window.SERAG_WRITING_V13.drills.length, 1 + data.drills.length);
});

test('all added content has stable unique IDs and valid answer structures', () => {
  const { SERAG_SOURCE_CURRICULUM_V1: data } = loadFixture();
  for (const collection of [data.lessons, data.questions, data.drills]) {
    const ids = collection.map(item => item.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.every(id => typeof id === 'string' && id.startsWith('src-') || id.startsWith('source-') || id.startsWith('collins-') || id.startsWith('compact-')));
  }
  for (const lesson of data.lessons) {
    assert.ok(lesson.title && lesson.titleAr && lesson.summary && lesson.tip);
    assert.ok(Array.isArray(lesson.examples) && lesson.examples.length >= 2);
    assert.ok(Array.isArray(lesson.quiz) && lesson.quiz.length >= 3);
  }
  for (const question of data.questions) {
    assert.ok(question.prompt && question.answer && Array.isArray(question.options));
    assert.ok(question.options.includes(question.answer));
    assert.ok(question.explanation);
  }
  for (const drill of data.drills) {
    assert.ok(drill.title && drill.prompt && drill.model && Array.isArray(drill.steps) && Array.isArray(drill.checks));
    assert.ok(Number.isFinite(drill.minutes) && drill.minutes > 0);
  }
});

test('curriculum includes source attribution for all three uploaded books', () => {
  const { SERAG_SOURCE_CURRICULUM_V1: data } = loadFixture();
  assert.equal(data.sourceBooks.length, 3);
  assert.match(data.sourceBooks.map(book => book.title).join(' '), /Writing for IELTS/);
  assert.match(data.sourceBooks.map(book => book.title).join(' '), /Intermediate Grammar/);
  assert.match(data.sourceBooks.map(book => book.title).join(' '), /Compact Advanced Workbook/);
});
