# EngoPlay Grammar Bank — Batches 2–5

## Status

This change adds the available grammar content to the existing Serag English / EngoPlay academy question engine. It is a static, read-only content import; it does not write to Supabase or alter saved learner attempts.

## Actual source coverage

The uploaded NotebookLM export contains 20 topics (Topic IDs 6–25) and 200 questions (Q51–Q250), with 10 questions per topic. Available batches are 2, 3, 4 and 5. Batch 1 (Topics 1–5 / Q1–Q50) is missing and is not fabricated.

The original export is stored as engoplay-grammar-batches-2-5.json without editing its source records.

## Integration mapping

The current academy engine consumes question records shaped as:

{ id, topic, level, prompt, options, answer, explanation }

The import adapter maps question_id to a stable namespaced question id, topic_id to a namespaced lesson key, cefr_level to the app filter level, question to prompt, options to option wording without A–D labels, correct_answer to the matching cleaned answer, and explanation unchanged except for explicitly documented clarity corrections.

Each original topic is added to the existing grammar lesson collection with its English explanation, Arabic explanation, formulas, examples, forms, common mistakes, usage notes and source references.

## CEFR handling

Source CEFR labels are estimated, not certified. Range labels are mapped to the lower level for the app filter (A1–A2 → A1; A2–B1 → A2; B1–B2 → B1) while the original estimate is retained in sourceCEFR.

## Import-time quality clarifications

The raw JSON remains unchanged. The adapter applies narrowly scoped clarity updates to Q151, Q191, Q193, Q194, Q199, Q201, Q206, Q223, Q228, Q231, Q240 and Q243. It also applies minor Arabic typographical corrections in the imported lesson presentation only. These are targeted clarity fixes, not a claim that every question has undergone external textbook-level verification.

## Safety and learner progress

- Question and lesson IDs are namespaced to avoid collisions with existing question/review keys.
- The importer is idempotent and validates the full source before appending.
- Existing answer history, review cards, local drafts, vocabulary data and learner progress are not reset or migrated.
- No new Cards section, framework, paid API, Supabase migration or production database write is introduced.
- The static JSON asset is fetched same-origin with no-store and is not added to the service-worker cache.

## Validation

Focused test command: node --test tests/engoplay-grammar-batch-bank-v1.test.js

The test covers source counts/ID ranges, import shape, unique IDs, answer-option integrity, documented clarifications, idempotency and fail-closed behavior if the static asset is unavailable. Full repository tests and Vercel preview checks must still run on the PR using the project Node 24 workflow.

## Remaining content gap

Batch 1 (Topics 1–5 / Q1–Q50) remains missing. The current import contains 200 questions, not 250. Batch 1 can be appended later as a separately validated batch without changing the existing namespaced IDs.
