# Notebook batch-001 review — 22 November 2026

Input: user-supplied JSON pasted text. The original data is retained under `data/review/curriculum/batch-001/original.json`; editorial corrections are in `reviewed.json`, and structural/comparison evidence is in `validation.json`. The source-byte SHA-256 is retained in review metadata. This review does not claim access to the listed original PDFs or an independent Goldfish review.

## Result

- Four developed lessons and 16 questions: five multiple-choice, four fill-in, four written corrections, three word-order tasks; one writing task.
- Units u2–u4 are deliberate outlines, not completed units.
- No exact normalized prompt/answer duplicates were found against the inspected public bank snapshot from `e9931211ee63cbcc4307376abe56a35f43680049`. Private user imports and semantic duplicates were not covered by that exact-match result. Existing topics substantially overlap; new wording is not a new skill.
- The current site importer supports the five MCQs. The other eleven formats require a curriculum adapter that preserves typed retrieval/correction and ordering; they must not be turned into MCQs merely to pass its schema.
- This batch is staged on the curriculum draft branch and is not published or presented as a completed course.

## Editorial corrections

1. Lesson 1.1 incorrectly implied that all complete English sentences require an object, and conflated subjects with agents. Added SV/SVO/SVC patterns and simple versus complete subject explanations. Removed the blanket rejection of object fronting.
2. Lesson 1.3 had an Arabic wording error and lacked an explicit consonant+y → ies explanation for q06.
3. Lesson 1.4 now treats stative/progressive choices as meaning-dependent tendencies rather than universal bans; examples contrast an opinion and thinking as an activity.
4. q03 introduced neither/nor proximity agreement in a basic third-person lesson. Replaced it with an ordinary singular habitual statement while retaining q03's external ID.
5. q04 now explicitly asks for the Present Simple form instead of claiming all progressive uses of understand are impossible.
6. q05 and q07 accepted detached contractions that do not fit the spaced blanks. Removed those alternatives.
7. q07 treated collective team as necessarily singular. Used researcher to eliminate a valid British-English plural alternative.
8. All MCQs are labelled recognition; written corrections are controlled application. A choice-based success must not establish independent production.
9. q13–q15 now have explicit tokens. Each accepted answer has the same word multiset as its tokens. q14's unavailable contraction and malformed token grouping were removed.
10. The writing model is a simpler 51-word paragraph. The task uses a review rubric, not an automatic writing-quality score.

External IDs are retained. Canonical question IDs include collection and batch namespaces to prevent collisions if later files restart at q01.

## Source verification

All supplied page citations remain **unverified** because only generated JSON, not the original books, was provided. Claimed citations are preserved as `reported_source_refs`. Active `source_refs` retain source identity but have null page fields and an explicit unverified status. Questions remain `needs_review: true` for provenance; editorial language review is recorded separately.

The empty `unreadable_pages` arrays do not prove that a whole book was read. Understanding Semantics is listed among sources but is not cited by this batch. No source coverage or printed/PDF page equivalence is inferred.

Review references for the specific grammar issues:

- [Cambridge: fronting](https://dictionary.cambridge.org/grammar/british-grammar/fronting) — ordinary word order versus marked fronting; indexed excerpt consulted, direct page fetch returned 403.
- [British Council: group nouns](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/group-nouns) — singular and plural agreement depending on meaning.

## Course placement

The supplied unit is broad enough for four separate lesson sessions. Existing draft mappings are: u1-l1 → unit-01 (sentence foundations), u1-l2 → unit-02 (identity/be), u1-l3 → unit-04 (routines/questions), u1-l4 → unit-05 (now/states). This is a placement proposal, not a change to the live learning path or historical question IDs.

Validation checks: JSON parsing, stable/unique IDs, unit/lesson reference integrity, MCQ answer membership and distinct choices, accepted-answer token multisets, writing-model length, unverified-page handling, and exact-match comparison to the inspected public bank. No application code or database records were changed; no full runtime suite was needed for this data-only review.
