import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dataPath = path.join(root, 'engoplay-grammar-batches-2-5.json');
const loaderPath = path.join(root, 'engoplay-grammar-batch-bank-v1.js');

function createContext({ failFetch = false } = {}) {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const window = {
    addEventListener() {},
    SERAG_GRAMMAR_V10: [],
    SERAG_SUPPLEMENT_V13: { lessons: [], questions: [] }
  };
  const document = {
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement() { return {}; }
  };
  window.document = document;
  const sandbox = {
    window,
    document,
    localStorage: { getItem() { return null; }, setItem() {} },
    console: { warn() {}, log() {}, error() {} },
    setInterval() { return 0; },
    clearInterval() {},
    setTimeout() { return 0; },
    addEventListener() {},
    fetch: async () => {
      if (failFetch) throw new Error('fixture network failure');
      return { ok: true, status: 200, json: async () => data };
    }
  };
  vm.createContext(sandbox);
  return { sandbox, window };
}

test('source export contains only available batches 2–5 and IDs 51–250', () => {
  const topics = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert.equal(topics.length, 20);
  assert.deepEqual(topics.map(t => t.topic_id), Array.from({ length: 20 }, (_, i) => i + 6));
  const questions = topics.flatMap(t => t.practice_questions);
  assert.equal(questions.length, 200);
  assert.deepEqual(questions.map(q => q.question_id).sort((a, b) => a - b), Array.from({ length: 200 }, (_, i) => i + 51));
  assert.ok(!questions.some(q => q.question_id <= 50));
});

test('loader adds 20 lessons and 200 unique compatible questions without replacing existing content', async () => {
  const { sandbox, window } = createContext();
  window.SERAG_GRAMMAR_V10.push({ id: 'existing-lesson', level: 'A1', title: 'Existing lesson' });
  window.SERAG_SUPPLEMENT_V13.lessons.push({ id: 'existing-supplement', level: 'A1', title: 'Existing supplement' });
  window.SERAG_SUPPLEMENT_V13.questions.push({
    id: 'existing-question', topic: 'existing-supplement', level: 'A1',
    prompt: 'Existing question?', options: ['Yes', 'No'], answer: 'Yes', explanation: 'Existing explanation.'
  });
  vm.runInContext(fs.readFileSync(loaderPath, 'utf8'), sandbox, { filename: loaderPath });
  const status = await window.SERAG_GRAMMAR_BATCH_BANK_V1_READY;
  assert.equal(status.status, 'ready');
  assert.equal(status.topicCount, 20);
  assert.equal(status.questionCount, 200);
  assert.equal(status.questionsAdded, 200);
  assert.deepEqual(Array.from(status.missingBatches), [1]);
  assert.equal(window.SERAG_GRAMMAR_V10.length, 21);
  assert.equal(window.SERAG_SUPPLEMENT_V13.lessons.length, 21);
  assert.equal(window.SERAG_SUPPLEMENT_V13.questions.length, 201);
  const imported = window.SERAG_SUPPLEMENT_V13.questions.filter(q => q.id.startsWith('engoplay-grammar-batch-q'));
  assert.equal(imported.length, 200);
  assert.equal(new Set(imported.map(q => q.id)).size, 200);
  for (const q of imported) {
    assert.ok(q.id);
    assert.ok(q.topic.startsWith('grammar-batch-topic-'));
    assert.ok(['A1', 'A2', 'B1', 'B2'].includes(q.level));
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.answer), q.id);
    assert.ok(q.explanation.trim(), q.id);
  }
  for (const lesson of window.SERAG_GRAMMAR_V10.filter(g => g.id.startsWith('grammar-batch-topic-'))) {
    assert.ok(lesson.summary);
    assert.ok(lesson.formula);
    assert.ok(lesson.examples.length >= 5);
    assert.ok(lesson.mistake);
    assert.ok(lesson.tip.includes('الشرح بالعربية'));
  }
});

