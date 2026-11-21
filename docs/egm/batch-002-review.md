# Notebook batch-002 publication review

## Scope and source limits

The owner supplied inline JSON for four lessons, sixteen questions and one writing memo. `data/review/curriculum/batch-002/reviewed.json` is an editorial adaptation, not a verbatim archive of that message. `curriculum-data/batch-002.json` publishes that adaptation; `scripts/build-notebook-course.mjs` combines both published batches into the single shared `curriculum-data/course-v1.json` consumed by English and EngoPlay. Unit labels u4/u5 follow the supplied draft map; they do not imply that all earlier draft units are complete or locked prerequisites.

Original PDF bytes were not available. All claimed page references are retained as `reported_source_refs`; active references carry null pages and `unverified` status. Empty `unreadable_pages` arrays do not prove full-book access or readability. The fifth listed book is not cited by this batch. Language review does not independently establish the generator's claimed original authorship or source coverage.

## Editorial decisions

- Corrected the Arabic zero-article explanation, which accidentally prohibited the intended omission of an article.
- Removed the claim that any modifying phrase automatically requires *the*. Replaced the ambiguous engineers example with separate identifiable and generic examples. The Ø symbol stays in exercise instructions rather than ordinary model sentences.
- Qualified absolute claims about uncountable nouns and *a water*: countability can depend on meaning, and serving uses are possible. Added much/many to lesson 4.2 so q23 is taught before assessment.
- Added criterion/criteria explicitly to lesson 4.1 before q22. Avoided a universal Greek -is rule and simplified adult examples without claiming a CEFR level.
- Specified the pronunciation of HR in q20 because H letter names vary between speakers. The learning point remains article choice by sound.
- Simplified q24 to *a European company* to avoid the distracting abstract-consensus context. Kept q17–q32 stable external IDs, with batch-scoped canonical question IDs.
- All MCQs are recognition; written corrections and forms are controlled application, separate from free writing and delayed vocabulary recall.
- Added atomic `tokens` for q30–q32. Replaced affirmative *much important information* with the more natural *some important information*. Restricted word-order prompts to the reviewed construction. Removed q32's passive alternative, which introduced *is caused by* that cannot be made from the tiles.
- Kept correction prompts narrow (change only the named feature) and accepted *some advice* for q27. Grading is a reviewed answer set, not an unrestricted grammar judge.
- Preserved the 60–90-word memo with a rubric and no automatic writing-quality score. Each batch/task has its own owner-scoped browser draft; the old `batch-001:wt1` key is unchanged.

## History and duplicate behavior

Batch-001 question IDs, prompts and answers are unchanged. All 32 questions use the same selection and owner-scoped EngoPlay history path; normal sessions exclude recent items, and deliberate review is explicit. First wrong attempts remain wrong when a learner revises in the same session; revealing a model earns no XP.

Exact normalized prompt/answer comparison against 1,282 current public-bank items plus 16 batch-001 items found no exact duplicates. Token-similarity screening at Jaccard 0.55 found no candidates. This does not establish semantic uniqueness: both banks teach overlapping rules, including HR article choice. Private imports were not inspected. Evidence is in `data/review/curriculum/batch-002/validation.json`.

## Verification

259 Node tests pass, including immutable batch-one history identifiers, all four format counts, invalid word-order answer rejection and duplicate lesson rejection. At 393px, the fixture browser answered all 32 questions through the four actual UI formats, verified shared history, immediate-repeat exclusion, reveal without XP, preservation of an old batch-one writing draft, separate batch-two writing across reload, owner isolation, and no overflow or page errors. These are fixture tests, not a real-account cross-device verification. No new database migration, model service, paid dependency or API key is needed.
