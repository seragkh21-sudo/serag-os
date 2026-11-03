import test from 'node:test';
import assert from 'node:assert/strict';
import { findRoot, loadFiles } from './english-harness.mjs';

const root = findRoot();

test('sentence-building examples rotate between sessions and avoid the previous session', () => {
  const { ctx, errors } = loadFiles(root, ['engoplay-quests-v1.js']);
  assert.deepEqual(errors, [], 'the quest engine should load');
  ctx.SERAG_GRAMMAR_EXAMPLES_V1 = {
    getExamples: () => Array.from({ length: 36 }, (_, index) => ({
      id: 'rotation-example-' + index,
      level: 'B1',
      title: 'Grammar topic ' + (index % 6),
      sentence: 'The creative team reviewed the updated project brief before the final client meeting ' + index + '.',
      summary: 'Review the subject, verb and time expression.'
    }))
  };
  ctx.ENGOPLAY = {
    stats: () => ({ answeredToday: [], lastAnsweredAt: {}, questionStats: {}, totalXP: 0, current: 0 })
  };
  const quests = ctx.SERAG_ENGOPLAY_QUESTS_V1;
  const first = quests.getDailyPracticeQuestions('B1', 2);
  const second = quests.getDailyPracticeQuestions('B1', 2);
  const third = quests.getDailyPracticeQuestions('B1', 2);
  const ids = (rows) => rows.map((row) => row.sourceRow.id);
  assert.equal(first.length, 2);
  assert.equal(second.length, 2);
  assert.equal(third.length, 2);
  assert.equal(ids(first).some((id) => ids(second).includes(id)), false);
  assert.equal(ids(second).some((id) => ids(third).includes(id)), false);
  assert.equal(JSON.parse(ctx.localStorage.getItem('seragEngoplayQuestV1:guest')).practiceSessionSequence, 3);
});
