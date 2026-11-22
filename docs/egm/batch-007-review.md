# Notebook batch-007 publication review

## Scope and provenance

Add four past-simple lessons, sixteen questions q97–q112 and a separate 60–90-word summary-email task. The shared English/EngoPlay Foundations payload now has 28 lesson sessions, 112 questions and seven writing tasks. Earlier IDs/content and all six existing owner-scoped browser draft keys are unchanged. No API, schema, migration, model service, dependency or credential change is needed.

The uploaded fenced JSON is preserved semantically in `original.json`; `reviewed.json` contains editorial changes. The SHA-256 in review metadata is for the uploaded text bytes including its original formatting, not the reformatted archive. Source page fields were null; active refs remain null and explicitly unverified. Empty unreadable-page arrays do not prove PDF access/readability or full-book review. Source provenance is separate from editorial language review.

## Editorial corrections

- Explained that you takes were for one addressee as well as several. Scoped did/be guidance to ordinary basic past questions and negatives, rather than claiming a universal ban over all English constructions or varieties.
- Corrected the malformed example She management planned. Qualified final-consonant doubling with the one-syllable short-vowel pattern, w/x/y exceptions and longer-verb stress/variety limits. Distinguished study/studied from play/played. Planed is a valid form of plane, but not the past of plan.
- Q98 now asks specifically for the past of plan. Q99's duplicated buyed choice is replaced; all four choices are distinct and refer to buy. Added meet/met and leave/left to the irregular coverage used by the questions/model.
- Explained that ordinary did questions use a base verb, but subject questions such as Who called? are a different pattern outside these drills. No past continuous or perfect-tense structures are introduced.
- Added last spring to q103 for an explicitly finished past interval. Q105 originally allowed finishing yesterday but submitting today; submission time alone cannot establish a negative. The revised context states the report was unfinished last night and finished this morning. Both didn't and did not are accepted.
- Narrowed written corrections to the named feature while retaining contracted/uncontracted q108 alternatives. MCQs are recognition; typed forms/rewrites and ordering are controlled application.
- Added atomic unsolved tokens to q110–q112. Q111 was missing a second the, and its regular verb signed was incorrectly assigned to the irregular lesson; it now belongs to regular verbs. Both yesterday-first and yesterday-last orders remain accepted for q110/q111. Q112 explicitly requests a did-you yes/no question with yesterday last.
- The original writing model had wrote plus was: both are irregular, but the separate be/irregular requirements were ambiguous about whether be counted. It also added an undeveloped future form. The revised 67-word past summary includes wrote, made and left, regular verbs, was and a didn't negative. The rubric explicitly asks for two lexical irregulars besides was/were; no automatic quality score is claimed.

## Duplicate comparison

No exact normalized prompt/answer matches were found against 1,282 inspected public-bank questions plus 96 prior Foundations questions (1,378 total). One Jaccard candidate at threshold 0.55 shares question-order instructions but has a different target sentence and construction; its disposition is recorded in `validation.json`. Private imports and semantic equivalence are outside this result, and grammar-topic overlap is expected.

## Verification and release

259 Node tests pass. Checks cover aggregate/batch equality, stable previous content, four format counts, distinct MCQ choices, contraction alternatives, correct q111 lesson assignment and rejection of its missing tile. The 393px fixture browser completes all 112 questions through the actual four UI formats, including did not for q105, expanded q108, and both new yesterday-first order alternatives. It verifies shared history, immediate-repeat exclusion, reveal without XP, preservation of six existing drafts, seventh-draft persistence after reload, and empty drafts for all seven tasks under a different owner. Expected fixture onboarding is handled through its UI. No page errors or overflow were observed. These are fixture checks, not real-account cross-device verification.

Build 104 aligns boot assets, service worker and preview. Release proceeds through passing CI/preview checks, production READY/commit and coherent 112-question payload checks, then repeats the fixture against published assets.
