# Notebook batch-008 publication review

## Scope and provenance

Add four past-continuous/viewpoint lessons, sixteen questions q113–q128 and a separate incident-report draft. The shared English/EngoPlay Foundations payload now has 32 lesson sessions, 128 questions and eight writing tasks. Preserve the prior question IDs/content and all seven previous owner-scoped browser draft keys. No API/schema/migration, new service, dependency or credential is required.

The uploaded fenced JSON is archived semantically as `original.json`; the review SHA-256 covers the uploaded text bytes, including original formatting. `reviewed.json` is the corrected derivative. Source page fields remain null and explicitly unverified. Empty unreadable-page arrays do not establish PDF access, full-book readability or independent source/authorship verification.

## Editorial corrections

- Qualified -ing spelling: many silent-e endings drop e, but see/seeing retains its vowel letters; final ie changes to y. Consonant doubling has short-vowel/one-syllable conditions, w/x/y exceptions and longer-word stress/variety limits. You takes were for one or several addressees. A clock time alone does not mandate continuous aspect.
- Removed the claim that Yes, I was working is an error. It is a grammatical full answer, distinct from the requested auxiliary-only short answer. Q115 explicitly addresses one person. Q114 uses technicians rather than the collective operations team, avoiding an unnecessary dialect/collective-agreement issue; accepted MCQ answers now all appear in its choices.
- Distinguished background-in-progress and whole-event viewpoints without asserting that simple events must be short or halt a background activity. Both-simple or both-continuous pairings can be grammatical. Q116 requests the particular forms rather than condemning all alternative viewpoints.
- Q117 explicitly requests continuous forms in both clauses. Its emphatic did present/did take distractor can be grammatical, but does not satisfy that request. While does not automatically require continuous, and when does not automatically require simple. Both remain accepted for q121.
- Added an appropriate past reference point to q119 and kept both contraction forms. Q120 explicitly requests the past simple of occur; the lesson supplies occurred and its final-stress doubling, plus ring/rang and shut/shut for other tasks.
- Q124 is a controlled rewrite of a grammatical ongoing-shutdown sentence into whole-event past simple, rather than a false grammar correction. Other written corrections specify the named feature and preserve alternatives where appropriate.
- Added atomic, unsolved tokens for q126–q128 and retained both allowed clause orders, with conventional model commas. The clock expression 3:00 is one time token; the browser harness normalizes the same punctuation on both model and tile when locating tiles. No app grading change was needed for that harness correction.
- The supplied report had 57 whitespace-separated words, below its 60-word minimum. The revised model has 61 words, explicitly includes two overlapping background activities, a whole-event occurrence and a negative continuous. The rubric accepts contracted and uncontracted negatives and is not an automatic writing-quality score. Perfect tenses remain deferred.

## Duplicate comparison

No exact normalized prompt/answer matches were found against 1,282 inspected public-bank items plus 112 previous Foundations questions (1,394 total). One Jaccard candidate at threshold 0.55 shares generic ordering instructions but has a distinct target and viewpoint; its disposition is in `validation.json`. Private imports and semantic equivalence are outside this result. Overlapping grammar topics are expected practice, not proof of new skills.

## Verification and release

259 Node tests pass. Checks cover aggregate/batch equality, unchanged prior content, format counts, MCQ choice/answer integrity, when/while and negative alternatives, model length and valid unsolved tile multisets. The 393px fixture completes all 128 questions through the four actual UI formats, including when for q121, expanded negatives for q119/q123 and fronted alternative orders for q126–q128. It verifies shared history, immediate-repeat exclusion, reveal without XP, preservation of seven existing drafts, eighth-draft persistence after reload and empty drafts for all eight tasks under a different owner. Expected fixture onboarding is handled through its UI. No page errors or overflow were observed. These are fixture checks, not real-account cross-device tests.

Build 105 aligns entry points, loader, SW and preview. Release requires passing CI/preview checks, matching production READY/commit and coherent 128-question payload checks, then repeats the fixture on published assets.
