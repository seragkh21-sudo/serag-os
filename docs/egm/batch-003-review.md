# Notebook batch-003 publication review

## Scope

Publish the owner's supplied third batch as four additional Foundations lessons, sixteen questions and one 60–90-word email task. Both English and EngoPlay consume the same generated course payload: twelve lessons, 48 questions and three writing tasks. The earlier two batches' question IDs and content remain unchanged; each owner/batch/task keeps its existing browser-local writing key. No migration, paid service, model call or new credential is required.

`data/review/curriculum/batch-003/reviewed.json` is an editorial adaptation, not a verbatim copy of the supplied inline message. `curriculum-data/batch-003.json` publishes that version; `scripts/build-notebook-course.mjs` adds it to `course-v1.json`. The source PDFs were not available for independent review. Active page fields are null and explicitly unverified; the supplied page claims are retained as `reported_source_refs`. Empty unreadable-page arrays do not establish readability or full-book coverage. The fifth named source (Scholastic Grade 3) is not cited by the supplied lessons or questions.

## Editorial corrections

- Added the missing singular second-person reflexive *yourself* and distinguished it from plural *yourselves*.
- Framed compound pronoun case as ordinary formal written usage, rather than declaring all other speech varieties invalid. Reflexive and intensive patterns have uses beyond this basic lesson; *myself* is not a general substitute for *me*.
- Replaced the collective-team reflexive example with plural *engineers* to avoid an unnecessary collective-agreement issue. Explained *by ourselves* as either alone or without outside help, depending on context.
- Treated *theirselves* as dialectal and outside the target formal standard rather than universally grammatically invalid. Narrowed q33/q37 to the requested ordinary object pronoun, q34 to standard intensive emphasis, and corrections to the named feature.
- Clarified that possessive determiners introduce a noun phrase, which can include intervening adjectives. Fixed the Arabic typo and explained both *it's ready* and *it's been checked*. Added explicit context to q35 so the intended possessive reference is clear.
- Distinguished shared/separate ownership and plural versus singular owner apostrophes; singular names ending in s are outside this batch's style scope.
- Added atomic, unsolved word tiles for q46–q48. The supplied q47 had only one *the* although the model requires two; the corrected tile array includes both. Both supplied q46 object orders remain accepted. Prompts constrain phrase placement so the answer set does not imply that all other English orders are ungrammatical.
- Retained raw q33–q48 IDs with batch-scoped canonical history IDs. MCQs are recognition; written forms/corrections are controlled application. The email task remains a rubric, not an automatic writing-quality grade.

## Verification

Exact normalized prompt/answer comparison against 1,282 current public-bank items plus 32 previously published Foundations items found no exact duplicates. Jaccard token similarity at 0.55 produced no candidates. This is not a claim of semantic uniqueness or comparison with private imports; the same grammar skills appear elsewhere. Evidence is in the batch's `validation.json`.

259 Node tests pass. Course checks cover aggregate/batch equality, stable prior content, all four format counts, missing/reordered word tiles, duplicate lessons and apostrophe normalization without equating *its* with *it's*. At 393px, the browser fixture answered all 48 questions through the four actual UI formats, accepted a curly apostrophe for q41, confirmed shared history and immediate-repeat exclusion, and verified reveal without XP. It preserved existing batch-one and batch-two drafts, kept the third draft separate across reload, and rejected cross-owner draft exposure. No page errors or overflow were observed. This is fixture evidence rather than a real-account cross-device test.
