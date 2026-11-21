# Source-grounded curriculum draft

**Status: draft; not activated or published as a finished course.** Listening/speaking work is deferred at the owner’s request.

## Verified source access

- The local Library and downloads directories contain no original PDFs.
- The live site has one saved PDF, Collins English for Exams: Writing for IELTS; its private-file metadata is available, not its document bytes. No private storage key or token was read.
- The PDF-library reminder catalog is not evidence that all listed books were uploaded.
- `english-content-review-v13.md` records a previous contents/syllabus and representative-page review; it does not establish a fresh full-book review.
- Collins COBUILD Intermediate Grammar and Compact Advanced Workbook are referenced by existing source-derived lessons, but their originals are not available in this session.

## Public bank snapshot

The local production-order content snapshot loaded 109 lessons and 1282 question IDs. Normalized prompt/answer comparison yielded 1282 distinct pairs. This excludes private user imports and the separate vocabulary journey. These are structural counts, not verified pedagogical-quality claims. The inspected input file list and candidate IDs are retained in `data/review/curriculum/plan-v1.json`.

## Proposed sequence

| Unit | Goal | Candidate pool | New candidates after earlier units |
|---|---|---:|---:|
| 1. Sentence foundations | Build complete sentences and distinguish statements, questions and commands. | 52 | 52 |
| 2. Identity and reference | Use be, pronouns and possessives to introduce people and refer to things clearly. | 45 | 45 |
| 3. Nouns and quantity | Choose articles, number and quantity expressions from the intended meaning. | 33 | 33 |
| 4. Routines and questions | Describe routines and form direct questions with the correct auxiliary. | 25 | 25 |
| 5. Now, usually and states | Distinguish ongoing activity from routines and states. | 46 | 46 |
| 6. Descriptions and comparisons | Select adjective/adverb forms and compare alternatives accurately. | 41 | 41 |
| 7. Time, place and instructions | Explain where and when something happens and give practical instructions. | 62 | 62 |
| 8. Past events and habits | Tell a short past narrative and separate events, background and former habits. | 24 | 24 |
| 9. Experience, results and duration | Distinguish experience/current results from duration and ongoing activity. | 46 | 46 |
| 10. Order of past events | Make the timeline and earlier causes clear without overusing perfect forms. | 29 | 29 |
| 11. Plans and future reference | Choose forms for decisions, intentions, arrangements and completion before a future point. | 18 | 18 |
| 12. Ability, obligation and requests | Express ability, obligation, permission and polite requests with appropriate force. | 41 | 41 |
| 13. Verb patterns and common combinations | Use verb complements and common word combinations in meaningful sentences. | 31 | 31 |
| 14. Active and passive focus | Choose focus and preserve tense when changing voice. | 26 | 26 |
| 15. Precise noun descriptions | Use relative clauses to identify and add information without ambiguity. | 26 | 26 |
| 16. Connecting clauses | Express addition, cause, contrast, result and purpose without fragments or run-ons. | 33 | 33 |
| 17. Reporting information | Report statements and adjust tense/reference only when the context requires it. | 26 | 26 |
| 18. Real and imagined conditions | Distinguish general truths, likely outcomes and imagined situations. | 19 | 19 |
| 19. Past alternatives and precise conditions | Express regret, mixed time references and conditional restrictions precisely. | 48 | 48 |
| 20. Inference and formal recommendations | Express evidence-based inference, uncertainty and formal recommendations. | 49 | 49 |
| 21. Emphasis and register | Choose emphasis and advanced structures only where their meaning and register fit. | 45 | 45 |
| 22. Meaning, collocation and word formation | Infer word class, use collocations and paraphrase without changing meaning or certainty. | 26 | 26 |
| 23. Paragraphs and editing | Improve organisation, reference, punctuation and concision without creating ambiguity. | 71 | 62 |
| 24. Integrated reading and writing | Read for meaning, select relevant evidence and produce a clear written response. | 11 | 5 |

A candidate question count is not an approved lesson size. Broad bank topics contain mixed difficulty and must be curated at the item level. No questions were copied or activated by this document.

## A lesson must do more than present questions

Each lesson needs an objective, concise explanation, worked example, controlled practice, independent retrieval/correction, reading/written application and a later review. A unit checkpoint must use distinct reviewed items, not clones or repeat clicks. Written work needs explicit rubrics; current expression-presence checks cannot grade writing quality. Existing XP/history stay intact.

## Sources checked in this session

- Existing source-derived lesson code and the prior review documents, with their stated limits.
- British Council: https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/reported-speech-statements — reported-speech/reference guidance.
- Cambridge English Grammar Today: https://dictionary.cambridge.org/grammar/british-grammar/articles — article meaning and sound-based a/an selection.
- IELTS official writing format: https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing — exam-track requirements, not a substitute for reading the book.

The old British Council grammar index URL redirected to an individual lesson, so it was not treated as a reviewed complete curriculum. Websites used as dictionaries, corpora or runtime audio services are supporting resources, not automatically a sequenced teaching syllabus.

## Required before a dependable-course release

1. Obtain readable copies of the supplied PDFs and the complete source-link list from the prior chat.
2. Record file/version/page coverage and reconcile topics across sources.
3. Review each objective, explanation and candidate item; exclude ambiguous keys, missing context and overlapping aliases.
4. Author missing retrieval, reading and writing tasks in original wording, and provide answer/rubric guidance.
5. Connect the curated sequence to the app, preserve progress and test the whole learning flow.

No site runtime, database schema, learning history or content publication was changed by this planning branch.


## Concrete issues found before curriculum activation

- The `questions` category contains unrelated items: `review:1` tests articles and `review:19` tests demonstratives. The plan excludes ambiguous generic-topic candidates until item-level recategorization, rather than treating their tag as proof of question-form coverage.
- The normal daily route filters B1–C2, while many foundation lessons carry A1/A2 tags. A course needs a separate, explicit foundation route; relabelling foundations as B1 would not solve the learning sequence.
- Candidate pools overlap between later revision units and earlier units. The plan lists overlaps separately and reports new candidates rather than counting them as new exercises twice. A unit with fewer than ten fresh candidates is marked as a checkpoint gap.
- Current writing-expression checks cannot grade coherence or meaning. Completing such a check must not certify a writing objective.