test('documented ambiguous questions are clarified during import only', async () => {
  const { sandbox, window } = createContext();
  vm.runInContext(fs.readFileSync(loaderPath, 'utf8'), sandbox);
  await window.SERAG_GRAMMAR_BATCH_BANK_V1_READY;
  const byId = id => window.SERAG_SUPPLEMENT_V13.questions.find(q => q.sourceQuestionId === id);
  assert.match(byId(193).prompt, /told.*personal object/i);
  assert.match(byId(193).explanation, /said to me.*grammatical/i);
  assert.match(byId(223).explanation, /When a verb follows a preposition/i);
  assert.match(byId(228).prompt, /UNSPLIT negative to-infinitive/i);
  assert.equal(byId(228).answer, 'not to eat');
  assert.match(byId(240).prompt, /Present Perfect Simple/i);
  assert.equal(byId(240).answer, 'has eaten');
  assert.match(byId(199).prompt, /standard atmospheric pressure/i);
  assert.match(byId(201).prompt, /standard atmospheric pressure/i);
  assert.match(byId(243).prompt, /PAST PERFECT CONTINUOUS form/i);
});

test('loading the bank twice is idempotent', async () => {
  const { sandbox, window } = createContext();
  const source = fs.readFileSync(loaderPath, 'utf8');
  vm.runInContext(source, sandbox);
  await window.SERAG_GRAMMAR_BATCH_BANK_V1_READY;
  vm.runInContext(source, sandbox);
  const status = await window.SERAG_GRAMMAR_BATCH_BANK_V1_READY;
  assert.equal(status.status, 'ready');
  assert.equal(status.questionsAdded, 0);
  assert.equal(window.SERAG_GRAMMAR_V10.filter(g => g.id.startsWith('grammar-batch-topic-')).length, 20);
  assert.equal(window.SERAG_SUPPLEMENT_V13.questions.filter(q => q.id.startsWith('engoplay-grammar-batch-q')).length, 200);
});

test('bank loading fails closed and leaves existing academy data intact when the asset is unavailable', async () => {
  const { sandbox, window } = createContext({ failFetch: true });
  window.SERAG_GRAMMAR_V10.push({ id: 'existing', level: 'A1', title: 'Existing' });
  window.SERAG_SUPPLEMENT_V13.questions.push({ id: 'keep', options: ['yes'], answer: 'yes' });
  vm.runInContext(fs.readFileSync(loaderPath, 'utf8'), sandbox, { filename: loaderPath });
  const status = await window.SERAG_GRAMMAR_BATCH_BANK_V1_READY;
  assert.equal(status.status, 'unavailable');
  assert.equal(window.SERAG_GRAMMAR_V10.length, 1);
  assert.equal(window.SERAG_SUPPLEMENT_V13.questions.length, 1);
});

test('the existing academy exposes the imported bank through its normal question engine', async (t) => {
  const academyPath = path.join(root, 'english-academy-v12.js');
  if (!fs.existsSync(academyPath)) return t.skip('The local fixture folder contains only the focused import harness; the repository CI runner has the full application source.');
  const { sandbox, window } = createContext();
  vm.runInContext(fs.readFileSync(loaderPath, 'utf8'), sandbox, { filename: loaderPath });
  const status = await window.SERAG_GRAMMAR_BATCH_BANK_V1_READY;
  assert.equal(status.status, 'ready');
  vm.runInContext(fs.readFileSync(academyPath, 'utf8'), sandbox, { filename: 'english-academy-v12.js' });
  const all = window.SERAG_ACADEMY_V12.questions();
  const imported = all.filter(q => q.id.startsWith('engoplay-grammar-batch-q'));
  assert.equal(imported.length, 200);
  assert.equal(new Set(imported.map(q => q.id)).size, 200);
  assert.ok(imported.every(q => q.options.includes(q.answer)));
  assert.equal(window.SERAG_ACADEMY_V12.lessons().filter(g => g.id.startsWith('grammar-batch-topic-')).length, 20);
});

test('bootstrap loads the bank before the academy and waits for its read-only import', (t) => {
  const bootstrapPath = path.join(root, 'app-bootstrap.js');
  if (!fs.existsSync(bootstrapPath)) return t.skip('The local fixture folder does not contain application bootstrap source; the repository CI runner has it.');
  const bootstrap = fs.readFileSync(bootstrapPath, 'utf8');
  const bankScript = bootstrap.indexOf('engoplay-grammar-batch-bank-v1.js');
  const academyScript = bootstrap.indexOf('english-academy-v12.js');
  assert.ok(bankScript >= 0 && academyScript > bankScript, 'grammar bank must load before the academy');
  assert.match(bootstrap, /SERAG_GRAMMAR_BATCH_BANK_V1_READY/);
  assert.match(bootstrap, /engoplay-grammar-batch-bank-v1[.]js/);
});


