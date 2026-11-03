/* EngoPlay Grammar Bank v1
   Read-only import of original Batches 2–5 plus a clearly labeled, source-based rebuilt Batch 1.
   The rebuilt first batch is not the missing original NotebookLM export.
*/
(() => {
  'use strict';
  const DATA_URL = '/engoplay-grammar-batches-2-5.json';
  const REBUILT_DATA_URL = '/engoplay-grammar-rebuilt-batch-1.json';
  const TOPIC_PREFIX = 'grammar-batch-topic-';
  const QUESTION_PREFIX = 'engoplay-grammar-batch-q';
  const REBUILT_QUESTION_PREFIX = 'engoplay-grammar-rebuilt-batch1-q';

  const levelFor = (estimate) => {
    const value = String(estimate || '').toUpperCase();
    if (value.includes('A1')) return 'A1';
    if (value.includes('A2')) return 'A2';
    if (value.includes('B1')) return 'B1';
    if (value.includes('B2')) return 'B2';
    return 'B1';
  };
  const cleanOption = (value) => String(value == null ? '' : value).replace(/^[A-D]\)\s*/i, '').trim();
  const flattenFormula = (value, prefix) => {
    prefix = prefix || '';
    if (Array.isArray(value)) return value.flatMap((item, index) => flattenFormula(item, prefix ? prefix + '[' + (index + 1) + ']' : String(index + 1)));
    if (value && typeof value === 'object') return Object.keys(value).reduce((out, key) => out.concat(flattenFormula(value[key], prefix ? prefix + ' · ' + key : key)), []);
    if (value == null || value === '') return [];
    return [(prefix ? prefix + ': ' : '') + String(value)];
  };

  const corrections = {
    151: { question: 'Which sentence correctly places a comma after an introductory phrase?', explanation: "An introductory phrase such as 'After finishing her homework' is followed by a comma before the main clause." },
    191: { question: "In standard backshifting after the past reporting verb 'said', choose the correct report of Ahmed's words: 'I live in Cairo.'", explanation: "The question explicitly tests the standard backshift pattern: Simple Present 'live' changes to Simple Past 'lived' after the past reporting verb 'said'." },
    193: { question: "Which sentence uses 'told' correctly with a personal object immediately after it?", explanation: "'Told' is followed directly by the person receiving the information: 'told me'. 'Said to me' is also grammatical, but it does not use the verb 'told'." },
    194: { question: "Sarah said to me, 'I will help you tomorrow.' Choose the correct reported statement.", explanation: "With a past reporting verb, 'will' normally backshifts to 'would'; 'you' changes to 'me' because Sarah spoke to the listener, and 'tomorrow' changes to 'the next day'." },
    199: { question: "The teacher is reporting a scientific fact that remains true: pure water boils at 100°C at standard atmospheric pressure. Which report correctly avoids backshifting?", explanation: "A scientific fact that remains true can stay in the Simple Present in reported speech. The stated boiling point assumes pure water at standard atmospheric pressure." },
    201: { question: "Which sentence represents a ZERO CONDITIONAL for a general fact about pure water at standard atmospheric pressure?", explanation: "The Zero Conditional uses the Simple Present in both clauses for a general truth. Pure water boils at about 100°C at standard atmospheric pressure." },
    206: { question: "Under the standard First and Second Conditional patterns taught here, which option mixes the two patterns incorrectly?", explanation: "The standard First Conditional pairs a present-tense if-clause with a will-result; the standard Second Conditional pairs a past-form if-clause with a would-result." },
    223: { explanation: "When a verb follows a preposition, use its -ing form: 'interested in studying'. A preposition can also be followed by a noun phrase or an object pronoun." },
    228: { question: "Choose the standard UNSPLIT negative to-infinitive in the pattern 'not + to + base verb': 'The doctor advised him ___ sugar.'", options: ['A) not eat to', 'B) not to eat', 'C) not eating', "D) don't to eat"], correct_answer: 'B) not to eat', explanation: "The standard unsplit negative to-infinitive is 'not to + base verb': 'not to eat'." },
    231: { question: 'It is still morning. Which sentence correctly emphasizes the COMPLETED RESULT and quantity?', explanation: "Present Perfect Simple ('has written') highlights the completed quantity of three letters; the context makes clear that 'this morning' is not a finished past period." },
    240: { question: "Choose the Present Perfect Simple form that reports a completed quantity: 'Someone ___ half of my chocolate cake.'", options: ['A) has eaten', 'B) has ate', 'C) have eaten', 'D) is eaten'], correct_answer: 'A) has eaten', explanation: "The Present Perfect Simple is 'has + past participle'. 'Someone' takes the singular auxiliary 'has', and 'eaten' is the past participle." },
    243: { question: 'Which option uses the PAST PERFECT CONTINUOUS form (had been + verb-ing) to emphasize duration before a past event?', explanation: "The Past Perfect Continuous form is 'had been + verb-ing'; it highlights how long the driving activity had continued before the car broke down." }
  };

  const arabicFixes = (text) => String(text || '')
    .replace('يقوم بالجمع بين الفعل والفاعل', 'تُستخدم كفاعل للجملة')
    .replace('اسمًا خبيرًا', 'اسمًا خبريًا')
    .replace('يُركس', 'يركّز')
    .replace('يُستخدم الكلا', 'يُستخدم كلا الزمنين');

  const buildLesson = (topic) => {
    const questions = Array.isArray(topic.practice_questions) ? topic.practice_questions : [];
    const first = questions[0];
    const firstOptions = Array.isArray(first && first.options) ? first.options : [];
    const answerIndex = firstOptions.indexOf(first && first.correct_answer);
    const distractor = firstOptions.find((option, index) => index !== answerIndex);
    const uses = Array.isArray(topic.when_and_how_to_use) ? topic.when_and_how_to_use : [];
    const sources = Array.isArray(topic.source_book_and_page) ? topic.source_book_and_page : [];
    const forms = topic.forms && typeof topic.forms === 'object' ? Object.keys(topic.forms).map((key) => key + ': ' + topic.forms[key]) : [];
    const examples = (Array.isArray(topic.examples) ? topic.examples : []).concat(forms.map((form) => 'Form — ' + form));
    const cefr = String(topic.cefr_level || '');
    return {
      id: TOPIC_PREFIX + topic.topic_id,
      level: levelFor(cefr),
      sourceCEFR: cefr,
      track: 'EngoPlay Grammar Library',
      title: String(topic.topic_name || ('Grammar topic ' + topic.topic_id)),
      titleAr: '',
      summary: String(topic.english_explanation || ''),
      formula: flattenFormula(topic.grammar_structure_and_formulas).join('\n'),
      uses: uses,
      examples: examples,
      mistake: (Array.isArray(topic.common_mistakes) ? topic.common_mistakes : []).join(' | '),
      tip: [
        'الشرح بالعربية: ' + arabicFixes(topic.arabic_explanation),
        uses.length ? 'When and how to use: ' + uses.join(' | ') : '',
        sources.length ? 'Source references: ' + sources.join(' | ') : '',
        'CEFR mapping is estimated: ' + cefr + '.'
      ].filter(Boolean).join('\n\n'),
      task: 'Review the explanation and examples, then complete the ten topic questions and write two original sentences.',
      quiz: [String(first && first.question || ''), answerIndex >= 0 ? cleanOption(firstOptions[answerIndex]) : '', distractor ? cleanOption(distractor) : ''],
      sourceTopicId: topic.topic_id,
      sourceReferences: sources,
      sourceOrigin: topic.reconstruction_status ? 'Rebuilt Batch 1 from Scholastic Success With Grammar Grade 5' : 'EngoPlay Grammar Batches 2–5',
      sourceReconstruction: Boolean(topic.reconstruction_status)
    };
  };

  const prepareQuestion = (question, topicId, cefr, reconstructed) => {
    const correction = reconstructed ? {} : (corrections[question.question_id] || {});
    const options = (correction.options || question.options || []).map(cleanOption);
    return {
      id: (reconstructed ? REBUILT_QUESTION_PREFIX : QUESTION_PREFIX) + question.question_id,
      topic: TOPIC_PREFIX + topicId,
      level: levelFor(cefr),
      prompt: correction.question || String(question.question || ''),
      options: options,
      answer: cleanOption(correction.correct_answer || question.correct_answer),
      explanation: correction.explanation || String(question.explanation || ''),
      sourceQuestionId: question.question_id,
      sourceTopicId: topicId,
      sourceCEFR: cefr,
      sourceBatchId: reconstructed ? 1 : Math.floor((Number(question.question_id) - 1) / 50) + 1,
      sourceOrigin: reconstructed
        ? 'Rebuilt Batch 1 — original NotebookLM export unavailable; source-based questions from Scholastic Success With Grammar Grade 5'
        : 'EngoPlay Grammar Batches 2–5',
      sourceReconstruction: Boolean(reconstructed)
    };
  };

  const load = async () => {
    const status = {
      status: 'loading',
      availableBatches: [1, 2, 3, 4, 5],
      missingBatches: [],
      missingQuestionIds: null,
      topicCount: 0,
      questionCount: 0,
      questionsAdded: 0,
      originalNotebookLMQuestionCount: 200,
      rebuiltQuestionCount: 50,
      originalNotebookLMBatch1Available: false,
      correctionsApplied: Object.keys(corrections).map(Number).sort((a, b) => a - b)
    };
    window.SERAG_GRAMMAR_BATCH_BANK_V1 = status;
    try {
      if (!Array.isArray(window.SERAG_GRAMMAR_V10) || !window.SERAG_SUPPLEMENT_V13 ||
          !Array.isArray(window.SERAG_SUPPLEMENT_V13.lessons) || !Array.isArray(window.SERAG_SUPPLEMENT_V13.questions)) {
        throw new Error('Existing grammar lesson/question collections are unavailable.');
      }
      const responses = await Promise.all([
        fetch(DATA_URL + '?v=66', { credentials: 'same-origin', cache: 'no-store' }),
        fetch(REBUILT_DATA_URL + '?v=66', { credentials: 'same-origin', cache: 'no-store' })
      ]);
      if (responses.some((response) => !response.ok)) {
        throw new Error('Grammar bank source request failed (' + responses.map((response) => response.status).join(', ') + ').');
      }
      const sourceBatchTopics = await responses[0].json();
      const rebuiltBatchTopics = await responses[1].json();
      if (!Array.isArray(sourceBatchTopics) || sourceBatchTopics.length !== 20) {
        throw new Error('Original grammar export must contain exactly 20 topics from Batches 2–5.');
      }
      if (!Array.isArray(rebuiltBatchTopics) || rebuiltBatchTopics.length !== 5) {
        throw new Error('Rebuilt Batch 1 must contain exactly five source-based topics.');
      }
      if (!rebuiltBatchTopics.every((topic) => topic && topic.reconstruction_status && Array.isArray(topic.practice_questions))) {
        throw new Error('Rebuilt Batch 1 must remain explicitly labeled as reconstructed source content.');
      }
      const topics = rebuiltBatchTopics.concat(sourceBatchTopics);

      const seenTopicIds = new Set();
      const seenQuestionIds = new Set();
      const existingQuestionIds = new Set(window.SERAG_SUPPLEMENT_V13.questions.map((q) => String((q && q.id) || '')));
      const topicRows = [];
      const questionRows = [];
      let totalQuestions = 0;

      for (const topic of topics) {
        const topicId = Number(topic && topic.topic_id);
        if (!Number.isInteger(topicId) || topicId < 1 || topicId > 25) throw new Error('Unexpected grammar topic ID in imported bank.');
        if ((topicId <= 5) !== Boolean(topic.reconstruction_status)) throw new Error('Rebuilt/source topic provenance does not match topic ID ' + topicId + '.');
        if (seenTopicIds.has(topicId)) throw new Error('Duplicate grammar topic ID ' + topicId + '.');
        seenTopicIds.add(topicId);
        topicRows.push(buildLesson(topic));
        for (const rawQuestion of topic.practice_questions || []) {
          const id = Number(rawQuestion && rawQuestion.question_id);
          const reconstructed = topicId <= 5;
          if (!Number.isInteger(id) || (reconstructed ? id < 1 || id > 50 : id < 51 || id > 250)) {
            throw new Error('Unexpected grammar question ID in imported bank.');
          }
          if (seenQuestionIds.has(id)) throw new Error('Duplicate grammar question ID ' + id + '.');
          seenQuestionIds.add(id);
          totalQuestions += 1;
          const prepared = prepareQuestion(rawQuestion, topicId, topic.cefr_level, reconstructed);
          if (!prepared.prompt.trim() || prepared.options.length !== 4 || new Set(prepared.options).size !== 4 ||
              !prepared.options.includes(prepared.answer) || !prepared.explanation.trim()) {
            throw new Error('Invalid imported grammar question Q' + id + '.');
          }
          if (!existingQuestionIds.has(prepared.id)) questionRows.push(prepared);
        }
      }

      if (totalQuestions !== 250 || seenQuestionIds.size !== 250) throw new Error('Combined grammar bank must contain 250 unique questions.');
      for (let id = 1; id <= 250; id += 1) {
        if (!seenQuestionIds.has(id)) throw new Error('Missing question Q' + id + ' in combined grammar bank.');
      }

      const existingLessonIds = new Set(window.SERAG_GRAMMAR_V10.map((lesson) => lesson && lesson.id));
      const newLessons = topicRows.filter((lesson) => !existingLessonIds.has(lesson.id));
      window.SERAG_GRAMMAR_V10.push.apply(window.SERAG_GRAMMAR_V10, newLessons);
      const existingSupplementLessonIds = new Set(window.SERAG_SUPPLEMENT_V13.lessons.map((lesson) => lesson && lesson.id));
      const missingSupplementLessons = topicRows.filter((lesson) => !existingSupplementLessonIds.has(lesson.id));
      window.SERAG_SUPPLEMENT_V13.lessons.push.apply(window.SERAG_SUPPLEMENT_V13.lessons, missingSupplementLessons);
      window.SERAG_SUPPLEMENT_V13.questions.push.apply(window.SERAG_SUPPLEMENT_V13.questions, questionRows);

      status.status = 'ready';
      status.topicCount = topicRows.length;
      status.questionsAdded = questionRows.length;
      status.questionCount = 250;
      status.availableQuestionIds = { from: 1, to: 250 };
      status.missingQuestionIds = null;
      status.originalNotebookLMQuestionCount = 200;
      status.rebuiltQuestionCount = 50;
      status.originalNotebookLMBatch1Available = false;
      status.batch1Note = 'Q1–Q50 are a labeled reconstruction based on Scholastic Success With Grammar Grade 5 printed pages 5–19; they are not the missing original NotebookLM Batch 1.';
      status.levelMapping = 'CEFR labels are editorial estimates; the original source estimate is retained on each question and topic.';
      return status;
    } catch (error) {
      status.status = 'unavailable';
      status.error = String((error && error.message) || error);
      console.warn('EngoPlay grammar batch bank was not loaded:', error);
      return status;
    }
  };

  window.SERAG_GRAMMAR_BATCH_BANK_V1_READY = load();
})();
