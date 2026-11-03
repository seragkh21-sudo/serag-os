# EngoPlay Grammar Bank — Original Batches 2–5 + Rebuilt Batch 1

## Status

The grammar bank is connected to the existing Serag English / EngoPlay academy question engine. It is a static, read-only content import; it does not write to Supabase or alter saved learner attempts.

## Actual source coverage

The uploaded NotebookLM export contains 20 topics (Topic IDs 6–25) and 200 questions (Q51–Q250), with 10 questions per topic. The original export remains stored unchanged as \`engoplay-grammar-batches-2-5.json\`.

The original NotebookLM Batch 1 export (Topics 1–5 / Q1–Q50) was not present in the uploaded files. It has therefore **not** been presented as recovered original content.

## Rebuilt replacement Batch 1

A separate source-based replacement is stored as \`engoplay-grammar-rebuilt-batch-1.json\`. It contains 5 topics and 50 newly authored questions, aligned with the opening five grammar topics listed in the uploaded *Scholastic Success With Grammar — Grade 5* book:

1. Types of Sentences — printed pages 5–7.
2. Complete and Simple Subjects — printed pages 8–10.
3. Complete and Simple Predicates — printed pages 11–13.
4. Compound Subjects and Predicates — printed pages 14–16.
5. Compound Sentences — printed pages 17–19.

Question wording and examples are newly written from the skills and explanations in those source sections; the workbook exercises are not copied. The CEFR labels on these five lessons are editorial estimates because the book does not publish CEFR mappings. Every rebuilt topic and question carries reconstruction provenance metadata so it cannot be confused with original NotebookLM content.

## Current combined coverage

- 25 grammar topics in the current academy bank.
- 250 practice questions in the combined bank: 50 rebuilt replacement questions + 200 original NotebookLM questions.
- The existing Q51–Q250 IDs are unchanged.
- Rebuilt Q1–Q50 use a separate namespaced ID prefix: \`engoplay-grammar-rebuilt-batch1-qN\`.
- Original Q51–Q250 continue to use \`engoplay-grammar-batch-qN\`.

## Integration mapping

The academy consumes question records shaped as:

{ id, topic, level, prompt, options, answer, explanation }

The adapter maps source question IDs to stable namespaced IDs, topic IDs to namespaced lesson keys, CEFR estimates to the app filter level, option labels A–D to clean option text, and explanations to the normal question record. The original export is kept unchanged. The rebuilt questions carry \`sourceReconstruction: true\` and a distinct \`sourceOrigin\`.

## Quality and answer handling

- Imported MCQ answers use exact option matching. This was necessary because normalising away punctuation caused distinct punctuation options to collapse to the same value.
- The current integration test covers a wrong punctuation choice followed by a correct answer, confirms both attempts are recorded, and confirms the original mistake remains flagged for spaced review.
- The original Batches 2–5 import keeps its narrowly scoped clarity updates at Q151, Q191, Q193, Q194, Q199, Q201, Q206, Q223, Q228, Q231, Q240 and Q243.

## Safety and learner progress

- Question and lesson IDs are namespaced to avoid collisions with existing question/review keys.
- The importer validates both source files before appending and is idempotent.
- Existing answer history, review cards, local drafts, vocabulary data and learner progress are not reset or migrated.
- No new Cards section, paid API, Supabase migration or production database write is introduced.
- Both JSON assets are fetched same-origin with \`no-store\` and are not added to the service-worker cache.

## CEFR handling

The source CEFR labels on Batches 2–5 are estimates, not certified results. The CEFR level for the rebuilt Batch 1 is also an editorial estimate and is explicitly marked as such.

## Validation

Focused test command: \`node --test tests/engoplay-grammar-batch-bank-v1.test.js\`

The tests cover original source preservation, rebuilt topic/question ranges, unique IDs, answer-option integrity, documented clarifications, mixed-practice routing, wrong-then-correct progress recording, idempotency and fail-closed behavior when a static asset is unavailable. Full repository tests and Vercel Preview checks run on the PR using the project Node 24 workflow.

## Remaining limitation

The actual original NotebookLM Batch 1 is still not recovered. The current site reaches 250 questions by adding a clearly identified source-based replacement for Q1–Q50; the app and data retain that distinction in metadata and documentation.