test('EngoPlay mixed practice displays an imported grammar question and records wrong-then-correct review progress', async () => {
  const { sandbox, window } = createContext();
  let syncedAttempts = [];
  window.ENGOPLAY = {
    stats() {
      return {
        answeredToday: new Set(),
        answeredKeys: new Set(),
        lastAnsweredAt: new Map(),
        questionStats: new Map(),
        correctKeys: new Set(),
        current: 0,
        totalXP: 0
      };
    },
    track(attempt) { syncedAttempts.push({ ...attempt }); },
    scheduleWord() {}
  };
  window.SERAG_ENGLISH_V9 = {
    vocabulary: [
      ['project', 'a planned piece of work', 'Work', 'I planned a project today.'],
      ['report', 'a written account', 'Work', 'I finished the report today.'],
      ['client', 'a customer', 'Work', 'I called the client today.'],
      ['meeting', 'a planned discussion', 'Work', 'I joined the meeting today.']
    ]
  };

  vm.runInContext(fs.readFileSync(loaderPath, 'utf8'), sandbox, { filename: loaderPath });
  const imported = await window.SERAG_GRAMMAR_BATCH_BANK_V1_READY;
  assert.equal(imported.status, 'ready');

  vm.runInContext(fs.readFileSync(path.join(root, 'english-academy-v12.js'), 'utf8'), sandbox, { filename: 'english-academy-v12.js' });
  const grammarQuestion = window.SERAG_ACADEMY_V12.questions().find(q =>
    q.id === 'engoplay-grammar-batch-q151'
  );
  assert.ok(grammarQuestion, 'Q151 should be available through the academy question engine');

  vm.runInContext(fs.readFileSync(path.join(root, 'word-practice-v21.js'), 'utf8'), sandbox, { filename: 'word-practice-v21.js' });
  const practice = window.SERAG_WORD_PRACTICE;
  assert.ok(practice, 'the existing Word Practice engine should be available');

  practice.startJourney([grammarQuestion.id], 'Grammar integration test', [], true);
  let current = practice.currentQuestion();
  assert.equal(current.kind, 'recognition', 'the mixed session begins with vocabulary exposure');
  practice.respond(current.answer);
  assert.equal(practice.next(), true);

  current = practice.currentQuestion();
  assert.equal(current.kind, 'grammar', 'the imported grammar question should be inserted into mixed practice');
  assert.equal(current.grammar.id, grammarQuestion.id);
  assert.equal(current.options.length, 4);
  assert.ok(current.options.includes(current.answer));

  const wrong = current.options.find(option => option !== current.answer);
  assert.equal(practice.check(current, wrong), false, 'punctuation and capitalization differences must remain meaningful in grammar MCQs');
  assert.equal(practice.check(current, current.answer), true);
  practice.respond(wrong);
  let attempts = window.SERAG_ACADEMY_V12.homeState().attempts.filter(row => row.id === grammarQuestion.id);
  assert.equal(attempts.length, 1, 'the first wrong response should be recorded');
  assert.equal(attempts[0].correct, false);
  assert.equal(syncedAttempts.at(-1).correct, false);

  practice.respond(current.answer);
  attempts = window.SERAG_ACADEMY_V12.homeState().attempts.filter(row => row.id === grammarQuestion.id);
  assert.equal(attempts.length, 2, 'the corrected retry should remain visible as a separate attempt');
  assert.equal(attempts[0].correct, false);
  assert.equal(attempts[1].correct, true);
  const card = window.SERAG_ACADEMY_V12.homeState().cards[grammarQuestion.id];
  assert.equal(card.stage, 1, 'the correct retry should enter the existing spaced-review schedule');
  assert.equal(card.wrong, true, 'the earlier mistake should remain flagged for review');
  assert.equal(syncedAttempts.at(-1).correct, true, 'the corrected answer should update EngoPlay activity tracking');
});
